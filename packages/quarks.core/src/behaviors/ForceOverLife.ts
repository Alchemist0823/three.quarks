import {IParticleSystem} from '../IParticleSystem';
import {Particle} from '../Particle';
import {AnyValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {Quaternion, Vector3} from '../math';
import {Behavior} from './Behavior';

/**
 * Apply a force to particles over their life.
 */
export class ForceOverLife implements Behavior {
    readonly type = 'ForceOverLife';

    private readonly _tmpV = new Vector3();
    private readonly _tmpV2 = new Vector3();
    private readonly _tmpQ = new Quaternion();

    ps!: IParticleSystem;

    initialize(particle: Particle, particleSystem: IParticleSystem): void {
        this.ps = particleSystem;

        this.x.startGen(particle.memory);
        this.y.startGen(particle.memory);
        this.z.startGen(particle.memory);
    }

    constructor(
        public x: AnyValueGenerator,
        public y: AnyValueGenerator,
        public z: AnyValueGenerator
    ) {}

    update(particle: Particle, delta: number): void {
        const normalizedAge = particle.age / particle.life;

        this._tmpV.set(
            this.x.genValue(particle.memory, normalizedAge),
            this.y.genValue(particle.memory, normalizedAge),
            this.z.genValue(particle.memory, normalizedAge)
        );

        if (!this.ps.worldSpace) {
            this._tmpV.multiply(this._tmpV2).applyQuaternion(this._tmpQ);
        }

        particle.velocity.addScaledVector(this._tmpV, delta);
    }

    frameUpdate(delta: number): void {
        if (!this.ps || this.ps.worldSpace) return;

        const translation = this._tmpV;
        const quaternion = this._tmpQ;
        const scale = this._tmpV2;

        this.ps.emitter.matrixWorld.decompose(translation, quaternion, scale);
        quaternion.invert();
        scale.set(1 / scale.x, 1 / scale.y, 1 / scale.z);
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
            ValueGeneratorFromJSON(json.x),
            ValueGeneratorFromJSON(json.y),
            ValueGeneratorFromJSON(json.z)
        );
    }

    clone(): Behavior {
        return new ForceOverLife(this.x.clone(), this.y.clone(), this.z.clone());
    }

    reset(): void {}
}
