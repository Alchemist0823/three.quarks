import {BaseCompiler} from './BaseCompiler';
import {ExecutionContext, NodeType} from './NodeDef';
import {NodeGraph} from './NodeGraph';
import {Adapter, ConstInput, Node, Wire} from './Node';
import {Vector2, Vector3, Vector4} from "three";
import {NodeValueType} from "./NodeValueType";

type buildFunction = (node: Node, inputs: string[], context: ExecutionContext) => string;

interface NodeBuilder {
    buildBySigIndex: buildFunction[];
}

const nodeBuilders: { [key: string]: NodeBuilder } = {
    add: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `(${inputs[0]} + ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} + ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} + ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} + ${inputs[1]})`;
            }
        ],
    },
    subtract: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `(${inputs[0]} - ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} - ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} - ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} - ${inputs[1]})`;
            }
        ],
    },
    mul: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `(${inputs[0]} * ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} * ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} * ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} * ${inputs[1]})`;
            }
        ],
    },
    div: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `(${inputs[0]} / ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} / ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} / ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `(${inputs[0]} / ${inputs[1]})`;
            }
        ],
    },
    power: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `pow(${inputs[0]}, ${inputs[1]})`;
            }
        ]
    },
    sqrt: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `sqrt(${inputs[0]})`;
            }
        ]
    },
    sin: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `sin(${inputs[0]})`;
            }
        ]
    },
    cos: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `cos(${inputs[0]})`;
            }
        ]
    },
    tan: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `tan(${inputs[0]})`;
            }
        ]
    },
    asin: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `asin(${inputs[0]})`;
            }
        ]
    },
    acos: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `acos(${inputs[0]})`;
            }
        ]
    },
    atan: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `atan(${inputs[0]})`;
            }
        ]
    },
    atan2: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `atan(${inputs[0]}, ${inputs[1]})`;
            }
        ]
    },

    abs: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `abs(${inputs[0]})`;
            }
        ],
    },
    floor: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `floor(${inputs[0]})`;
            }
        ],
    },
    ceil: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `ceil(${inputs[0]})`;
            }
        ],
    },
    round: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `round(${inputs[0]})`;
            }
        ],

    },
    min: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `min(${inputs[0]}, ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `min(${inputs[0]}, ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `min(${inputs[0]}, ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `min(${inputs[0]}, ${inputs[1]})`;
            }
        ]
    },
    max: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `max(${inputs[0]}, ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `max(${inputs[0]}, ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `max(${inputs[0]}, ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `max(${inputs[0]}, ${inputs[1]})`;
            }
        ]
    },
    clamp: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `clamp(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
            (node, inputs, context) => {
                return `clamp(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
            (node, inputs, context) => {
                return `clamp(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
            (node, inputs, context) => {
                return `clamp(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
        ]
    },
    mix: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `mix(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
            (node, inputs, context) => {
                return `mix(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
            (node, inputs, context) => {
                return `mix(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
            (node, inputs, context) => {
                return `mix(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
        ]
    },
    step: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `step(${inputs[0]}, ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `step(${inputs[0]}, ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `step(${inputs[0]}, ${inputs[1]})`;
            },
            (node, inputs, context) => {
                return `step(${inputs[0]}, ${inputs[1]})`;
            }
        ]
    },
    smoothstep: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `smoothstep(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
            (node, inputs, context) => {
                return `smoothstep(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
            (node, inputs, context) => {
                return `smoothstep(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            },
            (node, inputs, context) => {
                return `smoothstep(${inputs[0]}, ${inputs[1]}, ${inputs[2]})`;
            }
        ]
    },
    length: {
        buildBySigIndex: [
            (node, inputs, context) => {
                return `length(${inputs[0]})`;
            },
            (node, inputs, context) => {
                return `length(${inputs[0]})`;
            },
            (node, inputs, context) => {
                return `length(${inputs[0]})`;
            }
        ]
    },
    particleProperty: {
        buildBySigIndex: [
            (node, inputs, context) => {
                if (node.inputs[0] instanceof Wire) {
                    return `particle.${node.data.property} = ` + inputs[0];
                } else {
                    return `particle.${node.data.property}`;
                }
            }
        ]
    }
}

class WebGPUCompiler extends BaseCompiler {
    constructor() {
        super();
    }

    protected nodeResult = new Map<Node, string>();

    private buildPredefinedStructs(statements: string[], graph: NodeGraph, context: ExecutionContext) {
        statements.push("struct SimulationParams {");
        statements.push("    deltaTime : f32,");
        statements.push("    seed : vec4<f32>,");
        statements.push("}");

        statements.push("struct Particle {");
        graph.outputNodes.forEach((node) => {
          if (node.definition.name === "particleProperty"
              && node.data.property !== "position"
              && node.data.property !== "color"
              && node.data.property !== "life"
              && node.data.property !== "age") {
            statements.push(`    ${node.data.property}: ${this.getTypeFromNodeType(node.data.type)},`);
          }
        })
        statements.push("    position: vec3<f32>,");
        statements.push("    color: vec3<f32>,");
        statements.push("    life: f32,");
        statements.push("    age: f32,");
        statements.push("}");
        statements.push("struct Particles {");
        statements.push("    particles : array<Particle>,");
        statements.push("}");
    }

    private buildHeader(statements: string[], graph: NodeGraph, context: ExecutionContext) {
        statements.push(libraryCode);

        this.buildPredefinedStructs(statements, graph, context);

        statements.push("@binding(0) @group(0) var<uniform> sim_params : SimulationParams;");
        statements.push("@binding(1) @group(0) var<storage, read_write> data : Particles;");

        statements.push("@compute @workgroup_size(64)");
        statements.push("fn simulate(@builtin(global_invocation_id) global_invocation_id : vec3<u32>) {");
        statements.push("  let idx = global_invocation_id.x;");
        statements.push("  init_rand(idx, sim_params.seed);");
    }

    private buildWebGPUCode(graph: NodeGraph, context: ExecutionContext) {
        const statements: string[] = [];

        this.buildHeader(statements, graph, context);

        for (let i = 0; i < graph.nodesInOrder.length; i++) {
            const currentNode = graph.nodesInOrder[i];
            let nodeBuilder = nodeBuilders[currentNode.definition.name].buildBySigIndex[currentNode.signatureIndex];
            const inputs: string[] = [];
            for (let j = 0; j < currentNode.inputs.length; j++) {
                if (currentNode.inputs[j] instanceof Wire) {
                    const input = (currentNode.inputs[j] as Wire).input;
                    if (input instanceof Node) {
                        inputs.push(this.nodeResult.get(input) as string);
                    } else {
                        inputs.push(this.buildFromAdapter(input, statements, context));
                    }
                } else if (currentNode.inputs[j] !== undefined) {
                    inputs.push(this.buildFromValue((currentNode.inputs[j] as ConstInput).getValue(context)));
                } else {
                    throw new Error(`Node ${currentNode.id} misses input on index ${j}`);
                }
            }
            const result = nodeBuilder(currentNode, inputs, context);
            if (currentNode.outputs.length === 1) {
                if (currentNode.outputs[0].length > 0) { // TODO: output is already stored in a variable
                    const type = this.getTypeFromNodeType(currentNode.outputTypes[0]);
                    statements.push(`${type} v${statements.length} = ${result};`);
                    this.nodeResult.set(currentNode, "v" + (statements.length - 1));
                } else {
                    this.nodeResult.set(currentNode, result);
                }
            } else if (currentNode.outputs.length > 1) {

            }
        }
    }

    run(graph: NodeGraph, context: ExecutionContext) {
        if (!graph.compiled) {
            this.buildExecutionOrder(graph, context);
        }
        this.buildWebGPUCode(graph, context);
    }

    private buildFromValue(input: any) {
        if (typeof input === "number") {
            return input.toString();
        } else if (input instanceof Vector2) {
            return `vec2<f32>(${input.x}, ${input.y})`;
        } else if (input instanceof Vector3) {
            return `vec3<f32>(${input.x}, ${input.y}, ${input.z})`;
        } else if (input instanceof Vector4) {
            return `vec4<f32>(${input.x}, ${input.y}, ${input.z}, ${input.w})`;
        } else {
            throw new Error(`Unknown value type ${typeof input}`);
        }
    }

    private getTypeFromNodeType(nodeValueType: NodeValueType) {
        switch (nodeValueType) {
            case NodeValueType.Number:
                return 'f32';
            case NodeValueType.Vec2:
                return 'vec<f32>';
            case NodeValueType.Vec3:
                return 'vec3<f32>';
            case NodeValueType.Vec4:
                return 'vec4<f32>';
            default:
                throw new Error(`Unknown node value type ${nodeValueType}`);
        }
    }

    private buildFromAdapter(adapter: Adapter, statements: string[], context: ExecutionContext) {
        if (adapter.isInput) {
            switch (adapter.node.definition.type) {
                case NodeType.Storage:
                    for (let i = 0; i < NodeTypeToComponents.get(adapter.type)!; i++) {
                        if (adapter.inputs[i] instanceof Wire) {
                            const builder = nodeBuilders[adapter.node.definition.name].buildBySigIndex[adapter.node.signatureIndex];
                            context.param = ComponentIndexToCode[i];
                            statements.push(builder(adapter.node, [this.getResult(adapter.inputs[i] as Wire)], context));
                        }
                    }
                    break;
                case NodeType.Variable:
                case NodeType.Expression:
                    let result = "";
                    for (let i = 0; i < NodeTypeToComponents.get(adapter.type)! - 1; i++) {
                        result = this.getResult(adapter.inputs[i] as Wire) + ", ";
                    }
                    result += this.getResult(adapter.inputs[NodeTypeToComponents.get(adapter.type)! - 1] as Wire);
                    statements.push(`${this.getTypeFromNodeType(adapter.type)}(${result})`);
            }
        }
        return "";
    }

    private getResult(wire: Wire): string {
        const input = wire.input;
        if (input instanceof Adapter) {
            if (input.isInput) {
                throw new Error(`node ${input.node.id}'s output adapter has to be output`);
            } else {
                return this.nodeResult.get(input.node) + "." + ComponentIndexToCode[input.outputs.findIndex((wires) => wires.includes(wire))];
            }
        } else {
            return this.nodeResult.get(input)!;
        }
    }
}

const NodeTypeToComponents = new Map([
    [NodeValueType.Vec2, 2],
    [NodeValueType.Vec3, 3],
    [NodeValueType.Vec4, 4],
]);


const ComponentIndexToCode = ['x', 'y', 'z', 'w'];

const libraryCode = `
var<private> rand_seed : vec2<f32>;

fn init_rand(invocation_id : u32, seed : vec4<f32>) {
  rand_seed = seed.xz;
  rand_seed = fract(rand_seed * cos(35.456+f32(invocation_id) * seed.yw));
  rand_seed = fract(rand_seed * cos(41.235+f32(invocation_id) * seed.xw));
}

fn rand() -> f32 {
  rand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);
  rand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);
  return rand_seed.y;
}
`;

const EXAMPLE_CODE = `
struct SimulationParams {
  deltaTime : f32,
  seed : vec4<f32>,
}

struct Particle {
  position : vec3<f32>,
  lifetime : f32,
  color    : vec4<f32>,
  velocity : vec3<f32>,
}

struct Particles {
  particles : array<Particle>,
}

@binding(0) @group(0) var<uniform> sim_params : SimulationParams;
@binding(1) @group(0) var<storage, read_write> data : Particles;
@binding(2) @group(0) var texture : texture_2d<f32>;

@compute @workgroup_size(64)
fn simulate(@builtin(global_invocation_id) global_invocation_id : vec3<u32>) {
  let idx = global_invocation_id.x;

  init_rand(idx, sim_params.seed);

  var particle = data.particles[idx];

  // Apply gravity
  particle.velocity.z = particle.velocity.z - sim_params.deltaTime * 0.5;

  // Basic velocity integration
  particle.position = particle.position + sim_params.deltaTime * particle.velocity;

  // Age each particle. Fade out before vanishing.
  particle.lifetime = particle.lifetime - sim_params.deltaTime;
  particle.color.a = smoothstep(0.0, 0.5, particle.lifetime);

  // If the lifetime has gone negative, then the particle is dead and should be
  // respawned.
  if (particle.lifetime < 0.0) {
    // Use the probability map to find where the particle should be spawned.
    // Starting with the 1x1 mip level.
    var coord : vec2<i32>;
    for (var level = u32(textureNumLevels(texture) - 1); level > 0; level--) {
      // Load the probability value from the mip-level
      // Generate a random number and using the probabilty values, pick the
      // next texel in the next largest mip level:
      //
      // 0.0    probabilites.r    probabilites.g    probabilites.b   1.0
      //  |              |              |              |              |
      //  |   TOP-LEFT   |  TOP-RIGHT   | BOTTOM-LEFT  | BOTTOM_RIGHT |
      //
      let probabilites = textureLoad(texture, coord, level);
      let value = vec4<f32>(rand());
      let mask = (value >= vec4<f32>(0.0, probabilites.xyz)) & (value < probabilites);
      coord = coord * 2;
      coord.x = coord.x + select(0, 1, any(mask.yw)); // x  y
      coord.y = coord.y + select(0, 1, any(mask.zw)); // z  w
    }
    let uv = vec2<f32>(coord) / vec2<f32>(textureDimensions(texture));
    particle.position = vec3<f32>((uv - 0.5) * 3.0 * vec2<f32>(1.0, -1.0), 0.0);
    particle.color = textureLoad(texture, coord, 0);
    particle.velocity.x = (rand() - 0.5) * 0.1;
    particle.velocity.y = (rand() - 0.5) * 0.1;
    particle.velocity.z = rand() * 0.3;
    particle.lifetime = 0.5 + rand() * 3.0;
  }

  // Store the new particle value
  data.particles[idx] = particle;
}`;
