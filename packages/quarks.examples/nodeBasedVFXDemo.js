import {BatchedParticleRenderer, Node, NodeGraph, NodeTypes, NodeVFX, RenderMode, Wire, NodeValueType} from 'three.quarks';
import {Demo} from './demo.js';
import {AdditiveBlending, MeshBasicMaterial, NormalBlending, TextureLoader, Vector3, Vector4} from 'three';

export class NodeBasedVFXDemo extends Demo {
    name = 'Node Based VFX (Experimental)';
    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        const emissionGraph = new NodeGraph('emission');
        const start = new Node(NodeTypes['startEvent'], 0);

        const repeater = new Node(NodeTypes['repeater'], 0);
        repeater.inputs[1] = {getValue: () => 1};

        const emit = new Node(NodeTypes['emit'], 0);

        emissionGraph.addNode(start);
        emissionGraph.addNode(repeater);
        emissionGraph.addNode(emit);
        emissionGraph.addWire(new Wire(start, 0, repeater, 0));
        emissionGraph.addWire(new Wire(repeater, 0, emit, 0));

        const updateGraph = new NodeGraph('test');
        const age = new Node(NodeTypes['particleProperty'], 0, {property: 'age', type: NodeValueType.Number});
        const time = new Node(NodeTypes['time']);
        const add = new Node(NodeTypes['add'], 0);
        add.inputs[1] = {getValue: () => 1};
        const pos = new Node(NodeTypes['vec3'], 0);
        pos.inputs[0] = {getValue: () => 1};
        pos.inputs[1] = {getValue: () => 1};
        pos.inputs[2] = {getValue: () => 1};
        const pos2 = new Node(NodeTypes['vec3'], 0);
        pos2.inputs[0] = {getValue: () => 1};
        pos2.inputs[1] = {getValue: () => 1};
        pos2.inputs[2] = {getValue: () => 1};

        const life = new Node(NodeTypes['particleProperty'], 0, {property: 'life', type: NodeValueType.Number});
        life.inputs[0] = {getValue: () => 5};
        const ppos = new Node(NodeTypes['particleProperty'], 0, {property: 'position', type: NodeValueType.Vec3});
        const pvel = new Node(NodeTypes['particleProperty'], 0, {property: 'velocity', type: NodeValueType.Vec3});

        updateGraph.addNode(age);
        updateGraph.addNode(time);
        updateGraph.addNode(add);
        updateGraph.addNode(pos);
        updateGraph.addNode(pos2);
        updateGraph.addNode(ppos);
        updateGraph.addNode(pvel);
        updateGraph.addNode(life);
        updateGraph.addWire(new Wire(age, 0, add, 0));
        updateGraph.addWire(new Wire(add, 0, pos, 1));
        updateGraph.addWire(new Wire(pos, 0, ppos, 0));
        updateGraph.addWire(new Wire(pos2, 0, pvel, 1));

        const texture = new TextureLoader().load('textures/particle_default.png');
        const config = {
            duration: 5,
            looping: true,
            //instancingGeometry: new PlaneGeometry(1, 1),//.rotateX((-90 / 180) * Math.PI),
            worldSpace: false,
            maxParticle: 100,
            emissionGraph: emissionGraph,
            updateGraph: updateGraph,

            material: new MeshBasicMaterial({
                blending: AdditiveBlending,
                transparent: true,
                map: texture,
                //side: DoubleSide,
            }),
            uTileCount: 1,
            vTileCount: 1,
            renderOrder: 2,
            renderMode: RenderMode.BillBoard,
        };

        // Create particle system based on your configuration
        this.billboard1 = new NodeVFX(config);
        this.billboard1.emitter.name = 'billboard';
        this.billboard1.emitter.position.x = 0;

        this.batchRenderer.addSystem(this.billboard1);

        this.scene.add(this.billboard1.emitter);
        this.scene.add(this.batchRenderer);

        return this.scene;
    }

    render(delta) {
        super.render(delta);
    }
}
