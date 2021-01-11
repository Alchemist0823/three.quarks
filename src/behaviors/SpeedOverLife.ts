import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator} from "../functions/ValueGenerator";

export class SpeedOverLife implements Behavior {
    type = 'SpeedOverLife';

    initialize(particle: Particle): void {
    }

    constructor(public func: FunctionValueGenerator) {
    }

    update(particle: Particle): void {
        particle.velocity.normalize().multiplyScalar(particle.startSpeed * this.func.genValue(particle.age / particle.life));
    }
    toJSON(): any {
        return {
            type: this.type,
            func: this.func.toJSON(),
        };
    }

    clone(): Behavior {
        return new SpeedOverLife(this.func.clone());
    }
}