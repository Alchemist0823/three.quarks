import {PiecewiseFunction} from "./PiecewiseFunction";
import {ColorGenerator, FunctionColorGenerator} from "./ColorGenerator";
import {Vector4} from "three";
import {ColorRange} from "./ColorRange";
import {Bezier} from "./Bezier";

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
            console.error(t);
            return color.copy(this.functions[0][0].a);
        }
        return this.getFunction(index).genColor(color, t);
    }

    type: "function";
}