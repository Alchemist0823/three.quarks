import {FunctionJSON} from "./FunctionJSON";
import { ConstantValue } from "./ConstantValue";
import { IntervalValue } from "./IntervalValue";
import { PiecewiseBezier } from "./PiecewiseBezier";

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

export function ValueGeneratorFromJSON(json: FunctionJSON) {
    switch(json.type) {
        case 'ConstantValue':
            return ConstantValue.fromJSON(json);
        case 'IntervalValue':
            return IntervalValue.fromJSON(json);
        case 'PiecewiseBezier':
            return PiecewiseBezier.fromJSON(json);
        default:
            return new ConstantValue(0);
    }
}
