import {
    CubeTexture,
    Vector3,
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
    TRAIL_POINT_LAYOUT,
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
            // WebGL: two vertices per point (17 floats each) + indices; WebGPU: one 12 float record per point
            expect(glBatch).toBeInstanceOf(TrailBatch);
            const a = (glBatch as TrailBatch).vertexBuffer.array as Float32Array;
            const b = (gpuBatch as WebGPUTrailBatch).points.array as Float32Array;
            const V = TRAIL_VERTEX_LAYOUT;
            const P = TRAIL_POINT_LAYOUT;
            const points = (gpuBatch as WebGPUTrailBatch).geometry.drawRange.count / 6;
            expect(points).toBeGreaterThan(0);
            expect((glBatch as TrailBatch).geometry.drawRange.count).toBeGreaterThan(0);
            for (let k = 0; k < points; k++) {
                const v = 2 * k * V.stride;
                const w = (2 * k + 1) * V.stride;
                const r = k * P.stride;
                for (let c = 0; c < 3; c++) expect(b[r + P.position + c]).toBeCloseTo(a[v + V.position + c], 5);
                expect(b[r + P.width]).toBeCloseTo(a[v + V.width], 5);
                for (let c = 0; c < 4; c++) expect(b[r + P.color + c]).toBe(a[v + V.color + c]);
                expect(b[r + P.u]).toBe(a[v + V.uv]);
                expect(b[r + P.v0]).toBe(a[v + V.uv + 1]);
                expect(b[r + P.v1]).toBe(a[w + V.uv + 1]);
            }
            // 48 bytes per point instead of 2 x 68 bytes + 12 bytes of indices
            expect(P.stride * 4).toBe(48);
        } else {
            expect(glBatch).toBeInstanceOf(SpriteBatch);
            const glSprite = glBatch as SpriteBatch;
            const gpuSprite = gpuBatch as WebGPUSpriteBatch;
            expect(glSprite.geometry.instanceCount).toBe(system.particleNum);
            expect(gpuSprite.geometry.instanceCount).toBe(system.particleNum);
            const used = system.particleNum * glSprite.layout.buffers[0].stride;
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
        expect(layout.buffers.length).toBe(1);
        expect(layout.bytesPerInstance).toBe(64);
        const array = batch.instanceBuffer.array as Float32Array;
        const p = system.particles[0];
        // local space system: offset = emitter world matrix * position
        expect(array[layout.offset.offset]).toBeCloseTo(p.position.x + 10, 4);
        expect(array[layout.offset.offset + 1]).toBeCloseTo(p.position.y, 4);
        expect(array[layout.color.offset]).toBeCloseTo(p.color.x);
        expect(array[layout.color.offset + 3]).toBeCloseTo(p.color.w);
        expect(array[layout.uvTile.offset]).toBeCloseTo(p.uvTile);
        expect(array[layout.velocity!.offset + 3]).toBeCloseTo(2); // lengthFactor
        expect(array[layout.velocity!.offset]).toBeCloseTo(p.velocity.x * 0.5, 4); // speedFactor
        // the whole batch is one interleaved buffer with a single update range
        expect(batch.instanceBuffer.updateRanges).toEqual([
            {start: 0, count: system.particleNum * layout.buffers[0].stride},
        ]);
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
        const o = layout.offset.offset,
            r = layout.rotation.offset,
            z = layout.size.offset;
        expect(array[o]).toBeCloseTo(pos.x, 4);
        expect(array[o + 1]).toBeCloseTo(pos.y, 4);
        expect(array[o + 2]).toBeCloseTo(pos.z, 4);
        expect(array[r]).toBeCloseTo(q.x, 4);
        expect(array[r + 1]).toBeCloseTo(q.y, 4);
        expect(array[r + 2]).toBeCloseTo(q.z, 4);
        expect(array[r + 3]).toBeCloseTo(q.w, 4);
        expect(array[z]).toBeCloseTo(p.size.x * 2, 4);
        expect(array[z + 1]).toBeCloseTo(p.size.y * 3, 4);
        expect(array[z + 2]).toBeCloseTo(p.size.z * 4, 4);
        // GLSL attribute names are unchanged, now backed by one interleaved buffer
        for (const name of ['offset', 'rotation', 'size', 'uvTile', 'color']) {
            expect((batch.geometry.getAttribute(name) as any).isInterleavedBufferAttribute).toBe(true);
            expect((batch.geometry.getAttribute(name) as any).data).toBe(batch.instanceBuffer);
        }
    });

    test('WebGL trail batches use 16 bit indices while possible', () => {
        const renderer = new WebGLBatchedRenderer();
        renderer.addSystem(makeSystem(RenderMode.Trail));
        const batch = renderer.batches[0] as TrailBatch;
        expect(batch.indexBuffer.array).toBeInstanceOf(Uint16Array);
        expect(batch.vertexBuffer.stride).toBe(TRAIL_VERTEX_LAYOUT.stride);
        batch.expandBuffers(70000);
        expect(batch.indexBuffer.array).toBeInstanceOf(Uint32Array);
    });

    test('WebGPU trails: one storage record per point, six vertices per segment, live bounds', () => {
        const scene = new Scene();
        const renderer = new WebGPUBatchedRenderer();
        const system = makeSystem(RenderMode.Trail, {worldSpace: true});
        scene.add(system.emitter, renderer);
        renderer.addSystem(system);
        for (let i = 0; i < 8; i++) renderer.update(0.05);
        const batch = renderer.batches[0] as WebGPUTrailBatch;
        let points = 0;
        for (let j = 0; j < system.particleNum; j++) points += (system.particles[j] as any).previous.length;
        expect(points).toBeGreaterThan(0);
        expect(batch.geometry.drawRange.count).toBe(points * 6);
        expect(batch.geometry.getIndex()).toBeNull();
        expect(Object.keys(batch.geometry.attributes)).toHaveLength(0);
        expect(batch.points.updateRanges).toEqual([{start: 0, count: points * TRAIL_POINT_LAYOUT.stride}]);
        // first / last flags of the first trail
        const data = batch.points.array as Float32Array;
        const first = (system.particles[0] as any).previous.length;
        expect(data[TRAIL_POINT_LAYOUT.flags] % 2).toBe(1);
        expect(data[(first - 1) * TRAIL_POINT_LAYOUT.stride + TRAIL_POINT_LAYOUT.flags]).toBeGreaterThanOrEqual(2);
        // bounding sphere follows the points (used for transparent sorting)
        const sphere = batch.geometry.boundingSphere!;
        expect(sphere.radius).toBeGreaterThan(0);
        expect(sphere.containsPoint(new Vector3(data[0], data[1], data[2]))).toBe(true);
        expect(batch.material).toBeInstanceOf(ParticleTrailNodeMaterial);
    });

    test('half float layout splits float32 / float16 data (stand-in Float16Array)', () => {
        const g = globalThis as any;
        const original = g.Float16Array;
        // Node has no native Float16Array: a Float32Array subclass is enough to verify the placement of every field
        g.Float16Array = class extends Float32Array {};
        try {
            for (const mode of [RenderMode.BillBoard, RenderMode.StretchedBillBoard, RenderMode.Mesh]) {
                const half = getSpriteInstanceLayout(mode, {halfFloat: true});
                const full = getSpriteInstanceLayout(mode);
                expect(half.buffers.length).toBe(2);
                expect(half.buffers[1].half).toBe(true);
                expect(half.bytesPerInstance).toBeLessThan(full.bytesPerInstance);
                for (const b of half.buffers) {
                    for (const attribute of b.attributes) {
                        if (b.half) expect([2, 4]).toContain(attribute.itemSize); // no float16x3 vertex format
                    }
                }

                const scene = new Scene();
                const renderer = new WebGPUBatchedRenderer({halfFloat: true});
                const extra: Record<string, unknown> = {worldSpace: true};
                if (mode === RenderMode.Mesh) extra.startRotation = new RandomQuatGenerator();
                const system = makeSystem(mode, extra);
                scene.add(system.emitter, renderer);
                renderer.addSystem(system);
                renderer.update(0.1);
                const batch = renderer.batches[0] as WebGPUSpriteBatch;
                expect(batch.instanceBuffers.length).toBe(2);
                const p = system.particles[0] as any;
                const field = (f: {buffer: number; offset: number}, k = 0) =>
                    (batch.instanceBuffers[f.buffer].array as Float32Array)[f.offset + k];
                expect(field(half.offset)).toBeCloseTo(p.position.x, 5);
                expect(field(half.color, 1)).toBeCloseTo(p.color.y, 5);
                expect(field(half.size, 2)).toBeCloseTo(p.size.z, 5);
                expect(field(half.uvTile)).toBeCloseTo(p.uvTile, 5);
                if (mode === RenderMode.Mesh) expect(field(half.rotation, 3)).toBeCloseTo(p.rotation.w, 5);
                else expect(field(half.rotation)).toBeCloseTo(p.rotation, 5);
                for (let b = 0; b < 2; b++) {
                    expect(batch.instanceBuffers[b].updateRanges).toEqual([
                        {start: 0, count: system.particleNum * half.buffers[b].stride},
                    ]);
                }
            }
        } finally {
            g.Float16Array = original;
        }
    });

    test('batches of the same kind share one node graph (one shader build)', () => {
        const renderer = new WebGPUBatchedRenderer();
        const a = makeSystem(RenderMode.BillBoard);
        const b = makeSystem(RenderMode.BillBoard, {
            material: new MeshBasicMaterial({map: new Texture(), blending: NormalBlending, transparent: true}),
            uTileCount: 4,
            vTileCount: 4,
        });
        const c = makeSystem(RenderMode.StretchedBillBoard);
        renderer.addSystem(a);
        renderer.addSystem(b);
        renderer.addSystem(c);
        expect(renderer.batches.length).toBe(3);
        const [ma, mb, mc] = renderer.batches.map((x) => x.material as ParticleSpriteNodeMaterial);
        // different textures and tile counts, same structure => same graph and program key
        expect(ma.colorNode).toBe(mb.colorNode);
        expect(ma.customProgramCacheKey()).toBe(mb.customProgramCacheKey());
        expect((mb as any).uTileCount).toBe(4);
        expect((ma as any).map).not.toBe((mb as any).map);
        // a different render mode builds its own vertex stage
        expect(mc.customProgramCacheKey()).not.toBe(ma.customProgramCacheKey());
    });

    test('compositing: transparent batches blend in display space with a shader depth test', () => {
        const renderer = new WebGPUBatchedRenderer();
        const transparent = makeSystem(RenderMode.BillBoard, {softParticles: true, softNearFade: 0, softFarFade: 1});
        const opaque = makeSystem(RenderMode.BillBoard, {
            material: new MeshBasicMaterial({map: new Texture(), transparent: false}),
        });
        renderer.addSystem(transparent);
        renderer.addSystem(opaque);
        const depth = new DepthTexture(4, 4);
        renderer.setCompositing(depth);
        const t = renderer.batches[0].material as any;
        const o = renderer.batches[1].material as any;
        expect(t.depthTest).toBe(false);
        expect(t.maskNode).not.toBeNull();
        expect(t.depthTexture).toBe(depth);
        expect(t.softParticles).toBe(true);
        expect(o.depthTest).toBe(true);
        expect(o.maskNode).toBeNull();
        renderer.setCompositing(null);
        expect((renderer.batches[0].material as any).depthTest).toBe(true);
    });

    test('lit particles wait for a still-loading CubeTexture env map (three r187 workaround)', () => {
        const envMap = new CubeTexture();
        const scene = new Scene();
        const renderer = new WebGPUBatchedRenderer();
        const system = makeSystem(RenderMode.Mesh, {
            instancingGeometry: new BoxGeometry(),
            startRotation: new RandomQuatGenerator(),
            material: new MeshStandardMaterial({envMap}),
        });
        scene.add(system.emitter, renderer);
        renderer.addSystem(system);
        renderer.update(0.016);
        expect((renderer.batches[0].material as any).envMap).toBeNull();
        envMap.needsUpdate = true; // what CubeTextureLoader does once all six images are loaded
        renderer.update(0.016);
        expect((renderer.batches[0].material as any).envMap).toBe(envMap);
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

    test('opaque soft particles fade only against a depth texture', () => {
        const renderer = new WebGPUBatchedRenderer();
        const opaque = makeSystem(RenderMode.BillBoard, {
            softParticles: true,
            softNearFade: 0,
            softFarFade: 1,
            material: new MeshBasicMaterial({map: new Texture(), transparent: false}),
        });
        const transparent = makeSystem(RenderMode.BillBoard, {softParticles: true, softNearFade: 0, softFarFade: 1});
        renderer.addSystem(opaque);
        renderer.addSystem(transparent);
        expect((renderer.batches[0].material as ParticleSpriteNodeMaterial).softParticles).toBe(false);
        expect((renderer.batches[1].material as ParticleSpriteNodeMaterial).softParticles).toBe(true);
        renderer.setDepthTexture(new DepthTexture(4, 4));
        expect((renderer.batches[0].material as ParticleSpriteNodeMaterial).softParticles).toBe(true);
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
