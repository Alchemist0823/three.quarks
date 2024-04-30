import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator, ValueGeneratorFromJSON} from "../functions/ValueGenerator";

export class SpeedOverLife implements Behavior {
    type = 'SpeedOverLife';

    initialize(particle: Particle): void {
    }

    constructor(public speed: FunctionValueGenerator) {
    }

    update(particle: Particle): void {
        (particle as any).speedModifier = this.speed.genValue(particle.age / particle.life);
    }
    toJSON(): any {
        return {
            type: this.type,
            speed: this.speed.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new SpeedOverLife(ValueGeneratorFromJSON(json.speed) as FunctionValueGenerator);
    }

    frameUpdate(delta: number): void {
    }


    clone(): Behavior {
        return new SpeedOverLife(this.speed.clone());
    }
    reset(): void {
    }
}
