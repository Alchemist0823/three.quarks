import {
    AxisAngleGenerator,
    Behavior,
    BehaviorFromJSON,
    ColorGenerator,
    ColorGeneratorFromJSON,
    ConstantColor,
    ConstantValue,
    EmissionState,
    EmitterFromJSON,
    EmitterShape,
    FunctionColorGenerator,
    FunctionJSON,
    FunctionValueGenerator,
    GeneratorFromJSON,
    GeneratorMemory,
    IParticleSystem,
    Matrix3,
    Matrix4,
    Particle,
    ParticleSystemEvent,
    ParticleSystemEventType,
    Quaternion,
    RendererEmitterSettings,
    RotationGenerator,
    SerializationOptions,
    ShapeJSON,
    SphereEmitter,
    SpriteParticle,
    StretchedBillBoardSettings,
    TrailParticle,
    TrailSettings,
    ValueGenerator,
    ValueGeneratorFromJSON,
    Vector3,
    Vector3Generator,
    Vector4,
} from 'quarks.core';

import {
    AdditiveBlending,
    Blending,
    BufferGeometry,
    DoubleSide,
    Layers,
    Material,
    MeshBasicMaterial,
    Object3D,
    Object3DEventMap,
    PlaneGeometry,
    Texture,
} from 'three';

import {BatchedRenderer, VFXBatchSettings} from './BatchedRenderer';
import {MetaData, ParticleEmitter} from './ParticleEmitter';
import {ThreeMetaData} from './util/ThreeUtil';
import {RenderMode} from './VFXBatch';

export interface BurstParameters {
    time: number;
    count: ValueGenerator | FunctionValueGenerator;
    cycle: number;
    interval: number;
    probability: number;
}

/**
 * Interface representing the JSON parameters for a burst.
 */
export interface BurstParametersJSON {
    /**
     * The time of the burst.
     */
    time: number;
    /**
     * The count of particles to emit, can be a number or a function.
     */
    count: FunctionJSON | number;
    /**
     * The cycle of the burst.
     */
    cycle: number;
    /**
     * The interval between bursts.
     */
    interval: number;
    /**
     * The probability of the burst occurring.
     */
    probability: number;
}

/**
 * Interface representing the parameters for a particle system.
 */
export interface ParticleSystemParameters {
    /**
     * Whether the particle system auto-destroys.
     */
    autoDestroy?: boolean;
    /**
     * Whether the particle system loops.
     */
    looping?: boolean;
    /**
     * Whether the particle system prewarms.
     */
    prewarm?: boolean;
    /**
     * The duration of the particle system.
     */
    duration?: number;
    /**
     * The shape of the emitter.
     */
    shape?: EmitterShape;
    /**
     * The initial life of particles.
     */
    startLife?: ValueGenerator | FunctionValueGenerator;
    /**
     * The initial speed of particles.
     */
    startSpeed?: ValueGenerator | FunctionValueGenerator;
    /**
     * The initial rotation of particles.
     */
    startRotation?: ValueGenerator | FunctionValueGenerator | RotationGenerator;
    /**
     * The initial size of particles.
     */
    startSize?: ValueGenerator | FunctionValueGenerator | Vector3Generator;
    /**
     * Legacy trail length shortcut retained for parameter compatibility.
     * Trail systems read rendererEmitterSettings.startLength.
     */
    startLength?: ValueGenerator | FunctionValueGenerator;
    /**
     * The initial color of particles.
     */
    startColor?: ColorGenerator | FunctionColorGenerator;
    /**
     * The emission rate over time.
     */
    emissionOverTime?: ValueGenerator | FunctionValueGenerator;
    /**
     * The emission rate over distance.
     */
    emissionOverDistance?: ValueGenerator | FunctionValueGenerator;
    /**
     * The burst parameters for emission.
     */
    emissionBursts?: BurstParameters[];
    /**
     * Whether the particle system is only used by others.
     */
    onlyUsedByOther?: boolean;
    /**
     * The behaviors of the particle system.
     */
    behaviors?: Behavior[];
    /**
     * The instancing geometry of the particle system.
     */
    instancingGeometry?: BufferGeometry;
    /**
     * The render mode of the particle system.
     */
    renderMode?: RenderMode;
    /**
     * The renderer emitter settings.
     */
    rendererEmitterSettings?: RendererEmitterSettings;
    /**
     * The speed factor of the particle system.
     */
    speedFactor?: number;
    /**
     * The material of the particle system.
     */
    material: Material;
    /**
     * The layers of the particle system.
     */
    layers?: Layers;
    /**
     * The initial tile index for particles.
     */
    startTileIndex?: ValueGenerator;
    /**
     * The number of tiles in the u direction.
     */
    uTileCount?: number;
    /**
     * The number of tiles in the v direction.
     */
    vTileCount?: number;
    /**
     * Whether to blend tiles.
     */
    blendTiles?: boolean;
    /**
     * Whether to use soft particles.
     */
    softParticles?: boolean;
    /**
     * The far fade distance for soft particles.
     */
    softFarFade?: number;
    /**
     * The near fade distance for soft particles.
     */
    softNearFade?: number;
    /**
     * The render order of the particle system.
     */
    renderOrder?: number;
    /**
     * Whether the particle system uses world space.
     */
    worldSpace?: boolean;
}

export interface ParticleSystemJSONParameters {
    version: string;
    autoDestroy: boolean;
    looping: boolean;
    prewarm: boolean;
    duration: number;
    shape: ShapeJSON;
    startLife: FunctionJSON;
    startSpeed: FunctionJSON;
    startRotation: FunctionJSON;
    startSize: FunctionJSON;
    startColor: FunctionJSON;
    emissionOverTime: FunctionJSON;
    emissionOverDistance: FunctionJSON;
    emissionBursts?: BurstParametersJSON[];
    onlyUsedByOther: boolean;
    rendererEmitterSettings: RendererEmitterSettings;
    instancingGeometry?: any;
    renderMode: number;
    renderOrder?: number;
    speedFactor?: number;
    texture?: string; // Deprecated
    material: string;
    layers?: number;
    startTileIndex: FunctionJSON | number;
    uTileCount: number;
    vTileCount: number;
    blendTiles?: boolean;
    softParticles?: boolean;
    softFarFade?: number;
    softNearFade?: number;
    blending?: Blending; // Deprecated
    transparent?: boolean; // Deprecated
    behaviors: any[];
    worldSpace: boolean;
}

const PREWARM_FPS = 60;
const DEFAULT_GEOMETRY = new PlaneGeometry(1, 1, 1, 1);
const UP = new Vector3(0, 0, 1);

/**
 * Runtime particle system that owns emission state, particles, behaviors, and renderer settings for one emitter.
 * @class
 */
export class ParticleSystem implements IParticleSystem {
    /**
     * Whether the ParticleSystem should be automatically disposed when it finishes emitting particles.
     * @type {boolean}
     */
    autoDestroy: boolean;

    /**
     * Determines whether a looping ParticleSystem should prewarm, i.e. simulate one loop before first becoming visible.
     * @type {boolean}
     */
    prewarm: boolean;

    /**
     * Determines whether the ParticleSystem should loop, i.e., restart emitting particles after the duration of the particle system is expired.
     * @type {boolean}
     */
    looping: boolean;

    /**
     * The duration of the ParticleSystem in seconds.
     * @type {number}
     */
    duration: number;

    /**
     * The value generator or function value generator for the starting life of particles.
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    startLife: ValueGenerator | FunctionValueGenerator;

    /**
     * The value generator or function value generator for the starting speed of particles.
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    startSpeed: ValueGenerator | FunctionValueGenerator;

    /**
     * The value generator or function value generator or rotation generator for the starting rotation of particles.
     * @type {ValueGenerator | FunctionValueGenerator | RotationGenerator}
     */
    startRotation: ValueGenerator | FunctionValueGenerator | RotationGenerator;

    /**
     * The value generator, function value generator, or vector generator for the starting size of particles.
     * @type {ValueGenerator | FunctionValueGenerator | Vector3Generator}
     */
    startSize: ValueGenerator | FunctionValueGenerator | Vector3Generator;

    /**
     * The color generator or function color generator for the starting color of particles.
     * @type {ColorGenerator | FunctionColorGenerator}
     */
    startColor: ColorGenerator | FunctionColorGenerator;

    /**
     * The value generator for the starting tile index of particles.
     * @type {ValueGenerator}
     */
    startTileIndex: ValueGenerator;

    /**
     * Render-mode specific emitter settings for the ParticleSystem.
     * @type {RendererEmitterSettings}
     */
    rendererEmitterSettings: RendererEmitterSettings;

    /**
     * The value generator or function value generator for the emission rate of particles over time.
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    emissionOverTime: ValueGenerator | FunctionValueGenerator;

    /**
     * The value generator or function value generator for the emission rate of particles over distance.
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    emissionOverDistance: ValueGenerator | FunctionValueGenerator;

    /**
     * An array of burst parameters for the ParticleSystem.
     * @type {BurstParameters[]}
     */
    emissionBursts: BurstParameters[];

    /**
     * Determines whether the ParticleSystem is only used by other ParticleSystems.
     * @type {boolean}
     */
    onlyUsedByOther: boolean;

    /**
     * Determines whether the ParticleSystem is in world space or local space.
     * @type {boolean}
     */
    worldSpace: boolean;

    /**
     * The number of particles in the ParticleSystem.
     * @type {number}
     */
    particleNum: number;

    /**
     * Determines whether the ParticleSystem is paused.
     * @type {boolean}
     */
    paused: boolean;

    /**
     * All the particles in the ParticleSystem.
     * @type {Particle[]}
     */
    particles: Particle[];

    /**
     * The shape of the emitter.
     * @type {EmitterShape}
     */
    emitterShape: EmitterShape;

    /**
     * The emitter object that should be added to the scene.
     * @type {ParticleEmitter<Object3DEventMap>}
     */
    emitter: ParticleEmitter<Object3DEventMap>;

    /**
     * The VFX renderer settings for the batch renderer.
     * @type {VFXBatchSettings}
     */
    rendererSettings: VFXBatchSettings;

    /**
     * Whether the batch renderer needs to refresh this system's renderer settings.
     * @type {boolean}
     */
    neededToUpdateRender: boolean;

    /**
     * The particle system behaviors.
     * @type {Behavior[]}
     */
    behaviors: Behavior[];

    /**
     * Mutable emission playback state shared with emitter shapes and sub-emitters.
     * @type {EmissionState}
     */
    emissionState: EmissionState;

    private memory: GeneratorMemory = [];
    private prewarmed: boolean;
    private emitEnded: boolean;
    private markForDestroy: boolean;
    private firstTimeUpdate = true;

    private readonly _vA = new Vector3();
    private readonly _vB = new Vector3();
    private readonly _qA = new Quaternion();
    private readonly _normalMatrix = new Matrix3();

    private listeners: {[event: string]: Set<(event: ParticleSystemEvent) => void>} = {};

    /**
     * @internal
     */
    _renderer?: BatchedRenderer;

    /**
     * Set the playback time of the particle system.
     * @param time - Playback time in seconds.
     */
    set time(time: number) {
        this.emissionState.time = time;
    }

    /**
     * Get the current playback time of the particle system.
     */
    get time(): number {
        return this.emissionState.time;
    }

    /**
     * Layers used by the renderer batch.
     * Mutating the returned Layers object does not automatically mark renderer settings dirty.
     * @type {Layers}
     * @see {@link https://threejs.org/docs/index.html#api/en/core/Layers | Official Documentation}
     * @see {@link https://github.com/mrdoob/three.js/blob/master/src/core/Layers.js | Source}
     */
    get layers() {
        return this.rendererSettings.layers;
    }

    /**
     * Get the texture map of the particle system material.
     */
    get texture() {
        return (this.rendererSettings.material as any).map;
    }

    /**
     * Set the texture map of the particle system material and mark renderer settings dirty.
     */
    set texture(texture: Texture | null) {
        (this.rendererSettings.material as any).map = texture;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the material used by the particle system.
     */
    get material() {
        return this.rendererSettings.material;
    }

    /**
     * Set the material used by the particle system and mark renderer settings dirty.
     */
    set material(material: Material) {
        this.rendererSettings.material = material;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the horizontal tile count for the texture atlas.
     */
    get uTileCount() {
        return this.rendererSettings.uTileCount;
    }

    /**
     * Set the horizontal tile count for the texture atlas.
     * @param u - Horizontal tile count.
     */
    set uTileCount(u: number) {
        this.rendererSettings.uTileCount = u;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the vertical tile count for the texture atlas.
     */
    get vTileCount() {
        return this.rendererSettings.vTileCount;
    }

    /**
     * Set the vertical tile count for the texture atlas.
     * @param v - Vertical tile count.
     */
    set vTileCount(v: number) {
        this.rendererSettings.vTileCount = v;
        this.neededToUpdateRender = true;
    }

    /**
     * Get whether the particle texture blends tile transitions.
     */
    get blendTiles() {
        return this.rendererSettings.blendTiles;
    }

    /**
     * Set whether the particle texture blends tile transitions.
     * @param v - Whether tile transitions should blend.
     */
    set blendTiles(v: boolean) {
        this.rendererSettings.blendTiles = v;
        this.neededToUpdateRender = true;
    }

    /**
     * Get whether the particle system uses soft particles.
     * Soft particles are particles that fade out when they are close to geometry.
     */
    get softParticles() {
        return this.rendererSettings.softParticles;
    }

    /**
     * Set whether the particle system uses soft particles.
     * Soft particles fade out when they are close to geometry.
     * @param v - Whether soft particles should be enabled.
     */
    set softParticles(v: boolean) {
        this.rendererSettings.softParticles = v;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the near fade distance used by soft particles.
     */
    get softNearFade() {
        return this.rendererSettings.softNearFade;
    }

    /**
     * Set the near fade distance used by soft particles.
     * @param v - Near fade distance.
     */
    set softNearFade(v: number) {
        this.rendererSettings.softNearFade = v;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the far fade distance used by soft particles.
     */
    get softFarFade() {
        return this.rendererSettings.softFarFade;
    }

    /**
     * Set the far fade distance used by soft particles.
     * @param v - Far fade distance.
     */
    set softFarFade(v: number) {
        this.rendererSettings.softFarFade = v;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the instancing geometry of the particle system.
     */
    get instancingGeometry(): BufferGeometry {
        return this.rendererSettings.instancingGeometry;
    }

    /**
     * Set the instancing geometry of the particle system and restart active particles.
     * @param geometry - Instancing geometry used by the renderer batch.
     */
    set instancingGeometry(geometry: BufferGeometry) {
        this.restart();
        this.particles.length = 0;
        this.rendererSettings.instancingGeometry = geometry;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the render mode of the particle system.
     * {@link RenderMode}
     */
    get renderMode(): RenderMode {
        return this.rendererSettings.renderMode;
    }

    /**
     * Set the render mode of the particle system and reset render-mode specific emitter settings.
     * {@link RenderMode}
     */
    set renderMode(renderMode: RenderMode) {
        const previousRenderMode = this.rendererSettings.renderMode;
        if (previousRenderMode === renderMode) return;

        const shouldRestart = this.needsRestartForRenderModeChange(previousRenderMode, renderMode);

        this.applyRenderModeDefaults(previousRenderMode, renderMode);
        this.rendererSettings.renderMode = renderMode;

        if (shouldRestart) {
            this.restart();
            this.particles.length = 0;
        }

        this.neededToUpdateRender = true;
    }

    /**
     * Get the render order of the particle system in the render pipeline.
     */
    get renderOrder(): number {
        return this.rendererSettings.renderOrder;
    }

    /**
     * Set the render order of the particle system in the render pipeline.
     * Higher values are rendered later.
     */
    set renderOrder(renderOrder: number) {
        this.rendererSettings.renderOrder = renderOrder;
        this.neededToUpdateRender = true;
    }

    /**
     * Get which blending mode to use.
     * @default THREE.NormalBlending
     */
    get blending() {
        return this.rendererSettings.material.blending;
    }

    /**
     * Set which blending mode to use.
     * @default THREE.NormalBlending
     */
    set blending(blending: Blending) {
        this.rendererSettings.material.blending = blending;
        this.neededToUpdateRender = true;
    }

    constructor(parameters: ParticleSystemParameters) {
        this.autoDestroy = parameters.autoDestroy === undefined ? false : parameters.autoDestroy;
        this.duration = parameters.duration ?? 1;
        this.looping = parameters.looping === undefined ? true : parameters.looping;
        this.prewarm = parameters.prewarm === undefined ? false : parameters.prewarm;
        this.startLife = parameters.startLife ?? new ConstantValue(5);
        this.startSpeed = parameters.startSpeed ?? new ConstantValue(0);
        this.startRotation = parameters.startRotation ?? new ConstantValue(0);
        this.startSize = parameters.startSize ?? new ConstantValue(1);
        this.startColor = parameters.startColor ?? new ConstantColor(new Vector4(1, 1, 1, 1));
        this.emissionOverTime = parameters.emissionOverTime ?? new ConstantValue(10);
        this.emissionOverDistance = parameters.emissionOverDistance ?? new ConstantValue(0);
        this.emissionBursts = parameters.emissionBursts ?? [];
        this.onlyUsedByOther = parameters.onlyUsedByOther ?? false;
        this.emitterShape = parameters.shape ?? new SphereEmitter();
        this.behaviors = parameters.behaviors ?? [];
        this.worldSpace = parameters.worldSpace ?? false;
        this.rendererEmitterSettings = parameters.rendererEmitterSettings ?? {};

        if (parameters.renderMode === RenderMode.StretchedBillBoard) {
            const stretchedBillboardSettings = this.rendererEmitterSettings as StretchedBillBoardSettings;
            if (parameters.speedFactor !== undefined) {
                stretchedBillboardSettings.speedFactor = parameters.speedFactor;
            }

            stretchedBillboardSettings.speedFactor = stretchedBillboardSettings.speedFactor ?? 0;
            stretchedBillboardSettings.lengthFactor = stretchedBillboardSettings.lengthFactor ?? 0;
        }

        this.rendererSettings = {
            instancingGeometry: parameters.instancingGeometry ?? DEFAULT_GEOMETRY,
            renderMode: parameters.renderMode ?? RenderMode.BillBoard,
            renderOrder: parameters.renderOrder ?? 0,
            material: parameters.material,
            uTileCount: parameters.uTileCount ?? 1,
            vTileCount: parameters.vTileCount ?? 1,
            blendTiles: parameters.blendTiles ?? false,
            softParticles: parameters.softParticles ?? false,
            softNearFade: parameters.softNearFade ?? 0,
            softFarFade: parameters.softFarFade ?? 0,
            layers: parameters.layers ?? new Layers(),
        };

        this.neededToUpdateRender = true;

        this.particles = [];

        this.startTileIndex = parameters.startTileIndex || new ConstantValue(0);
        this.emitter = new ParticleEmitter(this);

        this.paused = false;
        this.particleNum = 0;

        this.emissionState = {
            isBursting: false,
            burstParticleIndex: 0,
            burstParticleCount: 0,
            burstIndex: 0,
            burstWaveIndex: 0,
            time: 0,
            waitEmiting: 0,
            travelDistance: 0,
        };

        this.emissionBursts.forEach((burst) => burst.count.startGen(this.memory));
        this.emissionOverDistance.startGen(this.memory);

        this.emitEnded = false;
        this.markForDestroy = false;
        this.prewarmed = false;
    }

    /**
     * Pause the particle system simulation.
     */
    pause() {
        this.paused = true;
    }

    /**
     * Resume the particle system simulation.
     */
    play() {
        this.paused = false;
    }

    /**
     * Remove all existing particles, reset the particle system, and pause at the beginning.
     */
    stop() {
        this.restart();
        this.pause();
    }

    private needsRestartForRenderModeChange(previousRenderMode: RenderMode, renderMode: RenderMode): boolean {
        // Keep render-mode restart policy named even while it is simple so the setter
        // does not become the dumping ground for future transition edge cases.
        return previousRenderMode === RenderMode.Trail || renderMode === RenderMode.Trail;
    }

    private applyRenderModeDefaults(previousRenderMode: RenderMode, renderMode: RenderMode): void {
        if (previousRenderMode === RenderMode.Mesh) {
            this.startRotation = new ConstantValue(0);
        }

        switch (renderMode) {
            case RenderMode.Trail:
                this.rendererEmitterSettings = {
                    startLength: new ConstantValue(30),
                    followLocalOrigin: false,
                };
                break;
            case RenderMode.Mesh:
                this.rendererEmitterSettings = {geometry: DEFAULT_GEOMETRY};
                this.startRotation = new AxisAngleGenerator(new Vector3(0, 1, 0), new ConstantValue(0));
                break;
            case RenderMode.StretchedBillBoard:
                this.rendererEmitterSettings = {speedFactor: 0, lengthFactor: 2};
                this.rendererSettings.instancingGeometry = DEFAULT_GEOMETRY;
                break;
            case RenderMode.BillBoard:
            case RenderMode.VerticalBillBoard:
            case RenderMode.HorizontalBillBoard:
                this.rendererEmitterSettings = {};
                this.rendererSettings.instancingGeometry = DEFAULT_GEOMETRY;
                break;
        }
    }

    private spawn(count: number, emissionState: EmissionState, matrix: Matrix4) {
        this._qA.setFromRotationMatrix(matrix as unknown as Matrix4);

        const translation = this._vA;
        const quaternion = this._qA;
        const scale = this._vB;

        matrix.decompose(translation, quaternion, scale);

        for (let i = 0; i < count; i++) {
            emissionState.burstParticleIndex = i;
            this.particleNum++;

            while (this.particles.length < this.particleNum) {
                if (this.rendererSettings.renderMode === RenderMode.Trail) {
                    this.particles.push(new TrailParticle());
                } else {
                    this.particles.push(new SpriteParticle());
                }
            }

            const particle = this.particles[this.particleNum - 1];
            particle.reset();
            particle.speedModifier = 1;

            this.startColor.startGen(particle.memory);
            this.startColor.genColor(particle.memory, particle.startColor, this.emissionState.time);
            particle.color.copy(particle.startColor);

            this.startSpeed.startGen(particle.memory);
            particle.startSpeed = this.startSpeed.genValue(particle.memory, emissionState.time / this.duration);

            this.startLife.startGen(particle.memory);
            particle.life = this.startLife.genValue(particle.memory, emissionState.time / this.duration);
            particle.age = 0;

            this.startSize.startGen(particle.memory);

            if (this.startSize.type === 'vec3function') {
                (this.startSize as Vector3Generator).genValue(
                    particle.memory,
                    particle.startSize,
                    emissionState.time / this.duration
                );
            } else {
                const size = (this.startSize as FunctionValueGenerator).genValue(
                    particle.memory,
                    emissionState.time / this.duration
                );
                particle.startSize.set(size, size, size);
            }

            this.startTileIndex.startGen(particle.memory);
            particle.uvTile = this.startTileIndex.genValue(particle.memory);
            particle.size.copy(particle.startSize);

            if (
                this.rendererSettings.renderMode === RenderMode.Mesh ||
                this.rendererSettings.renderMode === RenderMode.BillBoard ||
                this.rendererSettings.renderMode === RenderMode.VerticalBillBoard ||
                this.rendererSettings.renderMode === RenderMode.HorizontalBillBoard ||
                this.rendererSettings.renderMode === RenderMode.StretchedBillBoard
            ) {
                const sprite = particle as SpriteParticle;
                this.startRotation.startGen(particle.memory);

                if (this.rendererSettings.renderMode === RenderMode.Mesh) {
                    if (!(sprite.rotation instanceof Quaternion)) {
                        sprite.rotation = new Quaternion();
                    }

                    if (this.startRotation.type === 'rotation') {
                        this.startRotation.genValue(
                            particle.memory,
                            sprite.rotation as Quaternion,
                            1,
                            emissionState.time / this.duration
                        );
                    } else {
                        (sprite.rotation as Quaternion).setFromAxisAngle(
                            UP,
                            this.startRotation.genValue(sprite.memory, (emissionState.time / this.duration) as number)
                        );
                    }
                } else {
                    if (this.startRotation.type === 'rotation') {
                        sprite.rotation = 0;
                    } else {
                        sprite.rotation = this.startRotation.genValue(
                            sprite.memory,
                            emissionState.time / this.duration
                        );
                    }
                }
            } else if (this.rendererSettings.renderMode === RenderMode.Trail) {
                const trail = particle as TrailParticle;

                (this.rendererEmitterSettings as TrailSettings).startLength.startGen(trail.memory);
                trail.length = (this.rendererEmitterSettings as TrailSettings).startLength.genValue(
                    trail.memory,
                    emissionState.time / this.duration
                );
            }

            this.emitterShape.initialize(particle, emissionState);

            if (
                this.rendererSettings.renderMode === RenderMode.Trail &&
                (this.rendererEmitterSettings as TrailSettings).followLocalOrigin
            ) {
                const trail = particle as TrailParticle;
                trail.localPosition = new Vector3().copy(trail.position);
            }

            if (this.worldSpace) {
                particle.position.applyMatrix4(matrix);
                particle.startSize.multiply(scale).abs();
                particle.size.copy(particle.startSize);
                particle.velocity.multiply(scale).applyMatrix3(this._normalMatrix);

                if (particle.rotation && particle.rotation instanceof Quaternion) {
                    particle.rotation.multiplyQuaternions(this._qA, particle.rotation);
                }
            } else {
                if (this.onlyUsedByOther) {
                    particle.parentMatrix = matrix;
                }
            }

            for (let j = 0; j < this.behaviors.length; j++) {
                this.behaviors[j].initialize(particle, this);
            }
        }
    }

    /**
     * Stop emitting new particles.
     */
    endEmit() {
        this.emitEnded = true;

        if (this.autoDestroy) {
            this.markForDestroy = true;
        }

        this.fire({type: 'emitEnd', particleSystem: this});
    }

    /**
     * Remove the particle system's emitter from the scene and release emitter resources.
     */
    dispose() {
        if (this._renderer) this._renderer.deleteSystem(this);

        this.emitter.removeFromParent();
        this.emitter.dispose();

        this.fire({type: 'destroy', particleSystem: this});
    }

    /**
     * Remove all existing particles and restart the particle system.
     */
    restart() {
        this.memory.length = 0;
        this.paused = false;
        this.particleNum = 0;
        this.emissionState.isBursting = false;
        this.emissionState.burstIndex = 0;
        this.emissionState.burstWaveIndex = 0;
        this.emissionState.time = 0;
        this.emissionState.waitEmiting = 0;
        this.behaviors.forEach((behavior) => behavior.reset());
        this.emitEnded = false;
        this.markForDestroy = false;
        this.prewarmed = false;
        this.emissionBursts.forEach((burst) => burst.count.startGen(this.memory));
        this.emissionOverDistance.startGen(this.memory);
    }

    /**
     * Update the particle system for one frame.
     * @param delta - Frame duration in seconds.
     */
    private update(delta: number) {
        if (this.paused) return;

        let currentParent: Object3D = this.emitter;

        while (currentParent.parent) {
            currentParent = currentParent.parent;
        }

        if (currentParent.type !== 'Scene') {
            this.dispose();
            return;
        }

        if (this.firstTimeUpdate) {
            this.firstTimeUpdate = false;
            this.emitter.updateWorldMatrix(true, false);
        }

        if (this.emitEnded && this.particleNum === 0) {
            if (this.markForDestroy && this.emitter.parent) this.dispose();
            return;
        }

        if (this.looping && this.prewarm && !this.prewarmed) {
            this.prewarmed = true;
            for (let i = 0; i < this.duration * PREWARM_FPS; i++) {
                // Prewarm advances the simulation in fixed steps before the first rendered update.
                this.update(1.0 / PREWARM_FPS);
            }
        }

        if (delta > 0.1) {
            delta = 0.1;
        }

        if (this.neededToUpdateRender) {
            if (this._renderer) this._renderer.updateSystem(this);
            this.neededToUpdateRender = false;
        }

        if (!this.onlyUsedByOther) {
            this.emit(delta, this.emissionState, this.emitter.matrixWorld as unknown as Matrix4);
        }

        // Simulate
        this.emitterShape.update(this, delta);

        for (let j = 0; j < this.behaviors.length; j++) {
            this.behaviors[j].frameUpdate(delta);
            for (let i = 0; i < this.particleNum; i++) {
                if (!this.particles[i].died) {
                    this.behaviors[j].update(this.particles[i], delta);
                }
            }
        }

        for (let i = 0; i < this.particleNum; i++) {
            if (
                (this.rendererEmitterSettings as TrailSettings).followLocalOrigin &&
                (this.particles[i] as TrailParticle).localPosition
            ) {
                this.particles[i].position.copy((this.particles[i] as TrailParticle).localPosition!);

                if (this.particles[i].parentMatrix) {
                    this.particles[i].position.applyMatrix4(this.particles[i].parentMatrix!);
                } else {
                    this.particles[i].position.applyMatrix4(this.emitter.matrixWorld as unknown as Matrix4);
                }
            } else {
                this.particles[i].position.addScaledVector(
                    this.particles[i].velocity,
                    delta * this.particles[i].speedModifier
                );
            }

            this.particles[i].age += delta;
        }

        if (this.rendererSettings.renderMode === RenderMode.Trail) {
            for (let i = 0; i < this.particleNum; i++) {
                const particle = this.particles[i] as TrailParticle;
                particle.update();
            }
        }

        // Particle died
        for (let i = 0; i < this.particleNum; i++) {
            const particle = this.particles[i];

            if (particle.died && (!(particle instanceof TrailParticle) || particle.previous.length === 0)) {
                this.particles[i] = this.particles[this.particleNum - 1];
                this.particles[this.particleNum - 1] = particle;
                this.particleNum--;
                i--;
                this.fire({type: 'particleDied', particleSystem: this, particle: particle});
            }
        }
    }

    /**
     * Emit particles for a frame.
     * @param delta - Frame duration in seconds.
     * @param emissionState - The emission state to advance.
     * @param emitterMatrix - The emitter world matrix.
     */
    emit(delta: number, emissionState: EmissionState, emitterMatrix: Matrix4) {
        if (emissionState.time > this.duration) {
            if (this.looping) {
                emissionState.time -= this.duration;
                emissionState.burstIndex = 0;
                this.behaviors.forEach((behavior) => {
                    behavior.reset();
                });
            } else {
                if (!this.emitEnded && !this.onlyUsedByOther) {
                    this.endEmit();
                }
            }
        }

        this._normalMatrix.getNormalMatrix(emitterMatrix);

        // Spawn
        const totalSpawn = Math.ceil(emissionState.waitEmiting);
        this.spawn(totalSpawn, emissionState, emitterMatrix);
        emissionState.waitEmiting -= totalSpawn;

        // Spawn burst
        while (
            emissionState.burstIndex < this.emissionBursts.length &&
            this.emissionBursts[emissionState.burstIndex].time <= emissionState.time
        ) {
            if (Math.random() < this.emissionBursts[emissionState.burstIndex].probability) {
                const count = this.emissionBursts[emissionState.burstIndex].count.genValue(this.memory, this.time);
                emissionState.isBursting = true;
                emissionState.burstParticleCount = count;
                this.spawn(count, emissionState, emitterMatrix);
                emissionState.isBursting = false;
            }

            emissionState.burstIndex++;
        }

        if (!this.emitEnded) {
            emissionState.waitEmiting +=
                delta * this.emissionOverTime.genValue(this.memory, emissionState.time / this.duration);

            if (emissionState.previousWorldPos != undefined) {
                this._vA.set(emitterMatrix.elements[12], emitterMatrix.elements[13], emitterMatrix.elements[14]);
                emissionState.travelDistance += emissionState.previousWorldPos.distanceTo(this._vA);

                const emitPerMeter = this.emissionOverDistance.genValue(
                    this.memory,
                    emissionState.time / this.duration
                );

                if (emissionState.travelDistance * emitPerMeter > 0) {
                    const count = Math.floor(emissionState.travelDistance * emitPerMeter);
                    emissionState.travelDistance -= count / emitPerMeter;
                    emissionState.waitEmiting += count;
                }
            }
        }

        if (emissionState.previousWorldPos === undefined) emissionState.previousWorldPos = new Vector3();

        emissionState.previousWorldPos.set(
            emitterMatrix.elements[12],
            emitterMatrix.elements[13],
            emitterMatrix.elements[14]
        );

        emissionState.time += delta;
    }

    /**
     * Serialize the particle system to JSON.
     * @param meta - Serialization metadata.
     * @param options - Serialization options.
     */
    toJSON(meta: MetaData, options: SerializationOptions = {}): ParticleSystemJSONParameters {
        const isRootObject = meta === undefined || typeof meta === 'string';

        if (isRootObject) {
            meta = {
                geometries: {},
                materials: {},
                textures: {},
                images: {},
                shapes: {},
                skeletons: {},
                animations: {},
                nodes: {},
            };
        }

        meta.materials[this.rendererSettings.material.uuid] = this.rendererSettings.material.toJSON(meta);

        if (options.useUrlForImage) {
            if (this.texture?.source !== undefined) {
                const image = this.texture.source;
                meta.images[image.uuid] = {
                    uuid: image.uuid,
                    url: (this.texture.image as {url?: string}).url,
                };
            }
        }

        // TODO: support URL

        let rendererSettingsJSON;

        if (this.renderMode === RenderMode.Trail) {
            rendererSettingsJSON = {
                startLength: (this.rendererEmitterSettings as TrailSettings).startLength.toJSON(),
                followLocalOrigin: (this.rendererEmitterSettings as TrailSettings).followLocalOrigin,
            };
        } else if (this.renderMode === RenderMode.Mesh) {
            rendererSettingsJSON = {};
        } else if (this.renderMode === RenderMode.StretchedBillBoard) {
            rendererSettingsJSON = {
                speedFactor: (this.rendererEmitterSettings as StretchedBillBoardSettings).speedFactor,
                lengthFactor: (this.rendererEmitterSettings as StretchedBillBoardSettings).lengthFactor,
            };
        } else {
            rendererSettingsJSON = {};
        }

        const geometry = this.rendererSettings.instancingGeometry;

        if (meta.geometries && !meta.geometries[geometry.uuid]) {
            meta.geometries[geometry.uuid] = geometry.toJSON();
        }

        return {
            version: '3.0',
            autoDestroy: this.autoDestroy,
            looping: this.looping,
            prewarm: this.prewarm,
            duration: this.duration,
            shape: this.emitterShape.toJSON(),
            startLife: this.startLife.toJSON(),
            startSpeed: this.startSpeed.toJSON(),
            startRotation: this.startRotation.toJSON(),
            startSize: this.startSize.toJSON(),
            startColor: this.startColor.toJSON(),
            emissionOverTime: this.emissionOverTime.toJSON(),
            emissionOverDistance: this.emissionOverDistance.toJSON(),
            emissionBursts: this.emissionBursts.map((burst) => ({
                time: burst.time,
                count: burst.count.toJSON(),
                probability: burst.probability,
                interval: burst.interval,
                cycle: burst.cycle,
            })),
            onlyUsedByOther: this.onlyUsedByOther,
            instancingGeometry: this.rendererSettings.instancingGeometry.uuid,
            renderOrder: this.renderOrder,
            renderMode: this.renderMode,
            rendererEmitterSettings: rendererSettingsJSON,
            material: this.rendererSettings.material.uuid,
            layers: this.layers.mask,
            startTileIndex: this.startTileIndex.toJSON(),
            uTileCount: this.uTileCount,
            vTileCount: this.vTileCount,
            blendTiles: this.blendTiles,
            softParticles: this.rendererSettings.softParticles,
            softFarFade: this.rendererSettings.softFarFade,
            softNearFade: this.rendererSettings.softNearFade,
            behaviors: this.behaviors.map((behavior) => behavior.toJSON()),
            worldSpace: this.worldSpace,
        };
    }

    /**
     * Create a ParticleSystem from JSON.
     * @param json - The JSON data.
     * @param meta - Serialization metadata.
     * @param dependencies - Behavior dependency map populated while deserializing sub-emitters.
     */
    static fromJSON(
        json: ParticleSystemJSONParameters,
        meta: ThreeMetaData,
        dependencies: {[uuid: string]: Behavior}
    ): ParticleSystem {
        const shape = EmitterFromJSON(json.shape, meta);
        let rendererEmitterSettings;

        if (json.renderMode === RenderMode.Trail) {
            const trailSettings = json.rendererEmitterSettings as TrailSettings;
            rendererEmitterSettings = {
                startLength:
                    trailSettings.startLength != undefined
                        ? ValueGeneratorFromJSON(trailSettings.startLength)
                        : new ConstantValue(30),
                followLocalOrigin: trailSettings.followLocalOrigin,
            };
        } else if (json.renderMode === RenderMode.Mesh) {
            rendererEmitterSettings = {};
        } else if (json.renderMode === RenderMode.StretchedBillBoard) {
            rendererEmitterSettings = json.rendererEmitterSettings;
            if (json.speedFactor != undefined) {
                (rendererEmitterSettings as StretchedBillBoardSettings).speedFactor = json.speedFactor;
            }
        } else {
            rendererEmitterSettings = {};
        }

        const layers = new Layers();

        if (json.layers) {
            layers.mask = json.layers;
        }

        const ps = new ParticleSystem({
            autoDestroy: json.autoDestroy,
            looping: json.looping,
            prewarm: json.prewarm,
            duration: json.duration,
            shape: shape,
            startLife: ValueGeneratorFromJSON(json.startLife),
            startSpeed: ValueGeneratorFromJSON(json.startSpeed),
            startRotation: GeneratorFromJSON(json.startRotation) as
                | RotationGenerator
                | ValueGenerator
                | FunctionValueGenerator,
            startSize: GeneratorFromJSON(json.startSize) as Vector3Generator | ValueGenerator | FunctionValueGenerator,
            startColor: ColorGeneratorFromJSON(json.startColor) as ColorGenerator,
            emissionOverTime: ValueGeneratorFromJSON(json.emissionOverTime),
            emissionOverDistance: ValueGeneratorFromJSON(json.emissionOverDistance),
            emissionBursts: json.emissionBursts?.map((burst) => ({
                time: burst.time,
                // Backward compatibility
                count:
                    typeof burst.count === 'number'
                        ? new ConstantValue(burst.count)
                        : ValueGeneratorFromJSON(burst.count),
                probability: burst.probability ?? 1,
                interval: burst.interval ?? 0.1,
                cycle: burst.cycle ?? 1,
            })),
            onlyUsedByOther: json.onlyUsedByOther,
            instancingGeometry: meta.geometries[json.instancingGeometry],
            renderMode: json.renderMode,
            rendererEmitterSettings: rendererEmitterSettings,
            renderOrder: json.renderOrder,
            layers: layers,
            material: json.material
                ? meta.materials[json.material]
                : json.texture
                  ? new MeshBasicMaterial({
                        map: meta.textures[json.texture],
                        transparent: json.transparent ?? true,
                        blending: json.blending,
                        side: DoubleSide,
                    })
                  : new MeshBasicMaterial({
                        color: 0xffffff,
                        transparent: true,
                        blending: AdditiveBlending,
                        side: DoubleSide,
                    }),
            startTileIndex:
                typeof json.startTileIndex === 'number'
                    ? new ConstantValue(json.startTileIndex)
                    : (ValueGeneratorFromJSON(json.startTileIndex) as ValueGenerator),
            uTileCount: json.uTileCount,
            vTileCount: json.vTileCount,
            blendTiles: json.blendTiles,
            softParticles: json.softParticles,
            softFarFade: json.softFarFade,
            softNearFade: json.softNearFade,
            behaviors: [],
            worldSpace: json.worldSpace,
        });

        ps.behaviors = json.behaviors
            .map((behaviorJson) => {
                const behavior = BehaviorFromJSON(behaviorJson, ps);
                if (behavior && behavior.type === 'EmitSubParticleSystem') {
                    dependencies[behaviorJson.subParticleSystem] = behavior;
                }

                return behavior;
            })
            .filter((behavior): behavior is Behavior => behavior !== null);

        return ps;
    }

    /**
     * Add a behavior to the particle system.
     * @param behavior - Behavior to add.
     */
    addBehavior(behavior: Behavior) {
        this.behaviors.push(behavior);
    }

    /**
     * Get the renderer settings used to batch this particle system.
     */
    getRendererSettings() {
        return this.rendererSettings;
    }

    /**
     * Add an event listener.
     * @param event - Event type to listen for.
     * @param callback - Callback invoked when the event fires.
     */
    addEventListener(event: ParticleSystemEventType, callback: (event: ParticleSystemEvent) => void): void {
        if (!this.listeners[event]) this.listeners[event] = new Set();
        this.listeners[event].add(callback);
    }

    /**
     * Remove all listeners for an event type.
     * @param event - Event type to clear.
     */
    removeAllEventListeners(event: ParticleSystemEventType): void {
        this.listeners[event]?.clear();
    }

    /**
     * Remove a specific event listener.
     * @param event - Event type to remove from.
     * @param callback - Callback to remove.
     */
    removeEventListener(event: ParticleSystemEventType, callback: (event: ParticleSystemEvent) => void): void {
        this.listeners[event]?.delete(callback);
    }

    private fire(event: ParticleSystemEvent) {
        if (this.listeners[event.type] === undefined) return;

        for (const callback of this.listeners[event.type]) {
            callback(event);
        }
    }

    /**
     * Clone the particle system.
     */
    clone() {
        const newEmissionBursts: BurstParameters[] = [];
        const newBehaviors: Behavior[] = [];

        for (const emissionBurst of this.emissionBursts) {
            const newEmissionBurst = {};
            Object.assign(newEmissionBurst, emissionBurst);
            newEmissionBursts.push(newEmissionBurst as BurstParameters);
        }

        for (const behavior of this.behaviors) {
            newBehaviors.push(behavior.clone());
        }

        let rendererEmitterSettings;

        if (this.renderMode === RenderMode.Trail) {
            rendererEmitterSettings = {
                startLength: (this.rendererEmitterSettings as TrailSettings).startLength.clone(),
                followLocalOrigin: (this.rendererEmitterSettings as TrailSettings).followLocalOrigin,
            };
        } else if (this.renderMode === RenderMode.StretchedBillBoard) {
            rendererEmitterSettings = {
                lengthFactor: (this.rendererEmitterSettings as StretchedBillBoardSettings).lengthFactor,
                speedFactor: (this.rendererEmitterSettings as StretchedBillBoardSettings).speedFactor,
            };
        } else {
            rendererEmitterSettings = {};
        }

        const layers = new Layers();
        layers.mask = this.layers.mask;

        return new ParticleSystem({
            autoDestroy: this.autoDestroy,
            looping: this.looping,
            duration: this.duration,
            shape: this.emitterShape.clone(),
            startLife: this.startLife.clone(),
            startSpeed: this.startSpeed.clone(),
            startRotation: this.startRotation.clone(),
            startSize: this.startSize.clone(),
            startColor: this.startColor.clone(),
            emissionOverTime: this.emissionOverTime.clone(),
            emissionOverDistance: this.emissionOverDistance.clone(),
            emissionBursts: newEmissionBursts,
            onlyUsedByOther: this.onlyUsedByOther,
            instancingGeometry: this.rendererSettings.instancingGeometry,
            renderMode: this.renderMode,
            renderOrder: this.renderOrder,
            rendererEmitterSettings: rendererEmitterSettings,
            material: this.rendererSettings.material,
            startTileIndex: this.startTileIndex,
            uTileCount: this.uTileCount,
            vTileCount: this.vTileCount,
            blendTiles: this.blendTiles,
            softParticles: this.softParticles,
            softFarFade: this.softFarFade,
            softNearFade: this.softNearFade,
            behaviors: newBehaviors,
            worldSpace: this.worldSpace,
            layers: layers,
        });
    }
}
