import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {Constants} from '@babylonjs/core/Engines/constants';
import {ConstantColor, PointEmitter, RenderMode, Vector4, ParticleSystem, ConstantValue} from 'babylon.quarks';

export const SHARED_ASSETS = {
    atlas: 'textures/texture1.png',
    defaultParticle: 'textures/particle_default.png',
    smoke: 'textures/cfxr smoke cloud x4.png',
    sequenceText: 'textures/text_texture.png',
    sequenceLogo: 'textures/logo_texture.png',
};

export function createSharedTexture(scene, path = SHARED_ASSETS.atlas) {
    const texture = new Texture(path, scene);
    // Match three.js defaults used by examples: clamp sampling on sprite atlases.
    texture.wrapU = Texture.CLAMP_ADDRESSMODE;
    texture.wrapV = Texture.CLAMP_ADDRESSMODE;
    return texture;
}

export function addBasicBillboardSystem({
    scene,
    batchRenderer,
    systems,
    texture,
    position,
    color,
    blendMode = Constants.ALPHA_ADD,
}) {
    const system = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new ConstantValue(1),
        startSpeed: new ConstantValue(0),
        startSize: new ConstantValue(2),
        startColor: new ConstantColor(color ?? new Vector4(1, 1, 1, 1)),
        emissionOverTime: new ConstantValue(20),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode,
    });
    if (position) {
        system.emitter.position = position;
    }
    batchRenderer.addSystem(system);
    systems.push(system);
    return system;
}
