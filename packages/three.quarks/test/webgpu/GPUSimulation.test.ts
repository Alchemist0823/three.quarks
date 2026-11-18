import {BoxGeometry, Matrix4, MeshBasicMaterial, NormalBlending, Scene, Texture} from 'three';
import {
    ApplySequences,
    Bezier,
    ChangeEmitDirection,
    ColorOverLife,
    ConeEmitter,
    EmitterMode,
    ConstantColor,
    ConstantValue,
    EmitSubParticleSystem,
    Gradient,
    IntervalValue,
    MeshSurfaceEmitter,
    Noise,
    ParticleSystem,
    PiecewiseBezier,
    RenderMode,
    SizeOverLife,
    SphereEmitter,
    SpriteParticle,
    Vector3,
    Vector4,
} from '../../src';
import {
    GPUParticleBatch,
    GPU_COUNTER,
    GPU_SLOT,
    WebGPUBatchedRenderer,
    WebGPUSpriteBatch,
    createGPUParticleLayout,
    estimateGPUCapacity,
    estimateParticleCount,
    getGPUEmissionSupport,
    getGPUSimulationSupport,
    registerGPUBehavior,
    writeSpawnRecord,
} from '../../src/webgpu';

function makeSystem(renderMode: RenderMode, extra: Record<string, unknown> = {}) {
    return new ParticleSystem({
        duration: 1,
        looping: true,
        startLife: new ConstantValue(2.0),
        startSpeed: new IntervalValue(1, 3),
        startSize: new IntervalValue(0.5, 1),
        startColor: new ConstantColor(new Vector4(1, 0.5, 0.25, 0.75)),
        worldSpace: true,
        emissionOverTime: new ConstantValue(400),
        shape: new SphereEmitter({radius: 1}),
        material: new MeshBasicMaterial({map: new Texture(), blending: NormalBlending, transparent: true}),
        renderMode,
        rendererEmitterSettings:
            renderMode === RenderMode.Trail
                ? {startLength: new ConstantValue(10)}
                : renderMode === RenderMode.StretchedBillBoard
                  ? {speedFactor: 0.5, lengthFactor: 2}
                  : {},
        ...extra,
    });
}

/** A behavior with no GPU version (like a third-party plugin behavior). */
function cpuOnlyBehavior(): any {
    return {
        type: 'CpuOnlyTestBehavior',
        initialize: () => undefined,
        update: () => undefined,
        frameUpdate: () => undefined,
        reset: () => undefined,
        toJSON: () => ({type: 'CpuOnlyTestBehavior'}),
        clone: () => cpuOnlyBehavior(),
    };
}

/** A stand-in for an initialized `WebGPURenderer` on the WebGPU backend that records compute dispatches. */
function fakeRenderer(webgpu = true) {
    const dispatches: unknown[][] = [];
    return {
        dispatches,
        backend: {isWebGPUBackend: webgpu},
        hasInitialized: () => true,
        compute: (nodes: unknown[]) => {
            dispatches.push(nodes);
        },
    };
}

/** A behavior with a GPU update whose `initialize()` must run on the CPU. */
function cpuInitBehavior(): any {
    return {...cpuOnlyBehavior(), type: 'CpuInitTestBehavior', clone: () => cpuInitBehavior()};
}
registerGPUBehavior('CpuInitTestBehavior', {supports: () => true, compile: () => undefined});

const simulationOf = (batch: unknown) => (batch as GPUParticleBatch).simulation as any;

/** floats per emission range in the range buffer */
const RANGE_FLOATS = 12;

describe('GPU particle records', () => {
    test('layout adds quaternion and noise slots only when needed', () => {
        expect(createGPUParticleLayout({mesh: false, noise: false}).stride).toBe(7);
        const mesh = createGPUParticleLayout({mesh: true, noise: true});
        expect(mesh.stride).toBe(10);
        expect(mesh.quaternion).toBe(7);
        expect(mesh.noise).toBe(8);
        expect(mesh.noiseQuaternion).toBe(9);
    });

    test('spawn records hold the particle state and the system index', () => {
        const layout = createGPUParticleLayout({mesh: false, noise: false});
        const particle = new SpriteParticle();
        particle.position.set(1, 2, 3);
        particle.velocity.set(4, 5, 6);
        particle.life = 2;
        particle.age = 0;
        particle.color.set(0.1, 0.2, 0.3, 0.4);
        particle.startColor.set(0.5, 0.6, 0.7, 0.8);
        particle.size.set(1, 1, 1);
        particle.startSize.set(2, 2, 2);
        particle.rotation = 0.5;
        particle.startSpeed = 3;
        particle.speedModifier = 1;
        particle.uvTile = 7;
        const array = new Float32Array(layout.stride * 4 * 2);
        // record at float offset stride * 4, system 42 of its batch
        writeSpawnRecord(array, layout.stride * 4, layout, particle, 42, 99);
        const r = (slot: number, c: number) => array[(layout.stride + slot) * 4 + c];
        expect([r(GPU_SLOT.POSITION_AGE, 0), r(GPU_SLOT.POSITION_AGE, 2), r(GPU_SLOT.POSITION_AGE, 3)]).toEqual([1, 3, 0]);
        expect(r(GPU_SLOT.VELOCITY_LIFE, 3)).toBe(2);
        expect(r(GPU_SLOT.SIZE_ROTATION, 3)).toBe(0.5);
        expect(r(GPU_SLOT.START_COLOR, 3)).toBeCloseTo(0.8);
        expect(r(GPU_SLOT.START_SIZE, 3)).toBe(42);
        expect([r(GPU_SLOT.MISC, 0), r(GPU_SLOT.MISC, 1), r(GPU_SLOT.MISC, 2), r(GPU_SLOT.MISC, 3)]).toEqual([99, 3, 1, 7]);
    });
});

describe('GPU simulation support', () => {
    test('sprite and mesh systems with GPU behaviors are supported', () => {
        for (const mode of [RenderMode.BillBoard, RenderMode.StretchedBillBoard, RenderMode.Mesh]) {
            const system = makeSystem(mode);
            system.addBehavior(new ColorOverLife(new Gradient()));
            system.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.4, 0), 0]])));
            system.addBehavior(new Noise(new ConstantValue(1), new ConstantValue(1)));
            expect(getGPUSimulationSupport(system)).toBeNull();
        }
    });

    test('reports why a system stays on the CPU', () => {
        expect(getGPUSimulationSupport(makeSystem(RenderMode.Trail))).toMatch(/trail/);
        const sequenced = makeSystem(RenderMode.BillBoard);
        sequenced.addBehavior(new ApplySequences(0.1));
        expect(getGPUSimulationSupport(sequenced)).toMatch(/ApplySequences/);
        const parent = makeSystem(RenderMode.BillBoard);
        parent.addBehavior(new EmitSubParticleSystem(parent, false, makeSystem(RenderMode.BillBoard).emitter));
        expect(getGPUSimulationSupport(parent)).toMatch(/EmitSubParticleSystem/);
        const localChild = makeSystem(RenderMode.BillBoard, {onlyUsedByOther: true, worldSpace: false});
        expect(getGPUSimulationSupport(localChild)).toMatch(/sub-emitter/);
        const listened = makeSystem(RenderMode.BillBoard);
        listened.addEventListener('particleDied', () => undefined);
        expect(getGPUSimulationSupport(listened)).toMatch(/particleDied/);
    });

    test('emission runs on the GPU for the built-in shapes, start values and behaviors', () => {
        for (const shape of [
            new SphereEmitter({radius: 1}),
            new ConeEmitter({mode: EmitterMode.Loop}),
            new SphereEmitter({mode: EmitterMode.Burst, spread: 0.1}),
        ]) {
            const system = makeSystem(RenderMode.Mesh, {shape});
            system.addBehavior(new ColorOverLife(new Gradient()));
            system.addBehavior(new ChangeEmitDirection(new IntervalValue(0, 1)));
            system.addBehavior(new Noise(new ConstantValue(1), new ConstantValue(1)));
            expect(getGPUEmissionSupport(system)).toBeNull();
        }
    });

    test('reports why a system emits on the CPU', () => {
        const surface = makeSystem(RenderMode.BillBoard, {shape: new MeshSurfaceEmitter(new BoxGeometry())});
        expect(getGPUEmissionSupport(surface)).toMatch(/mesh_surface/);
        const custom = makeSystem(RenderMode.BillBoard);
        custom.addBehavior(cpuInitBehavior());
        expect(getGPUSimulationSupport(custom)).toBeNull();
        expect(getGPUEmissionSupport(custom)).toMatch(/CpuInitTestBehavior/);
    });

    test('estimates live particles from emission rate, lifetime and bursts', () => {
        const system = makeSystem(RenderMode.BillBoard, {
            emissionBursts: [{time: 0, count: new ConstantValue(50), cycle: 2, interval: 0.1, probability: 1}],
        });
        expect(estimateParticleCount(system)).toBe(400 * 2 + 100);
        expect(estimateGPUCapacity(system)).toBe(2048);
    });
});

describe('WebGPUBatchedRenderer GPU simulation', () => {
    function setup(options: Record<string, unknown>, ...systems: ParticleSystem[]) {
        const scene = new Scene();
        const renderer = fakeRenderer(options.webgpu !== false);
        const batchRenderer = new WebGPUBatchedRenderer({renderer, ...options});
        scene.add(batchRenderer);
        for (const system of systems) {
            batchRenderer.addSystem(system);
            scene.add(system.emitter);
        }
        return {scene, renderer, batchRenderer};
    }

    test("'off' (default) keeps every system on the CPU", () => {
        const system = makeSystem(RenderMode.BillBoard);
        const {batchRenderer} = setup({});
        batchRenderer.addSystem(system);
        expect(batchRenderer.batches[0]).toBeInstanceOf(WebGPUSpriteBatch);
        expect(batchRenderer.isGPUSimulated(system)).toBe(false);
    });

    test("'all' simulates supported systems on the GPU and dispatches one compute call per frame", () => {
        const a = makeSystem(RenderMode.BillBoard);
        const b = makeSystem(RenderMode.Mesh);
        const trail = makeSystem(RenderMode.Trail);
        const {renderer, batchRenderer} = setup({gpuSimulation: 'all'}, a, b, trail);
        expect(batchRenderer.isGPUSimulated(a)).toBe(true);
        expect(batchRenderer.isGPUSimulated(b)).toBe(true);
        expect(batchRenderer.isGPUSimulated(trail)).toBe(false);
        expect(a.simulationDelegate).not.toBeNull();

        // emission spawns what accumulated over the previous frame: the first frame has no particles yet
        batchRenderer.update(0.1);
        expect(renderer.dispatches.length).toBe(0);
        batchRenderer.update(0.1);
        expect(renderer.dispatches.length).toBe(1);
        // per batch: spawn and update kernel
        expect(renderer.dispatches[0].length).toBe(4);
        // 400 / s for 0.1 s, emitted on the GPU: nothing was emitted on the CPU
        expect(a.particleNum).toBe(40);
        expect(a.pendingSpawnCount).toBe(0);
        const batch = batchRenderer.batches[batchRenderer.systemToBatchIndex.get(a)!] as GPUParticleBatch;
        expect(batch.geometry.indirect).toBe(batch.simulation.drawArgs);
        expect(batch.geometry.instanceCount).toBe(batch.simulation.capacity);
        expect(batch.visible).toBe(true);

        // particles die after their 2 s life
        for (let i = 0; i < 24; i++) batchRenderer.update(0.1);
        expect(a.particleNum).toBeGreaterThan(700);
        expect(a.particleNum).toBeLessThanOrEqual(800);
    });

    test('spawns raise the draw count; the high-water mark shrinks every 32 dispatches', () => {
        const system = makeSystem(RenderMode.BillBoard);
        const {renderer, batchRenderer} = setup({gpuSimulation: 'all'}, system);
        for (let i = 0; i < 40; i++) batchRenderer.update(0.01);
        const simulation = simulationOf(batchRenderer.batches[0]);
        const shrinks = renderer.dispatches.filter((nodes) => nodes.includes(simulation.endNode_)).length;
        expect(shrinks).toBe(1);
        // the same draw arguments are read by the indirect draw and written (atomically) by the kernels
        expect(simulation.argsNode_.value).toBe(simulation.drawArgs);
    });

    test("'auto' only takes systems above the particle threshold", () => {
        const small = makeSystem(RenderMode.BillBoard, {emissionOverTime: new ConstantValue(10)});
        const large = makeSystem(RenderMode.BillBoard);
        const {batchRenderer} = setup({gpuSimulation: 'auto', gpuSimulationThreshold: 500}, small, large);
        expect(batchRenderer.isGPUSimulated(small)).toBe(false);
        expect(batchRenderer.getGPUSimulationSupport(small)).toMatch(/gpuSimulationThreshold/);
        expect(batchRenderer.isGPUSimulated(large)).toBe(true);
    });

    test('the WebGL 2 backend falls back to CPU simulation', () => {
        const system = makeSystem(RenderMode.BillBoard);
        const {batchRenderer} = setup({gpuSimulation: 'all', webgpu: false}, system);
        expect(batchRenderer.isGPUSimulated(system)).toBe(false);
    });

    test('deleting a GPU system removes its batch and keeps the other indices valid', () => {
        const a = makeSystem(RenderMode.BillBoard);
        const b = makeSystem(RenderMode.BillBoard);
        const cpu = makeSystem(RenderMode.Trail);
        const {batchRenderer} = setup({gpuSimulation: 'all'}, a, cpu, b);
        expect(batchRenderer.batches.length).toBe(3);
        batchRenderer.deleteSystem(a);
        expect(batchRenderer.batches.length).toBe(2);
        expect(a.simulationDelegate).toBeNull();
        for (const [system, index] of batchRenderer.systemToBatchIndex) {
            expect(batchRenderer.batches[index].systems.has(system)).toBe(true);
        }
    });

    test('a system that gains a CPU-only behavior moves back to the CPU', () => {
        const system = makeSystem(RenderMode.BillBoard);
        const {batchRenderer} = setup({gpuSimulation: 'all'}, system);
        batchRenderer.update(0.1);
        expect(batchRenderer.isGPUSimulated(system)).toBe(true);
        system.addBehavior(cpuOnlyBehavior());
        // the kernel watches the behavior list; the change is noticed on the next step
        batchRenderer.update(0.1);
        expect(batchRenderer.isGPUSimulated(system)).toBe(false);
        expect(system.simulationDelegate).toBeNull();
        batchRenderer.update(0.1);
        expect(system.particleNum).toBeGreaterThan(0);
    });

    test('restart clears the GPU particles', () => {
        const system = makeSystem(RenderMode.BillBoard);
        const {batchRenderer, renderer} = setup({gpuSimulation: 'all'}, system);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        expect(system.particleNum).toBe(40);
        system.restart();
        expect(system.particleNum).toBe(0);
        batchRenderer.update(0.05);
        // the kill kernel removes the old particles first in the next dispatch, then the high-water mark shrinks
        const simulation = simulationOf(batchRenderer.batches[0]);
        const nodes = renderer.dispatches[renderer.dispatches.length - 1];
        expect(nodes[0]).toBe(simulation.killNode_);
        expect(nodes.slice(-2)).toEqual([simulation.finalizeNode_, simulation.endNode_]);
        batchRenderer.update(0.05);
        expect(system.particleNum).toBeGreaterThan(0);
        expect(system.particleNum).toBeLessThanOrEqual(40);
    });

    test('changing renderer settings keeps the GPU particles; switching to the GPU keeps the CPU particles', () => {
        const system = makeSystem(RenderMode.BillBoard);
        const {batchRenderer} = setup({}, system);
        for (let i = 0; i < 5; i++) batchRenderer.update(0.1);
        const cpuParticles = system.particleNum;
        expect(cpuParticles).toBeGreaterThan(0);

        batchRenderer.setGPUSimulation('all');
        expect(batchRenderer.isGPUSimulated(system)).toBe(true);
        batchRenderer.update(0.01);
        expect(system.particleNum).toBeGreaterThanOrEqual(cpuParticles);

        // new settings: the particles are copied on the GPU into the batch of the new settings
        const before = batchRenderer.batches[batchRenderer.systemToBatchIndex.get(system)!];
        system.renderMode = RenderMode.StretchedBillBoard;
        batchRenderer.update(0.01);
        expect(batchRenderer.isGPUSimulated(system)).toBe(true);
        const after = batchRenderer.batches[batchRenderer.systemToBatchIndex.get(system)!];
        expect(after).not.toBe(before);
        expect(batchRenderer.batches.includes(before)).toBe(false);
        expect(system.particleNum).toBeGreaterThanOrEqual(cpuParticles);
    });

    test('systems with equal settings share one GPU batch, one draw call and one kernel', () => {
        const systems = Array.from({length: 20}, () => makeSystem(RenderMode.BillBoard));
        const shared = new MeshBasicMaterial({map: new Texture(), blending: NormalBlending, transparent: true});
        for (const system of systems) system.material = shared;
        const {renderer, batchRenderer} = setup({gpuSimulation: 'all'}, ...systems);
        expect(batchRenderer.batches.length).toBe(1);
        const batch = batchRenderer.batches[0] as GPUParticleBatch;
        expect(batch.simulation.members.length).toBe(20);
        expect(batch.simulation.groupCount).toBe(1);
        expect(batch.simulation.emissionGroupCount).toBe(1);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        // one compute call: one spawn and one update kernel for all 20 systems
        expect(renderer.dispatches[renderer.dispatches.length - 1].length).toBe(2);
        for (const system of systems) expect(system.particleNum).toBe(40);
        expect(batch.simulation.liveCount).toBe(800);
        expect(batch.simulation.capacity).toBeGreaterThanOrEqual(800);
    });

    test('systems with different behaviors share the draw call with one kernel per kind', () => {
        const plain = makeSystem(RenderMode.BillBoard);
        const fading = makeSystem(RenderMode.BillBoard);
        fading.addBehavior(new ColorOverLife(new Gradient()));
        const fading2 = makeSystem(RenderMode.BillBoard);
        fading2.addBehavior(new ColorOverLife(new Gradient()));
        const shared = new MeshBasicMaterial({map: new Texture(), blending: NormalBlending, transparent: true});
        for (const system of [plain, fading, fading2]) system.material = shared;
        const {renderer, batchRenderer} = setup({gpuSimulation: 'all'}, plain, fading, fading2);
        expect(batchRenderer.batches.length).toBe(1);
        const batch = batchRenderer.batches[0] as GPUParticleBatch;
        expect(batch.simulation.groupCount).toBe(2);
        // the behaviors only differ in their update: one spawn kernel
        expect(batch.simulation.emissionGroupCount).toBe(1);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        // spawn + 2 update kernels
        expect(renderer.dispatches[renderer.dispatches.length - 1].length).toBe(3);
    });

    test('removing a system keeps the batch for the others; the last one removes the batch', () => {
        const a = makeSystem(RenderMode.BillBoard);
        const b = makeSystem(RenderMode.BillBoard);
        const shared = new MeshBasicMaterial({map: new Texture(), blending: NormalBlending, transparent: true});
        a.material = shared;
        b.material = shared;
        const {batchRenderer} = setup({gpuSimulation: 'all'}, a, b);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        batchRenderer.deleteSystem(a);
        expect(batchRenderer.batches.length).toBe(1);
        expect(a.simulationDelegate).toBeNull();
        batchRenderer.update(0.1);
        expect(b.particleNum).toBe(80);
        batchRenderer.deleteSystem(b);
        expect(batchRenderer.batches.length).toBe(0);
    });

    test('per-system emitter transforms let local space systems share a batch', () => {
        const a = makeSystem(RenderMode.BillBoard, {worldSpace: false});
        const b = makeSystem(RenderMode.BillBoard, {worldSpace: false});
        const shared = new MeshBasicMaterial({map: new Texture(), blending: NormalBlending, transparent: true});
        a.material = shared;
        b.material = shared;
        a.emitter.position.set(5, 0, 0);
        b.emitter.position.set(0, 0, -3);
        const {batchRenderer} = setup({gpuSimulation: 'all'}, a, b);
        batchRenderer.update(0.1);
        const batch = batchRenderer.batches[0] as GPUParticleBatch;
        const data = batch.simulation.systems.array as Float32Array;
        const ia = batch.memberOf(a)!.index;
        const ib = batch.memberOf(b)!.index;
        // translation column of each system's emitter matrix
        expect(data[ia * 32 + 12]).toBe(5);
        expect(data[ib * 32 + 14]).toBe(-3);
    });

    test('world space sub-emitter children are emitted into the GPU simulation', () => {
        const child = makeSystem(RenderMode.BillBoard, {onlyUsedByOther: true, emissionOverTime: new ConstantValue(0)});
        const {batchRenderer} = setup({gpuSimulation: 'all'}, child);
        expect(batchRenderer.isGPUSimulated(child)).toBe(true);
        // a parent's EmitSubParticleSystem calls emit() between the child's updates
        child.emissionBursts = [{time: 0, count: new ConstantValue(5), cycle: 1, interval: 0.01, probability: 1}] as any;
        child.emit(0.01, child.emissionState, child.emitter.matrixWorld as any);
        // at the child's own emitter: emitted on the GPU
        expect(child.pendingSpawnCount).toBe(0);
        batchRenderer.update(0.1);
        expect(child.particleNum).toBe(5);

        // at a parent particle: emitted on the CPU and uploaded
        child.emissionState.burstIndex = 0;
        child.emissionState.time = 0;
        child.emit(0.01, child.emissionState, new Matrix4().makeTranslation(1, 2, 3) as any);
        expect(child.pendingSpawnCount).toBe(5);
        batchRenderer.update(0.1);
        expect(child.pendingSpawnCount).toBe(0);
        expect(child.particleNum).toBe(10);
    });

    test('systems the GPU cannot emit upload their CPU emitted particles', () => {
        const custom = makeSystem(RenderMode.BillBoard);
        custom.addBehavior(cpuInitBehavior());
        const {renderer, batchRenderer} = setup({gpuSimulation: 'all'}, custom);
        expect(batchRenderer.isGPUSimulated(custom)).toBe(true);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        const simulation = simulationOf(batchRenderer.batches[0]);
        expect(simulation.emissionGroupCount).toBe(0);
        expect(renderer.dispatches[renderer.dispatches.length - 1]).toContain(simulation.recordNode_);
        expect(simulation.recordNode_.count).toBe(40);
        expect(custom.particleNum).toBe(40);
    });

    test('gpuEmission: false emits on the CPU; switching it back re-records the emission', () => {
        const system = makeSystem(RenderMode.BillBoard);
        const {renderer, batchRenderer} = setup({gpuSimulation: 'all', gpuEmission: false}, system);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        const simulation = simulationOf(batchRenderer.batches[0]);
        expect(renderer.dispatches[renderer.dispatches.length - 1]).toContain(simulation.recordNode_);
        batchRenderer.gpuEmission = true;
        batchRenderer.update(0.1);
        expect(simulation.emissionGroupCount).toBe(1);
        expect(renderer.dispatches[renderer.dispatches.length - 1]).not.toContain(simulation.recordNode_);
        expect(system.particleNum).toBe(80);
    });

    test('emission calls of a frame become ranges of their spawn kernel', () => {
        const a = makeSystem(RenderMode.BillBoard);
        const b = makeSystem(RenderMode.BillBoard, {
            emissionBursts: [{time: 0, count: new ConstantValue(7), cycle: 1, interval: 0.1, probability: 1}],
        });
        const shared = new MeshBasicMaterial({map: new Texture(), blending: NormalBlending, transparent: true});
        a.material = shared;
        b.material = shared;
        const {batchRenderer} = setup({gpuSimulation: 'all'}, a, b);
        batchRenderer.update(0.1);
        const simulation = simulationOf(batchRenderer.batches[0]);
        const ranges = simulation.rangesData_ as Float32Array;
        // frame 1: only b's burst: (system, first spawn, count), burst size
        expect(Array.from(ranges.subarray(0, 3))).toEqual([simulation.memberOf(b).index, 0, 7]);
        expect(ranges[7]).toBe(7);
        batchRenderer.update(0.1);
        // frame 2: one continuous call per system, packed back to back
        expect([ranges[2], ranges[RANGE_FLOATS + 2]]).toEqual([40, 40]);
        expect(ranges[RANGE_FLOATS + 1]).toBe(40);
        // continuous calls are not bursts
        expect(ranges[7]).toBe(0);
        const group = Array.from(simulation.emissionGroups_.values())[0] as any;
        expect(group.node.count).toBe(80);
        expect(group.rangeCount.value).toBe(2);
    });

    test('the particle buffer grows ahead of the live particles; growth copies run first', () => {
        const system = makeSystem(RenderMode.BillBoard);
        const {renderer, batchRenderer} = setup({gpuSimulation: 'all'}, system);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        const simulation = simulationOf(batchRenderer.batches[0]);
        const capacity = simulation.capacity;
        const before = renderer.dispatches.length;
        system.emissionOverTime = new ConstantValue(100000);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        expect(simulation.capacity).toBeGreaterThan(capacity);
        expect(simulation.capacity).toBeGreaterThanOrEqual(system.particleNum);
        // state copy, free stack rebuild and free count update before the frame's spawn and update kernels
        const grown = renderer.dispatches.slice(before).find((nodes) => nodes.length >= 5);
        expect(grown).toBeDefined();
        expect(grown!.indexOf(simulation.emissionGroups_.values().next().value.node)).toBe(3);
    });

    test('counter readbacks tighten particleNum', async () => {
        const system = makeSystem(RenderMode.BillBoard, {startLife: new IntervalValue(0.1, 2)});
        const {renderer, batchRenderer} = setup({gpuSimulation: 'all'}, system);
        const reads: Array<(counters: Int32Array) => void> = [];
        (renderer as any).getArrayBufferAsync = (attribute: any) =>
            new Promise<ArrayBuffer>((resolve) =>
                reads.push((counters) => {
                    const data = new Int32Array((attribute.array as Int32Array).length);
                    data.set(counters.subarray(0, data.length));
                    resolve(data.buffer);
                })
            );
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        // upper bound from the lifetimes: 80 spawned within 2 s
        expect(system.particleNum).toBe(80);
        const simulation = simulationOf(batchRenderer.batches[0]);
        const counters = new Int32Array(GPU_COUNTER.SYSTEMS + 16);
        counters[GPU_COUNTER.SYSTEMS + simulation.memberOf(system).index] = 25;
        // one readback in flight: the one taken after the first dispatch (40 spawned)
        expect(reads.length).toBe(1);
        reads[0](counters);
        await new Promise((resolve) => setTimeout(resolve, 0));
        batchRenderer.update(0.1);
        // 25 alive after the first dispatch + 40 spawned in each of the two dispatches since
        expect(system.particleNum).toBe(25 + 40 + 40);
        expect(simulation.stats).not.toBeNull();
    });
});

// keep Vector3 referenced for the shared test helpers
void Vector3;
