/**
 * @jest-environment jsdom
 */
import { BatchedParticleRenderer } from "../src/BatchedParticleRenderer";
import {QuarksLoader} from "../src/QuarksLoader";
import {ParticleEmitter} from "../src";
import {EmitSubParticleSystem} from "../src/behaviors/EmitSubParticleSystem";
import JSON from "./subPS.json";

describe("QuarksLoader", () => {
    test("#loadSubSystem", () => {

        const renderer = new BatchedParticleRenderer();
        const loader = new QuarksLoader();
        const object = loader.parse(JSON, (object)=> {}, renderer);
        expect(object.children.length).toBe(2);
        expect((object.children[0] as ParticleEmitter).system.behaviors.length).toBe(1);
        expect(((object.children[0] as ParticleEmitter).system.behaviors[0] as any).particleSystem).toBe((object.children[0] as ParticleEmitter).system);
        expect(((object.children[0] as ParticleEmitter).system.behaviors[0] as EmitSubParticleSystem).subParticleSystem).toBe(object.children[1]);
    });
});
