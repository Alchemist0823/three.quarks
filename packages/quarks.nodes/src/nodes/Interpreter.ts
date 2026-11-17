import {Vector2, Vector3, Vector4} from 'quarks.core';
import {NodeGraph} from './NodeGraph';
import {Adapter, ConstInput, Node, Wire} from './Node';
import {ExecutionContext} from './NodeDef';
import {BaseCompiler} from './BaseCompiler';
import {genDefaultForNodeValueType, NodeValueType} from './NodeValueType';

const COMPONENTS = ['x', 'y', 'z', 'w'];

/**
 * Value of output `index` of `source`: a node output, or one component of a node output split by an adapter.
 */
function sourceValue(source: Node | Adapter, index: number): any {
    if (source instanceof Adapter) {
        const vector = source.node.outputValues[source.paramIndex];
        return vector ? vector[COMPONENTS[index]] : undefined;
    }
    return source.outputValues[index];
}

/** The vector an input adapter builds from its component wires. */
function adapterValue(adapter: Adapter): any {
    if (adapter.value === undefined) {
        adapter.value =
            adapter.type === NodeValueType.Vec2
                ? new Vector2()
                : adapter.type === NodeValueType.Vec3
                  ? new Vector3()
                  : adapter.type === NodeValueType.Vec4
                    ? new Vector4()
                    : 0;
    }
    if (typeof adapter.value === 'number') {
        const wire = adapter.inputs[0];
        adapter.value = wire ? sourceValue(wire.input, wire.inputIndex) : 0;
        return adapter.value;
    }
    for (let k = 0; k < adapter.inputs.length; k++) {
        const wire = adapter.inputs[k];
        adapter.value[COMPONENTS[k]] = wire ? sourceValue(wire.input, wire.inputIndex) : 0;
    }
    return adapter.value;
}

/**
 * Runs a node graph on the CPU, node by node in execution order.
 */
export class Interpreter extends BaseCompiler {
    constructor() {
        super();
        if (!BaseCompiler.Instance) BaseCompiler.Instance = this;
    }

    private inputValues_: any[] = [];

    private executeCompiledGraph(graph: NodeGraph, context: ExecutionContext) {
        const nodes = graph.nodesInOrder;
        const inputValues = this.inputValues_;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (this.debug) {
                console.log('Node:', node);
            }
            inputValues.length = 0;
            for (let j = 0; j < node.inputs.length; j++) {
                const input = node.inputs[j];
                if (input instanceof Wire) {
                    inputValues.push(sourceValue(input.input, input.inputIndex));
                } else if (input instanceof Adapter) {
                    inputValues.push(adapterValue(input));
                } else if (input !== undefined) {
                    inputValues.push((input as ConstInput).getValue(context));
                } else {
                    inputValues.push(undefined);
                }
            }
            if (node.outputValues.length === 0) {
                const outputTypes = node.outputTypes;
                for (let k = 0; k < outputTypes.length; k++) {
                    node.outputValues.push(genDefaultForNodeValueType(outputTypes[k]));
                    if (node.outputValues[k] === undefined) {
                        node.outputValues[k] = genDefaultForNodeValueType(node.data.type);
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

    build(): string {
        return '';
    }
}

/** The shared interpreter. */
export function getInterpreter(): Interpreter {
    if (!(BaseCompiler.Instance instanceof Interpreter)) BaseCompiler.Instance = new Interpreter();
    return BaseCompiler.Instance as Interpreter;
}
