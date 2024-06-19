import {ConeEmitter, ConstantValue, EmitterMode, ParticleSystem, SpriteParticle} from '../../src';

describe('ConeEmitter', () => {
    test('loop', () => {
        const emitter = new ConeEmitter({
            radius: 1,
            angle: 0,
            arc: Math.PI * 2,
            thickness: 0,
            mode: EmitterMode.Loop,
            spread: 0,
            speed: new ConstantValue(1),
        });
        const p = new SpriteParticle();
        const ps = {
            emissionState: {
                time: 0,
                burstWaveIndex: 0,
                burstParticleIndex: 0,
                burstParticleCount: 0,
                burstIndex: 0,
                isBursting: false,
                waitEmiting: 0,
                travelDistance: 0,
            },
            duration: 1,
        } as ParticleSystem;
        for (let i = 0; i < 50; i++) {
            emitter.initialize(p, ps.emissionState);
            expect(p.position.x).toBeCloseTo(Math.cos((Math.PI * i) / 25));
            expect(p.position.y).toBeCloseTo(Math.sin((Math.PI * i) / 25));
            expect(p.position.z).toBeCloseTo(0);
            emitter.update(ps, 0.02);
        }
    });
});
