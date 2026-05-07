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
import {createSharedTexture} from '../shared/common.js';

function createSystem({scene, batchRenderer, systems, texture, renderMode, position, color, speedFactor}) {
    const system = new ParticleSystem({
        scene,
        duration: 6,
        looping: true,
        startLife: new IntervalValue(1.2, 2),
        startSpeed: new ConstantValue(0.2),
        startSize: new ConstantValue(2),
        startColor: new ConstantColor(color),
        emissionOverTime: new ConstantValue(25),
        shape: new PointEmitter(),
        renderMode,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        speedFactor,
    });
    system.emitter.position = position;
    batchRenderer.addSystem(system);
    systems.push(system);
}

export function initBillboardBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 6, 18));
    const texture = createSharedTexture(scene, 'textures/triangle_curve.png');
    createSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        renderMode: RenderMode.BillBoard,
        position: new BVector3(-6, 0, 0),
        color: new Vector4(1, 0.6, 0.2, 1),
    });
    createSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        renderMode: RenderMode.HorizontalBillBoard,
        position: new BVector3(-2, 0, 0),
        color: new Vector4(0.2, 0.8, 1, 1),
    });
    createSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        renderMode: RenderMode.VerticalBillBoard,
        position: new BVector3(2, 0, 0),
        color: new Vector4(0.5, 1, 0.5, 1),
    });
    createSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        renderMode: RenderMode.StretchedBillBoard,
        position: new BVector3(6, 0, 0),
        color: new Vector4(1, 0.4, 0.9, 1),
        speedFactor: 0.5,
    });
}
