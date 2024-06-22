import {Vector4} from '../math';
import {FunctionJSON} from './FunctionJSON';
import {ColorToJSON, JSONToColor} from '../util/JSONUtil';
import {RandomColor} from './RandomColor';
import {ColorRange} from './ColorRange';
import {Gradient} from './Gradient';
import {RandomColorBetweenGradient} from './RandomColorBetweenGradient';
import {GeneratorMemory} from './GeneratorMemory';

export interface ColorGenerator {
    type: 'value';
    startGen(memory: GeneratorMemory): void;
    genColor(memory: GeneratorMemory, color: Vector4): Vector4;
    toJSON(): FunctionJSON;
    clone(): ColorGenerator;
}

export interface FunctionColorGenerator {
    type: 'function';
    startGen(memory: GeneratorMemory): void;
    genColor(memory: GeneratorMemory, color: Vector4, t: number): Vector4;
    toJSON(): FunctionJSON;
    clone(): FunctionColorGenerator;
}
export class ConstantColor implements ColorGenerator {
    constructor(public color: Vector4) {
        this.type = 'value';
    }

    startGen(memory: GeneratorMemory): void {}
    genColor(memoryGenerator: GeneratorMemory, color: Vector4): Vector4 {
        return color.copy(this.color);
    }

    type: 'value';

    toJSON(): FunctionJSON {
        return {
            type: 'ConstantColor',
            color: ColorToJSON(this.color),
        };
    }

    static fromJSON(json: FunctionJSON): ConstantColor {
        return new ConstantColor(JSONToColor(json.color));
    }

    clone(): ColorGenerator {
        return new ConstantColor(this.color.clone());
    }
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
