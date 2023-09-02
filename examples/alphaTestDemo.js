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
} from './js/three.quarks.esm.js';
import {MeshBasicMaterial, AdditiveBlending, TextureLoader, Vector4} from './js/three.module.js';
import {Demo} from './demo.js';

export class AlphaTestDemo extends Demo {
    name = 'AlphaTest';

    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        const texture = new TextureLoader().load('textures/logo_texture.png');

        // Particle system configuration
        const logo = {
            duration: 5,
            looping: true,
            startLife: new IntervalValue(4, 5),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(1, 5),
            startRotation: new IntervalValue(0, Math.PI * 2),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: false,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [
                {
                    time: 0,
                    count: 50,
                    cycle: 1,
                    interval: 0.01,
                    probability: 1,
                },
            ],

            shape: new PointEmitter(),
            material: new MeshBasicMaterial({
                map: texture,
                blending: AdditiveBlending,
                transparent: false,
                alphaTest: 0.5,
            }),
            startTileIndex: new ConstantValue(0),
            uTileCount: 1,
            vTileCount: 1,
            renderOrder: 2,
            renderMode: RenderMode.BillBoard,
        };

        // Create particle system based on your configuration
        let logoPS = new ParticleSystem(logo);
        logoPS.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 2), 0]])));
        logoPS.emitter.name = 'muzzle1';
        logoPS.emitter.position.x = 1;

        this.batchRenderer.addSystem(logoPS);

        // Add emitter to your Object3D
        this.scene.add(logoPS.emitter);
        this.scene.add(this.batchRenderer);

        return this.scene;
    }
}
