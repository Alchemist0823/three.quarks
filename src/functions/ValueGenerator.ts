import {FunctionJSON} from "./FunctionJSON";

export interface ValueGenerator {
    type: 'value';
    genValue(): number;
    toJSON(): FunctionJSON;
}

export interface FunctionValueGenerator {
    type: 'function';
    genValue(t: number): number;
    toJSON(): FunctionJSON;
}