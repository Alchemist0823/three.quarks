import {Quaternion} from '../math';
import {FunctionJSON} from './FunctionJSON';
import {RotationGenerator} from './RotationGenerator';
import {GeneratorMemory} from './GeneratorMemory';

export class RandomQuatGenerator implements RotationGenerator {
    type: 'rotation';

    constructor() {
        this.type = 'rotation';
    }

    indexCount = 0;

    startGen(memory: GeneratorMemory): void {
        this.indexCount = memory.length;
        memory.push(new Quaternion());
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
        memory[this.indexCount].set(x, y, s * u, s * v);
    }

    genValue(memory: GeneratorMemory, quat: Quaternion, delta: number, t: number): Quaternion {
        if (this.indexCount === -1) {
            this.startGen(memory);
        }
        quat.copy(memory[this.indexCount] as Quaternion);
        return quat;
    }

    toJSON(): FunctionJSON {
        return {
            type: 'RandomQuat',
        };
    }

    static fromJSON(json: FunctionJSON): RotationGenerator {
        return new RandomQuatGenerator();
    }

    clone(): RotationGenerator {
        return new RandomQuatGenerator();
    }
}
