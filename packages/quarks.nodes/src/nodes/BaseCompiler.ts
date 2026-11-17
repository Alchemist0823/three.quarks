import {NodeGraph} from './NodeGraph';
import {Adapter, Node, Wire} from './Node';
import {ExecutionContext} from './NodeDef';

export abstract class BaseCompiler {
    /** the shared {@link Interpreter} (set by the first interpreter created) */
    static Instance: BaseCompiler;

    visited: Set<string> = new Set<string>();
    debug: boolean = false;

    /**
     * Orders the nodes the output nodes depend on so that every node comes after its inputs
     * (`graph.nodesInOrder`).
     */
    protected buildExecutionOrder(graph: NodeGraph, context?: ExecutionContext): void {
        graph.nodesInOrder.length = 0;
        this.visited.clear();
        for (let i = 0; i < graph.outputNodes.length; i++) {
            const node = graph.outputNodes[i];
            if (node.inputs.length === 0 || node.inputs[0] !== undefined) {
                if (!this.visited.has(node.id)) this._traverse(node, graph);
            }
        }
        graph.compiled = true;
        void context;
    }

    /** The nodes of `graph` in execution order. */
    getExecutionOrder(graph: NodeGraph): Node[] {
        if (!graph.compiled) this.buildExecutionOrder(graph);
        return graph.nodesInOrder;
    }

    private _visitSource(source: Node | Adapter, graph: NodeGraph) {
        const node = source instanceof Adapter ? source.node : source;
        if (!this.visited.has(node.id)) this._traverse(node, graph);
    }

    private _traverse(node: Node, graph: NodeGraph) {
        this.visited.add(node.id);
        for (let i = 0; i < node.inputs.length; i++) {
            const input = node.inputs[i];
            if (input instanceof Wire) {
                this._visitSource(input.input, graph);
            } else if (input instanceof Adapter) {
                for (const wire of input.inputs) {
                    if (wire !== undefined) this._visitSource(wire.input, graph);
                }
            }
        }
        graph.nodesInOrder.push(node);
    }

    abstract run(graph: NodeGraph, context: ExecutionContext): void;

    abstract build(graph: NodeGraph, context: ExecutionContext): string;
}
