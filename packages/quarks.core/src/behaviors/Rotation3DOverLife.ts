import {Behavior} from './Behavior';
import {Particle, SpriteParticle} from '../Particle';
import {Quaternion} from '../math';
import {RotationGenerator, RotationGeneratorFromJSON} from '../functions';

const IdentityQuaternion = new Quaternion();

/**
 * Apply rotation to particles over their life.
 */
export class Rotation3DOverLife implements Behavior {
    type = 'Rotation3DOverLife';
    private tempQuat = new Quaternion();
    private tempQuat2 = new Quaternion();

    constructor(public angularVelocity: RotationGenerator) {}

    initialize(particle: Particle): void {
        if (particle.rotation instanceof Quaternion) {
            (particle as SpriteParticle).angularVelocity = new Quaternion();
            (this.angularVelocity as RotationGenerator).startGen(particle.memory);
        }
    }

    update(particle: Particle, delta: number): void {
        if (particle.rotation instanceof Quaternion) {
            (this.angularVelocity as RotationGenerator).genValue(
                particle.memory,
                this.tempQuat,
                delta,
                particle.age / particle.life
            );
            ((particle as SpriteParticle).rotation as Quaternion).multiply(this.tempQuat);
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
