export interface Constructable<T> {
    new (...args: any): T;
}

export type FieldType =
    | 'vec3'
    | 'value'
    | 'number'
    | 'range'
    | 'colorFunc'
    | 'valueFunc'
    | 'rotationFunc'
    | 'radian'
    | 'mesh'
    | 'particleSystem'
    | 'boolean'
    | 'geometry'
    | 'emitterMode';
export type ParameterType = FieldType | 'self';
export type ParameterPair = [string, ParameterType];
