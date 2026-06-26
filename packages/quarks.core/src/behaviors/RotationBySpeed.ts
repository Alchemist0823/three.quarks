import {Particle} from '../Particle';
import {IntervalValue} from '../functions';
import {AnyValueGenerator, ValueGeneratorFromJSON} from '../functions/ValueGenerator';
import {Behavior} from './Behavior';

/**
 * Apply rotation to particles based on their speed.
 */
export class RotationBySpeed implements Behavior {
    readonly type = 'RotationBySpeed';

    constructor(
        public angularVelocity: AnyValueGenerator,
        public speedRange: IntervalValue
    ) {}

    initialize(particle: Particle): void {
        if (typeof particle.rotation === 'number') {
            this.angularVelocity.startGen(particle.memory);
        }
    }

    update(particle: Particle, delta: number): void {
        if (typeof particle.rotation === 'number') {
            const t = (particle.startSpeed - this.speedRange.a) / (this.speedRange.b - this.speedRange.a);
            particle.rotation += delta * this.angularVelocity.genValue(particle.memory, t);
        }
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            angularVelocity: this.angularVelocity.toJSON(),
            speedRange: this.speedRange.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new RotationBySpeed(
            ValueGeneratorFromJSON(json.angularVelocity),
            IntervalValue.fromJSON(json.speedRange)
        );
    }

    clone(): Behavior {
        return new RotationBySpeed(this.angularVelocity.clone(), this.speedRange.clone() as IntervalValue);
    }

    reset(): void {}
}
