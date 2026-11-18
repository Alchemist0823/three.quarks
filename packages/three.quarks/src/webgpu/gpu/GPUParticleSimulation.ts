/* eslint-disable @typescript-eslint/no-explicit-any */
import {Matrix3, Matrix4, Quaternion, Vector3} from 'three';
import * as WebGPU from 'three/webgpu';
import {IndirectStorageBufferAttribute, StackNode, StorageBufferAttribute} from 'three/webgpu';
import * as TSL from 'three/tsl';
import {RenderMode} from 'three.quarks';
import type {
    EmissionState,
    IEmitter,
    Particle,
    ParticleSimulationDelegate,
    StretchedBillBoardSettings,
    VFXBatchSettings,
} from 'three.quarks';
import type {ParticleFields} from '../ParticleNodes';
import {GPUCompileContext} from './GPUCompileContext';
import type {GPUParticleState} from './GPUBehaviors';
import type {GPUEmissionInput} from './GPUEmission';
import {quatMul} from './GPUGenerators';
import {
    createGPUParticleLayout,
    GPU_SEED_RANGE,
    GPU_SLOT,
    GPUParticleLayout,
    writeSpawnRecord,
} from './GPUParticleLayout';
import {createGPUSimulationProgram, GPUSimulationProgram} from './GPUSimulationProgram';

// untyped TSL: the generated graphs mix node types the typings cannot follow
const {
    Fn,
    If,
    Loop,
    atomicAdd,
    atomicLoad,
    atomicMax,
    atomicStore,
    atomicSub,
    float,
    floor,
    getCurrentStack,
    hash,
    instanceIndex,
    int,
    select,
    setCurrentStack,
    storage,
    uint,
    uniform,
    vec3,
    vec4,
    vertexStage,
} = TSL as any;

/** `ReadbackBuffer` (three r180+): a reusable read buffer for counter readbacks. */
const ReadbackBufferClass: any = (WebGPU as any).ReadbackBuffer ?? null;

type N = any;

/**
 * What a GPU simulation needs from a particle system (`ParticleSystem`, or another system type with a registered
 * {@link GPUSimulationProgram}, such as `NodeVFX`). The system decides how many particles to emit and either hands
 * them to its `simulationDelegate` as emission calls (`emit()`, GPU emission) or emits them on the CPU into
 * `particles[0 .. pendingSpawnCount)`; it calls `simulationDelegate.step()` instead of simulating its particles.
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
    /** emit particles on the GPU when the system supports it (default `true`) */
    readonly gpuEmission?: boolean;
    /** a batch has compute work queued for the next dispatch */
    enqueue(batch: GPUParticleBatchSimulation): void;
    /** dispatches all queued compute work now */
    flush(): void;
    /**
     * Dispatches `nodes` right away (call {@link flush} first).
     * @returns whether the work ran (`false` before the renderer is initialized)
     */
    dispatch(nodes: N[]): boolean;
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

/**
 * Why a GPU simulated system emits its particles on the CPU (uploading each spawned particle), or `null` when they
 * are emitted on the GPU.
 */
export function getGPUEmissionSupport(system: GPUSimulatedSystem): string | null {
    const program = createGPUSimulationProgram(system);
    if (!program || !program.emission) return 'the particle system type emits on the CPU';
    return program.emission.support();
}

function nextPowerOfTwo(n: number): number {
    return 2 ** Math.ceil(Math.log2(Math.max(1, n)));
}

/** Most slots of one batch. */
const MAX_CAPACITY = 1 << 22;

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
    return Math.min(MAX_CAPACITY, Math.max(64, nextPowerOfTwo(slots)));
}

/** Whether a system's particles need the Noise slot of the particle layout. */
export function usesNoiseState(system: GPUSimulatedSystem): boolean {
    const program = createGPUSimulationProgram(system);
    return !!program && program.usesNoiseState();
}

/**
 * vec4 per system in the systems buffer of a batch (read when rendering):
 * 0-3 emitter matrix columns, 4 emitter scale (xyz), 5 emitter rotation (quaternion),
 * 6 (step delta, stepped flag, parameter row offset, compute group), 7 (speed factor, length factor, visible flag)
 */
export const GPU_SYSTEM_STRIDE = 8;
const CONTROL = 6;
const RENDER = 7;

/**
 * vec4 per system in the emitter buffer of a batch (read by the spawn and kill kernels):
 * 0-3 world matrix columns, 4-6 normal matrix columns, 7 (world scale xyz, kill flag), 8 world rotation
 */
export const GPU_EMITTER_STRIDE = 9;
const EMITTER_SCALE = 7;
const EMITTER_ROTATION = 8;

/** vec4 per emission call: (system, first spawn index, count, parameter row), (t, time, shape value, burst size), (seed) */
const RANGE_STRIDE = 3;
/** floats per pending emission call on the CPU: count, t, time, shape value, burst size */
const RANGE_VALUES = 5;

/**
 * Int counters of a batch (atomic, GPU side): free slots, high-water mark being computed by the shrink pass; then the
 * live particles of each system. The high-water mark itself (slots `[0, highWater)` hold every live particle) is the
 * `instanceCount` of the indirect draw arguments.
 */
export const GPU_COUNTER = {FREE: 0, NEXT_HIGH_WATER: 1, SYSTEMS: 4} as const;

/** The high-water mark shrinks (finalize + end kernels) every this many dispatches, and after kills. */
const SHRINK_INTERVAL = 32;

/** random streams of emission code start here (update code uses the streams from 0) */
const EMISSION_STREAMS = 1 << 16;

const tempPosition = new Vector3();
const tempRotation = new Quaternion();
const tempScale = new Vector3();
const tempNormal = new Matrix3();
const IDENTITY = new Matrix4();

/** Systems of a batch that share one kernel (their code has the same shape). */
export interface GPUComputeGroup {
    id: number;
    signature: string;
    members: Set<GPUSimulationMember>;
    node: N | null;
}

/** Systems of a batch that share one spawn kernel, with the emission calls of the next dispatch. */
interface GPUEmissionGroup extends GPUComputeGroup {
    /** uniforms: first range and number of ranges of the group in the range buffer */
    rangeStart: N;
    rangeCount: N;
    spawnCount: number;
}

/**
 * A system of a {@link GPUParticleBatchSimulation}: its {@link ParticleSimulationDelegate}, its parameter rows and an
 * estimate of its live particles.
 *
 * The GPU owns the particles (slots are allocated and freed by the kernels), so the CPU only knows an upper bound of
 * the live count: particles spawned within the last maximum lifetime, tightened by the per-system counters read back
 * from the GPU (a few frames late, plus what was spawned since).
 */
export class GPUSimulationMember implements ParticleSimulationDelegate {
    /** recorded parameters, watches and code signature of the system's update program */
    context!: GPUCompileContext;
    /** same for its emission program; `null` when the system emits on the CPU */
    emission: GPUCompileContext | null = null;
    /** watches of an emission program that is not supported (re-checked when one changes) */
    emissionWatch: GPUCompileContext | null = null;
    /** whether GPU emission was enabled when the emission was recorded */
    emissionEnabled = false;
    /** compute group (systems whose update code has the same shape) */
    group: GPUComputeGroup | null = null;
    /** spawn kernel group (systems whose emission code has the same shape) */
    emissionGroup: GPUComputeGroup | null = null;
    /** first float of the system's update parameters in the parameter buffer */
    parameterBase = 0;
    /** first float of the system's emission parameters */
    emissionBase = 0;
    /** stepped since the last dispatch */
    stepped = false;
    /**
     * Steps since the system last had live particles (upper bound). Its update kernel is skipped after a few: the
     * extra steps let the GPU age out particles whose float32 age lags the CPU clock.
     */
    idleSteps = 3;
    /** set when an edit invalidated the simulation; the host re-adds the system */
    invalidReason: string | null = null;
    /** emission calls since the last step ({@link RANGE_VALUES} floats each) */
    pendingRanges: number[] = [];
    /** emission calls of the steps since the last dispatch */
    stagedRanges: number[] = [];
    /** CPU spawn records in the batch's staging buffer since the last dispatch: (first, count) pairs */
    stagedRecords: number[] = [];
    /** the system's clock (sum of step durations) */
    time = 0;
    /** emitter world matrix last written to the emitter buffer (NaN: never) */
    readonly emitterMatrix = new Float64Array(16).fill(NaN);
    /** dispatch whose counter readback is the last one received, -1 for none */
    readDispatch = -1;
    /** live particles in that readback */
    readAlive = 0;
    /** readbacks of earlier dispatches do not describe this member's particles */
    minReadDispatch = 0;

    private expiries_: number[] = [];
    private expiryHead_ = 0;
    private bound_ = 0;
    private spawnLog_: number[] = [];

    constructor(
        readonly batch: GPUParticleBatchSimulation,
        readonly system: GPUSimulatedSystem,
        public index: number,
        readonly program: GPUSimulationProgram
    ) {}

    /** Upper bound of the number of live particles. */
    get liveCount(): number {
        let estimate = this.bound_;
        if (this.readDispatch >= 0) {
            let since = 0;
            const log = this.spawnLog_;
            for (let i = 0; i < log.length; i += 2) if (log[i] > this.readDispatch) since += log[i + 1];
            estimate = Math.min(estimate, this.readAlive + since);
        }
        return Math.max(0, estimate);
    }

    /** Records `count` particles spawned now that live at most `life` seconds, sent with dispatch `dispatch`. */
    addSpawns(count: number, life: number, dispatch: number) {
        if (count <= 0) return;
        const expiries = this.expiries_;
        // kept sorted: an expiry is never earlier than the previous one (only delays it: still an upper bound)
        const last = expiries.length > this.expiryHead_ ? expiries[expiries.length - 2] : -Infinity;
        expiries.push(Math.max(last, this.time + life), count);
        this.bound_ += count;
        const log = this.spawnLog_;
        if (log.length > 0 && log[log.length - 2] === dispatch) {
            log[log.length - 1] += count;
        } else {
            log.push(dispatch, count);
        }
    }

    /** Advances the system's clock; particles past their maximum lifetime leave the bound. */
    advance(delta: number) {
        this.time += delta;
        const expiries = this.expiries_;
        let head = this.expiryHead_;
        while (head < expiries.length && expiries[head] <= this.time) {
            this.bound_ -= expiries[head + 1];
            head += 2;
        }
        if (head > 64 && head * 2 > expiries.length) {
            expiries.splice(0, head);
            head = 0;
        }
        this.expiryHead_ = head;
    }

    /** All particles are gone (from dispatch `dispatch` on). */
    resetEstimate(dispatch: number) {
        this.expiries_.length = 0;
        this.expiryHead_ = 0;
        this.bound_ = 0;
        this.spawnLog_.length = 0;
        this.readDispatch = -1;
        this.minReadDispatch = dispatch;
    }

    /** Takes over the lifetime bound of `other` (its particles moved to this member). */
    copyEstimate(other: GPUSimulationMember) {
        this.resetEstimate(this.minReadDispatch);
        for (let i = other.expiryHead_; i < other.expiries_.length; i += 2) {
            this.expiries_.push(other.expiries_[i] - other.time + this.time, other.expiries_[i + 1]);
        }
        this.bound_ = other.bound_;
    }

    /** Applies a counter readback taken after dispatch `dispatch`. */
    applyReadback(alive: number, dispatch: number) {
        if (dispatch < this.minReadDispatch || dispatch <= this.readDispatch) return;
        this.readAlive = alive;
        this.readDispatch = dispatch;
        const log = this.spawnLog_;
        let drop = 0;
        while (drop < log.length && log[drop] <= dispatch) drop += 2;
        if (drop > 0) log.splice(0, drop);
    }

    emit(system: GPUSimulatedSystem, count: number, emissionState: EmissionState, matrix: unknown): boolean {
        void system;
        return this.batch.emitMember(this, count, emissionState, matrix);
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
 * GPU simulation of the particle systems of one batch: emission, slot allocation, update and death all run in compute
 * kernels.
 *
 * Systems with equal renderer settings share one particle buffer, one draw call (`GPUParticleBatch`) and, when their
 * code has the same shape, one update kernel and one spawn kernel; each particle record holds the index of its system.
 * Per-system values (emitter transform, step delta, shape parameters, curve keys, ...) live in small per-system
 * buffers, so systems that differ only in values (e.g. instances of one effect) run the same kernels.
 *
 * The CPU decides how many particles each system emits (rate, bursts, distance) and sends one *emission range* per
 * emission call; particles of systems the GPU cannot emit (custom shapes, sub-emitter children, ...) are emitted on
 * the CPU and uploaded as records. Per dispatch:
 * 1. a kill kernel removes the particles of cleared / removed systems;
 * 2. spawn kernels pop free slots from a GPU stack (atomics), initialize the particles and raise the high-water mark,
 *    which is the `instanceCount` of the batch's indirect draw (dead slots below it collapse to zero size);
 * 3. one update kernel per group runs the program of each particle's system, integrates and ages it; particles that
 *    die push their slot back on the stack;
 * 4. now and then (and after kills), finalize and end kernels shrink the high-water mark to the last live particle.
 *
 * Nothing waits for the GPU: the per-system live counters are read back asynchronously and only tighten
 * `particleNum` (see {@link GPUSimulationMember.liveCount}).
 */
export class GPUParticleBatchSimulation {
    readonly layout: GPUParticleLayout;
    /** particle records, `capacity * layout.stride` vec4 */
    state!: StorageBufferAttribute;
    /** per-system values read when rendering, {@link GPU_SYSTEM_STRIDE} vec4 per system */
    systems!: StorageBufferAttribute;
    /** indirect draw arguments (`instanceCount` = high-water mark), written by the finalize kernel */
    readonly drawArgs: IndirectStorageBufferAttribute;
    /** incremented when {@link state} or {@link systems} is replaced; materials reading them are rebuilt */
    generation = 0;
    readonly members: GPUSimulationMember[] = [];
    /** shared step counter (per-step random values) */
    readonly frame: N = uniform(0);
    /** free slots in the last counter readback (`null` before the first one) */
    stats: {free: number} | null = null;

    private capacity_: number;
    private deadList_!: StorageBufferAttribute;
    private counters_!: StorageBufferAttribute;
    private memberSlots_ = 0;
    private freeIndices_: number[] = [];
    private releasedIndices_: number[] = [];
    private killed_: number[] = [];
    private systemsData_!: Float32Array;
    private emitters_!: StorageBufferAttribute;
    private emittersData_!: Float32Array;
    private systemCapacity_ = 0;
    private params_!: StorageBufferAttribute;
    private paramsData_!: Float32Array;
    private paramCapacity_ = 0;
    private parameterSize_ = 0;
    private staging_!: StorageBufferAttribute;
    private stagingData_!: Float32Array;
    private stagingCapacity_ = 0;
    private stagingCount_ = 0;
    private ranges_!: StorageBufferAttribute;
    private rangesData_!: Float32Array;
    private rangeCapacity_ = 0;
    private rangeCount_ = 0;
    private readonly groups_ = new Map<string, GPUComputeGroup>();
    private readonly emissionGroups_ = new Map<string, GPUEmissionGroup>();
    private nextGroupId_ = 0;
    private pending_: N[] = [];
    private retired_: N[] = [];
    private queued_ = false;
    /** a buffer the kernels read was replaced: rebuild every kernel */
    private kernelsDirty_ = true;
    /** compute work ran: the GPU buffers, not the CPU arrays, hold the particles and counters */
    private onGPU_ = false;
    private dispatches_ = 0;
    /** number of nodes the last {@link takePending} returned */
    private taken_ = 0;
    /** the last dispatch ran work of this batch (its counters changed) */
    private dispatchedWork_ = false;
    private readback_: any = null;
    private readbackInFlight_ = false;
    private disposed_ = false;

    // storage nodes and fixed kernels of the current buffers
    private stateNode_: N = null;
    private systemsNode_: N = null;
    private emittersNode_: N = null;
    private paramsNode_: N = null;
    private countersNode_: N = null;
    private argsNode_: N = null;
    private deadNode_: N = null;
    private stagingNode_: N = null;
    private rangesNode_: N = null;
    private killNode_: N = null;
    private recordNode_: N = null;
    private finalizeNode_: N = null;
    private endNode_: N = null;

    constructor(
        layoutOptions: {mesh: boolean; noise: boolean},
        private readonly host: GPUSimulationHost,
        capacity = 1024
    ) {
        this.layout = createGPUParticleLayout(layoutOptions);
        this.capacity_ = Math.min(MAX_CAPACITY, nextPowerOfTwo(capacity));
        this.state = this.createState(this.capacity_);
        this.deadList_ = this.createFreeStack(this.capacity_);
        this.drawArgs = new IndirectStorageBufferAttribute(new Uint32Array(5), 5);
        this.resizeSystems(16);
        this.resizeParameters(256);
        this.resizeStaging(64);
        this.resizeRanges(16);
    }

    /** number of slots */
    get capacity(): number {
        return this.capacity_;
    }

    /** number of update kernels (groups of systems with differently shaped update code) */
    get groupCount(): number {
        return this.groups_.size;
    }

    /** number of spawn kernels (groups of systems with differently shaped emission code) */
    get emissionGroupCount(): number {
        return this.emissionGroups_.size;
    }

    /** Upper bound of the live particles of all systems. */
    get liveCount(): number {
        let count = 0;
        for (const member of this.members) count += member.liveCount;
        return count;
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

    /** Sets the vertex (or index) count of the drawn geometry in the indirect draw arguments. */
    setDrawCount(count: number) {
        const args = this.drawArgs.array as Uint32Array;
        if (args[0] === count) return;
        args[0] = count;
        this.drawArgs.needsUpdate = true;
    }

    // ---- membership ---------------------------------------------------------------------------------------

    /** Adds a system (with no particles yet) and returns its member. */
    addSystem(system: GPUSimulatedSystem): GPUSimulationMember {
        const program = createGPUSimulationProgram(system);
        if (!program) throw new Error('GPUParticleBatchSimulation: no GPU simulation program for this particle system');
        // grow ahead for the expected particles of the system
        this.ensureCapacity(estimateGPUCapacity(system));
        const index = this.freeIndices_.length > 0 ? this.freeIndices_.pop()! : this.memberSlots_++;
        if (index >= this.systemCapacity_) this.resizeSystems(this.systemCapacity_ * 2);
        const member = new GPUSimulationMember(this, system, index, program);
        member.minReadDispatch = this.dispatches_ + 1;
        this.members.push(member);
        this.record(member);
        this.layoutParameters();
        return member;
    }

    /** Removes a system; its particles disappear with the next dispatch. */
    removeSystem(member: GPUSimulationMember) {
        const at = this.members.indexOf(member);
        if (at === -1) return;
        this.dropStagedSpawns(member);
        this.flagKill(member);
        this.members.splice(at, 1);
        const control = (member.index * GPU_SYSTEM_STRIDE + CONTROL) * 4;
        this.systemsData_.fill(0, control, control + 4);
        this.systemsData_[control + 3] = -1;
        this.releasedIndices_.push(member.index);
        this.setGroup(this.groups_, member, 'group', null);
        this.setGroup(this.emissionGroups_, member, 'emissionGroup', null);
        this.layoutParameters();
        this.enqueue();
    }

    /**
     * Moves `member`'s live particles into `target` (same particle layout) as a new member there, then removes it
     * here. Used when a system's renderer settings move it to another batch.
     */
    transferTo(member: GPUSimulationMember, target: GPUParticleBatchSimulation): GPUSimulationMember {
        const system = member.system;
        target.ensureCapacity(member.liveCount);
        const moved = target.addSystem(system);
        moved.copyEstimate(member);
        // run the queued work of both batches (target growth included) before copying
        this.host.flush();
        if (this.onGPU_) {
            this.buildKernels();
            target.buildKernels();
            const transfer = this.createTransferKernel(member.index, target, moved.index);
            const nodes = [transfer, this.finalizeNode_, this.endNode_];
            if (this.host.dispatch(nodes)) target.onGPU_ = true;
            transfer.dispose();
        }
        this.removeSystem(member);
        return moved;
    }

    // ---- recording ----------------------------------------------------------------------------------------

    /** Runs `compile` on a throwaway TSL stack (recording contexts generate nodes nobody builds). */
    private recordOnStack(compile: () => void) {
        const previous = getCurrentStack();
        setCurrentStack(new (StackNode as any)());
        try {
            compile();
        } finally {
            setCurrentStack(previous);
        }
    }

    /**
     * Runs the system's programs in recording contexts: parameter layout and getters, structural watches and the
     * code signatures. The kernels later generate the same code for their group.
     */
    private record(member: GPUSimulationMember) {
        const system = member.system;
        const ctx = new GPUCompileContext(system.worldSpace, null, this.frame);
        member.program.watch(ctx);
        ctx.watch(() => system.rendererSettings.renderMode);
        this.recordOnStack(() => member.program.compile(ctx, this.recordingState(null)));
        member.context = ctx;
        this.setGroup(this.groups_, member, 'group', ctx.signature());
        this.recordEmission(member);
    }

    private recordEmission(member: GPUSimulationMember) {
        const system = member.system;
        const program = member.program.emission;
        const enabled = this.host.gpuEmission !== false && !!program;
        member.emissionEnabled = enabled;
        member.emission = null;
        member.emissionWatch = null;
        if (enabled && program) {
            const ctx = new GPUCompileContext(system.worldSpace, null, this.frame, EMISSION_STREAMS);
            program.watch(ctx);
            if (program.support() === null) {
                this.recordOnStack(() => program.compile(ctx, this.recordingState(null), this.recordingInput()));
                member.emission = ctx;
            } else {
                member.emissionWatch = ctx;
            }
        }
        const emission = member.emission as GPUCompileContext | null;
        this.setGroup(this.emissionGroups_, member, 'emissionGroup', emission ? emission.signature() : null);
    }

    /**
     * Re-records the emission when an edit (or the host's `gpuEmission` switch) changed it.
     * @returns whether the system emits on the GPU
     */
    private refreshEmission(member: GPUSimulationMember): boolean {
        const enabled = this.host.gpuEmission !== false && !!member.program.emission;
        const recorded = member.emission ?? member.emissionWatch;
        if (member.emissionEnabled === enabled && (recorded ? !recorded.isStale() : !enabled)) {
            return member.emission !== null;
        }
        this.recordEmission(member);
        this.layoutParameters();
        return member.emission !== null;
    }

    /** Particle variables for recording (`p === null`) or for a kernel (initial values of a spawned particle). */
    private recordingState(seed: N): GPUParticleState {
        const layout = this.layout;
        return {
            layout,
            position: vec3(0).toVar(),
            age: float(0).toVar(),
            velocity: vec3(0).toVar(),
            life: float(1).toVar(),
            color: vec4(1).toVar(),
            size: vec3(1).toVar(),
            rotation: float(0).toVar(),
            quaternion: layout.quaternion >= 0 ? vec4(0, 0, 0, 1).toVar() : null,
            startColor: vec4(1).toVar(),
            startSize: vec3(1).toVar(),
            seed: seed ?? uint(0),
            startSpeed: float(0).toVar(),
            speedModifier: float(1).toVar(),
            uvTile: float(0).toVar(),
            noise: layout.noise >= 0 ? vec4(0).toVar() : null,
            noiseQuaternion: layout.noiseQuaternion >= 0 ? vec4(0, 0, 0, 1).toVar() : null,
            t: float(0),
        };
    }

    private recordingInput(): GPUEmissionInput {
        return {
            t: float(0),
            time: float(0),
            shapeValue: float(0),
            burstIndex: float(0),
            burstCount: float(0),
            matrix: [vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1), vec3(0)],
            normalMatrix: [vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1)],
            scale: vec3(1),
            rotation: vec4(0, 0, 0, 1),
        };
    }

    private setGroup(
        groups: Map<string, GPUComputeGroup>,
        member: GPUSimulationMember,
        key: 'group' | 'emissionGroup',
        signature: string | null
    ) {
        const current = member[key];
        if (current && current.signature === signature) return;
        if (current) {
            // the group's kernel stays valid while other members use it (its code does not depend on the member)
            current.members.delete(member);
            if (current.members.size === 0) {
                groups.delete(current.signature);
                if (current.node) this.retired_.push(current.node);
                current.node = null;
            }
        }
        member[key] = null;
        if (signature === null) return;
        let group = groups.get(signature);
        if (!group) {
            // a new kind of system: only its kernel is built (on the next dispatch)
            group = {id: this.nextGroupId_++, signature, members: new Set(), node: null};
            if (key === 'emissionGroup') {
                Object.assign(group, {rangeStart: uniform(0, 'uint'), rangeCount: uniform(0, 'uint'), spawnCount: 0});
            }
            groups.set(signature, group);
        }
        group.members.add(member);
        member[key] = group;
    }

    /** Parameter rows: one per member (update parameters, then emission parameters), back to back. */
    private layoutParameters() {
        let base = 0;
        for (const member of this.members) {
            member.parameterBase = base;
            base += member.context.parameterSize;
            member.emissionBase = base;
            if (member.emission) base += member.emission.parameterSize;
        }
        this.parameterSize_ = base;
        if (base > this.paramCapacity_) this.resizeParameters(nextPowerOfTwo(base));
        for (const member of this.members) {
            const control = (member.index * GPU_SYSTEM_STRIDE + CONTROL) * 4;
            this.systemsData_[control + 2] = member.parameterBase;
            this.systemsData_[control + 3] = member.group ? member.group.id : -1;
            // rows moved: refresh them before the next dispatch
            this.writeParameters(member);
        }
    }

    private writeParameters(member: GPUSimulationMember) {
        member.context.writeParameters(this.paramsData_, member.parameterBase);
        if (member.emission) member.emission.writeParameters(this.paramsData_, member.emissionBase);
    }

    // ---- emitting and stepping ----------------------------------------------------------------------------

    /**
     * An emission call of a member's system (`ParticleSystem.spawn()`).
     * @returns `false` when the particles have to be emitted on the CPU
     */
    emitMember(member: GPUSimulationMember, count: number, emissionState: EmissionState, matrix: unknown): boolean {
        if (count <= 0) return true;
        if (this.disposed_ || member.invalidReason !== null) return false;
        // sub-emitter children are emitted at their parent particle: not the emitter transform the GPU knows
        if (matrix !== (member.system.emitter as any).matrixWorld) return false;
        if (!this.refreshEmission(member)) return false;
        const ranges = member.pendingRanges;
        ranges.push(count);
        member.program.emission!.rangeValues(emissionState, ranges);
        ranges.push(emissionState.isBursting ? emissionState.burstParticleCount : 0);
        return true;
    }

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
        } else if (member.emission && member.emission.isStale()) {
            this.refreshEmission(member);
        }
        const next = this.dispatches_ + 1;

        // particles emitted on the CPU: upload their records (they keep their age)
        if (spawnCount > 0) {
            const stride = this.layout.stride * 4;
            if (this.stagingCount_ + spawnCount > this.stagingCapacity_)
                this.resizeStaging(this.stagingCount_ + spawnCount);
            const records = this.stagingData_;
            const particles = system.particles;
            let maxRemaining = 0;
            member.stagedRecords.push(this.stagingCount_, spawnCount);
            for (let i = 0; i < spawnCount; i++) {
                const particle = particles[i];
                writeSpawnRecord(
                    records,
                    this.stagingCount_++ * stride,
                    this.layout,
                    particle,
                    member.index,
                    Math.floor(Math.random() * GPU_SEED_RANGE)
                );
                maxRemaining = Math.max(maxRemaining, particle.life - particle.age);
            }
            member.addSpawns(spawnCount, maxRemaining, next);
        }

        // particles emitted on the GPU
        const pending = member.pendingRanges;
        if (pending.length > 0) {
            let count = 0;
            if (member.emission) {
                for (let i = 0; i < pending.length; i += RANGE_VALUES) count += pending[i];
                for (let i = 0; i < pending.length; i++) member.stagedRanges.push(pending[i]);
                member.addSpawns(count, member.program.emission!.maxLife(), next);
                this.writeEmitter(member);
            }
            pending.length = 0;
        }

        member.idleSteps = member.liveCount > 0 ? 0 : member.idleSteps + 1;
        member.advance(delta);
        const control = (member.index * GPU_SYSTEM_STRIDE + CONTROL) * 4;
        this.systemsData_[control] = delta;
        this.systemsData_[control + 1] = 1;
        this.writeParameters(member);
        member.stepped = true;
        this.enqueue();
        return member.liveCount;
    }

    /** Removes all particles of a member (restart / stop). */
    clearMember(member: GPUSimulationMember) {
        this.dropStagedSpawns(member);
        this.flagKill(member);
        member.resetEstimate(this.dispatches_ + 1);
        this.enqueue();
    }

    /** Forgets the member's spawns that did not reach the GPU yet. */
    private dropStagedSpawns(member: GPUSimulationMember) {
        member.pendingRanges.length = 0;
        member.stagedRanges.length = 0;
        const stride = this.layout.stride * 4;
        const records = member.stagedRecords;
        for (let i = 0; i < records.length; i += 2) {
            for (let k = records[i]; k < records[i] + records[i + 1]; k++) {
                // a record with no life left is skipped by the record kernel
                this.stagingData_[k * stride + GPU_SLOT.VELOCITY_LIFE * 4 + 3] = -1;
            }
        }
        records.length = 0;
    }

    /** The kill kernel of the next dispatch removes the member's particles. */
    private flagKill(member: GPUSimulationMember) {
        this.emittersData_[(member.index * GPU_EMITTER_STRIDE + EMITTER_SCALE) * 4 + 3] = 1;
        this.killed_.push(member.index);
    }

    /** Emitter transform of a member (spawn kernels of world space systems), when it changed. */
    private writeEmitter(member: GPUSimulationMember) {
        if (!member.system.worldSpace) return;
        const emitter = member.system.emitter as any;
        const matrix: Matrix4 = emitter.matrixWorld ?? IDENTITY;
        const e = matrix.elements;
        const last = member.emitterMatrix;
        let same = true;
        for (let k = 0; k < 16 && same; k++) same = last[k] === e[k];
        if (same) return;
        for (let k = 0; k < 16; k++) last[k] = e[k];
        const o = member.index * GPU_EMITTER_STRIDE * 4;
        const data = this.emittersData_;
        for (let c = 0; c < 4; c++) {
            data[o + c * 4] = e[c * 4];
            data[o + c * 4 + 1] = e[c * 4 + 1];
            data[o + c * 4 + 2] = e[c * 4 + 2];
        }
        const n = tempNormal.getNormalMatrix(matrix).elements;
        for (let c = 0; c < 3; c++) {
            data[o + 16 + c * 4] = n[c * 3];
            data[o + 16 + c * 4 + 1] = n[c * 3 + 1];
            data[o + 16 + c * 4 + 2] = n[c * 3 + 2];
        }
        matrix.decompose(tempPosition, tempRotation, tempScale);
        const s = o + EMITTER_SCALE * 4;
        data[s] = tempScale.x;
        data[s + 1] = tempScale.y;
        data[s + 2] = tempScale.z;
        const r = o + EMITTER_ROTATION * 4;
        data[r] = tempRotation.x;
        data[r + 1] = tempRotation.y;
        data[r + 2] = tempRotation.z;
        data[r + 3] = tempRotation.w;
    }

    private enqueue() {
        if (this.queued_ || this.disposed_) return;
        this.queued_ = true;
        this.host.enqueue(this);
    }

    /** Grows the buffers when the live particles (upper bound) plus `extra` may not fit. */
    private ensureCapacity(extra: number) {
        const required = this.liveCount + extra;
        if (required > this.capacity_ && this.capacity_ < MAX_CAPACITY) {
            this.grow(Math.min(MAX_CAPACITY, nextPowerOfTwo(required * 1.25)));
        }
    }

    /** Compute nodes for the next dispatch, in order. Call {@link afterDispatch} once they ran. */
    takePending(): N[] {
        if (this.disposed_) return [];
        this.ensureCapacity(0);
        this.writeRanges();
        this.buildKernels();
        const nodes = this.pending_;
        this.pending_ = [];
        let active = false;
        if (this.killed_.length > 0) {
            nodes.push(this.killNode_);
            active = true;
        }
        if (this.stagingCount_ > 0) {
            this.staging_.clearUpdateRanges();
            this.staging_.addUpdateRange(0, this.stagingCount_ * this.layout.stride * 4);
            this.staging_.needsUpdate = true;
            this.recordNode_.count = this.stagingCount_;
            nodes.push(this.recordNode_);
            active = true;
        }
        if (this.rangeCount_ > 0) {
            this.ranges_.clearUpdateRanges();
            this.ranges_.addUpdateRange(0, this.rangeCount_ * RANGE_STRIDE * 4);
            this.ranges_.needsUpdate = true;
            for (const group of this.emissionGroups_.values()) {
                if (group.spawnCount === 0 || !group.node) continue;
                group.node.count = group.spawnCount;
                nodes.push(group.node);
                active = true;
            }
        }
        this.uploadSystems();
        this.uploadEmitters();
        if (this.parameterSize_ > 0) {
            this.params_.clearUpdateRanges();
            this.params_.addUpdateRange(0, this.parameterSize_);
            this.params_.needsUpdate = true;
        }
        for (const group of this.groups_.values()) {
            let stepped = false;
            for (const member of group.members) stepped ||= member.stepped && member.idleSteps <= 2;
            if (stepped && group.node) {
                nodes.push(group.node);
                active = true;
            }
        }
        // the high-water mark only grows in between (spawns raise it): shrink it now and then
        if (active && (this.killed_.length > 0 || this.dispatches_ % SHRINK_INTERVAL === 0)) {
            nodes.push(this.finalizeNode_, this.endNode_);
        }
        this.taken_ = nodes.length;
        return nodes;
    }

    /** Writes the staged emission calls of every emission group into the range buffer. */
    private writeRanges() {
        let total = 0;
        for (const member of this.members) total += member.stagedRanges.length / RANGE_VALUES;
        this.rangeCount_ = 0;
        if (total === 0) {
            for (const group of this.emissionGroups_.values()) group.spawnCount = 0;
            return;
        }
        if (total > this.rangeCapacity_) this.resizeRanges(total);
        const data = this.rangesData_;
        let n = 0;
        for (const group of this.emissionGroups_.values()) {
            const first = n;
            let spawned = 0;
            for (const member of group.members) {
                const staged = member.stagedRanges;
                for (let i = 0; i < staged.length; i += RANGE_VALUES) {
                    const o = n++ * RANGE_STRIDE * 4;
                    data[o] = member.index;
                    data[o + 1] = spawned;
                    data[o + 2] = staged[i];
                    data[o + 3] = member.emissionBase;
                    data[o + 4] = staged[i + 1];
                    data[o + 5] = staged[i + 2];
                    data[o + 6] = staged[i + 3];
                    data[o + 7] = staged[i + 4];
                    data[o + 8] = Math.floor(Math.random() * GPU_SEED_RANGE);
                    spawned += staged[i];
                }
            }
            group.rangeStart.value = first;
            group.rangeCount.value = n - first;
            group.spawnCount = spawned;
        }
        // members whose emission was disabled since: their calls are dropped
        for (const member of this.members) member.stagedRanges.length = 0;
        this.rangeCount_ = n;
    }

    /**
     * Resets the per-dispatch state after {@link takePending}'s nodes ran.
     * @param ran whether the nodes were dispatched (`false`: dropped before the renderer was initialized)
     */
    afterDispatch(ran = true) {
        this.dispatchedWork_ = ran && this.taken_ > 0;
        if (this.dispatchedWork_) this.onGPU_ = true;
        this.taken_ = 0;
        for (const member of this.members) {
            member.stagedRecords.length = 0;
            if (!member.stepped) continue;
            member.stepped = false;
            const control = (member.index * GPU_SYSTEM_STRIDE + CONTROL) * 4;
            this.systemsData_[control] = 0;
            this.systemsData_[control + 1] = 0;
        }
        for (const index of this.killed_) {
            this.emittersData_[(index * GPU_EMITTER_STRIDE + EMITTER_SCALE) * 4 + 3] = 0;
        }
        this.killed_.length = 0;
        this.stagingCount_ = 0;
        this.rangeCount_ = 0;
        for (const index of this.releasedIndices_) this.freeIndices_.push(index);
        this.releasedIndices_.length = 0;
        for (const node of this.retired_) node.dispose();
        this.retired_.length = 0;
        this.frame.value = (this.frame.value + 1) % GPU_SEED_RANGE;
        this.dispatches_++;
        this.queued_ = false;
    }

    /**
     * Reads the GPU counters back (asynchronously, at most one readback in flight) to tighten each system's
     * `particleNum`. Call right after the dispatch.
     */
    readCounters(renderer: any) {
        if (this.readbackInFlight_ || this.disposed_ || !this.dispatchedWork_) return;
        if (!renderer || typeof renderer.getArrayBufferAsync !== 'function') return;
        const dispatch = this.dispatches_;
        const counters = this.counters_;
        const byteLength = (counters.array as Int32Array).byteLength;
        let target: any = null;
        if (ReadbackBufferClass) {
            if (!this.readback_ || this.readback_.maxByteLength < byteLength) {
                if (this.readback_) this.readback_.dispose();
                this.readback_ = new ReadbackBufferClass(byteLength);
            }
            target = this.readback_;
        }
        this.readbackInFlight_ = true;
        let request: Promise<any>;
        try {
            request = Promise.resolve(renderer.getArrayBufferAsync(counters, target, 0, byteLength));
        } catch (error) {
            this.readbackInFlight_ = false;
            return;
        }
        request
            .then((result: any) => {
                // the ReadbackBuffer holding the mapped range, or an ArrayBuffer
                const buffer: ArrayBuffer | null = result && result.isReadbackBuffer ? result.buffer : (result ?? null);
                if (buffer && !this.disposed_)
                    this.applyReadback(new Int32Array(buffer.slice(0, byteLength)), dispatch);
                if (target) target.release();
            })
            .catch(() => undefined)
            .finally(() => {
                this.readbackInFlight_ = false;
            });
    }

    private applyReadback(counters: Int32Array, dispatch: number) {
        this.stats = {free: counters[GPU_COUNTER.FREE]};
        for (const member of this.members) {
            const at = GPU_COUNTER.SYSTEMS + member.index;
            if (at < counters.length) member.applyReadback(counters[at], dispatch);
        }
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

    private uploadEmitters() {
        this.emitters_.clearUpdateRanges();
        this.emitters_.addUpdateRange(0, Math.max(1, this.memberSlots_) * GPU_EMITTER_STRIDE * 4);
        this.emitters_.needsUpdate = true;
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
        for (const node of [this.killNode_, this.recordNode_, this.finalizeNode_, this.endNode_, ...this.retired_]) {
            node?.dispose();
        }
        for (const group of this.groups_.values()) group.node?.dispose();
        for (const group of this.emissionGroups_.values()) group.node?.dispose();
        this.retired_.length = 0;
        if (this.readback_ && !this.readbackInFlight_) this.readback_.dispose();
    }

    // ---- buffers ------------------------------------------------------------------------------------------

    private createState(capacity: number): StorageBufferAttribute {
        return new StorageBufferAttribute(new Float32Array(capacity * this.layout.stride * 4), 4);
    }

    /** Stack of free slots, slot 0 on top. */
    private createFreeStack(capacity: number): StorageBufferAttribute {
        const slots = new Uint32Array(capacity);
        for (let k = 0; k < capacity; k++) slots[k] = capacity - 1 - k;
        return new StorageBufferAttribute(slots, 1);
    }

    private resizeSystems(capacity: number) {
        const data = new Float32Array(capacity * GPU_SYSTEM_STRIDE * 4);
        if (this.systemsData_) data.set(this.systemsData_);
        // unused rows belong to no compute group
        for (let i = this.systemCapacity_; i < capacity; i++) data[(i * GPU_SYSTEM_STRIDE + CONTROL) * 4 + 3] = -1;
        this.systemsData_ = data;
        this.systems = new StorageBufferAttribute(data, 4);

        const emitters = new Float32Array(capacity * GPU_EMITTER_STRIDE * 4);
        if (this.emittersData_) emitters.set(this.emittersData_);
        this.emittersData_ = emitters;
        this.emitters_ = new StorageBufferAttribute(emitters, 4);

        const previous = this.counters_;
        const counters = new Int32Array(GPU_COUNTER.SYSTEMS + capacity);
        if (!previous) {
            counters[GPU_COUNTER.FREE] = this.capacity_;
        } else if (!this.onGPU_) {
            counters.set(previous.array as Int32Array);
        }
        this.counters_ = new StorageBufferAttribute(counters, 1);
        if (previous && this.onGPU_) {
            const source = (storage as any)(previous, 'int', previous.count).toAtomic();
            const target = (storage as any)(this.counters_, 'int', counters.length).toAtomic();
            const copy = Fn(() => {
                atomicStore(target.element(instanceIndex), atomicLoad(source.element(instanceIndex)));
            })().compute(previous.count);
            this.pending_.push(copy);
            this.retired_.push(copy);
            this.enqueue();
        }
        this.systemCapacity_ = capacity;
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
        const stride = this.layout.stride * 4;
        const data = new Float32Array(capacity * stride);
        if (this.stagingData_) data.set(this.stagingData_.subarray(0, this.stagingCount_ * stride));
        this.stagingData_ = data;
        this.stagingCapacity_ = capacity;
        this.staging_ = new StorageBufferAttribute(data, 4);
        this.kernelsDirty_ = true;
    }

    private resizeRanges(count: number) {
        const capacity = nextPowerOfTwo(Math.max(16, count));
        this.rangesData_ = new Float32Array(capacity * RANGE_STRIDE * 4);
        this.rangeCapacity_ = capacity;
        this.ranges_ = new StorageBufferAttribute(this.rangesData_, 4);
        this.kernelsDirty_ = true;
    }

    /**
     * Grows the particle buffer. Live particles are copied and the new slots go to the bottom of the free stack (so
     * the old free slots, all below the high-water mark, are used first) by kernels that run first in the next
     * dispatch.
     */
    private grow(capacity: number) {
        const oldCapacity = this.capacity_;
        if (capacity <= oldCapacity) return;
        const S = this.layout.stride;
        const previousState = this.state;
        const previousFree = this.deadList_;
        this.capacity_ = capacity;
        this.state = this.createState(capacity);
        this.deadList_ = this.createFreeStack(capacity);
        if (this.onGPU_ || this.pending_.length > 0) {
            const added = capacity - oldCapacity;
            const counters = (storage as any)(this.counters_, 'int', this.counters_.count).toAtomic();
            const sourceState = (storage as any)(previousState, 'vec4', oldCapacity * S).toReadOnly();
            const targetState = (storage as any)(this.state, 'vec4', capacity * S);
            const copyState = Fn(() => {
                targetState.element(instanceIndex).assign(sourceState.element(instanceIndex));
            })().compute(oldCapacity * S);
            const sourceFree = (storage as any)(previousFree, 'uint', oldCapacity).toReadOnly();
            const targetFree = (storage as any)(this.deadList_, 'uint', capacity);
            const moveFree = Fn(() => {
                const k = (instanceIndex as N).toVar();
                const free = atomicLoad(counters.element(GPU_COUNTER.FREE)).toUint();
                (If as N)(k.lessThan(added), () => {
                    targetFree.element(k).assign(uint(capacity - 1).sub(k));
                }).ElseIf(k.sub(added).lessThan(free), () => {
                    targetFree.element(k).assign(sourceFree.element(k.sub(added)));
                });
            })().compute(capacity);
            const addFree = Fn(() => {
                atomicAdd(counters.element(GPU_COUNTER.FREE), int(added));
            })().compute(1);
            this.pending_.push(copyState, moveFree, addFree);
            this.retired_.push(copyState, moveFree, addFree);
        } else {
            (this.counters_.array as Int32Array)[GPU_COUNTER.FREE] = capacity;
            this.counters_.needsUpdate = true;
        }
        this.kernelsDirty_ = true;
        this.generation++;
        this.enqueue();
    }

    // ---- kernels ------------------------------------------------------------------------------------------

    /** Builds the kernels that are missing or read a replaced buffer. */
    private buildKernels() {
        if (this.kernelsDirty_) {
            this.stateNode_ = (storage as any)(this.state, 'vec4', this.state.count);
            this.systemsNode_ = (storage as any)(this.systems, 'vec4', this.systems.count).toReadOnly();
            this.emittersNode_ = (storage as any)(this.emitters_, 'vec4', this.emitters_.count).toReadOnly();
            this.paramsNode_ = (storage as any)(this.params_, 'float', this.params_.count).toReadOnly();
            this.countersNode_ = (storage as any)(this.counters_, 'int', this.counters_.count).toAtomic();
            this.argsNode_ = (storage as any)(this.drawArgs, 'uint', 5).toAtomic();
            this.deadNode_ = (storage as any)(this.deadList_, 'uint', this.deadList_.count);
            this.stagingNode_ = (storage as any)(this.staging_, 'vec4', this.staging_.count).toReadOnly();
            this.rangesNode_ = (storage as any)(this.ranges_, 'vec4', this.ranges_.count).toReadOnly();
            for (const node of [this.killNode_, this.recordNode_, this.finalizeNode_, this.endNode_]) {
                if (node) this.retired_.push(node);
            }
            for (const groups of [this.groups_, this.emissionGroups_]) {
                for (const group of groups.values()) {
                    if (group.node) this.retired_.push(group.node);
                    group.node = null;
                }
            }
            this.killNode_ = this.buildKillKernel();
            this.recordNode_ = this.buildRecordKernel();
            this.finalizeNode_ = this.buildFinalizeKernel();
            this.endNode_ = this.buildEndKernel();
            this.kernelsDirty_ = false;
        }
        for (const group of this.groups_.values()) {
            if (!group.node) group.node = this.buildUpdateKernel(group);
        }
        for (const group of this.emissionGroups_.values()) {
            if (!group.node) group.node = this.buildEmissionKernel(group);
        }
    }

    /**
     * Pops a free slot (`If` body receives it) and raises the high-water mark (the draw's instance count) over it; a
     * full batch drops the particle.
     */
    private allocate(counters: N, free: N, args: N, body: (slot: N) => void) {
        const old = atomicSub(counters.element(GPU_COUNTER.FREE), int(1));
        (If as N)(old.greaterThan(0), () => {
            const slot = free.element(old.sub(1).toUint()).toVar();
            body(slot);
            atomicMax(args.element(1), slot.add(1));
        }).Else(() => {
            atomicAdd(counters.element(GPU_COUNTER.FREE), int(1));
        });
    }

    /** Pushes `slot` on the free stack and counts the particle out of its system. */
    private release(counters: N, free: N, slot: N, system: N) {
        const top = atomicAdd(counters.element(GPU_COUNTER.FREE), int(1));
        free.element(top.toUint()).assign(slot);
        atomicSub(counters.element(system.add(GPU_COUNTER.SYSTEMS)), int(1));
    }

    /** Kills the particles of the systems flagged in the emitter buffer (cleared / removed systems). */
    private buildKillKernel(): N {
        const S = this.layout.stride;
        const state = this.stateNode_;
        const emitters = this.emittersNode_;
        const counters = this.countersNode_;
        const args = this.argsNode_;
        const free = this.deadNode_;
        return Fn(() => {
            const slot = (instanceIndex as N).toVar();
            const highWater = atomicLoad(args.element(1));
            (If as N)(slot.lessThan(highWater), () => {
                const base = slot.mul(S).toVar();
                const head = state.element(base.add(GPU_SLOT.POSITION_AGE));
                const motion = state.element(base.add(GPU_SLOT.VELOCITY_LIFE)).toVar();
                const system = state.element(base.add(GPU_SLOT.START_SIZE)).w.toUint().toVar();
                const flagged = emitters.element(system.mul(GPU_EMITTER_STRIDE).add(EMITTER_SCALE)).w.greaterThan(0.5);
                (If as N)(head.w.lessThan(motion.w).and(flagged), () => {
                    state.element(base.add(GPU_SLOT.VELOCITY_LIFE)).assign(vec4(motion.xyz, -1));
                    this.release(counters, free, slot, system);
                });
            });
        })().compute(this.capacity_);
    }

    /** Copies the records of particles emitted on the CPU into free slots. */
    private buildRecordKernel(): N {
        const S = this.layout.stride;
        const state = this.stateNode_;
        const staging = this.stagingNode_;
        const counters = this.countersNode_;
        const args = this.argsNode_;
        const free = this.deadNode_;
        return Fn(() => {
            const source = (instanceIndex as N).mul(S).toVar();
            const head = staging.element(source.add(GPU_SLOT.POSITION_AGE));
            const motion = staging.element(source.add(GPU_SLOT.VELOCITY_LIFE));
            (If as N)(head.w.lessThan(motion.w), () => {
                this.allocate(counters, free, args, (slot) => {
                    const target = slot.mul(S).toVar();
                    for (let k = 0; k < S; k++) state.element(target.add(k)).assign(staging.element(source.add(k)));
                    const system = staging.element(source.add(GPU_SLOT.START_SIZE)).w.toUint();
                    atomicAdd(counters.element(system.add(GPU_COUNTER.SYSTEMS)), int(1));
                });
            });
        })().compute(this.stagingCapacity_);
    }

    /** Finds the slot after the last live particle (the shrunk high-water mark). */
    private buildFinalizeKernel(): N {
        const S = this.layout.stride;
        const state = this.stateNode_;
        const counters = this.countersNode_;
        const args = this.argsNode_;
        return Fn(() => {
            const slot = (instanceIndex as N).toVar();
            const highWater = atomicLoad(args.element(1));
            (If as N)(slot.lessThan(highWater), () => {
                const base = slot.mul(S);
                const head = state.element(base.add(GPU_SLOT.POSITION_AGE));
                const motion = state.element(base.add(GPU_SLOT.VELOCITY_LIFE));
                (If as N)(head.w.lessThan(motion.w), () => {
                    atomicMax(counters.element(GPU_COUNTER.NEXT_HIGH_WATER), slot.toInt().add(1));
                });
            });
        })().compute(this.capacity_);
    }

    /** One thread: publishes the shrunk high-water mark as the draw's instance count. */
    private buildEndKernel(): N {
        const counters = this.countersNode_;
        const args = this.argsNode_;
        return Fn(() => {
            const highWater = atomicLoad(counters.element(GPU_COUNTER.NEXT_HIGH_WATER)).toVar();
            atomicStore(counters.element(GPU_COUNTER.NEXT_HIGH_WATER), int(0));
            atomicStore(args.element(1), highWater.toUint());
        })().compute(1);
    }

    /** Moves the live particles of system `from` into `target` as its system `to` (same layout). */
    private createTransferKernel(from: number, target: GPUParticleBatchSimulation, to: number): N {
        const S = this.layout.stride;
        const state = this.stateNode_;
        const counters = this.countersNode_;
        const args = this.argsNode_;
        const free = this.deadNode_;
        const targetState = target.stateNode_;
        const targetCounters = target.countersNode_;
        const targetArgs = target.argsNode_;
        const targetFree = target.deadNode_;
        return Fn(() => {
            const slot = (instanceIndex as N).toVar();
            const highWater = atomicLoad(args.element(1));
            (If as N)(slot.lessThan(highWater), () => {
                const base = slot.mul(S).toVar();
                const head = state.element(base.add(GPU_SLOT.POSITION_AGE));
                const motion = state.element(base.add(GPU_SLOT.VELOCITY_LIFE)).toVar();
                const system = state.element(base.add(GPU_SLOT.START_SIZE)).w;
                (If as N)(head.w.lessThan(motion.w).and(system.equal(float(from))), () => {
                    this.allocate(targetCounters, targetFree, targetArgs, (destination) => {
                        const to4 = destination.mul(S).toVar();
                        for (let k = 0; k < S; k++) {
                            const value = state.element(base.add(k));
                            targetState
                                .element(to4.add(k))
                                .assign(k === GPU_SLOT.START_SIZE ? vec4(value.xyz, float(to)) : value);
                        }
                        atomicAdd(targetCounters.element(GPU_COUNTER.SYSTEMS + to), int(1));
                    });
                    state.element(base.add(GPU_SLOT.VELOCITY_LIFE)).assign(vec4(motion.xyz, -1));
                    this.release(counters, free, slot, uint(from));
                });
            });
        })().compute(this.capacity_);
    }

    /** Spawn kernel of an emission group: one thread per particle emitted by the group's systems. */
    private buildEmissionKernel(group: GPUEmissionGroup): N {
        const representative = group.members.values().next().value as GPUSimulationMember;
        const program = representative.program.emission!;
        const worldSpace = representative.system.worldSpace;
        const layout = this.layout;
        const S = layout.stride;
        const state = this.stateNode_;
        const emitters = this.emittersNode_;
        const params = this.paramsNode_;
        const ranges = this.rangesNode_;
        const counters = this.countersNode_;
        const args = this.argsNode_;
        const free = this.deadNode_;
        const frame = this.frame;
        const searchSteps = Math.ceil(Math.log2(this.rangeCapacity_)) + 1;

        return Fn(() => {
            const k = float(instanceIndex as N).toVar();
            // the range of this particle: the last one of the group whose first spawn index is <= k
            const lo = group.rangeStart.toVar();
            const hi = group.rangeStart.add(group.rangeCount).sub(1).toVar();
            (Loop as N)(searchSteps, () => {
                const mid = lo.add(hi).add(1).div(2).toVar();
                (If as N)(ranges.element(mid.mul(RANGE_STRIDE)).y.lessThanEqual(k), () => {
                    lo.assign(mid);
                }).Else(() => {
                    hi.assign(mid.sub(1));
                });
            });
            const r = lo.mul(RANGE_STRIDE).toVar();
            const call = ranges.element(r).toVar();
            const values = ranges.element(r.add(1)).toVar();
            const local = k.sub(call.y).toVar();
            const system = call.x.toUint().toVar();
            const seedBase = ranges.element(r.add(2)).x.toUint();
            const seed = floor(hash(seedBase.add(local.toUint())).mul(GPU_SEED_RANGE)).toVar();

            const p = this.recordingState(seed.toUint());
            const ctx = new GPUCompileContext(worldSpace, {params, base: call.w.toUint()}, frame, EMISSION_STREAMS);
            ctx.seed = p.seed;
            const row = (n: number) => emitters.element(system.mul(GPU_EMITTER_STRIDE).add(n));
            program.compile(ctx, p, {
                t: values.x,
                time: values.y,
                shapeValue: values.z,
                burstIndex: local,
                burstCount: values.w,
                matrix: [row(0).xyz, row(1).xyz, row(2).xyz, row(3).xyz],
                normalMatrix: [row(4).xyz, row(5).xyz, row(6).xyz],
                scale: row(EMITTER_SCALE).xyz,
                rotation: row(EMITTER_ROTATION),
            });
            // a particle with no life left is not spawned (it would hold a slot nobody frees)
            (If as N)(p.life.greaterThan(0), () =>
                this.allocate(counters, free, args, (slot) => {
                    const target = slot.mul(S).toVar();
                    const at = (n: number) => state.element(target.add(n));
                    at(GPU_SLOT.POSITION_AGE).assign(vec4(p.position, 0));
                    at(GPU_SLOT.VELOCITY_LIFE).assign(vec4(p.velocity, p.life));
                    at(GPU_SLOT.COLOR).assign(p.color);
                    at(GPU_SLOT.SIZE_ROTATION).assign(vec4(p.size, p.rotation));
                    at(GPU_SLOT.START_COLOR).assign(p.startColor);
                    at(GPU_SLOT.START_SIZE).assign(vec4(p.startSize, float(system)));
                    at(GPU_SLOT.MISC).assign(vec4(seed, p.startSpeed, 1, p.uvTile));
                    if (layout.quaternion >= 0) at(layout.quaternion).assign(p.quaternion);
                    if (layout.noise >= 0) at(layout.noise).assign(vec4(0));
                    if (layout.noiseQuaternion >= 0) at(layout.noiseQuaternion).assign(vec4(0, 0, 0, 1));
                    atomicAdd(counters.element(system.add(GPU_COUNTER.SYSTEMS)), int(1));
                })
            );
        })().compute(Math.max(1, group.spawnCount));
    }

    private buildUpdateKernel(group: GPUComputeGroup): N {
        const representative = group.members.values().next().value as GPUSimulationMember;
        const program = representative.program;
        const worldSpace = representative.system.worldSpace;
        const layout = this.layout;
        const S = layout.stride;
        const state = this.stateNode_;
        const systems = this.systemsNode_;
        const params = this.paramsNode_;
        const counters = this.countersNode_;
        const args = this.argsNode_;
        const free = this.deadNode_;
        const frame = this.frame;

        return Fn(() => {
            const slot = (instanceIndex as N).toVar();
            const highWater = atomicLoad(args.element(1));
            (If as N)(slot.lessThan(highWater), () => {
                const base = slot.mul(S).toVar();
                const at = (n: number) => state.element(base.add(n));
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
                    // died this step: the slot goes back on the free stack
                    (If as N)(p.age.greaterThanEqual(p.life), () => {
                        this.release(counters, free, slot, system);
                    });
                });
            });
        })().compute(this.capacity_);
    }
}
