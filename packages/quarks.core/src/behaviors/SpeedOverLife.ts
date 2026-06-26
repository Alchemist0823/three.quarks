import {Particle} from '../Particle';
import {FunctionValueGenerator, ValueGeneratorFromJSON} from '../functions/ValueGenerator';
import {Behavior} from './Behavior';

/**
 * Apply speed to particles based on their life.
 */
export class SpeedOverLife implements Behavior {
    readonly type = 'SpeedOverLife';

    constructor(public speed: FunctionValueGenerator) {}

    initialize(particle: Particle): void {
        this.speed.startGen(particle.memory);
    }

    update(particle: Particle): void {
        particle.speedModifier = this.speed.genValue(particle.memory, particle.age / particle.life);
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            speed: this.speed.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new SpeedOverLife(ValueGeneratorFromJSON(json.speed) as FunctionValueGenerator);
    }

    clone(): Behavior {
        return new SpeedOverLife(this.speed.clone());
    }

    reset(): void {}
}
