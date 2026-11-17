import {Adapter, ConstantInput, ConstInput, Node, Wire} from './Node';
import {NodeTypes, OutputNodeTypeNames} from './NodeDefs';
import {MathUtils, Vector2, Vector3, Vector4} from 'quarks.core';

/** JSON of a node: definition name, signature, settings and constant inputs. */
export interface NodeJSON {
    id: string;
    type: string;
    signature: number;
    data: {[key: string]: any};
    position?: [number, number];
    /** constant input values by input index (`null` for wired / empty inputs) */
    inputs: Array<{value: any} | null>;
}

/** JSON of a wire from output `fromIndex` of node `from` to input `toIndex` of node `to`. */
export interface WireJSON {
    from: string;
    fromIndex: number;
    to: string;
    toIndex: number;
}

export interface NodeGraphJSON {
    uuid: string;
    name: string;
    version: string;
    nodes: NodeJSON[];
    wires: WireJSON[];
}

/** number / boolean as is, vectors as arrays */
export function nodeValueToJSON(value: any): any {
    if (value instanceof Vector4) return [value.x, value.y, value.z, value.w];
    if (value instanceof Vector3) return [value.x, value.y, value.z];
    if (value instanceof Vector2) return [value.x, value.y];
    return value;
}

export function nodeValueFromJSON(json: any): any {
    if (Array.isArray(json)) {
        if (json.length === 2) return new Vector2(json[0], json[1]);
        if (json.length === 3) return new Vector3(json[0], json[1], json[2]);
        if (json.length === 4) return new Vector4(json[0], json[1], json[2], json[3]);
    }
    return json;
}

function isConstInput(input: unknown): input is ConstInput {
    return input !== undefined && !(input instanceof Wire) && !(input instanceof Adapter);
}

export class NodeGraph {
    uuid: string;
    name: string;
    version: string;
    /** incremented by every edit */
    revision: number;
    inputNodes: Node[] = [];
    outputNodes: Node[] = [];
    allNodes: Map<string, Node> = new Map<string, Node>();
    wires: Wire[] = [];

    /** whether {@link nodesInOrder} is up to date (reset by every edit) */
    compiled = false;
    nodesInOrder: Array<Node> = [];

    constructor(name: string) {
        this.version = '1.0';
        this.uuid = MathUtils.generateUUID();
        this.name = name;
        this.revision = 0;
    }

    private changed() {
        this.revision++;
        this.compiled = false;
    }

    addWire(wire: Wire): void {
        this.wires.push(wire);
        this.changed();
    }

    addNode(node: Node): void {
        this.allNodes.set(node.id, node);
        if (node.definition === NodeTypes['input']) {
            this.inputNodes.push(node);
        } else if (OutputNodeTypeNames.has(node.definition.name)) {
            this.outputNodes.push(node);
        }
        this.changed();
    }

    getNode(id: string): Node | undefined {
        return this.allNodes.get(id);
    }

    deleteNode(node: Node) {
        for (const wire of this.wires.slice()) {
            if (wire.input === node || wire.output === node) this.deleteWire(wire);
        }
        this.allNodes.delete(node.id);
        let index = this.inputNodes.indexOf(node);
        if (index !== -1) this.inputNodes.splice(index, 1);
        index = this.outputNodes.indexOf(node);
        if (index !== -1) this.outputNodes.splice(index, 1);
        this.changed();
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
        this.changed();
    }

    /** Marks the graph as edited (call after changing node data or inputs directly). */
    markChanged() {
        this.changed();
    }

    /**
     * Serializes the graph. Constant inputs are stored by value (a custom {@link ConstInput} is evaluated once);
     * adapters are not serialized, use `split` and the vector constructor nodes instead.
     */
    toJSON(): NodeGraphJSON {
        const nodes: NodeJSON[] = [];
        // nodes reached through wires are serialized even if they were never added with addNode()
        const all = new Set<Node>(this.allNodes.values());
        for (const wire of this.wires) {
            if (wire.input instanceof Node) all.add(wire.input);
            if (wire.output instanceof Node) all.add(wire.output);
        }
        for (const node of all) {
            const data: {[key: string]: any} = {};
            for (const key in node.data) {
                if (!key.startsWith('_')) data[key] = nodeValueToJSON(node.data[key]);
            }
            nodes.push({
                id: node.id,
                type: node.definition.name,
                signature: node.signatureIndex,
                data,
                position: [node.position.x, node.position.y],
                inputs: node.inputs.map((input) =>
                    isConstInput(input) ? {value: nodeValueToJSON(input.getValue({}))} : null
                ),
            });
        }
        const wires: WireJSON[] = [];
        for (const wire of this.wires) {
            if (wire.input instanceof Node && wire.output instanceof Node) {
                wires.push({from: wire.input.id, fromIndex: wire.inputIndex, to: wire.output.id, toIndex: wire.outputIndex});
            } else {
                console.warn(`NodeGraph ${this.name}: wires through adapters are not serialized`);
            }
        }
        return {uuid: this.uuid, name: this.name, version: this.version, nodes, wires};
    }

    static fromJSON(json: NodeGraphJSON): NodeGraph {
        const graph = new NodeGraph(json.name);
        graph.uuid = json.uuid ?? graph.uuid;
        graph.version = json.version ?? graph.version;
        for (const nodeJSON of json.nodes) {
            const definition = NodeTypes[nodeJSON.type];
            if (!definition) throw new Error(`NodeGraph.fromJSON: unknown node type ${nodeJSON.type}`);
            const data: {[key: string]: any} = {};
            for (const key in nodeJSON.data) data[key] = nodeValueFromJSON(nodeJSON.data[key]);
            const node = new Node(definition, nodeJSON.signature ?? -1, data);
            node.id = nodeJSON.id;
            if (nodeJSON.position) node.position.set(nodeJSON.position[0], nodeJSON.position[1]);
            (nodeJSON.inputs ?? []).forEach((input, i) => {
                if (input && i < node.inputs.length) node.inputs[i] = new ConstantInput(nodeValueFromJSON(input.value));
            });
            graph.addNode(node);
        }
        for (const wire of json.wires) {
            const from = graph.getNode(wire.from);
            const to = graph.getNode(wire.to);
            if (!from || !to) throw new Error('NodeGraph.fromJSON: wire references a missing node');
            graph.addWire(new Wire(from, wire.fromIndex, to, wire.toIndex));
        }
        return graph;
    }

    clone(): NodeGraph {
        const graph = NodeGraph.fromJSON(this.toJSON());
        graph.uuid = MathUtils.generateUUID();
        return graph;
    }
}
