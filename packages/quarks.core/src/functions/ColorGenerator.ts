import {Vector4} from '../math';
import {ColorRange} from './ColorRange';
import {ConstantColor} from './ConstantColor';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorLike} from './GeneratorLike';
import {GeneratorMemory} from './GeneratorMemory';
import {Gradient} from './Gradient';
import {RandomColor} from './RandomColor';
import {RandomColorBetweenGradient} from './RandomColorBetweenGradient';

export interface ColorGenerator extends GeneratorLike<'value', ColorGenerator> {
    genColor(memory: GeneratorMemory, color: Vector4): Vector4;
}

export interface FunctionColorGenerator extends GeneratorLike<'function', FunctionColorGenerator> {
    genColor(memory: GeneratorMemory, color: Vector4, t: number): Vector4;
}

export function ColorGeneratorFromJSON(json: FunctionJSON) {
    switch (json.type) {
        case 'ConstantColor':
            return ConstantColor.fromJSON(json);
        case 'ColorRange':
            return ColorRange.fromJSON(json);
        case 'RandomColor':
            return RandomColor.fromJSON(json);
        case 'Gradient':
            return Gradient.fromJSON(json);
        case 'RandomColorBetweenGradient':
            return RandomColorBetweenGradient.fromJSON(json);
        default:
            return new ConstantColor(new Vector4(1, 1, 1, 1));
    }
}
