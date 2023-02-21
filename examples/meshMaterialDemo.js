
import {
    Group,
    MeshStandardMaterial,
    MeshBasicMaterial,
    PlaneBufferGeometry,
    PointLight,
    DoubleSide,
    Mesh,
    BoxGeometry,
    Vector4,
    Color,
    AdditiveBlending,
} from "./js/three.module.js";
import {
    BatchedParticleRenderer, RandomQuatGenerator, QuarksLoader, ParticleEmitter, ParticleSystem, ConeEmitter, ConstantValue, ConstantColor, RenderMode, IntervalValue
} from "./js/three.quarks.esm.js";
import {Demo} from "./demo.js";

export class MeshMaterialDemo extends Demo {

    name = "Mesh Standard Material";
    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        const geo = new BoxGeometry(1.0, 2.0, 1.0);
        const mat = new MeshStandardMaterial({
            color: new Color(1.0, 1.0, 1.0),
            roughness: 1.0,
            metalness: 0.5,
        });
        //this.scene.add(new Mesh(geo, mat));

        let ps = new ParticleSystem({
            duration: 1,
            looping: true,
            instancingGeometry: geo,
            startLife: new IntervalValue(2.0, 3.0),
            startSpeed: new ConstantValue(1),
            startSize: new ConstantValue(0.1),
            startColor: new ConstantColor(new Vector4(1, 0.585716, 0.1691176, 1)),
            startRotation: new RandomQuatGenerator(),
            worldSpace: true,

            emissionOverTime: new ConstantValue(60),
            emissionBursts: [],

            shape: new ConeEmitter({radius: 0.1, angle: 1}),
            material: mat,
            renderMode: RenderMode.Mesh,
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        this.batchRenderer.addSystem(ps);
        this.scene.add(ps.emitter);

        return this.scene;
    }
}
