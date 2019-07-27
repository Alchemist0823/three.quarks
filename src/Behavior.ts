import {Particle} from "./Particle";
import { FunctionJSON } from "./functions/FunctionJSON";
import { ColorGeneratorFromJSON, FunctionColorGenerator } from "./functions/ColorGenerator";
import {ColerOverLife} from "./behaviors/ColorOverLife";
import { ValueGeneratorFromJSON, FunctionValueGenerator } from "./functions/ValueGenerator";
import { RotationOverLife } from "./behaviors/RotationOverLife";
import { SizeOverLife } from "./behaviors/SizeOverLife";
import { Vector4 } from "three";
import { ColorRange } from "./functions/ColorRange";

export interface Behavior {
    initialize(particle: Particle): void;
    update(particle: Particle, delta: number): void;

    toJSON(): any;
}

export function BehaviorFromJSON(json: {type: string, func: FunctionJSON}): Behavior {
    switch(json.type) {
        case 'colorOverLife':
            return new ColerOverLife(ColorGeneratorFromJSON(json.func) as FunctionColorGenerator);
        case 'rotationOverLife':
            return new RotationOverLife(ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        case 'sizeOverLife':
            return new SizeOverLife(ValueGeneratorFromJSON(json.func) as FunctionValueGenerator);
        default:
            return new ColerOverLife(new ColorRange(new Vector4(1,1,1,1), new Vector4(1,1,1,1)));
    }
}
