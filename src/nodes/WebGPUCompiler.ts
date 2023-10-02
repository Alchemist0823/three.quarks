import {BaseCompiler} from './BaseCompiler';
import {ExecutionContext} from './NodeType';
import {NodeGraph} from './NodeGraph';

class WebGPUCompiler extends BaseCompiler {
    constructor() {
        super();
    }

    private buildWebGPUCode(graph: NodeGraph, context: ExecutionContext) {}

    run(graph: NodeGraph, context: ExecutionContext) {
        if (!graph.compiled) {
            this.buildExecutionOrder(graph, context);
        }
        this.buildWebGPUCode(graph, context);
    }
}
