/**
 * @jest-environment jsdom
 */
import {ParticleSystem, QuarksLoader, QuarksPrefab} from '../src';
import {MeshSurfaceEmitter, ParticleEmitter} from '../src';
import {EmitSubParticleSystem} from '../src';
import {SUB_PS_GEOMETRY, MESH_SURFACE_GEOMETRY, QUARKS_PREFAB} from './JsonFiles';

describe('QuarksLoader', () => {
    test('#loadSubSystem', () => {
        const loader = new QuarksLoader();
        const object = loader.parse(SUB_PS_GEOMETRY, () => {});
        expect(object.children.length).toBe(2);
        const system = (object.children[0] as ParticleEmitter).system as ParticleSystem;
        expect(system.behaviors.length).toBe(1);
        expect((system.behaviors[0] as any).particleSystem).toBe(system);
        expect((system.behaviors[0] as EmitSubParticleSystem).subParticleSystem).toBe(object.children[1]);
    });

    test('#loadMeshSurfaceEmitter', () => {
        const loader = new QuarksLoader();
        const object = loader.parse(MESH_SURFACE_GEOMETRY, () => {});
        expect(object.children.length).toBe(2);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(
            Object.keys(
                (((object.children[1] as ParticleEmitter).system as ParticleSystem).emitterShape as MeshSurfaceEmitter)
                    .geometry!.attributes
            ).length
        ).toBe(3);
    });

    test('#loadQuarksPrefab', () => {
        const loader = new QuarksLoader();
        const object = loader.parse(QUARKS_PREFAB, () => {}) as QuarksPrefab;
        expect(object.children.length).toBe(2);
        expect(object.animationData.length).toBe(2);
    });
});
