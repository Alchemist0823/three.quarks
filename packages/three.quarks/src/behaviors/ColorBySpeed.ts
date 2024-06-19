import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {ColorGeneratorFromJSON, FunctionColorGenerator, IntervalValue} from '../functions';

/**
 * Color particles by their speed.
 */
export class ColorBySpeed implements Behavior {
    type = 'ColorBySpeed';
    constructor(
        public color: FunctionColorGenerator,
        public speedRange: IntervalValue
    ) {}

    initialize(particle: Particle): void {
        this.color.startGen(particle.memory);
    }

    update(particle: Particle, delta: number): void {
        const t = (particle.startSpeed - this.speedRange.a) / (this.speedRange.b - this.speedRange.a);
        (this.color as FunctionColorGenerator).genColor(particle.memory, particle.color, t);
        particle.color.x *= particle.startColor.x;
        particle.color.y *= particle.startColor.y;
        particle.color.z *= particle.startColor.z;
        particle.color.w *= particle.startColor.w;
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            color: this.color.toJSON(),
            speedRange: this.speedRange.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new ColorBySpeed(
            ColorGeneratorFromJSON(json.color) as FunctionColorGenerator,
            IntervalValue.fromJSON(json.speedRange)
        );
    }

    clone(): Behavior {
        return new ColorBySpeed(this.color.clone(), this.speedRange.clone() as IntervalValue);
    }
    reset(): void {}
}
