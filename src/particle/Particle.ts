import {Color, Vector3, Vector4} from "three";

export class Particle {

    // CPU
    startSpeed: number = 0;
    startColor: Vector4 = new Vector4();
    velocity: Vector3 = new Vector3();
    age: number = 0;
    life: number = 1;

    // GPU
    position: Vector3 = new Vector3();
    rotation: number = 0;
    size: number = 1;
    color: Vector4 = new Vector4();
    uvTile: number = 0;
}