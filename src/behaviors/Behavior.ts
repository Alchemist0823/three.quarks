import {Particle} from "../Particle";
import { FunctionJSON } from "../functions/FunctionJSON";
import { ColorGeneratorFromJSON, FunctionColorGenerator } from "../functions/ColorGenerator";
import {ColorOverLife} from "./ColorOverLife";
import { ValueGeneratorFromJSON, FunctionValueGenerator } from "../functions/ValueGenerator";
import { RotationOverLife } from "./RotationOverLife";
import { SizeOverLife } from "./SizeOverLife";
import { SpeedOverLife } from "./SpeedOverLife";
import {Vector3, Vector4} from "three";
import { ColorRange } from "../functions/ColorRange";
import {FrameOverLife} from "./FrameOverLife";
import {OrbitOverLife} from "./OrbitOverLife";
import {ApplyForce} from "./ApplyForce";
import {Constructable} from "../TypeUtil";

export interface Behavior {
    type: string;
    initialize(particle: Particle): void;
    update(particle: Particle, delta: number): void;
    toJSON(): any;
    clone(): Behavior;
}

export const BehaviorTypes: Array<Array<(string | Constructable<Behavior> | string[][])>> = [
    ["ApplyForce", ApplyForce, [["direction", "vec3"], ["func", "valueFunc"]]],
    ["ColorOverLife", ColorOverLife, [["func", "colorFunc"]]],
    ["RotationOverLife", RotationOverLife, [["func", "valueFunc"]]],
    ["SizeOverLife", SizeOverLife, [["func", "valueFunc"]]],
    ["SpeedOverLife", SpeedOverLife, [["func", "valueFunc"]]],
    ["FrameOverLife", FrameOverLife, [["func", "valueFunc"]]],
    ["OrbitOverLife", OrbitOverLife, [["func", "valueFunc"]]],
];

export function BehaviorFromJSON(json: {type: string, direction?: Array<number>, func: FunctionJSON}): Behavior {
    switch(json.type) {
        case 'ApplyForce':
            return new ApplyForce(new Vector3(json.direction![0], json.direction![1],json.direction![2]), ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        case 'ColorOverLife':
            return new ColorOverLife(ColorGeneratorFromJSON(json.func) as FunctionColorGenerator);
        case 'RotationOverLife':
            return new RotationOverLife(ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        case 'SizeOverLife':
            return new SizeOverLife(ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        case 'SpeedOverLife':
            return new SpeedOverLife(ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        case 'FrameOverLife':
            return new FrameOverLife(ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        case 'OrbitOverLife':
            return new OrbitOverLife(ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        default:
            return new ColorOverLife(new ColorRange(new Vector4(1,1,1,1), new Vector4(1,1,1,1)));
    }
}
