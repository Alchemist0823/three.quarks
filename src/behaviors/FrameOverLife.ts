import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator} from "../functions";

export class FrameOverLife implements Behavior {

    constructor(public func: FunctionValueGenerator) {
    }

    initialize(particle: Particle): void {
    }

    update(particle: Particle, delta: number): void {
        particle.uvTile = Math.floor(this.func.genValue(particle.age / particle.life));
    }

    toJSON(): any {
        return {
            type: 'FrameOverLife',
            func: this.func.toJSON(),
        };
    }
}