import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {FunctionValueGenerator, PiecewiseBezier, ValueGeneratorFromJSON} from '../functions';

export class FrameOverLife implements Behavior {
    type = 'FrameOverLife';
    constructor(public frame: FunctionValueGenerator) {}

    initialize(particle: Particle): void {
        if (!(this.frame instanceof PiecewiseBezier)) {
            particle.uvTile = Math.floor(this.frame.genValue(0) + 0.001);
        }
    }

    update(particle: Particle, delta: number): void {
        if (this.frame instanceof PiecewiseBezier) {
            particle.uvTile = Math.floor(this.frame.genValue(particle.age / particle.life) + 0.001);
        }
    }

    frameUpdate(delta: number): void {}

    toJSON(): any {
        return {
            type: this.type,
            frame: this.frame.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new FrameOverLife(ValueGeneratorFromJSON(json.frame) as FunctionValueGenerator);
    }

    clone(): Behavior {
        return new FrameOverLife(this.frame.clone());
    }
    reset(): void {}
}
