import {ShaderChunk} from 'three';
import uv_vertex_tile from './shaders/lib/uv_vertex_tile.glsl';
(ShaderChunk as any)['uv_vertex_tile'] = uv_vertex_tile;

export * from './ParticleEmitter';
export * from './Particle';
export * from './ParticleSystem';
export * from './VFXBatch';
export * from './SpriteBatch';
export * from './TrailBatch';
export * from './BatchedRenderer';
export * from './BatchedParticleRenderer';
export * from './QuarksLoader';
export * from './TypeUtil';
export * from './Plugin';

export * from './shape/';
export * from './functions/';
export * from './behaviors/';
export * from './sequencers/';
export * from './nodes/';

// remove this line if you have pro license
console.log('%c Powered by three.quarks. https://quarks.art/', 'font-size: 16px; font-weight: bold;');
