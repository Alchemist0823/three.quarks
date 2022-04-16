import {Behavior} from "./Behavior";
import {Particle, TrailParticle} from "../Particle";
import {FunctionValueGenerator, ValueGeneratorFromJSON} from "../functions/ValueGenerator";
import {Vector3} from "three";

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

    frameUpdate(delta: number): void {
    }

    toJSON(): any {
        return {
            type: this.type,
            width: this.width.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new WidthOverLength(ValueGeneratorFromJSON(json.width) as FunctionValueGenerator);
    }

    clone(): Behavior {
        return new WidthOverLength(this.width.clone());
    }

}
