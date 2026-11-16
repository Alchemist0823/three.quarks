import {Clock, PerspectiveCamera} from 'three';
import {WebGPURenderer} from 'three/webgpu';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {
    WebGPUBatchedRenderer,
    createPerformanceProfile,
    getRecommendedRendererSettings,
    ParticleEmitter,
} from 'three.quarks/webgpu';
import {MuzzleFlashDemo} from './muzzleFlashDemo.js';
import {TrailDemo} from './trailDemo.js';
import {TurbulenceDemo} from './turbulenceDemo.js';
import {ExplosionDemo} from './explosionDemo.js';
import {EmitterShapeDemo} from './emitterShapeDemo.js';
import {CustomPluginDemo} from './customPluginDemo.js';
import {SequencerDemo} from './sequencerDemo.js';
import {MeshMaterialDemo} from './meshMaterialDemo.js';
import {SubEmitterDemo} from './subEmitterDemo.js';
import {AlphaTestDemo} from './alphaTestDemo.js';
import {BillboardDemo} from './billboardDemo.js';
import {SoftParticleDemo} from './softParticleDemo.js';
import {CustomBlendingDemo} from './customBlendingDemo.js';
import {FollowObjectDemo} from './followObjectDemo.js';

/*
 * Same demos as vanilla.html, rendered with three.js WebGPURenderer + three.quarks/webgpu.
 *
 * URL parameters:
 *   ?target=desktop|mobile|auto   performance profile of the particle renderer (default: auto)
 *   ?forceWebGL=1                 run WebGPURenderer on its WebGL2 backend (fallback path)
 */
const params = new URLSearchParams(window.location.search);
// the target buttons also remember the choice, for hosts that drop query strings
function stored(key) {
    try {
        return window.localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}
function store(key, value) {
    try {
        window.localStorage.setItem(key, value);
    } catch (e) {
        // storage unavailable (private mode, sandbox): the query string still works
    }
}
const requestedTarget = params.get('target') ?? stored('quarks.target') ?? 'auto';
const forceWebGL = (params.get('forceWebGL') ?? stored('quarks.forceWebGL')) === '1';

const demos = [
    MuzzleFlashDemo,
    ExplosionDemo,
    EmitterShapeDemo,
    TrailDemo,
    SequencerDemo,
    MeshMaterialDemo,
    SubEmitterDemo,
    TurbulenceDemo,
    AlphaTestDemo,
    CustomPluginDemo,
    BillboardDemo,
    SoftParticleDemo,
    CustomBlendingDemo,
    FollowObjectDemo,
];
const demoFiles = [
    'muzzleFlashDemo.js',
    'explosionDemo.js',
    'emitterShapeDemo.js',
    'trailDemo.js',
    'sequencerDemo.js',
    'meshMaterialDemo.js',
    'subEmitterDemo.js',
    'turbulenceDemo.js',
    'alphaTestDemo.js',
    'customPluginDemo.js',
    'billboardDemo.js',
    'softParticleDemo.js',
    'customBlendingDemo.js',
    'followObjectDemo.js',
];
const GITHUB_BASE = 'https://github.com/Alchemist0823/three.quarks/blob/master/packages/quarks.examples/';

let renderer, camera, clock, controls, scene, demo;
let demoIndex = 0;
const profile = createPerformanceProfile({target: requestedTarget});

// frame statistics for the HUD
const frameStats = {frames: 0, cpu: 0, elapsed: 0};

function countParticles(root) {
    let count = 0;
    root.traverse((object) => {
        if (object instanceof ParticleEmitter) count += object.system.particleNum;
    });
    return count;
}

function updateHud() {
    const hud = document.getElementById('hud');
    if (!hud || frameStats.frames === 0) return;
    const fps = (frameStats.frames / frameStats.elapsed).toFixed(0);
    const cpu = (frameStats.cpu / frameStats.frames).toFixed(2);
    const backend = renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2 (fallback)';
    hud.innerText =
        `${backend} · target: ${profile.target}${requestedTarget === 'auto' ? ' (auto)' : ''}\n` +
        `${fps} fps · CPU ${cpu} ms/frame\n` +
        `draw calls ${renderer.info.render.drawCalls} · particles ${countParticles(scene)}`;
    frameStats.frames = 0;
    frameStats.cpu = 0;
    frameStats.elapsed = 0;
}

function createDemo(index) {
    if (demo && demo.deinitScene) demo.deinitScene();
    if (demo && demo.batchRenderer && demo.batchRenderer.dispose) demo.batchRenderer.dispose();
    demoIndex = (index + demos.length) % demos.length;
    demo = new demos[demoIndex](camera, renderer, controls, {
        BatchedRenderer: WebGPUBatchedRenderer,
        batchRendererOptions: {target: requestedTarget},
    });
    document.querySelector('#demo-name').innerText = demo.name;
    document.getElementById('source-link').href = GITHUB_BASE + demoFiles[demoIndex];
    scene = demo.initScene();
}

async function init() {
    const canvas = document.getElementById('renderer-canvas');
    const recommended = getRecommendedRendererSettings(profile);
    renderer = new WebGPURenderer({canvas, forceWebGL, ...recommended.parameters});
    await renderer.init();
    renderer.setPixelRatio(recommended.pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    clock = new Clock();
    camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    controls = new OrbitControls(camera, renderer.domElement);
    camera.up.set(0, 1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.2;
    controls.update();

    window.addEventListener('resize', onResize, false);

    let startIndex = 0;
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const found = demos.findIndex((d) => d.name === hash);
        if (found >= 0) startIndex = found;
    }
    createDemo(startIndex);

    document.getElementById('nextBtn').addEventListener('click', () => {
        createDemo(demoIndex + 1);
        window.location.hash = '#' + demos[demoIndex].name;
    });
    document.getElementById('previousBtn').addEventListener('click', () => {
        createDemo(demoIndex - 1);
        window.location.hash = '#' + demos[demoIndex].name;
    });
    for (const button of document.querySelectorAll('[data-target]')) {
        const target = button.getAttribute('data-target');
        button.classList.toggle('active', target === requestedTarget);
        button.addEventListener('click', () => {
            store('quarks.target', target);
            const url = new URL(window.location.href);
            url.searchParams.set('target', target);
            window.location.href = url.toString();
        });
    }
    for (const button of document.querySelectorAll('[data-backend]')) {
        const backend = button.getAttribute('data-backend');
        button.classList.toggle('active', (backend === 'webgl2') === forceWebGL);
        button.addEventListener('click', () => {
            store('quarks.forceWebGL', backend === 'webgl2' ? '1' : '0');
            const url = new URL(window.location.href);
            url.searchParams.set('forceWebGL', backend === 'webgl2' ? '1' : '0');
            window.location.href = url.toString();
        });
    }

    onResize();
    setInterval(updateHud, 500);
    renderer.setAnimationLoop(render);
}

function onResize() {
    if (demo.onWindowResize) demo.onWindowResize();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    const delta = Math.min(clock.getDelta(), 0.1);
    const t0 = performance.now();
    demo.render(delta);
    renderer.render(scene, camera);
    frameStats.cpu += performance.now() - t0;
    frameStats.elapsed += delta;
    frameStats.frames++;
}

// expose for debugging / automated testing
window.quarksApp = {
    get renderer() {
        return renderer;
    },
    get demo() {
        return demo;
    },
    get scene() {
        return scene;
    },
    demos,
    goTo: (index) => createDemo(index),
    profile,
};

init().catch((error) => {
    console.error(error);
    document.getElementById('demo-name').innerText = 'WebGPURenderer failed to initialize: ' + error;
});
