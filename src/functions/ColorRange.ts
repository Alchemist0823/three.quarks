import {Math as _Math, Vector4} from "three";
import {ColorGenerator, FunctionColorGenerator} from "./ColorGenerator";
import {FunctionJSON} from "./FunctionJSON";
import {ColorToJSON} from "../util/JSONUtil";

export class ColorRange implements FunctionColorGenerator {
    constructor(public a: Vector4, public b: Vector4) {
        this.type = "function";
    }

    genColor(color: Vector4, t: number): Vector4 {
        return color.copy(this.a).lerp(this.b, t);
    }

    type: "function";

    toJSON(): FunctionJSON {
        return {
            type: "colorRange",
            a: ColorToJSON(this.a),
            b: ColorToJSON(this.b),
        };
    }
}