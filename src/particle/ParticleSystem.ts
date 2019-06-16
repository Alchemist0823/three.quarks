import {ConstantValue, ValueGenerator} from "./ValueGenerator";
import {Behavior} from "./Behavior";
import {Particle} from "./Particle";
import {ParticleRenderer} from "./ParticleRenderer";
import {ParticleEmitter} from "./ParticleEmitter";
import {ConeEmitter} from "./emitters/ConeEmitter";
import {Blending, Texture, Vector4} from "three";
import {SphereEmitter} from "./emitters/SphereEmitter";


export interface ParticleSystemParameters {
    // parameters
    looping?: boolean;
    duration?: number;
    maxParticle?: number;
    startLife?: ValueGenerator;
    startSpeed?: ValueGenerator;
    startRotation?: ValueGenerator;
    startSize?: ValueGenerator;
    startColor?: Vector4;
    emissionOverTime?: ValueGenerator;
    emissionOverDistance?: ValueGenerator;

    texture?: Texture;
    startTileIndex?: number;
    uTileCount?: number;
    vTileCount?: number;
    blending?: Blending;

    worldSpace?: boolean;

}

export class ParticleSystem {
    // parameters
    looping: boolean;
    duration: number;
    maxParticle: number;
    startLife: ValueGenerator;
    startSpeed: ValueGenerator;
    startRotation: ValueGenerator;
    startSize: ValueGenerator;
    startColor: Vector4;
    startTileIndex: number;

    emissionOverTime: ValueGenerator;
    emissionOverDistance: ValueGenerator;

    tileCount: number = 1;
    worldSpace: boolean;

    // runtime data
    particleNum: number;
    private time: number;
    private waitEmiting: number;

    private behaviors: Array<Behavior>;

    particles: Array<Particle>;
    emitter: ParticleEmitter;
    renderer: ParticleRenderer;

    constructor(parameters: ParticleSystemParameters = {}) {
        this.duration = parameters.duration || 1;
        this.maxParticle = parameters.maxParticle || 100;
        this.looping = parameters.looping === undefined ? true: parameters.looping;
        this.startLife = parameters.startLife || new ConstantValue(5);
        this.startSpeed = parameters.startSpeed || new ConstantValue(0);
        this.startRotation = parameters.startRotation || new ConstantValue(0);
        this.startSize = parameters.startSize || new ConstantValue(1);
        this.startColor = parameters.startColor || new Vector4(1,1,1,1);
        this.emissionOverTime = parameters.emissionOverTime || new ConstantValue(10);
        this.emissionOverDistance = parameters.emissionOverDistance || new ConstantValue(0);

        if (parameters.worldSpace === undefined)
            parameters.worldSpace = true;
        this.worldSpace = parameters.worldSpace;

        this.behaviors =  new Array<Behavior>();
        this.particles = new Array<Particle>();

        this.emitter = new SphereEmitter();

        this.startTileIndex = parameters.startTileIndex || 0;
        this.renderer = new ParticleRenderer(this, parameters);

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
        this.particleNum ++;
        const particle = this.particles[this.particleNum - 1];
        particle.startColor.copy(this.startColor);
        particle.color.copy(this.startColor);
        particle.startSpeed = this.startSpeed.genValue(this.time);
        particle.life = this.startLife.genValue(this.time);
        particle.age = 0;
        particle.rotation = this.startRotation.genValue(this.time);
        particle.size = this.startSize.genValue(this.time);
        particle.uvTile = this.startTileIndex;

        this.emitter.initialize(particle);

        if (this.worldSpace) {
            particle.position.applyMatrix4(this.renderer.matrixWorld);
            //particle.velocity.applyMatrix4(this.renderer.matrixWorld);
        }
    }

    update(delta: number) {
        if (this.time > this.duration) {
            if (this.looping) {
                this.time -= this.duration;
            } else {
                this.end();
                return;
            }
        }

        // particle die
        for(let i = 0; i < this.particleNum; i ++) {
            let particle = this.particles[i];
            if (particle.age > particle.life) {
                this.particles[i] = this.particles[this.particleNum - 1];
                this.particles[this.particleNum - 1] = particle;
                this.particleNum--;
            }
        }

        // spawn
        while (this.waitEmiting > 0 && this.particleNum < this.maxParticle) {
            this.spawn();
            this.waitEmiting --;
        }

        for(let i = 0; i < this.particleNum; i ++) {
            let particle = this.particles[i];

            for(let j = 0; j < this.behaviors.length; j ++) {
                    this.behaviors[j].update(particle);
            }
            particle.position.addScaledVector(particle.velocity, delta);
            particle.age += delta;
        }
        //console.log(this.particleNum + " " + this.particles.length);
        this.renderer.update();

        this.waitEmiting += delta * this.emissionOverTime.genValue(this.time);
        this.time += delta;
    }
}