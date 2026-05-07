import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    RenderMode,
    ConstantValue,
    IntervalValue,
    ConstantColor,
    PointEmitter,
    ConeEmitter,
    SizeOverLife,
    ColorOverLife,
    RotationOverLife,
    FrameOverLife,
    PiecewiseBezier,
    Bezier,
    ColorRange,
    RandomColor,
    Vector4,
} from 'babylon.quarks';
import {createSharedTexture} from '../shared/common.js';

export function initMuzzleFlashBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 10, 10));
    const texture = createSharedTexture(scene);

    for (let i = 0; i < 100; i++) {
        const posX = Math.floor(i / 10) * 2 - 10;
        const posZ = (i % 10) * 2 - 10;
        const position = new BVector3(posX, 0, posZ);

        const beam = new ParticleSystem({
            scene,
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.1, 0.2),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(4),
            startColor: new ConstantColor(new Vector4(1, 0.585716, 0.1691176, 1)),
            worldSpace: false,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{time: 0, count: new ConstantValue(1), cycle: 1, interval: 0.01, probability: 1}],
            shape: new PointEmitter(),
            renderMode: RenderMode.BillBoard,
            texture,
            transparent: true,
            blendMode: Constants.ALPHA_ADD,
            startTileIndex: new ConstantValue(1),
            uTileCount: 10,
            vTileCount: 10,
        });
        beam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        beam.emitter.position = position.clone();
        batchRenderer.addSystem(beam);
        systems.push(beam);

        const flash = new ParticleSystem({
            scene,
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.1, 0.2),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(1, 2.5),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: false,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{time: 0, count: new ConstantValue(2), cycle: 1, interval: 0.01, probability: 1}],
            shape: new PointEmitter(),
            renderMode: RenderMode.BillBoard,
            texture,
            transparent: true,
            blendMode: Constants.ALPHA_ADD,
            startTileIndex: new ConstantValue(81),
            uTileCount: 10,
            vTileCount: 10,
        });
        flash.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 0.95, 0.82, 1), new Vector4(1, 0.38, 0.12, 1))));
        flash.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(81, 84.333, 87.666, 91), 0]])));
        flash.emitter.position = position.clone();
        batchRenderer.addSystem(flash);
        systems.push(flash);

        const muzzleConfig = {
            scene,
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.1, 0.2),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(1, 5),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: false,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{time: 0, count: new ConstantValue(1), cycle: 1, interval: 0.01, probability: 1}],
            shape: new PointEmitter(),
            renderMode: RenderMode.BillBoard,
            texture,
            transparent: true,
            blendMode: Constants.ALPHA_ADD,
            startTileIndex: new ConstantValue(91),
            uTileCount: 10,
            vTileCount: 10,
        };

        const muzzle1 = new ParticleSystem(muzzleConfig);
        muzzle1.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 0.3882312, 0.125, 1), new Vector4(1, 0.826827, 0.3014706, 1))));
        muzzle1.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        muzzle1.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(91, 94, 97, 100), 0]])));
        muzzle1.emitter.position = position.clone();
        muzzle1.emitter.position.x += 1;
        batchRenderer.addSystem(muzzle1);
        systems.push(muzzle1);

        const muzzle2 = new ParticleSystem(muzzleConfig);
        muzzle2.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 0.3882312, 0.125, 1), new Vector4(1, 0.826827, 0.3014706, 1))));
        muzzle2.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        muzzle2.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(91, 94, 97, 100), 0]])));
        muzzle2.emitter.position = position.clone();
        muzzle2.emitter.position.x += 1;
        muzzle2.emitter.rotation.x = Math.PI / 2;
        batchRenderer.addSystem(muzzle2);
        systems.push(muzzle2);

        const smoke = new ParticleSystem({
            scene,
            duration: 2.5,
            looping: false,
            startLife: new IntervalValue(0.6, 0.8),
            startSpeed: new IntervalValue(0.1, 3),
            startSize: new IntervalValue(0.75, 1.5),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new RandomColor(new Vector4(0.6323, 0.6323, 0.6323, 0.31), new Vector4(1, 1, 1, 0.54)),
            worldSpace: true,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{time: 0, count: new ConstantValue(5), cycle: 1, interval: 0.01, probability: 1}],
            shape: new ConeEmitter({angle: (20 * Math.PI) / 180, radius: 0.3, thickness: 1, arc: Math.PI * 2}),
            renderMode: RenderMode.BillBoard,
            texture,
            transparent: true,
            blendMode: Constants.ALPHA_COMBINE,
            startTileIndex: new ConstantValue(81),
            uTileCount: 10,
            vTileCount: 10,
        });
        smoke.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 0))));
        smoke.addBehavior(new RotationOverLife(new IntervalValue(-Math.PI / 4, Math.PI / 4)));
        smoke.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(28, 31, 34, 37), 0]])));
        smoke.emitter.position = position.clone();
        batchRenderer.addSystem(smoke);
        systems.push(smoke);

        const particles = new ParticleSystem({
            scene,
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.2, 0.6),
            startSpeed: new IntervalValue(1, 15),
            startSize: new IntervalValue(0.1, 0.3),
            startColor: new RandomColor(new Vector4(1, 0.91, 0.51, 1), new Vector4(1, 0.44, 0.16, 1)),
            worldSpace: true,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{time: 0, count: new ConstantValue(8), cycle: 1, interval: 0.01, probability: 1}],
            shape: new ConeEmitter({angle: (20 * Math.PI) / 180, radius: 0.3, thickness: 1, arc: Math.PI * 2}),
            renderMode: RenderMode.StretchedBillBoard,
            speedFactor: 0.4,
            texture,
            transparent: true,
            blendMode: Constants.ALPHA_ADD,
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
        });
        particles.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        particles.emitter.position = position;
        particles.emitter.rotation.y = Math.PI / 2;
        batchRenderer.addSystem(particles);
        systems.push(particles);
    }
}
