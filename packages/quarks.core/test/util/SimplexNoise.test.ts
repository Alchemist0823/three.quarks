import {SimplexNoise} from '../../src/util/SimplexNoise';

describe('SimplexNoise', function () {
    test('noise at pos 0 = 0', function () {
        let noise = new SimplexNoise();
        expect(noise.noise2D(0, 0)).toBeCloseTo(0);
        expect(noise.noise3D(0, 0, 0)).toBeCloseTo(0);
        expect(noise.noise4D(0, 0, 0, 0)).toBeCloseTo(0);
    });
});
