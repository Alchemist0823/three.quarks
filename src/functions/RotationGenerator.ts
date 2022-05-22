import {FunctionJSON} from "./FunctionJSON";
import {Quaternion} from "three";
import {RandomQuatGenerator} from "./RandomQuatGenerator";
import {AxisAngleGenerator} from "./AxisAngleGenerator";

export interface RotationGenerator {
    type: 'rotation';
    genValue(q: Quaternion, t?: number): Quaternion;
    toJSON(): FunctionJSON;
    clone(): RotationGenerator;
}

export function RotationGeneratorFromJSON(json: FunctionJSON): RotationGenerator {
    switch(json.type) {
        case 'AxisAngleGenerator':
            return AxisAngleGenerator.fromJSON(json);
        case 'RandomQuatGenerator':
            return RandomQuatGenerator.fromJSON(json);
        default:
            return new RandomQuatGenerator();
    }
}
