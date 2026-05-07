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

export function initCustomPluginBabylonDemo({scene, camera, batchRenderer, systems, demoState}) {
    camera.setPosition(new BVector3(0, 7, 14));
    const texture = createSharedTexture(scene);

    // TODO: babylon.quarks currently has no direct loadPlugin parity with three demo; this is an animated fallback behavior.
    const system = new ParticleSystem({
        scene,
        duration: 6,
        looping: true,
        startLife: new IntervalValue(1, 2),
        startSpeed: new ConstantValue(0.3),
        startSize: new IntervalValue(0.3, 0.7),
        startColor: new ConstantColor(new Vector4(0.6, 0.9, 1, 1)),
        emissionOverTime: new ConstantValue(40),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
    });
    batchRenderer.addSystem(system);
    systems.push(system);
    demoState.customPluginFallback = {elapsed: 0, emitter: system.emitter};
}

export function updateCustomPluginBabylonDemo({demoState}, delta) {
    const state = demoState.customPluginFallback;
    if (!state) {
        return;
    }
    state.elapsed += delta;
    state.emitter.position.x = Math.sin(state.elapsed * 2.5) * 4;
    state.emitter.position.y = Math.cos(state.elapsed * 1.8) * 1.5;
}
