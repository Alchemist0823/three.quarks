import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {ColorGeneratorFromJSON, FunctionColorGenerator, MemorizedFunctionColorGenerator} from '../functions';

export class ColorOverLife implements Behavior {
    type = 'ColorOverLife';

    constructor(public color: FunctionColorGenerator | MemorizedFunctionColorGenerator) {}

    initialize(particle: Particle): void {
        if (this.color.type === 'memorizedFunction') {
            (particle as any).colorOverLifeMemory = {};
            (this.color as MemorizedFunctionColorGenerator).startGen((particle as any).colorOverLifeMemory);
        }
    }

    update(particle: Particle, delta: number): void {
        if (this.color.type === 'memorizedFunction') {
            (this.color as MemorizedFunctionColorGenerator).genColor(
                particle.color,
                particle.age / particle.life,
                (particle as any).colorOverLifeMemory
            );
        } else {
            (this.color as FunctionColorGenerator).genColor(particle.color, particle.age / particle.life);
        }
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
