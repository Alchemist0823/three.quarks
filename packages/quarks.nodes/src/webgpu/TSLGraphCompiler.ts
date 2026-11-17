/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Compiles node graphs to three.js TSL, so the update graph of a {@link NodeVFX} runs in the GPU simulation of
 * `three.quarks/webgpu` (`GPUParticleBatchSimulation`) instead of the CPU {@link Interpreter}.
 *
 * Every node becomes TSL code in execution order; each output is stored in a shader variable, so later
 * `particleProperty` writes do not change values that were already read (same semantics as the interpreter). Constant
 * inputs and `number` nodes become uniforms refreshed every step, so editing values does not rebuild the shader;
 * structural edits do (the kernel watches the graph's `revision`).
 */
import * as TSL from 'three/tsl';
import {Vector2, Vector3, Vector4} from 'quarks.core';
import {registerGPUSimulationProgram} from 'three.quarks/webgpu';
import type {GPUCompileContext, GPUParticleState, GPUSimulationProgram} from 'three.quarks/webgpu';
import {
    Adapter,
    BaseCompiler,
    EventNodeTypeNames,
    NOISE_CHANNEL_OFFSETS,
    Node,
    NodeGraph,
    NodeValueType,
    Wire,
} from 'quarks.nodes';
import type {ConstInput, NodeVFX} from 'quarks.nodes';

const {
    abs,
    all,
    atan,
    bool,
    ceil,
    clamp,
    cos,
    cross,
    distance,
    dot,
    equal,
    exp,
    float,
    floor,
    fract,
    length,
    log,
    max,
    min,
    mix,
    mx_noise_float,
    normalize,
    pow,
    select,
    sign,
    sin,
    smoothstep,
    sqrt,
    step,
    tan,
    vec2,
    vec3,
    vec4,
} = TSL as any;

type N = any;

const COMPONENTS = ['x', 'y', 'z', 'w'];

/** What a graph compiles against: the uniforms / randoms of the kernel, the particle, the effect. */
export interface TSLGraphScope {
    ctx: GPUCompileContext;
    p: GPUParticleState;
    system: NodeVFX;
}

interface TSLNodeArgs {
    node: Node;
    inputs: N[];
    scope: TSLGraphScope;
}

type TSLNodeImplementation = (args: TSLNodeArgs) => N[];

const implementations = new Map<string, TSLNodeImplementation>();

/**
 * Registers the TSL version of a node type (custom nodes). The function returns the node's outputs.
 */
export function registerTSLNode(name: string, implementation: TSLNodeImplementation) {
    implementations.set(name, implementation);
}

// particle properties and the fields of the GPU particle that hold them
const PARTICLE_FIELDS: {[property: string]: {field: keyof GPUParticleState; written: string | null}} = {
    position: {field: 'position', written: null},
    velocity: {field: 'velocity', written: 'velocity'},
    age: {field: 'age', written: null},
    life: {field: 'life', written: null},
    size: {field: 'size', written: 'sizeRotation'},
    rotation: {field: 'rotation', written: 'sizeRotation'},
    color: {field: 'color', written: 'color'},
    uvTile: {field: 'uvTile', written: 'misc'},
};

// ---- node implementations -----------------------------------------------------------------------------------

const op =
    (f: (...inputs: N[]) => N): TSLNodeImplementation =>
    ({inputs}) => [f(...inputs)];

registerTSLNode('add', op((a, b) => a.add(b)));
registerTSLNode('sub', op((a, b) => a.sub(b)));
registerTSLNode('mul', op((a, b) => a.mul(b)));
registerTSLNode('div', op((a, b) => a.div(b)));
registerTSLNode('sin', op((a) => sin(a)));
registerTSLNode('cos', op((a) => cos(a)));
registerTSLNode('tan', op((a) => tan(a)));
registerTSLNode('abs', op((a) => abs(a)));
registerTSLNode('min', op((a, b) => min(a, b)));
registerTSLNode('max', op((a, b) => max(a, b)));
registerTSLNode('dot', op((a, b) => dot(a, b)));
registerTSLNode('cross', op((a, b) => cross(a, b)));
registerTSLNode('length', op((a) => length(a)));
registerTSLNode('lengthSq', op((a) => dot(a, a)));
registerTSLNode('normalize', op((a) => normalize(a)));
registerTSLNode('distance', op((a, b) => distance(a, b)));
registerTSLNode('and', op((a, b) => a.and(b)));
registerTSLNode('or', op((a, b) => a.or(b)));
registerTSLNode('not', op((a) => a.not()));
registerTSLNode('equal', ({node, inputs: [a, b]}) => [
    node.inputTypes[0] === NodeValueType.Number ? a.equal(b) : all(equal(a, b)),
]);
registerTSLNode('lessThan', op((a, b) => a.lessThan(b)));
registerTSLNode('greaterThan', op((a, b) => a.greaterThan(b)));
registerTSLNode('lessThanOrEqual', op((a, b) => a.lessThanEqual(b)));
registerTSLNode('greaterThanOrEqual', op((a, b) => a.greaterThanEqual(b)));
registerTSLNode('if', op((c, a, b) => select(c, a, b)));
registerTSLNode('number', ({node, scope}) => [scope.ctx.float(() => Number(node.data.value ?? 0))]);
registerTSLNode('bool', ({node, scope}) => {
    scope.ctx.watch(() => !!node.data.value);
    return [bool(!!node.data.value)];
});
registerTSLNode('vec2', op((x, y) => vec2(x, y)));
registerTSLNode('vec3', op((x, y, z) => vec3(x, y, z)));
registerTSLNode('vec4', op((x, y, z, w) => vec4(x, y, z, w)));
registerTSLNode('output', op((a) => a));
registerTSLNode('bsdf', () => []);
registerTSLNode('time', ({scope}) => [scope.ctx.float(() => scope.system.emissionState.time)]);
registerTSLNode('delta', ({scope}) => [scope.ctx.delta]);
registerTSLNode('lerp', op((a, b, t) => mix(a, b, t)));
registerTSLNode('clamp', op((x, lo, hi) => clamp(x, lo, hi)));
registerTSLNode('smoothstep', op((x, e0, e1) => smoothstep(e0, e1, x)));
registerTSLNode('normDistrib', op((x) => exp(x.mul(x).mul(-0.5)).mul(1 / Math.sqrt(2 * Math.PI))));
registerTSLNode(
    'normcdf',
    op((input) => {
        // Abramowitz & Stegun 7.1.26
        const x = abs(input).div(Math.SQRT2);
        const t = float(1).div(x.mul(0.3275911).add(1));
        const poly = t
            .mul(1.061405429)
            .sub(1.453152027)
            .mul(t)
            .add(1.421413741)
            .mul(t)
            .sub(0.284496736)
            .mul(t)
            .add(0.254829592)
            .mul(t);
        const y = float(1).sub(poly.mul(exp(x.mul(x).negate())));
        return float(1).add(select(input.lessThan(0), y.negate(), y)).mul(0.5);
    })
);
registerTSLNode(
    'normcdfInv',
    op((p) => {
        // Abramowitz & Stegun 26.2.23
        const rational = (t: N) =>
            t.sub(
                t
                    .mul(0.010328)
                    .add(0.802853)
                    .mul(t)
                    .add(2.515517)
                    .div(t.mul(0.001308).add(0.189269).mul(t).add(1.432788).mul(t).add(1))
            );
        const low = rational(sqrt(log(p).mul(-2))).negate();
        const high = rational(sqrt(log(float(1).sub(p)).mul(-2)));
        return select(p.lessThan(0.5), low, high);
    })
);
registerTSLNode('random', ({inputs: [a, b], scope}) => [mix(a, b, scope.ctx.randomPerStep())]);
registerTSLNode('vrand', ({node, scope}) => {
    const r = () => scope.ctx.randomPerStep();
    const type = node.outputTypes[0];
    if (type === NodeValueType.Vec2) {
        const angle = r().mul(Math.PI * 2);
        return [vec2(cos(angle), sin(angle))];
    }
    if (type === NodeValueType.Vec3) {
        // uniform on the unit sphere
        const z = r().mul(2).sub(1);
        const angle = r().mul(Math.PI * 2);
        const radius = sqrt(max(float(1).sub(z.mul(z)), 0));
        return [vec3(radius.mul(cos(angle)), radius.mul(sin(angle)), z)];
    }
    // normalized gaussian vector (Box-Muller)
    const gaussian = () => {
        const u = max(r(), 1e-7);
        const angle = r().mul(Math.PI * 2);
        const radius = sqrt(log(u).mul(-2));
        return [radius.mul(cos(angle)), radius.mul(sin(angle))];
    };
    const [x, y] = gaussian();
    const [z, w] = gaussian();
    return [normalize(vec4(x, y, z, w))];
});
for (const [name, f] of [
    ['sqrt', sqrt],
    ['exp', exp],
    ['log', log],
    ['floor', floor],
    ['ceil', ceil],
    ['fract', fract],
    ['sign', sign],
] as [string, (x: N) => N][]) {
    registerTSLNode(name, op((x) => f(x)));
}
registerTSLNode('negate', op((x) => x.negate()));
registerTSLNode('pow', op((a, b) => pow(a, b)));
// floored modulo, like the CPU node (WGSL's % truncates)
registerTSLNode('mod', op((a, b) => a.sub(b.mul(floor(a.div(b))))));
registerTSLNode('step', op((edge, x) => step(edge, x)));
registerTSLNode('atan2', op((y, x) => atan(y, x)));
registerTSLNode('split', ({node, inputs: [v]}) => node.outputTypes.map((_, i) => v[COMPONENTS[i]]));
registerTSLNode('noise', ({node, inputs: [position]}) => {
    if (node.outputTypes[0] === NodeValueType.Vec3) {
        const o = NOISE_CHANNEL_OFFSETS;
        return [
            vec3(
                mx_noise_float(position.add(o[0])),
                mx_noise_float(position.add(o[1])),
                mx_noise_float(position.add(o[2]))
            ),
        ];
    }
    return [mx_noise_float(position)];
});
registerTSLNode('particleProperty', ({node, inputs: [value], scope}) => {
    const target = PARTICLE_FIELDS[node.data.property];
    const field = scope.p[target.field] as N;
    if (value !== undefined) {
        field.assign(value);
        if (target.written) scope.ctx.written.add(target.written);
    }
    return [field];
});
registerTSLNode('graphProperty', ({node, scope}) => {
    const property = node.data.property;
    const read = () => scope.system.properties[property];
    switch (node.data.type) {
        case NodeValueType.Vec2:
            return [scope.ctx.vec4(() => ({...read(), z: 0, w: 0})).xy];
        case NodeValueType.Vec3:
            return [scope.ctx.vec3(read)];
        case NodeValueType.Vec4:
            return [scope.ctx.vec4(read)];
        case NodeValueType.Boolean:
            return [scope.ctx.float(() => (read() ? 1 : 0)).greaterThan(0.5)];
        default:
            return [scope.ctx.float(() => Number(read() ?? 0))];
    }
});

// ---- graph compilation --------------------------------------------------------------------------------------

class GraphOrder extends BaseCompiler {
    run(): void {
        throw new Error('GraphOrder only orders nodes');
    }

    build(): string {
        return '';
    }
}

const graphOrder = new GraphOrder();

/** Why `graph` cannot run as a GPU update graph, or `null`. */
export function getTSLGraphSupport(graph: NodeGraph): string | null {
    for (const node of graphOrder.getExecutionOrder(graph)) {
        const name = node.definition.name;
        if (EventNodeTypeNames.has(name)) return `node ${name} belongs in an emission graph`;
        if (!implementations.has(name)) return `node ${name} has no GPU version`;
        if (name === 'particleProperty') {
            const property = node.data.property;
            if (!PARTICLE_FIELDS[property]) return `particle property ${property} is not simulated on the GPU`;
            if (property === 'life' && node.inputs[0] !== undefined) {
                return 'writing the particle life is not supported on the GPU (slots are freed on the CPU)';
            }
        }
        if (name === 'graphProperty' && node.inputs[0] !== undefined) {
            return 'writing graph properties is not supported on the GPU';
        }
        for (const input of node.inputs) {
            if (input instanceof Adapter && !input.isInput) return 'malformed adapter';
        }
    }
    return null;
}

function inferType(value: any): NodeValueType {
    if (value instanceof Vector4) return NodeValueType.Vec4;
    if (value instanceof Vector3) return NodeValueType.Vec3;
    if (value instanceof Vector2) return NodeValueType.Vec2;
    if (typeof value === 'boolean') return NodeValueType.Boolean;
    return NodeValueType.Number;
}

/** A uniform holding a constant input, refreshed every step. */
function constantUniform(input: ConstInput, type: NodeValueType, scope: TSLGraphScope): N {
    const context = {emissionState: scope.system.emissionState, graph: scope.system.properties};
    const read = () => input.getValue(context);
    if (type === NodeValueType.AnyType || type === NodeValueType.NullableAnyType) type = inferType(read());
    switch (type) {
        case NodeValueType.Vec2:
            return scope.ctx.vec4(() => {
                const v = read();
                return {x: v.x, y: v.y, z: 0, w: 0};
            }).xy;
        case NodeValueType.Vec3:
            return scope.ctx.vec3(read);
        case NodeValueType.Vec4:
            return scope.ctx.vec4(read);
        case NodeValueType.Boolean:
            return scope.ctx.float(() => (read() ? 1 : 0)).greaterThan(0.5);
        default:
            return scope.ctx.float(() => Number(read()));
    }
}

function zeroOf(type: NodeValueType): N {
    switch (type) {
        case NodeValueType.Vec2:
            return vec2(0);
        case NodeValueType.Vec3:
            return vec3(0);
        case NodeValueType.Vec4:
            return vec4(0);
        case NodeValueType.Boolean:
            return bool(false);
        default:
            return float(0);
    }
}

/**
 * Emits the TSL code of `graph` (in the update kernel of the GPU simulation).
 */
export function compileGraphToTSL(graph: NodeGraph, scope: TSLGraphScope) {
    const results = new Map<Node, N[]>();
    const sourceValue = (source: Node | Adapter, index: number): N => {
        if (source instanceof Adapter) {
            const vector = results.get(source.node)![source.paramIndex];
            return vector[COMPONENTS[index]];
        }
        return results.get(source)![index];
    };

    const order = graphOrder.getExecutionOrder(graph);
    const indexOf = new Map<Node, number>(order.map((node, i) => [node, i]));
    for (const node of order) {
        // the shape of the graph: node type, signature, settings and wiring (constants are parameters)
        const wiring = node.inputs.map((input) => {
            if (input instanceof Wire) {
                const source = input.input instanceof Adapter ? input.input.node : input.input;
                return `${indexOf.get(source as Node)}.${input.inputIndex}${input.input instanceof Adapter ? 'a' : ''}`;
            }
            if (input instanceof Adapter) return 'adapter';
            return input === undefined ? '-' : 'c';
        });
        scope.ctx.token(
            [node.definition.name, node.signatureIndex, node.data.property, node.data.type, ...wiring].join(':')
        );
        const inputTypes = node.inputTypes;
        const inputs = node.inputs.map((input, j) => {
            if (input instanceof Wire) return sourceValue(input.input, input.inputIndex);
            if (input instanceof Adapter) {
                const components = input.inputs.map((wire) => (wire ? sourceValue(wire.input, wire.inputIndex) : float(0)));
                return components.length === 2
                    ? vec2(...components)
                    : components.length === 3
                      ? vec3(...components)
                      : components.length === 4
                        ? vec4(...components)
                        : components[0];
            }
            if (input !== undefined) {
                const type = node.definition.name === 'particleProperty' ? node.data.type : inputTypes[j];
                return constantUniform(input, type, scope);
            }
            // an unconnected property input means "read only"; other unconnected inputs are zero
            return node.definition.name === 'particleProperty' || node.definition.name === 'graphProperty'
                ? undefined
                : zeroOf(inputTypes[j]);
        });
        const implementation = implementations.get(node.definition.name);
        if (!implementation) throw new Error(`TSLGraphCompiler: node ${node.definition.name} has no GPU version`);
        // snapshot every output, so later writes of particle properties do not change values read before
        const outputs = implementation({node, inputs, scope}).map((output) =>
            output && output.toVar ? output.toVar() : output
        );
        results.set(node, outputs);
    }
}

/**
 * The GPU simulation program of a {@link NodeVFX}: its update graph compiled to TSL.
 */
export function createNodeGraphProgram(system: NodeVFX): GPUSimulationProgram {
    return {
        support() {
            return getTSLGraphSupport(system.updateGraph);
        },
        usesNoiseState() {
            return false;
        },
        estimateParticleCount() {
            return system.maxParticles;
        },
        watch(ctx) {
            // edits rebuild the code; the code's shape is recorded node by node in compileGraphToTSL
            ctx.watch(() => system.updateGraph, false);
            ctx.watch(() => system.updateGraph.revision, false);
        },
        compile(ctx, p) {
            compileGraphToTSL(system.updateGraph, {ctx, p, system});
        },
    };
}

registerGPUSimulationProgram((system: any) =>
    system && system.isNodeVFX === true ? createNodeGraphProgram(system as NodeVFX) : null
);
