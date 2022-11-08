/**
 * @jest-environment jsdom
 */
import { BatchedParticleRenderer } from "../src/BatchedParticleRenderer";
import {QuarksLoader} from "../src/QuarksLoader";
import {MeshSurfaceEmitter, ParticleEmitter} from "../src";
import {EmitSubParticleSystem} from "../src/behaviors/EmitSubParticleSystem";
import JSON1 from "./subPS.json";
import JSON2 from "./meshSurface.json";

describe("QuarksLoader", () => {
    test("#loadSubSystem", () => {

        const renderer = new BatchedParticleRenderer();
        const loader = new QuarksLoader(renderer);
        const object = loader.parse(JSON1, (object)=> {});
        expect(object.children.length).toBe(2);
        expect((object.children[0] as ParticleEmitter<Event>).system.behaviors.length).toBe(1);
        expect(((object.children[0] as ParticleEmitter<Event>).system.behaviors[0] as any).particleSystem).toBe((object.children[0] as ParticleEmitter<Event>).system);
        expect(((object.children[0] as ParticleEmitter<Event>).system.behaviors[0] as EmitSubParticleSystem).subParticleSystem).toBe(object.children[1]);
    });


    test("#loadMeshSurfaceEmitter", () => {

        const renderer = new BatchedParticleRenderer();
        const loader = new QuarksLoader(renderer);
        const object = loader.parse(JSON2, (object)=> {});
        expect(object.children.length).toBe(2);
        expect(((object.children[1] as ParticleEmitter<Event>).system.emitterShape as MeshSurfaceEmitter).mesh.name).toBe('Cube');
    });
});
