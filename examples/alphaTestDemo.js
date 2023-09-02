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
} from './js/three.quarks.esm.js';
import {
    MeshBasicMaterial,
    NormalBlending,
    AdditiveBlending,
    TextureLoader,
    Vector4,
    Vector3,
} from './js/three.module.js';
import {Demo} from './demo.js';
import {GLTFLoader} from './js/GLTFLoader.js';

export class AlphaTestDemo extends Demo {
    name = 'AlphaTest';

    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        new GLTFLoader().load('leave.glb', (gltf) => {
            const geo = gltf.scene.children[0].geometry;
            const leaveConfig = {
                duration: 5,
                looping: true,
                instancingGeometry: geo,
                startLife: new IntervalValue(4, 5),
                startSpeed: new ConstantValue(5),
                startSize: new IntervalValue(0.4, 0.5),
                startRotation: new RandomQuatGenerator(),
                startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
                worldSpace: false,

                maxParticle: 100,
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

                shape: new PointEmitter(),
                material: gltf.scene.children[0].material,
                startTileIndex: new ConstantValue(0),
                uTileCount: 1,
                vTileCount: 1,
                renderOrder: 2,
                renderMode: RenderMode.Mesh,
            };

            // Create particle system based on your configuration
            let leaves = new ParticleSystem(leaveConfig);
            leaves.addBehavior(
                new Rotation3DOverLife(
                    new AxisAngleGenerator(new Vector3(0, 0.5, 0.2).normalize(), new ConstantValue(1)),
                    false
                )
            );
            leaves.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
            leaves.emitter.name = 'leaves';
            leaves.emitter.position.x = 2;

            this.batchRenderer.addSystem(leaves);

            this.scene.add(leaves.emitter);
            this.scene.add(this.batchRenderer);
        });

        return this.scene;
    }
}
