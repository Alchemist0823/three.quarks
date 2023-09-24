import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {FunctionValueGenerator, ValueGeneratorFromJSON} from '../functions/ValueGenerator';

export class LimitSpeedOverLife implements Behavior {
    type = 'LimitSpeedOverLife';

    initialize(particle: Particle): void {}

    constructor(
        public speed: FunctionValueGenerator,
        public dampen: number
    ) {}

    update(particle: Particle, delta: number): void {
        let speed = particle.velocity.length();
        if (speed > this.speed.genValue(particle.age / particle.life)) {
            particle.velocity.multiplyScalar(1 - this.dampen * delta);
        }
    }
    toJSON(): any {
        return {
            type: this.type,
            speed: this.speed.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new LimitSpeedOverLife(ValueGeneratorFromJSON(json.speed) as FunctionValueGenerator, json.dampen);
    }

    frameUpdate(delta: number): void {}

    clone(): Behavior {
        return new LimitSpeedOverLife(this.speed.clone(), this.dampen);
    }
    reset(): void {}
}
