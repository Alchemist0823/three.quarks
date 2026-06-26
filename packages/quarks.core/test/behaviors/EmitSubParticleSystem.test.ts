import {EmitSubParticleSystem, IParticleSystem, Matrix4, Particle, Vector3} from '../../src';

type MatrixBuilder = {
    setMatrixFromParticle(matrix: Matrix4, particle: Particle): void;
};

function createBehavior(): MatrixBuilder {
    const particleSystem = {
        worldSpace: true,
        emitter: {
            matrixWorld: new Matrix4(),
        },
    } as unknown as IParticleSystem;

    return new EmitSubParticleSystem(particleSystem, true, undefined) as unknown as MatrixBuilder;
}

function createParticle(velocity: Vector3): Particle {
    return {
        position: new Vector3(4, 5, 6),
        velocity,
    } as unknown as Particle;
}

function expectBasis(matrix: Matrix4, xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): void {
    const elements = matrix.elements;

    expect(elements[0]).toBeCloseTo(xAxis.x);
    expect(elements[1]).toBeCloseTo(xAxis.y);
    expect(elements[2]).toBeCloseTo(xAxis.z);
    expect(elements[4]).toBeCloseTo(yAxis.x);
    expect(elements[5]).toBeCloseTo(yAxis.y);
    expect(elements[6]).toBeCloseTo(yAxis.z);
    expect(elements[8]).toBeCloseTo(zAxis.x);
    expect(elements[9]).toBeCloseTo(zAxis.y);
    expect(elements[10]).toBeCloseTo(zAxis.z);
    expect(elements[12]).toBeCloseTo(4);
    expect(elements[13]).toBeCloseTo(5);
    expect(elements[14]).toBeCloseTo(6);
}

describe('EmitSubParticleSystem', () => {
    test('uses an identity basis for zero velocity', () => {
        const matrix = new Matrix4();

        createBehavior().setMatrixFromParticle(matrix, createParticle(new Vector3(0, 0, 0)));

        expectBasis(matrix, new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1));
    });

    test('handles z-parallel velocity without a degenerate cross product', () => {
        const matrix = new Matrix4();

        createBehavior().setMatrixFromParticle(matrix, createParticle(new Vector3(0, 0, -2)));

        expectBasis(matrix, new Vector3(1, 0, 0), new Vector3(0, -1, 0), new Vector3(0, 0, -2));
        expect(matrix.elements.every(Number.isFinite)).toBe(true);
    });

    test('preserves z-parallel velocity length as matrix scale', () => {
        const matrix = new Matrix4();

        createBehavior().setMatrixFromParticle(matrix, createParticle(new Vector3(0, 0, 2)));

        expectBasis(matrix, new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 2));
    });
});
