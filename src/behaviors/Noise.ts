import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {Vector3} from "three";
import SimplexNoise from "../util/simplex-noise";

export class Noise implements Behavior {

    type = 'Noise';
    generator = new SimplexNoise();
    duration = 0;
    temp = new Vector3();

    constructor(public frequency: Vector3, public power: Vector3) {
    }

    initialize(particle: Particle): void {
        (particle as any).startTime = this.duration;
    }

    update(particle: Particle, delta: number): void {
        this.temp.set(
            this.generator.noise2D((particle as any).startTime * this.frequency.x, particle.life / particle.age * this.frequency.x),
            this.generator.noise2D((particle as any).startTime * this.frequency.y + 100.25, particle.life / particle.age * this.frequency.y + 100.154),
            this.generator.noise2D((particle as any).startTime * this.frequency.z + 200.89, particle.life / particle.age * this.frequency.z + 200.1)
        ).multiply(this.power);
        particle.position.addScaledVector(this.temp, delta);
    }

    toJSON(): any {
        return {
            type: this.type,
            frequency: [this.frequency.x, this.frequency.y, this.frequency.z],
            power: [this.power.x, this.power.y, this.power.z],
        };
    }

    frameUpdate(delta: number): void {
        this.duration += delta;
    }


    static fromJSON(json: any): Behavior {
        return new Noise(
            new Vector3(json.frequency![0], json.frequency![1], json.frequency![2]),
            new Vector3(json.power![0], json.power![1], json.power![2]),
        );
    }

    clone(): Behavior {
        return new Noise(this.frequency.clone(), this.power.clone());
    }
    reset(): void {
    }
}
