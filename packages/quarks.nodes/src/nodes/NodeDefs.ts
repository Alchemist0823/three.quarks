import {Vector2, Vector3, Vector4} from 'quarks.core';
import {NodeValueType} from './NodeValueType';
import {NodeDef, NodeType} from './NodeDef';

export const NodeTypes: {[key: string]: NodeDef} = {};

// Math
const addNode = new NodeDef('add', NodeType.Expression);
addNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) + (inputs[1] as number);
    }
);
addNode.addSignature(
    [NodeValueType.Vec2, NodeValueType.Vec2],
    [NodeValueType.Vec2],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector2).addVectors(inputs[0] as Vector2, inputs[1] as Vector2);
    }
);
addNode.addSignature(
    [NodeValueType.Vec3, NodeValueType.Vec3],
    [NodeValueType.Vec3],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector3).addVectors(inputs[0] as Vector3, inputs[1] as Vector3);
    }
);
addNode.addSignature(
    [NodeValueType.Vec4, NodeValueType.Vec4],
    [NodeValueType.Vec4],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector4).addVectors(inputs[0] as Vector4, inputs[1] as Vector4);
    }
);
NodeTypes['add'] = addNode;

const subNode = new NodeDef('sub', NodeType.Expression);
subNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) - (inputs[1] as number);
    }
);
subNode.addSignature(
    [NodeValueType.Vec2, NodeValueType.Vec2],
    [NodeValueType.Vec2],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector2).subVectors(inputs[0] as Vector2, inputs[1] as Vector2);
    }
);
subNode.addSignature(
    [NodeValueType.Vec3, NodeValueType.Vec3],
    [NodeValueType.Vec3],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector3).subVectors(inputs[0] as Vector3, inputs[1] as Vector3);
    }
);
subNode.addSignature(
    [NodeValueType.Vec4, NodeValueType.Vec4],
    [NodeValueType.Vec4],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector4).subVectors(inputs[0] as Vector4, inputs[1] as Vector4);
    }
);
NodeTypes['sub'] = subNode;

const mulNode = new NodeDef('mul', NodeType.Expression);
mulNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) * (inputs[1] as number);
    }
);
mulNode.addSignature(
    [NodeValueType.Vec2, NodeValueType.Number],
    [NodeValueType.Vec2],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector2).copy(inputs[0] as Vector2).multiplyScalar(inputs[1] as number);
    }
);
mulNode.addSignature(
    [NodeValueType.Vec3, NodeValueType.Number],
    [NodeValueType.Vec3],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector3).copy(inputs[0] as Vector3).multiplyScalar(inputs[1] as number);
    }
);
mulNode.addSignature(
    [NodeValueType.Vec4, NodeValueType.Number],
    [NodeValueType.Vec4],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector4).copy(inputs[0] as Vector4).multiplyScalar(inputs[1] as number);
    }
);
NodeTypes['mul'] = mulNode;

const divNode = new NodeDef('div', NodeType.Expression);
divNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) / (inputs[1] as number);
    }
);
divNode.addSignature(
    [NodeValueType.Vec2, NodeValueType.Number],
    [NodeValueType.Vec2],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector2).copy(inputs[0] as Vector2).divideScalar(inputs[1] as number);
    }
);
divNode.addSignature(
    [NodeValueType.Vec3, NodeValueType.Number],
    [NodeValueType.Vec3],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector3).copy(inputs[0] as Vector3).divideScalar(inputs[1] as number);
    }
);
divNode.addSignature(
    [NodeValueType.Vec4, NodeValueType.Number],
    [NodeValueType.Vec4],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector4).copy(inputs[0] as Vector4).divideScalar(inputs[1] as number);
    }
);
NodeTypes['div'] = divNode;

const sinNode = new NodeDef('sin', NodeType.Expression);
sinNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = Math.sin(inputs[0] as number);
});
NodeTypes['sin'] = sinNode;

const cosNode = new NodeDef('cos', NodeType.Expression);
cosNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = Math.cos(inputs[0] as number);
});
NodeTypes['cos'] = cosNode;

const tanNode = new NodeDef('tan', NodeType.Expression);
tanNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = Math.tan(inputs[0] as number);
});
NodeTypes['tan'] = tanNode;

const absNode = new NodeDef('abs', NodeType.Expression);
absNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = Math.abs(inputs[0] as number);
});
NodeTypes['abs'] = absNode;

const minNode = new NodeDef('min', NodeType.Expression);
minNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = Math.min(inputs[0] as number, inputs[1] as number);
    }
);
NodeTypes['min'] = minNode;

const maxNode = new NodeDef('max', NodeType.Expression);
maxNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = Math.max(inputs[0] as number, inputs[1] as number);
    }
);
NodeTypes['max'] = maxNode;

const dot = new NodeDef('dot', NodeType.Expression);
dot.addSignature([NodeValueType.Vec2, NodeValueType.Vec2], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (inputs[0] as Vector2).dot(inputs[1] as Vector2);
});
dot.addSignature([NodeValueType.Vec3, NodeValueType.Vec3], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (inputs[0] as Vector3).dot(inputs[1] as Vector3);
});
dot.addSignature([NodeValueType.Vec4, NodeValueType.Vec4], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (inputs[0] as Vector4).dot(inputs[1] as Vector4);
});
NodeTypes['dot'] = dot;

const cross = new NodeDef('cross', NodeType.Expression);
cross.addSignature([NodeValueType.Vec3, NodeValueType.Vec3], [NodeValueType.Vec3], (context, data, inputs, outputs) => {
    (outputs[0] as Vector3).crossVectors(inputs[0] as Vector3, inputs[1] as Vector3);
});
NodeTypes['cross'] = cross;

const length = new NodeDef('length', NodeType.Expression);
length.addSignature([NodeValueType.Vec2], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (inputs[0] as Vector2).length();
});
length.addSignature([NodeValueType.Vec3], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (inputs[0] as Vector3).length();
});
length.addSignature([NodeValueType.Vec4], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (inputs[0] as Vector4).length();
});
NodeTypes['length'] = length;

const lengthSq = new NodeDef('lengthSq', NodeType.Expression);
lengthSq.addSignature([NodeValueType.Vec2], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (inputs[0] as Vector2).lengthSq();
});
lengthSq.addSignature([NodeValueType.Vec3], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (inputs[0] as Vector3).lengthSq();
});
lengthSq.addSignature([NodeValueType.Vec4], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (inputs[0] as Vector4).lengthSq();
});
NodeTypes['lengthSq'] = lengthSq;

const normalize = new NodeDef('normalize', NodeType.Expression);
normalize.addSignature([NodeValueType.Vec2], [NodeValueType.Vec2], (context, data, inputs, outputs) => {
    (outputs[0] as Vector2).copy(inputs[0] as Vector2).normalize();
});
normalize.addSignature([NodeValueType.Vec3], [NodeValueType.Vec3], (context, data, inputs, outputs) => {
    (outputs[0] as Vector3).copy(inputs[0] as Vector3).normalize();
});
normalize.addSignature([NodeValueType.Vec4], [NodeValueType.Vec4], (context, data, inputs, outputs) => {
    (outputs[0] as Vector4).copy(inputs[0] as Vector4).normalize();
});
NodeTypes['normalize'] = normalize;

const distance = new NodeDef('distance', NodeType.Expression);
distance.addSignature(
    [NodeValueType.Vec2, NodeValueType.Vec2],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as Vector2).distanceTo(inputs[1] as Vector2);
    }
);
distance.addSignature(
    [NodeValueType.Vec3, NodeValueType.Vec3],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as Vector3).distanceTo(inputs[1] as Vector3);
    }
);
NodeTypes['distance'] = distance;

// Logic
const andNode = new NodeDef('and', NodeType.Expression);
andNode.addSignature(
    [NodeValueType.Boolean, NodeValueType.Boolean],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as boolean) && (inputs[1] as boolean);
    }
);
NodeTypes['and'] = andNode;

const orNode = new NodeDef('or', NodeType.Expression);
orNode.addSignature(
    [NodeValueType.Boolean, NodeValueType.Boolean],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as boolean) || (inputs[1] as boolean);
    }
);
NodeTypes['or'] = orNode;

const notNode = new NodeDef('not', NodeType.Expression);
notNode.addSignature([NodeValueType.Boolean], [NodeValueType.Boolean], (context, data, inputs, outputs) => {
    outputs[0] = !(inputs[0] as boolean);
});
NodeTypes['not'] = notNode;

const equalNode = new NodeDef('equal', NodeType.Expression);
equalNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) === (inputs[1] as number);
    }
);
equalNode.addSignature(
    [NodeValueType.Vec2, NodeValueType.Vec2],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as Vector2).equals(inputs[1] as Vector2);
    }
);
equalNode.addSignature(
    [NodeValueType.Vec3, NodeValueType.Vec3],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as Vector3).equals(inputs[1] as Vector3);
    }
);
equalNode.addSignature(
    [NodeValueType.Vec4, NodeValueType.Vec4],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as Vector4).equals(inputs[1] as Vector4);
    }
);
NodeTypes['equal'] = equalNode;

const lessThanNode = new NodeDef('lessThan', NodeType.Expression);
lessThanNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) < (inputs[1] as number);
    }
);
NodeTypes['lessThan'] = lessThanNode;

const greaterThanNode = new NodeDef('greaterThan', NodeType.Expression);
greaterThanNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) > (inputs[1] as number);
    }
);
NodeTypes['greaterThan'] = greaterThanNode;

const lessThanOrEqualNode = new NodeDef('lessThanOrEqual', NodeType.Expression);
lessThanOrEqualNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) <= (inputs[1] as number);
    }
);
NodeTypes['lessThanOrEqual'] = lessThanOrEqualNode;

const greaterThanOrEqualNode = new NodeDef('greaterThanOrEqual', NodeType.Expression);
greaterThanOrEqualNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) >= (inputs[1] as number);
    }
);
NodeTypes['greaterThanOrEqual'] = greaterThanOrEqualNode;

const ifNode = new NodeDef('if', NodeType.Expression);
ifNode.addSignature(
    [NodeValueType.Boolean, NodeValueType.AnyType, NodeValueType.AnyType],
    [NodeValueType.AnyType],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as boolean) ? inputs[1] : inputs[2];
    }
);
NodeTypes['if'] = ifNode;

// Constants
const numberNode = new NodeDef('number', NodeType.Expression);
numberNode.addSignature([], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = data.value;
});
NodeTypes['number'] = numberNode;

const vec2Node = new NodeDef('vec2', NodeType.Expression);
vec2Node.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Vec2],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector2).x = inputs[0] as number;
        (outputs[0] as Vector2).y = inputs[1] as number;
    }
);
NodeTypes['vec2'] = vec2Node;

const vec3Node = new NodeDef('vec3', NodeType.Expression);
vec3Node.addSignature(
    [NodeValueType.Number, NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Vec3],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector3).x = inputs[0] as number;
        (outputs[0] as Vector3).y = inputs[1] as number;
        (outputs[0] as Vector3).z = inputs[2] as number;
    }
);
NodeTypes['vec3'] = vec3Node;

const vec4Node = new NodeDef('vec4', NodeType.Expression);
vec4Node.addSignature(
    [NodeValueType.Number, NodeValueType.Number, NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Vec4],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector4).x = inputs[0] as number;
        (outputs[0] as Vector4).y = inputs[1] as number;
        (outputs[0] as Vector4).z = inputs[2] as number;
        (outputs[0] as Vector4).w = inputs[3] as number;
    }
);
NodeTypes['vec4'] = vec4Node;
const boolNode = new NodeDef('bool', NodeType.Expression);
boolNode.addSignature([], [NodeValueType.Boolean], (context, data, inputs, outputs) => {
    outputs[0] = data.value;
});
NodeTypes['bool'] = boolNode;

// Particles
const particlePropertyNode = new NodeDef('particleProperty', NodeType.Storage);
particlePropertyNode.addSignature(
    [NodeValueType.NullableAnyType],
    [NodeValueType.NullableAnyType],
    (context, data, inputs, outputs) => {
        if (inputs[0] !== undefined) {
            if (data.type !== NodeValueType.Number) {
                (context.particle as any)[data.property].copy(inputs[0]);
            } else {
                (context.particle as any)[data.property] = inputs[0];
            }
        }
        if ((context.particle as any)[data.property] !== undefined) {
            if (data.type !== NodeValueType.Number) {
                (outputs[0] as any).copy((context.particle as any)[data.property]);
            } else {
                outputs[0] = (context.particle as any)[data.property];
            }
        }
    }
);
NodeTypes['particleProperty'] = particlePropertyNode;

// emit
const emitNode = new NodeDef('emit', NodeType.Function);
emitNode.addSignature([NodeValueType.EventStream], [], (context, data, inputs, outputs) => {
    const arr = inputs[0] as Array<any>;
    for (let i = 0; i < arr.length; i++) {
        context.signal(i, arr[i]);
    }
});
NodeTypes['emit'] = emitNode;

const graphPropertyNode = new NodeDef('graphProperty', NodeType.Storage);
graphPropertyNode.addSignature(
    [NodeValueType.NullableAnyType],
    [NodeValueType.NullableAnyType],
    (context, data, inputs, outputs) => {
        if (inputs[0] !== undefined) {
            if (data.type !== NodeValueType.Number) {
                (context.graph as any)[data.property].copy(inputs[0]);
            } else {
                (context.graph as any)[data.property] = inputs[0];
            }
        }
        if ((context.graph as any)[data.property] !== undefined) {
            if (data.type !== NodeValueType.Number) {
                (outputs[0] as any).copy((context.graph as any)[data.property]);
            } else {
                outputs[0] = (context.graph as any)[data.property];
            }
        }
    }
);
NodeTypes['graphProperty'] = graphPropertyNode;

const startEventNode = new NodeDef('startEvent', NodeType.Expression);
startEventNode.addSignature([], [NodeValueType.EventStream], (context, data, inputs, outputs) => {
    outputs[0] = [{type: 'start'}];
});
NodeTypes['startEvent'] = startEventNode;

const repeaterNode = new NodeDef('repeater', NodeType.Expression);
repeaterNode.addSignature(
    [NodeValueType.EventStream, NodeValueType.Number],
    [NodeValueType.EventStream],
    (context, data, inputs, outputs) => {
        const arr = inputs[0] as Array<any>;
        const count = inputs[1] as number;
        const result = [];
        for (let j = 0; j < arr.length; j++) {
            for (let i = 0; i < count; i++) {
                result.push(arr[j]);
            }
        }
        outputs[0] = result;
    }
);
NodeTypes['repeater'] = repeaterNode;

const timeNode = new NodeDef('time', NodeType.Expression);
timeNode.addSignature([], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = context.emissionState.time;
});
NodeTypes['time'] = timeNode;

const deltaNode = new NodeDef('delta', NodeType.Expression);
deltaNode.addSignature([], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = context.delta;
});
NodeTypes['delta'] = deltaNode;

// input output
const outputNode = new NodeDef('output', NodeType.Storage);
outputNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = inputs[0];
});
outputNode.addSignature([NodeValueType.Vec2], [NodeValueType.Vec2], (context, data, inputs, outputs) => {
    outputs[0] = inputs[0];
});
outputNode.addSignature([NodeValueType.Vec3], [NodeValueType.Vec3], (context, data, inputs, outputs) => {
    outputs[0] = inputs[0];
});
outputNode.addSignature([NodeValueType.Vec4], [NodeValueType.Vec4], (context, data, inputs, outputs) => {
    outputs[0] = inputs[0];
});
outputNode.addSignature([NodeValueType.Boolean], [NodeValueType.Boolean], (context, data, inputs, outputs) => {
    outputs[0] = inputs[0];
});
NodeTypes['output'] = outputNode;

// More math
const lerpNode = new NodeDef('lerp', NodeType.Expression);
lerpNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] =
            (inputs[0] as number) * (1 - (inputs[2] as number)) + (inputs[1] as number) * (inputs[2] as number);
    }
);
lerpNode.addSignature(
    [NodeValueType.Vec2, NodeValueType.Vec2, NodeValueType.Number],
    [NodeValueType.Vec2],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector2).lerpVectors(inputs[0] as Vector2, inputs[1] as Vector2, inputs[2] as number);
    }
);
lerpNode.addSignature(
    [NodeValueType.Vec3, NodeValueType.Vec3, NodeValueType.Number],
    [NodeValueType.Vec3],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector3).lerpVectors(inputs[0] as Vector3, inputs[1] as Vector3, inputs[2] as number);
    }
);
lerpNode.addSignature(
    [NodeValueType.Vec4, NodeValueType.Vec4, NodeValueType.Number],
    [NodeValueType.Vec4],
    (context, data, inputs, outputs) => {
        (outputs[0] as Vector4).lerpVectors(inputs[0] as Vector4, inputs[1] as Vector4, inputs[2] as number);
    }
);
NodeTypes['lerp'] = lerpNode;

const normalD = (x: number) => {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(x * x * -0.5);
};
const normalDistributionNode = new NodeDef('normDistrib', NodeType.Expression);
normalDistributionNode.addSignature(
    [NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = normalD(inputs[0] as number);
    }
);
NodeTypes['normDistrib'] = normalDistributionNode;

const normcdfNode = new NodeDef('normcdf', NodeType.Expression);
normcdfNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    // constants
    let x = inputs[0] as number;
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    // Save the sign of x
    let sign = 1;
    if (x < 0) sign = -1;
    x = Math.abs(x) / Math.sqrt(2.0);

    // A&S formula 7.1.26
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    outputs[0] = 0.5 * (1.0 + sign * y);
});
NodeTypes['normcdf'] = normcdfNode;

const normcdfInvNode = new NodeDef('normcdfInv', NodeType.Expression);

const rationalApproximation = (t: number) => {
    // Abramowitz and Stegun formula 26.2.23.
    // The absolute value of the error should be less than 4.5 e-4.
    const c = [2.515517, 0.802853, 0.010328];
    const d = [1.432788, 0.189269, 0.001308];
    return t - ((c[2] * t + c[1]) * t + c[0]) / (((d[2] * t + d[1]) * t + d[0]) * t + 1.0);
};

const normcdfInv = (p: number) => {
    // See article above for explanation of this section.
    if (p < 0.5) {
        // F^-1(p) = - G^-1(p)
        return -rationalApproximation(Math.sqrt(-2.0 * Math.log(p)));
    } else {
        // F^-1(p) = G^-1(1-p)
        return rationalApproximation(Math.sqrt(-2.0 * Math.log(1 - p)));
    }
};

normcdfInvNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = normcdfInv(inputs[0] as number);
});
NodeTypes['normcdfInv'] = normcdfInvNode;

const clampNode = new NodeDef('clamp', NodeType.Expression);
clampNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = Math.max(Math.min(inputs[0] as number, inputs[2] as number), inputs[1] as number);
    }
);
NodeTypes['clamp'] = clampNode;

const smoothstepNode = new NodeDef('smoothstep', NodeType.Expression);
smoothstepNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        const x = Math.max(Math.min(inputs[0] as number, inputs[2] as number), inputs[1] as number);
        outputs[0] = x * x * (3 - 2 * x);
    }
);
NodeTypes['smoothstep'] = smoothstepNode;

const randomNode = new NodeDef('random', NodeType.Expression);
randomNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = Math.random() * ((inputs[1] as number) - (inputs[0] as number)) + (inputs[0] as number);
    }
);
randomNode.addSignature(
    [NodeValueType.Vec2, NodeValueType.Vec2],
    [NodeValueType.Vec2],
    (context, data, inputs, outputs) => {
        const random = Math.random();
        (outputs[0] as Vector2).lerpVectors(inputs[0] as Vector2, inputs[1] as Vector2, random);
    }
);
randomNode.addSignature(
    [NodeValueType.Vec3, NodeValueType.Vec3],
    [NodeValueType.Vec3],
    (context, data, inputs, outputs) => {
        const random = Math.random();
        (outputs[0] as Vector3).lerpVectors(inputs[0] as Vector3, inputs[1] as Vector3, random);
    }
);
randomNode.addSignature(
    [NodeValueType.Vec4, NodeValueType.Vec4],
    [NodeValueType.Vec4],
    (context, data, inputs, outputs) => {
        const random = Math.random();
        (outputs[0] as Vector4).lerpVectors(inputs[0] as Vector4, inputs[1] as Vector4, random);
    }
);
NodeTypes['random'] = randomNode;

const vrandNode = new NodeDef('vrand', NodeType.Expression);
vrandNode.addSignature([], [NodeValueType.Vec2], (context, data, inputs, outputs) => {
    const x = normcdfInv(Math.random());
    const y = normcdfInv(Math.random());
    const mag = Math.sqrt(x * x + y * y);
    (outputs[0] as Vector2).set(x / mag, y / mag);
});
vrandNode.addSignature([], [NodeValueType.Vec3], (context, data, inputs, outputs) => {
    const x = normcdfInv(Math.random());
    const y = normcdfInv(Math.random());
    const z = normcdfInv(Math.random());
    const mag = Math.sqrt(x * x + y * y + z * z);
    (outputs[0] as Vector3).set(x / mag, y / mag, z / mag);
});
vrandNode.addSignature([], [NodeValueType.Vec4], (context, data, inputs, outputs) => {
    const x = normcdfInv(Math.random());
    const y = normcdfInv(Math.random());
    const z = normcdfInv(Math.random());
    const w = normcdfInv(Math.random());
    const mag = Math.sqrt(x * x + y * y + z * z + w * w);
    (outputs[0] as Vector4).set(x / mag, y / mag, z / mag, w / mag);
});
NodeTypes['vrand'] = vrandNode;

const bsdfNode = new NodeDef('bsdf', NodeType.Storage);
bsdfNode.addSignature(
    [NodeValueType.Vec3, NodeValueType.Vec3, NodeValueType.Vec3, NodeValueType.Number],
    [],
    (context, data, inputs, outputs) => {}
);

NodeTypes['bsdf'] = bsdfNode;
export const OutputNodeTypeNames = new Set<string>(['output', 'particleProperty', 'graphProperty', 'emit']);
