import {
    BatchedParticleRenderer, Bezier, IntervalValue, ParticleSystem, PiecewiseBezier, ConeEmitter,
    QuarksLoader,
    QuarksUtil, RenderMode, SpeedOverLife,
} from 'three.quarks';
import {Demo} from './demo.js';
import {
    Mesh,
    BoxGeometry,
    MeshBasicMaterial,
    Vector3,
    TextureLoader,
    NormalBlending,
    AdditiveBlending,
    DoubleSide, Group,
} from 'three';
import {ConstantColor, ConstantValue, Vector4} from 'quarks.core';

export class FollowObjectDemo extends Demo {
    name = 'Following Moving Objects';
    loadedEffect = null;
    movingObject = null;
    refreshTime = 10;

    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        // Create a moving object
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({color: 0x00ff00});
        this.movingObject = new Mesh(geometry, material);
        this.scene.add(this.movingObject);

        const texture = new TextureLoader().load('textures/particle_default.png');
        const config = {
            duration: 5,
            looping: true,
            //instancingGeometry: new PlaneGeometry(1, 1),//.rotateX((-90 / 180) * Math.PI),
            startLife: new IntervalValue(2, 3),
            startSpeed: new ConstantValue(20),
            startSize: new IntervalValue(1, 2),
            //startRotation: new EulerGenerator(new ConstantValue(0), new ConstantValue(0), new ConstantValue(0)),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: false,
            maxParticle: 100,
            emissionOverTime: new ConstantValue(10),
            emissionBursts: [],
            shape: new ConeEmitter({
                radius: 0.1,
                angle: 0.1,
            }),
            material: new MeshBasicMaterial({
                blending: AdditiveBlending,
                transparent: true,
                map: texture,
                side: DoubleSide,
            }),
            startTileIndex: new ConstantValue(0),
            uTileCount: 1,
            vTileCount: 1,
            renderOrder: 0,
            renderMode: RenderMode.BillBoard,
        };

        let billboard1 = new ParticleSystem(config);
        billboard1.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
        billboard1.emitter.name = 'billboard'
        let anotherObj = new Group();
        anotherObj.add(billboard1.emitter);
        this.movingObject.add(anotherObj);
        this.batchRenderer.addSystem(billboard1);

        this.enableControls = false;

        return this.scene;
    }

    movingTime = 0;
    render(delta) {
        // Move the object in a circular path
        this.movingTime += delta;
        this.movingObject.position.set(Math.sin(this.movingTime) * 50, 0, Math.cos(this.movingTime) * 50);
        this.camera.position.set(Math.sin(this.movingTime) * 50, 10, Math.cos(this.movingTime) * 50 + 10);
        super.render(delta);
    }
}