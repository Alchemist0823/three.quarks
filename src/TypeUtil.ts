export interface Constructable<T> {
    new(...args: any) : T;
}

export type EditorType = "vec3" | "value" | "number" | "colorFunc" | "valueFunc" | "radian" | "mesh";
export type ParameterPair = [string, EditorType];
