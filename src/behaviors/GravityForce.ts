import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {Vector3} from "three";

export class GravityForce implements Behavior {

    type = 'GravityForce';
    temp: Vector3 = new Vector3();

    constructor(public center: Vector3, public magnitude: number) {
    }

    initialize(particle: Particle): void {
    }

    update(particle: Particle, delta: number): void {
        this.temp.copy(this.center).sub(particle.position).normalize();
        particle.velocity.addScaledVector(this.temp, this.magnitude / particle.position.distanceToSquared(this.center) * delta);
    }

    toJSON(): any {
        return {
            type: this.type,
            center: [this.center.x, this.center.y, this.center.z],
            magnitude: this.magnitude,
        };
    }

    clone(): Behavior {
        return new GravityForce(this.center.clone(), this.magnitude);
    }
}
