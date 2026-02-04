import {
    Clock,
    PerspectiveCamera,
    WebGLRenderer,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import {MuzzleFlashDemo} from "./muzzleFlashDemo.js";
import {TrailDemo} from "./trailDemo.js";
import {TurbulenceDemo} from "./turbulenceDemo.js";
import {ExplosionDemo} from "./explosionDemo.js";
import {EmitterShapeDemo} from "./emitterShapeDemo.js";
import {CustomPluginDemo} from "./customPluginDemo.js";
import {SequencerDemo} from "./sequencerDemo.js";
import {MeshMaterialDemo} from "./meshMaterialDemo.js";
import {SubEmitterDemo} from "./subEmitterDemo.js";
import {AlphaTestDemo} from "./alphaTestDemo.js";
import {BillboardDemo} from "./billboardDemo.js";
import {SoftParticleDemo} from "./softParticleDemo.js";
import {CustomBlendingDemo} from "./customBlendingDemo.js";
import {FollowObjectDemo} from "./followObjectDemo.js";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const WEBGL = {
    isWebGLAvailable: function () {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    },
    getWebGLErrorMessage: function () {
        return this.getErrorMessage(1);
    },
    getErrorMessage: function (version) {
        const names = {
            1: 'WebGL',
            2: 'WebGL 2'
        };

        const contexts = {
            1: window.WebGLRenderingContext,
            2: window.WebGL2RenderingContext
        };

        let message = 'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>';

        const element = document.createElement('div');
        element.id = 'webglmessage';
        element.style.fontFamily = 'monospace';
        element.style.fontSize = '13px';
        element.style.fontWeight = 'normal';
        element.style.textAlign = 'center';
        element.style.background = '#fff';
        element.style.color = '#000';
        element.style.padding = '1.5em';
        element.style.width = '400px';
        element.style.margin = '5em auto 0';

        if (contexts[version]) {
            message = message.replace('$0', 'graphics card');
        } else {
            message = message.replace('$0', 'browser');
        }
        message = message.replace('$1', names[version]);
        element.innerHTML = message;

        return element;
    }
};

let renderer;
let camera;
let clock;
let controls;
let container;
let stats;
let scene;
let demo;

let demos = [MuzzleFlashDemo, ExplosionDemo, EmitterShapeDemo, TrailDemo, SequencerDemo, MeshMaterialDemo, SubEmitterDemo, TurbulenceDemo, AlphaTestDemo, CustomPluginDemo, BillboardDemo, SoftParticleDemo, CustomBlendingDemo, FollowObjectDemo];
let demoIndex = 0;

function init() {
    if (WEBGL.isWebGLAvailable() === false) {
        document.body.appendChild(WEBGL.getWebGLErrorMessage());
        return false;
    }

    container = document.getElementById('home');
    let canvas = document.getElementById('renderer-canvas');
    renderer = new WebGLRenderer({canvas: canvas});

    let width = container.width;
    let height = container.height;

    clock = new Clock();

    camera = new PerspectiveCamera(60, width / height, 1, 1000);

    controls = new OrbitControls(camera, renderer.domElement);
    camera.up.set(0, 1, 0);
    controls.enableKeys = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.2;
    controls.update();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    stats = new Stats();
    stats.dom.style.position = "absolute";
    stats.dom.style.left = "";
    stats.dom.style.right = "0";
    container.appendChild(stats.dom);

    window.addEventListener('resize', onResize, false);

    demoIndex = 0;
    if (window.location.hash) {
        let hash = window.location.hash.substring(1);
        for (let i = 0; i < demos.length; i++) {
            if (demos[i].name === hash) {
                demoIndex = i;
                break;
            }
        }
    }
    demo = new demos[demoIndex](camera, renderer, controls);
    document.querySelector("#demo-name").innerText = demo.name;
    scene = demo.initScene();

    document.getElementById("nextBtn").addEventListener("click", nextDemo, false);
    document.getElementById("previousBtn").addEventListener("click", previousDemo, false);

    onResize();
}

function onResize() {
    if (demo.onWindowResize)
        demo.onWindowResize();

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}

function render() {
    let delta = clock.getDelta();
    demo.render(delta);
    renderer.render(scene, camera);
}

function nextDemo() {
    demoIndex++;
    if (demoIndex >= demos.length) {
        demoIndex = 0;
    }
    window.location.hash = '#' + demos[demoIndex].name;
    if (demo && demo.deinitScene) {
        demo.deinitScene();
    }
    demo = new demos[demoIndex](camera, renderer, controls);
    document.querySelector("#demo-name").innerText = demo.name;
    scene = demo.initScene();
}

function previousDemo() {
    demoIndex--;
    if (demoIndex < 0) {
        demoIndex = demos.length - 1;
    }
    if (demo && demo.deinitScene) {
        demo.deinitScene();
    }
    demo = new demos[demoIndex](camera, renderer, controls);
    document.querySelector("#demo-name").innerText = demo.name;
    scene = demo.initScene();
}

init();
animate();
