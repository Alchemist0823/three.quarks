import {ConstantValue} from './ConstantValue';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorLike} from './GeneratorLike';
import {GeneratorMemory} from './GeneratorMemory';
import {IntervalValue} from './IntervalValue';
import {PiecewiseBezier} from './PiecewiseBezier';

/**
 * `startGen`/`genValue` follow the per-particle slot pattern documented in
 * `GeneratorMemory.ts`: spawn calls `startGen(memory)` once (claim a slot or
 * no-op), then `genValue(memory)` per frame.
 */
export interface ValueGenerator extends GeneratorLike<'value', ValueGenerator> {
    genValue(memory: GeneratorMemory): number;
}

export interface FunctionValueGenerator extends GeneratorLike<'function', FunctionValueGenerator> {
    genValue(memory: GeneratorMemory, t: number): number;
}

export type AnyValueGenerator = FunctionValueGenerator | ValueGenerator;

export function ValueGeneratorFromJSON(json: FunctionJSON): AnyValueGenerator {
    switch (json.type) {
        case 'ConstantValue':
            return ConstantValue.fromJSON(json);
        case 'IntervalValue':
            return IntervalValue.fromJSON(json);
        case 'PiecewiseBezier':
            return PiecewiseBezier.fromJSON(json);
        default:
            return new ConstantValue(0);
    }
}
