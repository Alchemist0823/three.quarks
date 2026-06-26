import {MathUtils} from '../math';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';
import {ValueGenerator} from './ValueGenerator';

export class IntervalValue implements ValueGenerator {
    readonly type = 'value';

    private indexCount = -1;

    constructor(
        public a: number,
        public b: number
    ) {}

    // Roll a random sample once at spawn and remember the slot, so the
    // particle keeps the same lerp factor for its whole life. See
    // GeneratorMemory.ts for the slot-allocation pattern.
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
