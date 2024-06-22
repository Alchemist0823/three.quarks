import {ValueGenerator} from './ValueGenerator';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';

export class ConstantValue implements ValueGenerator {
    type: 'value';
    constructor(public value: number) {
        this.type = 'value';
    }

    startGen(memory: GeneratorMemory): void {}

    genValue(memory: GeneratorMemory): number {
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
}
