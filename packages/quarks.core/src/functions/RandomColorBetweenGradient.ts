import {Vector4} from '../math';
import {FunctionColorGenerator} from './ColorGenerator';
import {FunctionJSON} from './FunctionJSON';
import {GeneratorMemory} from './GeneratorMemory';
import {Gradient} from './Gradient';

const _tmpV: Vector4 = new Vector4();

/**
 * Generate a random color from the start of two gradients.
 */
export class RandomColorBetweenGradient implements FunctionColorGenerator {
    readonly type = 'function';

    private indexCount = 0;

    constructor(
        public gradient1: Gradient,
        public gradient2: Gradient
    ) {}

    startGen(memory: GeneratorMemory): void {
        this.indexCount = memory.length;
        memory.push(Math.random());
    }

    genColor(memory: GeneratorMemory, color: Vector4, t: number): Vector4 {
        this.gradient1.genColor(memory, color, t);
        this.gradient2.genColor(memory, _tmpV, t);

        if (memory && memory[this.indexCount] !== undefined) {
            color.lerp(_tmpV, memory[this.indexCount]);
        } else {
            color.lerp(_tmpV, Math.random());
        }

        return color;
    }

    toJSON(): FunctionJSON {
        return {
            type: 'RandomColorBetweenGradient',
            gradient1: this.gradient1.toJSON(),
            gradient2: this.gradient2.toJSON(),
        };
    }

    static fromJSON(json: FunctionJSON): RandomColorBetweenGradient {
        return new RandomColorBetweenGradient(Gradient.fromJSON(json.gradient1), Gradient.fromJSON(json.gradient2));
    }

    clone(): RandomColorBetweenGradient {
        return new RandomColorBetweenGradient(this.gradient1.clone() as Gradient, this.gradient2.clone() as Gradient);
    }
}
