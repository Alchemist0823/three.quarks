import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {ColorGeneratorFromJSON, FunctionColorGenerator} from '../functions';

/**
 * Color particles by their life.
 */
export class ColorOverLife implements Behavior {
    type = 'ColorOverLife';

    constructor(public color: FunctionColorGenerator) {}

    initialize(particle: Particle): void {
        this.color.startGen(particle.memory);
    }

    update(particle: Particle, delta: number): void {
        this.color.genColor(particle.memory, particle.color, particle.age / particle.life);
        particle.color.x *= particle.startColor.x;
        particle.color.y *= particle.startColor.y;
        particle.color.z *= particle.startColor.z;
        particle.color.w *= particle.startColor.w;
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            color: this.color.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new ColorOverLife(ColorGeneratorFromJSON(json.color) as FunctionColorGenerator);
    }

    clone(): Behavior {
        return new ColorOverLife(this.color.clone());
    }
    reset(): void {}
}
