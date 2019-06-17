import {ValueGenerator} from "./ValueGenerator";

export class ConstantValue implements ValueGenerator {
    type: "value";
    constructor(public value: number) {
        this.type = 'value';
    }

    genValue(): number {
        return this.value;
    }

}