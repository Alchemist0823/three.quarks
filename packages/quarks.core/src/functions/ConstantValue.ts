import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';
import {ValueGenerator} from './ValueGenerator';

export class ConstantValue implements ValueGenerator {
    readonly type = 'value';

    constructor(public value: number) {}

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
