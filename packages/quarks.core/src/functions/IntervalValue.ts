import {ValueGenerator} from './ValueGenerator';
import {MathUtils} from '../math';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';

export class IntervalValue implements ValueGenerator {
    constructor(
        public a: number,
        public b: number
    ) {
        this.type = 'value';
    }

    indexCount = -1;

    startGen(memory: GeneratorMemory) {
        this.indexCount = memory.length;
        memory.push(Math.random());
    }

    genValue(memory: GeneratorMemory): number {
        if (this.indexCount === -1) {
            this.startGen(memory);
        }
        return MathUtils.lerp(this.a, this.b, memory[this.indexCount]);
    }

    type: 'value';

    toJSON(): FunctionJSON {
        return {
            type: 'IntervalValue',
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
