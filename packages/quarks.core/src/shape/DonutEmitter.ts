import {EmitterMode, EmitterShape, getValueFromEmitterMode, ShapeJSON} from './EmitterUtil';
import {Particle} from '../Particle';
import {MathUtils, Matrix4, Quaternion} from '../math';
import {
    ConstantValue,
    FunctionValueGenerator,
    GeneratorMemory,
    ValueGenerator,
    ValueGeneratorFromJSON,
} from '../functions';
import {EmissionState, IParticleSystem} from '../IParticleSystem';
import { UP_VEC3, ZERO_VEC3 } from '../util/MathUtil';

/**
 * Interface representing the parameters for a donut emitter.
 */
export interface DonutEmitterParameters {
    /**
     * The radius of the donut.
     */
    radius?: number;
    /**
     * The arc of the donut.
     */
    arc?: number;
    /**
     * The thickness of the ring. 1 is a full donut, 0 is a ring with 0 radius.
     */
    thickness?: number;
    /**
     * The radius of the hole in the center of the donut.
     */
    donutRadius?: number;
    /**
     * The mode of the emitter.
     * {@link EmitterMode}
     */
    mode?: EmitterMode;
    /**
     * The length of the segment at which the emitter point converges at the start and end, when mode is EmitterMode.Loop or EmitterMode.PingPong.
     * {@link EmitterMode}
     */
    spread?: number;
    /**
     * The speed of the emitter start point when mode is EmitterMode.Loop or EmitterMode.PingPong.
     * {@link EmitterMode}
     */
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
    memory: GeneratorMemory;

    _m1: Matrix4;
    
    constructor(parameters: DonutEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
        this.donutRadius = parameters.donutRadius ?? this.radius * 0.2;
        this.mode = parameters.mode ?? EmitterMode.Random;
        this.spread = parameters.spread ?? 0;
        this.speed = parameters.speed ?? new ConstantValue(1);
        this.memory = [];
        this._m1 = new Matrix4();
    }

    private currentValue = 0;

    update(system: IParticleSystem, delta: number): void {
        if (EmitterMode.Random != this.mode) {
            this.currentValue += this.speed.genValue(this.memory, system.emissionState.time / system.duration) * delta;
        }
    }

    initialize(p: Particle, emissionState: EmissionState) {
        const u = getValueFromEmitterMode(this.mode, this.currentValue, this.spread, emissionState);
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
        if (p.rotation instanceof Quaternion) {
            this._m1.lookAt(ZERO_VEC3, p.velocity, UP_VEC3);
            p.rotation.setFromRotationMatrix(this._m1);
        }
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
