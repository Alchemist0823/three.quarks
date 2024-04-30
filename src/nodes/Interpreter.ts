import {NodeGraph} from './NodeGraph';
import {Adapter, ConstInput, Node, Wire} from './Node';
import {ExecutionContext} from './NodeDef';
import {BaseCompiler} from './BaseCompiler';
import {context} from 'three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements';
import {genDefaultForNodeValueType} from './NodeValueType';

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
            if (this.debug) {
                console.log('Node:', node);
            }
            for (let j = 0; j < node.inputs.length; j++) {
                if (node.inputs[j] instanceof Wire) {
                    if ((node.inputs[j] as Wire).input instanceof Node) {
                        inputValues.push(
                            ((node.inputs[j] as Wire).input as Node).outputValues[(node.inputs[j] as Wire).inputIndex]
                        );
                    } // TODO: handle adapter
                } else if (node.inputs[j] instanceof Adapter) {
                    // TODO: handle adapter
                    //inputValues.push((node.inputs[j] as Adapter).input.outputValues[(node.inputs[j] as Wire).inputIndex]);
                } else if (node.inputs[j] !== undefined) {
                    inputValues.push((node.inputs[j] as ConstInput).getValue(context));
                } else {
                    inputValues.push(undefined);
                }
            }
            if (node.outputValues.length === 0) {
                const signatureIndex = node.signatureIndex < 0 ? 0 : node.signatureIndex;
                for (let i = 0; i < node.definition.nodeTypeSignatures[signatureIndex].outputTypes.length; i++) {
                    node.outputValues.push(
                        genDefaultForNodeValueType(
                            node.definition.nodeTypeSignatures[signatureIndex].outputTypes[i]
                        )
                    );
                    if (node.outputValues[i] === undefined) {
                        node.outputValues[i] = genDefaultForNodeValueType(node.data.type);
                    }
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

    build(graph: NodeGraph, context: ExecutionContext): string {
        return '';
    }
}
