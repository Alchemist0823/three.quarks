import {ValueGenerator} from './ValueGenerator';
import {FunctionJSON} from './FunctionJSON';

export class ConstantValue implements ValueGenerator {
    type: 'value';
    constructor(public value: number) {
        this.type = 'value';
    }

    genValue(): number {
        return this.value;
    }

    toJSON(): FunctionJSON {
        return {
            type: 'ConstantValue',
            value: this.value,
        };
    }

    static fromJSON(json: FunctionJSON): ConstantValue {
        return new ConstantValue(json.value);
    }

    clone(): ValueGenerator {
        return new ConstantValue(this.value);
    }

    startGen(): void {}
}
