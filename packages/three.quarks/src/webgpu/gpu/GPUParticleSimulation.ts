/* eslint-disable @typescript-eslint/no-explicit-any */
import {Matrix4, Quaternion, Vector3, Vector4} from 'three';
import {StorageBufferAttribute} from 'three/webgpu';
import * as TSL from 'three/tsl';
import {ConstantValue, IntervalValue, PiecewiseBezier, RenderMode} from 'three.quarks';
import type {ParticleSimulationDelegate, ParticleSystem, StretchedBillBoardSettings} from 'three.quarks';
import type {ParticleFields} from '../ParticleNodes';
import {GPUCompileContext} from './GPUCompileContext';
import {getGPUBehaviorCompiler, GPUParticleState} from './GPUBehaviors';
import {quatMul} from './GPUGenerators';
import {createGPUParticleLayout, GPU_SEED_RANGE, GPU_SLOT, GPUParticleLayout, writeSpawnRecord} from './GPUParticleLayout';
import {GPUSlotAllocator} from './GPUSlotAllocator';

// untyped TSL: the generated graphs mix node types the typings cannot follow
const {Fn, If, instanceIndex, select, storage, uniform, vec3, vec4, vertexStage} = TSL as any;

type N = any;

/**
 * Collects the compute work of the GPU simulated systems and dispatches it (implemented by `WebGPUBatchedRenderer`).
 */
export interface GPUSimulationHost {
    /** a simulation has compute work queued for the next dispatch */
    enqueue(simulation: GPUParticleSimulation): void;
    /** dispatches all queued compute work now */
    flush(): void;
}

const SPRITE_MODES = new Set([
    RenderMode.BillBoard,
    RenderMode.StretchedBillBoard,
    RenderMode.HorizontalBillBoard,
    RenderMode.VerticalBillBoard,
    RenderMode.Mesh,
]);

/**
 * Whether a particle system can be simulated on the GPU.
 * @returns `null` when it can, otherwise the reason it stays on the CPU
 */
export function getGPUSimulationSupport(system: ParticleSystem): string | null {
    if (!SPRITE_MODES.has(system.rendererSettings.renderMode)) {
        return 'trail particles are simulated on the CPU';
    }
    if (system.onlyUsedByOther && !system.worldSpace) {
        return 'local space sub-emitter particles follow their parent particle on the CPU';
    }
    const listeners = (system as any).listeners?.particleDied;
    if (listeners && listeners.length > 0) {
        return 'particleDied listeners receive CPU particles';
    }
    for (const behavior of system.behaviors) {
        const compiler = getGPUBehaviorCompiler(behavior);
        if (!compiler) return `behavior ${behavior.type} has no GPU version`;
        if (!compiler.supports(behavior, system)) return `behavior ${behavior.type} uses a generator with no GPU version`;
    }
    return null;
}

/** Upper bound of a value generator, or `null` if unknown. */
function maxValue(gen: unknown): number | null {
    if (gen instanceof ConstantValue) return gen.value;
    if (gen instanceof IntervalValue) return Math.max(gen.a, gen.b);
    if (gen instanceof PiecewiseBezier) {
        let max = -Infinity;
        for (const [bezier] of gen.functions) for (const p of bezier.p) max = Math.max(max, p);
        return Number.isFinite(max) ? max : null;
    }
    return null;
}

function nextPowerOfTwo(n: number): number {
    return 2 ** Math.ceil(Math.log2(Math.max(1, n)));
}

/**
 * Upper estimate of the number of live particles of a system: max emission rate x max lifetime + bursts.
 * @returns `null` when a generator has no known bound
 */
export function estimateParticleCount(system: ParticleSystem): number | null {
    const rate = maxValue(system.emissionOverTime);
    const life = maxValue(system.startLife);
    if (rate === null || life === null) return null;
    let estimate = Math.max(0, rate) * Math.max(0, life);
    for (const burst of system.emissionBursts) {
        const count = maxValue(burst.count);
        if (count === null) return null;
        estimate += Math.max(0, count) * Math.max(1, burst.cycle ?? 1);
    }
    return estimate;
}

/**
 * Initial number of particle slots: {@link estimateParticleCount} with some headroom, rounded up to a power of two.
 * The buffer grows when this is not enough (emission over distance, generators with no known bound).
 */
export function estimateGPUCapacity(system: ParticleSystem): number {
    const estimate = estimateParticleCount(system);
    const slots = estimate === null ? 1024 : estimate * 1.25 + 64;
    return Math.min(1 << 22, Math.max(256, nextPowerOfTwo(slots)));
}

const IDENTITY = new Matrix4();
const tempPosition = new Vector3();
const tempRotation = new Quaternion();
const tempScale = new Vector3();

/**
 * Hybrid GPU simulation of one {@link ParticleSystem} (`ParticleSimulationDelegate`).
 *
 * The CPU keeps emitting particles exactly like before (shapes, start values, `initialize()` of every behavior) and
 * uploads only the particles spawned in a step (112-160 bytes each) instead of every live particle every frame. A TSL
 * compute kernel generated from the system's behaviors updates all particles in a storage buffer, and the system's
 * batch draws straight from that buffer.
 *
 * Per step:
 * 1. spawned particles get the lowest free slots ({@link GPUSlotAllocator}) and are packed into the spawn buffer;
 * 2. the spawn kernel scatters them into their slots;
 * 3. the update kernel runs the behaviors on slots `[0, highWater)`, integrates and ages them;
 * 4. the batch draws `highWater` instances; dead slots collapse to zero size.
 *
 * Nothing is read back from the GPU: lifetimes are known at spawn, so the CPU frees slots on its own.
 */
export class GPUParticleSimulation implements ParticleSimulationDelegate {
    readonly layout: GPUParticleLayout;
    readonly allocator: GPUSlotAllocator;
    /** particle records, `capacity * layout.stride` vec4 */
    state!: StorageBufferAttribute;
    /** incremented when {@link state} is replaced (growth); materials reading it are rebuilt */
    generation = 0;
    /**
     * Set when an edit invalidated this simulation (a behavior with no GPU version, a change of the particle
     * layout). The host then re-adds the system, which picks the CPU or a new GPU simulation.
     */
    invalidReason: string | null = null;

    // per-system render transform (identity for world space systems)
    readonly emitterMatrix: N = uniform(new Matrix4());
    readonly emitterScale: N = uniform(new Vector3(1, 1, 1));
    readonly emitterRotation: N = uniform(new Vector4(0, 0, 0, 1));
    readonly speedFactor: N = uniform(0);
    readonly lengthFactor: N = uniform(0);

    private stateNode_: N = null;
    private staging_!: StorageBufferAttribute;
    private stagingCapacity_ = 0;
    private spawnNode_: N = null;
    private updateNode_: N = null;
    private clearNode_: N = null;
    private ctx_!: GPUCompileContext;
    private worldSpace_: boolean;
    private pending_: N[] = [];
    private queued_ = false;
    private needsClear_ = false;
    private disposed_ = false;
    /** one-shot kernels to dispose once they were dispatched */
    private retired_: N[] = [];

    constructor(
        readonly system: ParticleSystem,
        private readonly host: GPUSimulationHost,
        capacity: number = estimateGPUCapacity(system)
    ) {
        const noise = system.behaviors.some((b) => getGPUBehaviorCompiler(b)?.usesNoiseState === true);
        this.layout = createGPUParticleLayout({mesh: system.rendererSettings.renderMode === RenderMode.Mesh, noise});
        this.worldSpace_ = system.worldSpace;
        this.allocator = new GPUSlotAllocator(nextPowerOfTwo(capacity));
        this.state = this.createState(this.allocator.capacity);
        this.resizeStaging(64);
        this.buildKernels();
    }

    /** number of slots */
    get capacity(): number {
        return this.allocator.capacity;
    }

    /** slots `[0, highWater)` hold every live particle: the draw's instance count */
    get highWater(): number {
        return this.allocator.highWater;
    }

    // ---- ParticleSimulationDelegate ------------------------------------------------------------------------

    step(system: ParticleSystem, spawnCount: number, delta: number): number {
        if (this.disposed_ || this.invalidReason !== null) return this.allocator.liveCount;
        // a second step before the frame's dispatch (prewarm): run the queued step first
        if (this.queued_) this.host.flush();
        for (const node of this.retired_) node.dispose();
        this.retired_.length = 0;

        if (system.worldSpace !== this.worldSpace_ || this.ctx_.isStale()) {
            const reason = getGPUSimulationSupport(system) ?? (this.layoutChanged(system) ? 'particle layout changed' : null);
            if (reason !== null) {
                this.invalidReason = reason;
                return this.allocator.liveCount;
            }
            this.worldSpace_ = system.worldSpace;
            this.buildKernels();
        }

        if (this.needsClear_) {
            this.needsClear_ = false;
            this.pending_.push(this.clearNode_);
        }

        // 1. slots and spawn records
        if (spawnCount > this.stagingCapacity_) this.resizeStaging(spawnCount);
        const records = this.staging_.array as Float32Array;
        const particles = system.particles;
        for (let i = 0; i < spawnCount; i++) {
            const particle = particles[i];
            // particles handed over from the CPU simulation keep their age
            const remaining = particle.life - particle.age;
            let slot = this.allocator.allocate(remaining);
            if (slot < 0) {
                this.grow(this.allocator.capacity * 2);
                slot = this.allocator.allocate(remaining);
            }
            writeSpawnRecord(records, i, this.layout, particle, slot, Math.floor(Math.random() * GPU_SEED_RANGE));
        }
        if (spawnCount > 0) {
            this.staging_.clearUpdateRanges();
            this.staging_.addUpdateRange(0, spawnCount * this.layout.stride * 4);
            this.staging_.needsUpdate = true;
            this.spawnNode_.count = spawnCount;
            this.pending_.push(this.spawnNode_);
        }

        // 2. clock and deaths
        this.allocator.advance(delta);

        // 3. update kernel
        const ctx = this.ctx_;
        ctx.delta.value = delta;
        ctx.frame.value = (ctx.frame.value + 1) % GPU_SEED_RANGE;
        ctx.sync();
        const highWater = this.allocator.highWater;
        if (highWater > 0) {
            this.updateNode_.count = highWater;
            this.pending_.push(this.updateNode_);
        }

        if (this.pending_.length > 0) {
            this.queued_ = true;
            this.host.enqueue(this);
        }
        return this.allocator.liveCount;
    }

    clear() {
        this.allocator.clear();
        this.needsClear_ = true;
    }

    /** Compute nodes queued since the last dispatch (in order); clears the queue. */
    takePending(): N[] {
        const nodes = this.pending_;
        this.pending_ = [];
        this.queued_ = false;
        return nodes;
    }

    /** Refreshes the render transform from the emitter (call after the system's update, before rendering). */
    updateRenderUniforms() {
        const system = this.system;
        const matrix = this.emitterMatrix.value as Matrix4;
        if (system.worldSpace) {
            matrix.copy(IDENTITY);
            (this.emitterScale.value as Vector3).set(1, 1, 1);
            (this.emitterRotation.value as Vector4).set(0, 0, 0, 1);
        } else {
            const emitter = system.emitter as any;
            if (emitter.updateWorldMatrix) emitter.updateWorldMatrix(true, false);
            matrix.copy(emitter.matrixWorld);
            matrix.decompose(tempPosition, tempRotation, tempScale);
            (this.emitterScale.value as Vector3).set(Math.abs(tempScale.x), Math.abs(tempScale.y), Math.abs(tempScale.z));
            (this.emitterRotation.value as Vector4).set(tempRotation.x, tempRotation.y, tempRotation.z, tempRotation.w);
        }
        if (system.rendererSettings.renderMode === RenderMode.StretchedBillBoard) {
            const settings = system.rendererEmitterSettings as StretchedBillBoardSettings;
            this.speedFactor.value = settings.speedFactor === 0 ? 0.001 : settings.speedFactor;
            this.lengthFactor.value = settings.lengthFactor;
        }
    }

    /**
     * Per-particle values for the batch's material, read from {@link state} by instance index.
     * Rebuild the material when {@link generation} changes.
     */
    createRenderFields(): ParticleFields {
        const layout = this.layout;
        const state = (storage as any)(this.state, 'vec4', this.state.count).toReadOnly();
        const base = (instanceIndex as N).mul(layout.stride);
        const at = (slot: number) => state.element(base.add(slot));
        const head = at(GPU_SLOT.POSITION_AGE);
        const motion = at(GPU_SLOT.VELOCITY_LIFE);
        const sizeRotation = at(GPU_SLOT.SIZE_ROTATION);
        const alive = head.w.lessThan(motion.w);
        return {
            offset: this.emitterMatrix.mul(vec4(head.xyz, 1.0)).xyz,
            // dead and never used slots collapse to a point
            size: select(alive, sizeRotation.xyz.mul(this.emitterScale), vec3(0)),
            rotation: layout.quaternion >= 0 ? quatMul(this.emitterRotation, at(layout.quaternion)) : sizeRotation.w,
            color: (vertexStage as N)(at(GPU_SLOT.COLOR)),
            uvTile: (vertexStage as N)(at(GPU_SLOT.MISC).w),
            velocity: vec4(
                this.emitterMatrix.mul(vec4(motion.xyz, 0.0)).xyz.mul(this.speedFactor),
                this.lengthFactor
            ),
            shared: false,
        };
    }

    dispose() {
        this.disposed_ = true;
        this.pending_ = [];
        this.queued_ = false;
        for (const node of [this.spawnNode_, this.updateNode_, this.clearNode_, ...this.retired_]) node?.dispose();
        this.retired_.length = 0;
    }

    // ---- buffers and kernels -------------------------------------------------------------------------------

    private layoutChanged(system: ParticleSystem): boolean {
        return !this.isCompatible(system);
    }

    /** Whether this simulation's particle layout still fits the system (render mode / behaviors changed). */
    isCompatible(system: ParticleSystem): boolean {
        const noise = system.behaviors.some((b) => getGPUBehaviorCompiler(b)?.usesNoiseState === true);
        const mesh = system.rendererSettings.renderMode === RenderMode.Mesh;
        return noise === this.layout.noise >= 0 && mesh === this.layout.mesh;
    }

    private createState(capacity: number): StorageBufferAttribute {
        return new StorageBufferAttribute(new Float32Array(capacity * this.layout.stride * 4), 4);
    }

    private resizeStaging(count: number) {
        this.stagingCapacity_ = nextPowerOfTwo(Math.max(64, count));
        this.staging_ = new StorageBufferAttribute(new Float32Array(this.stagingCapacity_ * this.layout.stride * 4), 4);
        if (this.stateNode_) this.rebuildSpawnKernel();
    }

    /**
     * Grows the state buffer. Called while packing spawn records, when at most the clear kernel is queued for this
     * step; the live particles are copied first in the next dispatch.
     */
    private grow(capacity: number) {
        const S = this.layout.stride;
        const previous = this.state;
        const oldCount = this.allocator.capacity * S;
        const clearing = this.pending_.includes(this.clearNode_);
        this.allocator.grow(capacity);
        this.state = this.createState(this.allocator.capacity);
        this.pending_ = [];
        if (clearing) {
            // restarted this step: the new, zeroed buffer is already clear
            this.retired_.push(this.clearNode_);
            this.clearNode_ = null;
        } else {
            const source = (storage as any)(previous, 'vec4', oldCount).toReadOnly();
            const target = (storage as any)(this.state, 'vec4', this.state.count);
            const copy = (Fn as N)(() => {
                target.element(instanceIndex).assign(source.element(instanceIndex));
            })().compute(oldCount);
            this.pending_.push(copy);
            this.retired_.push(copy);
        }
        this.buildKernels();
        this.generation++;
    }

    private buildKernels() {
        for (const node of [this.spawnNode_, this.updateNode_, this.clearNode_]) node?.dispose();
        const S = this.layout.stride;
        this.stateNode_ = (storage as any)(this.state, 'vec4', this.state.count);
        this.rebuildSpawnKernel();
        this.updateNode_ = this.buildUpdateKernel();
        const state = this.stateNode_;
        this.clearNode_ = (Fn as N)(() => {
            const base = (instanceIndex as N).mul(S);
            state.element(base.add(GPU_SLOT.POSITION_AGE)).assign(vec4(0));
            state.element(base.add(GPU_SLOT.VELOCITY_LIFE)).assign(vec4(0));
        })().compute(this.allocator.capacity);
    }

    private rebuildSpawnKernel() {
        this.spawnNode_?.dispose();
        const S = this.layout.stride;
        const state = this.stateNode_;
        const staging = (storage as any)(this.staging_, 'vec4', this.staging_.count).toReadOnly();
        this.spawnNode_ = (Fn as N)(() => {
            const source = (instanceIndex as N).mul(S).toVar();
            const slot = staging.element(source.add(GPU_SLOT.START_SIZE)).w.toUint();
            const target = slot.mul(S).toVar();
            for (let k = 0; k < S; k++) {
                state.element(target.add(k)).assign(staging.element(source.add(k)));
            }
        })().compute(this.stagingCapacity_);
    }

    private buildUpdateKernel(): N {
        const system = this.system;
        const layout = this.layout;
        const S = layout.stride;
        const state = this.stateNode_;
        const ctx = new GPUCompileContext(system.worldSpace);
        // the behavior list and every behavior are part of the generated code
        ctx.watch(() => system.behaviors.length);
        system.behaviors.forEach((_, i) => ctx.watch(() => system.behaviors[i]));
        ctx.watch(() => system.rendererSettings.renderMode);
        if (this.ctx_) {
            ctx.frame.value = this.ctx_.frame.value;
        }
        this.ctx_ = ctx;

        return (Fn as N)(() => {
            const base = (instanceIndex as N).mul(S).toVar();
            const at = (slot: number) => state.element(base.add(slot));
            const head = at(GPU_SLOT.POSITION_AGE).toVar();
            const motion = at(GPU_SLOT.VELOCITY_LIFE).toVar();
            (If as N)(head.w.lessThan(motion.w), () => {
                const sizeRotation = at(GPU_SLOT.SIZE_ROTATION).toVar();
                const misc = at(GPU_SLOT.MISC).toVar();
                const p: GPUParticleState = {
                    layout,
                    position: head.xyz.toVar(),
                    age: head.w.toVar(),
                    velocity: motion.xyz.toVar(),
                    life: motion.w,
                    color: at(GPU_SLOT.COLOR).toVar(),
                    size: sizeRotation.xyz.toVar(),
                    rotation: sizeRotation.w.toVar(),
                    quaternion: layout.quaternion >= 0 ? at(layout.quaternion).toVar() : null,
                    startColor: at(GPU_SLOT.START_COLOR),
                    startSize: at(GPU_SLOT.START_SIZE).xyz,
                    seed: misc.x.toUint().toVar(),
                    startSpeed: misc.y,
                    speedModifier: misc.z.toVar(),
                    uvTile: misc.w.toVar(),
                    noise: layout.noise >= 0 ? at(layout.noise).toVar() : null,
                    noiseQuaternion: layout.noiseQuaternion >= 0 ? at(layout.noiseQuaternion).toVar() : null,
                    t: head.w.div(motion.w),
                };
                ctx.seed = p.seed;
                for (const behavior of system.behaviors) {
                    getGPUBehaviorCompiler(behavior)!.compile(ctx, behavior, p, system);
                }
                // integrate and age, like the end of ParticleSystem.update()
                p.position.addAssign(p.velocity.mul(ctx.delta.mul(p.speedModifier)));
                p.age.addAssign(ctx.delta);

                const written = ctx.written;
                at(GPU_SLOT.POSITION_AGE).assign(vec4(p.position, p.age));
                if (written.has('velocity')) at(GPU_SLOT.VELOCITY_LIFE).assign(vec4(p.velocity, p.life));
                if (written.has('color')) at(GPU_SLOT.COLOR).assign(p.color);
                if (written.has('sizeRotation')) at(GPU_SLOT.SIZE_ROTATION).assign(vec4(p.size, p.rotation));
                if (written.has('misc')) at(GPU_SLOT.MISC).assign(vec4(misc.x, misc.y, p.speedModifier, p.uvTile));
                if (written.has('quaternion') && p.quaternion) at(layout.quaternion).assign(p.quaternion);
                if (written.has('noise')) {
                    if (p.noise) at(layout.noise).assign(p.noise);
                    if (p.noiseQuaternion) at(layout.noiseQuaternion).assign(p.noiseQuaternion);
                }
            });
        })().compute(this.allocator.capacity);
    }
}
