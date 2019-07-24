import {ValueGenerator} from "./ValueGenerator";
import {Math as _Math} from "three";
import {FunctionJSON} from "./FunctionJSON";
import {ColorToJSON} from "../util/JSONUtil";

export class IntervalValue implements ValueGenerator {

    constructor(public a: number, public b: number) {
        this.type = "value";
    }

    genValue(): number {
        return _Math.lerp(this.a, this.b, Math.random());
    }

    type: "value";

    toJSON(): FunctionJSON {
        return {
            type: "intervalValue",
            a: this.a,
            b: this.b,
        };
    }
}