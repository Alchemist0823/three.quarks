import {Behavior, Particle} from 'quarks.core';
import {ExecutionContext} from './NodeDef';
import {NodeGraph} from './NodeGraph';
import {Interpreter} from './Interpreter';
/**
 * Behavior that runs a node graph.
 */
export class NodeGraphBehavior implements Behavior {
    type = 'NodeGraphBehavior';
    context: ExecutionContext = {
        particle: undefined,
        delta: 0,
        inputs: [],
        outputs: [],
    };

    constructor(public nodeGraph: NodeGraph) {}

    initialize(particle: Particle): void {}

    update(particle: Particle, delta: number): void {
        this.context.particle = particle;
        this.context.delta = delta;
        Interpreter.Instance.run(this.nodeGraph, this.context);
    }

    toJSON(): any {
        return {
            nodeGraph: this.nodeGraph,
        };
    }

    frameUpdate(delta: number): void {}

    static fromJSON(json: any): Behavior {
        return new NodeGraphBehavior(new NodeGraph('xxx'));
    }

    clone(): Behavior {
        return new NodeGraphBehavior(this.nodeGraph);
    }
    reset(): void {}
}
