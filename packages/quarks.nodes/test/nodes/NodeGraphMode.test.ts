import {MeshBasicMaterial, Scene} from 'three';
import {Vector3, Vector4} from 'quarks.core';
import {ParticleSystemTypes, RenderMode} from 'three.quarks';
import {WebGPUBatchedRenderer, GPUParticleBatch} from 'three.quarks/webgpu';
import {
    Adapter,
    ConstantInput,
    Interpreter,
    Node,
    NodeGraph,
    NodeTypes,
    NodeValueType,
    NodeVFX,
    Wire,
    NodeGraphBehavior,
} from '../../src';
import {createNodeGraphProgram, getTSLGraphSupport} from '../../src/webgpu';
import {createParticleGraph1} from './GraphUtil';

const c = (value: any) => new ConstantInput(value);

function node(graph: NodeGraph, type: string, signature = 0, data: Record<string, any> = {}) {
    const n = new Node(NodeTypes[type], signature, data);
    graph.addNode(n);
    return n;
}

function wire(graph: NodeGraph, from: Node, fromIndex: number, to: Node, toIndex: number) {
    graph.addWire(new Wire(from, fromIndex, to, toIndex));
}

function property(graph: NodeGraph, name: string, type: NodeValueType) {
    return node(graph, 'particleProperty', 0, {property: name, type});
}

/** emission: `rate` particles per second */
function rateGraph(rate: number) {
    const graph = new NodeGraph('emission');
    const r = node(graph, 'rate');
    r.inputs[0] = c(rate);
    const emit = node(graph, 'emit');
    wire(graph, r, 0, emit, 0);
    return graph;
}

/** init: life, velocity (0, 2, 0) */
function initGraph(life = 1) {
    const graph = new NodeGraph('init');
    const lifeProperty = property(graph, 'life', NodeValueType.Number);
    lifeProperty.inputs[0] = c(life);
    const velocity = property(graph, 'velocity', NodeValueType.Vec3);
    velocity.inputs[0] = c(new Vector3(0, 2, 0));
    return graph;
}

/** update: velocity += (0, -9.8, 0) * delta; color.a = 1 - age / life */
function gravityGraph() {
    const graph = new NodeGraph('update');
    const velocityIn = property(graph, 'velocity', NodeValueType.Vec3);
    const gravity = node(graph, 'vec3');
    gravity.inputs[0] = c(0);
    gravity.inputs[1] = c(-9.8);
    gravity.inputs[2] = c(0);
    const delta = node(graph, 'delta');
    const scaled = node(graph, 'mul', 2); // vec3 * number
    wire(graph, gravity, 0, scaled, 0);
    wire(graph, delta, 0, scaled, 1);
    const sum = node(graph, 'add', 2);
    wire(graph, velocityIn, 0, sum, 0);
    wire(graph, scaled, 0, sum, 1);
    const velocityOut = property(graph, 'velocity', NodeValueType.Vec3);
    wire(graph, sum, 0, velocityOut, 0);
    return graph;
}

function makeVFX(extra: Record<string, unknown> = {}) {
    return new NodeVFX({
        duration: 10,
        looping: true,
        emissionGraph: rateGraph(100),
        initGraph: initGraph(1),
        updateGraph: gravityGraph(),
        material: new MeshBasicMaterial(),
        worldSpace: true,
        ...extra,
    });
}

describe('node graph interpreter', () => {
    test('smoothstep normalizes between the edges', () => {
        const graph = new NodeGraph('g');
        const s = node(graph, 'smoothstep');
        s.inputs[0] = c(15);
        s.inputs[1] = c(10);
        s.inputs[2] = c(20);
        const out = node(graph, 'output', 0);
        wire(graph, s, 0, out, 0);
        new Interpreter().run(graph, {});
        expect(s.outputValues[0]).toBeCloseTo(0.5);
    });

    test('split and adapters move vector components', () => {
        const graph = new NodeGraph('g');
        const v = node(graph, 'vec3');
        v.inputs = [c(1), c(2), c(3)];
        const split = node(graph, 'split', 1);
        wire(graph, v, 0, split, 0);
        // input adapter: (z, x) -> vec2
        const target = node(graph, 'output', 1);
        const adapter = new Adapter(NodeValueType.Vec2, true, target, 0);
        target.inputs[0] = adapter;
        new Wire(split, 2, adapter as any, 0);
        new Wire(split, 0, adapter as any, 1);
        new Interpreter().run(graph, {});
        expect(split.outputValues.slice(0, 3)).toEqual([1, 2, 3]);
        expect(target.outputValues[0].x).toBe(3);
        expect(target.outputValues[0].y).toBe(1);
    });

    test('rate emits per second and startEvent fires once per loop', () => {
        const graph = rateGraph(30);
        let count = 0;
        const context = {signal: () => count++, delta: 0.1};
        const interpreter = new Interpreter();
        for (let i = 0; i < 10; i++) interpreter.run(graph, context);
        expect(count).toBe(30);

        const start = new NodeGraph('start');
        const s = node(start, 'startEvent');
        const emit = node(start, 'emit');
        wire(start, s, 0, emit, 0);
        let starts = 0;
        interpreter.run(start, {signal: () => starts++, isStart: true});
        interpreter.run(start, {signal: () => starts++, isStart: false});
        expect(starts).toBe(1);
    });

    test('editing a graph recompiles its execution order', () => {
        const graph = new NodeGraph('g');
        const a = node(graph, 'number', 0, {value: 2});
        const out = node(graph, 'output', 0);
        wire(graph, a, 0, out, 0);
        const interpreter = new Interpreter();
        interpreter.run(graph, {});
        expect(out.outputValues[0]).toBe(2);
        const b = node(graph, 'number', 0, {value: 5});
        graph.deleteWire(graph.wires[0]);
        wire(graph, b, 0, out, 0);
        interpreter.run(graph, {});
        expect(out.outputValues[0]).toBe(5);
    });
});

describe('node graph JSON', () => {
    test('a graph survives a JSON round trip', () => {
        const graph = createParticleGraph1();
        const copy = NodeGraph.fromJSON(JSON.parse(JSON.stringify(graph.toJSON())));
        const particle: any = {position: new Vector3(), velocity: new Vector3(), age: 10};
        new Interpreter().run(copy, {particle});
        expect(particle.velocity.toArray()).toEqual([1, 2, 3]);
        expect(particle.position.toArray()).toEqual([11, 7, 9]);
    });

    test('NodeVFX serializes its graphs and loads through the QuarksLoader registry', () => {
        const vfx = makeVFX({renderMode: RenderMode.StretchedBillBoard, maxParticles: 500});
        const meta: any = {materials: {}, geometries: {}, textures: {}, images: {}};
        const json = JSON.parse(JSON.stringify(vfx.toJSON(meta)));
        expect(json.type).toBe('NodeVFX');
        const loaded = ParticleSystemTypes['NodeVFX'](
            json,
            {materials: {[vfx.material.uuid]: vfx.material}, geometries: {[vfx.instancingGeometry.uuid]: vfx.instancingGeometry}},
            {}
        ) as unknown as NodeVFX;
        expect(loaded).toBeInstanceOf(NodeVFX);
        expect(loaded.renderMode).toBe(RenderMode.StretchedBillBoard);
        expect(loaded.maxParticles).toBe(500);
        expect(loaded.updateGraph.allNodes.size).toBe(vfx.updateGraph.allNodes.size);
        expect(loaded.initGraph!.allNodes.size).toBe(2);
    });

    test('NodeGraphBehavior round-trips its graph', () => {
        const behavior = new NodeGraphBehavior(gravityGraph());
        const copy = NodeGraphBehavior.fromJSON(JSON.parse(JSON.stringify(behavior.toJSON()))) as NodeGraphBehavior;
        expect(copy.nodeGraph.allNodes.size).toBe(behavior.nodeGraph.allNodes.size);
    });
});

describe('NodeVFX (CPU)', () => {
    test('emits, initializes, updates and retires particles', () => {
        const scene = new Scene();
        const vfx = makeVFX();
        scene.add(vfx.emitter as any);
        const update = (dt: number) => (vfx as any).update(dt);
        // `rate` emits in the step it accumulates
        update(0.1);
        update(0.1);
        expect(vfx.particleNum).toBe(20);
        const particle = vfx.particles[0];
        expect(particle.life).toBe(1);
        // init velocity (0, 2, 0), then gravity
        expect(particle.velocity.y).toBeLessThan(2);
        for (let i = 0; i < 20; i++) update(0.1);
        // 100 / s for 1 s lifetime
        expect(vfx.particleNum).toBeGreaterThanOrEqual(90);
        expect(vfx.particleNum).toBeLessThanOrEqual(110);
    });

    test('trail mode creates trail particles', () => {
        const scene = new Scene();
        const vfx = makeVFX({renderMode: RenderMode.Trail, rendererEmitterSettings: {startLength: 5}});
        scene.add(vfx.emitter as any);
        for (let i = 0; i < 5; i++) (vfx as any).update(0.1);
        expect(vfx.particleNum).toBeGreaterThan(0);
        expect((vfx.particles[0] as any).previous.length).toBeGreaterThan(0);
    });
});

describe('NodeVFX (GPU)', () => {
    function fakeRenderer() {
        const dispatches: unknown[][] = [];
        return {
            dispatches,
            backend: {isWebGPUBackend: true},
            hasInitialized: () => true,
            compute: (nodes: unknown[]) => dispatches.push(nodes),
        };
    }

    test('update graphs with GPU nodes are simulated on the GPU', () => {
        const scene = new Scene();
        const renderer = fakeRenderer();
        const batchRenderer = new WebGPUBatchedRenderer({renderer, gpuSimulation: 'all'});
        scene.add(batchRenderer);
        const vfx = makeVFX();
        batchRenderer.addSystem(vfx);
        scene.add(vfx.emitter as any);
        expect(getTSLGraphSupport(vfx.updateGraph)).toBeNull();
        expect(batchRenderer.isGPUSimulated(vfx)).toBe(true);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        expect(vfx.particleNum).toBe(20);
        expect(renderer.dispatches.length).toBe(2);
        const batch = batchRenderer.batches[0] as GPUParticleBatch;
        expect(batch.geometry.instanceCount).toBe(64);
        expect(createNodeGraphProgram(vfx).estimateParticleCount()).toBeNull();
    });

    test("'auto' uses maxParticles; unsupported graphs stay on the CPU", () => {
        const scene = new Scene();
        const batchRenderer = new WebGPUBatchedRenderer({renderer: fakeRenderer(), gpuSimulation: 'auto'});
        scene.add(batchRenderer);
        const unknown = makeVFX();
        const large = makeVFX({maxParticles: 5000});
        const writesLife = makeVFX({maxParticles: 5000, updateGraph: initGraph(2)});
        for (const vfx of [unknown, large, writesLife]) {
            batchRenderer.addSystem(vfx);
            scene.add(vfx.emitter as any);
        }
        expect(batchRenderer.isGPUSimulated(unknown)).toBe(false);
        expect(batchRenderer.isGPUSimulated(large)).toBe(true);
        expect(batchRenderer.isGPUSimulated(writesLife)).toBe(false);
        expect(batchRenderer.getGPUSimulationSupport(writesLife)).toMatch(/life/);
    });

    test('spawned NodeParticles become GPU records with default start values', () => {
        const scene = new Scene();
        const batchRenderer = new WebGPUBatchedRenderer({renderer: fakeRenderer(), gpuSimulation: 'all'});
        scene.add(batchRenderer);
        const vfx = makeVFX();
        batchRenderer.addSystem(vfx);
        scene.add(vfx.emitter as any);
        batchRenderer.update(0.1);
        batchRenderer.update(0.1);
        const simulation = (batchRenderer.batches[0] as GPUParticleBatch).simulation;
        const records = (simulation as any).stagingData_ as Float32Array;
        // [slot header vec4][record]: start color falls back to color (1, 1, 1, 1), speed modifier to 1
        expect(Array.from(records.subarray(4 + 16, 4 + 20))).toEqual([1, 1, 1, 1]);
        expect(records[4 + 26]).toBe(1);
        expect(Number.isNaN(records[4 + 25])).toBe(false);
    });
});

void Vector4;
