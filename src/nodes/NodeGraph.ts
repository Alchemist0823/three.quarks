import {Node} from "./Node";

export class NodeGraph {
    id: string;
    name: string;
    inputNodes: Node[] = [];
    outputNodes: Node[] = [];

    compiled: boolean = false;
    nodesInOrder: Array<Node> = [];

    constructor(name: string) {
        this.id = "" + Math.round(Math.random() * 100000); //TODO use real random
        this.name = name;
    }

    toJSON(): any {
        throw new Error("not implemented");
    }

    clone(): NodeGraph {
        throw new Error("not implemented");
    }
}
