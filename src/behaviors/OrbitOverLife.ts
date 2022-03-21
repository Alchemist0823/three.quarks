import {Behavior} from "./Behavior";
import {Particle, SpriteParticle} from "../Particle";
import {FunctionValueGenerator, ValueGenerator} from "../functions/ValueGenerator";
import {Vector2, Vector3} from "three";

const V3_ZERO = new Vector3();

export class OrbitOverLife implements Behavior {

    type = 'OrbitOverLife';

    constructor(public angularVelocityFunc: FunctionValueGenerator | ValueGenerator) {
    }

    initialize(particle: Particle): void {
        if (particle instanceof SpriteParticle) {
            if (this.angularVelocityFunc.type === 'value') {
                particle.angularVelocity = this.angularVelocityFunc.genValue();
            } else {
                particle.angularVelocity = 0;
            }
        }
    }

    update(particle: Particle, delta: number): void {
        let rotation = Math.atan2(particle.position.y, particle.position.x);
        let len = Math.sqrt(particle.position.x * particle.position.x + particle.position.y * particle.position.y)
        rotation += this.angularVelocityFunc.genValue(particle.age / particle.life) * delta;
        particle.position.x = Math.cos(rotation) * len;
        particle.position.y = Math.sin(rotation) * len;
        //let v1x = particle.position.x
        //let v1y = particle.position.y;
        /*let v2x = particle.position.y;
        let v2y = -particle.position.x;
        v2x /= len;
        v2y /= len;
        particle.position.distanceTo(V3_ZERO) * this.angularVelocityFunc.genValue(particle.age / particle.life);*/
    }
    toJSON(): any {
        return {
            type: this.type,
            func: this.angularVelocityFunc.toJSON(),
        };
    }

    clone(): Behavior {
        return new OrbitOverLife(this.angularVelocityFunc.clone());
    }
}
