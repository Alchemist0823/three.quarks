import {
    Group,
    Scene,
    MeshBasicMaterial,
    DoubleSide,
    Mesh,
    Vector4,
    Vector3,
    Color,
    AdditiveBlending,
    TextureLoader,
} from './js/three.module.js';
import {
    Bezier,
    ColorRange,
    ConstantValue,
    IntervalValue,
    PiecewiseBezier,
    ColorOverLife,
    RenderMode,
    SizeOverLife,
    ParticleSystem,
    RandomColorBetweenGradient,
    ParticleEmitter,
    BatchedParticleRenderer,
    ConeEmitter,
    ApplyForce,
    ApplyCollision,
    Gradient,
} from './js/three.quarks.esm.js';
import {Demo} from './demo.js';
export class TrailDemo extends Demo {
    name = 'Trail Renderer and Physics';

    refreshTime = 5;

    initTrailEffect() {
        const group = new Group();

        const beam = new ParticleSystem({
            duration: 5,
            looping: false,
            startLife: new IntervalValue(3.8, 4.4),
            startSpeed: new IntervalValue(10, 15),
            startSize: new ConstantValue(0.2),
            startColor: new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 1)),
            worldSpace: true,

            maxParticle: 10,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [
                {
                    time: 0,
                    count: 100,
                    cycle: 1,
                    interval: 0.01,
                    probability: 1,
                },
            ],

            shape: new ConeEmitter({radius: 0.1, angle: 1}),
            material: new MeshBasicMaterial({
                map: this.texture,
                blending: AdditiveBlending,
                transparent: true,
                side: DoubleSide,
            }),
            renderMode: RenderMode.Trail,
            rendererEmitterSettings: {
                startLength: new ConstantValue(20),
            },
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        beam.emitter.name = 'beam';
        beam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        //beam.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(0.6, 0.6, 0.6, 1))));
        beam.addBehavior(
            new ColorOverLife(
                new RandomColorBetweenGradient(
                    new Gradient([[new ColorRange(new Vector4(1, 0, 0, 1), new Vector4(1, 0, 0, 1)), 0]]),
                    new Gradient([[new ColorRange(new Vector4(0, 1, 0, 1), new Vector4(0, 1, 0, 1)), 0]])
                )
            )
        );
        beam.addBehavior(new ApplyForce(new Vector3(0, -1, 0), new ConstantValue(20)));
        beam.addBehavior(
            new ApplyCollision(
                {
                    resolve(pos, normal) {
                        if (pos.y <= -6) {
                            normal.set(0, 1, 0);
                            return true;
                        } else {
                            return false;
                        }
                    },
                },
                0.6
            )
        );
        beam.emitter.rotation.x = -Math.PI / 2;
        group.add(beam.emitter);
        this.batchRenderer.addSystem(beam);

        group.position.set(0, 0); //Math.floor(index / 10) * 2 - 10, 0, (index % 10) * 2 - 10);
        group.visible = false;
        this.scene.add(group);
        this.groups.push(group);
    }

    initScene() {
        this.scene = super.initScene();

        this.texture = new TextureLoader().load('textures/texture1.png', (texture) => {
            this.texture.name = 'textures/texture1.png';
            this.batchRenderer = new BatchedParticleRenderer();
            this.scene.add(this.batchRenderer);

            this.initTrailEffect();
        });
        return this.scene;
    }
}
