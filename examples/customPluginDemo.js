
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
    ParticleEmitter, BatchedParticleRenderer, GridEmitter, ValueGeneratorFromJSON, loadPlugin
} from "./js/three.quarks.esm.js";
import {Demo} from "./demo.js";


export class SinWave {

    type = 'SinWave';
    frequency = 1;
    height = 10;
    waveSize = 1;
    time = 0;

    constructor(frequency, height, waveSize) {
        this.frequency = frequency;
        this.height = height;
        this.waveSize = waveSize;
        this.time = 0;
    }

    initialize(particle) {
    }

    update(particle, delta) {
        let height = this.height.genValue(particle.age / particle.life);
        particle.position.z = Math.sin(this.time * this.frequency.genValue(particle.age / particle.life) + (particle.position.x + particle.position.y) * (1 / this.waveSize)) * height - height / 2;
    }

    frameUpdate(delta) {
        this.time += delta;
    }

    toJSON() {
        return {
            type: this.type,
            frequency: this.frequency.toJSON(),
            height: this.height.toJSON(),
            waveSize: this.waveSize,
        };
    }

    static fromJSON(json) {
        return new SinWave(ValueGeneratorFromJSON(json.frequency), ValueGeneratorFromJSON(json.height), json.waveSize);
    }

    clone() {
        return new SinWave(this.frequency.clone(), this.height.clone(), this.waveSize);
    }
}

export class CustomPluginDemo extends Demo {

    name = "Customized Plugin";
    initDemo() {

        let plugin = {
            id: "MyPlugin",
            initialize: () => {

            },
            emitterShapes: [],
            behaviors: [{type: "SinWave", constructor: SinWave, params: [["frequency", "valueFunc"], ["height", "valueFunc"], ["waveSize", "number"]], loadJSON: SinWave.fromJSON}],
        };
        loadPlugin(plugin);

        const ps = new ParticleSystem(this.batchRenderer, {
            duration: 10000,
            looping: false,
            startLife: new ConstantValue(10000),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(0.1),
            startColor: new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 1)),
            worldSpace: false,

            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{
                time: 0,
                count: 2500,
                cycle: 1,
                interval: 1,
                probability: 1,
            }],

            shape: new GridEmitter({width: 20, height: 20, column: 50, row: 50}),
            texture: this.texture,
            blending: AdditiveBlending,
            renderMode: RenderMode.BillBoard,
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        ps.emitter.name = 'ps';
        ps.addBehavior(new SinWave( new ConstantValue(2),  new ConstantValue(5), 5));
        //ps.emitter.rotation.x = - Math.PI / 2;
        ps.emitter.position.y = 0;
        ps.emitter.scale.set(0.8, 0.8, 0.8);
        this.scene.add(ps.emitter);
    }

    initScene() {
        super.initScene();

        this.texture = new TextureLoader().load("textures/texture1.png", (texture) => {
            this.texture.name = "textures/texture1.png";
            this.batchRenderer = new BatchedParticleRenderer();
            this.scene.add(this.batchRenderer);

            this.initDemo();
        });
        return this.scene;
    }
}
