import {Behavior} from "./Behavior";
import {Particle, SpriteParticle} from "../Particle";
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from "../functions/ValueGenerator";
import {Quaternion, Vector3} from "three";
import {RotationGenerator, RotationGeneratorFromJSON} from "../functions/RotationGenerator";

const IdentityQuaternion = new Quaternion();

export class Rotation3DOverLife implements Behavior {

    type = 'Rotation3DOverLife';
    private tempQuat = new Quaternion();

    constructor(public angularVelocity: RotationGenerator, public dynamic: boolean) {
    }

    initialize(particle: Particle): void {
        if (!this.dynamic && particle instanceof SpriteParticle) {
            particle.angularVelocity = new Quaternion();
            (this.angularVelocity as RotationGenerator).genValue(particle.angularVelocity);
        }
    }

    update(particle: Particle, delta: number): void {
        if (!this.dynamic) {
            if (particle instanceof SpriteParticle) {
                this.tempQuat.slerpQuaternions(IdentityQuaternion, particle.angularVelocity as Quaternion, delta);
                (particle.rotation as Quaternion).multiply(this.tempQuat);
            }
        } else {
            (this.angularVelocity as RotationGenerator).genValue(this.tempQuat, particle.age / particle.life);
            this.tempQuat.slerpQuaternions(IdentityQuaternion, this.tempQuat, delta);
            (particle.rotation as Quaternion).multiply(this.tempQuat);
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
        return new Rotation3DOverLife(RotationGeneratorFromJSON(json.angularVelocity), json.dynamic);
    }

    frameUpdate(delta: number): void {
    }


    clone(): Behavior {
        return new Rotation3DOverLife(this.angularVelocity.clone(), this.dynamic);
    }
}
