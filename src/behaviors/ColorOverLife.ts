import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionColorGenerator} from "../functions/ColorGenerator";

export class ColorOverLife implements Behavior {

    type = 'ColorOverLife';

    constructor(public func: FunctionColorGenerator) {
    }

    initialize(particle: Particle): void {
    }

    update(particle: Particle, delta: number): void {
        this.func.genColor(particle.color, particle.age / particle.life).dot(particle.startColor);
    }

    toJSON(): any {
        return {
            type: this.type,
            func: this.func.toJSON(),
        };
    }
}