import {Particle} from "./Particle";

export interface Behavior {
    initialize(particle: Particle): void;
    update(particle: Particle, delta: number): void;

    toJSON(): any;
}