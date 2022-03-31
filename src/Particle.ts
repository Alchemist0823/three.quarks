import {Color, Quaternion, Vector3, Vector4} from "three";

export interface Particle {
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
}

export class SpriteParticle implements Particle {
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
    rotation: number = 0;
    rotationQuat?: Quaternion;
    color: Vector4 = new Vector4();
    uvTile: number = 0;
}

export class RecordState {
    constructor(public position: Vector3, public size: number, public color: Vector4) {
    }
}

export class TrailParticle implements Particle {
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

    reset() {
        this.previous.length = 0;
    }
}
