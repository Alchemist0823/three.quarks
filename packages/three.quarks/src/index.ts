import {loadPlugin} from 'quarks.core';
import {MeshSurfaceEmitterPlugin} from './MeshSurfaceEmitter';
import {registerShaderChunks} from './shaders';

export * from 'quarks.core';
export * from './BatchedParticleRenderer';
export * from './BatchedRenderer';
export * from './materials/';
export * from './MeshSurfaceEmitter';
export * from './ParticleEmitter';
export * from './ParticleSystem';
export * from './QuarksLoader';
export * from './QuarksPrefab';
export * from './QuarksUtil';
export * from './shaders/';
export * from './SpriteBatch';
export * from './TrailBatch';
export * from './VFXBatch';

registerShaderChunks();
loadPlugin(MeshSurfaceEmitterPlugin);

// Remove this line if you have pro license
console.log('%c Particle system powered by three.quarks. https://quarks.art/', 'font-size: 14px; font-weight: bold;');
