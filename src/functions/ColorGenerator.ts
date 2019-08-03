import {Vector4} from "three";
import {FunctionJSON} from "./FunctionJSON";
import {ColorToJSON, JSONToColor} from "../util/JSONUtil";
import { RandomColor } from "./RandomColor";
import { ColorRange } from "./ColorRange";

export interface ColorGenerator {
    type: 'value';
    genColor(color: Vector4): Vector4;
    toJSON(): FunctionJSON;
}

export interface FunctionColorGenerator {
    type: 'function';
    genColor(color: Vector4, t: number): Vector4;
    toJSON(): FunctionJSON;
}

export class ConstantColor implements ColorGenerator {
    constructor(public color: Vector4) {
        this.type = 'value';
    }
    genColor(color: Vector4): Vector4 {
        return color.copy(this.color);
    }

    type: "value";

    toJSON(): FunctionJSON {
        return {
            type: "ConstantColor",
            color: ColorToJSON(this.color)
        };
    }

    static fromJSON(json: FunctionJSON): ConstantColor {
        return new ConstantColor(JSONToColor(json.color));
    }
}

export function ColorGeneratorFromJSON(json: FunctionJSON) {
    switch(json.type) {
        case 'ConstantColor':
            return ConstantColor.fromJSON(json);
        case 'ColorRange':
            return ColorRange.fromJSON(json);
        case 'RandomColor':
            return RandomColor.fromJSON(json);
        default:
            return new ConstantColor(new Vector4(1, 1, 1, 1));
    }
}
