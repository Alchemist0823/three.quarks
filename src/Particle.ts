import {Color, Matrix4, Quaternion, Vector3, Vector4} from "three";
import { EmissionState } from "./ParticleSystem";

export interface Particle {
    emissionState?: EmissionState;
    parentMatrix?: Matrix4;
    rotation?: number | Quaternion;
    startSpeed: number;
    startColor: Vector4;
    startSize: number;
    position: Vector3;
    velocity: Vector3;
    age: number;
    life: number;
    size: number;

    uvTile: number;
    color: Vector4;

    get died(): boolean;
}

export class SpriteParticle implements Particle {
    parentMatrix?: Matrix4;
    // CPU
    startSpeed: number = 0;
    startColor: Vector4 = new Vector4();
    startSize: number = 1;
    position: Vector3 = new Vector3();
    velocity: Vector3 = new Vector3();
    age: number = 0;
    life: number = 1;
    size: number = 1;

    // extra
    angularVelocity?: number;

    // GPU
    rotation: number | Quaternion = 0;
    color: Vector4 = new Vector4();
    uvTile: number = 0;

    get died() {
        return this.age >= this.life;
    }
}

export class RecordState {
    constructor(public position: Vector3, public size: number, public color: Vector4) {
    }
}

export class TrailParticle implements Particle {
    parentMatrix?: Matrix4;

    startSpeed: number = 0;
    startColor: Vector4 = new Vector4();
    startSize: number = 1;
    position: Vector3 = new Vector3();
    localPosition?: Vector3;
    velocity: Vector3 = new Vector3();
    age: number = 0;
    life: number = 1;
    size: number = 1;
    length: number = 100;

    // GPU
    color: Vector4 = new Vector4();
    previous: Array<RecordState> = [];
    uvTile: number = 0;

    recordCurrentState() {
        this.previous.push(new RecordState(this.position.clone(), this.size, this.color.clone()));
        while (this.previous.length > this.length) {
            this.previous.shift();
        }
    }

    get died() {
        return this.age >= this.life;
    }

    reset() {
        this.previous.length = 0;
    }
}
