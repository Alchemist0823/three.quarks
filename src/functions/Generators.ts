import {FunctionJSON} from "./FunctionJSON";
import {RotationGenerator, RotationGeneratorFromJSON} from "./RotationGenerator";
import {ConstantValue} from "./ConstantValue";
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from "./ValueGenerator";


export function GeneratorFromJSON(json: FunctionJSON): FunctionValueGenerator | ValueGenerator | RotationGenerator {
    switch(json.type) {
        case 'ConstantValue':
        case 'IntervalValue':
        case 'PiecewiseBezier':
            return ValueGeneratorFromJSON(json);
        case 'AxisAngle':
        case 'RandomQuat':
            return RotationGeneratorFromJSON(json);
        default:
            return new ConstantValue(0);
    }

}
