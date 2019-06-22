import {ValueGenerator} from "./ValueGenerator";
import {FunctionJSON} from "./FunctionJSON";

export class ConstantValue implements ValueGenerator {
    type: "value";
    constructor(public value: number) {
        this.type = 'value';
    }

    genValue(): number {
        return this.value;
    }


    toJSON(): FunctionJSON {
        return {
            type: "constantValue",
            value: this.value
        };
    }
}