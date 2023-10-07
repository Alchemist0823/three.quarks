import {
    BatchedParticleRenderer,
    ConstantColor,
    PointEmitter,
    IntervalValue,
    ConstantValue,
    ParticleSystem,
    SizeOverLife,
    PiecewiseBezier,
    Bezier,
    RenderMode,
    RandomQuatGenerator,
    AxisAngleGenerator,
    Rotation3DOverLife,
    RotationOverLife,
    SpeedOverLife,
    EulerGenerator,
} from 'three.quarks';
import {
    MeshBasicMaterial,
    NormalBlending,
    AdditiveBlending,
    TextureLoader,
    Vector4,
    Vector3,
    PlaneGeometry,
    DoubleSide,
} from 'three';
import {Demo} from './demo.js';

export class BillboardDemo extends Demo {
    name = 'Horizon & Vertical Billboard';

    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        const texture = new TextureLoader().load('textures/logo_texture.png');
        const config = {
            duration: 5,
            looping: true,
            //instancingGeometry: new PlaneGeometry(1, 1),//.rotateX((-90 / 180) * Math.PI),
            startLife: new IntervalValue(4, 5),
            startSpeed: new ConstantValue(2),
            startSize: new IntervalValue(0.4, 0.5),
            //startRotation: new EulerGenerator(new ConstantValue(0), new ConstantValue(0), new ConstantValue(0)),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: false,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [
                {
                    time: 0,
                    count: new ConstantValue(100),
                    cycle: 1,
                    interval: 0.01,
                    probability: 1,
                },
            ],

            shape: new PointEmitter(),
            material: new MeshBasicMaterial({
                blending: NormalBlending,
                transparent: true,
                map: texture,
                //side: DoubleSide,
            }),
            startTileIndex: new ConstantValue(0),
            uTileCount: 1,
            vTileCount: 1,
            renderOrder: 2,
            renderMode: RenderMode.VerticalBillBoard,
        };

        // Create particle system based on your configuration
        let billboard1 = new ParticleSystem(config);
        billboard1.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
        billboard1.emitter.name = 'billboard';
        billboard1.emitter.position.x = 5;

        config.renderMode = RenderMode.HorizontalBillBoard;
        let billboard2 = new ParticleSystem(config);
        billboard2.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
        billboard2.emitter.name = 'billboard';
        billboard2.emitter.position.x = -5;

        this.batchRenderer.addSystem(billboard1);
        this.batchRenderer.addSystem(billboard2);

        this.scene.add(billboard1.emitter);
        this.scene.add(billboard2.emitter);
        this.scene.add(this.batchRenderer);

        return this.scene;
    }
}
