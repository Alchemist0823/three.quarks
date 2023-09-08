import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {FunctionValueGenerator, IntervalValue, ValueGeneratorFromJSON} from '../functions';

export class SizeBySpeed implements Behavior {
    type = 'SizeBySpeed';

    initialize(particle: Particle): void {}

    constructor(
        public size: FunctionValueGenerator,
        public speedRange: IntervalValue
    ) {}

    update(particle: Particle): void {
        const t = (particle.startSpeed - this.speedRange.a) / (this.speedRange.b - this.speedRange.a);
        particle.size = particle.startSize * this.size.genValue(t);
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
            ValueGeneratorFromJSON(json.size) as FunctionValueGenerator,
            IntervalValue.fromJSON(json.speedRange)
        );
    }

    frameUpdate(delta: number): void {}

    clone(): Behavior {
        return new SizeBySpeed(this.size.clone(), this.speedRange.clone() as IntervalValue);
    }

    reset(): void {}
}
