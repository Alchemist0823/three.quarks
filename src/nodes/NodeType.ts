import {NodeValueType} from "./NodeValueType";
import {NodeGraph} from "./NodeGraph";
import {Interpreter} from "./Interpreter";
import {Particle} from "../Particle";


export interface ExecutionContext {
    inputs: any[];
    outputs: any[];
    particle?: Particle;
    delta?: number;
}

type NodeExecFunction = (context: ExecutionContext, inputs: any[], outputs: any[]) => void;

export class NodeType {
    name: string;
    inputTypes: NodeValueType[] = [];
    outputTypes: NodeValueType[] = [];
    func: NodeExecFunction;

    constructor(name: string, func: NodeExecFunction, inputTypes: NodeValueType[], outputTypes: NodeValueType[]) {
        this.name = name;
        this.func = func;

        this.inputTypes = inputTypes;
        this.outputTypes = outputTypes;
    }
}

export class GraphNodeType extends NodeType {
    nodeGraph: NodeGraph;

    constructor(nodeGraph: NodeGraph) {
        const inputTypes = [];
        for (let i = 0; i < nodeGraph.inputNodes.length; i++) {
            if (nodeGraph.inputNodes[i].type.name === 'input') {
                inputTypes.push(nodeGraph.inputNodes[i].data.type);
            }
        }
        const outputTypes = [];
        for (let i = 0; i < nodeGraph.outputNodes.length; i++) {
            if (nodeGraph.outputNodes[i].type.name === 'output') {
                outputTypes.push(nodeGraph.outputNodes[i].data.type);
            }
        }

        super(nodeGraph.name, (context: ExecutionContext, inputs: any[], outputs: any[]) => {
            context.inputs = inputs;
            context.outputs = outputs;
            Interpreter.Instance.run(nodeGraph, context);
        }, inputTypes, outputTypes);
        this.nodeGraph = nodeGraph;
    }
}
