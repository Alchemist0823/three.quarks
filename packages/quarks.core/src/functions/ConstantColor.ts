import {Vector4} from '../math';
import {ColorToJSON, JSONToColor} from '../util/JSONUtil';
import {ColorGenerator} from './ColorGenerator';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';

export class ConstantColor implements ColorGenerator {
    readonly type = 'value';

    constructor(public color: Vector4) {}

    startGen(memory: GeneratorMemory): void {}

    genColor(memory: GeneratorMemory, color: Vector4): Vector4 {
        return color.copy(this.color);
    }

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
