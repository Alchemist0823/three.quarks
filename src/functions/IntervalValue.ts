import {FunctionValueGenerator, ValueGenerator} from "./ValueGenerator";
import {MathUtils} from "three";
import {FunctionJSON} from "./FunctionJSON";

export class IntervalValue implements FunctionValueGenerator {

    constructor(public a: number, public b: number) {
        this.type = "function";
    }

    genValue(t?: number): number {
        return MathUtils.lerp(this.a, this.b, t !== undefined ? t : Math.random());
    }

    type: "function";

    toJSON(): FunctionJSON {
        return {
            type: "IntervalValue",
            a: this.a,
            b: this.b,
        };
    }

    static fromJSON(json: FunctionJSON): IntervalValue {
        return new IntervalValue(json.a, json.b);
    }

    clone(): FunctionValueGenerator {
        return new IntervalValue(this.a, this.b);
    }
}
