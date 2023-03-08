import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {Vector3} from "three";
import SimplexNoise from "../util/simplex-noise";

export class TurbulenceField implements Behavior {

    type = 'TurbulenceField';
    generator = new SimplexNoise();
    timeOffset = new Vector3();
    temp = new Vector3();
    temp2 = new Vector3();

    constructor(public scale: Vector3, public octaves: number, public velocityMultiplier: Vector3, public timeScale: Vector3) {
        this.timeOffset.x = Math.random() / this.scale.x * this.timeScale.x;
        this.timeOffset.y = Math.random() / this.scale.y * this.timeScale.y;
        this.timeOffset.z = Math.random() / this.scale.z * this.timeScale.z;
    }

    initialize(particle: Particle): void {
    }

    update(particle: Particle, delta: number): void {
        const x = particle.position.x / this.scale.x;
        const y = particle.position.y / this.scale.y;
        const z = particle.position.z / this.scale.z;

        this.temp.set(0,0,0);
        let lvl = 1;
        for (let i = 0; i < this.octaves; i ++) {
            this.temp2.set(
                this.generator.noise4D(x * lvl, y * lvl, z * lvl, this.timeOffset.x * lvl) / lvl,
                this.generator.noise4D(x * lvl, y * lvl, z * lvl, this.timeOffset.y * lvl) / lvl,
                this.generator.noise4D(x * lvl, y * lvl, z * lvl, this.timeOffset.z * lvl) / lvl
            );
            this.temp.add(this.temp2);
            lvl *= 2;
        }
        this.temp.multiply(this.velocityMultiplier);
        particle.velocity.addScaledVector(this.temp, delta);
    }

    toJSON(): any {
        return {
            type: this.type,
            scale: [this.scale.x, this.scale.y, this.scale.z],
            octaves: this.octaves,
            velocityMultiplier: [this.velocityMultiplier.x, this.velocityMultiplier.y, this.velocityMultiplier.z],
            timeScale: [this.timeScale.x, this.timeScale.y, this.timeScale.z],
        };
    }

    frameUpdate(delta: number): void {
        this.timeOffset.x += delta * this.timeScale.x;
        this.timeOffset.y += delta * this.timeScale.y;
        this.timeOffset.z += delta * this.timeScale.z;
    }


    static fromJSON(json: any): Behavior {
        return new TurbulenceField(
            new Vector3(json.scale[0], json.scale[1], json.scale[2]),
            json.octaves,
            new Vector3(json.velocityMultiplier[0], json.velocityMultiplier[1], json.velocityMultiplier[2]),
            new Vector3(json.timeScale[0], json.timeScale[1], json.timeScale[2]),
        );
    }

    clone(): Behavior {
        return new TurbulenceField(this.scale.clone(), this.octaves, this.velocityMultiplier.clone(), this.timeScale.clone());
    }
    reset(): void {
    }
}
