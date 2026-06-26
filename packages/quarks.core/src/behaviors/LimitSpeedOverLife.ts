import {Particle} from '../Particle';
import {FunctionValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {Behavior} from './Behavior';

/**
 * Limits the speed of particles over their life.
 */
export class LimitSpeedOverLife implements Behavior {
    readonly type = 'LimitSpeedOverLife';

    constructor(
        public speed: FunctionValueGenerator,
        public dampen: number
    ) {}

    initialize(particle: Particle): void {
        this.speed.startGen(particle.memory);
    }

    update(particle: Particle, delta: number): void {
        const speed = particle.velocity.length();
        const limit = this.speed.genValue(particle.memory, particle.age / particle.life);

        if (speed > limit) {
            const percent = (speed - limit) / speed;
            particle.velocity.multiplyScalar(1 - percent * this.dampen * delta * 20);
        }
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            speed: this.speed.toJSON(),
            dampen: this.dampen,
        };
    }

    static fromJSON(json: any): Behavior {
        return new LimitSpeedOverLife(ValueGeneratorFromJSON(json.speed) as FunctionValueGenerator, json.dampen);
    }

    clone(): Behavior {
        return new LimitSpeedOverLife(this.speed.clone(), this.dampen);
    }

    reset(): void {}
}
