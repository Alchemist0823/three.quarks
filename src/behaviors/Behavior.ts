import {Particle} from "../Particle";
import { FunctionJSON } from "../functions/FunctionJSON";
import { ColorGeneratorFromJSON, FunctionColorGenerator } from "../functions/ColorGenerator";
import {ColorOverLife} from "./ColorOverLife";
import { ValueGeneratorFromJSON, FunctionValueGenerator } from "../functions/ValueGenerator";
import { RotationOverLife } from "./RotationOverLife";
import { SizeOverLife } from "./SizeOverLife";
import { Vector4 } from "three";
import { ColorRange } from "../functions/ColorRange";

export interface Behavior {
    initialize(particle: Particle): void;
    update(particle: Particle, delta: number): void;

    toJSON(): any;
}

export function BehaviorFromJSON(json: {type: string, func: FunctionJSON}): Behavior {
    switch(json.type) {
        case 'ColorOverLife':
            return new ColorOverLife(ColorGeneratorFromJSON(json.func) as FunctionColorGenerator);
        case 'RotationOverLife':
            return new RotationOverLife(ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        case 'SizeOverLife':
            return new SizeOverLife(ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        default:
            return new ColorOverLife(new ColorRange(new Vector4(1,1,1,1), new Vector4(1,1,1,1)));
    }
}