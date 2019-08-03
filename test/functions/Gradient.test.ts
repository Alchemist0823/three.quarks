import {Gradient, ColorRange} from "../../src";
import { Vector4 } from "three";

describe("Gradient", () => {
    test(".toJSON", () => {
        const gradient = new Gradient([[new ColorRange(new Vector4(0, .25, .75, 1), new Vector4(1, .75, .25, 0)), 0]]);
        const json = gradient.toJSON();
        expect(json.type).toBe("Gradient");
        expect(json.functions.length).toBe(1);
        expect(json.functions[0].function.a.r).toBe(0);
        expect(json.functions[0].function.a.g).toBe(0.25);
        expect(json.functions[0].function.a.b).toBe(0.75);
        expect(json.functions[0].function.a.a).toBe(1);
        expect(json.functions[0].function.b.r).toBe(1);
        expect(json.functions[0].function.b.g).toBe(0.75);
        expect(json.functions[0].function.b.b).toBe(0.25);
        expect(json.functions[0].function.b.a).toBe(0);
        expect(json.functions[0].start).toBe(0);
    });

    test(".fromJSON", () => {
        const gradient = new Gradient([[new ColorRange(new Vector4(0, .25, .75, 1), new Vector4(1, .75, .25, 0)), 0]]);
        const json = gradient.toJSON();
        const gradient2 = Gradient.fromJSON(json);
        expect(gradient2.functions.length).toBe(1);
        expect(gradient2.functions[0][1]).toBe(0);
        expect(gradient2.functions[0][0].a.x).toBe(0);
        expect(gradient2.functions[0][0].a.y).toBe(0.25);
        expect(gradient2.functions[0][0].a.z).toBe(0.75);
        expect(gradient2.functions[0][0].a.w).toBe(1);
        expect(gradient2.functions[0][0].b.x).toBe(1);
        expect(gradient2.functions[0][0].b.y).toBe(0.75);
        expect(gradient2.functions[0][0].b.z).toBe(0.25);
        expect(gradient2.functions[0][0].b.w).toBe(0);
    });
});
