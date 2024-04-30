import {NodeValueType} from './NodeValueType';
import {NodeGraph} from './NodeGraph';
import {Interpreter} from './Interpreter';
import {IParticle, Particle} from '../Particle';
import {Vector2, Vector3, Vector4} from 'three';
import {Node, NodeData} from './Node';

export interface ExecutionContext {
    inputs?: NodeValue[];
    outputs?: NodeValue[];
    particle?: IParticle;
    [key: string]: any;
}

type NodeValue = number | boolean | Vector2 | Vector3 | Vector4 | Array<any>;

type NodeExecFunction = (context: ExecutionContext, data: NodeData, inputs: NodeValue[], outputs: NodeValue[]) => void;

export interface NodeTypeSignature {
    inputTypes: NodeValueType[];
    outputTypes: NodeValueType[];
    func: NodeExecFunction;
}

export enum NodeType {
    Variable,
    Expression,
    Storage,
    Function,
}

export class NodeDef {
    name: string;
    type: NodeType;
    nodeTypeSignatures: NodeTypeSignature[] = [];

    constructor(name: string, type: NodeType) {
        this.name = name;
        this.type = type;
    }

    addSignature(inputTypes: NodeValueType[], outputTypes: NodeValueType[], func: NodeExecFunction) {
        this.nodeTypeSignatures.push({
            inputTypes: inputTypes,
            outputTypes: outputTypes,
            func: func,
        });
    }
}

export class GraphNodeType extends NodeDef {
    nodeGraph: NodeGraph;

    constructor(nodeGraph: NodeGraph) {
        const inputTypes = [];
        for (let i = 0; i < nodeGraph.inputNodes.length; i++) {
            if (nodeGraph.inputNodes[i].definition.name === 'input') {
                inputTypes.push(nodeGraph.inputNodes[i].data.type);
            }
        }
        const outputTypes = [];
        for (let i = 0; i < nodeGraph.outputNodes.length; i++) {
            if (nodeGraph.outputNodes[i].definition.name === 'output') {
                outputTypes.push(nodeGraph.outputNodes[i].data.type);
            }
        }

        super(nodeGraph.name, NodeType.Expression);
        this.addSignature(inputTypes, outputTypes, (context: ExecutionContext, data, inputs, outputs) => {
            context.inputs = inputs;
            context.outputs = outputs;
            Interpreter.Instance.run(nodeGraph, context);
        });
        this.nodeGraph = nodeGraph;
    }
}
