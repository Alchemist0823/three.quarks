import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {Vector3} from '../math';

/**
 * Apply a gravity force to particles.
 * the gravity force is calculated as:
 * F = G * m1 * m2 / r^2
 */
export class GravityForce implements Behavior {
    type = 'GravityForce';
    temp: Vector3 = new Vector3();

    constructor(
        public center: Vector3,
        public magnitude: number
    ) {}

    initialize(particle: Particle): void {}

    update(particle: Particle, delta: number): void {
        this.temp.copy(this.center).sub(particle.position).normalize();
        particle.velocity.addScaledVector(
            this.temp,
            (this.magnitude / particle.position.distanceToSquared(this.center)) * delta
        );
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            center: [this.center.x, this.center.y, this.center.z],
            magnitude: this.magnitude,
        };
    }

    static fromJSON(json: any): Behavior {
        return new GravityForce(new Vector3(json.center[0], json.center[1], json.center[2]), json.magnitude);
    }

    clone(): Behavior {
        return new GravityForce(this.center.clone(), this.magnitude);
    }
    reset(): void {}
}
