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

    // get the coefficients of the polynomial's derivatives
    derivativeCoefficients(points: number[]): number[][] {
        let dpoints = [];
        for (let p = points, c = p.length - 1; c > 0; c--) {
            let list = [];
            for (let j = 0; j < c; j++) {
                let dpt = c * (p[j + 1] - p[j]);
                list.push(dpt);
            }
            dpoints.push(list);
            p = list;
        }
        return dpoints;
    }

    // calculate the slope
    getSlope(t: number): number {
        const p = this.derivativeCoefficients(this.p)[0];
        const mt = 1 - t;
        const a = mt * mt;
        const b = mt * t * 2;
        const c = t * t;
        return  a * p[0] + b * p[1] + c * p[2];
        //return  a * (p[1] - p[0]) * 3 + b * (p[2] - p[1]) * 3 + c * (p[3] - p[2]) * 3;
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

    toJSON() {
        return {
            p0 : this.p[0],
            p1 : this.p[1],
            p2 : this.p[2],
            p3 : this.p[3],
        };
    }

    static fromJSON(json: {p0: number, p1: number, p2: number, p3: number}): Bezier {
        return new Bezier(json.p0, json.p1, json.p2, json.p3);
    }
}
