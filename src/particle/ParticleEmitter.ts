import THREE from "three";
import {Particle} from "./Particle";


export interface ParticleEmitter {

    initialize(particle: Particle): void;
}