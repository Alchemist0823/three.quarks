import './style.css'
import * as THREE from 'three';
import { BatchedRenderer, QuarksLoader, QuarksUtil } from 'three.quarks';
import { OrbitControls } from 'three-stdlib';
const scene = new THREE.Scene();

// Create floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    roughness: 0.8
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -6;
scene.add(floor);

// Add point light
const light = new THREE.PointLight(0xffffff, 100);
light.position.set(5, 10, 5);
scene.add(light);

// Add ambient light for better visibility
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const quarksLoader = new QuarksLoader();
const batchedRenderer = new BatchedRenderer();
scene.add(batchedRenderer);

// Handle file drag and drop
document.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
});

document.addEventListener('drop', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (!files?.length) return;

    const file = files[0];
    if (!file.name.endsWith('.json')) {
        console.warn('Please drop a JSON particle file');
        return;
    }

    try {
        const jsonContent = JSON.parse(await file.text());
        quarksLoader.parse(jsonContent, (obj) => {
            QuarksUtil.addToBatchRenderer(obj, batchedRenderer);
            scene.add(obj);
            QuarksUtil.restart(obj);
            console.log("loaded");
        });
    } catch (error) {
        console.error('Error loading particle file:', error);
    }
});

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.querySelector("#canvas") as HTMLCanvasElement });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const clock = new THREE.Clock();
function animate() {
    const deltaTime = clock.getDelta();
    batchedRenderer.update(deltaTime);
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();