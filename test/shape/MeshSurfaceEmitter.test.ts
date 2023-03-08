import {BoxGeometry, SphereGeometry} from "three";
import {MeshSurfaceEmitter, SpriteParticle} from "../../src";

describe("MeshSurfaceEmitter", () => {
    test("BoxGeometry", () => {
        const geometry = new BoxGeometry(2, 2, 2, 2, 2, 2);
        const emitter = new MeshSurfaceEmitter(geometry);
        const p = new SpriteParticle();
        for (let i = 0; i < 50; i ++) {
            emitter.initialize(p);
            expect(p.position.x).toBeLessThanOrEqual(1);
            expect(p.position.y).toBeLessThanOrEqual(1);
            expect(p.position.z).toBeLessThanOrEqual(1);
            expect(p.position.x).toBeGreaterThanOrEqual(-1);
            expect(p.position.y).toBeGreaterThanOrEqual(-1);
            expect(p.position.z).toBeGreaterThanOrEqual(-1);
        }
    });

    test("SphereGeometry", () => {
        const geometry = new SphereGeometry(5, 32, 16);
        const emitter = new MeshSurfaceEmitter(geometry);
        const p = new SpriteParticle();
        for (let i = 0; i < 5; i ++) {
            emitter.initialize(p);
            expect(p.position.length()).toBeLessThan(5.5);
            expect(p.position.length()).toBeGreaterThan(4.5);
        }
    });
});
