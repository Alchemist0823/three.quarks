import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {Vector3} from 'three';

export class ForceOverLife implements Behavior {
    type = 'ForceOverLife';
    _temp = new Vector3();

    initialize(particle: Particle): void {}

    constructor(
        public x: FunctionValueGenerator | ValueGenerator,
        public y: FunctionValueGenerator | ValueGenerator,
        public z: FunctionValueGenerator | ValueGenerator
    ) {}

    update(particle: Particle, delta: number): void {
        this._temp.set(
            this.x.genValue(particle.age / particle.life),
            this.y.genValue(particle.age / particle.life),
            this.z.genValue(particle.age / particle.life)
        );
        particle.velocity.addScaledVector(this._temp, delta);
    }

    toJSON(): any {
        return {
            type: this.type,
            x: this.x.toJSON(),
            y: this.y.toJSON(),
            z: this.z.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new ForceOverLife(
            ValueGeneratorFromJSON(json.x) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.y) as FunctionValueGenerator,
            ValueGeneratorFromJSON(json.z) as FunctionValueGenerator
        );
    }

    frameUpdate(delta: number): void {}

    clone(): Behavior {
        return new ForceOverLife(this.x.clone(), this.y.clone(), this.z.clone());
    }
    reset(): void {}
}
