import {loadPlugin} from 'quarks.core';
import {MeshSurfaceEmitterPlugin} from './MeshSurfaceEmitter';

export * from './BatchedRenderer';
export * from './VFXBatch';
export * from './SpriteBatch';
export * from './TrailBatch';
export * from './ParticleSystem';
export * from './ParticleEmitter';
export * from './QuarksUtil';
export * from './QuarksLoader';
export * from './MeshSurfaceEmitter';
export * from 'quarks.core';


loadPlugin(MeshSurfaceEmitterPlugin);
// remove this line if you have pro license
console.log('%c Particle system powered by babylon.quarks. https://quarks.art/', 'font-size: 14px; font-weight: bold;');

