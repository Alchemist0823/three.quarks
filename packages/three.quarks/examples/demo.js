import {
    Group,
    Scene,
    MeshStandardMaterial,
    PlaneGeometry,
    PointLight,
    DoubleSide,
    Mesh,
    Vector3,
    Color,
    MeshBasicMaterial,
} from 'three';
import {ParticleEmitter} from 'three.quarks';

export class Demo {
    batchRenderer;
    groups = [];
    totalTime = 0;
    refreshIndex = 0;
    refreshTime = 2;
    texture;
    camera;
    renderer;
    controls;
    enableControls = true;

    name = 'Unname';

    constructor(camera, renderer, controls) {
        camera.position.set(0, 10, 10);
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;
    }

    render(delta) {
        if (this.enableControls) this.controls.update();
        this.groups.forEach((group) =>
            group.traverse((object) => {
                if (object.userData && object.userData.func) {
                    object.userData.func.call(object, delta);
                }
            })
        );

        while (Math.floor((this.totalTime / this.refreshTime) * this.groups.length) >= this.refreshIndex) {
            if (this.refreshIndex < this.groups.length) {
                this.groups[this.refreshIndex].traverse((object) => {
                    if (object instanceof ParticleEmitter) {
                        object.system.restart();
                    }
                });
                if (this.groups[this.refreshIndex] instanceof ParticleEmitter) {
                    this.groups[this.refreshIndex].system.restart();
                }
            }
            this.refreshIndex++;
        }
        this.totalTime += delta;
        if (this.totalTime > this.refreshTime) {
            this.totalTime = 0;
            this.refreshIndex = 0;
        }

        if (this.batchRenderer) this.batchRenderer.update(delta);
    }

    initScene() {
        this.scene = new Scene();
        this.scene.background = new Color(0);
        const geo = new PlaneGeometry(2000, 2000, 8, 8);
        const mat = new MeshStandardMaterial({color: 0x222222, side: DoubleSide});
        const plane = new Mesh(geo, mat);
        this.scene.add(plane);
        plane.position.set(0, -10, 0);
        plane.lookAt(new Vector3(0, 1, 0));

        const light = new PointLight(0xffffff, 500, 1000);
        light.position.set(0, 5, 5);
        this.scene.add(light);
        return this.scene;
    }
}
