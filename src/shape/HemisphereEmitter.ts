import {EmitterMode, EmitterShape, getValueFromEmitterMode, ShapeJSON} from './EmitterUtil';
import {Particle} from '../Particle';
import {MathUtils} from 'three';
import {ConstantValue, FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {ParticleSystem} from '../ParticleSystem';

export interface HemisphereEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
    mode?: EmitterMode;
    spread?: number;
    speed?: ValueGenerator | FunctionValueGenerator;
}

export class HemisphereEmitter implements EmitterShape {
    type = 'sphere';
    radius: number;
    arc: number;
    thickness: number; //[0, 1]
    mode: EmitterMode;
    spread: number;
    speed: ValueGenerator | FunctionValueGenerator;

    constructor(parameters: HemisphereEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
        this.mode = parameters.mode ?? EmitterMode.Random;
        this.spread = parameters.spread ?? 0;
        this.speed = parameters.speed ?? new ConstantValue(1);
    }
    private currentValue = 0;

    update(system: ParticleSystem, delta: number): void {
        if (EmitterMode.Random != this.mode) {
            this.currentValue += this.speed.genValue(system.emissionState.time / system.duration) * delta;
        }
    }

    initialize(p: Particle) {
        const u = getValueFromEmitterMode(this.mode, this.currentValue, this.spread);
        const v = Math.random();
        const rand = MathUtils.lerp(1 - this.thickness, 1, Math.random());
        const theta = u * this.arc;
        const phi = Math.acos(v);
        //const r = Math.cbrt(rand);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        p.position.x = sinPhi * cosTheta;
        p.position.y = sinPhi * sinTheta;
        p.position.z = cosPhi;

        p.velocity.copy(p.position).multiplyScalar(p.startSpeed);
        p.position.multiplyScalar(this.radius * rand);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'hemisphere',
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            mode: this.mode,
            spread: this.spread,
            speed: this.speed.toJSON(),
        };
    }

    static fromJSON(json: any): HemisphereEmitter {
        return new HemisphereEmitter({
            radius: json.radius,
            arc: json.arc,
            thickness: json.thickness,
            mode: json.mode,
            speed: json.speed ? ValueGeneratorFromJSON(json.speed) : undefined,
            spread: json.spread,
        });
    }

    clone(): EmitterShape {
        return new HemisphereEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            mode: this.mode,
            speed: this.speed.clone(),
            spread: this.spread,
        });
    }
}
