import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from "./functions/ValueGenerator";
import {Behavior, BehaviorFromJSON} from "./behaviors/Behavior";
import {Particle} from "./Particle";
import {ParticleEmitter} from "./ParticleEmitter";
import {EmitterShape, ShapeJSON} from "./EmitterShape";
import {ConeEmitter} from "./shape/ConeEmitter";
import {
    Blending,
    BufferGeometry,
    Matrix3,
    Matrix4,
    NormalBlending,
    PlaneBufferGeometry,
    Quaternion,
    Texture, Vector3,
    Vector4
} from "three";
import {SphereEmitter} from "./shape/SphereEmitter";
import {
    ColorGenerator,
    ColorGeneratorFromJSON,
    ConstantColor,
    FunctionColorGenerator
} from "./functions/ColorGenerator";
import {ConstantValue} from "./functions/ConstantValue";
import {FunctionJSON} from "./functions/FunctionJSON";
import {PointEmitter} from "./shape/PointEmitter";
import {DonutEmitter} from "./shape/DonutEmitter";
import {ParticleSystemBatchSettings, RenderMode} from "./ParticleSystemBatch";
import {BatchedParticleRenderer} from "./BatchedParticleRenderer";


export interface BurstParameters {
    time: number;
    count: number;
    cycle: number;
    interval: number;
    probability: number;
}

const UP = new Vector3(0,0,1);

export interface ParticleSystemParameters {
    // parameters
    autoDestroy?: boolean;
    looping?: boolean;
    duration?: number;
    maxParticle?: number;

    shape?: EmitterShape;
    startLife?: ValueGenerator | FunctionValueGenerator;
    startSpeed?: ValueGenerator | FunctionValueGenerator;
    startRotation?: ValueGenerator | FunctionValueGenerator;
    startSize?: ValueGenerator | FunctionValueGenerator;
    startColor?: ColorGenerator | FunctionColorGenerator;
    emissionOverTime?: ValueGenerator | FunctionValueGenerator;
    emissionOverDistance?: ValueGenerator | FunctionValueGenerator;
    emissionBursts?: Array<BurstParameters>;

    behaviors?: Array<Behavior>;

    instancingGeometry?: BufferGeometry;
    renderMode?: RenderMode;
    speedFactor?: number;
    texture: Texture;
    startTileIndex?: number;
    uTileCount?: number;
    vTileCount?: number;
    renderOrder?: number;
    blending?: Blending;

    worldSpace?: boolean;

}

export interface ParticleSystemJSONParameters {

    // parameters
    autoDestroy: boolean;
    looping: boolean;
    duration: number;
    maxParticle: number;

    shape: ShapeJSON;
    startLife: FunctionJSON;
    startSpeed: FunctionJSON;
    startRotation: FunctionJSON;
    startSize: FunctionJSON;
    startColor: FunctionJSON;
    emissionOverTime: FunctionJSON;
    emissionOverDistance: FunctionJSON;
    emissionBursts?: Array<BurstParameters>;

    instancingGeometry?: any;
    renderMode: number;
    renderOrder?: number;
    speedFactor?: number;
    texture: string;
    startTileIndex: number;
    uTileCount: number;
    vTileCount: number;
    blending: number;

    behaviors: Array<any>;

    worldSpace: boolean;
}

const DEFAULT_GEOMETRY = new PlaneBufferGeometry(1, 1, 1, 1)

export class ParticleSystem {
    // parameters
    autoDestroy: boolean;
    looping: boolean;
    duration: number;
    maxParticle: number;
    startLife: ValueGenerator | FunctionValueGenerator;
    startSpeed: ValueGenerator | FunctionValueGenerator;
    startRotation: ValueGenerator | FunctionValueGenerator;
    startSize: ValueGenerator | FunctionValueGenerator;
    startColor: ColorGenerator | FunctionColorGenerator;
    startTileIndex: number;

    emissionOverTime: ValueGenerator | FunctionValueGenerator;
    emissionOverDistance: ValueGenerator | FunctionValueGenerator;
    emissionBursts: Array<BurstParameters>;

    worldSpace: boolean;
    speedFactor: number;

    // runtime data
    particleNum: number;
    private burstIndex: number;
    private burstWaveIndex: number;
    private time: number;
    paused: boolean;
    private waitEmiting: number;
    private emitEnded: boolean;
    private markForDestroy: boolean;

    behaviors: Array<Behavior>;

    particles: Array<Particle>;
    emitterShape: EmitterShape;
    emitter: ParticleEmitter;

    rendererSettings: ParticleSystemBatchSettings;
    renderer: BatchedParticleRenderer;
    neededToUpdateRender: boolean;

    get texture() {
        return this.rendererSettings.texture;
    }

    set texture(texture: Texture) {
        this.rendererSettings.texture = texture;
        this.neededToUpdateRender = true;
        //this.emitter.material.uniforms.map.value = texture;
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

    get renderMode(): RenderMode {
        return this.rendererSettings.renderMode;
    }

    set renderMode(renderMode: RenderMode) {
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
        return this.rendererSettings.blending;
    }

    set blending(blending) {
        this.rendererSettings.blending = blending;
        this.neededToUpdateRender = true;
    }

    constructor(renderer: BatchedParticleRenderer, parameters: ParticleSystemParameters) {
        this.renderer = renderer;
        this.autoDestroy = parameters.autoDestroy === undefined ? false : parameters.autoDestroy;
        this.duration = parameters.duration ?? 1;
        this.maxParticle = parameters.maxParticle ?? 100;
        this.looping = parameters.looping === undefined ? true : parameters.looping;
        this.startLife = parameters.startLife ?? new ConstantValue(5);
        this.startSpeed = parameters.startSpeed ?? new ConstantValue(0);
        this.startRotation = parameters.startRotation ?? new ConstantValue(0);
        this.startSize = parameters.startSize ?? new ConstantValue(1);
        this.startColor = parameters.startColor ?? new ConstantColor(new Vector4(1, 1, 1, 1));
        this.emissionOverTime = parameters.emissionOverTime ?? new ConstantValue(10);
        this.emissionOverDistance = parameters.emissionOverDistance ?? new ConstantValue(0);
        this.emissionBursts = parameters.emissionBursts ?? [];
        this.emitterShape = parameters.shape ?? new SphereEmitter();
        this.behaviors = parameters.behaviors ?? new Array<Behavior>();
        this.worldSpace = parameters.worldSpace ?? false;
        this.speedFactor = parameters.speedFactor ?? 0;
        this.rendererSettings = {
            blending: parameters.blending ?? NormalBlending,
            instancingGeometry: parameters.instancingGeometry ?? DEFAULT_GEOMETRY,
            renderMode: parameters.renderMode ?? RenderMode.BillBoard,
            renderOrder: parameters.renderOrder ?? 0,
            texture: parameters.texture,
            uTileCount: parameters.uTileCount ?? 1,
            vTileCount: parameters.vTileCount ?? 1
        };
        this.neededToUpdateRender = true;

        this.particles = new Array<Particle>();

        this.startTileIndex = parameters.startTileIndex || 0;
        this.emitter = new ParticleEmitter(this);

        this.particleNum = 0;
        this.burstIndex = 0;
        this.burstWaveIndex = 0;
        this.time = 0;
        this.paused = false;
        this.waitEmiting = 0;
        this.emitEnded = false;
        this.markForDestroy = false;
    }

    pause() {
        this.paused = true;
    }

    play() {
        this.paused = false;
    }

    spawn(count: number) {
        for (let i = 0; i < count && this.particleNum < this.maxParticle; i ++) {

            this.particleNum++;
            while (this.particles.length < this.particleNum) {
                this.particles.push(new Particle());
            }
            const particle = this.particles[this.particleNum - 1];

            this.startColor.genColor(particle.startColor, this.time);
            particle.color.copy(particle.startColor);
            particle.startSpeed = this.startSpeed.genValue(this.time);
            particle.life = this.startLife.genValue(this.time);
            particle.age = 0;
            particle.rotation = this.startRotation.genValue(this.time);
            if (this.rendererSettings.renderMode === RenderMode.LocalSpace)
                particle.rotationQuat = new Quaternion().setFromAxisAngle(UP, particle.rotation);
            particle.startSize = particle.size = this.startSize.genValue(this.time);
            particle.uvTile = this.startTileIndex;

            this.emitterShape.initialize(particle);

            if (this.worldSpace) {
                particle.position.applyMatrix4(this.emitter.matrixWorld);
                particle.velocity.applyMatrix3(this.normalMatrix);
            }

            for (let j = 0; j < this.behaviors.length; j++) {
                this.behaviors[j].initialize(particle);
            }
        }

    }

    oldWorldMatrix: Matrix4 = new Matrix4();
    normalMatrix: Matrix3 = new Matrix3();

    endEmit() {
        this.emitEnded = true;
        if (this.autoDestroy) {
            this.markForDestroy = true;
        }
    }

    dispose() {
        this.renderer.deleteSystem(this);
        this.emitter!.dispose();
        if (this.emitter.parent)
            this.emitter.parent.remove(this.emitter);
    }

    restart() {
        this.paused = false;
        this.particleNum = 0;
        this.burstIndex = 0;
        this.burstWaveIndex = 0;
        this.time = 0;
        this.waitEmiting = 0;
        this.emitEnded = false;
        this.markForDestroy = false;
    }

    firstTimeUpdate = true;

    update(delta: number) {
        if (this.firstTimeUpdate) {
            this.renderer.addSystem(this);
            this.firstTimeUpdate = false;
        }
        if (delta > 0.1)
            delta = 0.1;

        if (this.paused)
            return;

        if (this.emitEnded && this.particleNum === 0) {
            if (this.markForDestroy && this.emitter.parent)
                this.dispose();
            return;
        }

        if (this.time > this.duration) {
            if (this.looping) {
                this.time -= this.duration;
            } else {
                if (!this.emitEnded) {
                    this.endEmit();
                }
            }
        }

        if (this.neededToUpdateRender) {
            this.renderer.updateSystem(this);
            this.neededToUpdateRender = false;
        }

        this.normalMatrix.getNormalMatrix(this.emitter.matrixWorld);

        // particle die
        for (let i = 0; i < this.particleNum; i++) {
            let particle = this.particles[i];
            if (particle.age >= particle.life) {
                this.particles[i] = this.particles[this.particleNum - 1];
                this.particles[this.particleNum - 1] = particle;
                this.particleNum--;
                i --;
            }
        }

        // spawn
        if (!this.emitEnded) {
            const totalSpawn = Math.ceil(this.waitEmiting);
            this.spawn(totalSpawn);
            this.waitEmiting -= totalSpawn;
        }

        // spawn burst
        while (this.burstIndex < this.emissionBursts.length && this.emissionBursts[this.burstIndex].time <= this.time) {
            if (Math.random() < this.emissionBursts[this.burstIndex].probability) {
                let count = this.emissionBursts[this.burstIndex].count;
                this.spawn(count);
            }
            this.burstIndex ++;
        }

        for (let i = 0; i < this.particleNum; i++) {
            let particle = this.particles[i];

            for (let j = 0; j < this.behaviors.length; j++) {
                this.behaviors[j].update(particle, delta);
            }
            particle.position.addScaledVector(particle.velocity, delta);
            particle.age += delta;
        }
        //this.emitter.update();

        this.oldWorldMatrix.copy(this.emitter.matrixWorld);

        if (!this.emitEnded) {
            this.waitEmiting += delta * this.emissionOverTime.genValue(this.time / this.duration);
        }
        this.time += delta;
    }

    toJSON(meta: any): ParticleSystemJSONParameters {
        const isRootObject = ( meta === undefined || typeof meta === 'string' );

        this.texture.toJSON(meta);

        if ( this.texture.image !== undefined ) {
            const image = this.texture.image;
            meta.images[ image.uuid ] = {
                uuid: image.uuid,
                url: this.texture.name
            };
        }

        return {
            autoDestroy: this.autoDestroy,
            looping: this.looping,
            duration: this.duration,
            maxParticle: this.maxParticle,

            shape: this.emitterShape.toJSON(),
            startLife: this.startLife.toJSON(),
            startSpeed: this.startSpeed.toJSON(),
            startRotation: this.startRotation.toJSON(),
            startSize: this.startSize.toJSON(),
            startColor: this.startColor.toJSON(),
            emissionOverTime: this.emissionOverTime.toJSON(),
            emissionOverDistance: this.emissionOverDistance.toJSON(),
            emissionBursts: this.emissionBursts,

            instancingGeometry: this.rendererSettings.instancingGeometry.toJSON(),//Array.from(this.emitter.interleavedBuffer.array as Float32Array),
            renderOrder: this.renderOrder,
            renderMode: this.renderMode,
            speedFactor: this.renderMode === RenderMode.StretchedBillBoard ? this.speedFactor: 0,
            texture: this.texture.uuid,
            startTileIndex: this.startTileIndex,
            uTileCount: this.uTileCount,
            vTileCount: this.vTileCount,
            blending: this.blending,

            behaviors: this.behaviors.map(behavior => behavior.toJSON()),

            worldSpace: this.worldSpace,
        };
    }

    static fromJSON(json: ParticleSystemJSONParameters, textures: {[a:string]:Texture}, renderer: BatchedParticleRenderer): ParticleSystem {
        let shape;
        switch(json.shape.type) {
            case 'cone':
                shape = new ConeEmitter(json.shape);
                break;
            case 'donut':
                shape = new DonutEmitter(json.shape);
                break;
            case 'point':
                shape = new PointEmitter();
                break;
            case 'sphere':
                shape = new SphereEmitter(json.shape);
                break;
            default:
                shape = new PointEmitter();
                break;
        }

        return new ParticleSystem(renderer,{
            autoDestroy: json.autoDestroy,
            looping: json.looping,
            duration: json.duration,
            maxParticle: json.maxParticle,

            shape: shape,
            startLife: ValueGeneratorFromJSON(json.startLife),
            startSpeed: ValueGeneratorFromJSON(json.startSpeed),
            startRotation: ValueGeneratorFromJSON(json.startRotation),
            startSize: ValueGeneratorFromJSON(json.startSize),
            startColor: ColorGeneratorFromJSON(json.startColor),
            emissionOverTime: ValueGeneratorFromJSON(json.emissionOverTime),
            emissionOverDistance: ValueGeneratorFromJSON(json.emissionOverDistance),
            emissionBursts: json.emissionBursts,

            //instancingGeometry: json.instancingGeometry, //TODO: Support instancing Geometry in deserialization
            renderMode: json.renderMode,
            renderOrder: json.renderOrder,
            speedFactor: json.speedFactor,
            texture: textures[json.texture],
            startTileIndex: json.startTileIndex,
            uTileCount: json.uTileCount,
            vTileCount: json.vTileCount,
            blending: json.blending,

            behaviors: json.behaviors.map(behavior => BehaviorFromJSON(behavior)),

            worldSpace: json.worldSpace,
        });
    }

    addBehavior(behavior: Behavior) {
        this.behaviors.push(behavior);
    }

    getRendererSettings() {
        return this.rendererSettings;
    }

    clone() {
        let newEmissionBursts: Array<BurstParameters> = [];
        for (let emissionBurst of this.emissionBursts) {
            let newEmissionBurst = {};
            Object.assign(newEmissionBurst, emissionBurst)
            newEmissionBursts.push(newEmissionBurst as BurstParameters);
        }

        let newBehaviors: Array<Behavior> = [];
        for (let behavior of this.behaviors) {
            newBehaviors.push(behavior.clone());
        }

        return new ParticleSystem(this.renderer,{
            autoDestroy: this.autoDestroy,
            looping: this.looping,
            duration: this.duration,
            maxParticle: this.maxParticle,

            shape: this.emitterShape.clone(),
            startLife:this.startLife.clone(),
            startSpeed: this.startSpeed.clone(),
            startRotation: this.startRotation.clone(),
            startSize: this.startSize.clone(),
            startColor: this.startColor.clone(),
            emissionOverTime: this.emissionOverTime.clone(),
            emissionOverDistance: this.emissionOverDistance.clone(),
            emissionBursts: newEmissionBursts,

            instancingGeometry: this.rendererSettings.instancingGeometry,//.interleavedBuffer.array,
            renderMode: this.renderMode,
            speedFactor: this.speedFactor,
            texture: this.texture,
            startTileIndex: this.startTileIndex,
            uTileCount: this.uTileCount,
            vTileCount: this.vTileCount,
            blending: this.blending,

            behaviors: newBehaviors,

            worldSpace: this.worldSpace,
        });
    }

}
