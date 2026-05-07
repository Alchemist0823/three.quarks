import '@babylonjs/core/Rendering/depthRendererSceneComponent';
import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    PointEmitter,
    RenderMode,
    ConstantColor,
    FrameOverLife,
    ForceOverLife,
    PiecewiseBezier,
    Bezier,
    Vector4,
} from 'babylon.quarks';
import {createSharedTexture, SHARED_ASSETS} from '../shared/common.js';

export function initSoftParticleBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 7, 16));
    const texture = createSharedTexture(scene, SHARED_ASSETS.smoke);
    if (typeof scene.enableDepthRenderer === 'function') {
        const depthRenderer = scene.enableDepthRenderer();
        batchRenderer.setDepthTexture(depthRenderer.getDepthMap());
    }

    const softParticles = new ParticleSystem({
        scene,
        duration: 2,
        looping: true,
        startLife: new ConstantValue(2),
        startSpeed: new ConstantValue(10),
        startSize: new ConstantValue(2),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
        worldSpace: true,
        emissionOverTime: new ConstantValue(60),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_COMBINE,
        blendTiles: true,
        startTileIndex: new ConstantValue(0),
        uTileCount: 2,
        vTileCount: 2,
        softParticles: true,
        softNearFade: 0,
        softFarFade: 1,
    });
    softParticles.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(0, 1.33333, 2.66667, 4), 0]])));
    softParticles.addBehavior(new ForceOverLife(new ConstantValue(0), new ConstantValue(-10), new ConstantValue(0)));
    batchRenderer.addSystem(softParticles);
    systems.push(softParticles);
}
