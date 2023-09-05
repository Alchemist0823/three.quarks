import {PiecewiseFunction} from './PiecewiseFunction';
import {FunctionColorGenerator} from './ColorGenerator';
import {Vector4} from 'three';
import {ColorRange} from './ColorRange';
import {FunctionJSON} from './FunctionJSON';
import {ColorToJSON, JSONToColor, JSONToValue, ValueToJSON} from '../util/JSONUtil';

interface ObjectValueType<T> {
    copy(value: T): ObjectValueType<T>;
    lerp(value: T, pos: number): ObjectValueType<T>;
    clone(): ObjectValueType<T>;
}

export class ContinuousLinearFunction<T extends ObjectValueType<T> | number> {
    keys: Array<[T, number]>;
    type: 'function';
    subType: 'Number' | 'Vector3' | 'Vector4' | 'Color';
    // default linear bezier
    constructor(keys: Array<[T, number]>, subType: 'Number' | 'Vector3' | 'Vector4' | 'Color') {
        this.subType = subType;
        this.type = 'function';
        this.keys = keys;
    }

    findKey(t: number): number {
        let mid = 0;
        let left = 0,
            right = this.keys.length - 1;
        while (left + 1 < right) {
            mid = Math.floor((left + right) / 2);
            if (t < this.getStartX(mid)) right = mid - 1;
            else if (t > this.getEndX(mid)) left = mid + 1;
            else return mid;
        }
        for (let i = left; i <= right; i++) {
            if (t >= this.getStartX(i) && t <= this.getEndX(i)) return i;
        }
        return -1;
    }

    getStartX(index: number) {
        return this.keys[index][1];
    }

    getEndX(index: number) {
        if (index + 1 < this.keys.length) return this.keys[index + 1][1];
        return 1;
    }

    genValue(value: T, t: number): T {
        const index = this.findKey(t);
        if (this.subType === 'Number') {
            if (index === -1) {
                return this.keys[0][0];
            } else if (index + 1 >= this.keys.length) {
                return this.keys[this.keys.length - 1][0];
            }
            return (((this.keys[index + 1][0] as number) - (this.keys[index][0] as number)) *
                ((t - this.getStartX(index)) / (this.getEndX(index) - this.getStartX(index))) +
                (this.keys[index][0] as number)) as T;
        } else {
            if (index === -1) {
                return (value as ObjectValueType<T>).copy(this.keys[0][0]) as T;
            }
            if (index + 1 >= this.keys.length) {
                return (value as ObjectValueType<T>).copy(this.keys[this.keys.length - 1][0]) as T;
            }
            return (value as ObjectValueType<T>)
                .copy(this.keys[index][0])
                .lerp(
                    this.keys[index + 1][0],
                    (t - this.getStartX(index)) / (this.getEndX(index) - this.getStartX(index))
                ) as T;
        }
    }

    toJSON(): FunctionJSON {
        const subType = this.keys[0][0].constructor.name;
        return {
            type: 'CLinearFunction',
            subType: this.subType,
            keys: this.keys.map(([color, pos]) => ({value: ValueToJSON(color, this.subType), pos: pos})),
        };
    }

    static fromJSON(json: FunctionJSON): ContinuousLinearFunction<any> {
        return new ContinuousLinearFunction(
            json.keys.map((pair: any) => [JSONToValue(pair.value, json.subType), pair.pos]),
            json.subType
        );
    }

    clone(): ContinuousLinearFunction<any> {
        if (this.subType === 'Number') {
            return new ContinuousLinearFunction(
                this.keys.map(([value, pos]) => [value, pos]),
                this.subType
            );
        } else {
            return new ContinuousLinearFunction(
                this.keys.map(([value, pos]) => [(value as ObjectValueType<T>).clone() as T, pos]),
                this.subType
            );
        }
    }
}
