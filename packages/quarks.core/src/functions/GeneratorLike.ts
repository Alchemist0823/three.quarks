import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';

export interface GeneratorLike<TType extends string, TClone> {
    readonly type: TType;
    startGen(memory: GeneratorMemory): void;
    toJSON(): FunctionJSON;
    clone(): TClone;
}
