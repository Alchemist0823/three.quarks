import {EmitterMode, EmitterShape, getValueFromEmitterMode, ShapeJSON} from './EmitterUtil';
import {Particle} from '../Particle';
import {MathUtils} from 'three';
import {ConstantValue, FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {ParticleSystem} from '../ParticleSystem';

export interface DonutEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
    donutRadius?: number;
    mode?: EmitterMode;
    spread?: number;
    speed?: ValueGenerator | FunctionValueGenerator;
}

export class DonutEmitter implements EmitterShape {
    type = 'donut';
    radius: number;
    donutRadius: number;
    arc: number; // [0, Math.PI * 2]
    thickness: number;
    mode: EmitterMode;
    spread: number;
    speed: ValueGenerator | FunctionValueGenerator;

    constructor(parameters: DonutEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
        this.donutRadius = parameters.donutRadius ?? this.radius * 0.2;
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
        const phi = v * Math.PI * 2;
        //const r = Math.sqrt(rand);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        p.position.x = this.radius * cosTheta;
        p.position.y = this.radius * sinTheta;
        p.position.z = 0;

        p.velocity.z = this.donutRadius * rand * Math.sin(phi);
        p.velocity.x = this.donutRadius * rand * Math.cos(phi) * cosTheta;
        p.velocity.y = this.donutRadius * rand * Math.cos(phi) * sinTheta;

        p.position.add(p.velocity);

        p.velocity.normalize().multiplyScalar(p.startSpeed);

        //const angle = this.angle * r;
        //p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed);
        //const v = Math.random();

        //.multiplyScalar(this.radius);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'donut',
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            donutRadius: this.donutRadius,
            mode: this.mode,
            spread: this.spread,
            speed: this.speed.toJSON(),
        };
    }

    static fromJSON(json: any): DonutEmitter {
        return new DonutEmitter({
            radius: json.radius,
            arc: json.arc,
            thickness: json.thickness,
            donutRadius: json.donutRadius,
            mode: json.mode,
            speed: json.speed ? ValueGeneratorFromJSON(json.speed) : undefined,
            spread: json.spread,
        });
    }

    clone(): EmitterShape {
        return new DonutEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            donutRadius: this.donutRadius,
            mode: this.mode,
            speed: this.speed.clone(),
            spread: this.spread,
        });
    }
}
