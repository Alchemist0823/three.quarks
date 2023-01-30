import {Vector2, Vector3, Vector4} from "three";

export interface Constructable<T> {
    new(...args: any) : T;
}

export type FieldType = "vec3" | "value" | "number" | "colorFunc" | "valueFunc" | "rotationFunc" | "radian" | "mesh" | "particleSystem" | "boolean" | "geometry";
export type ParameterType = FieldType | "self";
export type ParameterPair = [string, ParameterType];
