import {Gradient} from '../../src';
import {Vector3, Vector4} from 'three';

describe('Gradient', () => {
    const memory: never[] = [];
    const jsonOutput = `{"type":"Gradient","color":{"type":"CLinearFunction","subType":"Color","keys":[{"value":{"r":0,"g":0.25,"b":0.75},"pos":0},{"value":{"r":1,"g":0.75,"b":0.25},"pos":1}]},"alpha":{"type":"CLinearFunction","subType":"Number","keys":[{"value":1,"pos":0},{"value":0,"pos":1}]}}`;

    test('.genColor', () => {
        const gradient = new Gradient(
            [
                [new Vector3(0, 0, 0), 0.1],
                [new Vector3(1, 1, 1), 0.2],
                [new Vector3(1, 1, 1), 0.8],
                [new Vector3(0, 0, 0), 0.9],
            ],
            [
                [0, 0.1],
                [1, 0.9],
            ]
        );
        const color = new Vector4();
        gradient.genColor(memory, color, 0);
        expect(color.x).toEqual(0);
        expect(color.y).toEqual(0);
        expect(color.z).toEqual(0);
        expect(color.w).toEqual(0);
        gradient.genColor(memory, color, 1);
        expect(color.x).toEqual(0);
        expect(color.y).toEqual(0);
        expect(color.z).toEqual(0);
        expect(color.w).toEqual(1);
        gradient.genColor(memory, color, 0.5);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(1);
        expect(color.z).toEqual(1);
        expect(color.w).toEqual(0.5);
        gradient.genColor(memory, color, 0.8);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(1);
        expect(color.z).toEqual(1);
        expect(color.w).toEqual(0.875);
        gradient.genColor(memory, color, 0.2);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(1);
        expect(color.z).toEqual(1);
        expect(color.w).toEqual(0.125);
        gradient.genColor(memory, color, 0.15);
        expect(color.x).toBeCloseTo(0.5);
        expect(color.y).toBeCloseTo(0.5);
        expect(color.z).toBeCloseTo(0.5);
        expect(color.w).toBeCloseTo(0.0625);
        gradient.genColor(memory, color, 0.85);
        expect(color.x).toBeCloseTo(0.5);
        expect(color.y).toBeCloseTo(0.5);
        expect(color.z).toBeCloseTo(0.5);
        expect(color.w).toBeCloseTo(0.9375);
    });

    test('.toJSON', () => {
        const gradient = new Gradient(
            [
                [new Vector3(0, 0.25, 0.75), 0],
                [new Vector3(1, 0.75, 0.25), 1],
            ],
            [
                [1, 0],
                [0, 1],
            ]
        );
        const json = gradient.toJSON();

        expect(JSON.stringify(json)).toBe(jsonOutput);
    });

    test('.fromJSON', () => {
        const json = JSON.parse(jsonOutput);
        const gradient = Gradient.fromJSON(json);
        const color = new Vector4();
        gradient.genColor(memory, color, 0);
        expect(color.x).toEqual(0);
        expect(color.y).toEqual(0.25);
        expect(color.z).toEqual(0.75);
        expect(color.w).toEqual(1);
        gradient.genColor(memory, color, 1);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(0.75);
        expect(color.z).toEqual(0.25);
        expect(color.w).toEqual(0);
        gradient.genColor(memory, color, 0.5);
        expect(color.x).toEqual(0.5);
        expect(color.y).toEqual(0.5);
        expect(color.z).toEqual(0.5);
        expect(color.w).toEqual(0.5);
    });

    test('.fromJSON compatibility', () => {
        const json = JSON.parse(
            `{"type":"Gradient","functions":[{"function":{"type":"ColorRange","a":{"r":0,"g":0.25,"b":0.75,"a":1},"b":{"r":1,"g":0.75,"b":0.25,"a":0}},"start":0}]}`
        );
        const gradient = Gradient.fromJSON(json);
        const color = new Vector4();
        gradient.genColor(memory, color, 0);
        expect(color.x).toEqual(0);
        expect(color.y).toEqual(0.25);
        expect(color.z).toEqual(0.75);
        expect(color.w).toEqual(1);
        gradient.genColor(memory, color, 1);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(0.75);
        expect(color.z).toEqual(0.25);
        expect(color.w).toEqual(0);
        gradient.genColor(memory, color, 0.5);
        expect(color.x).toEqual(0.5);
        expect(color.y).toEqual(0.5);
        expect(color.z).toEqual(0.5);
        expect(color.w).toEqual(0.5);

        const json2 = JSON.parse(
            `{"type":"Gradient","functions":[{"function":{"type":"ColorRange","a":{"r":0,"g":0.25,"b":0.75,"a":1},"b":{"r":1,"g":0.75,"b":0.25,"a":0}},"start":0},{"function":{"type":"ColorRange","a":{"r":1,"g":0.75,"b":0.25,"a":0},"b":{"r":1,"g":1,"b":1,"a":1}},"start":0.5}]}`
        );
        const gradient2 = Gradient.fromJSON(json2);
        gradient2.genColor(memory, color, 0);
        expect(color.x).toEqual(0);
        expect(color.y).toEqual(0.25);
        expect(color.z).toEqual(0.75);
        expect(color.w).toEqual(1);
        gradient2.genColor(memory, color, 0.5);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(0.75);
        expect(color.z).toEqual(0.25);
        expect(color.w).toEqual(0);
        gradient2.genColor(memory, color, 1);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(1);
        expect(color.z).toEqual(1);
        expect(color.w).toEqual(1);
    });
});
