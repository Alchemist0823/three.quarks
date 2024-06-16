import {ColorGenerator, FunctionColorGenerator} from './ColorGenerator';
import {FunctionJSON} from './FunctionJSON';
import {ColorToJSON, JSONToColor} from '../util/JSONUtil';
import {Vector4} from 'three';

export class ColorRange implements ColorGenerator {
    constructor(
        public a: Vector4,
        public b: Vector4
    ) {
        this.type = 'value';
    }

    indexCount = -1;

    startGen(memory: GeneratorMemory): void {
        this.indexCount = memory.length;
        memory.push(Math.random());
    }
    genColor(memory: GeneratorMemory, color: Vector4): Vector4 {
        if (this.indexCount === -1) {
            this.startGen(memory);
        }
        return color.copy(this.a).lerp(this.b, memory[this.indexCount]);
    }

    type: 'value';

    toJSON(): FunctionJSON {
        return {
            type: 'ColorRange',
            a: ColorToJSON(this.a),
            b: ColorToJSON(this.b),
        };
    }

    static fromJSON(json: FunctionJSON): ColorRange {
        return new ColorRange(JSONToColor(json.a), JSONToColor(json.b));
    }

    clone(): ColorGenerator {
        return new ColorRange(this.a.clone(), this.b.clone());
    }
}
