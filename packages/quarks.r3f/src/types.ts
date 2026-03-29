import type {
    ValueGenerator,
    FunctionValueGenerator,
    ColorGenerator,
    FunctionColorGenerator,
    Behavior,
    EmitterShape,
    RendererEmitterSettings,
    RotationGenerator,
    Vector3Generator,
    ConstantValue,
    IntervalValue,
    ConstantColor,
    Vector4,
} from 'three.quarks';
import type {
    ParticleSystem as ThreeQuarksParticleSystem,
    ParticleEmitter,
    ParticleSystemParameters,
    BurstParameters,
    RenderMode,
    BatchedRenderer,
} from 'three.quarks';
import type { BufferGeometry, Layers, Material } from 'three';

// Re-export useful types from three.quarks
export type {
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
};

/**
 * Flexible value type that accepts:
 * - number: converted to ConstantValue
 * - [min, max]: converted to IntervalValue
 * - ValueGenerator | FunctionValueGenerator: used directly
 */
export type FlexibleValue = number | [number, number] | ValueGenerator | FunctionValueGenerator;

/**
 * Flexible color type that accepts:
 * - { r, g, b, a? }: converted to ConstantColor
 * - ColorGenerator | FunctionColorGenerator: used directly
 */
export type FlexibleColor =
    | { r: number; g: number; b: number; a?: number }
    | ColorGenerator
    | FunctionColorGenerator;

/**
 * Props for the ParticleSystem component
 */
export interface ParticleSystemProps {
    // Core simulation parameters
    /** Whether the particle system auto-destroys when complete */
    autoDestroy?: boolean;
    /** Whether the particle system loops */
    looping?: boolean;
    /** Whether to pre-simulate one cycle on start */
    prewarm?: boolean;
    /** Duration of the particle system in seconds */
    duration?: number;

    // Emission parameters
    /** Emitter shape (Point, Sphere, Cone, etc.) */
    shape?: EmitterShape;
    /** Emission rate over time */
    emissionOverTime?: FlexibleValue;
    /** Emission rate over distance traveled */
    emissionOverDistance?: FlexibleValue;
    /** Burst emission parameters */
    emissionBursts?: BurstParameters[];

    // Particle initial properties
    /** Initial lifetime of particles */
    startLife?: FlexibleValue;
    /** Initial speed of particles */
    startSpeed?: FlexibleValue;
    /** Initial rotation of particles */
    startRotation?: FlexibleValue | RotationGenerator;
    /** Initial size of particles */
    startSize?: FlexibleValue | Vector3Generator;
    /** Initial color of particles */
    startColor?: FlexibleColor;
    /** Initial tile index for sprite sheets */
    startTileIndex?: ValueGenerator;
    /** Initial length for trail particles */
    startLength?: FlexibleValue;

    // Behaviors
    /** Array of behaviors to modify particles over time */
    behaviors?: Behavior[];

    // Rendering parameters
    /** Geometry for instancing */
    instancingGeometry?: BufferGeometry;
    /** Render mode: billboard, stretched, trail, mesh */
    renderMode?: RenderMode;
    /** Renderer-specific emitter settings */
    rendererEmitterSettings?: RendererEmitterSettings;
    /** Speed factor for stretched billboards */
    speedFactor?: number;
    /** Material for rendering - required unless texture is provided */
    material?: Material;
    /** Texture URL - creates a basic material automatically */
    texture?: string;
    /** Three.js visibility layers */
    layers?: Layers;

    // Sprite sheet / tiling
    /** Number of horizontal tiles in texture */
    uTileCount?: number;
    /** Number of vertical tiles in texture */
    vTileCount?: number;
    /** Whether to blend between tiles */
    blendTiles?: boolean;

    // Soft particles
    /** Enable soft particle fading near geometry */
    softParticles?: boolean;
    /** Near fade distance for soft particles */
    softNearFade?: number;
    /** Far fade distance for soft particles */
    softFarFade?: number;

    // Ordering
    /** Render order for depth sorting */
    renderOrder?: number;

    // Transform
    /** Whether particles simulate in world space */
    worldSpace?: boolean;
    /** Only used by other systems (sub-emitter) */
    onlyUsedByOther?: boolean;

    // R3F-specific props
    /** Position of the emitter */
    position?: [number, number, number];
    /** Rotation of the emitter (euler angles) */
    rotation?: [number, number, number];
    /** Scale of the emitter */
    scale?: [number, number, number];
    /** Whether to auto-play on mount */
    autoPlay?: boolean;
}

/**
 * Ref handle for ParticleSystem component
 */
export interface ParticleSystemRef {
    /** The underlying three.quarks ParticleSystem */
    system: ThreeQuarksParticleSystem;
    /** The ParticleEmitter (Three.js Object3D) */
    emitter: ParticleEmitter;
    /** Pause the particle system */
    pause: () => void;
    /** Resume/play the particle system */
    play: () => void;
    /** Restart the particle system from the beginning */
    restart: () => void;
    /** Stop and reset the particle system */
    stop: () => void;
}

/**
 * Props for QuarksEffect component (JSON loader)
 */
export interface QuarksEffectProps {
    /** URL to the JSON effect file */
    url: string;
    /** Position of the effect group */
    position?: [number, number, number];
    /** Rotation of the effect group */
    rotation?: [number, number, number];
    /** Scale of the effect group */
    scale?: [number, number, number];
    /** Whether to auto-play on mount */
    autoPlay?: boolean;
}

/**
 * Ref handle for QuarksEffect component
 */
export interface QuarksEffectRef {
    /** The Three.js Group containing all emitters */
    group: import('three').Group;
    /** Array of all particle systems in the effect */
    systems: ThreeQuarksParticleSystem[];
    /** Pause all particle systems */
    pause: () => void;
    /** Resume/play all particle systems */
    play: () => void;
    /** Restart all particle systems */
    restart: () => void;
}

/**
 * Context value for QuarksProvider
 */
export interface QuarksContextValue {
    /** The singleton BatchedRenderer */
    batchedRenderer: BatchedRenderer;
}

/**
 * Return type for useParticleSystem hook
 */
export interface UseParticleSystemReturn extends ParticleSystemRef {}

/**
 * Return type for useQuarksEffect hook
 */
export interface UseQuarksEffectReturn extends QuarksEffectRef {}
