import THREE from "three";
import {Particle} from "./Particle";


export interface EmitterShape {

    initialize(particle: Particle): void;
}