import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {Quaternion, Vector3} from 'three';
import {ParticleSystem} from '../ParticleSystem';
import {IParticleSystem} from '../BatchedRenderer';

/**
 * Apply a force to particles over their life.
 */
export class ForceOverLife implements Behavior {
    type = 'ForceOverLife';
    _temp = new Vector3();
    ps!: IParticleSystem;

    initialize(particle: Particle, particleSystem: ParticleSystem): void {
        this.ps = particleSystem;
    }

    constructor(
        public x: FunctionValueGenerator | ValueGenerator,
        public y: FunctionValueGenerator | ValueGenerator,
        public z: FunctionValueGenerator | ValueGenerator
    ) {}

    update(particle: Particle, delta: number): void {
        this._temp.set(
            this.x.genValue(particle.age / particle.life),
            this.y.genValue(particle.age / particle.life),
            this.z.genValue(particle.age / particle.life)
        );
        if (this.ps.worldSpace) {
            particle.velocity.addScaledVector(this._temp, delta);
        } else {
            this._temp.multiply(this._tempScale).applyQuaternion(this._tempQ);
            particle.velocity.addScaledVector(this._temp, delta);
        }
    }

    toJSON(): any {
        return {
            type: this.type,
            x: this.x.toJSON(),
            y: this.y.toJSON(),
            z: this.z.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new ForceOverLife(
            ValueGeneratorFromJSON(json.x) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.y) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.z) as FunctionValueGenerator
        );
    }

    _tempScale = new Vector3();
    _tempQ = new Quaternion();

    frameUpdate(delta: number): void {
        if (this.ps && !this.ps.worldSpace) {
            const translation = this._temp;
            const quaternion = this._tempQ;
            const scale = this._tempScale;
            this.ps.emitter.matrixWorld.decompose(translation, quaternion, scale);
            quaternion.invert();
            scale.set(1 / scale.x, 1 / scale.y, 1 / scale.z);
        }
    }

    clone(): Behavior {
        return new ForceOverLife(this.x.clone(), this.y.clone(), this.z.clone());
    }
    reset(): void {}
}
