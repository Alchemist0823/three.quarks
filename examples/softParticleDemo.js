import {Demo} from "./demo.js";
import {BatchedParticleRenderer,
    Bezier,
    ConstantColor,
    ParticleSystem,
    ConstantValue,
    FrameOverLife,
    ForceOverLife,
    RenderMode,
    PiecewiseBezier, PointEmitter} from "three.quarks";
import {
    DepthTexture,
    FloatType,
    Mesh, MeshBasicMaterial,
    NearestFilter,
    TorusKnotGeometry,
    WebGLRenderTarget,
    RGBAFormat, MeshStandardMaterial, Vector4, DoubleSide, TextureLoader, NormalBlending
} from "three";

export class SoftParticleDemo extends Demo {
    name = 'Soft Particle & Blend Tiles Demo';
    refreshTime = 2;

    constructor(camera, renderer) {
        super(camera, renderer);
    }

    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        // Create a multi render target with Float buffers
        this.target = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
        this.target.texture.format = RGBAFormat;
        this.target.texture.minFilter = NearestFilter;
        this.target.texture.magFilter = NearestFilter;
        this.target.texture.generateMipmaps = false;
        this.target.stencilBuffer = false;
        this.target.depthBuffer = true;
        this.target.depthTexture = new DepthTexture();
        this.target.depthTexture.type = FloatType;

        this.batchRenderer.setDepthTexture(this.target.depthTexture);

        // Our scene
        this.setupScene();

        // Setup post-processing step
        this.texture = new TextureLoader().load('textures/cfxr smoke cloud x4.png', (texture) => {
            this.setupPost();
        });

        this.onWindowResize();
        return this.scene;
    }

    deinitScene() {
        this.target.dispose();
    }

    setupPost() {
        const smoke = new ParticleSystem({
            duration: 2,
            looping: true,
            startLife: new ConstantValue(2.0),
            startSpeed: new ConstantValue(10),
            startSize: new ConstantValue(2),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: true,
            maxParticle: 1000,
            emissionOverTime: new ConstantValue(60),
            emissionBursts: [],
            blendTiles: true,
            softParticles: true,
            softFarFade: 1,
            softNearFade: 0,
            shape: new PointEmitter(),
            material: new MeshBasicMaterial({
                map: this.texture,
                blending: NormalBlending,
                transparent: true,
                side: DoubleSide,
            }),
            startTileIndex: new ConstantValue(0),
            uTileCount: 2,
            vTileCount: 2,
            renderOrder: 0,
            renderMode: RenderMode.BillBoard,
        });
        smoke.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(0, 1.33333, 2.66667, 4), 0]])));
        smoke.addBehavior(new ForceOverLife(new ConstantValue(0), new ConstantValue(-10), new ConstantValue(0)));
        smoke.emitter.name = 'beam';
        this.batchRenderer.addSystem(smoke);
        //this.groups.push(smoke.emitter);
        this.scene.add(smoke.emitter);

    }

    onWindowResize = () => {
        const dpr = this.renderer.getPixelRatio();
        this.target.setSize( window.innerWidth * dpr, window.innerHeight * dpr );
    }

    render(delta) {
        super.render(delta);

        // render scene into target
        this.renderer.setRenderTarget( this.target );
        this.renderer.render( this.scene, this.camera);
        this.renderer.setRenderTarget( null );
    }
}

