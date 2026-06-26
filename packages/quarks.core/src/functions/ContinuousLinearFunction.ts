import {JSONToValue, ValueToJSON} from '../util/JSONUtil';
import {FunctionJSON} from './FunctionJSON';

interface ObjectValueType<T> {
    copy(value: T): ObjectValueType<T>;
    lerp(value: T, pos: number): ObjectValueType<T>;
    clone(): ObjectValueType<T>;
}

export class ContinuousLinearFunction<T extends ObjectValueType<T> | number> {
    readonly type = 'function';

    constructor(
        public keys: [T, number][],
        public subType: 'Number' | 'Vector3' | 'Vector4' | 'Color'
    ) {}

    findKey(t: number): number {
        let mid = 0,
            left = 0,
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
        const firstValue = this.keys[0][0];
        const lastValue = this.keys[this.keys.length - 1][0];

        if (index === -1) {
            return this.subType === 'Number' ? firstValue : ((value as ObjectValueType<T>).copy(firstValue) as T);
        }

        if (index + 1 >= this.keys.length) {
            return this.subType === 'Number' ? lastValue : ((value as ObjectValueType<T>).copy(lastValue) as T);
        }

        const startValue = this.keys[index][0];
        const endValue = this.keys[index + 1][0];
        const startX = this.getStartX(index);
        const endX = this.getEndX(index);
        const ratio = (t - startX) / (endX - startX);

        if (this.subType === 'Number') {
            const start = startValue as number;
            const end = endValue as number;

            return (start + (end - start) * ratio) as T;
        }

        return (value as ObjectValueType<T>).copy(startValue).lerp(endValue, ratio) as T;
    }

    toJSON(): FunctionJSON {
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
