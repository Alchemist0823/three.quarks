import {Node, Wire} from "./Node";
import {NodeTypes} from "./NodeDefs";

export class NodeGraph {
    id: string;
    name: string;
    inputNodes: Node[] = [];
    outputNodes: Node[] = [];
    nodes: Node[] = [];
    wires: Wire[] = [];

    compiled: boolean = false;
    nodesInOrder: Array<Node> = [];

    constructor(name: string) {
        this.id = "" + Math.round(Math.random() * 100000); //TODO use real random
        this.name = name;
    }

    addWire(wire: Wire): void {
        this.wires.push(wire);
    }

    addNode(node: Node): void {
        this.nodes.push(node);
        if (node.type === NodeTypes['input']) {
            this.inputNodes.push(node);
        } else if (node.type === NodeTypes['output']) {
            this.outputNodes.push(node);
        }
    }

    toJSON(): any {
        throw new Error("not implemented");
    }

    clone(): NodeGraph {
        throw new Error("not implemented");
    }
}
