import {ValueGenerator} from "./ValueGenerator";
import {MathUtils} from "three";
import {FunctionJSON} from "./FunctionJSON";

export class IntervalValue implements ValueGenerator {

    constructor(public a: number, public b: number) {
        this.type = "value";
    }

    genValue(): number {
        return MathUtils.lerp(this.a, this.b, Math.random());
    }

    type: "value";

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

    clone(): ValueGenerator {
        return new IntervalValue(this.a, this.b);
    }
}
