import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    ConeEmitter,
    RenderMode,
    RandomColor,
    Vector4,
    Noise,
} from 'babylon.quarks';
import {createSharedTexture} from '../shared/common.js';

export function initTurbulenceBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 8, 15));
    const texture = createSharedTexture(scene);

    const turbulence = new ParticleSystem({
        scene,
        duration: 1,
        looping: true,
        startLife: new ConstantValue(4),
        startSpeed: new IntervalValue(5, 6),
        startSize: new ConstantValue(0.1),
        startColor: new RandomColor(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 1)),
        worldSpace: true,
        emissionOverTime: new ConstantValue(500),
        shape: new ConeEmitter({radius: 0.5, angle: 0.5}),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        startTileIndex: new ConstantValue(0),
        uTileCount: 10,
        vTileCount: 10,
        renderOrder: 0,
    });
    turbulence.addBehavior(new Noise(new ConstantValue(1), new ConstantValue(2)));
    turbulence.emitter.rotation.x = -Math.PI / 2;
    turbulence.emitter.position.y = -8;
    batchRenderer.addSystem(turbulence);
    systems.push(turbulence);
}
