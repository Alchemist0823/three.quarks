import {Behavior} from "./Behavior";
import {Particle, TrailParticle} from "../Particle";
import {FunctionValueGenerator} from "../functions/ValueGenerator";

export class WidthOverLength implements Behavior {
    type = 'WidthOverLength';

    initialize(particle: Particle): void {
    }

    constructor(public width: FunctionValueGenerator) {
    }

    update(particle: Particle): void {
        if (particle instanceof TrailParticle) {
            for (let i = 0; i < particle.previous.length; i ++) {
                particle.previous[i].size = this.width.genValue((particle.previous.length - i) / particle.length);
            }
        }
    }

    toJSON(): any {
        return {
            type: this.type,
            width: this.width.toJSON(),
        };
    }

    clone(): Behavior {
        return new WidthOverLength(this.width.clone());
    }
}
