import {FunctionColorGenerator} from './ColorGenerator';
import {Vector4} from '../math';
import {FunctionJSON} from './FunctionJSON';
import {Gradient} from './Gradient';
import {GeneratorMemory} from './GeneratorMemory';

const tempColor: Vector4 = new Vector4();

// generate a random color from the start two gradients
export class RandomColorBetweenGradient implements FunctionColorGenerator {
    public gradient1: Gradient;
    public gradient2: Gradient;
    public type: 'function';
    private indexCount: number = 0;
    constructor(gradient1: Gradient, gradient2: Gradient) {
        this.type = 'function';
        this.gradient1 = gradient1;
        this.gradient2 = gradient2;
    }

    startGen(memory: GeneratorMemory): void {
        this.indexCount = memory.length;
        memory.push(Math.random());
    }

    genColor(memory: GeneratorMemory, color: Vector4, t: number): Vector4 {
        this.gradient1.genColor(memory, color, t);
        this.gradient2.genColor(memory, tempColor, t);
        if (memory && memory[this.indexCount] !== undefined) {
            color.lerp(tempColor, memory[this.indexCount]);
        } else {
            color.lerp(tempColor, Math.random());
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
