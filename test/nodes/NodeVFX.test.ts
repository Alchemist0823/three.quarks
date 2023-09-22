import {NodeGraph, Node, Wire, NodeTypes, Interpreter, Particle} from '../../src';
import {Vector3} from 'three';

// Node Graph 2.0
describe('NodeVFX', () => {
    test('Interpreter emission graph', () => {
        const graph = new NodeGraph('test');
        const start = new Node(NodeTypes['startEvent'], 0);

        const repeater = new Node(NodeTypes['repeater'], 0);
        repeater.inputs[1] = {getValue: () => 10};

        const emit = new Node(NodeTypes['emit'], 0);

        graph.addNode(start);
        graph.addNode(repeater);
        graph.addNode(emit);
        graph.addWire(new Wire(start, 0, repeater, 0));
        graph.addWire(new Wire(repeater, 0, emit, 0));

        const interpreter = new Interpreter();
        const count = {value: 0};
        const context = {
            signal: (i: number) => {
                count.value += i;
            },
        };
        interpreter.run(graph, context);
        expect(count.value).toBe(45);

        interpreter.run(graph, context);
        expect(count.value).toBe(90);
    });

    test('Interpreter particle properties', () => {
        const graph = new NodeGraph('test');
        const pos = new Node(NodeTypes['vec3'], 0);
        const age = new Node(NodeTypes['particleProperty'], 0, {property: 'age'});
        pos.inputs[0] = {getValue: () => 4};
        pos.inputs[1] = {getValue: () => 5};
        pos.inputs[2] = {getValue: () => 6};
        const pos2 = new Node(NodeTypes['vec3'], 0);
        pos2.inputs[0] = {getValue: () => 1};
        pos2.inputs[1] = {getValue: () => 2};
        pos2.inputs[2] = {getValue: () => 3};

        const add = new Node(NodeTypes['add'], 2);
        const ppos = new Node(NodeTypes['particleProperty'], 0, {property: 'position'});
        const pvel = new Node(NodeTypes['particleProperty'], 0, {property: 'velocity'});

        graph.addNode(pos);
        graph.addNode(pos2);
        graph.addNode(add);
        graph.addNode(ppos);
        graph.addNode(pvel);
        graph.addWire(new Wire(age, 0, pos, 0));
        graph.addWire(new Wire(pos, 0, add, 0));
        graph.addWire(new Wire(pos2, 0, add, 1));
        graph.addWire(new Wire(add, 0, ppos, 0));
        graph.addWire(new Wire(pos2, 0, pvel, 0));

        const interpreter = new Interpreter();
        const particle = {position: new Vector3(), velocity: new Vector3(), age: 10} as Particle;
        const context = {particle: particle};
        interpreter.run(graph, context);
        expect(context.particle.velocity.x).toBe(1);
        expect(context.particle.velocity.y).toBe(2);
        expect(context.particle.velocity.z).toBe(3);
        expect(context.particle.position.x).toBe(11);
        expect(context.particle.position.y).toBe(7);
        expect(context.particle.position.z).toBe(9);

        interpreter.run(graph, context);
        expect(context.particle.velocity.x).toBe(1);
        expect(context.particle.velocity.y).toBe(2);
        expect(context.particle.velocity.z).toBe(3);
        expect(context.particle.position.x).toBe(11);
        expect(context.particle.position.y).toBe(7);
        expect(context.particle.position.z).toBe(9);
    });
});
