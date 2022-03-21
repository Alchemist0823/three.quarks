import {Behavior} from "./Behavior";
import {Particle, SpriteParticle} from "../Particle";
import {FunctionValueGenerator, ValueGenerator} from "../functions/ValueGenerator";

export class RotationOverLife implements Behavior {

    type = 'RotationOverLife';

    constructor(public angularVelocityFunc: FunctionValueGenerator | ValueGenerator) {
    }

    initialize(particle: Particle): void {
        if (particle instanceof SpriteParticle) {
            if (this.angularVelocityFunc.type === 'value') {
                particle.angularVelocity = this.angularVelocityFunc.genValue();
            } else {
                particle.angularVelocity = 0;
            }
        }
    }

    update(particle: Particle, delta: number): void {
        if (particle instanceof SpriteParticle) {
            if (this.angularVelocityFunc.type === 'value') {
                particle.rotation += delta * particle.angularVelocity!;
            } else {
                particle.rotation += delta * this.angularVelocityFunc.genValue(particle.age / particle.life);
            }
        }
    }
    toJSON(): any {
        return {
            type: this.type,
            func: this.angularVelocityFunc.toJSON(),
        };
    }

    clone(): Behavior {
        return new RotationOverLife(this.angularVelocityFunc);
    }
}
