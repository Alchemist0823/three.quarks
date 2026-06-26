import {Quaternion, Vector3} from '../math';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';
import {RotationGenerator} from './RotationGenerator';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from './ValueGenerator';

export class AxisAngleGenerator implements RotationGenerator {
    readonly type = 'rotation';

    constructor(
        public axis: Vector3,
        public angle: FunctionValueGenerator | ValueGenerator
    ) {}

    startGen(memory: GeneratorMemory): void {
        this.angle.startGen(memory);
    }

    genValue(memory: GeneratorMemory, quat: Quaternion, delta: number, t?: number): Quaternion {
        return quat.setFromAxisAngle(this.axis, this.angle.genValue(memory, t!) * delta);
    }

    toJSON(): FunctionJSON {
        return {
            type: 'AxisAngle',
            axis: {x: this.axis.x, y: this.axis.y, z: this.axis.z},
            angle: this.angle.toJSON(),
        };
    }

    static fromJSON(json: FunctionJSON): AxisAngleGenerator {
        return new AxisAngleGenerator(
            new Vector3(json.axis.x, json.axis.y, json.axis.z),
            ValueGeneratorFromJSON(json.angle) as FunctionValueGenerator
        );
    }

    clone(): RotationGenerator {
        return new AxisAngleGenerator(this.axis.clone(), this.angle.clone());
    }
}
