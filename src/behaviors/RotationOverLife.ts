import {Behavior} from './Behavior';
import {Particle, SpriteParticle} from '../Particle';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions/ValueGenerator';
import {Quaternion} from 'three';
import {ConstantValue, IntervalValue} from '../functions';

export class RotationOverLife implements Behavior {
    type = 'RotationOverLife';
    private dynamic: boolean;

    constructor(public angularVelocity: ValueGenerator | FunctionValueGenerator) {
        this.dynamic = !(angularVelocity instanceof ConstantValue || angularVelocity instanceof IntervalValue);
    }

    initialize(particle: Particle): void {
        this.dynamic = !(
            this.angularVelocity instanceof ConstantValue || this.angularVelocity instanceof IntervalValue
        );
        if (!this.dynamic && typeof particle.rotation === 'number') {
            (particle as any).angularVelocity = (this.angularVelocity as ValueGenerator).genValue();
        }
    }

    update(particle: Particle, delta: number): void {
        if (!this.dynamic) {
            if (typeof particle.rotation === 'number') {
                (particle.rotation as number) += delta * ((particle as any).angularVelocity as number);
            }
        } else {
            if (typeof particle.rotation === 'number') {
                (particle.rotation as number) +=
                    delta * (this.angularVelocity as FunctionValueGenerator).genValue(particle.age / particle.life);
            }
        }
    }

    toJSON(): any {
        return {
            type: this.type,
            angularVelocity: this.angularVelocity.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new RotationOverLife(ValueGeneratorFromJSON(json.angularVelocity) as FunctionValueGenerator);
    }

    frameUpdate(delta: number): void {}

    clone(): Behavior {
        return new RotationOverLife(this.angularVelocity.clone());
    }
    reset(): void {}
}
