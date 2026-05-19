import {
    ConstantValue,
    ConstantColor,
    IntervalValue,
    SphereEmitter,
    PointEmitter,
    ConeEmitter,
    Vector4,
    SizeOverLife,
    PiecewiseBezier,
    Bezier,
    ColorOverLife,
    Gradient,
} from 'quarks.core';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {ParticleSystem} from '../src/ParticleSystem';
import {RenderMode} from '../src/VFXBatch';

let engine: NullEngine;
let scene: Scene;

beforeAll(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
});

afterAll(() => {
    scene.dispose();
    engine.dispose();
});

describe('ParticleSystem', () => {
    it('should create a particle system with default parameters', () => {
        const ps = new ParticleSystem({scene});
        expect(ps).toBeDefined();
        expect(ps.looping).toBe(true);
        expect(ps.duration).toBe(1);
        expect(ps.particleNum).toBe(0);
        expect(ps.paused).toBe(false);
        expect(ps.renderMode).toBe(RenderMode.BillBoard);
    });

    it('should create a particle system with custom parameters', () => {
        const ps = new ParticleSystem({
            scene,
            duration: 5,
            looping: false,
            startLife: new IntervalValue(1, 3),
            startSpeed: new ConstantValue(2),
            startSize: new ConstantValue(0.5),
            startColor: new ConstantColor(new Vector4(1, 0, 0, 1)),
            emissionOverTime: new ConstantValue(50),
            shape: new ConeEmitter(),
            renderMode: RenderMode.BillBoard,
        });
        expect(ps.duration).toBe(5);
        expect(ps.looping).toBe(false);
    });

    it('should emit particles when updated', () => {
        const ps = new ParticleSystem({
            scene,
            duration: 5,
            looping: true,
            startLife: new ConstantValue(2),
            startSpeed: new ConstantValue(1),
            startSize: new ConstantValue(1),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            emissionOverTime: new ConstantValue(100),
            shape: new PointEmitter(),
            renderMode: RenderMode.BillBoard,
        });

        // First call accumulates waitEmiting, second spawns
        ps.emit(0.1, ps.emissionState, ps.emitter.matrixWorld);
        ps.emit(0.1, ps.emissionState, ps.emitter.matrixWorld);
        expect(ps.particleNum).toBeGreaterThan(0);
    });

    it('should support behaviors', () => {
        const ps = new ParticleSystem({
            scene,
            duration: 2,
            startLife: new ConstantValue(1),
            startSpeed: new ConstantValue(1),
            startSize: new ConstantValue(1),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            emissionOverTime: new ConstantValue(10),
            shape: new SphereEmitter(),
            behaviors: [
                new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])),
            ],
        });
        expect(ps.behaviors.length).toBe(1);
    });

    it('should pause and resume', () => {
        const ps = new ParticleSystem({scene, startLife: new ConstantValue(1), emissionOverTime: new ConstantValue(10)});
        ps.pause();
        expect(ps.paused).toBe(true);
        ps.play();
        expect(ps.paused).toBe(false);
    });

    it('should clone correctly', () => {
        const ps = new ParticleSystem({
            scene,
            duration: 3,
            looping: false,
            startLife: new ConstantValue(2),
            startSpeed: new ConstantValue(5),
            startSize: new ConstantValue(0.3),
            startColor: new ConstantColor(new Vector4(0, 1, 0, 1)),
            emissionOverTime: new ConstantValue(20),
            shape: new SphereEmitter(),
            renderMode: RenderMode.BillBoard,
        });

        const cloned = ps.clone();
        expect(cloned.duration).toBe(3);
        expect(cloned.looping).toBe(false);
        expect(cloned.renderMode).toBe(RenderMode.BillBoard);
    });

    it('should support trail render mode', () => {
        const ps = new ParticleSystem({
            scene,
            duration: 2,
            startLife: new ConstantValue(1),
            startSpeed: new ConstantValue(1),
            startSize: new ConstantValue(1),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            emissionOverTime: new ConstantValue(10),
            shape: new PointEmitter(),
            renderMode: RenderMode.Trail,
            rendererEmitterSettings: {
                startLength: new ConstantValue(10),
                followLocalOrigin: false,
            },
        });
        expect(ps.renderMode).toBe(RenderMode.Trail);
    });

    it('should support stretched billboard mode', () => {
        const ps = new ParticleSystem({
            scene,
            duration: 2,
            startLife: new ConstantValue(1),
            startSpeed: new ConstantValue(5),
            startSize: new ConstantValue(1),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            emissionOverTime: new ConstantValue(10),
            shape: new ConeEmitter(),
            renderMode: RenderMode.StretchedBillBoard,
            speedFactor: 0.5,
        });
        expect(ps.renderMode).toBe(RenderMode.StretchedBillBoard);
    });
});
