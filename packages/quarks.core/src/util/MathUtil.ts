import { Vector3 } from "../math";

export function randomInt(a: number, b: number): number {
    return Math.floor(Math.random() * (b - a)) + a;
}

export const UP_VEC3 = new Vector3(0, 1, 0);
export const ZERO_VEC3 = new Vector3(0, 0, 0);
export const ONE_VEC3 = new Vector3(1, 1, 1);
export const Z_VEC3 = new Vector3(0, 0, 1);

