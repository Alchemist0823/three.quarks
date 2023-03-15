import {
    FunctionValueGenerator,
    ValueGenerator,
    ValueGeneratorFromJSON
} from "./functions/ValueGenerator";
import {Behavior, BehaviorFromJSON} from "./behaviors/Behavior";
import {Particle, SpriteParticle, TrailParticle} from "./Particle";
import {MetaData, ParticleEmitter} from "./ParticleEmitter";
import {EmitterFromJSON, EmitterShape, ShapeJSON} from "./shape/EmitterShape";
import {
    AdditiveBlending,
    BaseEvent,
    BufferGeometry, DoubleSide, Layers, Material,
    Matrix3,
    Matrix4, MeshBasicMaterial,
    Object3D,
    PlaneGeometry,
    Quaternion,
    Texture,
    Vector3,
    Vector4
} from "three";
import {SphereEmitter} from "./shape";
import {
    AxisAngleGenerator,
    ColorGenerator,
    ColorGeneratorFromJSON,
    ConstantColor,
    ConstantValue,
    FunctionColorGenerator,
    FunctionJSON, GeneratorFromJSON
} from "./functions";
import {VFXBatchSettings, RenderMode} from "./VFXBatch";
import {BatchedRenderer} from "./BatchedRenderer";
import {RotationGenerator} from "./functions/RotationGenerator";


export interface BurstParameters {
    time: number;
    count: number;
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

export interface ParticleSystemParameters {
    // parameters
    autoDestroy?: boolean;
    looping?: boolean;
    prewarm?: boolean
    duration?: number;

    shape?: EmitterShape;
    startLife?: ValueGenerator | FunctionValueGenerator;
    startSpeed?: ValueGenerator | FunctionValueGenerator;
    startRotation?: ValueGenerator | FunctionValueGenerator | RotationGenerator;
    startSize?: ValueGenerator | FunctionValueGenerator;
    startLength?: ValueGenerator | FunctionValueGenerator;
    startColor?: ColorGenerator | FunctionColorGenerator;
    emissionOverTime?: ValueGenerator | FunctionValueGenerator;
    emissionOverDistance?: ValueGenerator | FunctionValueGenerator;
    emissionBursts?: Array<BurstParameters>;
    onlyUsedByOther?: boolean;

    behaviors?: Array<Behavior>;

    instancingGeometry?: BufferGeometry;
    renderMode?: RenderMode;
    rendererEmitterSettings?: TrailSettings | MeshSettings | BillBoardSettings;
    speedFactor?: number;
    material: Material;
    layers?: Layers;
    startTileIndex?: ValueGenerator;
    uTileCount?: number;
    vTileCount?: number;
    renderOrder?: number;

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
    emissionBursts?: Array<BurstParameters>;
    onlyUsedByOther: boolean;

    rendererEmitterSettings: {
        startLength?: FunctionJSON;
        followLocalOrigin?: boolean;
    }

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
    blending?: number;  // deprecated
    transparent?: boolean;  // deprecated

    behaviors: Array<any>;

    worldSpace: boolean;
}

export interface JsonMetaData {
    textures: { [uuid: string]: Texture };
    geometries: { [uuid: string]: BufferGeometry };
}

export interface BillBoardSettings {

}

export interface TrailSettings {
    startLength: ValueGenerator | FunctionValueGenerator;
    followLocalOrigin: boolean;
}

export interface MeshSettings {
    rotationAxis?: Vector3;
    startRotationX: ValueGenerator | FunctionValueGenerator;
    startRotationY: ValueGenerator | FunctionValueGenerator;
    startRotationZ: ValueGenerator | FunctionValueGenerator;
}

const DEFAULT_GEOMETRY = new PlaneGeometry(1, 1, 1, 1)

export interface EmissionState {
    burstIndex: number;
    burstWaveIndex: number;
    time: number;
    waitEmiting: number;
}

export interface SerializationOptions {
    useUrlForImage?: boolean;
}

/**
 * ParticleSystem represents a system that generates and controls particles with similar attributes.
 *
 * @class
 */
export class ParticleSystem {
    /**
     * Determines whether the ParticleSystem should be automatically disposed when it finishes emitting particles.
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
    startSize: ValueGenerator | FunctionValueGenerator;

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
     * @type {TrailSettings | MeshSettings | BillBoardSettings}
     */
    rendererEmitterSettings: TrailSettings | MeshSettings | BillBoardSettings;

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
     * In render mode StretchedBillBoard
     * how stretched the particle is in the direction of the camera based on the speed of the particle.
     *
     * @type {number}
     */
    speedFactor: number;

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
     * @type {ParticleEmitter<BaseEvent>}
     */
    emitter: ParticleEmitter<BaseEvent>;

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

    private prewarmed: boolean;
    private emissionState: EmissionState;
    private emitEnded: boolean;
    private markForDestroy: boolean;
    private previousWorldPos?: Vector3;
    private temp: Vector3 = new Vector3();
    private travelDistance = 0;

    private normalMatrix: Matrix3 = new Matrix3();
    /** @internal **/
    _renderer?: BatchedRenderer;

    set time(time: number) {
        this.emissionState.time = time;
    }

    get time(): number {
        return this.emissionState.time;
    }

    // currently if you change the layers setting, you need manually set this.neededToUpdateRender = true;
    get layers() {
        return this.rendererSettings.layers;
    }

    get texture() {
        return (this.rendererSettings.material as any).map;
    }

    set texture(texture: Texture) {
        (this.rendererSettings.material as any).map = texture;
        this.neededToUpdateRender = true;
        //this.emitter.material.uniforms.map.value = texture;
    }

    get material() {
        return this.rendererSettings.material;
    }

    set material(material: Material) {
        this.rendererSettings.material = material;
        this.neededToUpdateRender = true;
    }

    get uTileCount() {
        return this.rendererSettings.uTileCount;
    }

    set uTileCount(u: number) {
        this.rendererSettings.uTileCount = u;
        this.neededToUpdateRender = true;
        //this.emitter.material.uniforms.tileCount.value.x = u;
    }

    get vTileCount() {
        return this.rendererSettings.vTileCount;
    }

    set vTileCount(v: number) {
        this.rendererSettings.vTileCount = v;
        this.neededToUpdateRender = true;
    }

    get instancingGeometry(): BufferGeometry {
        return this.rendererSettings.instancingGeometry;
    }

    set instancingGeometry(geometry: BufferGeometry) {
        this.restart();
        this.particles.length = 0;
        this.rendererSettings.instancingGeometry = geometry;
        this.neededToUpdateRender = true;
    }

    get renderMode(): RenderMode {
        return this.rendererSettings.renderMode;
    }

    set renderMode(renderMode: RenderMode) {
        if ((this.rendererSettings.renderMode != RenderMode.Trail && renderMode === RenderMode.Trail)
            || (this.rendererSettings.renderMode == RenderMode.Trail && renderMode !== RenderMode.Trail)) {
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
                        geometry: new PlaneGeometry(1, 1)
                    };
                    this.startRotation = new AxisAngleGenerator(new Vector3(0, 1, 0), new ConstantValue(0));
                    break;
                case RenderMode.BillBoard:
                case RenderMode.StretchedBillBoard:
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

    get renderOrder(): number {
        return this.rendererSettings.renderOrder;
    }

    set renderOrder(renderOrder: number) {
        this.rendererSettings.renderOrder = renderOrder;
        this.neededToUpdateRender = true;
        //this.emitter.rebuildMaterial();
    }

    get blending() {
        return this.rendererSettings.material.blending;
    }

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
        this.speedFactor = parameters.speedFactor ?? 0;
        this.rendererEmitterSettings = parameters.rendererEmitterSettings ?? {};

        this.rendererSettings = {
            instancingGeometry: parameters.instancingGeometry ?? DEFAULT_GEOMETRY,
            renderMode: parameters.renderMode ?? RenderMode.BillBoard,
            renderOrder: parameters.renderOrder ?? 0,
            material: parameters.material,
            uTileCount: parameters.uTileCount ?? 1,
            vTileCount: parameters.vTileCount ?? 1,
            layers: parameters.layers ?? new Layers(),
        };
        this.neededToUpdateRender = true;

        this.particles = new Array<Particle>();

        this.startTileIndex = parameters.startTileIndex || new ConstantValue(0);
        this.emitter = new ParticleEmitter(this);

        this.paused = false;
        this.particleNum = 0;
        this.emissionState = {
            burstIndex: 0,
            burstWaveIndex: 0,
            time: 0,
            waitEmiting: 0,
        }

        this.emitEnded = false;
        this.markForDestroy = false;
        this.prewarmed = false;
    }

    pause() {
        this.paused = true;
    }

    play() {
        this.paused = false;
    }

    private spawn(count: number, emissionState: EmissionState, matrix: Matrix4) {
        tempQ.setFromRotationMatrix(matrix);
        const translation = tempV;
        const quaternion = tempQ;
        const scale = tempV2;
        matrix.decompose(translation, quaternion, scale);
        for (let i = 0; i < count; i++) {

            this.particleNum++;
            while (this.particles.length < this.particleNum) {
                if (this.rendererSettings.renderMode === RenderMode.Trail) {
                    this.particles.push(new TrailParticle());
                } else {
                    this.particles.push(new SpriteParticle());
                }
            }
            const particle = this.particles[this.particleNum - 1];
            this.startColor.genColor(particle.startColor, Math.random());
            particle.color.copy(particle.startColor);
            particle.startSpeed = this.startSpeed.genValue(emissionState.time / this.duration);
            particle.life = this.startLife.genValue(emissionState.time / this.duration);
            particle.age = 0;
            particle.startSize = this.startSize.genValue(emissionState.time / this.duration);
            particle.uvTile = Math.floor(this.startTileIndex.genValue());
            particle.size = particle.startSize;
            if (this.rendererSettings.renderMode === RenderMode.Mesh
                || this.rendererSettings.renderMode === RenderMode.BillBoard
                || this.rendererSettings.renderMode === RenderMode.StretchedBillBoard
            ) {
                const sprite = particle as SpriteParticle;
                if (this.rendererSettings.renderMode === RenderMode.Mesh) {
                    if (!(sprite.rotation instanceof Quaternion)) {
                        sprite.rotation = new Quaternion();
                    }
                    if (this.startRotation.type === "rotation") {
                        this.startRotation.genValue(sprite.rotation as Quaternion, emissionState.time / this.duration);
                    } else {
                        (sprite.rotation as Quaternion).setFromAxisAngle(UP, this.startRotation.genValue((emissionState.time / this.duration) as number));
                    }
                } else {
                    if (this.startRotation.type === "rotation") {
                        sprite.rotation = 0;
                    } else {
                        sprite.rotation = this.startRotation.genValue(emissionState.time / this.duration);
                    }
                }
            } else if (this.rendererSettings.renderMode === RenderMode.Trail) {
                const trail = particle as TrailParticle;
                trail.length = (this.rendererEmitterSettings as TrailSettings).startLength.genValue(emissionState.time / this.duration);
                trail.reset();
            }

            this.emitterShape.initialize(particle);
            if (this.rendererSettings.renderMode === RenderMode.Trail
                && (this.rendererEmitterSettings as TrailSettings).followLocalOrigin) {
                const trail = particle as TrailParticle;
                trail.localPosition = new Vector3().copy(trail.position);
            }
            if (this.worldSpace) {
                particle.position.applyMatrix4(matrix);
                particle.startSize = particle.startSize * (scale.x + scale.y + scale.z) / 3;
                particle.size = particle.startSize;
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
                this.behaviors[j].initialize(particle);
            }
        }
    }

    endEmit() {
        this.emitEnded = true;
        if (this.autoDestroy) {
            this.markForDestroy = true;
        }
    }

    dispose() {
        if (this._renderer)
            this._renderer.deleteSystem(this);
        this.emitter.dispose();
        if (this.emitter.parent)
            this.emitter.parent.remove(this.emitter);
    }

    restart() {
        this.paused = false;
        this.particleNum = 0;
        this.emissionState.burstIndex = 0;
        this.emissionState.burstWaveIndex = 0;
        this.emissionState.time = 0;
        this.emissionState.waitEmiting = 0;
        this.behaviors.forEach(behavior => {
            behavior.reset();
        });
        this.emitEnded = false;
        this.markForDestroy = false;
        this.prewarmed = false;
    }

    //firstTimeUpdate = true;

    private update(delta: number) {
        /*if (this.firstTimeUpdate) {
            this.renderer.addSystem(this);
            this.firstTimeUpdate = false;
        }*/

        if (this.paused)
            return;

        let currentParent: Object3D = this.emitter;
        while (currentParent.parent) {
            currentParent = currentParent.parent;
        }
        if (currentParent.type !== "Scene") {
            this.dispose();
            return;
        }

        if (this.emitEnded && this.particleNum === 0) {
            if (this.markForDestroy && this.emitter.parent)
                this.dispose();
            return;
        }

        if (this.looping && this.prewarm && !this.prewarmed) {
            this.prewarmed = true;
            for (let i = 0; i < this.duration * PREWARM_FPS; i++) {
                this.update(1.0 / PREWARM_FPS);
            }
        }

        if (this.neededToUpdateRender) {
            if (this._renderer)
                this._renderer.updateSystem(this);
            this.neededToUpdateRender = false;
        }

        if (!this.onlyUsedByOther) {
            this.emit(delta, this.emissionState, this.emitter.matrixWorld);
        }

        // simulate
        for (let j = 0; j < this.behaviors.length; j++) {
            for (let i = 0; i < this.particleNum; i++) {
                if (!this.particles[i].died) {
                    this.behaviors[j].update(this.particles[i], delta);
                }
            }
            this.behaviors[j].frameUpdate(delta);
        }
        for (let i = 0; i < this.particleNum; i++) {
            if ((this.rendererEmitterSettings as TrailSettings).followLocalOrigin
                && (this.particles[i] as TrailParticle).localPosition) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.particles[i].position.copy((this.particles[i] as TrailParticle).localPosition!);
                if (this.particles[i].parentMatrix) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.particles[i].position.applyMatrix4(this.particles[i].parentMatrix!);
                } else {
                    this.particles[i].position.applyMatrix4(this.emitter.matrixWorld);
                }
            } else {
                this.particles[i].position.addScaledVector(this.particles[i].velocity, delta);
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

    public emit(delta: number, emissionState: EmissionState, emitterMatrix: Matrix4) {
        if (emissionState.time > this.duration) {
            if (this.looping) {
                emissionState.time -= this.duration;
                emissionState.burstIndex = 0;
                this.behaviors.forEach(behavior => {
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
        while (emissionState.burstIndex < this.emissionBursts.length && this.emissionBursts[emissionState.burstIndex].time <= emissionState.time) {
            if (Math.random() < this.emissionBursts[emissionState.burstIndex].probability) {
                const count = this.emissionBursts[emissionState.burstIndex].count;
                this.spawn(count, emissionState, emitterMatrix);
            }
            emissionState.burstIndex++;
        }


        if (!this.emitEnded) {
            emissionState.waitEmiting += delta * this.emissionOverTime.genValue(emissionState.time / this.duration);

            if (this.previousWorldPos != undefined) {
                this.emitter.getWorldPosition(this.temp);
                this.travelDistance += this.previousWorldPos.distanceTo(this.temp);
                const emitPerMeter = this.emissionOverDistance.genValue(emissionState.time / this.duration)
                if (this.travelDistance * emitPerMeter > 0) {
                    const count = Math.floor(this.travelDistance * emitPerMeter);
                    this.travelDistance -= count / emitPerMeter;
                    emissionState.waitEmiting += count;
                }
            }
        }
        if (this.previousWorldPos === undefined)
            this.previousWorldPos = new Vector3();
        this.emitter.getWorldPosition(this.previousWorldPos);
        emissionState.time += delta;
    }

    toJSON(meta: MetaData, options: SerializationOptions = {}): ParticleSystemJSONParameters {
        const isRootObject = (meta === undefined || typeof meta === 'string');
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
                nodes: {}
            };
        }

        meta.materials[this.rendererSettings.material.uuid] = this.rendererSettings.material.toJSON(meta);

        if (options.useUrlForImage) {
            if (this.texture.source !== undefined) {
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
        } else {
            rendererSettingsJSON = {};
        }
        const geometry = this.rendererSettings.instancingGeometry;
        if (meta.geometries && !meta.geometries[geometry.uuid]) {
            meta.geometries[geometry.uuid] = geometry.toJSON();
        }
        return {
            version: "2.0",
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
            emissionBursts: this.emissionBursts,
            onlyUsedByOther: this.onlyUsedByOther,

            instancingGeometry: this.rendererSettings.instancingGeometry.uuid,//Array.from(this.emitter.interleavedBuffer.array as Float32Array),
            renderOrder: this.renderOrder,
            renderMode: this.renderMode,
            rendererEmitterSettings: rendererSettingsJSON,
            speedFactor: this.renderMode === RenderMode.StretchedBillBoard ? this.speedFactor : 0,
            //texture: this.texture.uuid,
            material: this.rendererSettings.material.uuid,
            layers: this.layers.mask,
            startTileIndex: this.startTileIndex.toJSON(),
            uTileCount: this.uTileCount,
            vTileCount: this.vTileCount,

            behaviors: this.behaviors.map(behavior => behavior.toJSON()),

            worldSpace: this.worldSpace,
        };
    }

    static fromJSON(json: ParticleSystemJSONParameters, meta: { textures: { [uuid: string]: Texture }, materials: { [uuoid: string]: Material }, geometries: { [uuid: string]: BufferGeometry } }, dependencies: { [uuid: string]: Behavior }): ParticleSystem {
        const shape = EmitterFromJSON(json.shape, meta);
        let rendererEmitterSettings;
        if (json.renderMode === RenderMode.Trail) {
            rendererEmitterSettings = {
                startLength: json.rendererEmitterSettings.startLength != undefined ? ValueGeneratorFromJSON(json.rendererEmitterSettings.startLength) : new ConstantValue(30),
                followLocalOrigin: json.rendererEmitterSettings.followLocalOrigin,
            }
        } else if (json.renderMode === RenderMode.Mesh) {
            rendererEmitterSettings = {};
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
            startRotation: GeneratorFromJSON(json.startRotation),
            startSize: ValueGeneratorFromJSON(json.startSize),
            startColor: ColorGeneratorFromJSON(json.startColor),
            emissionOverTime: ValueGeneratorFromJSON(json.emissionOverTime),
            emissionOverDistance: ValueGeneratorFromJSON(json.emissionOverDistance),
            emissionBursts: json.emissionBursts,
            onlyUsedByOther: json.onlyUsedByOther,

            instancingGeometry: meta.geometries[json.instancingGeometry],
            renderMode: json.renderMode,
            rendererEmitterSettings: rendererEmitterSettings,
            renderOrder: json.renderOrder,
            speedFactor: json.speedFactor,
            layers: layers,
            material: json.material ? meta.materials[json.material] : (
                json.texture ? new MeshBasicMaterial({
                        map: meta.textures[json.texture],
                        transparent: json.transparent ?? true,
                        blending: json.blending,
                        side: DoubleSide
                    }) :
                    new MeshBasicMaterial({
                        color: 0xffffff,
                        transparent: true,
                        blending: AdditiveBlending,
                        side: DoubleSide
                    })
            ),
            startTileIndex: typeof json.startTileIndex === 'number' ? new ConstantValue(json.startTileIndex) : ValueGeneratorFromJSON(json.startTileIndex) as ValueGenerator,
            uTileCount: json.uTileCount,
            vTileCount: json.vTileCount,

            behaviors: [],

            worldSpace: json.worldSpace,
        });
        ps.behaviors = json.behaviors.map(behaviorJson => {
            const behavior = BehaviorFromJSON(behaviorJson, ps);
            if (behavior.type === "EmitSubParticleSystem") {
                dependencies[behaviorJson.subParticleSystem] = behavior;
            }
            return behavior;
        });
        return ps;
    }

    addBehavior(behavior: Behavior) {
        this.behaviors.push(behavior);
    }

    getRendererSettings() {
        return this.rendererSettings;
    }

    clone() {
        const newEmissionBursts: Array<BurstParameters> = [];
        for (const emissionBurst of this.emissionBursts) {
            const newEmissionBurst = {};
            Object.assign(newEmissionBurst, emissionBurst)
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

            instancingGeometry: this.rendererSettings.instancingGeometry,//.interleavedBuffer.array,
            renderMode: this.renderMode,
            renderOrder: this.renderOrder,
            rendererEmitterSettings: rendererEmitterSettings,
            speedFactor: this.speedFactor,
            material: this.rendererSettings.material,
            startTileIndex: this.startTileIndex,
            uTileCount: this.uTileCount,
            vTileCount: this.vTileCount,

            behaviors: newBehaviors,

            worldSpace: this.worldSpace,
            layers: layers,
        });
    }

}
