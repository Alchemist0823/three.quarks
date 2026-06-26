import {Vector3, Vector4} from '../math';
import {FunctionColorGenerator} from './ColorGenerator';
import {ColorRange} from './ColorRange';
import {ContinuousLinearFunction} from './ContinuousLinearFunction';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';

const _tmpV = new Vector3();

export class Gradient implements FunctionColorGenerator {
    readonly type = 'function';

    color: ContinuousLinearFunction<Vector3>;
    alpha: ContinuousLinearFunction<number>;

    // Default linear bezier
    constructor(
        color: [Vector3, number][] = [
            [new Vector3(0, 0, 0), 0],
            [new Vector3(1, 1, 1), 0],
        ],
        alpha: [number, number][] = [
            [1, 0],
            [1, 1],
        ]
    ) {
        this.color = new ContinuousLinearFunction<Vector3>(color, 'Color');
        this.alpha = new ContinuousLinearFunction<number>(alpha, 'Number');
    }

    startGen(memory: GeneratorMemory): void {}

    genColor(memory: GeneratorMemory, color: Vector4, t: number): Vector4 {
        this.color.genValue(_tmpV, t);
        return color.set(_tmpV.x, _tmpV.y, _tmpV.z, this.alpha.genValue(1, t));
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
