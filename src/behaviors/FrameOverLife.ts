import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator, ValueGeneratorFromJSON} from "../functions";

export class FrameOverLife implements Behavior {

    type = 'FrameOverLife';
    constructor(public frame: FunctionValueGenerator) {
    }

    initialize(particle: Particle): void {
    }

    update(particle: Particle, delta: number): void {
        particle.uvTile = Math.floor(this.frame.genValue(particle.age / particle.life));
    }

    toJSON(): any {
        return {
            type: this.type,
            frame: this.frame.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new FrameOverLife(ValueGeneratorFromJSON(json.frame) as FunctionValueGenerator);
    }

    clone(): Behavior {
        return new FrameOverLife(this.frame.clone());
    }
}
