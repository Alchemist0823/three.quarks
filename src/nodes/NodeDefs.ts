import {Vector2, Vector3, Vector4} from 'three';
import {NodeValueType} from './NodeValueType';
import {NodeType} from './NodeType';

export const NodeTypes: {[key: string]: NodeType} = {};

// Math
let addNode = new NodeType('add');
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

let subNode = new NodeType('sub');
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

let mulNode = new NodeType('mul');
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

let divNode = new NodeType('div');
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

let sinNode = new NodeType('sin');
sinNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = Math.sin(inputs[0] as number);
});
NodeTypes['sin'] = sinNode;

let cosNode = new NodeType('cos');
cosNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = Math.cos(inputs[0] as number);
});
NodeTypes['cos'] = cosNode;

let tanNode = new NodeType('tan');
tanNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = Math.tan(inputs[0] as number);
});
NodeTypes['tan'] = tanNode;

let absNode = new NodeType('abs');
absNode.addSignature([NodeValueType.Number], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = Math.abs(inputs[0] as number);
});
NodeTypes['abs'] = absNode;

let minNode = new NodeType('min');
minNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = Math.min(inputs[0] as number, inputs[1] as number);
    }
);
NodeTypes['min'] = minNode;

let maxNode = new NodeType('max');
maxNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = Math.max(inputs[0] as number, inputs[1] as number);
    }
);
NodeTypes['max'] = maxNode;

let dot = new NodeType('dot');
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

let cross = new NodeType('cross');
cross.addSignature([NodeValueType.Vec3, NodeValueType.Vec3], [NodeValueType.Vec3], (context, data, inputs, outputs) => {
    (outputs[0] as Vector3).crossVectors(inputs[0] as Vector3, inputs[1] as Vector3);
});
NodeTypes['cross'] = cross;

let length = new NodeType('length');
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

let lengthSq = new NodeType('lengthSq');
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

let normalize = new NodeType('normalize');
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

let distance = new NodeType('distance');
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
let andNode = new NodeType('and');
andNode.addSignature(
    [NodeValueType.Boolean, NodeValueType.Boolean],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as boolean) && (inputs[1] as boolean);
    }
);
NodeTypes['and'] = andNode;

let orNode = new NodeType('or');
orNode.addSignature(
    [NodeValueType.Boolean, NodeValueType.Boolean],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as boolean) || (inputs[1] as boolean);
    }
);
NodeTypes['or'] = orNode;

let notNode = new NodeType('not');
notNode.addSignature([NodeValueType.Boolean], [NodeValueType.Boolean], (context, data, inputs, outputs) => {
    outputs[0] = !(inputs[0] as boolean);
});
NodeTypes['not'] = notNode;

let equalNode = new NodeType('equal');
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

let lessThanNode = new NodeType('lessThan');
lessThanNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) < (inputs[1] as number);
    }
);
NodeTypes['lessThan'] = lessThanNode;

let greaterThanNode = new NodeType('greaterThan');
greaterThanNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) > (inputs[1] as number);
    }
);
NodeTypes['greaterThan'] = greaterThanNode;

let lessThanOrEqualNode = new NodeType('lessThanOrEqual');
lessThanOrEqualNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) <= (inputs[1] as number);
    }
);
NodeTypes['lessThanOrEqual'] = lessThanOrEqualNode;

let greaterThanOrEqualNode = new NodeType('greaterThanOrEqual');
greaterThanOrEqualNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Boolean],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as number) >= (inputs[1] as number);
    }
);
NodeTypes['greaterThanOrEqual'] = greaterThanOrEqualNode;

let ifNode = new NodeType('if');
ifNode.addSignature(
    [NodeValueType.Boolean, NodeValueType.AnyType, NodeValueType.AnyType],
    [NodeValueType.AnyType],
    (context, data, inputs, outputs) => {
        outputs[0] = (inputs[0] as boolean) ? inputs[1] : inputs[2];
    }
);
NodeTypes['if'] = ifNode;

// Constants
let numberNode = new NodeType('number');
numberNode.addSignature([], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = data.value;
});
NodeTypes['number'] = numberNode;

let vec2Node = new NodeType('vec2');
vec2Node.addSignature([], [NodeValueType.Vec2], (context, data, inputs, outputs) => {
    outputs[0] = data.value;
});
NodeTypes['vec2'] = vec2Node;

let vec3Node = new NodeType('vec3');
vec3Node.addSignature([], [NodeValueType.Vec3], (context, data, inputs, outputs) => {
    outputs[0] = data.value;
});
NodeTypes['vec3'] = vec3Node;

let vec4Node = new NodeType('vec4');
vec4Node.addSignature([], [NodeValueType.Vec4], (context, data, inputs, outputs) => {
    outputs[0] = data.value;
});
NodeTypes['vec4'] = vec4Node;

let boolNode = new NodeType('bool');
boolNode.addSignature([], [NodeValueType.Boolean], (context, data, inputs, outputs) => {
    outputs[0] = data.value;
});
NodeTypes['bool'] = boolNode;

// Particles
let particlePositionNode = new NodeType('particlePosition');
particlePositionNode.addSignature([], [NodeValueType.Vec3], (context, data, inputs, outputs) => {
    outputs[0] = (context.particle as any)[data.property];
});
NodeTypes['particlePosition'] = particlePositionNode;

let particleVelocityNode = new NodeType('particleVelocity');
particleVelocityNode.addSignature([], [NodeValueType.Vec3], (context, data, inputs, outputs) => {
    outputs[0] = (context.particle as any)[data.property];
});
NodeTypes['particleVelocity'] = particleVelocityNode;

let particleRotationNode = new NodeType('particleRotation');
particleRotationNode.addSignature([], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (context.particle as any)[data.property];
});
NodeTypes['particleRotation'] = particleRotationNode;

let particleAgeNode = new NodeType('particleAge');
particleAgeNode.addSignature([], [NodeValueType.Number], (context, data, inputs, outputs) => {
    outputs[0] = (context.particle as any)[data.property];
});
NodeTypes['particleAge'] = particleAgeNode;

// input output
let outputNode = new NodeType('output');
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
const normalD = (x: number) => {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(x * x * -0.5);
};
let normalDistributionNode = new NodeType('normDistrib');
normalDistributionNode.addSignature(
    [NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = normalD(inputs[0] as number);
    }
);
NodeTypes['normDistrib'] = normalDistributionNode;

let normcdfNode = new NodeType('normcdf');
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

let normcdfInvNode = new NodeType('normcdfInv');

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

let clampNode = new NodeType('clamp');
clampNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        outputs[0] = Math.max(Math.min(inputs[0] as number, inputs[2] as number), inputs[1] as number);
    }
);
NodeTypes['clamp'] = clampNode;

let smoothstepNode = new NodeType('smoothstep');
smoothstepNode.addSignature(
    [NodeValueType.Number, NodeValueType.Number, NodeValueType.Number],
    [NodeValueType.Number],
    (context, data, inputs, outputs) => {
        let x = Math.max(Math.min(inputs[0] as number, inputs[2] as number), inputs[1] as number);
        outputs[0] = x * x * (3 - 2 * x);
    }
);
NodeTypes['smoothstep'] = smoothstepNode;

let randomNode = new NodeType('random');
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
        let random = Math.random();
        (outputs[0] as Vector2).lerpVectors(inputs[0] as Vector2, inputs[1] as Vector2, random);
    }
);
randomNode.addSignature(
    [NodeValueType.Vec3, NodeValueType.Vec3],
    [NodeValueType.Vec3],
    (context, data, inputs, outputs) => {
        let random = Math.random();
        (outputs[0] as Vector3).lerpVectors(inputs[0] as Vector3, inputs[1] as Vector3, random);
    }
);
randomNode.addSignature(
    [NodeValueType.Vec4, NodeValueType.Vec4],
    [NodeValueType.Vec4],
    (context, data, inputs, outputs) => {
        let random = Math.random();
        (outputs[0] as Vector4).lerpVectors(inputs[0] as Vector4, inputs[1] as Vector4, random);
    }
);
NodeTypes['random'] = randomNode;

let vrandNode = new NodeType('vrand');
vrandNode.addSignature([], [NodeValueType.Vec2], (context, data, inputs, outputs) => {
    let x = normcdfInv(Math.random());
    let y = normcdfInv(Math.random());
    const mag = Math.sqrt(x * x + y * y);
    (outputs[0] as Vector2).set(x / mag, y / mag);
});
vrandNode.addSignature([], [NodeValueType.Vec3], (context, data, inputs, outputs) => {
    let x = normcdfInv(Math.random());
    let y = normcdfInv(Math.random());
    let z = normcdfInv(Math.random());
    const mag = Math.sqrt(x * x + y * y + z * z);
    (outputs[0] as Vector3).set(x / mag, y / mag, z / mag);
});
vrandNode.addSignature([], [NodeValueType.Vec4], (context, data, inputs, outputs) => {
    let x = normcdfInv(Math.random());
    let y = normcdfInv(Math.random());
    let z = normcdfInv(Math.random());
    let w = normcdfInv(Math.random());
    const mag = Math.sqrt(x * x + y * y + z * z + w * w);
    (outputs[0] as Vector4).set(x / mag, y / mag, z / mag, w / mag);
});
NodeTypes['vrand'] = vrandNode;
