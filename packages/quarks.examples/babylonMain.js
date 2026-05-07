import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Color4} from '@babylonjs/core/Maths/math.color';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {Constants} from '@babylonjs/core/Engines/constants';

import {
    BatchedRenderer,
    ParticleSystem,
    QuarksLoader,
    QuarksUtil,
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
    FrameOverLife,
    ApplyForce,
    PiecewiseBezier,
    Bezier,
    ColorRange,
    RandomColor,
    Vector4,
    Vector3,
} from 'babylon.quarks';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);

let scene;
let camera;
let batchRenderer;
let systems = [];
let demoIndex = 0;

function createBaseScene() {
    if (scene) scene.dispose();
    scene = new Scene(engine);
    scene.clearColor = new Color4(0.05, 0.05, 0.08, 1);

    camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 20, BVector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.minZ = 0.1;

    new HemisphericLight('light', new BVector3(0, 1, 0), scene);

    batchRenderer = new BatchedRenderer('batchRenderer', scene);
    systems = [];
}

function muzzleFlashDemo() {
    createBaseScene();
    camera.setPosition(new BVector3(0, 10, 10));

    const texture = new Texture('textures/texture1.png', scene);

    for (let i = 0; i < 100; i++) {
        const posX = Math.floor(i / 10) * 2 - 10;
        const posZ = (i % 10) * 2 - 10;

        const beam = new ParticleSystem({
            scene,
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.1, 0.2),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(4),
            startColor: new ConstantColor(new Vector4(1, 0.585716, 0.1691176, 1)),
            worldSpace: false,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{time: 0, count: new ConstantValue(1), cycle: 1, interval: 0.01, probability: 1}],
            shape: new PointEmitter(),
            renderMode: RenderMode.BillBoard,
            texture,
            transparent: true,
            blendMode: Constants.ALPHA_ADD,
            startTileIndex: new ConstantValue(1),
            uTileCount: 10,
            vTileCount: 10,
        });
        beam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        beam.emitter.position = new BVector3(posX, 0, posZ);
        batchRenderer.addSystem(beam);
        systems.push(beam);

        const flash = new ParticleSystem({
            scene,
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.1, 0.2),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(1, 2.5),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: false,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{time: 0, count: new ConstantValue(2), cycle: 1, interval: 0.01, probability: 1}],
            shape: new PointEmitter(),
            renderMode: RenderMode.BillBoard,
            texture,
            transparent: true,
            blendMode: Constants.ALPHA_ADD,
            startTileIndex: new ConstantValue(81),
            uTileCount: 10,
            vTileCount: 10,
        });
        flash.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 0.95, 0.82, 1), new Vector4(1, 0.38, 0.12, 1))));
        flash.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(81, 84.333, 87.666, 91), 0]])));
        flash.emitter.position = new BVector3(posX, 0, posZ);
        batchRenderer.addSystem(flash);
        systems.push(flash);

        const smoke = new ParticleSystem({
            scene,
            duration: 2.5,
            looping: false,
            startLife: new IntervalValue(0.6, 0.8),
            startSpeed: new IntervalValue(0.1, 3),
            startSize: new IntervalValue(0.75, 1.5),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new RandomColor(new Vector4(0.6323, 0.6323, 0.6323, 0.31), new Vector4(1, 1, 1, 0.54)),
            worldSpace: true,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{time: 0, count: new ConstantValue(5), cycle: 1, interval: 0.01, probability: 1}],
            shape: new ConeEmitter({angle: (20 * Math.PI) / 180, radius: 0.3, thickness: 1, arc: Math.PI * 2}),
            renderMode: RenderMode.BillBoard,
            texture,
            transparent: true,
            blendMode: Constants.ALPHA_COMBINE,
            startTileIndex: new ConstantValue(81),
            uTileCount: 10,
            vTileCount: 10,
        });
        smoke.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 0))));
        smoke.addBehavior(new RotationOverLife(new IntervalValue(-Math.PI / 4, Math.PI / 4)));
        smoke.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(28, 31, 34, 37), 0]])));
        smoke.emitter.position = new BVector3(posX, 0, posZ);
        batchRenderer.addSystem(smoke);
        systems.push(smoke);

        const particles = new ParticleSystem({
            scene,
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.2, 0.6),
            startSpeed: new IntervalValue(1, 15),
            startSize: new IntervalValue(0.1, 0.3),
            startColor: new RandomColor(new Vector4(1, 0.91, 0.51, 1), new Vector4(1, 0.44, 0.16, 1)),
            worldSpace: true,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{time: 0, count: new ConstantValue(8), cycle: 1, interval: 0.01, probability: 1}],
            shape: new ConeEmitter({angle: (20 * Math.PI) / 180, radius: 0.3, thickness: 1, arc: Math.PI * 2}),
            renderMode: RenderMode.StretchedBillBoard,
            speedFactor: 0.4,
            texture,
            transparent: true,
            blendMode: Constants.ALPHA_ADD,
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
        });
        particles.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        particles.emitter.position = new BVector3(posX, 0, posZ);
        batchRenderer.addSystem(particles);
        systems.push(particles);
    }
}

function emitterShapeDemo() {
    createBaseScene();
    camera.setPosition(new BVector3(0, 8, 15));

    const texture = new Texture('textures/texture1.png', scene);

    const cone = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new IntervalValue(1, 2),
        startSpeed: new IntervalValue(2, 5),
        startSize: new IntervalValue(0.2, 0.5),
        startColor: new ConstantColor(new Vector4(1, 0.8, 0.2, 1)),
        emissionOverTime: new ConstantValue(60),
        shape: new ConeEmitter({angle: 0.5, radius: 0.5}),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        startTileIndex: new ConstantValue(0),
        uTileCount: 10,
        vTileCount: 10,
    });
    cone.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.4, 0), 0]])));
    cone.emitter.position = new BVector3(-4, 0, 0);
    batchRenderer.addSystem(cone);
    systems.push(cone);

    const sphere = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new IntervalValue(1, 3),
        startSpeed: new IntervalValue(1, 3),
        startSize: new IntervalValue(0.1, 0.3),
        startColor: new ConstantColor(new Vector4(0.2, 0.8, 1, 1)),
        emissionOverTime: new ConstantValue(60),
        shape: new SphereEmitter({radius: 1}),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        startTileIndex: new ConstantValue(0),
        uTileCount: 10,
        vTileCount: 10,
    });
    sphere.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1, 0.5, 0), 0]])));
    sphere.emitter.position = new BVector3(4, 0, 0);
    batchRenderer.addSystem(sphere);
    systems.push(sphere);

    const point = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new IntervalValue(0.5, 1.5),
        startSpeed: new IntervalValue(3, 8),
        startSize: new IntervalValue(0.2, 0.5),
        startColor: new RandomColor(new Vector4(1, 0.3, 0.1, 1), new Vector4(1, 0.8, 0.2, 1)),
        emissionOverTime: new ConstantValue(80),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        startTileIndex: new ConstantValue(0),
        uTileCount: 10,
        vTileCount: 10,
    });
    point.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.3, 0), 0]])));
    point.addBehavior(new ApplyForce(new Vector3(0, -1, 0), new ConstantValue(5)));
    point.emitter.position = new BVector3(0, 0, 0);
    batchRenderer.addSystem(point);
    systems.push(point);
}

function trailDemo() {
    createBaseScene();
    camera.setPosition(new BVector3(0, 5, 20));

    const texture = new Texture('textures/texture1.png', scene);

    const trail = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new IntervalValue(2, 3),
        startSpeed: new IntervalValue(5, 10),
        startSize: new ConstantValue(0.5),
        startColor: new ColorRange(new Vector4(1, 0.5, 0.1, 1), new Vector4(1, 0.8, 0.3, 1)),
        worldSpace: false,
        emissionOverTime: new ConstantValue(5),
        shape: new ConeEmitter({radius: 0.1, angle: 0.8}),
        renderMode: RenderMode.Trail,
        rendererEmitterSettings: {startLength: new ConstantValue(20), followLocalOrigin: false},
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        startTileIndex: new ConstantValue(0),
        uTileCount: 10,
        vTileCount: 10,
    });
    trail.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
    trail.addBehavior(new ApplyForce(new Vector3(0, -1, 0), new ConstantValue(10)));
    trail.emitter.position = new BVector3(0, 3, 0);
    batchRenderer.addSystem(trail);
    systems.push(trail);
}

async function explosionDemo() {
    createBaseScene();
    camera.setPosition(new BVector3(0, 10, 15));

    try {
        const loader = new QuarksLoader(scene, {baseUrl: ''});
        const effect = await loader.load('ps.json');
        effect.parent = batchRenderer;

        const traverse = (node) => {
            if (node.system) {
                batchRenderer.addSystem(node.system);
                systems.push(node.system);
                // Make it loop so we see the effect continuously
                node.system.looping = true;
                node.system.restart();
                node.system.play();
            }
            for (const child of node.getChildren()) {
                traverse(child);
            }
        };
        traverse(effect);

        document.getElementById('demo-name').textContent = 'Explosion (JSON Loaded)';
    } catch (e) {
        console.error('Failed to load explosion JSON:', e);
        document.getElementById('demo-name').textContent = 'Error: ' + e.message;
    }
}

let totalTime = 0;
let refreshIndex = 0;
const refreshTime = 1;

const demos = [
    {name: 'Muzzle Flash Performance', init: muzzleFlashDemo},
    {name: 'Emitter Shapes', init: emitterShapeDemo},
    {name: 'Trail Renderer', init: trailDemo},
    {name: 'Explosion (JSON)', init: explosionDemo},
];

function loadDemo(index) {
    totalTime = 0;
    refreshIndex = 0;
    try {
        demos[index].init();
        document.getElementById('demo-name').textContent = demos[index].name;
    } catch (e) {
        console.error('Error loading demo:', e);
        document.getElementById('demo-name').textContent = 'Error: ' + e.message;
    }
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

let lastFpsTime = performance.now();
let frameCount = 0;

engine.runRenderLoop(() => {
    try {
        const delta = engine.getDeltaTime() / 1000;

        // Restart muzzle flash systems periodically
        if (demoIndex === 0) {
            const numGroups = Math.floor(systems.length / 4);
            while (Math.floor((totalTime / refreshTime) * numGroups) >= refreshIndex) {
                if (refreshIndex < numGroups) {
                    for (let s = refreshIndex * 4; s < refreshIndex * 4 + 4 && s < systems.length; s++) {
                        systems[s].restart();
                        systems[s].play();
                    }
                }
                refreshIndex++;
            }
            totalTime += delta;
            if (totalTime > refreshTime) {
                totalTime = 0;
                refreshIndex = 0;
            }
        }

        batchRenderer.update(delta);

        let totalParticles = 0;
        for (const sys of systems) {
            totalParticles += sys.particleNum;
        }
        document.getElementById('particleCount').textContent = totalParticles.toString();

        frameCount++;
        const now = performance.now();
        if (now - lastFpsTime >= 1000) {
            document.getElementById('fps').textContent = frameCount.toString();
            frameCount = 0;
            lastFpsTime = now;
        }

        scene.render();
    } catch (e) {
        console.error('Render error:', e);
    }
});

window.addEventListener('resize', () => engine.resize());
