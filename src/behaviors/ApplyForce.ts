import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from "../functions";
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

    frameUpdate(delta: number): void {
    }

    toJSON(): any {
        return {
            type: this.type,
            direction: [this.direction.x, this.direction.y, this.direction.z],
            force: this.force.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new ApplyForce(new Vector3(json.direction![0], json.direction![1],json.direction![2]), ValueGeneratorFromJSON(json.force) as ValueGenerator);
    }

    clone(): Behavior {
        return new ApplyForce(this.direction.clone(), this.force.clone());
    }
}
