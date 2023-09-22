import {MemorizedFunctionColorGenerator} from './ColorGenerator';
import {Vector4} from 'three';
import {FunctionJSON} from './FunctionJSON';
import {Gradient} from './Gradient';

const tempColor: Vector4 = new Vector4();

// generate a random color from the start two gradients
export class RandomColorBetweenGradient implements MemorizedFunctionColorGenerator {
    public gradient1: Gradient;
    public gradient2: Gradient;
    constructor(gradient1: Gradient, gradient2: Gradient) {
        this.type = 'memorizedFunction';
        this.gradient1 = gradient1;
        this.gradient2 = gradient2;
    }

    startGen(memory: any): void {
        memory.rand = Math.random();
    }

    genColor(color: Vector4, t: number, memory?: any): Vector4 {
        this.gradient1.genColor(color, t);
        this.gradient2.genColor(tempColor, t);
        if (memory && memory.rand) {
            color.lerp(tempColor, memory.rand);
        } else {
            color.lerp(tempColor, Math.random());
        }
        return color;
    }

    type: 'memorizedFunction';

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
