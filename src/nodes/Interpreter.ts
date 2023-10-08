import {NodeGraph} from './NodeGraph';
import {ConstInput, Node, Wire} from './Node';
import {ExecutionContext} from './NodeDef';
import { BaseCompiler } from "./BaseCompiler";

export class Interpreter extends BaseCompiler {

    constructor() {
        super();
    }

    /*private traverse(node: Node, graph: NodeGraph, context: ExecutionContext) {
        this.visited.add(node.id);
        const inputValues = [];
        for (let i = 0; i < node.inputs.length; i++) {
            if (node.inputs[i] instanceof Wire) {
                const inputNode = (node.inputs[i] as Wire).input;
                //if (inputNode) {
                if (!this.visited.has(inputNode.id)) {
                    this.traverse(inputNode, graph, context);
                }
                inputValues.push(inputNode.outputValues[(node.inputs[i] as Wire).inputIndex]);
            } else if (node.inputs[i] !== undefined) {
                inputValues.push((node.inputs[i] as ConstInput).getValue(context));
            } else {
                inputValues.push(undefined);
            }
        }
        // calculation
        node.func(context, inputValues, node.outputValues);
        graph.nodesInOrder.push(node);
    }*/

    private executeCompiledGraph(graph: NodeGraph, context: ExecutionContext) {
        const nodes = graph.nodesInOrder;
        for (let i = 0; i < nodes.length; i++) {
            const inputValues = [];
            const node = nodes[i];
            for (let j = 0; j < node.inputs.length; j++) {
                if (node.inputs[j] instanceof Wire) {
                    inputValues.push((node.inputs[j] as Wire).input.outputValues[(node.inputs[j] as Wire).inputIndex]);
                } else if (node.inputs[j] !== undefined) {
                    inputValues.push((node.inputs[j] as ConstInput).getValue(context));
                } else {
                    inputValues.push(undefined);
                }
            }
            node.func(context, inputValues, node.outputValues);
        }
    }

    run(graph: NodeGraph, context: ExecutionContext) {
        if (!graph.compiled) {
            this.buildExecutionOrder(graph, context);
        }
        this.executeCompiledGraph(graph, context);
    }
}
