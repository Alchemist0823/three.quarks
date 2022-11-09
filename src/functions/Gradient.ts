import {PiecewiseFunction} from "./PiecewiseFunction";
import {ColorGenerator, FunctionColorGenerator} from "./ColorGenerator";
import {Color, Vector4} from "three";
import {ColorRange} from "./ColorRange";
import {Bezier} from "./Bezier";
import {FunctionJSON} from "./FunctionJSON";

export class Gradient extends PiecewiseFunction<ColorRange> implements FunctionColorGenerator {

    // default linear bezier
    constructor(functions: Array<[ColorRange, number]> = [[new ColorRange(new Vector4(0,0,0,1), new Vector4(1,1,1,1)), 0]]) {
        super();
        this.type = "function";
        this.functions = functions;
    }

    genColor(color: Vector4, t: number): Vector4 {
        let index = this.findFunction(t);
        if (index === -1) {
            return color.copy(this.functions[0][0].a);
        }
        return this.getFunction(index).genColor(color, (t - this.getStartX(index)) / (this.getEndX(index) - this.getStartX(index)));
    }

    type: "function";

    toJSON(): FunctionJSON {
        return {
            type: "Gradient",
            functions: this.functions.map(([range, start]) => ({function: range.toJSON(), start: start})),
        };
    }

    static fromJSON(json: FunctionJSON): Gradient {
        return new Gradient(json.functions.map((piecewiseFunction: any) => ([ColorRange.fromJSON(piecewiseFunction.function), piecewiseFunction.start])));
    }

    clone(): FunctionColorGenerator {
        return new Gradient(this.functions.map(([range, start])=> ([range.clone() as ColorRange, start])));
    }
}
