import {Math as _Math, Vector4} from "three";
import {ColorGenerator} from "./ColorGenerator";

export class RandomColor implements ColorGenerator {
    constructor(public a: Vector4, public b: Vector4) {
        this.type = "value";
    }

    genColor(color: Vector4): Vector4 {
        const rand = Math.random();
        return color.copy(this.a).lerp(this.b, rand);
    }

    type: "value";
}