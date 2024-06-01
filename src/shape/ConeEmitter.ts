import {EmitterMode, EmitterShape, getValueFromEmitterMode, ShapeJSON} from './EmitterUtil';
import {Particle} from '../Particle';
import {MathUtils} from 'three';
import {ConstantValue, FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {EmissionState, ParticleSystem} from '../ParticleSystem';

export interface ConeEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
    angle?: number; // [0, Math.PI / 2]
    mode?: EmitterMode;
    spread?: number;
    speed?: ValueGenerator | FunctionValueGenerator;
}

export class ConeEmitter implements EmitterShape {
    type = 'cone';
    radius: number;
    arc: number; // [0, Math.PI * 2]
    thickness: number; // [0, 1]
    angle: number; // [0, Math.PI / 2]
    mode: EmitterMode;
    spread: number;
    speed: ValueGenerator | FunctionValueGenerator;

    private currentValue = 0;

    constructor(parameters: ConeEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
        this.angle = parameters.angle ?? Math.PI / 6;
        this.mode = parameters.mode ?? EmitterMode.Random;
        this.spread = parameters.spread ?? 0;
        this.speed = parameters.speed ?? new ConstantValue(1);
    }

    update(system: ParticleSystem, delta: number): void {
        if (EmitterMode.Random != this.mode) {
            this.currentValue += this.speed.genValue(system.emissionState.time / system.duration) * delta;
        }
    }

    initialize(p: Particle, emissionState: EmissionState) {
        const u = getValueFromEmitterMode(this.mode, this.currentValue, this.spread, emissionState);
        const rand = MathUtils.lerp(1 - this.thickness, 1, Math.random());
        const theta = u * this.arc;
        const r = Math.sqrt(rand);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        p.position.x = r * cosTheta;
        p.position.y = r * sinTheta;
        p.position.z = 0;

        const angle = this.angle * r;
        p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed);
        //const v = Math.random();
        p.position.multiplyScalar(this.radius);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'cone',
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            angle: this.angle,
            mode: this.mode,
            spread: this.spread,
            speed: this.speed.toJSON(),
        };
    }

    static fromJSON(json: ShapeJSON): ConeEmitter {
        return new ConeEmitter({
            radius: json.radius,
            arc: json.arc,
            thickness: json.thickness,
            angle: json.angle,
            mode: json.mode,
            speed: json.speed ? ValueGeneratorFromJSON(json.speed) : undefined,
            spread: json.spread,
        });
    }

    clone(): EmitterShape {
        return new ConeEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            angle: this.angle,
            mode: this.mode,
            speed: this.speed.clone(),
            spread: this.spread,
        });
    }
}
