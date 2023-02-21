
import {
    Group,
    Scene,
    MeshBasicMaterial,
    PlaneBufferGeometry,
    PointLight,
    DoubleSide,
    FrontSide,
    BackSide,
    Mesh,
    Vector4,
    Vector3,
    Color,
    AdditiveBlending,
    NormalBlending,
    TextureLoader
} from "./js/three.module.js";
import {
    Bezier, ColorRange, ConstantValue, TurbulenceField,
    IntervalValue, PiecewiseBezier, ColorOverLife,
    RenderMode, SizeOverLife, ParticleSystem,
    ParticleEmitter, BatchedParticleRenderer, GridEmitter, ValueGeneratorFromJSON, loadPlugin, TextureSequencer, ApplySequences
} from "./js/three.quarks.esm.js";
import {Demo} from "./demo.js";


export class SequencerDemo extends Demo {

    name = "Texture Sequencer";
    initDemo() {

        const ps = new ParticleSystem({
            duration: 8,
            looping: true,
            startLife: new ConstantValue(7.8),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(0.05, 0.2),
            startColor: new ColorRange(new Vector4(0, 1, 1, 1), new Vector4(1, 0, 1, 1)),
            worldSpace: false,

            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{
                time: 0,
                count: 1500,
                cycle: 1,
                interval: 1,
                probability: 1,
            }],

            shape: new GridEmitter({width: 15, height: 15, column: 50, row: 50}),
            material: new MeshBasicMaterial({map: this.texture, blending: NormalBlending, transparent: true, side: FrontSide}),
            renderMode: RenderMode.BillBoard,
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        ps.emitter.name = 'ps';
        this.batchRenderer.addSystem(ps);

        let seq = new TextureSequencer(0.08, 0.08, new Vector3(-8, 1, 0));
        seq.fromImage(this.textTexture.image, 0.5);
        let seq2 = new TextureSequencer(0.08, 0.08, new Vector3(-4, 0, 0));
        seq2.fromImage(this.logoTexture.image, 0.3);
        let applySeq = new ApplySequences(0.001);
        applySeq.appendSequencer(new IntervalValue(1.0, 2.0), seq);
        applySeq.appendSequencer(new IntervalValue(5.0, 6.0), seq2);
        ps.addBehavior(applySeq);
        //ps.emitter.rotation.x = - Math.PI / 2;
        ps.emitter.position.y = 0;
        this.scene.add(ps.emitter);
    }

    finishLoading() {
        if (this.load1 && this.load2 && this.load3) {
            this.batchRenderer = new BatchedParticleRenderer();
            this.scene.add(this.batchRenderer);
            this.initDemo();
        }
    }
    initScene() {
        super.initScene();


        let loader = new TextureLoader();
        this.textTexture = loader.load("textures/text_texture.png", (texture) => {
            texture.name = "textures/text_texture.png";
            this.load1 = true;
            this.finishLoading();
        });
        this.texture = loader.load("textures/texture1.png", (texture) => {
            texture.name = "textures/texture1.png";
            this.load2 = true;
            this.finishLoading();
        });
        this.logoTexture = loader.load("textures/logo_texture.png", (texture) => {
            texture.name = "textures/logo_texture.png";
            this.load3 = true;
            this.finishLoading();
        });
        return this.scene;
    }
}
