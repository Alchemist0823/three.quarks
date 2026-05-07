import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    PointEmitter,
    RenderMode,
    RandomColor,
    Vector4,
    Noise,
    Vector3,
} from 'babylon.quarks';
import {createSharedTexture} from '../shared/common.js';

export function initTurbulenceBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 8, 15));
    const texture = createSharedTexture(scene);

    const turbulence = new ParticleSystem({
        scene,
        duration: 6,
        looping: true,
        startLife: new IntervalValue(1, 2),
        startSpeed: new IntervalValue(1, 3),
        startSize: new IntervalValue(0.15, 0.35),
        startColor: new RandomColor(new Vector4(0.2, 0.6, 1, 1), new Vector4(0.8, 1, 1, 1)),
        emissionOverTime: new ConstantValue(100),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
    });
    turbulence.addBehavior(new Noise(new Vector3(3, 3, 3), new ConstantValue(2), new ConstantValue(0.5)));
    batchRenderer.addSystem(turbulence);
    systems.push(turbulence);
}
