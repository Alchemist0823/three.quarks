import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {
    FunctionValueGenerator,
    GeneratorFromJSON,
    Vector3Function,
    Vector3Generator,
} from '../functions';

/**
 *  Apply size to particles based on their life.
 */
export class SizeOverLife implements Behavior {
    type = 'SizeOverLife';

    initialize(particle: Particle): void {
        this.size.startGen(particle.memory);
    }

    constructor(public size: FunctionValueGenerator | Vector3Generator) {}

    update(particle: Particle): void {
        if (this.size instanceof Vector3Function) {
            this.size.genValue(particle.memory, particle.size, particle.age / particle.life).multiply(particle.startSize);
        } else {
            particle.size.copy(particle.startSize).multiplyScalar((this.size as FunctionValueGenerator).genValue(particle.memory, particle.age / particle.life));
        }
    }
    toJSON(): any {
        return {
            type: this.type,
            size: this.size.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new SizeOverLife(GeneratorFromJSON(json.size) as FunctionValueGenerator);
    }

    frameUpdate(delta: number): void {}

    clone(): Behavior {
        return new SizeOverLife(this.size.clone());
    }
    reset(): void {}
}
