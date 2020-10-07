import {Particle} from "./Particle";

export interface ShapeJSON {
    type: string;
    radius?: number;
    arc?: number;
    thickness?: number;
    angle?: number;
}

export interface EmitterShape {

    initialize(particle: Particle): void;
    toJSON(): ShapeJSON;

    clone(): EmitterShape;
}