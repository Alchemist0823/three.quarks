import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from './ValueGenerator';
import {GeneratorMemory} from './GeneratorMemory';
import {Vector3} from '../math';
import {FunctionJSON} from './FunctionJSON';
import {Vector3Generator} from './Vector3Generator';

export class Vector3Function implements Vector3Generator {
    type: 'vec3function';

    constructor(
        public x: FunctionValueGenerator | ValueGenerator,
        public y: FunctionValueGenerator | ValueGenerator,
        public z: FunctionValueGenerator | ValueGenerator,
    ) {
        this.type = 'vec3function';
    }

    startGen(memory: GeneratorMemory): void {
        this.x.startGen(memory);
        this.y.startGen(memory);
        this.z.startGen(memory);
    }

    genValue(memory: GeneratorMemory, vec: Vector3, t?: number): Vector3 {
        return vec.set(
            this.x.genValue(memory, t!),
            this.y.genValue(memory, t!),
            this.z.genValue(memory, t!)
        );
    }

    toJSON(): FunctionJSON {
        return {
            type: 'Vector3Function',
            x: this.x.toJSON(),
            y: this.y.toJSON(),
            z: this.z.toJSON(),
        };
    }

    static fromJSON(json: FunctionJSON): Vector3Generator {
        return new Vector3Function(
            ValueGeneratorFromJSON(json.x) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.y) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.z) as FunctionValueGenerator,
        );
    }

    clone(): Vector3Generator {
        return new Vector3Function(this.x, this.y, this.z);
    }
}
