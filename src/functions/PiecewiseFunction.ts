export abstract class PiecewiseFunction<T> {

    public functions: Array<[T, number]>;

    protected constructor() {
        this.functions = new Array<[T, number]>();
    }

    findFunction(t: number): number {
        let mid = 0;
        let left = 0, right = this.functions.length - 1;
        while (left + 1 < right) {
            mid = Math.floor((left + right) / 2);
            if (t < this.getStartX(mid))
                right = mid - 1;
            else if (t > this.getEndX(mid))
                left = mid + 1;
            else
                return mid;
        }
        for (let i = left; i <= right; i ++) {
            if (t >= this.functions[i][1] && t <= this.getEndX(i))
                return i;
        }
        return -1;
    }

    getStartX(index: number) {
        return this.functions[index][1];
    }
    setStartX(index: number, x: number) {
        if (index > 0)
            this.functions[index][1] = x;
    }
    getEndX(index: number) {
        if (index + 1 < this.functions.length)
            return this.functions[index + 1][1];
        return 1;
    }
    setEndX(index: number, x: number) {
        if (index + 1 < this.functions.length)
            this.functions[index + 1][1] = x;
    }

    insertFunction(t: number, func: T): void {
        const index = this.findFunction(t);
        this.functions.splice(index + 1, 0, [func, t]);
    }

    removeFunction(index: number): T {
        return this.functions.splice(index, 1)[0][0];
    }

    getFunction(index: number) {
        return this.functions[index][0];
    }

    setFunction(index: number, func: T) {
        this.functions[index][0] = func;
    }

    get numOfFunctions() {
        return this.functions.length
    }

}
