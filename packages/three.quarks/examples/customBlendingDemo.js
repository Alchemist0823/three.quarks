import {
    BatchedParticleRenderer,
    ConstantColor,
    PointEmitter,
    IntervalValue,
    ConstantValue,
    ParticleSystem,
    PiecewiseBezier,
    Bezier,
    RenderMode,
    SpeedOverLife,
    Vector4, SphereEmitter,
} from 'three.quarks';
import {
    MeshBasicMaterial,
    CustomBlending,
    TextureLoader,
    AddEquation,
    OneFactor,
    OneMinusSrcColorFactor,
    SrcAlphaFactor,
    OneMinusSrcAlphaFactor,
    AdditiveBlending, NormalBlending, MaxEquation, SubtractEquation,
} from 'three';
import {Demo} from './demo.js';

export class CustomBlendingDemo extends Demo {
    name = 'Custom Blending Function';

    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        const texture = new TextureLoader().load('textures/particle_default.png');
        const config = {
            duration: 5,
            looping: true,
            //instancingGeometry: new PlaneGeometry(1, 1),//.rotateX((-90 / 180) * Math.PI),
            startLife: new IntervalValue(4, 5),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(1, 2),
            //startRotation: new EulerGenerator(new ConstantValue(0), new ConstantValue(0), new ConstantValue(0)),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: false,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [
                {
                    time: 0,
                    count: new ConstantValue(10),
                    cycle: 1,
                    interval: 0.01,
                    probability: 1,
                },
            ],

            shape: new SphereEmitter({radius: 3}),
            material: new MeshBasicMaterial({
                blending: CustomBlending,
                blendSrc: OneFactor,
                blendDst: OneFactor,
                blendEquation: AddEquation,
                transparent: true,
                map: texture,
                color: new Vector4(0.5, 0.5, 0.5, 1),
                //side: DoubleSide,
            }),
            startTileIndex: new ConstantValue(0),
            uTileCount: 1,
            vTileCount: 1,
            renderOrder: 2,
            renderMode: RenderMode.BillBoard,
        };

        // Create particle system based on your configuration
        let billboard1 = new ParticleSystem(config);
        billboard1.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
        billboard1.emitter.name = 'billboard';
        billboard1.emitter.position.x = -5;

        let billboard2 = new ParticleSystem(config);
        billboard2.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
        billboard2.emitter.name = 'billboard';
        billboard2.emitter.position.x = 0;

        billboard2.material = new MeshBasicMaterial({
            blending: CustomBlending,
            blendSrc: OneFactor,
            blendDst: OneFactor,
            blendEquation: MaxEquation,
            transparent: true,
            color: new Vector4(0.5, 0.5, 0.5, 1),
            map: texture,
        });

        let billboard3 = new ParticleSystem(config);
        billboard3.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
        billboard3.emitter.name = 'billboard';
        billboard3.emitter.position.x = 5;

        billboard3.material = new MeshBasicMaterial({
            blending: CustomBlending,
            blendSrc: OneFactor,
            blendDst: OneFactor,
            blendEquation: SubtractEquation,
            transparent: true,
            color: new Vector4(0.5, 0.5, 0.5, 1),
            map: texture,
        });

        this.batchRenderer.addSystem(billboard1);
        this.batchRenderer.addSystem(billboard2);
        this.batchRenderer.addSystem(billboard3);

        this.scene.add(billboard1.emitter);
        this.scene.add(billboard2.emitter);
        this.scene.add(billboard3.emitter);
        return this.scene;
    }
}
