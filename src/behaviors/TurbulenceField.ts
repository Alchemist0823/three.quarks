import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {Vector3} from "three";
import SimplexNoise from "../util/simplex-noise";

export class TurbulenceField implements Behavior {

    type = 'TurbulenceField';
    generator = new SimplexNoise();
    offset = [new Vector3(), new Vector3(), new Vector3()];
    temp = new Vector3();

    constructor(public scale: Vector3, public power: Vector3, public fieldShift: Vector3) {
        this.offset[0].x = Math.random() / this.scale.x;
        this.offset[1].x = Math.random() / this.scale.x;
        this.offset[2].x = Math.random() / this.scale.x;
        this.offset[0].y = Math.random() / this.scale.y;
        this.offset[1].y = Math.random() / this.scale.y;
        this.offset[2].y = Math.random() / this.scale.y;
        this.offset[0].z = Math.random() / this.scale.z;
        this.offset[1].z = Math.random() / this.scale.z;
        this.offset[2].z = Math.random() / this.scale.z;
    }

    initialize(particle: Particle): void {
    }

    update(particle: Particle, delta: number): void {
        const x = particle.position.x / this.scale.x;
        const y = particle.position.y / this.scale.y;
        const z = particle.position.z / this.scale.z;
        this.temp.set(
            this.generator.noise3D(this.offset[0].x + x, this.offset[0].y + y, this.offset[0].z + z),
            this.generator.noise3D(this.offset[1].x + x, this.offset[1].y + y, this.offset[1].z + z),
            this.generator.noise3D(this.offset[2].x + x, this.offset[2].y + y, this.offset[2].z + z)
        ).multiply(this.power);
        particle.velocity.addScaledVector(this.temp, delta);
    }

    toJSON(): any {
        return {
            type: this.type,
            scale: [this.scale.x, this.scale.y, this.scale.z],
            power: [this.power.x, this.power.y, this.power.z],
            fieldShift: [this.fieldShift.x, this.fieldShift.y, this.fieldShift.z],
        };
    }

    frameUpdate(delta: number): void {
        this.offset[0].x += delta * this.fieldShift.x;
        this.offset[0].y += delta * this.fieldShift.y;
        this.offset[0].z += delta * this.fieldShift.z;
        this.offset[1].x += delta * this.fieldShift.x;
        this.offset[1].y += delta * this.fieldShift.y;
        this.offset[1].z += delta * this.fieldShift.z;
        this.offset[2].x += delta * this.fieldShift.x;
        this.offset[2].y += delta * this.fieldShift.y;
        this.offset[2].z += delta * this.fieldShift.z;
    }


    static fromJSON(json: any): Behavior {
        return new TurbulenceField(
            new Vector3(json.scale![0], json.scale![1], json.scale![2]),
            new Vector3(json.power![0], json.power![1], json.power![2]),
            new Vector3(json.fieldShift![0], json.fieldShift![1], json.fieldShift![2]),
        );
    }

    clone(): Behavior {
        return new TurbulenceField(this.scale.clone(), this.power.clone(), this.fieldShift.clone());
    }
}
