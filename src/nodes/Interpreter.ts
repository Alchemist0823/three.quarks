import {NodeGraph} from "./NodeGraph";
import {ConstInput, Node, Wire} from "./Node";
import {ExecutionContext} from "./NodeType";

export class Interpreter {

    static Instance: Interpreter;

    constructor() {
        Interpreter.Instance = this;
    }

    visited: Set<string> = new Set<string>();
    private graph_?: NodeGraph;
    private context_?: ExecutionContext;

    private traverse(node: Node) {
        this.visited.add(node.id);
        const inputValues = [];
        for (let i = 0; i < node.inputs.length; i ++) {
            if (node.inputs[i] instanceof Wire) {
                const inputNode = (node.inputs[i] as Wire).input;
                //if (inputNode) {
                if (!this.visited.has(inputNode.id)) {
                    this.traverse(inputNode);
                }
                inputValues.push(inputNode.outputValues[(node.inputs[i] as Wire).inputIndex]);
                /*} else {
                    throw new Error(`Node ${node.id} has not inputs`);
                }*/
            } else {
                inputValues.push((node.inputs[i] as ConstInput).getValue(this.context_!));
            }
        }
        // calculation
        node.type.func(this.context_!, inputValues, node.outputValues);
        this.graph_!.nodesInOrder.push(node);
    }

    private executeCompiledGraph() {
        const nodes = this.graph_!.nodesInOrder;
        for (let i = 0; i < nodes.length; i ++) {
            const inputValues = [];
            const node = nodes[i];
            for (let j = 0; j < node.inputs.length; j ++) {
                if (node.inputs[j] instanceof Wire) {
                    inputValues.push((node.inputs[j] as Wire).input.outputValues[(node.inputs[j] as Wire).inputIndex]);
                } else {
                    inputValues.push((node.inputs[j] as ConstInput).getValue(this.context_!));
                }
            }
            node.type.func(this.context_!, inputValues, node.outputValues);
        }
    }

    run(graph: NodeGraph, context: ExecutionContext) {
        this.graph_ = graph;
        this.context_ = context;

        if (graph.compiled) {
            this.executeCompiledGraph();
        } else {
            graph.nodesInOrder.length = 0;
            this.visited.clear();
            for (let i = 0; i < graph.outputNodes.length; i++) {
                const node = graph.outputNodes[i];
                this.traverse(node);
            }
            graph.compiled = true;
        }
    }
}
