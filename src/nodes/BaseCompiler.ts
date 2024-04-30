import {NodeGraph} from './NodeGraph';
import {Adapter, ConstInput, Node, Wire} from './Node';
import {ExecutionContext} from './NodeDef';

export abstract class BaseCompiler {
    static Instance: BaseCompiler;

    constructor() {
        BaseCompiler.Instance = this;
    }

    visited: Set<string> = new Set<string>();
    debug: boolean = false;

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

    private _traverseWire(wire: Wire, graph: NodeGraph, context: ExecutionContext) {

    }

    private _traverse(node: Node, graph: NodeGraph, context: ExecutionContext) {
        this.visited.add(node.id);
        const inputValues = [];
        for (let i = 0; i < node.inputs.length; i++) {
            if (node.inputs[i] instanceof Wire) {
                const input = (node.inputs[i] as Wire).input;
                //if (input) {
                if (input instanceof Node) {
                    if (!this.visited.has(input.id)) {
                        this._traverse(input, graph, context);
                    }
                } else if (input instanceof Adapter) {
                    if (!input.isInput) {
                        this._traverse(input.node, graph, context);
                    }
                }
            } else if (node.inputs[i] instanceof Adapter) {
                const input = node.inputs[i] as Adapter;
                for (let j = 0; j < input.inputs.length; j++) {
                    const wireOrNot = input.inputs[j];
                    if (wireOrNot !== undefined) {
                        if (wireOrNot.input instanceof Node) {
                            if (!this.visited.has(wireOrNot.input.id)) {
                                this._traverse(wireOrNot.input, graph, context);
                            }
                        } else {
                            if (!this.visited.has(wireOrNot.input.node.id)) {
                                this._traverse(wireOrNot.input.node, graph, context);
                            }
                        }
                    }
                }
            }
        }
        // calculation
        //node.func(context, inputValues, node.outputValues);
        graph.nodesInOrder.push(node);
    }

    abstract run(graph: NodeGraph, context: ExecutionContext): void;

    abstract build(graph: NodeGraph, context: ExecutionContext): string;
}
