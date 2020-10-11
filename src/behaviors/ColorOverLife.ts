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
        this.func.genColor(particle.color, particle.age / particle.life)
        particle.color.x *= particle.startColor.x;
        particle.color.y *= particle.startColor.y;
        particle.color.z *= particle.startColor.z;
        particle.color.w *= particle.startColor.w;
    }

    toJSON(): any {
        return {
            type: this.type,
            func: this.func.toJSON(),
        };
    }

    clone(): Behavior {
        return new ColorOverLife(this.func.clone());
    }
}