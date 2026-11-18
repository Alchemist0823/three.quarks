/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Compiles node graphs to three.js TSL, so a {@link NodeVFX} runs in the GPU simulation of `three.quarks/webgpu`
 * (`GPUParticleBatchSimulation`) instead of the CPU {@link Interpreter}: its init graph runs in the spawn kernel (GPU
 * emission) and its update graph in the update kernel. Only the emission graph, which decides how many particles to
 * emit, stays on the CPU.
 *
 * Every node becomes TSL code in execution order; each output is stored in a shader variable, so later
 * `particleProperty` writes do not change values that were already read (same semantics as the interpreter). Constant
 * inputs and `number` nodes become uniforms refreshed every step, so editing values does not rebuild the shader;
 * structural edits do (the kernel watches the graph's `revision`).
 */
import * as TSL from 'three/tsl';
import {StorageBufferAttribute} from 'three/webgpu';
import {Vector2, Vector3, Vector4} from 'quarks.core';
import {applyEmitterTransform, registerGPUSimulationProgram} from 'three.quarks/webgpu';
import type {
    GPUCompileContext,
    GPUEmissionInput,
    GPUEmissionProgram,
    GPUParticleState,
    GPUSimulationProgram,
} from 'three.quarks/webgpu';
import {
    Adapter,
    BaseCompiler,
    ConstantInput,
    EventNodeTypeNames,
    NOISE_CHANNEL_OFFSETS,
    Node,
    NodeGraph,
    NodeValueType,
    PERLIN_PERMUTATION,
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
    normalize,
    pow,
    select,
    sign,
    sin,
    smoothstep,
    sqrt,
    step,
    storage,
    tan,
    int,
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
    /** set when the graph runs at emission (spawn kernel): the values of the particle's emission call */
    emission?: GPUEmissionInput;
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
    // stored with the velocity (same vec4)
    life: {field: 'life', written: 'velocity'},
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
// at emission: the time of the emission call (the CPU runs the init graph while the emission graph runs)
registerTSLNode('time', ({scope}) => [
    scope.emission ? scope.emission.time : scope.ctx.float(() => scope.system.emissionState.time),
]);
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
// ---- noise: the CPU `perlinNoise3` (Ken Perlin's improved noise, same permutation table), so GPU and CPU effects
// move through the same field

let permutation: N = null;

/** The permutation table as a read-only storage buffer (shared by every kernel). */
function permutationTable(): N {
    if (!permutation) {
        const table = new StorageBufferAttribute(new Uint32Array(PERLIN_PERMUTATION), 1);
        permutation = (storage as any)(table, 'uint', table.count).toReadOnly();
    }
    return permutation;
}

const fade = (t: N) => t.mul(t).mul(t).mul(t.mul(t.mul(6).sub(15)).add(10));

function gradient(hash: N, x: N, y: N, z: N): N {
    const h = hash.bitAnd(15);
    const u = select(h.lessThan(8), x, y);
    const v = select(h.lessThan(4), y, select(h.equal(12).or(h.equal(14)), x, z));
    return select(h.bitAnd(1).equal(0), u, u.negate()).add(select(h.bitAnd(2).equal(0), v, v.negate()));
}

/** `perlinNoise3(p)` in TSL. */
export function perlinNoise3TSL(p: N): N {
    const P = permutationTable();
    const at = (i: N) => P.element(i).toInt();
    const cell = floor(p).toVar();
    const X = int(cell.x).bitAnd(255);
    const Y = int(cell.y).bitAnd(255);
    const Z = int(cell.z).bitAnd(255);
    const f = p.sub(cell).toVar();
    const x = f.x,
        y = f.y,
        z = f.z;
    const u = fade(x),
        v = fade(y),
        w = fade(z);
    const A = at(X).add(Y).toVar();
    const AA = at(A).add(Z).toVar();
    const AB = at(A.add(1)).add(Z).toVar();
    const B = at(X.add(1)).add(Y).toVar();
    const BA = at(B).add(Z).toVar();
    const BB = at(B.add(1)).add(Z).toVar();
    return mix(
        mix(
            mix(gradient(at(AA), x, y, z), gradient(at(BA), x.sub(1), y, z), u),
            mix(gradient(at(AB), x, y.sub(1), z), gradient(at(BB), x.sub(1), y.sub(1), z), u),
            v
        ),
        mix(
            mix(gradient(at(AA.add(1)), x, y, z.sub(1)), gradient(at(BA.add(1)), x.sub(1), y, z.sub(1)), u),
            mix(
                gradient(at(AB.add(1)), x, y.sub(1), z.sub(1)),
                gradient(at(BB.add(1)), x.sub(1), y.sub(1), z.sub(1)),
                u
            ),
            v
        ),
        w
    );
}

registerTSLNode('noise', ({node, inputs: [position]}) => {
    if (node.outputTypes[0] === NodeValueType.Vec3) {
        const o = NOISE_CHANNEL_OFFSETS;
        return [
            vec3(
                perlinNoise3TSL(position.add(o[0])),
                perlinNoise3TSL(position.add(o[1])),
                perlinNoise3TSL(position.add(o[2]))
            ),
        ];
    }
    return [perlinNoise3TSL(position)];
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

/** Why `graph` cannot run as a GPU update or init graph, or `null`. */
export function getTSLGraphSupport(graph: NodeGraph): string | null {
    for (const node of graphOrder.getExecutionOrder(graph)) {
        const name = node.definition.name;
        if (EventNodeTypeNames.has(name)) return `node ${name} belongs in an emission graph`;
        if (!implementations.has(name)) return `node ${name} has no GPU version`;
        if (name === 'particleProperty') {
            const property = node.data.property;
            if (!PARTICLE_FIELDS[property]) return `particle property ${property} is not simulated on the GPU`;
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

// ---- particle lifetime bound ----------------------------------------------------------------------------------

/** Nodes that write the particle `life` in `graph`. */
function lifeWrites(graph: NodeGraph): Node[] {
    return graphOrder
        .getExecutionOrder(graph)
        .filter((node) => node.definition.name === 'particleProperty' && node.data.property === 'life' && node.inputs[0] !== undefined);
}

/** Upper bound of a number input, or `null` when it is not known on the CPU. */
function upperBound(input: unknown, depth = 0): number | null {
    if (depth > 16 || input === undefined) return null;
    if (input instanceof ConstantInput) {
        const value = input.getValue();
        return typeof value === 'number' ? value : null;
    }
    if (!(input instanceof Wire) || input.input instanceof Adapter) return null;
    const source = input.input as Node;
    const bound = (k: number) => upperBound(source.inputs[k], depth + 1);
    switch (source.definition.name) {
        case 'number':
            return Number(source.data.value ?? 0);
        case 'random':
        case 'max':
        case 'lerp': {
            const a = bound(0);
            const b = bound(1);
            return a === null || b === null ? null : Math.max(a, b);
        }
        case 'min': {
            const a = bound(0);
            const b = bound(1);
            return a === null ? b : b === null ? a : Math.min(a, b);
        }
        case 'clamp':
            return bound(2);
        case 'add': {
            const a = bound(0);
            const b = bound(1);
            return a === null || b === null ? null : a + b;
        }
        default:
            return null;
    }
}

/**
 * Upper bound of the lifetime of a NodeVFX's particles, seconds: the largest `life` the init and update graphs can
 * write (1, the NodeParticle default, when the graph that runs at spawn writes none). `Infinity` when a written value
 * has no bound known on the CPU; the GPU simulation then counts live particles from the GPU counters only.
 */
export function maxNodeVFXLife(system: NodeVFX): number {
    const spawnWrites = lifeWrites(system.initGraph ?? system.updateGraph);
    const writes = system.initGraph ? [...spawnWrites, ...lifeWrites(system.updateGraph)] : spawnWrites;
    let max = spawnWrites.length === 0 ? 1 : -Infinity;
    for (const node of writes) {
        const bound = upperBound(node.inputs[0]);
        if (bound === null) return Infinity;
        max = Math.max(max, bound);
    }
    return Math.max(0, max);
}

/**
 * The GPU emission of a {@link NodeVFX}: its init graph (or, without one, its update graph with `delta` 0, like the
 * CPU) compiled into the spawn kernel, followed by the emitter transform of world space effects.
 */
export function createNodeGraphEmission(system: NodeVFX): GPUEmissionProgram {
    const spawnGraph = () => system.initGraph ?? system.updateGraph;
    return {
        support() {
            const reason = getTSLGraphSupport(spawnGraph());
            return reason === null ? null : `${system.initGraph ? 'init' : 'update'} graph: ${reason}`;
        },
        watch(ctx) {
            ctx.watch(spawnGraph, false);
            ctx.watch(() => spawnGraph().revision, false);
        },
        compile(ctx, p, e) {
            compileGraphToTSL(spawnGraph(), {ctx, p, system, emission: e});
            if (ctx.worldSpace) applyEmitterTransform(p, e, p.size);
            // NodeParticles have no start values: the record holds the current ones (as for CPU spawn records)
            p.startColor.assign(p.color);
            p.startSize.assign(p.size);
        },
        maxLife() {
            return maxNodeVFXLife(system);
        },
        rangeValues(emissionState, out) {
            out.push(emissionState.time / system.duration, emissionState.time, 0);
        },
    };
}

/**
 * The GPU simulation program of a {@link NodeVFX}: its update graph compiled to TSL, and its init graph for GPU
 * emission.
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
        emission: createNodeGraphEmission(system),
    };
}

registerGPUSimulationProgram((system: any) =>
    system && system.isNodeVFX === true ? createNodeGraphProgram(system as NodeVFX) : null
);
