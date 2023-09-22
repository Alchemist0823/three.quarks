import {Vector2} from 'three';
import {genDefaultForNodeValueType, NodeValueType} from './NodeValueType';
import {ExecutionContext, NodeType} from './NodeType';

export type NodeData = {[key: string]: any};
export class Node {
    id: string;
    inputs: (Wire | ConstInput | undefined)[] = [];
    outputs: Wire[][] = [];
    type: NodeType;
    signatureIndex: number = -1;
    data: NodeData;

    // display
    position: Vector2 = new Vector2();

    // execution
    outputValues: any[] = [];

    constructor(type: NodeType, signatureIndex: number = -1, data: NodeData = {}) {
        this.id = '' + Math.round(Math.random() * 100000); //TODO use real random
        this.type = type;
        this.signatureIndex = signatureIndex;
        this.data = data;
        const realIndex = signatureIndex === -1 ? 0 : signatureIndex;
        for (let i = 0; i < type.nodeTypeSignatures[realIndex].inputTypes.length; i++) {
            this.inputs.push(undefined);
        }
        for (let i = 0; i < type.nodeTypeSignatures[realIndex].outputTypes.length; i++) {
            this.outputs.push([]);
            this.outputValues.push(genDefaultForNodeValueType(type.nodeTypeSignatures[realIndex].outputTypes[i]));
        }
    }

    get inputTypes(): NodeValueType[] {
        const signatureIndex = this.signatureIndex === -1 ? 0 : this.signatureIndex;
        return this.type.nodeTypeSignatures[signatureIndex].inputTypes;
    }

    get outputTypes(): NodeValueType[] {
        const signatureIndex = this.signatureIndex === -1 ? 0 : this.signatureIndex;
        return this.type.nodeTypeSignatures[signatureIndex].outputTypes;
    }

    func(context: ExecutionContext, inputs: any[], outputs: any[]) {
        const signatureIndex = this.signatureIndex === -1 ? 0 : this.signatureIndex;
        this.type.nodeTypeSignatures[signatureIndex].func(context, this.data, inputs, outputs);
    }
}

export interface ConstInput {
    getValue(context: ExecutionContext): any;
}

export class Wire {
    input: Node;
    inputIndex: number;
    output: Node;
    outputIndex: number;

    constructor(input: Node, inputIndex: number, output: Node, outputIndex: number) {
        this.input = input;
        this.inputIndex = inputIndex;
        this.input.outputs[inputIndex].push(this);
        this.output = output;
        this.outputIndex = outputIndex;
        this.output.inputs[outputIndex] = this;
    }
}
