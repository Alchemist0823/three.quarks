import {Behavior, BehaviorTypes, IParticleSystem, Particle} from 'quarks.core';
import {ExecutionContext} from './NodeDef';
import {NodeGraph, NodeGraphJSON} from './NodeGraph';
import {getInterpreter} from './Interpreter';

/**
 * Behavior of a regular `ParticleSystem` that runs a node graph on every particle every step (CPU). The graph reads
 * and writes the particle with `particleProperty` nodes; `delta` and `time` nodes see the system's step.
 */
export class NodeGraphBehavior implements Behavior {
    type = 'NodeGraphBehavior';
    context: ExecutionContext = {
        particle: undefined,
        delta: 0,
        inputs: [],
        outputs: [],
    };
    private system: IParticleSystem | null = null;

    constructor(public nodeGraph: NodeGraph) {}

    initialize(particle: Particle, particleSystem: IParticleSystem): void {
        this.system = particleSystem;
    }

    update(particle: Particle, delta: number): void {
        this.context.particle = particle;
        this.context.delta = delta;
        this.context.emissionState = this.system ? (this.system as any).emissionState : undefined;
        getInterpreter().run(this.nodeGraph, this.context);
    }

    toJSON(): any {
        return {
            type: this.type,
            nodeGraph: this.nodeGraph.toJSON(),
        };
    }

    frameUpdate(delta: number): void {
        void delta;
    }

    static fromJSON(json: any): Behavior {
        return new NodeGraphBehavior(
            json.nodeGraph && json.nodeGraph.nodes ? NodeGraph.fromJSON(json.nodeGraph as NodeGraphJSON) : new NodeGraph('graph')
        );
    }

    clone(): Behavior {
        return new NodeGraphBehavior(this.nodeGraph.clone());
    }

    reset(): void {}
}

if (!BehaviorTypes['NodeGraphBehavior']) {
    BehaviorTypes['NodeGraphBehavior'] = {
        type: 'NodeGraphBehavior',
        constructor: NodeGraphBehavior,
        params: [],
        loadJSON: NodeGraphBehavior.fromJSON,
    };
}
