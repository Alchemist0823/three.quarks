import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {GeneratorMemory, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {Quaternion, Vector3} from '../math';

/**
 * Change the emit direction of particles.
 */
export class ChangeEmitDirection implements Behavior {
    readonly type = 'ChangeEmitDirection';

    private readonly _tmpV: Vector3 = new Vector3();
    private readonly _tmpQ: Quaternion = new Quaternion();

    memory: GeneratorMemory = [];

    constructor(public angle: ValueGenerator) {}

    initialize(particle: Particle): void {
        const len = particle.velocity.length();
        if (len === 0) return;

        particle.velocity.normalize();

        if (particle.velocity.x === 0 && particle.velocity.y === 0) {
            this._tmpV.set(0, particle.velocity.z, 0);
        } else {
            this._tmpV.set(-particle.velocity.y, particle.velocity.x, 0);
        }

        this.angle.startGen(this.memory);

        this._tmpQ.setFromAxisAngle(this._tmpV.normalize(), this.angle.genValue(this.memory));
        this._tmpV.copy(particle.velocity);
        particle.velocity.applyQuaternion(this._tmpQ);

        this._tmpQ.setFromAxisAngle(this._tmpV, Math.random() * Math.PI * 2);
        particle.velocity.applyQuaternion(this._tmpQ);
        particle.velocity.setLength(len);
    }

    update(particle: Particle, delta: number): void {}

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            angle: this.angle.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new ChangeEmitDirection(ValueGeneratorFromJSON(json.angle) as ValueGenerator);
    }

    clone(): Behavior {
        return new ChangeEmitDirection(this.angle);
    }

    reset(): void {}
}
