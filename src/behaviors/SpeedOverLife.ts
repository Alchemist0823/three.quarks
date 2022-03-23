import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator} from "../functions/ValueGenerator";

export class SpeedOverLife implements Behavior {
    type = 'SpeedOverLife';

    initialize(particle: Particle): void {
    }

    constructor(public speed: FunctionValueGenerator) {
    }

    update(particle: Particle): void {
        particle.velocity.normalize().multiplyScalar(particle.startSpeed * this.speed.genValue(particle.age / particle.life));
    }
    toJSON(): any {
        return {
            type: this.type,
            speed: this.speed.toJSON(),
        };
    }

    clone(): Behavior {
        return new SpeedOverLife(this.speed.clone());
    }
}
