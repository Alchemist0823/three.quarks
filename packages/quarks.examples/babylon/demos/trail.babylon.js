import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    RenderMode,
    ConstantValue,
    IntervalValue,
    ConeEmitter,
    SizeOverLife,
    ApplyForce,
    PiecewiseBezier,
    Bezier,
    ColorRange,
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
        looping: true,
        startLife: new IntervalValue(2, 3),
        startSpeed: new IntervalValue(5, 10),
        startSize: new ConstantValue(0.5),
        startColor: new ColorRange(new Vector4(1, 0.5, 0.1, 1), new Vector4(1, 0.8, 0.3, 1)),
        worldSpace: false,
        emissionOverTime: new ConstantValue(5),
        shape: new ConeEmitter({radius: 0.1, angle: 0.8}),
        renderMode: RenderMode.Trail,
        rendererEmitterSettings: {startLength: new ConstantValue(20), followLocalOrigin: false},
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        startTileIndex: new ConstantValue(0),
        uTileCount: 10,
        vTileCount: 10,
    });
    trail.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
    trail.addBehavior(new ApplyForce(new Vector3(0, -1, 0), new ConstantValue(10)));
    trail.emitter.position = new BVector3(0, 3, 0);
    batchRenderer.addSystem(trail);
    systems.push(trail);
}
