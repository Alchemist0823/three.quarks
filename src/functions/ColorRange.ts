
import { FunctionColorGenerator} from "./ColorGenerator";
import {FunctionJSON} from "./FunctionJSON";
import {ColorToJSON, JSONToColor} from "../util/JSONUtil";
import {Vector4} from "three";

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
            type: "ColorRange",
            a: ColorToJSON(this.a),
            b: ColorToJSON(this.b),
        };
    }

    static fromJSON(json: FunctionJSON): ColorRange {
        return new ColorRange(JSONToColor(json.a), JSONToColor(json.b));
    }

    clone(): FunctionColorGenerator {
        return new ColorRange(this.a.clone(), this.b.clone());
    }
}
