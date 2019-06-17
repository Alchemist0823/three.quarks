import {Behavior} from "../Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator} from "../functions/ValueGenerator";

export class SizeOverLife implements Behavior {
    initialize(particle: Particle): void {
    }

    constructor(public func: FunctionValueGenerator) {
    }

    update(particle: Particle): void {
        particle.size = particle.startSize * this.func.genValue(particle.age / particle.life);
    }
}