import {ConeEmitter} from "./ConeEmitter";
import {PointEmitter} from "./PointEmitter";
import {SphereEmitter} from "./SphereEmitter";
import {DonutEmitter} from "./DonutEmitter";
import {MeshSurfaceEmitter} from "./MeshSurfaceEmitter";
import {EmitterShape} from "./EmitterShape";
import {Constructable} from "../TypeUtil";

export * from "./ConeEmitter";
export * from "./DonutEmitter";
export * from "./PointEmitter";
export * from "./SphereEmitter";
export * from "./MeshSurfaceEmitter";
export * from "./EmitterShape";

export const EmitterTypes: (string | Constructable<EmitterShape>)[][] = [
    [new ConeEmitter().type, ConeEmitter],
    [new PointEmitter().type, PointEmitter],
    [new SphereEmitter().type, SphereEmitter],
    [new DonutEmitter().type, DonutEmitter],
    ["mesh_surface", MeshSurfaceEmitter],
];
