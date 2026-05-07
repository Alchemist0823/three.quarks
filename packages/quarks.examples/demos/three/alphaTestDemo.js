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
} from 'three.quarks';
import {MeshBasicMaterial, NormalBlending, AdditiveBlending, TextureLoader, Vector4, Vector3} from 'three';
import {Demo} from './demo.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {alphaTestShared} from '../shared/alphaTest.shared.js';

export class AlphaTestDemo extends Demo {
    name = alphaTestShared.name;

    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        new GLTFLoader().load('leave.glb', (gltf) => {
            const geo = gltf.scene.children[0].geometry;
            const leaveConfig = {
                duration: alphaTestShared.duration,
                looping: true,
                instancingGeometry: geo,
                startLife: new IntervalValue(alphaTestShared.life.min, alphaTestShared.life.max),
                startSpeed: new ConstantValue(alphaTestShared.speed),
                startSize: new IntervalValue(alphaTestShared.size.min, alphaTestShared.size.max),
                startRotation: new RandomQuatGenerator(),
                startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
                worldSpace: false,

                maxParticle: 100,
                emissionOverTime: new ConstantValue(0),
                emissionBursts: [
                    {
                        time: 0,
                        count: new ConstantValue(alphaTestShared.burstCount),
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
                    new AxisAngleGenerator(
                        new Vector3(
                            alphaTestShared.angularVelocityAxis.x,
                            alphaTestShared.angularVelocityAxis.y,
                            alphaTestShared.angularVelocityAxis.z
                        ).normalize(),
                        new ConstantValue(alphaTestShared.angularVelocity)
                    ),
                    false
                )
            );
            leaves.addBehavior(
                new SpeedOverLife(
                    new PiecewiseBezier([
                        [new Bezier(...alphaTestShared.speedOverLifeCurve), 0],
                    ])
                )
            );
            leaves.emitter.name = 'leaves';
            leaves.emitter.position.x = alphaTestShared.emitterOffsetX;

            this.batchRenderer.addSystem(leaves);

            this.scene.add(leaves.emitter);
            this.scene.add(this.batchRenderer);
        });

        return this.scene;
    }
}
