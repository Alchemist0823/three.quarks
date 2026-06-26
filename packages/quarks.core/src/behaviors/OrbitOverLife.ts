import {Particle} from '../Particle';
import {AnyValueGenerator, FunctionValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {Quaternion, Vector3} from '../math';
import {Behavior} from './Behavior';

/**
 * Orbit particles around an axis over their life.
 */
export class OrbitOverLife implements Behavior {
    readonly type = 'OrbitOverLife';

    private readonly _tmpV = new Vector3();
    private readonly _tmpQ = new Quaternion();

    constructor(
        public orbitSpeed: AnyValueGenerator,
        public axis: Vector3 = new Vector3(0, 1, 0)
    ) {}

    initialize(particle: Particle): void {
        this.orbitSpeed.startGen(particle.memory);
    }

    update(particle: Particle, delta: number): void {
        this._tmpV.copy(particle.position).projectOnVector(this.axis);

        this._tmpQ.setFromAxisAngle(
            this.axis,
            this.orbitSpeed.genValue(particle.memory, particle.age / particle.life) * delta
        );

        particle.position.sub(this._tmpV);
        particle.position.applyQuaternion(this._tmpQ);
        particle.position.add(this._tmpV);
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            orbitSpeed: this.orbitSpeed.toJSON(),
            axis: [this.axis.x, this.axis.y, this.axis.z],
        };
    }

    static fromJSON(json: any): Behavior {
        return new OrbitOverLife(
            ValueGeneratorFromJSON(json.orbitSpeed),
            json.axis ? new Vector3(json.axis[0], json.axis[1], json.axis[2]) : undefined
        );
    }

    clone(): Behavior {
        return new OrbitOverLife(this.orbitSpeed.clone());
    }

    reset(): void {}
}
