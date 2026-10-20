import {
    AdditiveBlending,
    AmbientLight,
    CapsuleGeometry,
    Clock,
    DirectionalLight,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    TextureLoader,
} from 'three';
import {WebGPURenderer} from 'three/webgpu';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {
    ConeEmitter,
    ConstantColor,
    ConstantValue,
    IntervalValue,
    ParticleSystem,
    QuarksLoader,
    QuarksUtil,
    RandomQuatGenerator,
    RenderMode,
    Vector4,
} from 'three.quarks';
import {NodeBatchedRenderer} from 'three.quarks/webgpu';

const renderer = new WebGPURenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new Scene();
scene.add(new AmbientLight(0xffffff, 0.5));
const light = new DirectionalLight(0xffffff, 2);
light.position.set(5, 10, 5);
scene.add(light);

const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 20);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// The same systems as with BatchedRenderer; its batches use node materials, which WebGPURenderer compiles.
const batchRenderer = new NodeBatchedRenderer();
scene.add(batchRenderer);

const effects = [];
const loader = new QuarksLoader();
for (const [url, x, scale] of [
    ['AcidBoiling.json', -8, 2],
    ['subEmitter2.json', 0, 1],
    ['ps.json', 8, 1],
]) {
    loader.load(url, (effect) => {
        effect.position.x = x;
        effect.scale.setScalar(scale);
        QuarksUtil.addToBatchRenderer(effect, batchRenderer);
        scene.add(effect);
        effects.push(effect);
    });
}

// A trail and lit mesh particles, as in trailDemo.js and meshMaterialDemo.js.
const trail = new ParticleSystem({
    duration: 3,
    looping: true,
    startLife: new IntervalValue(1.5, 2),
    startSpeed: new IntervalValue(6, 9),
    startSize: new ConstantValue(0.3),
    startColor: new ConstantColor(new Vector4(1, 0.6, 0.2, 1)),
    worldSpace: true,
    emissionOverTime: new ConstantValue(6),
    shape: new ConeEmitter({radius: 0.2, angle: 0.6}),
    material: new MeshBasicMaterial({
        map: new TextureLoader().load('textures/particle_default.png'),
        blending: AdditiveBlending,
        transparent: true,
    }),
    renderMode: RenderMode.Trail,
    rendererEmitterSettings: {startLength: new ConstantValue(20)},
});
trail.emitter.position.set(-4, -4, 4);
batchRenderer.addSystem(trail);
scene.add(trail.emitter);

const capsules = new ParticleSystem({
    duration: 1,
    looping: true,
    instancingGeometry: new CapsuleGeometry(1, 3),
    startLife: new IntervalValue(2, 3),
    startSpeed: new ConstantValue(2),
    startSize: new ConstantValue(0.15),
    startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
    startRotation: new RandomQuatGenerator(),
    worldSpace: true,
    emissionOverTime: new ConstantValue(30),
    shape: new ConeEmitter({radius: 0.1, angle: 1}),
    material: new MeshStandardMaterial({color: 0x999999, roughness: 0.3, metalness: 0.8}),
    renderMode: RenderMode.Mesh,
});
capsules.emitter.position.set(4, -4, 4);
batchRenderer.addSystem(capsules);
scene.add(capsules.emitter);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new Clock();
let elapsed = 0;
renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    elapsed += delta;
    if (elapsed > 3) {
        elapsed = 0;
        effects.forEach((effect) => QuarksUtil.restart(effect));
    }
    controls.update();
    batchRenderer.update(delta);
    renderer.render(scene, camera);
});
