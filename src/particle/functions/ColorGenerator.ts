import {Vector4} from "three";
import {FunctionJSON} from "./FunctionJSON";
import {ColorToJSON} from "../util/JSONUtil";

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
            type: "constantColor",
            color: ColorToJSON(this.color)
        };
    }
}