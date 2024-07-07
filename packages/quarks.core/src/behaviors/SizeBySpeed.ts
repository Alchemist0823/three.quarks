import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {
    FunctionValueGenerator, GeneratorFromJSON,
    IntervalValue,
    ValueGeneratorFromJSON,
    Vector3Function,
    Vector3Generator,
} from '../functions';

/**
 * Apply size to particles based on their speed.
 */
export class SizeBySpeed implements Behavior {
    type = 'SizeBySpeed';

    initialize(particle: Particle): void {
        this.size.startGen(particle.memory);
    }

    constructor(
        public size: FunctionValueGenerator | Vector3Generator,
        public speedRange: IntervalValue
    ) {}

    update(particle: Particle): void {
        const t = (particle.startSpeed - this.speedRange.a) / (this.speedRange.b - this.speedRange.a);
        if (this.size instanceof Vector3Function) {
            this.size.genValue(particle.memory, particle.size, t).multiply(particle.startSize);
        } else {
            particle.size.copy(particle.startSize).multiplyScalar((this.size as FunctionValueGenerator).genValue(particle.memory, t));
        }
    }

    toJSON(): any {
        return {
            type: this.type,
            size: this.size.toJSON(),
            speedRange: this.speedRange.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new SizeBySpeed(
            GeneratorFromJSON(json.size) as FunctionValueGenerator,
            IntervalValue.fromJSON(json.speedRange)
        );
    }

    frameUpdate(delta: number): void {}

    clone(): Behavior {
        return new SizeBySpeed(this.size.clone(), this.speedRange.clone() as IntervalValue);
    }

    reset(): void {}
}
