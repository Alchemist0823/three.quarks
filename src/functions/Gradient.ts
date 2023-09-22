import {FunctionColorGenerator} from './ColorGenerator';
import {Vector3, Vector4} from 'three';
import {ColorRange} from './ColorRange';
import {FunctionJSON} from './FunctionJSON';
import {ContinuousLinearFunction} from './ContinuousLinearFunction';

const tempVec3 = new Vector3();
export class Gradient implements FunctionColorGenerator {
    type: 'function';
    color: ContinuousLinearFunction<Vector3>;
    alpha: ContinuousLinearFunction<number>;
    // default linear bezier
    constructor(
        color: Array<[Vector3, number]> = [
            [new Vector3(0, 0, 0), 0],
            [new Vector3(1, 1, 1), 0],
        ],
        alpha: Array<[number, number]> = [
            [1, 0],
            [1, 1],
        ]
    ) {
        this.type = 'function';
        this.color = new ContinuousLinearFunction<Vector3>(color, 'Color');
        this.alpha = new ContinuousLinearFunction<number>(alpha, 'Number');
    }

    genColor(color: Vector4, t: number): Vector4 {
        this.color.genValue(tempVec3, t);
        return color.set(tempVec3.x, tempVec3.y, tempVec3.z, this.alpha.genValue(1, t));
    }

    toJSON(): FunctionJSON {
        return {
            type: 'Gradient',
            color: this.color.toJSON(),
            alpha: this.alpha.toJSON(),
        };
    }

    static fromJSON(json: FunctionJSON): Gradient {
        // compatibility
        if (json.functions) {
            const keys = json.functions.map((func: any) => [ColorRange.fromJSON(func.function).a, func.start]);
            if (json.functions.length > 0) {
                keys.push([ColorRange.fromJSON(json.functions[json.functions.length - 1].function).b, 1]);
            }
            return new Gradient(
                keys.map((key: any) => [new Vector3(key[0].x, key[0].y, key[0].z), key[1]]),
                keys.map((key: any) => [key[0].w, key[1]])
            );
        } else {
            const gradient = new Gradient();
            gradient.alpha = ContinuousLinearFunction.fromJSON(json.alpha);
            gradient.color = ContinuousLinearFunction.fromJSON(json.color);
            return gradient;
        }
    }

    clone(): FunctionColorGenerator {
        const gradient = new Gradient();
        gradient.alpha = this.alpha.clone();
        gradient.color = this.color.clone();
        return gradient;
    }
}
