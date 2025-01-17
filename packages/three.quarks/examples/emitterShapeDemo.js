import {
    DoubleSide,
    Mesh,
    Vector4,
    Color,
    AdditiveBlending,
    TextureLoader,
    MeshBasicMaterial, MeshLambertMaterial,
} from 'three';
import {
    GridEmitter,
    SphereEmitter,
    CircleEmitter,
    ConeEmitter,
    HemisphereEmitter,
    ConstantValue,
    IntervalValue,
    DonutEmitter,
    PointEmitter,
    RandomColor,
    RenderMode,
    ParticleSystem,
    BatchedParticleRenderer,
    EmitterMode,
} from 'three.quarks';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {Demo} from './demo.js';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';

export class EmitterShapeDemo extends Demo {
    name = 'Different Emitter Shapes';
    refreshTime = 10;
    initParticleSystem() {
        return new ParticleSystem({
            duration: 5,
            looping: true,
            startLife: new IntervalValue(1.0, 1.0),
            startSpeed: new IntervalValue(1, 1),
            startSize: new IntervalValue(0.1, 0.1),
            startColor: new RandomColor(new Vector4(1, 0.91, 0.51, 1), new Vector4(1, 0.44, 0.16, 1)),
            worldSpace: true,

            maxParticle: 1000,
            emissionOverTime: new ConstantValue(1000),
            emissionBursts: [
                /*{
                    time: 0,
                    count: new ConstantValue(100),
                    cycle: 1,
                    interval: 0.01,
                    probability: 1,
                },*/
            ],

            shape: new PointEmitter(),
            material: new MeshBasicMaterial({
                map: this.texture,
                blending: AdditiveBlending,
                transparent: true,
                side: DoubleSide,
            }),
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
            renderMode: RenderMode.Mesh,
            renderOrder: 1,
        });
    }

    initScene() {
        this.scene = super.initScene();
        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        const loader = new FontLoader();

        loader.load( 'js/examples/fonts/helvetiker_regular.typeface.json', ( font ) => {

            const fontConfig = {
                font: font,
                size: 0.4,
                depth: 0.02,
                curveSegments: 8,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.04,
                bevelOffset: 0,
                bevelSegments: 2
            };

            this.texture = new TextureLoader().load('textures/texture1.png', (texture) => {
                this.texture.name = 'textures/texture1.png';

                let particles = this.initParticleSystem();
                particles.emitterShape = new PointEmitter();
                particles.emitter.name = 'Point';
                //particles.emitter.rotation.y = Math.PI / 2;
                particles.emitter.position.set(-5, -5, 2);
                this.batchRenderer.addSystem(particles);
                this.scene.add(particles.emitter);
                this.groups.push(particles.emitter);
                let text = new Mesh(
                    new TextGeometry('Point', fontConfig),
                    new MeshLambertMaterial({color: new Color(0x999999)})
                );
                text.position.set(-5, -7, 2);
                this.scene.add(text);

                particles = this.initParticleSystem();
                particles.emitterShape = new SphereEmitter({
                    radius: 1,
                    thickness: 0.2,
                    arc: Math.PI * 2,
                });
                particles.emitter.name = 'Sphere';
                //particles.emitter.rotation.y = Math.PI / 2;
                particles.emitter.position.set(-5, 0, 2);
                this.batchRenderer.addSystem(particles);
                this.scene.add(particles.emitter);
                this.groups.push(particles.emitter);
                text = new Mesh(
                    new TextGeometry('Sphere', fontConfig),
                    new MeshLambertMaterial({color: new Color(0x999999)})
                );
                text.position.set(-5, -2, 2);
                this.scene.add(text);

                particles = this.initParticleSystem();
                particles.emitterShape = new HemisphereEmitter({
                    radius: 1,
                    thickness: 0.2,
                    arc: Math.PI * 2,
                });
                particles.emitter.name = 'Hemisphere';
                particles.emitter.rotation.x = -Math.PI / 2;
                particles.emitter.position.set(-5, 5, 2);
                this.batchRenderer.addSystem(particles);
                this.scene.add(particles.emitter);
                this.groups.push(particles.emitter);
                text = new Mesh(
                    new TextGeometry('Hemisphere', fontConfig),
                    new MeshLambertMaterial({color: new Color(0x999999)})
                );
                text.position.set(-5, 3, 2);
                this.scene.add(text);

                particles = this.initParticleSystem();
                particles.emitterShape = new ConeEmitter({
                    radius: 1,
                    thickness: 1,
                    arc: Math.PI * 2,
                    angle: Math.PI / 4,
                });
                particles.emitter.name = 'Cone';
                particles.emitter.position.set(0, -5, 2);
                this.batchRenderer.addSystem(particles);
                this.scene.add(particles.emitter);
                this.groups.push(particles.emitter);
                text = new Mesh(
                    new TextGeometry('Cone', fontConfig),
                    new MeshLambertMaterial({color: new Color(0x999999)})
                );
                text.position.set(0, -7, 2);
                this.scene.add(text);

                particles = this.initParticleSystem();
                particles.emitterShape = new CircleEmitter({
                    radius: 1,
                    thickness: 0.2,
                    arc: Math.PI * 2,
                });
                particles.emitter.name = 'Circle';
                //particles.emitter.rotation.y = Math.PI / 2;
                particles.emitter.position.set(0, 0, 2);
                this.batchRenderer.addSystem(particles);
                this.scene.add(particles.emitter);
                this.groups.push(particles.emitter);
                text = new Mesh(
                    new TextGeometry('Circle', fontConfig),
                    new MeshLambertMaterial({color: new Color(0x999999)})
                );
                text.position.set(0, -2, 2);
                this.scene.add(text);

                particles = this.initParticleSystem();
                particles.emitterShape = new DonutEmitter({
                    radius: 2,
                    thickness: 1,
                    arc: Math.PI * 2,
                    donutRadius: 0.2,
                });
                particles.emitter.name = 'Donut';
                //particles.emitter.rotation.y = Math.PI / 2;
                particles.emitter.position.set(0, 5, 2);
                this.batchRenderer.addSystem(particles);
                this.scene.add(particles.emitter);
                this.groups.push(particles.emitter);
                text = new Mesh(
                    new TextGeometry('Donut', fontConfig),
                    new MeshLambertMaterial({color: new Color(0x999999)})
                );
                text.position.set(0, 3, 2);
                this.scene.add(text);

                particles = this.initParticleSystem();
                particles.emitterShape = new ConeEmitter({
                    radius: 1,
                    thickness: 0.2,
                    arc: Math.PI * 2,
                    angle: 0,
                    mode: EmitterMode.Loop,
                    spread: 0,
                    speed: new ConstantValue(3),
                });
                particles.emitter.name = 'Loop';
                //particles.emitter.rotation.y = Math.PI / 2;
                particles.emitter.position.set(5, -5, 2);
                this.batchRenderer.addSystem(particles);
                this.scene.add(particles.emitter);
                this.groups.push(particles.emitter);
                text = new Mesh(
                    new TextGeometry('Loop', fontConfig),
                    new MeshLambertMaterial({color: new Color(0x999999)})
                );
                text.position.set(5, -7, 2);
                this.scene.add(text);

                particles = this.initParticleSystem();
                particles.emitterShape = new GridEmitter({
                    width: 2,
                    height: 2,
                    rows: 10,
                    columns: 10,
                });
                particles.emitter.name = 'Grid';
                //particles.emitter.rotation.y = Math.PI / 2;
                particles.emitter.position.set(5, 0, 2);
                this.batchRenderer.addSystem(particles);
                this.scene.add(particles.emitter);
                this.groups.push(particles.emitter);
                text = new Mesh(
                    new TextGeometry('Grid', fontConfig),
                    new MeshLambertMaterial({color: new Color(0x999999)})
                );
                text.position.set(5, -2, 2);
                this.scene.add(text);
            });
        });
        return this.scene;
    }
}
