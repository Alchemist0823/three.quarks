import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from "./ValueGenerator";
import { Quaternion, Vector3} from "three";
import {FunctionJSON} from "./FunctionJSON";
import {RotationGenerator} from "./RotationGenerator";

export class AxisAngleGenerator implements RotationGenerator {

    type: "rotation";
    constructor(public axis: Vector3, public angle: FunctionValueGenerator | ValueGenerator) {
        this.type = "rotation";
    }

    genValue(quat: Quaternion, t?: number): Quaternion {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return quat.setFromAxisAngle(this.axis, this.angle.genValue(t!));
    }

    toJSON(): FunctionJSON {
        return {
            type: "AxisAngle",
            axis: {x: this.axis.x, y: this.axis.y, z: this.axis.z},
            angle: this.angle.toJSON(),
        };
    }

    static fromJSON(json: FunctionJSON): AxisAngleGenerator {
        return new AxisAngleGenerator(json.axis, ValueGeneratorFromJSON(json.angle) as FunctionValueGenerator);
    }

    clone(): RotationGenerator {
        return new AxisAngleGenerator(this.axis.clone(), this.angle.clone());
    }
}
