import {Particle, RecordState, TrailParticle} from '../Particle';
import {FunctionValueGenerator, ValueGeneratorFromJSON} from '../functions/ValueGenerator';
import {Behavior} from './Behavior';

/**
 * Apply width to particles based on their length.
 */
export class WidthOverLength implements Behavior {
    readonly type = 'WidthOverLength';

    constructor(public width: FunctionValueGenerator) {}

    initialize(particle: Particle): void {
        this.width.startGen(particle.memory);
    }

    update(particle: Particle): void {
        if (particle instanceof TrailParticle) {
            const iter = particle.previous.values();
            const previousLength = particle.previous.length;

            for (let i = 0; i < previousLength; i++) {
                const cur = iter.next();
                (cur.value as RecordState).size = this.width.genValue(
                    particle.memory,
                    (previousLength - i) / particle.length
                );
            }
        }
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            width: this.width.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new WidthOverLength(ValueGeneratorFromJSON(json.width) as FunctionValueGenerator);
    }

    clone(): Behavior {
        return new WidthOverLength(this.width.clone());
    }

    reset(): void {}
}
