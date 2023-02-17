
import {
    Group,
    Scene,
    MeshStandardMaterial,
    PlaneBufferGeometry,
    PointLight,
    DoubleSide,
    Mesh,
    Vector4,
    Vector3,
    Color,
    AdditiveBlending,
    TextureLoader
} from "./js/three.module.js";
import {
    BatchedParticleRenderer, QuarksLoader, ParticleEmitter
} from "./js/three.quarks.esm.js";
import {Demo} from "./demo.js";

export class TornadoDemo extends Demo {

    name = "Tornado";
    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        new QuarksLoader().load("tornado.json", (obj) => {
            obj.traverse((child) => {
                if (child.type === "ParticleEmitter") {
                    this.batchRenderer.addSystem(child.system);
                }
            })
            if (obj.type === "ParticleEmitter") {
                this.batchRenderer.addSystem(obj.system);
            }
            this.scene.add(obj);
        });

        return this.scene;
    }
}
