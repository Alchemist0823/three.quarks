import {Node, NodeGraph, NodeTypes, NodeValueType, Wire} from '../../src';

export function createParticleGraph1() {
    const graph = new NodeGraph('test');
    const pos = new Node(NodeTypes['vec3'], 0);
    const age = new Node(NodeTypes['particleProperty'], 0, {property: 'age', type: NodeValueType.Number});
    pos.inputs[0] = {getValue: () => 4};
    pos.inputs[1] = {getValue: () => 5};
    pos.inputs[2] = {getValue: () => 6};
    const pos2 = new Node(NodeTypes['vec3'], 0);
    pos2.inputs[0] = {getValue: () => 1};
    pos2.inputs[1] = {getValue: () => 2};
    pos2.inputs[2] = {getValue: () => 3};

    const add = new Node(NodeTypes['add'], 2);
    const ppos = new Node(NodeTypes['particleProperty'], 0, {property: 'position', type: NodeValueType.Vec3});
    const pvel = new Node(NodeTypes['particleProperty'], 0, {property: 'velocity', type: NodeValueType.Vec3});

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
    return graph;
}
