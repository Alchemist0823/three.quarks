import {
    ApplyForce,
    BatchedRenderer,
    Bezier,
    ConstantColor,
    ConstantValue,
    ParticleSystem,
    PiecewiseBezier,
    RenderMode,
    SizeOverLife,
    SphereEmitter,
} from '../src';
import {Vector3, Vector4} from 'quarks.core';
import {MeshBasicMaterial, NormalBlending, Scene, Texture} from 'three';

describe('BatchedRenderer', () => {
    test('texture swap', () => {
        const scene = new Scene();

        const renderer = new BatchedRenderer();
        const texture = new Texture();
        const glowBeam = new ParticleSystem({
            duration: 1,
            looping: true,
            startLife: new ConstantValue(2.0),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(3.5),
            startColor: new ConstantColor(new Vector4(1, 0.1509503, 0.07352942, 0.5)),
            rendererEmitterSettings: {startLength: new ConstantValue(40)},
            worldSpace: true,
            emissionOverTime: new ConstantValue(100),

            shape: new SphereEmitter({
                radius: 0.0001,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            material: new MeshBasicMaterial({map: texture, blending: NormalBlending}),
            startTileIndex: new ConstantValue(1),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 2,
            renderMode: RenderMode.Trail,
        });
        glowBeam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        glowBeam.addBehavior(new ApplyForce(new Vector3(0, 1, 0), new ConstantValue(10)));
        glowBeam.emitter.name = 'glowBeam';
        renderer.addSystem(glowBeam);

        scene.add(glowBeam.emitter);
        scene.add(renderer);

        renderer.update(1 / 60);

        expect(glowBeam.particleNum).toBeGreaterThan(0);

        const previousCount = glowBeam.particleNum;

        const texture2 = new Texture();
        glowBeam.texture = texture2;

        renderer.update(1);

        expect(renderer.batches.length).toEqual(2);
    });

    test('update', () => {
        const scene = new Scene();

        const renderer = new BatchedRenderer();
        const texture = new Texture();
        const glowBeam = new ParticleSystem({
            duration: 1,
            looping: true,
            startLife: new ConstantValue(2.0),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(3.5),
            startColor: new ConstantColor(new Vector4(1, 0.1509503, 0.07352942, 0.5)),
            rendererEmitterSettings: {startLength: new ConstantValue(40)},
            worldSpace: true,
            emissionOverTime: new ConstantValue(100),

            shape: new SphereEmitter({
                radius: 0.0001,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            material: new MeshBasicMaterial({map: texture, blending: NormalBlending}),
            startTileIndex: new ConstantValue(1),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 2,
            renderMode: RenderMode.Trail,
        });
        glowBeam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        glowBeam.addBehavior(new ApplyForce(new Vector3(0, 1, 0), new ConstantValue(10)));
        glowBeam.emitter.name = 'glowBeam';
        renderer.addSystem(glowBeam);

        scene.add(glowBeam.emitter);
        scene.add(renderer);

        renderer.update(1 / 60);

        expect(glowBeam.particleNum).toBeGreaterThan(0);

        const previousCount = glowBeam.particleNum;

        scene.remove(glowBeam.emitter);
        renderer.update(1);

        expect(glowBeam.particleNum).toEqual(previousCount);
        expect(renderer.batches[0].systems.size).toEqual(0);
    });
});
