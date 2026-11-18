import {MathUtils, Vector2} from 'quarks.core';
import {NodeValueType} from './NodeValueType';
import {ExecutionContext, NodeDef} from './NodeDef';

/**
 * Per-node settings (`value` of constants, `property` / `type` of property nodes, ...). Keys starting with `_` hold
 * runtime state (e.g. the accumulator of a `rate` node) and are not serialized.
 */
export type NodeData = {[key: string]: any};

export class Node {
    id: string;
    inputs: (Wire | ConstInput | Adapter | undefined)[] = [];
    outputs: Wire[][] = [];
    definition: NodeDef;
    signatureIndex: number = -1;
    data: NodeData;

    // display
    position: Vector2 = new Vector2();

    // execution
    outputValues: any[] = [];

    constructor(definition: NodeDef, signatureIndex: number = -1, data: NodeData = {}) {
        this.id = MathUtils.generateUUID();
        this.definition = definition;
        this.signatureIndex = signatureIndex;
        this.data = data;
        const realIndex = signatureIndex === -1 ? 0 : signatureIndex;
        for (let i = 0; i < definition.nodeTypeSignatures[realIndex].inputTypes.length; i++) {
            this.inputs.push(undefined);
        }
        for (let i = 0; i < definition.nodeTypeSignatures[realIndex].outputTypes.length; i++) {
            this.outputs.push([]);
        }
    }

    get inputTypes(): NodeValueType[] {
        const signatureIndex = this.signatureIndex === -1 ? 0 : this.signatureIndex;
        return this.definition.nodeTypeSignatures[signatureIndex].inputTypes;
    }

    get outputTypes(): NodeValueType[] {
        const signatureIndex = this.signatureIndex === -1 ? 0 : this.signatureIndex;
        return this.definition.nodeTypeSignatures[signatureIndex].outputTypes;
    }

    func(context: ExecutionContext, inputs: any[], outputs: any[]) {
        const signatureIndex = this.signatureIndex === -1 ? 0 : this.signatureIndex;
        this.definition.nodeTypeSignatures[signatureIndex].func(context, this.data, inputs, outputs);
    }
}

export interface ConstInput {
    getValue(context: ExecutionContext): any;
}

/**
 * A constant input value (number, boolean or vector) of a node. Unlike an arbitrary {@link ConstInput}, it is
 * serialized with the graph and becomes a uniform in the GPU compiler, so it can be edited without a rebuild.
 */
export class ConstantInput implements ConstInput {
    constructor(public value: any) {}

    getValue(): any {
        return this.value;
    }
}

export class Wire {
    input: Node | Adapter;
    inputIndex: number;
    output: Node | Adapter;
    outputIndex: number;

    constructor(input: Node | Adapter, inputIndex: number, output: Node | Adapter, outputIndex: number) {
        this.input = input;
        this.inputIndex = inputIndex;
        this.input.outputs[inputIndex].push(this);
        this.output = output;
        this.outputIndex = outputIndex;
        this.output.inputs[outputIndex] = this;
    }
}

/**
 * Splits a vector output of `node` into its components (`isInput: false`, `outputs[k]` are the wires of component
 * `k`), or builds a vector input of `node` from components (`isInput: true`, `inputs[k]` are the wires of component
 * `k`). The `split` node and the vector constructor nodes do the same and are easier to serialize.
 */
export class Adapter {
    node: Node;
    isInput: boolean;
    paramIndex: number;
    type: NodeValueType;
    inputs: (Wire | undefined) [];
    outputs: Wire [][];
    /** vector built by an input adapter (interpreter) */
    value: any = undefined;

    constructor(type: NodeValueType, isInput:boolean, node: Node, paramIndex: number) {
        this.type = type;
        this.node = node;
        this.isInput = isInput;
        this.paramIndex = paramIndex;
        if (isInput) {
            switch (type) {
                case NodeValueType.Vec2:
                    this.inputs = [undefined, undefined];
                    this.outputs =[];
                    break;
                case NodeValueType.Vec3:
                    this.inputs = [undefined, undefined, undefined];
                    this.outputs =[];
                    break;
                case NodeValueType.Vec4:
                    this.inputs = [undefined, undefined, undefined, undefined];
                    this.outputs =[];
                    break;
                default:
                    this.inputs = [undefined];
                    this.outputs =[];
                    break;
            }
        } else {
            switch (type) {
                case NodeValueType.Vec2:
                    this.inputs = [];
                    this.outputs = [[], []];
                    break;
                case NodeValueType.Vec3:
                    this.inputs = [];
                    this.outputs = [[], [], []];
                    break;
                case NodeValueType.Vec4:
                    this.inputs = [];
                    this.outputs = [[], [], [], []];
                    break;
                default:
                    this.inputs = [];
                    this.outputs = [[]];
            }
        }
    }
}
