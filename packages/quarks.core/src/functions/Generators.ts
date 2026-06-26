import {ConstantValue} from './ConstantValue';
import {FunctionJSON} from './FunctionJSON';
import {RotationGenerator, RotationGeneratorFromJSON} from './RotationGenerator';
import {AnyValueGenerator, ValueGeneratorFromJSON} from './ValueGenerator';
import {Vector3Generator, Vector3GeneratorFromJSON} from './Vector3Generator';

export type AnyGenerator = AnyValueGenerator | RotationGenerator | Vector3Generator;

export function GeneratorFromJSON(json: FunctionJSON): AnyGenerator {
    switch (json.type) {
        case 'ConstantValue':
        case 'IntervalValue':
        case 'PiecewiseBezier':
            return ValueGeneratorFromJSON(json);
        case 'AxisAngle':
        case 'RandomQuat':
        case 'Euler':
            return RotationGeneratorFromJSON(json);
        case 'Vector3Function':
            return Vector3GeneratorFromJSON(json);
        default:
            return new ConstantValue(0);
    }
}
