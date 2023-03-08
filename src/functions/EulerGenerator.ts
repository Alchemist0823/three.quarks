import {RotationGenerator} from "./RotationGenerator";
import {Euler, Quaternion} from "three";
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from "./ValueGenerator";
import {FunctionJSON} from "./FunctionJSON";

export class EulerGenerator implements RotationGenerator {

    type: "rotation";
    constructor(public angleX: FunctionValueGenerator | ValueGenerator, public angleY: FunctionValueGenerator | ValueGenerator, public angleZ: FunctionValueGenerator | ValueGenerator) {
        this.type = "rotation";
    }

    genValue(quat: Quaternion, t?: number): Quaternion {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return quat.setFromEuler(new Euler(this.angleX.genValue(t!), this.angleY.genValue(t!), this.angleZ.genValue(t!)));
    }

    toJSON(): FunctionJSON {
        return {
            type: "Euler",
            angleX: this.angleX.toJSON(),
            angleY: this.angleY.toJSON(),
            angleZ: this.angleZ.toJSON(),
        };
    }

    static fromJSON(json: FunctionJSON): EulerGenerator {
        return new EulerGenerator(
            ValueGeneratorFromJSON(json.angleX) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.angleY) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.angleZ) as FunctionValueGenerator,
        );
    }

    clone(): RotationGenerator {
        return new EulerGenerator(this.angleX, this.angleY, this.angleZ);
    }
}
