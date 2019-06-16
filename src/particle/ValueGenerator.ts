export interface ValueGenerator {
    genValue(t: number): number;
}

export class ConstantValue implements ValueGenerator {
    constructor(public value: number) {}

    genValue(t: number = 0): number {
        return this.value;
    }
}