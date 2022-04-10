import {BoxBufferGeometry, Mesh, SphereBufferGeometry} from "three";
import {MeshSurfaceEmitter, SpriteParticle} from "../../src";

describe("MeshSurfaceEmitter", () => {
    test("BoxGeometry", () => {
        const mesh = new Mesh(new BoxBufferGeometry(2, 2, 2, 2, 2, 2));
        const emitter = new MeshSurfaceEmitter(mesh);
        let p = new SpriteParticle();
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
        const mesh = new Mesh(new SphereBufferGeometry(5, 32, 16));
        const emitter = new MeshSurfaceEmitter(mesh);
        let p = new SpriteParticle();
        for (let i = 0; i < 5; i ++) {
            emitter.initialize(p);
            expect(p.position.length()).toBeLessThan(5.5);
            expect(p.position.length()).toBeGreaterThan(4.5);
        }
    });
});
