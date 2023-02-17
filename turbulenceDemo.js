
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
    Bezier, ColorRange, ConstantValue, TurbulenceField,
    IntervalValue, PiecewiseBezier, ColorOverLife,
    RenderMode, SizeOverLife, ParticleSystem,
    ParticleEmitter, BatchedParticleRenderer, ConeEmitter, ApplyForce
} from "./js/three.quarks.esm.js";
import {Demo} from "./demo.js";

export class TurbulenceDemo extends Demo {

    name = "Turbulence";
    initDemo() {
        const ps = new ParticleSystem({
            duration: 1,
            looping: true,
            startLife: new ConstantValue(4),
            startSpeed: new IntervalValue(5, 6),
            startSize: new ConstantValue(0.1),
            startColor: new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 1)),
            worldSpace: true,

            emissionOverTime: new ConstantValue(500),

            shape: new ConeEmitter({radius: 0.5, angle: 0}),
            texture: this.texture,
            blending: AdditiveBlending,
            renderMode: RenderMode.BillBoard,
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        ps.emitter.name = 'ps';
        ps.addBehavior(new TurbulenceField(new Vector3(10, 10, 10), 2, new Vector3(8, 8, 8), new Vector3(5, 5, 5)));
        ps.emitter.rotation.x = - Math.PI / 2;
        ps.emitter.position.y = -8;
        this.scene.add(ps.emitter);
        this.batchRenderer.addSystem(ps);
    }

    initScene() {
        super.initScene();

        this.texture = new TextureLoader().load("textures/texture1.png", (texture) => {
            this.texture.name = "textures/texture1.png";
            this.batchRenderer = new BatchedParticleRenderer();
            this.scene.add(this.batchRenderer);

            this.initDemo();
        });
        return this.scene;
    }
}
