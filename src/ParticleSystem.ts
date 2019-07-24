import {FunctionValueGenerator, ValueGenerator} from "./functions/ValueGenerator";
import {Behavior} from "./Behavior";
import {Particle} from "./Particle";
import {ParticleEmitter} from "./ParticleEmitter";
import {EmitterShape, ShapeJSON} from "./EmitterShape";
import {ConeEmitter} from "./shape/ConeEmitter";
import {Blending, Matrix3, Texture, Vector4} from "three";
import {SphereEmitter} from "./shape/SphereEmitter";
import {ColorGenerator, ConstantColor, FunctionColorGenerator} from "./functions/ColorGenerator";
import {ConstantValue} from "./functions/ConstantValue";
import {FunctionJSON} from "./functions/FunctionJSON";


export interface ParticleSystemParameters {
    // parameters
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

    texture?: Texture;
    startTileIndex?: number;
    uTileCount?: number;
    vTileCount?: number;
    blending?: Blending;

    worldSpace?: boolean;

}

export interface ParticleSystemJSONParameters {

    // parameters
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

    texture: string;
    startTileIndex: number;
    uTileCount: number;
    vTileCount: number;
    blending: number;

    behaviors: Array<any>;

    worldSpace: boolean;
}

export class ParticleSystem {
    // parameters
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

    tileCount: number = 1;
    worldSpace: boolean;

    // runtime data
    particleNum: number;
    private time: number;
    private waitEmiting: number;

    private behaviors: Array<Behavior>;

    particles: Array<Particle>;
    emitterShape: EmitterShape;
    emitter: ParticleEmitter;

    get texture() {
        return this.emitter.material.uniforms.map.value;
    }

    set texture(texture: Texture) {
        this.emitter.material.uniforms.map.value = texture;
    }


    get uTileCount() {
        return this.emitter.material.uniforms.tileCount.value.x;
    }

    set uTileCount(u: number) {
        this.emitter.material.uniforms.tileCount.value.x = u;
    }

    get vTileCount() {
        return this.emitter.material.uniforms.tileCount.value.y;
    }

    set vTileCount(v: number) {
        this.emitter.material.uniforms.tileCount.value.y = v;
    }

    get blending() {
        return this.emitter.material.blending;
    }

    set blending(blending) {
        this.emitter.material.blending = blending;
    }

    constructor(parameters: ParticleSystemParameters = {}) {
        this.duration = parameters.duration || 1;
        this.maxParticle = parameters.maxParticle || 100;
        this.looping = parameters.looping === undefined ? true : parameters.looping;
        this.startLife = parameters.startLife || new ConstantValue(5);
        this.startSpeed = parameters.startSpeed || new ConstantValue(0);
        this.startRotation = parameters.startRotation || new ConstantValue(0);
        this.startSize = parameters.startSize || new ConstantValue(1);
        this.startColor = parameters.startColor || new ConstantColor(new Vector4(1, 1, 1, 1));
        this.emissionOverTime = parameters.emissionOverTime || new ConstantValue(10);
        this.emissionOverDistance = parameters.emissionOverDistance || new ConstantValue(0);
        this.emitterShape = parameters.shape || new SphereEmitter();

        if (parameters.worldSpace === undefined)
            parameters.worldSpace = true;
        this.worldSpace = parameters.worldSpace;

        this.behaviors = new Array<Behavior>();
        this.particles = new Array<Particle>();


        this.startTileIndex = parameters.startTileIndex || 0;
        this.emitter = new ParticleEmitter(this, parameters);

        this.particleNum = 0;

        this.time = 0;
        this.waitEmiting = 0;
    }

    end() {

    }

    spawn() {
        while (this.particleNum >= this.particles.length) {
            this.particles.push(new Particle());
        }
        this.particleNum++;
        const particle = this.particles[this.particleNum - 1];

        this.startColor.genColor(particle.startColor, this.time);
        particle.color.copy(particle.startColor);
        particle.startSpeed = this.startSpeed.genValue(this.time);
        particle.life = this.startLife.genValue(this.time);
        particle.age = 0;
        particle.rotation = this.startRotation.genValue(this.time);
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

    normalMatrix: Matrix3 = new Matrix3();

    update(delta: number) {
        if (delta > 0.1)
            delta = 0.1;

        if (this.time > this.duration) {
            if (this.looping) {
                this.time -= this.duration;
            } else {
                this.end();
                return;
            }
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
        while (this.waitEmiting > 0 && this.particleNum < this.maxParticle) {
            this.spawn();
            this.waitEmiting--;
        }

        for (let i = 0; i < this.particleNum; i++) {
            let particle = this.particles[i];

            for (let j = 0; j < this.behaviors.length; j++) {
                this.behaviors[j].update(particle, delta);
            }
            particle.position.addScaledVector(particle.velocity, delta);
            particle.age += delta;
        }
        //console.log(this.particleNum + " " + this.particles.length);
        this.emitter.update();

        this.waitEmiting += delta * this.emissionOverTime.genValue(this.time);
        this.time += delta;
    }

    toJSON(): ParticleSystemJSONParameters {
        return {
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

            texture: this.texture.name,
            startTileIndex: this.startTileIndex,
            uTileCount: this.uTileCount,
            vTileCount: this.vTileCount,
            blending: this.blending,

            behaviors: this.behaviors.map(behavior => behavior.toJSON()),

            worldSpace: this.worldSpace,
        };
    }

    addBehavior(behavior: Behavior) {
        this.behaviors.push(behavior);
    }
}