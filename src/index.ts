import registerShaderChunks from "./shaders/chunks/register-shader-chunks";

export * from './ParticleEmitter';
export * from './Particle';
export * from './ParticleSystem';
export * from './VFXBatch';
export * from './SpriteBatch';
export * from './TrailBatch';
export * from './BatchedRenderer';
export * from './BatchedParticleRenderer';
export * from './WebGPURenderer';
export * from './QuarksLoader';
export * from './TypeUtil';
export * from './Plugin';

export * from './shape/';
export * from './functions/';
export * from './behaviors/';
export * from './sequencers/';
export * from './nodes/';

registerShaderChunks();
// remove this line if you have pro license
console.log('%c Particle system powered by three.quarks. https://quarks.art/', 'font-size: 16px; font-weight: bold;');
