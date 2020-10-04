import {MathUtils, Vector4} from "three";
import {ColorGenerator} from "./ColorGenerator";
import {FunctionJSON} from "./FunctionJSON";
import {ColorToJSON, JSONToColor} from "../util/JSONUtil";

export class RandomColor implements ColorGenerator {
    constructor(public a: Vector4, public b: Vector4) {
        this.type = "value";
    }

    genColor(color: Vector4): Vector4 {
        const rand = Math.random();
        return color.copy(this.a).lerp(this.b, rand);
    }

    type: "value";

    toJSON(): FunctionJSON {
        return {
            type: "RandomColor",
            a: ColorToJSON(this.a),
            b: ColorToJSON(this.b),
        };
    }

    static fromJSON(json: FunctionJSON): RandomColor {
        return new RandomColor(JSONToColor(json.a), JSONToColor(json.b));
    }
}
