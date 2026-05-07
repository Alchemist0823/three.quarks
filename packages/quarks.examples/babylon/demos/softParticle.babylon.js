import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    PointEmitter,
    RenderMode,
    ConstantColor,
    Vector4,
} from 'babylon.quarks';
import {createSharedTexture, SHARED_ASSETS} from '../shared/common.js';

export function initSoftParticleBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 7, 16));
    const texture = createSharedTexture(scene, SHARED_ASSETS.smoke);

    // TODO: three demo uses depth-texture soft particles; Babylon fallback keeps visual smoke without depth fade.
    const softFallback = new ParticleSystem({
        scene,
        duration: 6,
        looping: true,
        startLife: new IntervalValue(1.5, 2.5),
        startSpeed: new IntervalValue(0.2, 0.8),
        startSize: new IntervalValue(1.8, 3),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 0.8)),
        emissionOverTime: new ConstantValue(18),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_COMBINE,
    });
    batchRenderer.addSystem(softFallback);
    systems.push(softFallback);
}
