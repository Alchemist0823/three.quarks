import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    PointEmitter,
    RenderMode,
    ConstantColor,
    PiecewiseBezier,
    Bezier,
    SpeedOverLife,
    Vector4,
} from 'babylon.quarks';
import {createSharedTexture} from '../shared/common.js';

function createSystem({scene, batchRenderer, systems, texture, renderMode, position, color, speedFactor}) {
    const system = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new ConstantValue(4),
        startSpeed: new ConstantValue(1),
        startSize: new ConstantValue(1.5),
        startColor: new ConstantColor(color),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{time: 0, count: new ConstantValue(10), cycle: 1, interval: 0.01, probability: 1}],
        shape: new PointEmitter(),
        renderMode,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_COMBINE,
        speedFactor,
    });
    system.emitter.position = position;
    system.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
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
        renderMode: RenderMode.VerticalBillBoard,
        position: new BVector3(-5, 0, 0),
        color: new Vector4(0.2, 0.8, 1, 1),
    });
    createSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        renderMode: RenderMode.HorizontalBillBoard,
        position: new BVector3(0, 0, 0),
        color: new Vector4(0.5, 1, 0.5, 1),
    });
    createSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        renderMode: RenderMode.StretchedBillBoard,
        position: new BVector3(5, 0, 0),
        color: new Vector4(1, 0.4, 0.9, 1),
        speedFactor: 0,
    });
}
