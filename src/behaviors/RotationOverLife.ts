import {Behavior} from './Behavior';
import {Particle, SpriteParticle} from '../Particle';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions/ValueGenerator';
import {Quaternion} from 'three';
import {ConstantValue, IntervalValue} from '../functions';

/**
 * Apply rotation to particles over their life.
 */
export class RotationOverLife implements Behavior {
    type = 'RotationOverLife';

    constructor(public angularVelocity: ValueGenerator | FunctionValueGenerator) {}

    initialize(particle: Particle): void {
        if (typeof particle.rotation === 'number') {
            (this.angularVelocity as ValueGenerator).startGen(particle.memory);
        }
    }

    update(particle: Particle, delta: number): void {
        if (typeof particle.rotation === 'number') {
            (particle.rotation as number) +=
                delta *
                (this.angularVelocity as FunctionValueGenerator).genValue(
                    particle.memory,
                    particle.age / particle.life
                );
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
