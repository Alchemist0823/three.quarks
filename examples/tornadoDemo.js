
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
    BatchedParticleRenderer, QuarksLoader
} from "./js/three.quarks.esm.js";
import {Demo} from "./demo.js";

export class TornadoDemo extends Demo {

    name = "Tornado";
    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        new QuarksLoader(this.batchRenderer).load("tornado.json", (obj) => {
            this.scene.add(obj);
        });

        return this.scene;
    }
}
