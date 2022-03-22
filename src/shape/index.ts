import {ConeEmitter} from "./ConeEmitter";
import {PointEmitter} from "./PointEmitter";
import {SphereEmitter} from "./SphereEmitter";
import {DonutEmitter} from "./DonutEmitter";
import {EmitterShape} from "../EmitterShape";
import {Constructable} from "../TypeUtil";

export * from "./ConeEmitter";
export * from "./DonutEmitter";
export * from "./PointEmitter";
export * from "./SphereEmitter";

export const EmitterTypes: (string | Constructable<EmitterShape>)[][] = [
    [new ConeEmitter().type, ConeEmitter],
    [new PointEmitter().type, PointEmitter],
    [new SphereEmitter().type, SphereEmitter],
    [new DonutEmitter().type, DonutEmitter],
];
