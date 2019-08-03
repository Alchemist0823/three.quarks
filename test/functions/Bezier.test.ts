import {Bezier} from "../../src";

describe("Bezier", () => {
    test(".toJSON", () => {
        const bezier = new Bezier(0, .25, .75, 1);
        const json = bezier.toJSON();
        expect(json.p0).toBe(0);
        expect(json.p1).toBe(.25);
        expect(json.p2).toBe(.75);
        expect(json.p3).toBe(1);
    });

    test(".fromJSON", () => {
        const bezier = Bezier.fromJSON({p0: 0, p1: .25, p2: .75, p3: 1});
        expect(bezier.p[0]).toBe(0);
        expect(bezier.p[1]).toBe(.25);
        expect(bezier.p[2]).toBe(.75);
        expect(bezier.p[3]).toBe(1);
    });
});
