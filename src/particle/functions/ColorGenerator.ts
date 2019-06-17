import {Vector4} from "three";

export interface ColorGenerator {
    type: 'value';
    genColor(color: Vector4): Vector4;
}

export interface FunctionColorGenerator {
    type: 'function';
    genColor(color: Vector4, t: number): Vector4;
}

export class ConstantColor implements ColorGenerator {
    constructor(public color: Vector4) {
        this.type = 'value';
    }
    genColor(color: Vector4): Vector4 {
        return color.copy(this.color);
    }

    type: "value";
}