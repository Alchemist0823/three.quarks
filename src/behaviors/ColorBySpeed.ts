import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {
    ColorGeneratorFromJSON,
    FunctionColorGenerator,
    IntervalValue,
    MemorizedFunctionColorGenerator,
} from '../functions';

/**
 * Color particles by their speed.
 */
export class ColorBySpeed implements Behavior {
    type = 'ColorBySpeed';
    constructor(
        public color: FunctionColorGenerator | MemorizedFunctionColorGenerator,
        public speedRange: IntervalValue
    ) {}

    initialize(particle: Particle): void {
        if (this.color.type === 'memorizedFunction') {
            (particle as any).colorOverLifeMemory = {};
            (this.color as MemorizedFunctionColorGenerator).startGen((particle as any).colorOverLifeMemory);
        }
    }

    update(particle: Particle, delta: number): void {
        const t = (particle.startSpeed - this.speedRange.a) / (this.speedRange.b - this.speedRange.a);
        if (this.color.type === 'memorizedFunction') {
            (this.color as MemorizedFunctionColorGenerator).genColor(
                particle.color,
                t,
                (particle as any).colorOverLifeMemory
            );
        } else {
            (this.color as FunctionColorGenerator).genColor(particle.color, t);
        }
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
