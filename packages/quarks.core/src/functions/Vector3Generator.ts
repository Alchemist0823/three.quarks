import {Vector3} from '../math';
import {ConstantValue} from './ConstantValue';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorLike} from './GeneratorLike';
import {GeneratorMemory} from './GeneratorMemory';
import {Vector3Function} from './Vector3Function';

export interface Vector3Generator extends GeneratorLike<'vec3function', Vector3Generator> {
    genValue(memory: GeneratorMemory, vec: Vector3, t?: number): Vector3;
}

export function Vector3GeneratorFromJSON(json: FunctionJSON): Vector3Generator {
    switch (json.type) {
        case 'Vector3Function':
            return Vector3Function.fromJSON(json);
        default:
            return new Vector3Function(new ConstantValue(0), new ConstantValue(0), new ConstantValue(0));
    }
}
