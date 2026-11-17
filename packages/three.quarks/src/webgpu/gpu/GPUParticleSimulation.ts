/* eslint-disable @typescript-eslint/no-explicit-any */
import {Matrix4, Quaternion, Vector3} from 'three';
import {StackNode, StorageBufferAttribute} from 'three/webgpu';
import * as TSL from 'three/tsl';
import {RenderMode} from 'three.quarks';
import type {
    IEmitter,
    Particle,
    ParticleSimulationDelegate,
    StretchedBillBoardSettings,
    VFXBatchSettings,
} from 'three.quarks';
import type {ParticleFields} from '../ParticleNodes';
import {GPUCompileContext} from './GPUCompileContext';
import type {GPUParticleState} from './GPUBehaviors';
import {quatMul} from './GPUGenerators';
import {createGPUParticleLayout, GPU_SEED_RANGE, GPU_SLOT, GPUParticleLayout, writeSpawnRecord} from './GPUParticleLayout';
import {GPUDeathQueue, GPUSlotPool} from './GPUSlotAllocator';
import {createGPUSimulationProgram, GPUSimulationProgram} from './GPUSimulationProgram';

// untyped TSL: the generated graphs mix node types the typings cannot follow
const {Fn, If, float, getCurrentStack, instanceIndex, select, setCurrentStack, storage, uint, uniform, vec3, vec4, vertexStage} =
    TSL as any;

type N = any;

/**
 * What a GPU simulation needs from a particle system (`ParticleSystem`, or another system type with a registered
 * {@link GPUSimulationProgram}, such as `NodeVFX`). The system emits on the CPU into `particles[0 .. pendingSpawnCount)`
 * and calls its `simulationDelegate.step()` instead of simulating its particles.
 */
export interface GPUSimulatedSystem {
    particles: Particle[];
    particleNum: number;
    pendingSpawnCount: number;
    simulationDelegate: ParticleSimulationDelegate | null;
    worldSpace: boolean;
    onlyUsedByOther?: boolean;
    emitter: IEmitter;
    rendererSettings: VFXBatchSettings;
    rendererEmitterSettings: unknown;
    getRendererSettings(): VFXBatchSettings;
}

/**
 * Collects the compute work of the GPU simulation and dispatches it (implemented by `WebGPUBatchedRenderer`).
 */
export interface GPUSimulationHost {
    /** a batch has compute work queued for the next dispatch */
    enqueue(batch: GPUParticleBatchSimulation): void;
    /** dispatches all queued compute work now */
    flush(): void;
    /** dispatches `nodes` right away (call {@link flush} first) */
    dispatch(nodes: N[]): void;
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
export function getGPUSimulationSupport(system: GPUSimulatedSystem): string | null {
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
    if (!('simulationDelegate' in (system as any))) {
        return 'the particle system type does not support simulation delegates';
    }
    const program = createGPUSimulationProgram(system);
    if (!program) return 'no GPU simulation program for this particle system type';
    return program.support();
}

function nextPowerOfTwo(n: number): number {
    return 2 ** Math.ceil(Math.log2(Math.max(1, n)));
}

/**
 * Upper estimate of the number of live particles of a system (for a `ParticleSystem`: max emission rate x max
 * lifetime + bursts).
 * @returns `null` when unknown
 */
export function estimateParticleCount(system: GPUSimulatedSystem): number | null {
    const program = createGPUSimulationProgram(system);
    return program ? program.estimateParticleCount() : null;
}

/**
 * Particle slots for a system: {@link estimateParticleCount} with some headroom, rounded up to a power of two.
 * Buffers grow when this is not enough (emission over distance, generators with no known bound).
 */
export function estimateGPUCapacity(system: GPUSimulatedSystem): number {
    const estimate = estimateParticleCount(system);
    const slots = estimate === null ? 1024 : estimate * 1.25 + 64;
    return Math.min(1 << 22, Math.max(64, nextPowerOfTwo(slots)));
}

/** Whether a system's particles need the Noise slot of the particle layout. */
export function usesNoiseState(system: GPUSimulatedSystem): boolean {
    const program = createGPUSimulationProgram(system);
    return !!program && program.usesNoiseState();
}

/**
 * vec4 per system in the systems buffer of a batch:
 * 0-3 emitter matrix columns, 4 emitter scale (xyz), 5 emitter rotation (quaternion),
 * 6 (step delta, stepped flag, parameter row offset, compute group), 7 (speed factor, length factor, visible flag)
 */
export const GPU_SYSTEM_STRIDE = 8;
const CONTROL = 6;
const RENDER = 7;

const tempPosition = new Vector3();
const tempRotation = new Quaternion();
const tempScale = new Vector3();
const IDENTITY = new Matrix4();

/** Systems of a batch that share one update kernel (their code has the same shape). */
export interface GPUComputeGroup {
    id: number;
    signature: string;
    members: Set<GPUSimulationMember>;
    node: N | null;
}

/**
 * A system of a {@link GPUParticleBatchSimulation}: its {@link ParticleSimulationDelegate}, the lifetimes of its
 * particles and its parameter row.
 */
export class GPUSimulationMember implements ParticleSimulationDelegate {
    /** death times of the system's particles, on the system's own clock */
    readonly deaths = new GPUDeathQueue();
    /** recorded parameters, watches and code signature of the system's program */
    context!: GPUCompileContext;
    /** compute group (systems whose code has the same shape) */
    group: GPUComputeGroup | null = null;
    /** first float of the system's row in the parameter buffer */
    parameterBase = 0;
    /** stepped since the last dispatch */
    stepped = false;
    /** set when an edit invalidated the simulation; the host re-adds the system */
    invalidReason: string | null = null;

    constructor(
        readonly batch: GPUParticleBatchSimulation,
        readonly system: GPUSimulatedSystem,
        public index: number,
        readonly program: GPUSimulationProgram
    ) {}

    /** number of live particles */
    get liveCount(): number {
        return this.deaths.size;
    }

    step(system: GPUSimulatedSystem, spawnCount: number, delta: number): number {
        void system;
        return this.batch.stepMember(this, spawnCount, delta);
    }

    clear() {
        this.batch.clearMember(this);
    }
}

/**
 * Hybrid GPU simulation of the particle systems of one batch.
 *
 * Systems with equal renderer settings share one particle buffer, one draw call (`GPUParticleBatch`) and, when their
 * update code has the same shape, one compute kernel; each particle record holds the index of its system. Per-system
 * values (emitter transform, step delta, curve keys, force magnitudes, ...) live in a systems buffer and a parameter
 * buffer, so systems that differ only in values (e.g. instances of one effect) run the same kernel.
 *
 * The CPU keeps emitting particles exactly like before (shapes, start values, `initialize()` of every behavior) and
 * uploads only the particles spawned in a step. Per dispatch:
 * 1. spawned particles get the lowest free slots of the batch ({@link GPUSlotPool}) and their records are uploaded;
 * 2. the spawn kernel scatters them into their slots;
 * 3. one update kernel per compute group runs the program of each particle's system on slots `[0, highWater)`,
 *    integrates and ages the particles of the systems that stepped;
 * 4. the batch draws `highWater` instances; dead slots collapse to zero size.
 *
 * Nothing is read back from the GPU: lifetimes are known at spawn, so each system frees its slots on its own clock.
 */
export class GPUParticleBatchSimulation {
    readonly layout: GPUParticleLayout;
    readonly pool: GPUSlotPool;
    /** particle records, `capacity * layout.stride` vec4 */
    state!: StorageBufferAttribute;
    /** per-system values, {@link GPU_SYSTEM_STRIDE} vec4 per system */
    systems!: StorageBufferAttribute;
    /** incremented when {@link state} or {@link systems} is replaced; materials reading them are rebuilt */
    generation = 0;
    readonly members: GPUSimulationMember[] = [];
    /** shared step counter (per-step random values) */
    readonly frame: N = uniform(0);

    private memberSlots_ = 0;
    private freeIndices_: number[] = [];
    private releasedIndices_: number[] = [];
    private releasedSlots_: number[] = [];
    private systemsData_!: Float32Array;
    private systemCapacity_ = 0;
    private params_!: StorageBufferAttribute;
    private paramsData_!: Float32Array;
    private paramCapacity_ = 0;
    private parameterSize_ = 0;
    private staging_!: StorageBufferAttribute;
    private stagingData_!: Float32Array;
    private stagingCapacity_ = 0;
    private stagingCount_ = 0;
    private readonly groups_ = new Map<string, GPUComputeGroup>();
    private nextGroupId_ = 0;
    private stateNode_: N = null;
    private spawnNode_: N = null;
    private pending_: N[] = [];
    private retired_: N[] = [];
    private queued_ = false;
    /** the buffers update kernels read (state / systems / parameters) were replaced: rebuild every kernel */
    private kernelsDirty_ = true;
    /** the spawn buffer was replaced: rebuild the spawn kernel */
    private spawnDirty_ = true;
    private disposed_ = false;

    constructor(
        layoutOptions: {mesh: boolean; noise: boolean},
        private readonly host: GPUSimulationHost,
        capacity = 1024
    ) {
        this.layout = createGPUParticleLayout(layoutOptions);
        this.pool = new GPUSlotPool(nextPowerOfTwo(capacity));
        this.state = this.createState(this.pool.capacity);
        this.resizeSystems(16);
        this.resizeParameters(256);
        this.resizeStaging(64);
    }

    /** number of slots */
    get capacity(): number {
        return this.pool.capacity;
    }

    /** slots `[0, highWater)` hold every live particle: the draw's instance count */
    get highWater(): number {
        return this.pool.highWater;
    }

    /** number of update kernels (groups of systems with differently shaped code) */
    get groupCount(): number {
        return this.groups_.size;
    }

    /** The member of `system`, if it is simulated here. */
    memberOf(system: unknown): GPUSimulationMember | undefined {
        return this.members.find((member) => member.system === system);
    }

    /** Whether a system's particles fit this batch's particle layout. */
    fits(system: GPUSimulatedSystem): boolean {
        const mesh = system.rendererSettings.renderMode === RenderMode.Mesh;
        return mesh === this.layout.mesh && usesNoiseState(system) === this.layout.noise >= 0;
    }

    // ---- membership ---------------------------------------------------------------------------------------

    /** Adds a system (with no particles yet) and returns its member. */
    addSystem(system: GPUSimulatedSystem): GPUSimulationMember {
        const program = createGPUSimulationProgram(system);
        if (!program) throw new Error('GPUParticleBatchSimulation: no GPU simulation program for this particle system');
        const index = this.freeIndices_.length > 0 ? this.freeIndices_.pop()! : this.memberSlots_++;
        if (index >= this.systemCapacity_) this.resizeSystems(this.systemCapacity_ * 2);
        const member = new GPUSimulationMember(this, system, index, program);
        this.members.push(member);
        // grow ahead for the expected particles of the system
        const wanted = this.pool.usedCount + estimateGPUCapacity(system);
        if (wanted > this.pool.capacity) this.grow(nextPowerOfTwo(wanted));
        this.record(member);
        this.layoutParameters();
        return member;
    }

    /** Removes a system; its particles disappear with the next dispatch. */
    removeSystem(member: GPUSimulationMember) {
        const at = this.members.indexOf(member);
        if (at === -1) return;
        this.killParticles(member);
        this.members.splice(at, 1);
        const control = (member.index * GPU_SYSTEM_STRIDE + CONTROL) * 4;
        this.systemsData_.fill(0, control, control + 4);
        this.releasedIndices_.push(member.index);
        this.setGroup(member, null);
        this.layoutParameters();
        this.enqueue();
    }

    /**
     * Moves `member`'s live particles into `target` (same particle layout) as a new member there, then removes it
     * here. Used when a system's renderer settings move it to another batch.
     */
    transferTo(member: GPUSimulationMember, target: GPUParticleBatchSimulation): GPUSimulationMember {
        const system = member.system;
        const count = member.liveCount;
        // the target buffer must not grow (a pending copy) after the transfer writes it
        if (target.pool.freeCount < count) target.grow(nextPowerOfTwo(target.pool.usedCount + count));
        const moved = target.addSystem(system);
        this.host.flush();
        if (count > 0) {
            const pairs = new Float32Array(count * 2);
            let n = 0;
            member.deaths.forEach((slot, remaining) => {
                const destination = target.pool.allocate();
                moved.deaths.push(remaining, destination);
                pairs[n++] = slot;
                pairs[n++] = destination;
            });
            const map = (storage as any)(new StorageBufferAttribute(pairs, 2), 'vec2', count).toReadOnly();
            const source = (storage as any)(this.state, 'vec4', this.state.count).toReadOnly();
            const destinationState = (storage as any)(target.state, 'vec4', target.state.count);
            const S = this.layout.stride;
            const index = moved.index;
            const transfer = Fn(() => {
                const pair = map.element(instanceIndex);
                const from = pair.x.toUint().mul(S).toVar();
                const to = pair.y.toUint().mul(S).toVar();
                for (let k = 0; k < S; k++) {
                    const value = source.element(from.add(k));
                    destinationState
                        .element(to.add(k))
                        .assign(k === GPU_SLOT.START_SIZE ? vec4(value.xyz, float(index)) : value);
                }
            })().compute(count);
            this.host.dispatch([transfer]);
            transfer.dispose();
        }
        this.removeSystem(member);
        return moved;
    }

    // ---- recording ----------------------------------------------------------------------------------------

    /**
     * Runs the system's program in a recording context (a throwaway TSL stack): parameter layout and getters,
     * structural watches and the code signature. The update kernel later generates the same code for its group.
     */
    private record(member: GPUSimulationMember) {
        const system = member.system;
        const ctx = new GPUCompileContext(system.worldSpace, null, this.frame);
        member.program.watch(ctx);
        ctx.watch(() => system.rendererSettings.renderMode);
        const previous = getCurrentStack();
        setCurrentStack(new (StackNode as any)());
        try {
            member.program.compile(ctx, this.recordingState());
        } finally {
            setCurrentStack(previous);
        }
        member.context = ctx;
        this.setGroup(member, ctx.signature());
    }

    private recordingState(): GPUParticleState {
        const layout = this.layout;
        return {
            layout,
            position: vec3(0).toVar(),
            age: float(0).toVar(),
            velocity: vec3(0).toVar(),
            life: float(1),
            color: vec4(1).toVar(),
            size: vec3(1).toVar(),
            rotation: float(0).toVar(),
            quaternion: layout.quaternion >= 0 ? vec4(0, 0, 0, 1).toVar() : null,
            startColor: vec4(1),
            startSize: vec3(1),
            seed: uint(0),
            startSpeed: float(0),
            speedModifier: float(1).toVar(),
            uvTile: float(0).toVar(),
            noise: layout.noise >= 0 ? vec4(0).toVar() : null,
            noiseQuaternion: layout.noiseQuaternion >= 0 ? vec4(0, 0, 0, 1).toVar() : null,
            t: float(0),
        };
    }

    private setGroup(member: GPUSimulationMember, signature: string | null) {
        const current = member.group;
        if (current && current.signature === signature) return;
        if (current) {
            // the group's kernel stays valid while other members use it (its code does not depend on the member)
            current.members.delete(member);
            if (current.members.size === 0) {
                this.groups_.delete(current.signature);
                if (current.node) this.retired_.push(current.node);
                current.node = null;
            }
        }
        member.group = null;
        if (signature === null) return;
        let group = this.groups_.get(signature);
        if (!group) {
            // a new kind of system: only its kernel is built (on the next dispatch)
            group = {id: this.nextGroupId_++, signature, members: new Set(), node: null};
            this.groups_.set(signature, group);
        }
        group.members.add(member);
        member.group = group;
    }

    /** Parameter rows: one per member, back to back. */
    private layoutParameters() {
        let base = 0;
        for (const member of this.members) {
            member.parameterBase = base;
            base += member.context.parameterSize;
        }
        this.parameterSize_ = base;
        if (base > this.paramCapacity_) this.resizeParameters(nextPowerOfTwo(base));
        for (const member of this.members) {
            const control = (member.index * GPU_SYSTEM_STRIDE + CONTROL) * 4;
            this.systemsData_[control + 2] = member.parameterBase;
            this.systemsData_[control + 3] = member.group ? member.group.id : -1;
            // rows moved: refresh them before the next dispatch
            member.context.writeParameters(this.paramsData_, member.parameterBase);
        }
    }

    // ---- stepping -----------------------------------------------------------------------------------------

    stepMember(member: GPUSimulationMember, spawnCount: number, delta: number): number {
        if (this.disposed_ || member.invalidReason !== null) return member.liveCount;
        // a second step before the frame's dispatch (prewarm): run the queued work first
        if (member.stepped) this.host.flush();
        const system = member.system;

        if (system.worldSpace !== member.context.worldSpace || member.context.isStale()) {
            const reason = getGPUSimulationSupport(system) ?? (this.fits(system) ? null : 'particle layout changed');
            if (reason !== null) {
                member.invalidReason = reason;
                return member.liveCount;
            }
            this.record(member);
            this.layoutParameters();
        }

        // 1. slots and spawn records
        if (this.stagingCount_ + spawnCount > this.stagingCapacity_) this.resizeStaging(this.stagingCount_ + spawnCount);
        const records = this.stagingData_;
        const recordFloats = (this.layout.stride + 1) * 4;
        const particles = system.particles;
        for (let i = 0; i < spawnCount; i++) {
            const particle = particles[i];
            let slot = this.pool.allocate();
            if (slot < 0) {
                this.grow(this.pool.capacity * 2);
                slot = this.pool.allocate();
            }
            const o = this.stagingCount_++ * recordFloats;
            records[o] = slot;
            writeSpawnRecord(records, o + 4, this.layout, particle, member.index, Math.floor(Math.random() * GPU_SEED_RANGE));
            // particles handed over from the CPU simulation keep their age
            member.deaths.push(particle.life - particle.age, slot);
        }

        // 2. clock and deaths
        member.deaths.advance(delta, (slot) => this.pool.free(slot));

        // 3. per-system step values
        const control = (member.index * GPU_SYSTEM_STRIDE + CONTROL) * 4;
        this.systemsData_[control] = delta;
        this.systemsData_[control + 1] = 1;
        member.context.writeParameters(this.paramsData_, member.parameterBase);
        member.stepped = true;
        this.enqueue();
        return member.liveCount;
    }

    /** Removes all particles of a member (restart / stop). */
    clearMember(member: GPUSimulationMember) {
        this.killParticles(member);
        this.enqueue();
    }

    /** Writes dead records over the member's particles; their slots are freed after the dispatch. */
    private killParticles(member: GPUSimulationMember) {
        const count = member.liveCount;
        if (count === 0) return;
        if (this.stagingCount_ + count > this.stagingCapacity_) this.resizeStaging(this.stagingCount_ + count);
        const records = this.stagingData_;
        const recordFloats = (this.layout.stride + 1) * 4;
        member.deaths.forEach((slot) => {
            const o = this.stagingCount_++ * recordFloats;
            records.fill(0, o, o + recordFloats);
            records[o] = slot;
            // reused only after the dispatch, so no spawn targets the slot in the same dispatch
            this.releasedSlots_.push(slot);
        });
        member.deaths.clear();
    }

    private enqueue() {
        if (this.queued_ || this.disposed_) return;
        this.queued_ = true;
        this.host.enqueue(this);
    }

    /** Compute nodes for the next dispatch, in order. Call {@link afterDispatch} once they ran. */
    takePending(): N[] {
        this.buildKernels();
        const nodes = this.pending_;
        this.pending_ = [];
        if (this.stagingCount_ > 0) {
            this.staging_.clearUpdateRanges();
            this.staging_.addUpdateRange(0, this.stagingCount_ * (this.layout.stride + 1) * 4);
            this.staging_.needsUpdate = true;
            this.spawnNode_.count = this.stagingCount_;
            nodes.push(this.spawnNode_);
        }
        this.uploadSystems();
        if (this.parameterSize_ > 0) {
            this.params_.clearUpdateRanges();
            this.params_.addUpdateRange(0, this.parameterSize_);
            this.params_.needsUpdate = true;
        }
        const highWater = this.pool.highWater;
        if (highWater > 0) {
            for (const group of this.groups_.values()) {
                let stepped = false;
                for (const member of group.members) stepped ||= member.stepped;
                if (stepped && group.node) {
                    group.node.count = highWater;
                    nodes.push(group.node);
                }
            }
        }
        return nodes;
    }

    /** Resets the per-dispatch state after {@link takePending}'s nodes ran. */
    afterDispatch() {
        for (const member of this.members) {
            if (!member.stepped) continue;
            member.stepped = false;
            const control = (member.index * GPU_SYSTEM_STRIDE + CONTROL) * 4;
            this.systemsData_[control] = 0;
            this.systemsData_[control + 1] = 0;
        }
        this.stagingCount_ = 0;
        for (const slot of this.releasedSlots_) this.pool.free(slot);
        this.releasedSlots_.length = 0;
        for (const index of this.releasedIndices_) this.freeIndices_.push(index);
        this.releasedIndices_.length = 0;
        for (const node of this.retired_) node.dispose();
        this.retired_.length = 0;
        this.frame.value = (this.frame.value + 1) % GPU_SEED_RANGE;
        this.queued_ = false;
    }

    // ---- rendering ----------------------------------------------------------------------------------------

    /** Refreshes the emitter transform and visibility of every system (call before rendering). */
    updateRenderData() {
        const data = this.systemsData_;
        for (const member of this.members) {
            const system = member.system;
            const o = member.index * GPU_SYSTEM_STRIDE * 4;
            let matrix = IDENTITY;
            if (system.worldSpace) {
                tempScale.set(1, 1, 1);
                tempRotation.set(0, 0, 0, 1);
            } else {
                const emitter = system.emitter as any;
                if (emitter.updateWorldMatrix) emitter.updateWorldMatrix(true, false);
                matrix = emitter.matrixWorld;
                matrix.decompose(tempPosition, tempRotation, tempScale);
            }
            const e = matrix.elements;
            for (let k = 0; k < 16; k++) data[o + k] = e[k];
            data[o + 16] = Math.abs(tempScale.x);
            data[o + 17] = Math.abs(tempScale.y);
            data[o + 18] = Math.abs(tempScale.z);
            data[o + 20] = tempRotation.x;
            data[o + 21] = tempRotation.y;
            data[o + 22] = tempRotation.z;
            data[o + 23] = tempRotation.w;
            const render = o + RENDER * 4;
            if (system.rendererSettings.renderMode === RenderMode.StretchedBillBoard) {
                const settings = system.rendererEmitterSettings as StretchedBillBoardSettings;
                data[render] = settings.speedFactor === 0 ? 0.001 : settings.speedFactor;
                data[render + 1] = settings.lengthFactor;
            }
            data[render + 2] = system.emitter.visible ? 1 : 0;
        }
        this.uploadSystems();
    }

    private uploadSystems() {
        this.systems.clearUpdateRanges();
        this.systems.addUpdateRange(0, Math.max(1, this.memberSlots_) * GPU_SYSTEM_STRIDE * 4);
        this.systems.needsUpdate = true;
    }

    /**
     * Per-particle values for the batch's material, read from {@link state} by instance index and from
     * {@link systems} by the particle's system. Rebuild the material when {@link generation} changes.
     */
    createRenderFields(): ParticleFields {
        const layout = this.layout;
        const state = (storage as any)(this.state, 'vec4', this.state.count).toReadOnly();
        const systems = (storage as any)(this.systems, 'vec4', this.systems.count).toReadOnly();
        const base = (instanceIndex as N).mul(layout.stride);
        const at = (slot: number) => state.element(base.add(slot));
        const head = at(GPU_SLOT.POSITION_AGE);
        const motion = at(GPU_SLOT.VELOCITY_LIFE);
        const sizeRotation = at(GPU_SLOT.SIZE_ROTATION);
        const system = at(GPU_SLOT.START_SIZE).w.toUint().mul(GPU_SYSTEM_STRIDE);
        const row = (k: number) => systems.element(system.add(k));
        const c0 = row(0).xyz;
        const c1 = row(1).xyz;
        const c2 = row(2).xyz;
        const c3 = row(3).xyz;
        const transformDirection = (v: N) => c0.mul(v.x).add(c1.mul(v.y)).add(c2.mul(v.z));
        const render = row(RENDER);
        const visible = head.w.lessThan(motion.w).and(render.z.greaterThan(0.5));
        return {
            offset: transformDirection(head.xyz).add(c3),
            // dead, never used and hidden slots collapse to a point
            size: select(visible, sizeRotation.xyz.mul(row(4).xyz), vec3(0)),
            rotation: layout.quaternion >= 0 ? quatMul(row(5), at(layout.quaternion)) : sizeRotation.w,
            color: (vertexStage as N)(at(GPU_SLOT.COLOR)),
            uvTile: (vertexStage as N)(at(GPU_SLOT.MISC).w),
            velocity: vec4(transformDirection(motion.xyz).mul(render.x), render.y),
            shared: false,
        };
    }

    dispose() {
        this.disposed_ = true;
        this.pending_ = [];
        for (const node of [this.spawnNode_, ...this.retired_]) node?.dispose();
        for (const group of this.groups_.values()) group.node?.dispose();
        this.retired_.length = 0;
    }

    // ---- buffers and kernels ------------------------------------------------------------------------------

    private createState(capacity: number): StorageBufferAttribute {
        return new StorageBufferAttribute(new Float32Array(capacity * this.layout.stride * 4), 4);
    }

    private resizeSystems(capacity: number) {
        const data = new Float32Array(capacity * GPU_SYSTEM_STRIDE * 4);
        if (this.systemsData_) data.set(this.systemsData_);
        this.systemsData_ = data;
        this.systemCapacity_ = capacity;
        this.systems = new StorageBufferAttribute(data, 4);
        this.kernelsDirty_ = true;
        this.generation++;
    }

    private resizeParameters(capacity: number) {
        const data = new Float32Array(capacity);
        if (this.paramsData_) data.set(this.paramsData_.subarray(0, Math.min(this.paramsData_.length, capacity)));
        this.paramsData_ = data;
        this.paramCapacity_ = capacity;
        this.params_ = new StorageBufferAttribute(data, 1);
        this.kernelsDirty_ = true;
    }

    private resizeStaging(count: number) {
        const capacity = nextPowerOfTwo(Math.max(64, count));
        const data = new Float32Array(capacity * (this.layout.stride + 1) * 4);
        if (this.stagingData_) data.set(this.stagingData_.subarray(0, this.stagingCount_ * (this.layout.stride + 1) * 4));
        this.stagingData_ = data;
        this.stagingCapacity_ = capacity;
        this.staging_ = new StorageBufferAttribute(data, 4);
        this.spawnDirty_ = true;
    }

    /** Grows the state buffer; the copy of the live particles runs first in the next dispatch. */
    private grow(capacity: number) {
        const S = this.layout.stride;
        const previous = this.state;
        const oldCount = this.pool.capacity * S;
        const empty = this.pool.usedCount === 0 && this.pending_.length === 0;
        this.pool.grow(capacity);
        this.state = this.createState(this.pool.capacity);
        if (!empty) {
            const source = (storage as any)(previous, 'vec4', oldCount).toReadOnly();
            const target = (storage as any)(this.state, 'vec4', this.state.count);
            const copy = Fn(() => {
                target.element(instanceIndex).assign(source.element(instanceIndex));
            })().compute(oldCount);
            this.pending_.push(copy);
            this.retired_.push(copy);
        }
        this.kernelsDirty_ = true;
        this.generation++;
    }

    private systemsNode_: N = null;
    private paramsNode_: N = null;

    /** Builds the kernels that are missing or read a replaced buffer. */
    private buildKernels() {
        const S = this.layout.stride;
        if (this.kernelsDirty_) {
            this.stateNode_ = (storage as any)(this.state, 'vec4', this.state.count);
            this.systemsNode_ = (storage as any)(this.systems, 'vec4', this.systems.count).toReadOnly();
            this.paramsNode_ = (storage as any)(this.params_, 'float', this.params_.count).toReadOnly();
            for (const group of this.groups_.values()) {
                if (group.node) this.retired_.push(group.node);
                group.node = null;
            }
            this.spawnDirty_ = true;
            this.kernelsDirty_ = false;
        }
        if (this.spawnDirty_) {
            if (this.spawnNode_) this.retired_.push(this.spawnNode_);
            const state = this.stateNode_;
            const staging = (storage as any)(this.staging_, 'vec4', this.staging_.count).toReadOnly();
            this.spawnNode_ = Fn(() => {
                const source = (instanceIndex as N).mul(S + 1).toVar();
                const target = staging.element(source).x.toUint().mul(S).toVar();
                for (let k = 0; k < S; k++) {
                    state.element(target.add(k)).assign(staging.element(source.add(k + 1)));
                }
            })().compute(this.stagingCapacity_);
            this.spawnDirty_ = false;
        }
        for (const group of this.groups_.values()) {
            if (!group.node) group.node = this.buildUpdateKernel(group, this.systemsNode_, this.paramsNode_);
        }
    }

    private buildUpdateKernel(group: GPUComputeGroup, systems: N, params: N): N {
        const representative = group.members.values().next().value as GPUSimulationMember;
        const program = representative.program;
        const worldSpace = representative.system.worldSpace;
        const layout = this.layout;
        const S = layout.stride;
        const state = this.stateNode_;
        const frame = this.frame;

        return Fn(() => {
            const base = (instanceIndex as N).mul(S).toVar();
            const at = (slot: number) => state.element(base.add(slot));
            const head = at(GPU_SLOT.POSITION_AGE).toVar();
            const motion = at(GPU_SLOT.VELOCITY_LIFE).toVar();
            const system = at(GPU_SLOT.START_SIZE).w.toUint().toVar();
            const control = systems.element(system.mul(GPU_SYSTEM_STRIDE).add(CONTROL)).toVar();
            const run = head.w
                .lessThan(motion.w)
                .and(control.y.greaterThan(0.5))
                .and(control.w.equal(float(group.id)));
            (If as N)(run, () => {
                const ctx = new GPUCompileContext(worldSpace, {params, base: control.z.toUint()}, frame);
                ctx.delta = control.x;
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
                program.compile(ctx, p);
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
        })().compute(this.pool.capacity);
    }
}
