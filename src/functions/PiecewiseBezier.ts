import {FunctionValueGenerator, ValueGenerator} from "./ValueGenerator";
import {PiecewiseFunction} from "./PiecewiseFunction";
import {Bezier} from "./Bezier";
import {FunctionJSON} from "./FunctionJSON";
import {ColorToJSON} from "../util/JSONUtil";

export class PiecewiseBezier extends PiecewiseFunction<Bezier> implements FunctionValueGenerator {

    // default linear bezier
    constructor(curves: Array<[Bezier, number]> = [[new Bezier(0, 1.0 / 3, 1.0 / 3 * 2, 1), 0]]) {
        super();
        this.type = "function";
        this.functions = curves;
    }

    genValue(t: number = 0): number {
        let index = this.findFunction(t);
        if (index === -1) {
            console.error(t);
            return 0;
        }
        return this.functions[index][0].genValue( (t - this.getStartX(index)) / (this.getEndX(index) - this.getStartX(index)));
    }

    toSVG(length: number, segments: number) {
        if (segments < 1)
            return "";
        let result = ["M", 0, this.functions[0][0].p[0]].join(" ");
        for (let i = 1.0 / segments; i <= 1; i += 1.0 / segments) {
            result = [result, "L", i * length, this.genValue(i)].join(" ");
        }
        return result;
    }

    type: "function";

    toJSON(): FunctionJSON {
        return {
            type: "piecewiseBezier",
            beziers: this.functions.map(([bezier, start]) => ({function: bezier.toJSON(), start: start})),
        };
    }

    static fromJSON(json: FunctionJSON): PiecewiseBezier {
        return new PiecewiseBezier(json.beziers.map((piecewiseFunction: any) => ([Bezier.fromJSON(piecewiseFunction.function), piecewiseFunction.start])));
    }
}
