import {RotationGenerator} from './RotationGenerator';
import {Euler, Quaternion} from 'three';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from './ValueGenerator';
import {FunctionJSON} from './FunctionJSON';
import {EulerOrder} from 'three/src/math/Euler';

export class EulerGenerator implements RotationGenerator {
    type: 'rotation';
    eular: Euler;

    constructor(
        public angleX: FunctionValueGenerator | ValueGenerator,
        public angleY: FunctionValueGenerator | ValueGenerator,
        public angleZ: FunctionValueGenerator | ValueGenerator,
        eulerOrder?: EulerOrder
    ) {
        this.type = 'rotation';
        this.eular = new Euler(0, 0, 0, eulerOrder);
    }

    genValue(quat: Quaternion, t?: number): Quaternion {
        this.eular.set(this.angleX.genValue(t!), this.angleY.genValue(t!), this.angleZ.genValue(t!));
        return quat.setFromEuler(this.eular);
    }

    toJSON(): FunctionJSON {
        return {
            type: 'Euler',
            angleX: this.angleX.toJSON(),
            angleY: this.angleY.toJSON(),
            angleZ: this.angleZ.toJSON(),
            eulerOrder: this.eular.order,
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
        return new EulerGenerator(this.angleX, this.angleY, this.angleZ, this.eular.order);
    }
}
