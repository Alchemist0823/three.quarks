import {Particle} from "../Particle";
import { FunctionJSON } from "../functions/FunctionJSON";
import { ColorGeneratorFromJSON, FunctionColorGenerator } from "../functions/ColorGenerator";
import {ColorOverLife} from "./ColorOverLife";
import { ValueGeneratorFromJSON, FunctionValueGenerator, ValueGenerator } from "../functions/ValueGenerator";
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

export const BehaviorTypes: {[key: string]: {constructor: Constructable<Behavior>, params: string[][]}} = {
    "ApplyForce": {constructor: ApplyForce, params: [["direction", "vec3"], ["force", "value"]]},
    "ColorOverLife": {constructor: ColorOverLife, params: [["color", "colorFunc"]]},
    "RotationOverLife": {constructor: RotationOverLife, params: [["angularVelocity", "valueFunc"]]},
    "SizeOverLife": {constructor: SizeOverLife, params: [["size", "valueFunc"]]},
    "SpeedOverLife": {constructor: SpeedOverLife, params: [["speed", "valueFunc"]]},
    "FrameOverLife": {constructor: FrameOverLife, params: [["frame", "valueFunc"]]},
    "OrbitOverLife": {constructor: OrbitOverLife, params: [["orbitSpeed", "valueFunc"]]},
};

export function BehaviorFromJSON(json: any): Behavior {
    switch(json.type) {
        case 'ApplyForce':
            return new ApplyForce(new Vector3(json.direction![0], json.direction![1],json.direction![2]), ValueGeneratorFromJSON(json.force) as ValueGenerator);
        case 'ColorOverLife':
            return new ColorOverLife(ColorGeneratorFromJSON(json.color) as FunctionColorGenerator);
        case 'RotationOverLife':
            return new RotationOverLife(ValueGeneratorFromJSON(json.angularVelocity) as FunctionValueGenerator);
        case 'SizeOverLife':
            return new SizeOverLife(ValueGeneratorFromJSON(json.size) as FunctionValueGenerator);
        case 'SpeedOverLife':
            return new SpeedOverLife(ValueGeneratorFromJSON(json.speed) as FunctionValueGenerator);
        case 'FrameOverLife':
            return new FrameOverLife(ValueGeneratorFromJSON(json.frame) as FunctionValueGenerator);
        case 'OrbitOverLife':
            return new OrbitOverLife(ValueGeneratorFromJSON(json.orbitSpeed) as FunctionValueGenerator);
        default:
            return new ColorOverLife(new ColorRange(new Vector4(1,1,1,1), new Vector4(1,1,1,1)));
    }
}
