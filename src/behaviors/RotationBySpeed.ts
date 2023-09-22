import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions/ValueGenerator';
import {Quaternion} from 'three';
import {IntervalValue} from '../functions';

export class RotationBySpeed implements Behavior {
    type = 'RotationBySpeed';
    private tempQuat = new Quaternion();

    constructor(
        public angularVelocity: ValueGenerator | FunctionValueGenerator,
        public speedRange: IntervalValue
    ) {}

    initialize(particle: Particle): void {}

    update(particle: Particle, delta: number): void {
        const t = (particle.startSpeed - this.speedRange.a) / (this.speedRange.b - this.speedRange.a);
        (particle.rotation as number) += delta * (this.angularVelocity as FunctionValueGenerator).genValue(t);
    }

    toJSON(): any {
        return {
            type: this.type,
            angularVelocity: this.angularVelocity.toJSON(),
            speedRange: this.speedRange.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new RotationBySpeed(
            ValueGeneratorFromJSON(json.angularVelocity) as FunctionValueGenerator,
            IntervalValue.fromJSON(json.speedRange)
        );
    }

    frameUpdate(delta: number): void {}

    clone(): Behavior {
        return new RotationBySpeed(this.angularVelocity.clone(), this.speedRange.clone() as IntervalValue);
    }

    reset(): void {}
}
