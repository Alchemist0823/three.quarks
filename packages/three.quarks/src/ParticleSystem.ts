import {
    AxisAngleGenerator,
    ColorGenerator,
    ColorGeneratorFromJSON,
    ConstantColor,
    ConstantValue,
    FunctionColorGenerator,
    FunctionJSON,
    FunctionValueGenerator,
    GeneratorFromJSON,
    ValueGenerator,
    ValueGeneratorFromJSON,
    Behavior,
    BehaviorFromJSON,
    Particle,
    SpriteParticle,
    TrailParticle,
    EmitterFromJSON,
    EmitterShape,
    ShapeJSON,
    SphereEmitter,
    RendererEmitterSettings,
    RotationGenerator,
    IParticleSystem,
    EmissionState,
    GeneratorMemory,
    TrailSettings, SerializationOptions, StretchedBillBoardSettings,
    Vector3,
    Vector4,
    Matrix3,
    Matrix4,
    Quaternion,
    Vector3Generator,
} from 'quarks.core';
import {MetaData, ParticleEmitter} from './ParticleEmitter';
import {
    AdditiveBlending,
    Object3DEventMap,
    Blending,
    BufferGeometry,
    DoubleSide,
    Layers,
    Object3D,
    PlaneGeometry,
    Texture,
    Material,
    MeshBasicMaterial,
} from 'three';
import {RenderMode} from './VFXBatch';
import {
    BatchedRenderer,
    VFXBatchSettings,
} from './BatchedRenderer';

export interface BurstParameters {
    time: number;
    count: ValueGenerator | FunctionValueGenerator;
    cycle: number;
    interval: number;
    probability: number;
}

const UP = new Vector3(0, 0, 1);
const tempQ = new Quaternion();
const tempV = new Vector3();
const tempV2 = new Vector3();
const tempV3 = new Vector3();
const PREWARM_FPS = 60;

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
     * The initial length of particles.
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
    emissionBursts?: Array<BurstParameters>;
    /**
     * Whether the particle system is only used by others.
     */
    onlyUsedByOther?: boolean;

    /**
     * The behaviors of the particle system.
     */
    behaviors?: Array<Behavior>;

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
    // parameters
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
    emissionBursts?: Array<BurstParametersJSON>;
    onlyUsedByOther: boolean;

    rendererEmitterSettings: RendererEmitterSettings;

    instancingGeometry?: any;
    renderMode: number;
    renderOrder?: number;
    speedFactor?: number;
    texture?: string; // deprecated
    material: string;
    layers?: number;
    startTileIndex: FunctionJSON | number;
    uTileCount: number;
    vTileCount: number;
    blendTiles?: boolean;
    softParticles?: boolean;
    softFarFade?: number;
    softNearFade?: number;
    blending?: Blending; // deprecated
    transparent?: boolean; // deprecated

    behaviors: Array<any>;

    worldSpace: boolean;
}

const DEFAULT_GEOMETRY = new PlaneGeometry(1, 1, 1, 1);

/**
 * ParticleSystem represents a system that generates and controls particles with similar attributes.
 *
 * @class
 */
export class ParticleSystem implements IParticleSystem {
    /**
     * whether the ParticleSystem should be automatically disposed when it finishes emitting particles.
     *
     * @type {boolean}
     */
    autoDestroy: boolean;

    /**
     * Determines whether a looping ParticleSystem should prewarm, i.e., the Particle System looks like it has already simulated for one loop when first becoming visible.
     *
     * @type {boolean}
     */
    prewarm: boolean;

    /**
     * Determines whether the ParticleSystem should loop, i.e., restart emitting particles after the duration of the particle system is expired.
     *
     * @type {boolean}
     */
    looping: boolean;

    /**
     * The duration of the ParticleSystem in seconds.
     *
     * @type {number}
     */
    duration: number;

    /**
     * The value generator or function value generator for the starting life of particles.
     *
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    startLife: ValueGenerator | FunctionValueGenerator;

    /**
     * The value generator or function value generator for the starting speed of particles.
     *
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    startSpeed: ValueGenerator | FunctionValueGenerator;

    /**
     * The value generator or function value generator or rotation generator for the starting rotation of particles.
     *
     * @type {ValueGenerator | FunctionValueGenerator | RotationGenerator}
     */
    startRotation: ValueGenerator | FunctionValueGenerator | RotationGenerator;

    /**
     * The value generator or function value generator for the starting size of particles.
     *
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    startSize: ValueGenerator | FunctionValueGenerator | Vector3Generator;

    /**
     * The color generator or function color generator for the starting color of particles.
     *
     * @type {ColorGenerator | FunctionColorGenerator}
     */
    startColor: ColorGenerator | FunctionColorGenerator;

    /**
     * The value generator for the starting tile index of particles.
     *
     * @type {ValueGenerator}
     */
    startTileIndex: ValueGenerator;

    /**
     * The renderer emitter settings for the ParticleSystem.
     *
     * @type {TrailSettings | MeshSettings | BillBoardSettings | StretchedBillBoardSettings}
     */
    rendererEmitterSettings: RendererEmitterSettings;

    /**
     * The value generator or function value generator for the emission rate of particles over time.
     *
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    emissionOverTime: ValueGenerator | FunctionValueGenerator;

    /**
     * The value generator or function value generator for the emission rate of particles over distance.
     *
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    emissionOverDistance: ValueGenerator | FunctionValueGenerator;

    /**
     * An array of burst parameters for the ParticleSystem.
     *
     * @type {Array<BurstParameters>}
     */
    emissionBursts: Array<BurstParameters>;

    /**
     * Determines whether the ParticleSystem is only used by other ParticleSystems.
     *
     * @type {boolean}
     */
    onlyUsedByOther: boolean;

    /**
     * Determines whether the ParticleSystem is in world space or local space.
     *
     * @type {boolean}
     */
    worldSpace: boolean;

    /**
     * The number of particles in the ParticleSystem.
     *
     * @type {number}
     */
    particleNum: number;

    /**
     * Determines whether the ParticleSystem is paused.
     *
     * @type {boolean}
     */
    paused: boolean;

    /**
     * All the particles in the ParticleSystem.
     *
     * @type {Array<Particle>}
     */
    particles: Array<Particle>;

    /**
     * the shape of the emitter.
     *
     * @type {EmitterShape}
     */
    emitterShape: EmitterShape;

    /**
     * the emitter object that should be added in the scene.
     *
     * @type {ParticleEmitter<Object3DEventMap>}
     */
    emitter: ParticleEmitter<Object3DEventMap>;
    /**
     * the VFX renderer settings for the batch renderer
     *
     * @type {VFXBatchSettings}
     */
    rendererSettings: VFXBatchSettings;

    /**
     * whether needs to update renderer settings for the batch renderer
     *
     * @type {boolean}
     */
    neededToUpdateRender: boolean;

    /**
     * a list of particle behaviors in the particle system
     *
     * @type {Array<Behavior>}
     */
    behaviors: Array<Behavior>;

    emissionState: EmissionState;
    private prewarmed: boolean;
    private emitEnded: boolean;
    private markForDestroy: boolean;
    private previousWorldPos?: Vector3;
    private temp: Vector3 = new Vector3();
    private travelDistance = 0;

    private normalMatrix: Matrix3 = new Matrix3();
    private memory: GeneratorMemory = [];
    /** @internal **/
    _renderer?: BatchedRenderer;

    /**
     * set the time of the playback of the particle system
     * @param time
     */
    set time(time: number) {
        this.emissionState.time = time;
    }

    /**
     * get the current time of the playback of the particle system
     */
    get time(): number {
        return this.emissionState.time;
    }

    /**
     * layers control visibility of the object.
     * currently if you change the layers setting, you need manually set this.neededToUpdateRender = true;
     * @type {Layers}
     * @see {@link https://threejs.org/docs/index.html#api/en/core/Layers | Official Documentation}
     * @see {@link https://github.com/mrdoob/three.js/blob/master/src/core/Layers.js | Source}
     */
    get layers() {
        return this.rendererSettings.layers;
    }

    /**
     * get the texture of the particle system
     */
    get texture() {
        return (this.rendererSettings.material as any).map;
    }

    /**
     * Set the texture of the particle system
     * It will rebuild the material
     */
    set texture(texture: Texture | null) {
        (this.rendererSettings.material as any).map = texture;
        this.neededToUpdateRender = true;
        //this.emitter.material.uniforms.map.value = texture;
    }

    /**
     * Get the material of the particle system
     */
    get material() {
        return this.rendererSettings.material;
    }

    /**
     * Set the material of the particle system
     * It will rebuild the material
     */
    set material(material: Material) {
        this.rendererSettings.material = material;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the number of horizontal tiles in the texture.
     */
    get uTileCount() {
        return this.rendererSettings.uTileCount;
    }

    /**
     * Set the number of horizontal tiles in the texture.
     * @param u
     */
    set uTileCount(u: number) {
        this.rendererSettings.uTileCount = u;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the number of vertical tiles in the texture.
     */
    get vTileCount() {
        return this.rendererSettings.vTileCount;
    }

    /**
     * Set the number of vertical tiles in the texture.
     * @param v
     */
    set vTileCount(v: number) {
        this.rendererSettings.vTileCount = v;
        this.neededToUpdateRender = true;
    }

    /**
     * get whether the particle texture blends tile transitions
     */
    get blendTiles() {
        return this.rendererSettings.blendTiles;
    }

    /**
     * Set whether the particle texture blends tile transitions
     * @param v
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
     * Soft particles are particles that fade out when they are close to geometry.
     * @param v
     */
    set softParticles(v: boolean) {
        this.rendererSettings.softParticles = v;
        this.neededToUpdateRender = true;
    }

    get softNearFade() {
        return this.rendererSettings.softNearFade;
    }

    set softNearFade(v: number) {
        this.rendererSettings.softNearFade = v;
        this.neededToUpdateRender = true;
    }

    get softFarFade() {
        return this.rendererSettings.softFarFade;
    }

    set softFarFade(v: number) {
        this.rendererSettings.softFarFade = v;
        this.neededToUpdateRender = true;
    }

    /**
     * Get the instancing geometry of the particle system.
     * @param geometry
     */
    get instancingGeometry(): BufferGeometry {
        return this.rendererSettings.instancingGeometry;
    }

    /**
     * Set the instancing geometry of the particle system.
     * @param geometry
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
     * Set the render mode of the particle system.
     * {@link RenderMode}
     */
    set renderMode(renderMode: RenderMode) {
        if (
            (this.rendererSettings.renderMode != RenderMode.Trail && renderMode === RenderMode.Trail) ||
            (this.rendererSettings.renderMode == RenderMode.Trail && renderMode !== RenderMode.Trail)
        ) {
            this.restart();
            this.particles.length = 0;
        }
        if (this.rendererSettings.renderMode !== renderMode) {
            switch (renderMode) {
                case RenderMode.Trail:
                    this.rendererEmitterSettings = {
                        startLength: new ConstantValue(30),
                        followLocalOrigin: false,
                    };
                    break;
                case RenderMode.Mesh:
                    this.rendererEmitterSettings = {
                        geometry: new PlaneGeometry(1, 1),
                    };
                    this.startRotation = new AxisAngleGenerator(new Vector3(0, 1, 0), new ConstantValue(0));
                    break;
                case RenderMode.StretchedBillBoard:
                    this.rendererEmitterSettings = {speedFactor: 0, lengthFactor: 2};
                    if (this.rendererSettings.renderMode === RenderMode.Mesh) {
                        this.startRotation = new ConstantValue(0);
                    }
                    break;
                case RenderMode.BillBoard:
                case RenderMode.VerticalBillBoard:
                case RenderMode.HorizontalBillBoard:
                    this.rendererEmitterSettings = {};
                    if (this.rendererSettings.renderMode === RenderMode.Mesh) {
                        this.startRotation = new ConstantValue(0);
                    }
                    break;
            }
        }
        this.rendererSettings.renderMode = renderMode;
        this.neededToUpdateRender = true;
        //this.emitter.rebuildMaterial();
    }

    /**
     * get the render order of the particle system in render pipeline.
     * the higher the value, the later the particle system is rendered.
     */
    get renderOrder(): number {
        return this.rendererSettings.renderOrder;
    }

    /**
     * set the render order of the particle system in render pipeline.
     * the higher the value, the later the particle system is rendered.
     */
    set renderOrder(renderOrder: number) {
        this.rendererSettings.renderOrder = renderOrder;
        this.neededToUpdateRender = true;
        //this.emitter.rebuildMaterial();
    }

    /**
     * get which blending to use.
     * @default THREE.NormalBlending
     */
    get blending() {
        return this.rendererSettings.material.blending;
    }

    /**
     * Set which blending to use.
     * @default THREE.NormalBlending
     */
    set blending(blending) {
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
        //this.startLength = parameters.startLength ?? new ConstantValue(30);
        this.emissionOverTime = parameters.emissionOverTime ?? new ConstantValue(10);
        this.emissionOverDistance = parameters.emissionOverDistance ?? new ConstantValue(0);
        this.emissionBursts = parameters.emissionBursts ?? [];
        this.onlyUsedByOther = parameters.onlyUsedByOther ?? false;
        this.emitterShape = parameters.shape ?? new SphereEmitter();
        this.behaviors = parameters.behaviors ?? new Array<Behavior>();
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

        this.particles = new Array<Particle>();

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
     * Pause the simulation of the particle system
     */
    pause() {
        this.paused = true;
    }

    /**
     * Unpause the simulation of the particle system
     */
    play() {
        this.paused = false;
    }

    /**
     * remove all existing particles, reset the particle system
     * and pause at the beginning
     */
    stop() {
        this.restart();
        this.pause();
    }

    private spawn(count: number, emissionState: EmissionState, matrix: Matrix4) {
        tempQ.setFromRotationMatrix(matrix as unknown as Matrix4);
        const translation = tempV;
        const quaternion = tempQ;
        const scale = tempV2;
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
            if (this.startSize.type === "vec3function") {
                (this.startSize as Vector3Generator).genValue(particle.memory, particle.startSize, emissionState.time / this.duration);
            } else {
                const size = (this.startSize as FunctionValueGenerator).genValue(particle.memory, emissionState.time / this.duration);
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
                            emissionState.time / this.duration,
                        );
                    } else {
                        (sprite.rotation as Quaternion).setFromAxisAngle(
                            UP,
                            this.startRotation.genValue(sprite.memory, (emissionState.time / this.duration) as number),
                        );
                    }
                } else {
                    if (this.startRotation.type === 'rotation') {
                        sprite.rotation = 0;
                    } else {
                        sprite.rotation = this.startRotation.genValue(
                            sprite.memory,
                            emissionState.time / this.duration,
                        );
                    }
                }
            } else if (this.rendererSettings.renderMode === RenderMode.Trail) {
                const trail = particle as TrailParticle;
                (this.rendererEmitterSettings as TrailSettings).startLength.startGen(trail.memory);
                trail.length = (this.rendererEmitterSettings as TrailSettings).startLength.genValue(
                    trail.memory,
                    emissionState.time / this.duration,
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
                particle.velocity.multiply(scale).applyMatrix3(this.normalMatrix);
                if (particle.rotation && particle.rotation instanceof Quaternion) {
                    particle.rotation.multiplyQuaternions(tempQ, particle.rotation);
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
     * Stops emitting particles
     */
    endEmit() {
        this.emitEnded = true;
        if (this.autoDestroy) {
            this.markForDestroy = true;
        }
    }

    /**
     * remove the particle system's emitter from the scene
     */
    dispose() {
        if (this._renderer) this._renderer.deleteSystem(this);
        this.emitter.dispose();
        if (this.emitter.parent) this.emitter.parent.remove(this.emitter);
    }

    /**
     * remove all existing particles, reset the particle system
     * and restart the particle system
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
        this.behaviors.forEach((behavior) => {
            behavior.reset();
        });
        this.emitEnded = false;
        this.markForDestroy = false;
        this.prewarmed = false;

        this.emissionBursts.forEach((burst) => burst.count.startGen(this.memory));
        this.emissionOverDistance.startGen(this.memory);
    }

    private firstTimeUpdate = true;

    /**
     * Update the particle system per frame
     * @param delta
     * @private
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
                // stack overflow?
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

        // simulate
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.particles[i].position.copy((this.particles[i] as TrailParticle).localPosition!);
                if (this.particles[i].parentMatrix) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.particles[i].position.applyMatrix4(this.particles[i].parentMatrix!);
                } else {
                    this.particles[i].position.applyMatrix4(this.emitter.matrixWorld as unknown as Matrix4);
                }
            } else {
                this.particles[i].position.addScaledVector(
                    this.particles[i].velocity,
                    delta * this.particles[i].speedModifier,
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

        // particle die
        for (let i = 0; i < this.particleNum; i++) {
            const particle = this.particles[i];
            if (particle.died && (!(particle instanceof TrailParticle) || particle.previous.length === 0)) {
                this.particles[i] = this.particles[this.particleNum - 1];
                this.particles[this.particleNum - 1] = particle;
                this.particleNum--;
                i--;
            }
        }
    }

    /**
     * Emit particles
     * @param delta the duration of the frame
     * @param emissionState the state of the emission
     * @param emitterMatrix the matrix of the emitter
     */
    public emit(delta: number, emissionState: EmissionState, emitterMatrix: Matrix4) {
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

        this.normalMatrix.getNormalMatrix(emitterMatrix);

        // spawn
        const totalSpawn = Math.ceil(emissionState.waitEmiting);
        this.spawn(totalSpawn, emissionState, emitterMatrix);
        emissionState.waitEmiting -= totalSpawn;

        // spawn burst
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
                this.temp.set(emitterMatrix.elements[12], emitterMatrix.elements[13], emitterMatrix.elements[14]);
                emissionState.travelDistance += emissionState.previousWorldPos.distanceTo(this.temp);
                const emitPerMeter = this.emissionOverDistance.genValue(
                    this.memory,
                    emissionState.time / this.duration,
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
            emitterMatrix.elements[14],
        );
        emissionState.time += delta;
    }

    /**
     * output the particle system to JSON
     * @param meta serialization meta data
     * @param options serialization options
     */
    toJSON(meta: MetaData, options: SerializationOptions = {}): ParticleSystemJSONParameters {
        const isRootObject = meta === undefined || typeof meta === 'string';
        if (isRootObject) {
            // initialize meta obj
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
                    url: this.texture.image.url,
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
            /*;*/
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

            instancingGeometry: this.rendererSettings.instancingGeometry.uuid, //Array.from(this.emitter.interleavedBuffer.array as Float32Array),
            renderOrder: this.renderOrder,
            renderMode: this.renderMode,
            rendererEmitterSettings: rendererSettingsJSON,
            //speedFactor: this.renderMode === RenderMode.StretchedBillBoard ? this.speedFactor : 0,
            //texture: this.texture.uuid,
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
     * Create a ParticleSystem from JSON
     * @param json the JSON data
     * @param meta serialization meta data
     * @param dependencies the dependencies of the particle system
     */
    static fromJSON(
        json: ParticleSystemJSONParameters,
        meta: {
            textures: {[uuid: string]: Texture};
            materials: {[uuoid: string]: Material};
            geometries: {[uuid: string]: BufferGeometry};
        },
        dependencies: {[uuid: string]: Behavior},
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
            startRotation: GeneratorFromJSON(json.startRotation) as (RotationGenerator | ValueGenerator | FunctionValueGenerator),
            startSize: GeneratorFromJSON(json.startSize) as (Vector3Generator | ValueGenerator | FunctionValueGenerator),
            startColor: ColorGeneratorFromJSON(json.startColor) as ColorGenerator,
            emissionOverTime: ValueGeneratorFromJSON(json.emissionOverTime),
            emissionOverDistance: ValueGeneratorFromJSON(json.emissionOverDistance),
            emissionBursts: json.emissionBursts?.map((burst) => ({
                time: burst.time,
                // backward compatibility
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
        ps.behaviors = json.behaviors.map((behaviorJson) => {
            const behavior = BehaviorFromJSON(behaviorJson, ps);
            if (behavior.type === 'EmitSubParticleSystem') {
                dependencies[behaviorJson.subParticleSystem] = behavior;
            }
            return behavior;
        });
        return ps;
    }

    /**
     * Add a behavior to the particle system
     * @param behavior
     */
    addBehavior(behavior: Behavior) {
        this.behaviors.push(behavior);
    }

    /**
     * Remove a behavior from the particle system
     */
    getRendererSettings() {
        return this.rendererSettings;
    }

    /**
     * Clone the particle system
     */
    clone() {
        const newEmissionBursts: Array<BurstParameters> = [];
        for (const emissionBurst of this.emissionBursts) {
            const newEmissionBurst = {};
            Object.assign(newEmissionBurst, emissionBurst);
            newEmissionBursts.push(newEmissionBurst as BurstParameters);
        }

        const newBehaviors: Array<Behavior> = [];
        for (const behavior of this.behaviors) {
            newBehaviors.push(behavior.clone());
        }

        let rendererEmitterSettings;
        if (this.renderMode === RenderMode.Trail) {
            rendererEmitterSettings = {
                startLength: (this.rendererEmitterSettings as TrailSettings).startLength.clone(),
                followLocalOrigin: (this.rendererEmitterSettings as TrailSettings).followLocalOrigin,
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

            instancingGeometry: this.rendererSettings.instancingGeometry, //.interleavedBuffer.array,
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
