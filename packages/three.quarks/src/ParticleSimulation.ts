import type {EmissionState, Matrix4} from 'quarks.core';
import type {ParticleSystem} from './ParticleSystem';

/**
 * Takes over the particles of a {@link ParticleSystem}, for example on the GPU (see `GPUParticleBatchSimulation` in
 * `three.quarks/webgpu`).
 *
 * The system still decides how many particles to emit (emission rate, bursts, emission over distance) and runs every
 * behavior's `frameUpdate()`. Each emission call is first offered to {@link emit}: a delegate that can initialize the
 * particles itself (emitter shape, start values, behavior `initialize()`) takes it. Otherwise the system emits the
 * particles on the CPU as before, into `system.particles[0 .. spawnCount)`, and hands them to {@link step} (this is
 * also how a parent's `EmitSubParticleSystem` emits). While a delegate is set, `system.particles` is only that scratch
 * list and `system.particleNum` is the delegate's count of live particles.
 */
export interface ParticleSimulationDelegate {
    /**
     * Offers an emission call of `count` particles.
     * @param system the particle system
     * @param count number of particles
     * @param emissionState the system's emission state during the call (time, burst)
     * @param matrix the emitter transform the particles are emitted with
     * @returns `true` when the delegate emits the particles itself, `false` to have them emitted on the CPU
     */
    emit?(system: ParticleSystem, count: number, emissionState: EmissionState, matrix: Matrix4): boolean;

    /**
     * Simulates one step.
     * @param system the particle system
     * @param spawnCount number of particles emitted on the CPU this step, in `system.particles[0 .. spawnCount)`
     * @param delta step duration in seconds
     * @returns the number of live particles after the step
     */
    step(system: ParticleSystem, spawnCount: number, delta: number): number;

    /** Removes all particles (`restart()` / `stop()`). */
    clear(): void;
}
