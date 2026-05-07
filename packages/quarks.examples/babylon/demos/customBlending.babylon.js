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

function addBlendSystem({scene, batchRenderer, systems, texture, blendMode, position, color}) {
    const system = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new IntervalValue(1, 1.8),
        startSpeed: new ConstantValue(0),
        startSize: new ConstantValue(2),
        startColor: new ConstantColor(color),
        emissionOverTime: new ConstantValue(20),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode,
    });
    system.emitter.position = position;
    batchRenderer.addSystem(system);
    systems.push(system);
}

export function initCustomBlendingBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 6, 14));
    const texture = createSharedTexture(scene, SHARED_ASSETS.defaultParticle);
    addBlendSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        blendMode: Constants.ALPHA_ADD,
        position: new BVector3(-4, 0, 0),
        color: new Vector4(1, 0.4, 0.2, 1),
    });
    addBlendSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        blendMode: Constants.ALPHA_COMBINE,
        position: new BVector3(0, 0, 0),
        color: new Vector4(0.2, 0.8, 1, 1),
    });
    addBlendSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        blendMode: Constants.ALPHA_MULTIPLY,
        position: new BVector3(4, 0, 0),
        color: new Vector4(0.8, 1, 0.4, 1),
    });
}
