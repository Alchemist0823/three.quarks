import {MeshBasicMaterial, NormalBlending, Scene, Texture} from 'three';
import {
    ApplySequences,
    Bezier,
    ColorOverLife,
    ConstantColor,
    ConstantValue,
    EmitSubParticleSystem,
    Gradient,
    IntervalValue,
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
    GPUSlotAllocator,
    GPU_SLOT,
    WebGPUBatchedRenderer,
    WebGPUSpriteBatch,
    createGPUParticleLayout,
    estimateGPUCapacity,
    estimateParticleCount,
    getGPUSimulationSupport,
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

describe('GPUSlotAllocator', () => {
    test('hands out the lowest free slot and frees slots when the clock passes their death', () => {
        const allocator = new GPUSlotAllocator(256);
        expect(allocator.allocate(1)).toBe(0);
        expect(allocator.allocate(3)).toBe(1);
        expect(allocator.allocate(2)).toBe(2);
        expect(allocator.liveCount).toBe(3);
        expect(allocator.highWater).toBe(64);

        expect(allocator.advance(1.5)).toBe(1); // slot 0 (life 1) died
        expect(allocator.liveCount).toBe(2);
        expect(allocator.allocate(10)).toBe(0); // lowest free slot again

        allocator.advance(1.0); // t = 2.5: slot 2 (dies at 2) freed
        expect(allocator.liveCount).toBe(2);
        allocator.advance(10);
        expect(allocator.liveCount).toBe(0);
        expect(allocator.highWater).toBe(0);
    });

    test('the high-water mark covers every live slot and shrinks by block', () => {
        const allocator = new GPUSlotAllocator(1024);
        for (let i = 0; i < 200; i++) allocator.allocate(i < 100 ? 10 : 1);
        expect(allocator.highWater).toBe(256);
        allocator.advance(2); // slots 100..199 die
        expect(allocator.liveCount).toBe(100);
        expect(allocator.highWater).toBe(128);
    });

    test('a full allocator returns -1 and keeps its live slots when grown', () => {
        const allocator = new GPUSlotAllocator(64);
        for (let i = 0; i < 64; i++) expect(allocator.allocate(5)).toBe(i);
        expect(allocator.allocate(5)).toBe(-1);
        allocator.grow(128);
        expect(allocator.capacity).toBe(128);
        expect(allocator.allocate(5)).toBe(64);
        allocator.advance(6);
        expect(allocator.liveCount).toBe(0);
        // every slot is free again and comes back in ascending order
        for (let i = 0; i < 128; i++) expect(allocator.allocate(1)).toBe(i);
    });

    test('matches a reference model over random spawns and deaths', () => {
        const allocator = new GPUSlotAllocator(64);
        const live = new Map<number, number>(); // slot -> death time
        let time = 0;
        let seed = 12345;
        const random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
        for (let step = 0; step < 500; step++) {
            const spawns = Math.floor(random() * 20);
            for (let i = 0; i < spawns; i++) {
                const life = random() * 2;
                let slot = allocator.allocate(life);
                if (slot < 0) {
                    allocator.grow(allocator.capacity * 2);
                    slot = allocator.allocate(life);
                }
                // lowest free slot
                let expected = 0;
                while (live.has(expected)) expected++;
                expect(slot).toBe(expected);
                live.set(slot, time + life);
            }
            const delta = random() * 0.1;
            time += delta;
            allocator.advance(delta);
            for (const [slot, death] of live) if (death <= time) live.delete(slot);
            expect(allocator.liveCount).toBe(live.size);
            const maxSlot = Math.max(-1, ...live.keys());
            expect(allocator.highWater).toBeGreaterThan(maxSlot);
            expect(allocator.highWater - maxSlot - 1).toBeLessThan(64);
        }
    });
});

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
        // spawn + update kernel of each GPU system
        expect(renderer.dispatches[0].length).toBe(4);
        // 400 / s for 0.1 s
        expect(a.particleNum).toBe(40);
        const batch = batchRenderer.batches[batchRenderer.systemToBatchIndex.get(a)!] as GPUParticleBatch;
        expect(batch.geometry.instanceCount).toBe(64);
        expect(batch.visible).toBe(true);

        // particles die after their 2 s life
        for (let i = 0; i < 24; i++) batchRenderer.update(0.1);
        expect(a.particleNum).toBeGreaterThan(700);
        expect(a.particleNum).toBeLessThanOrEqual(800);
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
        // the clear kernel runs first in the next dispatch
        // dead records over the old particles go out with the spawn kernel
        const batch = batchRenderer.batches[0] as GPUParticleBatch;
        const spawn = (batch.simulation as any).spawnNode_;
        expect(renderer.dispatches[renderer.dispatches.length - 1]).toContain(spawn);
        expect(spawn.count).toBeGreaterThanOrEqual(40);
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
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        // one compute call: spawn kernel + one update kernel for all 20 systems
        expect(renderer.dispatches[renderer.dispatches.length - 1].length).toBe(2);
        for (const system of systems) expect(system.particleNum).toBe(40);
        expect(batch.geometry.instanceCount).toBeGreaterThanOrEqual(800);
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
        expect(child.pendingSpawnCount).toBe(5);
        batchRenderer.update(0.1);
        expect(child.pendingSpawnCount).toBe(0);
        expect(child.particleNum).toBe(5);
    });
});

// keep Vector3 referenced for the shared test helpers
void Vector3;
