import {
    MeshBasicMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    NormalBlending,
    Scene,
    Texture,
    DepthTexture,
    BoxGeometry,
} from 'three';
import {
    BatchedRenderer as WebGLBatchedRenderer,
    BaseBatchedRenderer,
    ConstantColor,
    ConstantValue,
    IntervalValue,
    ParticleSystem,
    PointEmitter,
    RandomQuatGenerator,
    RenderMode,
    SpriteBatch,
    TrailBatch,
    getSpriteInstanceLayout,
    TRAIL_VERTEX_LAYOUT,
    Vector4,
    SphereEmitter,
} from '../../src';
import {
    BatchedRenderer,
    WebGPUBatchedRenderer,
    WebGPUSpriteBatch,
    WebGPUTrailBatch,
    ParticleSpriteNodeMaterial,
    ParticleMeshStandardNodeMaterial,
    ParticleMeshPhysicalNodeMaterial,
    ParticleTrailNodeMaterial,
    createPerformanceProfile,
    getRecommendedRendererSettings,
} from '../../src/webgpu';

function makeSystem(renderMode: RenderMode, extra: Record<string, unknown> = {}) {
    return new ParticleSystem({
        duration: 1,
        looping: true,
        startLife: new ConstantValue(2.0),
        startSpeed: new IntervalValue(1, 3),
        startSize: new IntervalValue(0.5, 1),
        startColor: new ConstantColor(new Vector4(1, 0.5, 0.25, 0.75)),
        worldSpace: false,
        emissionOverTime: new ConstantValue(200),
        shape: new SphereEmitter({radius: 1}),
        material: new MeshBasicMaterial({map: new Texture(), blending: NormalBlending, transparent: true}),
        startTileIndex: new ConstantValue(1),
        uTileCount: 2,
        vTileCount: 2,
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

describe('three.quarks/webgpu', () => {
    test('BatchedRenderer alias is the WebGPU renderer and shares the base class', () => {
        expect(BatchedRenderer).toBe(WebGPUBatchedRenderer);
        const renderer = new BatchedRenderer();
        expect(renderer).toBeInstanceOf(BaseBatchedRenderer);
        expect(renderer.isWebGPUBatchedRenderer).toBe(true);
        expect(renderer.profile.target).toBe('desktop');
    });

    test('creates node material batches for every render mode', () => {
        const scene = new Scene();
        const renderer = new WebGPUBatchedRenderer();
        scene.add(renderer);
        const modes = [
            RenderMode.BillBoard,
            RenderMode.HorizontalBillBoard,
            RenderMode.VerticalBillBoard,
            RenderMode.StretchedBillBoard,
            RenderMode.Mesh,
            RenderMode.Trail,
        ];
        for (const mode of modes) {
            const system = makeSystem(mode);
            renderer.addSystem(system);
            scene.add(system.emitter);
        }
        renderer.update(0.1);
        expect(renderer.batches.length).toBe(modes.length);
        for (let i = 0; i < modes.length; i++) {
            const batch = renderer.batches[i];
            if (modes[i] === RenderMode.Trail) {
                expect(batch).toBeInstanceOf(WebGPUTrailBatch);
                expect(batch.material).toBeInstanceOf(ParticleTrailNodeMaterial);
            } else {
                expect(batch).toBeInstanceOf(WebGPUSpriteBatch);
                expect(batch.material).toBeInstanceOf(ParticleSpriteNodeMaterial);
                expect((batch.material as ParticleSpriteNodeMaterial).renderMode).toBe(modes[i]);
            }
            expect((batch.material as any).isNodeMaterial).toBe(true);
            // blend state is taken from the particle system material
            expect((batch.material as any).transparent).toBe(true);
            expect((batch.material as any).depthWrite).toBe(false);
        }
    });

    test('lit mesh particles use lit node materials and keep accessor backed properties', () => {
        const renderer = new WebGPUBatchedRenderer();
        const standard = makeSystem(RenderMode.Mesh, {
            instancingGeometry: new BoxGeometry(),
            startRotation: new RandomQuatGenerator(),
            material: new MeshStandardMaterial({alphaTest: 0.5, roughness: 0.3, metalness: 0.7}),
        });
        const physical = makeSystem(RenderMode.Mesh, {
            instancingGeometry: new BoxGeometry(),
            startRotation: new RandomQuatGenerator(),
            material: new MeshPhysicalMaterial({clearcoat: 0.6, transmission: 0.25}),
        });
        renderer.addSystem(standard);
        renderer.addSystem(physical);
        const standardMaterial = renderer.batches[0].material as any;
        const physicalMaterial = renderer.batches[1].material as any;
        expect(standardMaterial).toBeInstanceOf(ParticleMeshStandardNodeMaterial);
        expect(standardMaterial.alphaTest).toBeCloseTo(0.5);
        expect(standardMaterial.roughness).toBeCloseTo(0.3);
        expect(standardMaterial.metalness).toBeCloseTo(0.7);
        expect(standardMaterial.vertexColors).toBe(true);
        expect(physicalMaterial).toBeInstanceOf(ParticleMeshPhysicalNodeMaterial);
        expect(physicalMaterial.clearcoat).toBeCloseTo(0.6);
        expect(physicalMaterial.transmission).toBeCloseTo(0.25);
    });

    test.each([
        RenderMode.BillBoard,
        RenderMode.StretchedBillBoard,
        RenderMode.Mesh,
        RenderMode.Trail,
    ])('WebGL and WebGPU batches upload identical data (render mode %s)', (mode) => {
        const scene = new Scene();
        const webgl = new WebGLBatchedRenderer();
        const webgpu = new WebGPUBatchedRenderer();
        const system = makeSystem(mode, mode === RenderMode.Mesh ? {startRotation: new RandomQuatGenerator()} : {});
        system.emitter.position.set(1, 2, 3);
        system.emitter.scale.set(2, 2, 2);
        scene.add(system.emitter);
        webgl.addSystem(system);
        webgpu.addSystem(system);
        // simulate once, then let both renderers fill their buffers from the same particle state
        for (let i = 0; i < 10; i++) (system as any).update(0.05);
        webgl.batches[0].update();
        webgpu.batches[0].update();

        const glBatch = webgl.batches[0];
        const gpuBatch = webgpu.batches[0];
        if (mode === RenderMode.Trail) {
            expect(glBatch).toBeInstanceOf(TrailBatch);
            const a = (glBatch as TrailBatch).vertexBuffer.array;
            const b = (gpuBatch as WebGPUTrailBatch).vertexBuffer.array;
            const count = (glBatch as TrailBatch).geometry.drawRange.count;
            expect(count).toBeGreaterThan(0);
            expect(Array.from(a.slice(0, 2000))).toEqual(Array.from(b.slice(0, 2000)));
        } else {
            expect(glBatch).toBeInstanceOf(SpriteBatch);
            const glSprite = glBatch as SpriteBatch;
            const gpuSprite = gpuBatch as WebGPUSpriteBatch;
            expect(glSprite.geometry.instanceCount).toBe(system.particleNum);
            expect(gpuSprite.geometry.instanceCount).toBe(system.particleNum);
            const used = system.particleNum * glSprite.layout.stride;
            expect(Array.from(glSprite.instanceBuffer.array.slice(0, used))).toEqual(
                Array.from(gpuSprite.instanceBuffer.array.slice(0, used))
            );
        }
    });

    test('instance buffer contains world space particle data', () => {
        const scene = new Scene();
        const renderer = new WebGPUBatchedRenderer();
        const system = makeSystem(RenderMode.StretchedBillBoard);
        system.emitter.position.set(10, 0, 0);
        scene.add(system.emitter);
        renderer.addSystem(system);
        renderer.update(0.2);
        const batch = renderer.batches[0] as WebGPUSpriteBatch;
        const layout = getSpriteInstanceLayout(RenderMode.StretchedBillBoard);
        expect(batch.layout).toBe(layout);
        expect(layout.stride % 4).toBe(0);
        const array = batch.instanceBuffer.array as Float32Array;
        const p = system.particles[0];
        const base = 0;
        // local space system: offset = emitter world matrix * position
        expect(array[base + layout.offset]).toBeCloseTo(p.position.x + 10, 4);
        expect(array[base + layout.offset + 1]).toBeCloseTo(p.position.y, 4);
        expect(array[base + layout.color]).toBeCloseTo(p.color.x);
        expect(array[base + layout.color + 3]).toBeCloseTo(p.color.w);
        expect(array[base + layout.uvTile]).toBeCloseTo(p.uvTile);
        expect(array[base + layout.velocity + 3]).toBeCloseTo(2); // lengthFactor
        expect(array[base + layout.velocity]).toBeCloseTo(p.velocity.x * 0.5, 4); // speedFactor
        // the whole batch is one interleaved buffer with a single update range
        expect(batch.instanceBuffer.updateRanges).toEqual([{start: 0, count: system.particleNum * layout.stride}]);
    });

    test('local space mesh particles: rotation = emitter rotation * particle rotation, size scaled', () => {
        const scene = new Scene();
        const renderer = new WebGLBatchedRenderer();
        const system = makeSystem(RenderMode.Mesh, {
            instancingGeometry: new BoxGeometry(),
            startRotation: new RandomQuatGenerator(),
        });
        system.emitter.rotation.set(0.3, 0.2, 0.1);
        system.emitter.scale.set(2, 3, 4);
        system.emitter.position.set(5, 0, 0);
        scene.add(system.emitter, renderer);
        renderer.addSystem(system);
        renderer.update(0.1);
        const batch = renderer.batches[0] as SpriteBatch;
        const layout = getSpriteInstanceLayout(RenderMode.Mesh);
        const array = batch.instanceBuffer.array as Float32Array;
        const p = system.particles[0] as any;
        const q = system.emitter.quaternion.clone().multiply(p.rotation);
        const pos = p.position.clone().applyMatrix4(system.emitter.matrixWorld);
        expect(array[layout.offset]).toBeCloseTo(pos.x, 4);
        expect(array[layout.offset + 1]).toBeCloseTo(pos.y, 4);
        expect(array[layout.offset + 2]).toBeCloseTo(pos.z, 4);
        expect(array[layout.rotation]).toBeCloseTo(q.x, 4);
        expect(array[layout.rotation + 1]).toBeCloseTo(q.y, 4);
        expect(array[layout.rotation + 2]).toBeCloseTo(q.z, 4);
        expect(array[layout.rotation + 3]).toBeCloseTo(q.w, 4);
        expect(array[layout.size]).toBeCloseTo(p.size.x * 2, 4);
        expect(array[layout.size + 1]).toBeCloseTo(p.size.y * 3, 4);
        expect(array[layout.size + 2]).toBeCloseTo(p.size.z * 4, 4);
        // GLSL attribute names are unchanged, now backed by one interleaved buffer
        for (const name of ['offset', 'rotation', 'size', 'uvTile', 'color']) {
            expect((batch.geometry.getAttribute(name) as any).isInterleavedBufferAttribute).toBe(true);
            expect((batch.geometry.getAttribute(name) as any).data).toBe(batch.instanceBuffer);
        }
    });

    test('trail batches use 16 bit indices while possible', () => {
        const renderer = new WebGPUBatchedRenderer();
        renderer.addSystem(makeSystem(RenderMode.Trail));
        const batch = renderer.batches[0] as WebGPUTrailBatch;
        expect(batch.indexBuffer.array).toBeInstanceOf(Uint16Array);
        expect(batch.vertexBuffer.stride).toBe(TRAIL_VERTEX_LAYOUT.stride);
        batch.expandBuffers(70000);
        expect(batch.indexBuffer.array).toBeInstanceOf(Uint32Array);
    });

    test('performance profiles', () => {
        const desktop = createPerformanceProfile({target: 'desktop'});
        const mobile = createPerformanceProfile({target: 'mobile'});
        expect(desktop.softParticles).toBe(true);
        expect(desktop.fastColorDecode).toBe(false);
        expect(mobile.softParticles).toBe(false);
        expect(mobile.fastColorDecode).toBe(true);
        expect(mobile.initialSpriteCapacity).toBeLessThan(desktop.initialSpriteCapacity);
        // explicit overrides win
        expect(createPerformanceProfile({target: 'mobile', softParticles: true}).softParticles).toBe(true);
        // node test environment => auto resolves to desktop
        expect(createPerformanceProfile({target: 'auto'}).target).toBe('desktop');
        expect(getRecommendedRendererSettings(mobile, 3).pixelRatio).toBe(1.5);
        expect(getRecommendedRendererSettings(desktop, 3).pixelRatio).toBe(2);
        expect(getRecommendedRendererSettings(desktop, 1).pixelRatio).toBe(1);
    });

    test('mobile profile disables soft particles and frame blending stays configurable', () => {
        const renderer = new WebGPUBatchedRenderer({target: 'mobile'});
        const system = makeSystem(RenderMode.BillBoard, {softParticles: true, softNearFade: 0, softFarFade: 1});
        renderer.addSystem(system);
        const batch = renderer.batches[0] as WebGPUSpriteBatch;
        expect(batch.profile.target).toBe('mobile');
        expect((batch as any).maxParticles).toBe(256);

        // switching the profile at runtime rebuilds all batches and keeps the systems
        renderer.setProfile({target: 'desktop'});
        expect(renderer.batches.length).toBe(1);
        expect(renderer.batches[0]).not.toBe(batch);
        expect(renderer.systemToBatchIndex.get(system)).toBe(0);
        expect((renderer.batches[0] as WebGPUSpriteBatch).profile.target).toBe('desktop');
    });

    test('setDepthTexture rebuilds soft particle materials', () => {
        const renderer = new WebGPUBatchedRenderer();
        const soft = makeSystem(RenderMode.BillBoard, {softParticles: true, softNearFade: 0, softFarFade: 1});
        renderer.addSystem(soft);
        const before = renderer.batches[0].material;
        renderer.setDepthTexture(new DepthTexture(4, 4));
        expect(renderer.batches[0].material).not.toBe(before);
        const after = renderer.batches[0].material;
        renderer.setDepthTexture(renderer.depthTexture);
        expect(renderer.batches[0].material).toBe(after);
    });

    test('same settings are batched together, different textures are not', () => {
        const scene = new Scene();
        const renderer = new WebGPUBatchedRenderer();
        const a = makeSystem(RenderMode.BillBoard, {shape: new PointEmitter()});
        const b = makeSystem(RenderMode.BillBoard, {shape: new PointEmitter(), material: a.material.clone()});
        (b.material as MeshBasicMaterial).map = (a.material as MeshBasicMaterial).map;
        scene.add(a.emitter, b.emitter, renderer);
        renderer.addSystem(a);
        renderer.addSystem(b);
        expect(renderer.batches.length).toBe(1);
        b.texture = new Texture();
        renderer.update(0.016);
        expect(renderer.batches.length).toBe(2);
    });
});
