import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Color4} from '@babylonjs/core/Maths/math.color';
import {BatchedRenderer} from 'babylon.quarks';
import {babylonDemos} from './babylon/registry.js';

const GITHUB_BASE = 'https://github.com/Alchemist0823/three.quarks/blob/master/packages/quarks.examples/';
const canvas = document.getElementById('renderer-canvas');
const engine = new Engine(canvas, true);

let scene;
let camera;
let batchRenderer;
let systems = [];
let demoIndex = 0;
let activeDemo = null;
let demoState = {};
let loadToken = 0;
let frameCount = 0;
let lastFpsTime = performance.now();

function createBaseScene() {
    if (scene) {
        scene.dispose();
    }
    scene = new Scene(engine);
    scene.useRightHandedSystem = true;
    scene.clearColor = new Color4(0.05, 0.05, 0.08, 1);

    camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 20, BVector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.minZ = 0.1;
    new HemisphericLight('light', new BVector3(0, 1, 0), scene);

    batchRenderer = new BatchedRenderer('batchRenderer', scene);
    systems = [];
    demoState = {totalTime: 0, refreshIndex: 0};
}

function updateSourceLink() {
    const sourceLink = document.getElementById('source-link');
    if (sourceLink && activeDemo) {
        sourceLink.href = GITHUB_BASE + activeDemo.file;
    }
}

async function loadDemo(index) {
    const token = ++loadToken;
    createBaseScene();
    activeDemo = babylonDemos[index];
    try {
        await activeDemo.init({scene, camera, batchRenderer, systems, demoState});
        if (token !== loadToken) {
            return;
        }
        document.getElementById('demo-name').textContent = activeDemo.name;
        window.location.hash = '#' + activeDemo.key;
        updateSourceLink();
    } catch (e) {
        if (token !== loadToken) {
            return;
        }
        console.error('Error loading demo:', e);
        document.getElementById('demo-name').textContent = 'Error: ' + e.message;
    }
}

function nextDemo() {
    demoIndex = (demoIndex + 1) % babylonDemos.length;
    loadDemo(demoIndex);
}

function previousDemo() {
    demoIndex = (demoIndex - 1 + babylonDemos.length) % babylonDemos.length;
    loadDemo(demoIndex);
}

document.getElementById('nextBtn').addEventListener('click', nextDemo);
document.getElementById('previousBtn').addEventListener('click', previousDemo);

if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const hashIndex = babylonDemos.findIndex((demoItem) => demoItem.key === hash);
    if (hashIndex >= 0) {
        demoIndex = hashIndex;
    }
}

loadDemo(demoIndex);

engine.runRenderLoop(() => {
    if (!scene || !batchRenderer || !activeDemo) {
        return;
    }
    try {
        const delta = engine.getDeltaTime() / 1000;
        if (activeDemo.onFrame) {
            activeDemo.onFrame({scene, camera, batchRenderer, systems, demoState}, delta);
        }
        batchRenderer.update(delta);

        let totalParticles = 0;
        for (const system of systems) {
            totalParticles += system.particleNum;
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
