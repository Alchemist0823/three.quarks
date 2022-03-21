import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator} from "../functions";
import {Vector3} from "three";

export class ApplyForce implements Behavior {

    type = 'ApplyForce';

    constructor(public direction: Vector3, public func: FunctionValueGenerator) {
    }

    initialize(particle: Particle): void {
    }

    update(particle: Particle, delta: number): void {
        const force = this.func.genValue(particle.age / particle.life);
        particle.velocity.addScaledVector(this.direction, force);
    }

    toJSON(): any {
        return {
            type: this.type,
            direction: [this.direction.x, this.direction.y, this.direction.z],
            func: this.func.toJSON(),
        };
    }

    clone(): Behavior {
        return new ApplyForce(this.direction.clone(), this.func.clone());
    }
}
