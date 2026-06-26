import {Particle, SpriteParticle} from '../Particle';
import {RotationGenerator, RotationGeneratorFromJSON} from '../functions';
import {Quaternion} from '../math';
import {Behavior} from './Behavior';

/**
 * Apply rotation to particles over their life.
 */
export class Rotation3DOverLife implements Behavior {
    readonly type = 'Rotation3DOverLife';

    private readonly _tmpQ = new Quaternion();

    constructor(public angularVelocity: RotationGenerator) {}

    initialize(particle: Particle): void {
        if (particle.rotation instanceof Quaternion) {
            (particle as SpriteParticle).angularVelocity = new Quaternion();
            this.angularVelocity.startGen(particle.memory);
        }
    }

    update(particle: Particle, delta: number): void {
        if (particle.rotation instanceof Quaternion) {
            this.angularVelocity.genValue(particle.memory, this._tmpQ, delta, particle.age / particle.life);
            particle.rotation.multiply(this._tmpQ);
        }
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            angularVelocity: this.angularVelocity.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new Rotation3DOverLife(RotationGeneratorFromJSON(json.angularVelocity));
    }

    clone(): Behavior {
        return new Rotation3DOverLife(this.angularVelocity.clone());
    }

    reset(): void {}
}
