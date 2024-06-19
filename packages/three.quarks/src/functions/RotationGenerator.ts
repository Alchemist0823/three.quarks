import {FunctionJSON} from './FunctionJSON';
import {Quaternion} from 'three';
import {RandomQuatGenerator} from './RandomQuatGenerator';
import {AxisAngleGenerator} from './AxisAngleGenerator';
import {EulerGenerator} from './EulerGenerator';

export interface RotationGenerator {
    type: 'rotation';
    startGen(memory: GeneratorMemory): void;
    genValue(memory: GeneratorMemory, q: Quaternion, t?: number): Quaternion;
    toJSON(): FunctionJSON;
    clone(): RotationGenerator;
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
