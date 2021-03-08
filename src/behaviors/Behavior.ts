import {Particle} from "../Particle";
import { FunctionJSON } from "../functions/FunctionJSON";
import { ColorGeneratorFromJSON, FunctionColorGenerator } from "../functions/ColorGenerator";
import {ColorOverLife} from "./ColorOverLife";
import { ValueGeneratorFromJSON, FunctionValueGenerator } from "../functions/ValueGenerator";
import { RotationOverLife } from "./RotationOverLife";
import { SizeOverLife } from "./SizeOverLife";
import { SpeedOverLife } from "./SpeedOverLife";
import { Vector4 } from "three";
import { ColorRange } from "../functions/ColorRange";
import {FrameOverLife} from "./FrameOverLife";
import {OrbitOverLife} from "./OrbitOverLife";

export interface Behavior {
    type: string;
    initialize(particle: Particle): void;
    update(particle: Particle, delta: number): void;
    toJSON(): any;
    clone(): Behavior;
}

export function BehaviorFromJSON(json: {type: string, func: FunctionJSON}): Behavior {
    switch(json.type) {
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
