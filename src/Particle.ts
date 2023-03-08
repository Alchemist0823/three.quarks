import { Matrix4, Quaternion, Vector3, Vector4} from "three";
import { EmissionState } from "./ParticleSystem";
import { LinkedList } from "./util/LinkedList";

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
    startSpeed = 0;
    startColor: Vector4 = new Vector4();
    startSize = 1;
    position: Vector3 = new Vector3();
    velocity: Vector3 = new Vector3();
    age = 0;
    life = 1;
    size = 1;

    // extra
    angularVelocity?: number | Quaternion;

    // GPU
    rotation: number | Quaternion = 0;
    color: Vector4 = new Vector4();
    uvTile = 0;

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

    startSpeed = 0;
    startColor: Vector4 = new Vector4();
    startSize = 1;
    position: Vector3 = new Vector3();
    localPosition?: Vector3;
    velocity: Vector3 = new Vector3();
    age = 0;
    life = 1;
    size = 1;
    length = 100;

    // GPU
    color: Vector4 = new Vector4();
    // use link list instead
    previous: LinkedList<RecordState> = new LinkedList<RecordState>();
    uvTile = 0;

    update() {
        if (this.age <= this.life) {
            this.previous.push(new RecordState(this.position.clone(), this.size, this.color.clone()));
        } else {
            if (this.previous.length > 0) {
                this.previous.dequeue();
            }
        }
        while (this.previous.length > this.length) {
            this.previous.dequeue();
        }
    }

    get died() {
        return this.age >= this.life;
    }

    reset() {
        this.previous.clear();
    }
}
