import {Gradient, ColorRange} from '../../src';
import {Vector3, Vector4} from 'three';
import {RandomColorBetweenGradient} from '../../src';

describe('RandomColorBetweenGradient', () => {
    test('.genColor', () => {
        const gradient = new RandomColorBetweenGradient(
            new Gradient([
                [new Vector3(0, 0, 0), 0],
                [new Vector3(1, 1, 1), 0.2],
                [new Vector3(1, 1, 1), 0.8],
                [new Vector3(0, 0, 0), 1],
            ]),
            new Gradient([
                [new Vector3(0, 0, 0), 0],
                [new Vector3(1, 1, 1), 0.2],
                [new Vector3(1, 1, 1), 0.8],
                [new Vector3(0, 0, 0), 1],
            ])
        );
        const color = new Vector4();
        let memory = {};
        gradient.startGen(memory);
        gradient.genColor(color, 0, memory);
        expect(color.x).toEqual(0);
        expect(color.y).toEqual(0);
        expect(color.z).toEqual(0);
        gradient.genColor(color, 1, memory);
        expect(color.x).toEqual(0);
        expect(color.y).toEqual(0);
        expect(color.z).toEqual(0);
        gradient.genColor(color, 0.5, memory);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(1);
        expect(color.z).toEqual(1);
        gradient.genColor(color, 0.8, memory);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(1);
        expect(color.z).toEqual(1);
        gradient.genColor(color, 0.2, memory);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(1);
        expect(color.z).toEqual(1);
        gradient.genColor(color, 0.1, memory);
        expect(color.x).toBeCloseTo(0.5);
        expect(color.y).toBeCloseTo(0.5);
        expect(color.z).toBeCloseTo(0.5);
        gradient.genColor(color, 0.9, memory);
        expect(color.x).toBeCloseTo(0.5);
        expect(color.y).toBeCloseTo(0.5);
        expect(color.z).toBeCloseTo(0.5);
    });

    const jsonOutput = `{"type":"RandomColorBetweenGradient","gradient1":{"type":"Gradient","color":{"type":"CLinearFunction","subType":"Color","keys":[{"value":{"r":0,"g":0.25,"b":0.75},"pos":0},{"value":{"r":1,"g":0.75,"b":0.25},"pos":1}]},"alpha":{"type":"CLinearFunction","subType":"Number","keys":[{"value":1,"pos":0},{"value":0,"pos":1}]}},"gradient2":{"type":"Gradient","color":{"type":"CLinearFunction","subType":"Color","keys":[{"value":{"r":0,"g":0.25,"b":0.75},"pos":0},{"value":{"r":1,"g":0.75,"b":0.25},"pos":1}]},"alpha":{"type":"CLinearFunction","subType":"Number","keys":[{"value":1,"pos":0},{"value":0,"pos":1}]}}}`;

    test('.toJSON', () => {
        const randomColorBetweenGradient = new RandomColorBetweenGradient(
            new Gradient(
                [
                    [new Vector3(0, 0.25, 0.75), 0],
                    [new Vector3(1, 0.75, 0.25), 1],
                ],
                [
                    [1, 0],
                    [0, 1],
                ]
            ),
            new Gradient(
                [
                    [new Vector3(0, 0.25, 0.75), 0],
                    [new Vector3(1, 0.75, 0.25), 1],
                ],
                [
                    [1, 0],
                    [0, 1],
                ]
            )
        );
        const json = randomColorBetweenGradient.toJSON();
        expect(json.type).toBe('RandomColorBetweenGradient');
        expect(JSON.stringify(json)).toBe(jsonOutput);
    });

    test('.fromJSON', () => {
        const json = JSON.parse(jsonOutput);
        const randomColorBetweenGradient = RandomColorBetweenGradient.fromJSON(json);
        const color = new Vector4();
        let memory = {};
        randomColorBetweenGradient.startGen(memory);
        randomColorBetweenGradient.genColor(color, 0, memory);
        expect(color.x).toEqual(0);
        expect(color.y).toEqual(0.25);
        expect(color.z).toEqual(0.75);
        expect(color.w).toEqual(1);
        randomColorBetweenGradient.genColor(color, 1, memory);
        expect(color.x).toEqual(1);
        expect(color.y).toEqual(0.75);
        expect(color.z).toEqual(0.25);
        expect(color.w).toEqual(0);
        randomColorBetweenGradient.genColor(color, 0.5, memory);
        expect(color.x).toEqual(0.5);
        expect(color.y).toEqual(0.5);
        expect(color.z).toEqual(0.5);
        expect(color.w).toEqual(0.5);
    });
});
