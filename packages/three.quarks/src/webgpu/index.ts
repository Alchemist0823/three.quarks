/**
 * `three.quarks/webgpu` – three.quarks for three.js `WebGPURenderer`.
 *
 * Re-exports the whole renderer-agnostic API of `three.quarks` (particle systems, behaviors,
 * emitters, loaders, ...) and replaces `BatchedRenderer` / `BatchedParticleRenderer` with the
 * WebGPU (TSL node material) implementation, so switching an application from WebGL to WebGPU is a
 * one line import change.
 *
 * Shared classes are imported from `three.quarks` (not bundled again), so mixing imports from
 * `three.quarks` and `three.quarks/webgpu` in one application is safe.
 */
import {WebGPUBatchedRenderer} from './WebGPUBatchedRenderer';

export * from 'three.quarks';
export * from './ParticleNodes';
export * from './ParticleNodeMaterials';
export * from './PerformanceProfile';
export * from './WebGPUBatches';
export * from './WebGPUBatchedRenderer';
export * from './QuarksCompositor';

/**
 * WebGPU batch renderer (alias of {@link WebGPUBatchedRenderer}).
 */
export const BatchedRenderer = WebGPUBatchedRenderer;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type BatchedRenderer = WebGPUBatchedRenderer;

/**
 * @deprecated use `BatchedRenderer`
 */
export const BatchedParticleRenderer = WebGPUBatchedRenderer;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type BatchedParticleRenderer = WebGPUBatchedRenderer;
