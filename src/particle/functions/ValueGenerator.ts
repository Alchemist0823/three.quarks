export interface ValueGenerator {
    type: 'value';
    genValue(): number;
}

export interface FunctionValueGenerator {
    type: 'function';
    genValue(t: number): number;
}