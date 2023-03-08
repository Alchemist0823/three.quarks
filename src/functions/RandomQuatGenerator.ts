import { Quaternion} from "three";
import {FunctionJSON} from "./FunctionJSON";
import {RotationGenerator} from "./RotationGenerator";

export class RandomQuatGenerator implements RotationGenerator {

    type: "rotation";

    constructor() {
        this.type = "rotation";
    }

    genValue(quat: Quaternion, t: number): Quaternion {
        let x, y, z, u, v, w;
        do {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            z = x * x + y * y;
        } while (z > 1);
        do {
            u = Math.random() * 2 - 1;
            v = Math.random() * 2 - 1;
            w = u * u + v * v;
        } while (w > 1);
        const s = Math.sqrt((1 - z) / w);
        quat.set(x, y, s * u, s * v);
        return quat;
    }

    toJSON(): FunctionJSON {
        return {
            type: "RandomQuat"
        };
    }

    static fromJSON(json: FunctionJSON): RotationGenerator {
        return new RandomQuatGenerator();
    }

    clone(): RotationGenerator {
        return new RandomQuatGenerator();
    }
}
