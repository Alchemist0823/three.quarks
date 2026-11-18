/* eslint-disable @typescript-eslint/no-explicit-any */
import {ParticleSystem} from 'three.quarks';
import type {GPUCompileContext} from './GPUCompileContext';
import {getGPUBehaviorCompiler, GPUParticleState} from './GPUBehaviors';
import {createBehaviorEmission, GPUEmissionProgram} from './GPUEmission';
import {maxGeneratorValue} from './GPUGenerators';

/**
 * The per-particle update a GPU simulation runs, for one particle system.
 *
 * `ParticleSystem` gets a program generated from its behaviors ({@link createBehaviorProgram}); other particle system
 * types (e.g. the node graph based `NodeVFX` of `quarks.nodes/webgpu`) register their own with
 * {@link registerGPUSimulationProgram}.
 */
export interface GPUSimulationProgram {
    /** why the system cannot be simulated on the GPU, or `null` */
    support(): string | null;
    /** the program keeps per-particle Noise state (adds a slot to the particle layout) */
    usesNoiseState(): boolean;
    /** estimated number of live particles (`gpuSimulation: 'auto'`), `null` if unknown */
    estimateParticleCount(): number | null;
    /**
     * Records the structural values the generated code depends on (`ctx.watch`); called when the kernel is
     * created. A change rebuilds the kernel (or moves the system back to the CPU when {@link support} fails).
     */
    watch(ctx: GPUCompileContext): void;
    /** Emits the TSL code of one update step of particle `p` (called while the kernel is built). */
    compile(ctx: GPUCompileContext, p: GPUParticleState): void;
    /**
     * How particles are emitted on the GPU. Without it (or when its `support()` fails) the system emits on the CPU
     * and its spawned particles are uploaded.
     */
    emission?: GPUEmissionProgram | null;
}

/** Creates the GPU program of a particle system, or returns `null` for systems it does not handle. */
export type GPUSimulationProgramFactory = (system: any) => GPUSimulationProgram | null;

const factories: GPUSimulationProgramFactory[] = [];

/** Registers a GPU program factory for a particle system type (checked before the built-in ones). */
export function registerGPUSimulationProgram(factory: GPUSimulationProgramFactory) {
    if (!factories.includes(factory)) factories.unshift(factory);
}

/** The GPU program of a particle system, or `null` if no registered factory handles its type. */
export function createGPUSimulationProgram(system: any): GPUSimulationProgram | null {
    for (const factory of factories) {
        const program = factory(system);
        if (program) return program;
    }
    return null;
}

// ---- ParticleSystem -----------------------------------------------------------------------------------------

/**
 * The program of a {@link ParticleSystem}: the GPU versions of its behaviors, in order (see `GPUBehaviors`).
 */
export function createBehaviorProgram(system: ParticleSystem): GPUSimulationProgram {
    return {
        support() {
            for (const behavior of system.behaviors) {
                const compiler = getGPUBehaviorCompiler(behavior);
                if (!compiler) return `behavior ${behavior.type} has no GPU version`;
                if (!compiler.supports(behavior, system)) {
                    return `behavior ${behavior.type} uses a generator with no GPU version`;
                }
            }
            return null;
        },
        usesNoiseState() {
            return system.behaviors.some((b) => getGPUBehaviorCompiler(b)?.usesNoiseState === true);
        },
        estimateParticleCount() {
            const rate = maxGeneratorValue(system.emissionOverTime);
            const life = maxGeneratorValue(system.startLife);
            if (rate === null || life === null) return null;
            let estimate = Math.max(0, rate) * Math.max(0, life);
            for (const burst of system.emissionBursts) {
                const count = maxGeneratorValue(burst.count);
                if (count === null) return null;
                estimate += Math.max(0, count) * Math.max(1, burst.cycle ?? 1);
            }
            return estimate;
        },
        watch(ctx) {
            // the behavior list and every behavior (by class) are part of the generated code
            ctx.watch(() => system.behaviors.length);
            system.behaviors.forEach((_, i) => ctx.watch(() => system.behaviors[i]));
        },
        compile(ctx, p) {
            for (const behavior of system.behaviors) {
                getGPUBehaviorCompiler(behavior)!.compile(ctx, behavior, p, system);
            }
        },
        emission: createBehaviorEmission(system),
    };
}

registerGPUSimulationProgram((system) => (system instanceof ParticleSystem ? createBehaviorProgram(system) : null));
