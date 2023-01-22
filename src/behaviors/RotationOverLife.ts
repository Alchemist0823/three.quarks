import {Behavior} from "./Behavior";
import {Particle, SpriteParticle} from "../Particle";
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from "../functions/ValueGenerator";
import {Quaternion, Vector3} from "three";

export class RotationOverLife implements Behavior {

    type = 'RotationOverLife';
    private tempQuat = new Quaternion();

    constructor(public angularVelocity: ValueGenerator | FunctionValueGenerator, public dynamic: boolean) {
    }

    initialize(particle: Particle): void {
        if (!this.dynamic && particle instanceof SpriteParticle) {
            particle.angularVelocity = (this.angularVelocity as ValueGenerator).genValue();
        }
    }

    update(particle: Particle, delta: number): void {
        if (!this.dynamic) {
            if (particle instanceof SpriteParticle) {
                (particle.rotation as number) += delta * (particle.angularVelocity as number);
            }
        } else {
            (particle.rotation as number) += delta * (this.angularVelocity as FunctionValueGenerator).genValue(particle.age / particle.life);
        }
    }

    toJSON(): any {
        return {
            type: this.type,
            angularVelocity: this.angularVelocity.toJSON(),
            dynamic: this.dynamic,
        };
    }

    static fromJSON(json: any): Behavior {
        return new RotationOverLife(ValueGeneratorFromJSON(json.angularVelocity) as FunctionValueGenerator, json.dynamic);
    }

    frameUpdate(delta: number): void {
    }


    clone(): Behavior {
        return new RotationOverLife(this.angularVelocity.clone(), this.dynamic);
    }
    reset(): void {
    }
}
