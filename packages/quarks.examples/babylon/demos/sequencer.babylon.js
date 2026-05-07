import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    GridEmitter,
    RenderMode,
    ConstantColor,
    FrameOverLife,
    PiecewiseBezier,
    Bezier,
    TextureSequencer,
    ApplySequences,
    RandomColor,
    Vector3,
    Vector4,
} from 'babylon.quarks';
import {SHARED_ASSETS} from '../shared/common.js';

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}

export async function initSequencerBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 7, 14));
    const image = await loadImage(SHARED_ASSETS.sequenceText);
    const logo = await loadImage(SHARED_ASSETS.sequenceLogo);
    const texture = new Texture(SHARED_ASSETS.atlas, scene);

    const sequence = new ParticleSystem({
        scene,
        duration: 8,
        looping: true,
        startLife: new ConstantValue(7.8),
        startSpeed: new ConstantValue(0),
        startSize: new IntervalValue(0.05, 0.2),
        startColor: new RandomColor(new Vector4(0, 1, 1, 1), new Vector4(1, 0, 1, 1)),
        worldSpace: false,
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{time: 0, count: new ConstantValue(1500), cycle: 1, interval: 1, probability: 1}],
        shape: new GridEmitter({width: 15, height: 15, column: 50, row: 50}),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_COMBINE,
        depthTest: false,
        depthWrite: false,
        startTileIndex: new ConstantValue(0),
        uTileCount: 10,
        vTileCount: 10,
    });
    const seq = new TextureSequencer(0.08, 0.08, new Vector3(-8, 1, 0));
    seq.fromImage(image, 0.5);
    const seq2 = new TextureSequencer(0.08, 0.08, new Vector3(-4, 0, 0));
    seq2.fromImage(logo, 0.3);
    const applySeq = new ApplySequences(0.001);
    applySeq.appendSequencer(new IntervalValue(1.0, 2.0), seq);
    applySeq.appendSequencer(new IntervalValue(5.0, 6.0), seq2);
    sequence.addBehavior(applySeq);
    sequence.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(0, 20, 40, 63), 0]])));
    batchRenderer.addSystem(sequence);
    systems.push(sequence);
}
