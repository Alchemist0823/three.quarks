import {registerShaderChunks} from './shaders';

export * from './ParticleEmitter';
export * from './ParticleSystem';
export * from './VFXBatch';
export * from './SpriteBatch';
export * from './TrailBatch';
export * from './MeshSurfaceEmitter';
export * from './BatchedRenderer';
export * from './BatchedParticleRenderer';
export * from './QuarksLoader';
export * from './QuarksUtil';
export * from './shaders/';
export * from './materials/';
export * from 'quarks.core';

registerShaderChunks();
// remove this line if you have pro license
console.log('%c Particle system powered by three.quarks. https://quarks.art/', 'font-size: 14px; font-weight: bold;');
