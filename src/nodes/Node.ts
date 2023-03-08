import {Vector2} from "three";
import {genDefaultForNodeValueType} from "./NodeValueType";
import {ExecutionContext, NodeType} from "./NodeType";

export class Node {
    id: string;
    inputs: (Wire | ConstInput | undefined)[] = [];
    outputs: (Wire | undefined)[] = [];
    type: NodeType;
    data: { [key: string]: any } = {};

    // display
    position: Vector2 = new Vector2();

    // execution
    outputValues: any[] = [];

    constructor(type: NodeType) {
        this.id = "" + Math.round(Math.random() * 100000); //TODO use real random
        this.type = type;
        for (let i = 0; i < type.inputTypes.length; i++) {
            this.inputs.push(undefined);
        }
        for (let i = 0; i < type.outputTypes.length; i++) {
            this.outputs.push(undefined);
            this.outputValues.push(genDefaultForNodeValueType(type.outputTypes[i]));
        }
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
        this.input.outputs[inputIndex] = this;
        this.output = output;
        this.outputIndex = outputIndex;
        this.output.inputs[outputIndex] = this;
    }
}
