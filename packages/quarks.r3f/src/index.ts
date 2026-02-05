// Context and provider
export { QuarksProvider, useQuarks } from './QuarksContext';

// Components
export { ParticleSystem } from './components/ParticleSystem';
export { QuarksEffect } from './components/QuarksEffect';

// Hooks
export { useParticleSystem } from './hooks/useParticleSystem';
export { useQuarksEffect } from './hooks/useQuarksEffect';

// Types
export type {
    ParticleSystemProps,
    ParticleSystemRef,
    QuarksEffectProps,
    QuarksEffectRef,
    QuarksContextValue,
    UseParticleSystemReturn,
    UseQuarksEffectReturn,
    FlexibleValue,
    FlexibleColor,
    // Re-exported from three.quarks for convenience
    ParticleSystemParameters,
    BurstParameters,
    RenderMode,
    BatchedRenderer,
    ParticleEmitter,
    Behavior,
    EmitterShape,
    ValueGenerator,
    FunctionValueGenerator,
    ColorGenerator,
    FunctionColorGenerator,
} from './types';

// Utilities
export { toValueGenerator, toColorGenerator } from './utils';
