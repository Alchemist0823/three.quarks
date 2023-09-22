import {Node, Wire} from './Node';
import {NodeTypes, OutputNodeTypeNames} from './NodeDefs';

export class NodeGraph {
    id: string;
    name: string;
    version: string;
    revision: number;
    inputNodes: Node[] = [];
    outputNodes: Node[] = [];
    allNodes: Map<string, Node> = new Map<string, Node>();
    wires: Wire[] = [];

    compiled = false;
    nodesInOrder: Array<Node> = [];

    constructor(name: string) {
        this.version = '1.0';
        this.id = '' + Math.round(Math.random() * 100000); //TODO use real random
        this.name = name;
        this.revision = 0;
    }

    addWire(wire: Wire): void {
        this.wires.push(wire);
        this.revision++;
    }

    addNode(node: Node): void {
        //this.nodes.push(node);
        this.allNodes.set(node.id, node);
        if (node.type === NodeTypes['input']) {
            this.inputNodes.push(node);
        } else if (OutputNodeTypeNames.has(node.type.name)) {
            this.outputNodes.push(node);
        }
        this.revision++;
    }

    getNode(id: string): Node | undefined {
        return this.allNodes.get(id);
    }

    deleteNode(node: Node) {
        /*let index = this.nodes.indexOf(node);
        if (index != -1) {
            this.nodes[index] = this.nodes[this.nodes.length - 1];
            this.nodes.pop();
        }*/
        this.allNodes.delete(node.id);
        this.revision++;
    }

    deleteWire(wire: Wire): void {
        let index = wire.input.outputs[wire.inputIndex].indexOf(wire);
        if (index !== -1) {
            wire.input.outputs[wire.inputIndex].splice(index, 1);
        }
        wire.output.inputs[wire.outputIndex] = undefined;

        index = this.wires.indexOf(wire);
        if (index != -1) {
            this.wires[index] = this.wires[this.wires.length - 1];
            this.wires.pop();
        }
        this.revision++;
    }

    toJSON(): any {
        throw new Error('not implemented');
    }

    clone(): NodeGraph {
        throw new Error('not implemented');
    }
}
