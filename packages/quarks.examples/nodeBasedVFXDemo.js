import {ConstantInput, Node, NodeGraph, NodeTypes, NodeValueType, NodeVFX, Wire} from 'quarks.nodes';
import {RenderMode} from 'three.quarks';
import {Vector3, Vector4} from 'quarks.core';
import {AdditiveBlending, MeshBasicMaterial, TextureLoader} from 'three';
import {Demo} from './demo.js';

/**
 * Small helper to build node graphs in code (the quarks editor builds the same graphs visually).
 */
class GraphBuilder {
    constructor(name) {
        this.graph = new NodeGraph(name);
    }

    /** adds a node; `inputs` are constants (numbers / vectors) or `[node, outputIndex]` / node */
    node(type, signature, inputs = [], data = {}) {
        const node = new Node(NodeTypes[type], signature, data);
        this.graph.addNode(node);
        inputs.forEach((input, i) => {
            if (input === undefined || input === null) return;
            if (input instanceof Node) {
                this.graph.addWire(new Wire(input, 0, node, i));
            } else if (Array.isArray(input) && input[0] instanceof Node) {
                this.graph.addWire(new Wire(input[0], input[1], node, i));
            } else {
                node.inputs[i] = new ConstantInput(input);
            }
        });
        return node;
    }

    read(property, type) {
        return this.node('particleProperty', 0, [], {property, type});
    }

    write(property, type, value) {
        return this.node('particleProperty', 0, [value], {property, type});
    }
}

// signatures (see NodeDefs): number ops use 0, vec3 ops use 2 (add / sub / mul vec3 x number), mul vec3 x vec3 is 5
const NUM = 0;
const VEC3 = 2;

/**
 * Node graph based effect: a vortex of 1500 particles per second. The emission graph spawns, the init graph places
 * each particle on a ring, and the update graph swirls it around the axis through 3D noise. With `three.quarks/webgpu`
 * and `quarks.nodes/webgpu` the update graph runs as a compute shader (GPU simulation).
 */
export class NodeBasedVFXDemo extends Demo {
    name = 'Node Graph VFX (Vortex)';

    initScene() {
        super.initScene();

        this.batchRenderer = this.createBatchRenderer();
        this.scene.add(this.batchRenderer);

        // emission: 1500 particles per second
        const emission = new GraphBuilder('emission');
        const rate = emission.node('rate', 0, [1500]);
        emission.node('emit', 0, [rate]);

        // init: ring position, upward velocity, random life, size and color
        const init = new GraphBuilder('init');
        const angle = init.node('random', NUM, [0, Math.PI * 2]);
        const radius = init.node('random', NUM, [1.5, 2.6]);
        const x = init.node('mul', NUM, [init.node('cos', 0, [angle]), radius]);
        const z = init.node('mul', NUM, [init.node('sin', 0, [angle]), radius]);
        init.write('position', NodeValueType.Vec3, init.node('vec3', 0, [x, 0, z]));
        const lift = init.node('vec3', 0, [0, init.node('random', NUM, [0.6, 2.2]), 0]);
        const jitter = init.node('mul', VEC3, [init.node('vrand', 1), 0.4]);
        init.write('velocity', NodeValueType.Vec3, init.node('add', VEC3, [lift, jitter]));
        init.write('life', NodeValueType.Number, init.node('random', NUM, [2.0, 3.2]));
        const size = init.node('random', NUM, [0.12, 0.32]);
        init.write('size', NodeValueType.Vec3, init.node('vec3', 0, [size, size, size]));
        const color = init.node('lerp', 3, [
            new Vector4(1.0, 0.35, 0.1, 1),
            new Vector4(0.25, 0.55, 1.0, 1),
            init.node('random', NUM, [0, 1]),
        ]);
        init.write('color', NodeValueType.Vec4, color);

        // update: swirl around the y axis, pull towards it, 3D noise turbulence, fade out with age
        const update = new GraphBuilder('update');
        const position = update.read('position', NodeValueType.Vec3);
        const velocity = update.read('velocity', NodeValueType.Vec3);
        const swirl = update.node('mul', VEC3, [update.node('cross', 0, [new Vector3(0, 1, 0), position]), 1.3]);
        const pull = update.node('mul', 5, [position, new Vector3(-1.1, 0, -1.1)]);
        const time = update.node('time');
        const noisePosition = update.node('add', VEC3, [
            update.node('mul', VEC3, [position, 0.7]),
            update.node('vec3', 0, [time, 0, 0]),
        ]);
        const turbulence = update.node('mul', VEC3, [update.node('noise', 1, [noisePosition]), 2.5]);
        const acceleration = update.node('add', VEC3, [update.node('add', VEC3, [swirl, pull]), turbulence]);
        const delta = update.node('delta');
        const newVelocity = update.node('add', VEC3, [velocity, update.node('mul', VEC3, [acceleration, delta])]);
        update.write('velocity', NodeValueType.Vec3, newVelocity);
        const age = update.read('age', NodeValueType.Number);
        const life = update.read('life', NodeValueType.Number);
        const fade = update.node('sub', NUM, [1, update.node('div', NUM, [age, life])]);
        const rgba = update.node('split', 2, [update.read('color', NodeValueType.Vec4)]);
        update.write(
            'color',
            NodeValueType.Vec4,
            update.node('vec4', 0, [
                [rgba, 0],
                [rgba, 1],
                [rgba, 2],
                update.node('smoothstep', 0, [fade, 0, 0.3]),
            ])
        );

        const texture = new TextureLoader().load('textures/particle_default.png');
        this.vfx = new NodeVFX({
            duration: 5,
            looping: true,
            worldSpace: true,
            prewarm: true,
            maxParticles: 5000,
            emissionGraph: emission.graph,
            initGraph: init.graph,
            updateGraph: update.graph,
            material: new MeshBasicMaterial({
                blending: AdditiveBlending,
                transparent: true,
                depthWrite: false,
                map: texture,
            }),
            renderOrder: 2,
            renderMode: RenderMode.BillBoard,
        });
        this.vfx.emitter.name = 'vortex';
        this.vfx.emitter.position.set(0, -2, 0);

        this.batchRenderer.addSystem(this.vfx);
        this.scene.add(this.vfx.emitter);
        return this.scene;
    }
}
