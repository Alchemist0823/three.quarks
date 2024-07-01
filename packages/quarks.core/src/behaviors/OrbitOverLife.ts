import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {Quaternion, Vector3} from '../math';

const V3_Z = new Vector3(0, 0, 1);

/**
 * Orbit particles around an axis over their life.
 */
export class OrbitOverLife implements Behavior {
    type = 'OrbitOverLife';
    rotation: Quaternion;
    temp = new Vector3();

    constructor(
        public orbitSpeed: FunctionValueGenerator | ValueGenerator,
        public axis: Vector3 = new Vector3(0, 1, 0)
    ) {
        this.rotation = new Quaternion();
    }

    initialize(particle: Particle): void {
        this.orbitSpeed.startGen((particle as any).memory);
    }

    update(particle: Particle, delta: number): void {
        this.temp.copy(particle.position).projectOnVector(this.axis);
        this.rotation.setFromAxisAngle(
            this.axis,
            this.orbitSpeed.genValue((particle as any).memory, particle.age / particle.life) * delta
        );
        particle.position.sub(this.temp);
        particle.position.applyQuaternion(this.rotation);
        particle.position.add(this.temp);
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
            ValueGeneratorFromJSON(json.orbitSpeed) as FunctionValueGenerator,
            json.axis ? new Vector3(json.axis[0], json.axis[1], json.axis[2]) : undefined
        );
    }

    clone(): Behavior {
        return new OrbitOverLife(this.orbitSpeed.clone());
    }
    reset(): void {}
}
