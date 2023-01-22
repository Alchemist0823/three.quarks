import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator, ValueGeneratorFromJSON} from "../functions/ValueGenerator";

export class SizeOverLife implements Behavior {
    type = 'SizeOverLife';

    initialize(particle: Particle): void {
    }

    constructor(public size: FunctionValueGenerator) {
    }

    update(particle: Particle): void {
        particle.size = particle.startSize * this.size.genValue(particle.age / particle.life);
    }
    toJSON(): any {
        return {
            type: this.type,
            size: this.size.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new SizeOverLife(ValueGeneratorFromJSON(json.size) as FunctionValueGenerator);
    }

    frameUpdate(delta: number): void {
    }

    clone(): Behavior {
        return new SizeOverLife(this.size.clone());
    }
    reset(): void {
    }
}
