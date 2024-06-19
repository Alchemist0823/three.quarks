import {ColorRange} from '../../src';
import {Vector4} from 'three';

describe('ColorRange', () => {
    test('.genColor', () => {
        const colorRange = new ColorRange(new Vector4(0, 0.25, 0.75, 1), new Vector4(1, 0.75, 0.25, 0));
        const color = new Vector4();

        let memory: never[] = [];
        colorRange.startGen(memory);
        colorRange.genColor(memory, color);
        expect(color.x).toBeGreaterThanOrEqual(0);
        expect(color.x).toBeLessThanOrEqual(1);
        expect(color.y).toBeGreaterThanOrEqual(0.25);
        expect(color.y).toBeLessThanOrEqual(0.75);
        expect(color.z).toBeGreaterThanOrEqual(0.25);
        expect(color.z).toBeLessThanOrEqual(0.75);
    });

    test('.toJSON', () => {
        const colorRange = new ColorRange(new Vector4(0, 0.25, 0.75, 1), new Vector4(1, 0.75, 0.25, 0));
        const json = colorRange.toJSON();
        expect(json.type).toBe('ColorRange');
        expect(json.a.r).toBe(0);
        expect(json.a.g).toBe(0.25);
        expect(json.a.b).toBe(0.75);
        expect(json.a.a).toBe(1);
        expect(json.b.r).toBe(1);
        expect(json.b.g).toBe(0.75);
        expect(json.b.b).toBe(0.25);
        expect(json.b.a).toBe(0);
    });

    test('.fromJSON', () => {
        const colorRange1 = new ColorRange(new Vector4(0, 0.25, 0.75, 1), new Vector4(1, 0.75, 0.25, 0));
        const json = colorRange1.toJSON();
        const colorRange2 = ColorRange.fromJSON(json);
        expect(colorRange2.a.x).toBe(0);
        expect(colorRange2.a.y).toBe(0.25);
        expect(colorRange2.a.z).toBe(0.75);
        expect(colorRange2.a.w).toBe(1);
        expect(colorRange2.b.x).toBe(1);
        expect(colorRange2.b.y).toBe(0.75);
        expect(colorRange2.b.z).toBe(0.25);
        expect(colorRange2.b.w).toBe(0);
    });
});
