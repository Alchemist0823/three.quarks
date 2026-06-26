import {Vector3} from '../math';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';
import {AnyValueGenerator, ValueGeneratorFromJSON} from './ValueGenerator';
import {Vector3Generator} from './Vector3Generator';

export class Vector3Function implements Vector3Generator {
    readonly type = 'vec3function';

    constructor(
        public x: AnyValueGenerator,
        public y: AnyValueGenerator,
        public z: AnyValueGenerator
    ) {}

    startGen(memory: GeneratorMemory): void {
        this.x.startGen(memory);
        this.y.startGen(memory);
        this.z.startGen(memory);
    }

    genValue(memory: GeneratorMemory, vec: Vector3, t?: number): Vector3 {
        return vec.set(this.x.genValue(memory, t!), this.y.genValue(memory, t!), this.z.genValue(memory, t!));
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
            ValueGeneratorFromJSON(json.x),
            ValueGeneratorFromJSON(json.y),
            ValueGeneratorFromJSON(json.z)
        );
    }

    clone(): Vector3Generator {
        return new Vector3Function(this.x, this.y, this.z);
    }
}
