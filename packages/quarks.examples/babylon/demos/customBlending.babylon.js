import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    SphereEmitter,
    RenderMode,
    ConstantColor,
    SpeedOverLife,
    PiecewiseBezier,
    Bezier,
    Vector4,
} from 'babylon.quarks';
import {createSharedTexture, SHARED_ASSETS} from '../shared/common.js';

function addBlendSystem({scene, batchRenderer, systems, texture, blendMode, position, color}) {
    const system = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new IntervalValue(4, 5),
        startSpeed: new ConstantValue(0),
        startSize: new IntervalValue(1, 2),
        startColor: new ConstantColor(color),
        worldSpace: false,
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{time: 0, count: new ConstantValue(10), cycle: 1, interval: 0.01, probability: 1}],
        shape: new SphereEmitter({radius: 3}),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode,
        startTileIndex: new ConstantValue(0),
        uTileCount: 1,
        vTileCount: 1,
        renderOrder: 2,
    });
    system.emitter.position = position;
    system.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
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
        position: new BVector3(-5, 0, 0),
        color: new Vector4(0.5, 0.5, 0.5, 1),
    });
    addBlendSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        blendMode: Constants.ALPHA_COMBINE,
        position: new BVector3(0, 0, 0),
        color: new Vector4(0.5, 0.5, 0.5, 1),
    });
    addBlendSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        blendMode: Constants.ALPHA_SUBTRACT,
        position: new BVector3(5, 0, 0),
        color: new Vector4(0.5, 0.5, 0.5, 1),
    });
}
