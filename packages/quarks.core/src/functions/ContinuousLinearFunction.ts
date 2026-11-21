import {FunctionJSON} from './FunctionJSON';
import {JSONToValue, ValueToJSON} from '../util/JSONUtil';

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
        const numeric = this.subType === 'Number';
        if (index === -1 || index + 1 >= this.keys.length) {
            const keyValue = this.keys[index === -1 ? 0 : this.keys.length - 1][0];
            return numeric ? keyValue : ((value as ObjectValueType<T>).copy(keyValue) as T);
        }

        const start = this.keys[index][0];
        const end = this.keys[index + 1][0];
        const startX = this.getStartX(index);
        const endX = this.getEndX(index);
        // A zero-width segment represents an instantaneous jump to its end value.
        if (endX === startX) {
            return numeric ? end : ((value as ObjectValueType<T>).copy(end) as T);
        }

        const progress = (t - startX) / (endX - startX);
        if (numeric) {
            return (((end as number) - (start as number)) * progress + (start as number)) as T;
        }
        return (value as ObjectValueType<T>).copy(start).lerp(end, progress) as T;
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
