import {EmitterMode, EmitterShape, getValueFromEmitterMode, ShapeJSON} from './EmitterUtil';
import {Particle} from '../Particle';
import {MathUtils} from 'three';
import {ConstantValue, FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {EmissionState, ParticleSystem} from '../ParticleSystem';

export interface CircleEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
    mode?: EmitterMode;
    spread?: number;
    speed?: ValueGenerator | FunctionValueGenerator;
}

export class CircleEmitter implements EmitterShape {
    type = 'circle';
    radius: number;
    arc: number; // [0, Math.PI * 2]
    thickness: number; // [0, 1]
    mode: EmitterMode;
    spread: number;
    speed: ValueGenerator | FunctionValueGenerator;

    private currentValue = 0;

    constructor(parameters: CircleEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
        this.mode = parameters.mode ?? EmitterMode.Random;
        this.spread = parameters.spread ?? 0;
        this.speed = parameters.speed ?? new ConstantValue(1);
    }

    update(system: ParticleSystem, delta: number): void {
        this.currentValue += this.speed.genValue(system.emissionState.time / system.duration) * delta;
    }

    initialize(p: Particle, emissionState: EmissionState) {
        const u = getValueFromEmitterMode(this.mode, this.currentValue, this.spread, emissionState);
        const r = MathUtils.lerp(1 - this.thickness, 1, Math.random());
        const theta = u * this.arc;
        p.position.x = Math.cos(theta);
        p.position.y = Math.sin(theta);
        p.position.z = 0;
        p.velocity.copy(p.position).multiplyScalar(p.startSpeed);
        //const v = Math.random();
        p.position.multiplyScalar(this.radius * r);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'circle',
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            mode: this.mode,
            spread: this.spread,
            speed: this.speed.toJSON(),
        };
    }

    static fromJSON(json: any): CircleEmitter {
        return new CircleEmitter({
            radius: json.radius,
            arc: json.arc,
            thickness: json.thickness,
            mode: json.mode,
            speed: json.speed ? ValueGeneratorFromJSON(json.speed) : undefined,
            spread: json.spread,
        });
    }

    clone(): EmitterShape {
        return new CircleEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            mode: this.mode,
            speed: this.speed.clone(),
            spread: this.spread,
        });
    }
}
