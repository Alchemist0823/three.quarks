import {Particle} from '../Particle';
import {AnyValueGenerator, ValueGeneratorFromJSON} from '../functions/ValueGenerator';
import {Behavior} from './Behavior';

/**
 * Apply rotation to particles over their life.
 */
export class RotationOverLife implements Behavior {
    readonly type = 'RotationOverLife';

    constructor(public angularVelocity: AnyValueGenerator) {}

    initialize(particle: Particle): void {
        if (typeof particle.rotation === 'number') {
            this.angularVelocity.startGen(particle.memory);
        }
    }

    update(particle: Particle, delta: number): void {
        if (typeof particle.rotation === 'number') {
            particle.rotation += delta * this.angularVelocity.genValue(particle.memory, particle.age / particle.life);
        }
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            angularVelocity: this.angularVelocity.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new RotationOverLife(ValueGeneratorFromJSON(json.angularVelocity));
    }

    clone(): Behavior {
        return new RotationOverLife(this.angularVelocity.clone());
    }

    reset(): void {}
}
