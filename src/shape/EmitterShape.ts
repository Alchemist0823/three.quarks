import {Particle} from "../Particle";
import {ConeEmitter} from "./ConeEmitter";
import {DonutEmitter} from "./DonutEmitter";
import {PointEmitter} from "./PointEmitter";
import {SphereEmitter} from "./SphereEmitter";
import {MeshSurfaceEmitter} from "./MeshSurfaceEmitter";
import {ParticleSystemEmitter} from "./ParticleSystemEmitter";

export interface ShapeJSON {
    type: string;
    radius?: number;
    arc?: number;
    thickness?: number;
    angle?: number;
    mesh?: string;
    particleSystem?: string;
}

export interface EmitterShape {

    type: string;
    initialize(particle: Particle): void;
    toJSON(): ShapeJSON;

    clone(): EmitterShape;
}

export function EmitterFromJSON(json: ShapeJSON): EmitterShape {
    switch(json.type) {
        case 'cone':
            return new ConeEmitter(json);
        case 'donut':
            return new DonutEmitter(json);
        case 'point':
            return new PointEmitter();
        case 'sphere':
            return new SphereEmitter(json);
        case 'mesh_surface':
            return new MeshSurfaceEmitter();
        case 'particle_system':
            return new ParticleSystemEmitter();
        default:
            return new PointEmitter();
    }
}
