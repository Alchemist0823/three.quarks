import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    RenderMode,
    ConstantValue,
    ConstantColor,
    IntervalValue,
    ConeEmitter,
    SizeOverLife,
    ColorOverLife,
    ApplyForce,
    ApplyCollision,
    PiecewiseBezier,
    Bezier,
    Gradient,
    RandomColorBetweenGradient,
    Vector4,
    Vector3,
} from 'babylon.quarks';
import {createSharedTexture} from '../shared/common.js';

export function initTrailBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 5, 20));
    const texture = createSharedTexture(scene);

    const trail = new ParticleSystem({
        scene,
        duration: 5,
        looping: false,
        startLife: new IntervalValue(3.8, 4.4),
        startSpeed: new IntervalValue(10, 15),
        startSize: new ConstantValue(0.2),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
        worldSpace: true,
        maxParticle: 10,
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{time: 0, count: new ConstantValue(100), cycle: 1, interval: 0.01, probability: 1}],
        shape: new ConeEmitter({radius: 0.1, angle: 1}),
        renderMode: RenderMode.Trail,
        rendererEmitterSettings: {startLength: new ConstantValue(20)},
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        startTileIndex: new ConstantValue(0),
        uTileCount: 10,
        vTileCount: 10,
    });
    trail.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
    trail.addBehavior(
        new ColorOverLife(
            new RandomColorBetweenGradient(
                new Gradient([[new Vector3(1, 0, 0), 0], [new Vector3(1, 0, 0), 1]], [[1, 0], [1, 1]]),
                new Gradient([[new Vector3(0, 1, 0), 0], [new Vector3(0, 1, 0), 1]], [[1, 0], [1, 1]])
            )
        )
    );
    trail.addBehavior(new ApplyForce(new Vector3(0, -1, 0), new ConstantValue(20)));
    trail.addBehavior(
        new ApplyCollision(
            {
                resolve(pos, normal) {
                    if (pos.y <= -6) {
                        normal.set(0, 1, 0);
                        return true;
                    }
                    return false;
                },
            },
            0.6
        )
    );
    trail.emitter.rotation.x = -Math.PI / 2;
    batchRenderer.addSystem(trail);
    systems.push(trail);
}

export function updateTrailBabylonDemo({systems, demoState}, delta) {
    const refreshTime = 5;
    demoState.totalTime += delta;
    if (demoState.totalTime > refreshTime) {
        demoState.totalTime = 0;
        for (const system of systems) {
            system.restart();
            system.play();
        }
    }
}
