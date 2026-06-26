import {Euler, EulerOrder, Quaternion} from '../math';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';
import {RotationGenerator} from './RotationGenerator';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from './ValueGenerator';

export class EulerGenerator implements RotationGenerator {
    readonly type = 'rotation';

    private readonly _euler: Euler;

    constructor(
        public angleX: FunctionValueGenerator | ValueGenerator,
        public angleY: FunctionValueGenerator | ValueGenerator,
        public angleZ: FunctionValueGenerator | ValueGenerator,
        eulerOrder?: EulerOrder
    ) {
        this._euler = new Euler(0, 0, 0, eulerOrder);
    }

    startGen(memory: GeneratorMemory): void {
        this.angleX.startGen(memory);
        this.angleY.startGen(memory);
        this.angleZ.startGen(memory);
    }

    genValue(memory: GeneratorMemory, quat: Quaternion, delta: number, t?: number): Quaternion {
        this._euler.set(
            this.angleX.genValue(memory, t!) * delta,
            this.angleY.genValue(memory, t!) * delta,
            this.angleZ.genValue(memory, t!) * delta
        );

        return quat.setFromEuler(this._euler);
    }

    toJSON(): FunctionJSON {
        return {
            type: 'Euler',
            angleX: this.angleX.toJSON(),
            angleY: this.angleY.toJSON(),
            angleZ: this.angleZ.toJSON(),
            eulerOrder: this._euler.order,
        };
    }

    static fromJSON(json: FunctionJSON): EulerGenerator {
        return new EulerGenerator(
            ValueGeneratorFromJSON(json.angleX) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.angleY) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.angleZ) as FunctionValueGenerator,
            json.eulerOrder as EulerOrder
        );
    }

    clone(): RotationGenerator {
        return new EulerGenerator(this.angleX, this.angleY, this.angleZ, this._euler.order);
    }
}
