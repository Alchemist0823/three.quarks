import type {ParticleSystem} from './ParticleSystem';

/**
 * Takes over the per-particle simulation of a {@link ParticleSystem}, for example on the GPU
 * (see `GPUParticleSimulation` in `three.quarks/webgpu`).
 *
 * Emission stays on the CPU and is unchanged: emission rates, bursts, emitter shapes, start values and every
 * behavior's `initialize()` / `frameUpdate()` run exactly as before. Particles spawned since the last step (by the
 * system itself or by a parent's `EmitSubParticleSystem`) are in `system.particles[0 .. spawnCount)` and are handed
 * to {@link step}; the delegate copies them into its own storage and simulates them. While a delegate is set,
 * `system.particles` is only that scratch list and `system.particleNum` is the delegate's count of live particles.
 */
export interface ParticleSimulationDelegate {
    /**
     * Simulates one step.
     * @param system the particle system
     * @param spawnCount number of particles spawned this step, in `system.particles[0 .. spawnCount)`
     * @param delta step duration in seconds
     * @returns the number of live particles after the step
     */
    step(system: ParticleSystem, spawnCount: number, delta: number): number;

    /** Removes all particles (`restart()` / `stop()`). */
    clear(): void;
}
