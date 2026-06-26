import {Particle} from '../Particle';
import {FunctionValueGenerator, GeneratorFromJSON, Vector3Function, Vector3Generator} from '../functions';
import {Behavior} from './Behavior';

/**
 *  Apply size to particles based on their life.
 */
export class SizeOverLife implements Behavior {
    readonly type = 'SizeOverLife';

    constructor(public size: FunctionValueGenerator | Vector3Generator) {}

    initialize(particle: Particle): void {
        this.size.startGen(particle.memory);
    }

    update(particle: Particle): void {
        if (this.size instanceof Vector3Function) {
            this.size
                .genValue(particle.memory, particle.size, particle.age / particle.life)
                .multiply(particle.startSize);
        } else {
            particle.size
                .copy(particle.startSize)
                .multiplyScalar(
                    (this.size as FunctionValueGenerator).genValue(particle.memory, particle.age / particle.life)
                );
        }
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            size: this.size.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new SizeOverLife(GeneratorFromJSON(json.size) as FunctionValueGenerator);
    }

    clone(): Behavior {
        return new SizeOverLife(this.size.clone());
    }

    reset(): void {}
}
