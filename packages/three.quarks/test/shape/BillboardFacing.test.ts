import {MeshBasicMaterial, Scene} from 'three';
import {
    CircleEmitter,
    ConeEmitter,
    ConstantColor,
    ConstantValue,
    DonutEmitter,
    EmitterShape,
    GridEmitter,
    HemisphereEmitter,
    ParticleSystem,
    PointEmitter,
    Quaternion,
    RectangleEmitter,
    RenderMode,
    SphereEmitter,
    Vector4,
} from '../../src';

const shapes: Array<[string, () => EmitterShape]> = [
    ['point', () => new PointEmitter()],
    ['sphere', () => new SphereEmitter({radius: 2})],
    ['hemisphere', () => new HemisphereEmitter({radius: 2})],
    ['cone', () => new ConeEmitter({radius: 1, angle: 0.5})],
    ['circle', () => new CircleEmitter({radius: 2})],
    ['donut', () => new DonutEmitter({radius: 2})],
    ['rectangle', () => new RectangleEmitter({width: 2, height: 2})],
    ['grid', () => new GridEmitter({width: 2, height: 2, column: 4, row: 4})],
];

function makeSystem(shape: EmitterShape, renderMode: RenderMode) {
    const system = new ParticleSystem({
        duration: 1,
        looping: true,
        startLife: new ConstantValue(5),
        startSpeed: new ConstantValue(2),
        startSize: new ConstantValue(1),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
        startRotation: renderMode === RenderMode.Mesh ? undefined : new ConstantValue(0.3),
        emissionOverTime: new ConstantValue(200),
        shape,
        material: new MeshBasicMaterial(),
        renderMode,
    });
    new Scene().add(system.emitter);
    for (let i = 0; i < 5; i++) (system as any).update(0.05);
    return system;
}

describe('emitter shapes and particle facing', () => {
    test.each(shapes)('%s: billboard particles keep their start rotation (they face the camera)', (_name, create) => {
        const system = makeSystem(create(), RenderMode.BillBoard);
        expect(system.particleNum).toBeGreaterThan(0);
        for (let i = 0; i < system.particleNum; i++) {
            const rotation = system.particles[i].rotation;
            expect(typeof rotation).toBe('number');
            expect(rotation).toBeCloseTo(0.3);
        }
    });

    // shapes that give mesh particles a default facing (see CHANGELOG 0.17.1)
    test.each(shapes.filter(([name]) => ['point', 'sphere', 'hemisphere', 'donut', 'rectangle'].includes(name)))(
        '%s: mesh particles are oriented by the emitter shape',
        (_name, create) => {
            const system = makeSystem(create(), RenderMode.Mesh);
            expect(system.particleNum).toBeGreaterThan(0);
            let oriented = 0;
            for (let i = 0; i < system.particleNum; i++) {
                const q = system.particles[i].rotation as Quaternion;
                expect(q).toBeInstanceOf(Quaternion);
                if (!(q.x === 0 && q.y === 0 && q.z === 0 && q.w === 1)) oriented++;
            }
            expect(oriented).toBeGreaterThan(0);
        }
    );
});
