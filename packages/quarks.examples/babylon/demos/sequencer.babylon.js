import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    PointEmitter,
    RenderMode,
    ConstantColor,
    FrameOverLife,
    PiecewiseBezier,
    Bezier,
    Vector4,
} from 'babylon.quarks';
import {createSharedTexture, SHARED_ASSETS} from '../shared/common.js';

export function initSequencerBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 7, 14));
    const texture = createSharedTexture(scene, SHARED_ASSETS.sequenceText);

    // TODO: Babylon runtime currently lacks TextureSequencer/ApplySequences parity API used in three demo; fallback uses frame animation.
    const sequence = new ParticleSystem({
        scene,
        duration: 6,
        looping: true,
        startLife: new IntervalValue(1.2, 2),
        startSpeed: new ConstantValue(0),
        startSize: new IntervalValue(1, 1.8),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
        emissionOverTime: new ConstantValue(24),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        startTileIndex: new ConstantValue(0),
        uTileCount: 8,
        vTileCount: 8,
    });
    sequence.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(0, 20, 40, 63), 0]])));
    batchRenderer.addSystem(sequence);
    systems.push(sequence);
}
