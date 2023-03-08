import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {Vector3} from "three";

interface PhysicsResolver {
    resolve(pos: Vector3, normal: Vector3): boolean;
}

let physicsResolver: PhysicsResolver;
export function setPhysicsResolver(resolver: PhysicsResolver) {
    physicsResolver = resolver;
}
export function getPhysicsResolver(): PhysicsResolver {
    return physicsResolver;
}

export class ApplyCollision implements Behavior {

    type = 'ApplyCollision';
    tempV = new Vector3();

    constructor(public resolver: PhysicsResolver, public bounce: number) {
    }

    initialize(particle: Particle): void {
    }

    update(particle: Particle, delta: number): void {
        if (this.resolver.resolve(particle.position, this.tempV)) {
            particle.velocity.reflect(this.tempV).multiplyScalar(this.bounce);
        }
    }

    frameUpdate(delta: number): void {
    }

    toJSON(): any {
        return {
            type: this.type,
            bounce: this.bounce,
        };
    }

    static fromJSON(json: any): Behavior {
        return new ApplyCollision(getPhysicsResolver(), json.bounce);
    }

    clone(): Behavior {
        return new ApplyCollision(this.resolver, this.bounce);
    }

    reset(): void {
    }
}
