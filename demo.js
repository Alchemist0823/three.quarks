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

export class Demo {

    batchRenderer;
    groups = [];
    totalTime = 0;
    refreshIndex = 0;
    texture;

    render(delta) {

        this.groups.forEach(group =>
            group.traverse(object => {
                if (object.userData && object.userData.func) {
                    object.userData.func.call(object, delta);
                }
            })
        );

        while (Math.floor(this.totalTime * 5) > this.refreshIndex) {
            if (this.refreshIndex < this.groups.length) {
                this.groups[this.refreshIndex].traverse(object => {
                    if (object instanceof ParticleEmitter) {
                        object.system.restart();
                    }
                });
            }
            this.refreshIndex++;
        }
        this.totalTime += delta;
        if (this.totalTime > 2) {
            this.totalTime = 0;
            this.refreshIndex = 0;
        }

        if (this.batchRenderer)
            this.batchRenderer.update(delta);
    }


    initScene() {
        this.scene = new Scene();
        this.scene.background = new Color(0);
        const geo = new PlaneBufferGeometry(2000, 2000, 8, 8);
        const mat = new MeshStandardMaterial({color: 0x222222, side: DoubleSide});
        const plane = new Mesh(geo, mat);
        this.scene.add(plane);
        plane.position.set(0, -10, 0);
        plane.lookAt(new Vector3(0, 1, 0));

        const light = new PointLight(0xffffff, 1, 300);
        light.position.set(0, 20, 0);
        this.scene.add(light);
        return this.scene;
    }
}
