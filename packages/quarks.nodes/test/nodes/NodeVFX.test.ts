import {NodeGraph, Node, Wire, NodeTypes, Interpreter} from '../../src';
import {Vector3} from 'three';
import { createParticleGraph1 } from "./GraphUtil";
import {Particle} from 'quarks.core';

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

        const graph = createParticleGraph1();
        const interpreter = new Interpreter();
        const particle = {position: new Vector3(), velocity: new Vector3(), age: 10} as unknown as Particle;
        const context = {particle: particle};

        for (let i = 0; i < 2; i++) {
            interpreter.run(graph, context);
            expect(context.particle.velocity.x).toBe(1);
            expect(context.particle.velocity.y).toBe(2);
            expect(context.particle.velocity.z).toBe(3);
            expect(context.particle.position.x).toBe(11);
            expect(context.particle.position.y).toBe(7);
            expect(context.particle.position.z).toBe(9);
        }
    });
});
