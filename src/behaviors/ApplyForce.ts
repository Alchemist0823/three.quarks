import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator, ValueGenerator} from "../functions";
import {Vector3} from "three";

export class ApplyForce implements Behavior {

    type = 'ApplyForce';

    constructor(public direction: Vector3, public force: ValueGenerator) {
    }

    initialize(particle: Particle): void {
        (particle as any).force = this.force.genValue();
    }

    update(particle: Particle, delta: number): void {
        particle.velocity.addScaledVector(this.direction, (particle as any).force * delta);
    }

    toJSON(): any {
        return {
            type: this.type,
            direction: [this.direction.x, this.direction.y, this.direction.z],
            force: this.force.toJSON(),
        };
    }

    clone(): Behavior {
        return new ApplyForce(this.direction.clone(), this.force.clone());
    }
}
