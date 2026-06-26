import {Quaternion} from '../math';
import {AxisAngleGenerator} from './AxisAngleGenerator';
import {EulerGenerator} from './EulerGenerator';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorLike} from './GeneratorLike';
import {GeneratorMemory} from './GeneratorMemory';
import {RandomQuatGenerator} from './RandomQuatGenerator';

export interface RotationGenerator extends GeneratorLike<'rotation', RotationGenerator> {
    genValue(memory: GeneratorMemory, q: Quaternion, delta: number, t: number): Quaternion;
}

export function RotationGeneratorFromJSON(json: FunctionJSON): RotationGenerator {
    switch (json.type) {
        case 'AxisAngle':
            return AxisAngleGenerator.fromJSON(json);
        case 'Euler':
            return EulerGenerator.fromJSON(json);
        case 'RandomQuat':
            return RandomQuatGenerator.fromJSON(json);
        default:
            return new RandomQuatGenerator();
    }
}
