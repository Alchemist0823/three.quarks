import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {PointLight} from '@babylonjs/core/Lights/pointLight';
import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Color3, Color4} from '@babylonjs/core/Maths/math.color';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';

import {
    BatchedRenderer,
    ParticleSystem,
    RenderMode,
    ConstantValue,
    IntervalValue,
    ConstantColor,
    PointEmitter,
    ConeEmitter,
    SphereEmitter,
    SizeOverLife,
    ColorOverLife,
    RotationOverLife,
    SpeedOverLife,
    FrameOverLife,
    ForceOverLife,
    PiecewiseBezier,
    Bezier,
    ColorRange,
    RandomColor,
    Vector4,
} from 'babylon.quarks';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});

let scene;
let camera;
let batchRenderer;
let systems = [];
let demoIndex = 0;

class BabylonDemo {
    constructor(name, initFn) {
        this.name = name;
        this.initFn = initFn;
    }
}

function createBaseScene() {
    if (scene) scene.dispose();
    scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 1);

    camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 20, BVector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.minZ = 0.1;
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 50;

    const hemiLight = new HemisphericLight('hemiLight', new BVector3(0, 1, 0), scene);
    hemiLight.intensity = 0.3;

    const pointLight = new PointLight('pointLight', new BVector3(0, 5, 5), scene);
    pointLight.intensity = 100;

    const ground = MeshBuilder.CreateGround('ground', {width: 40, height: 40}, scene);
    const groundMat = new StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new Color3(0.1, 0.1, 0.1);
    ground.material = groundMat;
    ground.position.y = -5;

    batchRenderer = new BatchedRenderer('batchRenderer', scene);
    systems = [];

    return scene;
}

function fountainDemo() {
    createBaseScene();
    camera.setPosition(new BVector3(0, 8, 15));

    const fountain = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new IntervalValue(1.5, 3),
        startSpeed: new IntervalValue(5, 10),
        startSize: new IntervalValue(0.1, 0.3),
        startColor: new ConstantColor(new Vector4(0.2, 0.5, 1.0, 1.0)),
        emissionOverTime: new ConstantValue(100),
        shape: new ConeEmitter({angle: 0.1, radius: 0.1}),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        behaviors: [
            new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.4, 0), 0]])),
        ],
    });
    fountain.emitter.position = new BVector3(0, 0, 0);
    batchRenderer.addSystem(fountain);
    systems.push(fountain);

    const splash = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new IntervalValue(0.5, 1),
        startSpeed: new IntervalValue(1, 3),
        startSize: new IntervalValue(0.05, 0.15),
        startColor: new ConstantColor(new Vector4(0.4, 0.7, 1.0, 0.8)),
        emissionOverTime: new ConstantValue(50),
        shape: new SphereEmitter({radius: 0.5}),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        behaviors: [
            new SizeOverLife(new PiecewiseBezier([[new Bezier(0.5, 1, 0.8, 0), 0]])),
        ],
    });
    splash.emitter.position = new BVector3(0, -2, 0);
    batchRenderer.addSystem(splash);
    systems.push(splash);
}

function fireDemo() {
    createBaseScene();
    camera.setPosition(new BVector3(0, 5, 12));

    const fire = new ParticleSystem({
        scene,
        duration: 3,
        looping: true,
        startLife: new IntervalValue(0.5, 1.5),
        startSpeed: new IntervalValue(2, 5),
        startSize: new IntervalValue(0.3, 0.8),
        startColor: new RandomColor(
            new Vector4(1.0, 0.3, 0.0, 1.0),
            new Vector4(1.0, 0.7, 0.1, 1.0)
        ),
        emissionOverTime: new ConstantValue(80),
        shape: new ConeEmitter({angle: 0.2, radius: 0.3}),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        behaviors: [
            new SizeOverLife(new PiecewiseBezier([[new Bezier(0.2, 1, 0.8, 0), 0]])),
            new ColorOverLife(new ColorRange(
                new Vector4(1, 0.5, 0.1, 1),
                new Vector4(0.5, 0.1, 0.0, 0)
            )),
        ],
    });
    fire.emitter.position = new BVector3(0, 0, 0);
    batchRenderer.addSystem(fire);
    systems.push(fire);

    const smoke = new ParticleSystem({
        scene,
        duration: 3,
        looping: true,
        startLife: new IntervalValue(1, 2.5),
        startSpeed: new IntervalValue(0.5, 2),
        startSize: new IntervalValue(0.5, 1.5),
        startColor: new RandomColor(
            new Vector4(0.3, 0.3, 0.3, 0.3),
            new Vector4(0.5, 0.5, 0.5, 0.5)
        ),
        emissionOverTime: new ConstantValue(30),
        shape: new ConeEmitter({angle: 0.3, radius: 0.2}),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        behaviors: [
            new SizeOverLife(new PiecewiseBezier([[new Bezier(0.5, 1, 1.5, 2), 0]])),
            new ColorOverLife(new ColorRange(
                new Vector4(0.4, 0.4, 0.4, 0.4),
                new Vector4(0.2, 0.2, 0.2, 0)
            )),
            new RotationOverLife(new IntervalValue(-0.5, 0.5)),
        ],
    });
    smoke.emitter.position = new BVector3(0, 2, 0);
    batchRenderer.addSystem(smoke);
    systems.push(smoke);

    const embers = new ParticleSystem({
        scene,
        duration: 3,
        looping: true,
        startLife: new IntervalValue(1, 3),
        startSpeed: new IntervalValue(1, 4),
        startSize: new ConstantValue(0.05),
        startColor: new RandomColor(
            new Vector4(1, 0.8, 0.2, 1),
            new Vector4(1, 0.4, 0.1, 1)
        ),
        emissionOverTime: new ConstantValue(20),
        shape: new SphereEmitter({radius: 0.5}),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        behaviors: [
            new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1, 0.5, 0), 0]])),
        ],
    });
    embers.emitter.position = new BVector3(0, 0.5, 0);
    batchRenderer.addSystem(embers);
    systems.push(embers);
}

function explosionDemo() {
    createBaseScene();
    camera.setPosition(new BVector3(0, 8, 18));

    const core = new ParticleSystem({
        scene,
        duration: 1,
        looping: true,
        startLife: new IntervalValue(0.3, 0.8),
        startSpeed: new IntervalValue(5, 15),
        startSize: new IntervalValue(0.3, 0.8),
        startColor: new RandomColor(
            new Vector4(1, 0.8, 0.2, 1),
            new Vector4(1, 0.3, 0.0, 1)
        ),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{time: 0, count: new ConstantValue(50), cycle: 1, interval: 1, probability: 1}],
        shape: new SphereEmitter({radius: 0.1}),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        behaviors: [
            new SizeOverLife(new PiecewiseBezier([[new Bezier(0.5, 1, 0.8, 0), 0]])),
            new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.5, 0.2, 0), 0]])),
        ],
    });
    core.emitter.position = new BVector3(0, 2, 0);
    batchRenderer.addSystem(core);
    systems.push(core);

    const shockwave = new ParticleSystem({
        scene,
        duration: 1,
        looping: true,
        startLife: new ConstantValue(0.5),
        startSpeed: new IntervalValue(8, 12),
        startSize: new IntervalValue(0.1, 0.2),
        startColor: new ConstantColor(new Vector4(1, 0.6, 0.2, 0.8)),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{time: 0, count: new ConstantValue(30), cycle: 1, interval: 1, probability: 1}],
        shape: new SphereEmitter({radius: 0.3}),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        behaviors: [
            new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.3, 0), 0]])),
        ],
    });
    shockwave.emitter.position = new BVector3(0, 2, 0);
    batchRenderer.addSystem(shockwave);
    systems.push(shockwave);
}

function galaxyDemo() {
    createBaseScene();
    camera.setPosition(new BVector3(0, 12, 15));

    const spiral1 = new ParticleSystem({
        scene,
        duration: 10,
        looping: true,
        startLife: new IntervalValue(3, 6),
        startSpeed: new IntervalValue(0.5, 2),
        startSize: new IntervalValue(0.05, 0.15),
        startColor: new RandomColor(
            new Vector4(0.3, 0.5, 1, 1),
            new Vector4(0.8, 0.4, 1, 1)
        ),
        emissionOverTime: new ConstantValue(100),
        shape: new SphereEmitter({radius: 3}),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        behaviors: [
            new SizeOverLife(new PiecewiseBezier([[new Bezier(0.5, 1, 1, 0.5), 0]])),
            new ColorOverLife(new ColorRange(
                new Vector4(0.5, 0.7, 1, 1),
                new Vector4(0.8, 0.3, 1, 0)
            )),
        ],
    });
    spiral1.emitter.position = new BVector3(0, 0, 0);
    batchRenderer.addSystem(spiral1);
    systems.push(spiral1);

    const center = new ParticleSystem({
        scene,
        duration: 10,
        looping: true,
        startLife: new IntervalValue(1, 2),
        startSpeed: new ConstantValue(0.1),
        startSize: new IntervalValue(0.1, 0.3),
        startColor: new ConstantColor(new Vector4(1, 1, 0.8, 1)),
        emissionOverTime: new ConstantValue(30),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        behaviors: [
            new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1.5, 1, 0), 0]])),
        ],
    });
    center.emitter.position = new BVector3(0, 0, 0);
    batchRenderer.addSystem(center);
    systems.push(center);
}

function snowDemo() {
    createBaseScene();
    camera.setPosition(new BVector3(0, 5, 15));

    const snow = new ParticleSystem({
        scene,
        duration: 10,
        looping: true,
        startLife: new IntervalValue(4, 8),
        startSpeed: new IntervalValue(0.5, 2),
        startSize: new IntervalValue(0.05, 0.15),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 0.9)),
        emissionOverTime: new ConstantValue(100),
        shape: new SphereEmitter({radius: 10}),
        renderMode: RenderMode.BillBoard,
        transparent: true,
        worldSpace: true,
        behaviors: [
            new RotationOverLife(new IntervalValue(-1, 1)),
        ],
    });
    snow.emitter.position = new BVector3(0, 10, 0);
    batchRenderer.addSystem(snow);
    systems.push(snow);
}

const demos = [
    new BabylonDemo('Fountain', fountainDemo),
    new BabylonDemo('Fire & Smoke', fireDemo),
    new BabylonDemo('Explosion', explosionDemo),
    new BabylonDemo('Galaxy', galaxyDemo),
    new BabylonDemo('Snow', snowDemo),
];

function loadDemo(index) {
    demos[index].initFn();
    document.getElementById('demo-name').textContent = demos[index].name;
}

function nextDemo() {
    demoIndex = (demoIndex + 1) % demos.length;
    loadDemo(demoIndex);
}

function previousDemo() {
    demoIndex = (demoIndex - 1 + demos.length) % demos.length;
    loadDemo(demoIndex);
}

document.getElementById('nextBtn').addEventListener('click', nextDemo);
document.getElementById('previousBtn').addEventListener('click', previousDemo);

loadDemo(0);

let lastTime = performance.now();
let frameCount = 0;
let fpsDisplay = 0;

engine.runRenderLoop(() => {
    const delta = engine.getDeltaTime() / 1000;
    batchRenderer.update(delta);

    let totalParticles = 0;
    for (const sys of systems) {
        totalParticles += sys.particleNum;
    }
    document.getElementById('particleCount').textContent = totalParticles.toString();

    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        fpsDisplay = frameCount;
        frameCount = 0;
        lastTime = now;
        document.getElementById('fps').textContent = fpsDisplay.toString();
    }

    scene.render();
});

window.addEventListener('resize', () => engine.resize());
