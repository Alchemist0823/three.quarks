/**
 * @jest-environment jsdom
 */
import {ParticleSystem, RenderMode, SpriteParticle, TrailSettings} from '../src';
import {BufferGeometry, MeshBasicMaterial} from 'three';

describe('ParticleSystem', () => {
    test('renderMode applies mode defaults and marks renderer settings dirty', () => {
        const instancingGeometry = new BufferGeometry();
        const system = new ParticleSystem({
            material: new MeshBasicMaterial(),
            instancingGeometry,
        });

        system.neededToUpdateRender = false;
        system.renderMode = RenderMode.Mesh;
        expect(system.renderMode).toBe(RenderMode.Mesh);
        expect(system.rendererSettings.instancingGeometry).toBe(instancingGeometry);
        expect(system.startRotation.type).toBe('rotation');
        expect(system.neededToUpdateRender).toBe(true);

        system.neededToUpdateRender = false;
        system.renderMode = RenderMode.BillBoard;
        expect(system.renderMode).toBe(RenderMode.BillBoard);
        expect(system.rendererSettings.instancingGeometry).not.toBe(instancingGeometry);
        expect(system.rendererEmitterSettings).toEqual({});
        expect(system.startRotation.type).toBe('value');
        expect(system.neededToUpdateRender).toBe(true);
    });

    test('renderMode restarts active particles for trail transitions', () => {
        const system = new ParticleSystem({material: new MeshBasicMaterial()});

        system.particles.push(new SpriteParticle());
        system.particleNum = 1;
        system.paused = true;
        system.emissionState.time = 1;

        system.renderMode = RenderMode.HorizontalBillBoard;
        expect(system.particleNum).toBe(1);
        expect(system.particles).toHaveLength(1);
        expect(system.emissionState.time).toBe(1);

        system.renderMode = RenderMode.Trail;
        expect(system.particleNum).toBe(0);
        expect(system.particles).toHaveLength(0);
        expect(system.paused).toBe(false);
        expect(system.emissionState.time).toBe(0);
        expect((system.rendererEmitterSettings as TrailSettings).startLength.type).toBe('value');
    });
});
