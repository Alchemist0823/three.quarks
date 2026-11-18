/**
 * `quarks.nodes/webgpu`: node graph effects ({@link NodeVFX}) simulated on the GPU with three.js `WebGPURenderer`.
 *
 * Importing this entry registers the TSL compiler of update graphs with `three.quarks/webgpu`; a
 * `WebGPUBatchedRenderer` with `gpuSimulation: 'auto' | 'all'` then runs NodeVFX effects in compute shaders.
 */
export * from 'quarks.nodes';
export * from './TSLGraphCompiler';
