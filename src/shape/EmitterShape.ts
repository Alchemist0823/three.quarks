import {Particle} from "../Particle";
import {ConeEmitter} from "./ConeEmitter";
import {DonutEmitter} from "./DonutEmitter";
import {PointEmitter} from "./PointEmitter";
import {SphereEmitter} from "./SphereEmitter";
import {MeshSurfaceEmitter} from "./MeshSurfaceEmitter";
import {ParticleSystemEmitter} from "./ParticleSystemEmitter";
import {Constructable} from "../TypeUtil";
import {ApplyForce, BehaviorPlugin, BehaviorTypes} from "../behaviors";

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

export interface EmitterShapePlugin {
    type: string;
    constructor: Constructable<EmitterShape>;
    loadJSON: (json: any) => EmitterShape;
}

export const EmitterShapes: {[key: string]: EmitterShapePlugin} = {
    "cone": {type: "cone", constructor: ConeEmitter, loadJSON: ConeEmitter.fromJSON},
    "donut": {type: "donut", constructor: DonutEmitter, loadJSON: DonutEmitter.fromJSON},
    "point": {type: "point", constructor: PointEmitter, loadJSON: PointEmitter.fromJSON},
    "sphere": {type: "sphere", constructor: SphereEmitter, loadJSON: SphereEmitter.fromJSON},
    "mesh_surface": {type: "mesh_surface", constructor: MeshSurfaceEmitter, loadJSON: MeshSurfaceEmitter.fromJSON},
};

export function EmitterFromJSON(json: ShapeJSON): EmitterShape {
    return EmitterShapes[json.type].loadJSON(json);
}
