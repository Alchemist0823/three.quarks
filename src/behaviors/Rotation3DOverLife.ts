import {Behavior} from './Behavior';
import {Particle, SpriteParticle} from '../Particle';
import {Quaternion} from 'three';
import {RotationGenerator, RotationGeneratorFromJSON} from '../functions/RotationGenerator';
import {ConstantValue, IntervalValue, RandomQuatGenerator} from '../functions';

const IdentityQuaternion = new Quaternion();

export class Rotation3DOverLife implements Behavior {
    type = 'Rotation3DOverLife';
    private tempQuat = new Quaternion();
    private dynamic: boolean;

    constructor(public angularVelocity: RotationGenerator) {
        this.dynamic = !(angularVelocity instanceof RandomQuatGenerator);
    }

    initialize(particle: Particle): void {
        this.dynamic = !(this.angularVelocity instanceof RandomQuatGenerator);
        if (particle.rotation instanceof Quaternion) {
            (particle as SpriteParticle).angularVelocity = new Quaternion();
            (this.angularVelocity as RotationGenerator).genValue(
                (particle as SpriteParticle).angularVelocity as Quaternion
            );
        }
    }

    update(particle: Particle, delta: number): void {
        if (particle.rotation instanceof Quaternion) {
            if (!this.dynamic) {
                this.tempQuat.slerpQuaternions(
                    IdentityQuaternion,
                    (particle as SpriteParticle).angularVelocity as Quaternion,
                    delta
                );
                (particle.rotation as Quaternion).multiply(this.tempQuat);
            } else {
                (this.angularVelocity as RotationGenerator).genValue(this.tempQuat, particle.age / particle.life);
                this.tempQuat.slerpQuaternions(IdentityQuaternion, this.tempQuat, delta);
                ((particle as SpriteParticle).rotation as Quaternion).multiply(this.tempQuat);
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
        return new Rotation3DOverLife(RotationGeneratorFromJSON(json.angularVelocity));
    }

    frameUpdate(delta: number): void {}

    clone(): Behavior {
        return new Rotation3DOverLife(this.angularVelocity.clone());
    }

    reset(): void {}
}
