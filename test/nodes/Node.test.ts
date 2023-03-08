import {NodeGraph} from "../../src/nodes/NodeGraph";
import {Node, Wire} from "../../src/nodes/Node";
import {NodeTypes} from "../../src/nodes/NodeDefs";
import { Interpreter } from "../../src/nodes/Interpreter";

describe("Node", () => {
    test("Interpreter simple arithmetic 1", () => {
        const graph = new NodeGraph("test");
        const result = new Node(NodeTypes['mul']);
        const input1 = new Node(NodeTypes['add']);
        const output = new Node(NodeTypes['output']);
        input1.inputs[0] = { getValue: () => 1 };
        input1.inputs[1] = { getValue: () => 2 };
        graph.addWire(new Wire(input1, 0, result, 0));
        result.inputs[1] = { getValue: () => 3 };
        graph.addWire(new Wire(result, 0, output, 0));

        graph.addNode(result);
        graph.addNode(input1);
        graph.addNode(output);

        const interpreter = new Interpreter();
        interpreter.run(graph, {inputs: [], outputs: []});
        expect(graph.outputNodes[0].outputValues[0]).toBe(9);

        interpreter.run(graph, {inputs: [], outputs: []});
        expect(graph.outputNodes[0].outputValues[0]).toBe(9);
    });
});
