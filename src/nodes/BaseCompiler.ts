import {NodeGraph} from './NodeGraph';
import {ConstInput, Node, Wire} from './Node';
import {ExecutionContext} from './NodeType';

export abstract class BaseCompiler {
    static Instance: BaseCompiler;

    constructor() {
        BaseCompiler.Instance = this;
    }

    visited: Set<string> = new Set<string>();

    protected buildExecutionOrder(graph: NodeGraph, context: ExecutionContext): void {
        graph.nodesInOrder.length = 0;
        this.visited.clear();
        for (let i = 0; i < graph.outputNodes.length; i++) {
            const node = graph.outputNodes[i];
            if (node.inputs[0] !== undefined) {
                this._traverse(node, graph, context);
            }
        }
        graph.compiled = true;
    }
    private _traverse(node: Node, graph: NodeGraph, context: ExecutionContext) {
        this.visited.add(node.id);
        const inputValues = [];
        for (let i = 0; i < node.inputs.length; i++) {
            if (node.inputs[i] instanceof Wire) {
                const inputNode = (node.inputs[i] as Wire).input;
                //if (inputNode) {
                if (!this.visited.has(inputNode.id)) {
                    this._traverse(inputNode, graph, context);
                }
                //inputValues.push(inputNode.outputValues[(node.inputs[i] as Wire).inputIndex]);
                /*} else {
                    throw new Error(`Node ${node.id} has not inputs`);
                }*/
            } else if (node.inputs[i] !== undefined) {
                //inputValues.push((node.inputs[i] as ConstInput).getValue(context));
            } else {
                //inputValues.push(undefined);
            }
        }
        // calculation
        //node.func(context, inputValues, node.outputValues);
        graph.nodesInOrder.push(node);
    }

    abstract run(graph: NodeGraph, context: ExecutionContext): void;
}
