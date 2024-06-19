import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {Vector3} from 'three';

/**
 * Apply a global force to particles.
 */
export class ApplyForce implements Behavior {
    type = 'ApplyForce';
    magnitudeValue: number;
    memory = {
        data: [],
        dataCount: 0,
    };

    constructor(
        public direction: Vector3,
        public magnitude: ValueGenerator
    ) {
        this.magnitudeValue = this.magnitude.genValue(this.memory);
    }

    initialize(particle: Particle): void {}

    update(particle: Particle, delta: number): void {
        particle.velocity.addScaledVector(this.direction, this.magnitudeValue * delta);
    }

    frameUpdate(delta: number): void {
        this.magnitudeValue = this.magnitude.genValue(this.memory);
    }

    toJSON(): any {
        return {
            type: this.type,
            direction: [this.direction.x, this.direction.y, this.direction.z],
            magnitude: this.magnitude.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new ApplyForce(
            new Vector3(json.direction[0], json.direction[1], json.direction[2]),
            ValueGeneratorFromJSON(json.magnitude ?? json.force) as ValueGenerator
        );
    }

    clone(): Behavior {
        return new ApplyForce(this.direction.clone(), this.magnitude.clone());
    }

    reset(): void {}
}
