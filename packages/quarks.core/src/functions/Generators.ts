import {FunctionJSON} from "./FunctionJSON";
import {RotationGenerator, RotationGeneratorFromJSON} from "./RotationGenerator";
import {ConstantValue} from "./ConstantValue";
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from "./ValueGenerator";
import {Vector3Generator, Vector3GeneratorFromJSON} from './Vector3Generator';


export function GeneratorFromJSON(json: FunctionJSON): FunctionValueGenerator | ValueGenerator | RotationGenerator | Vector3Generator {
    switch(json.type) {
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
