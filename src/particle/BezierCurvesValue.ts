import {ValueGenerator} from "./ValueGenerator";


export class Bezier {
    p: number[];

    constructor(p1: number, p2: number, p3: number, p4: number) {
        this.p = [p1 ,p2, p3, p4];
    }

    genValue(t: number): number {
        const t2 = t * t;
        const t3 = t * t * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        return this.p[0] * mt3 + this.p[1] * mt2 * t * 3 + this.p[2] * mt * t2 * 3 + this.p[3] * t3;
    }

    derive(points: number[]): number[][] {
        let dpoints = [];
        for (let p = points, d = p.length, c = d - 1; d > 1; d--, c--) {
            let list = [];
            for (let j = 0, dpt; j < c; j++) {
                dpt = c * (p[j + 1] - p[j]);
                list.push(dpt);
            }
            dpoints.push(list);
            p = list;
        }
        return dpoints;
    }

    derivative(t: number): number {
        const p = this.derive(this.p)[0];
        const mt = 1 - t;
        const a = mt * mt;
        const b = mt * t * 2;
        const c = t * t;
        return  a * p[0] + b * p[1] + c * p[2];
        return  a * (p[1] - p[0]) * 3 + b * (p[2] - p[1]) * 3 + c * (p[3] - p[2]) * 3;
    }

    // derivative(0) = (p[1] - p[0]) * 3
    // derivative(1) = (p[3] - p[2]) * 3
    controlCurve(d0: number, d1: number) {
        this.p[1] = d0 / 3 + this.p[0];
        this.p[2] = this.p[3] - d1 / 3;
    }

    hull(t: number) {
        let p = this.p;
        let _p = [],
            pt,
            q = [],
            idx = 0,
            i = 0,
            l = 0;
        q[idx++] = p[0];
        q[idx++] = p[1];
        q[idx++] = p[2];
        q[idx++] = p[3];

        // we lerp between all points at each iteration, until we have 1 point left.
        while (p.length > 1) {
            _p = [];
            for (i = 0, l = p.length - 1; i < l; i++) {
                pt = t * p[i] + (1 - t) * p[i + 1];
                q[idx++] = pt;
                _p.push(pt);
            }
            p = _p;
        }
        return q;
    }

    split(t: number) {
        // no shortcut: use "de Casteljau" iteration.
        let q = this.hull(t);
        let result = {
            left : new Bezier(q[0], q[4], q[7], q[9]),
            right: new Bezier(q[9], q[8], q[6], q[3]),
            span: q
        };
        return result;
    }

    clone() {
        return new Bezier(this.p[0], this.p[1], this.p[2], this.p[3]);
    }
}


export class BezierCurvesValue implements ValueGenerator {

    // default linear bezier
    curves: Array<[Bezier, number]>;
    constructor(curves: Array<[Bezier, number]> = [[new Bezier(0, 1.0 / 3, 1.0 / 3 * 2, 1), 0]]) {
        this.curves = curves;
    }

    genValue(t: number = 0): number {
        let index = this.findCurve(t);
        return this.curves[index][0].genValue( (t - this.getStartX(index)) / (this.getEndX(index) - this.getStartX(index)));
    }

    private findCurve(t: number): number {
        let mid = 0;
        let left = 0, right = this.curves.length - 1;
        while (left + 1 < right) {
            mid = (left + right) / 2;
            if (t < this.getStartX(mid))
                right = mid - 1;
            else if (t > this.getEndX(mid))
                left = mid + 1;
            else
                return mid;
        }
        for (let i = left; i <= right; i ++) {
            if (t >= this.curves[i][1] && t <= this.getEndX(i))
                return i;
        }
        return -1;
    }

    get numOfCurves() {
        return this.curves.length
    }

    getCurve(index: number) {
        return this.curves[index][0];
    }
    setCurve(index: number, bezier: Bezier) {
        this.curves[index][0] = bezier;
    }

    getStartX(index: number) {
        return this.curves[index][1];
    }
    setStartX(index: number, x: number) {
        if (index > 0)
            this.curves[index][1] = x;
    }
    getEndX(index: number) {
        if (index + 1 < this.curves.length)
            return this.curves[index + 1][1];
        return 1;
    }
    setEndX(index: number, x: number) {
        if (index + 1 < this.curves.length)
            this.curves[index + 1][1] = x;
    }

    toSVG(length: number, segments: number) {
        if (segments < 1)
            return "";
        let result = ["M", 0, this.curves[0][0].p[0]].join(" ");
        for (let i = 1.0 / segments; i <= 1; i += 1.0 / segments) {
            result = [result, "L", i * length, this.genValue(i)].join(" ");
        }
        return result;
    }
}