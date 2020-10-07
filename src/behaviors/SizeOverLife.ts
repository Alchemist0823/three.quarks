import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator} from "../functions/ValueGenerator";

export class SizeOverLife implements Behavior {
    type = 'SizeOverLife';

    initialize(particle: Particle): void {
    }

    constructor(public func: FunctionValueGenerator) {
    }

    update(particle: Particle): void {
        particle.size = particle.startSize * this.func.genValue(particle.age / particle.life);
    }
    toJSON(): any {
        return {
            type: this.type,
            func: this.func.toJSON(),
        };
    }

    clone(): Behavior {
        return new SizeOverLife(this.func.clone());
    }
}