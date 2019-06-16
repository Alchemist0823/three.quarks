import {Particle} from "./Particle";

export interface Behavior {
    update(particle: Particle): void;
}