export interface Constructable<T> {
    new(...args: any) : T;
}

export type EditorType = "vec3" | "value" | "number" | "colorFunc" | "valueFunc" | "radian" | "mesh" | "particleSystem" | "boolean";
export type ParameterType = EditorType | "self";
export type ParameterPair = [string, ParameterType];
