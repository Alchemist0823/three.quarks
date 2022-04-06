import {Behavior} from "./Behavior";
import {Particle, SpriteParticle} from "../Particle";
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from "../functions/ValueGenerator";

export class RotationOverLife implements Behavior {

    type = 'RotationOverLife';

    constructor(public angularVelocity: FunctionValueGenerator | ValueGenerator) {
    }

    initialize(particle: Particle): void {
        if (particle instanceof SpriteParticle) {
            if (this.angularVelocity.type === 'value') {
                particle.angularVelocity = this.angularVelocity.genValue();
            } else {
                particle.angularVelocity = 0;
            }
        }
    }

    update(particle: Particle, delta: number): void {
        if (particle instanceof SpriteParticle) {
            if (this.angularVelocity.type === 'value') {
                particle.rotation += delta * particle.angularVelocity!;
            } else {
                particle.rotation += delta * this.angularVelocity.genValue(particle.age / particle.life);
            }
        }
    }
    toJSON(): any {
        return {
            type: this.type,
            angularVelocity: this.angularVelocity.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new RotationOverLife(ValueGeneratorFromJSON(json.angularVelocity) as FunctionValueGenerator);
    }

    clone(): Behavior {
        return new RotationOverLife(this.angularVelocity);
    }
}
