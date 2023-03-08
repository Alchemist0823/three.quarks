import {Node, Wire} from "./Node";
import {NodeTypes} from "./NodeDefs";

export class NodeGraph {
    id: string;
    name: string;
    version: string;
    inputNodes: Node[] = [];
    outputNodes: Node[] = [];
    allNodes: Map<string, Node> = new Map<string, Node>();
    wires: Wire[] = [];

    compiled = false;
    nodesInOrder: Array<Node> = [];

    constructor(name: string) {
        this.version = "1.0";
        this.id = "" + Math.round(Math.random() * 100000); //TODO use real random
        this.name = name;
    }

    addWire(wire: Wire): void {
        this.wires.push(wire);
    }

    addNode(node: Node): void {
        //this.nodes.push(node);
        this.allNodes.set(node.id, node);
        if (node.type === NodeTypes['input']) {
            this.inputNodes.push(node);
        } else if (node.type === NodeTypes['output']) {
            this.outputNodes.push(node);
        }
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
    }

    deleteWire(wire: Wire): void {
        wire.input.outputs[wire.inputIndex] = undefined;
        wire.output.inputs[wire.outputIndex] = undefined;

        const index = this.wires.indexOf(wire);
        if (index != -1) {
            this.wires[index] = this.wires[this.wires.length - 1];
            this.wires.pop();
        }
    }


    toJSON(): any {
        throw new Error("not implemented");
    }

    clone(): NodeGraph {
        throw new Error("not implemented");
    }
}
