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

/*
    "curve": new NodeType("curve", (context, data, inputs, outputs) => {
        //outputs[0] = inputs[0] + inputs[1];
    }, [], []),
    "vrand": new NodeType("vrand", (context, data, inputs, outputs) => {
        //outputs[0] = inputs[0] + inputs[1];
    }, [], []),
    "curveSample": new NodeType("curveSample", (context, data, inputs, outputs) => {
        //outputs[0] = inputs[0] + inputs[1];
    }, [], []),
    "random": new NodeType("random", (context, data, inputs, outputs) => {
        outputs[0] = Math.random() * (inputs[1] - inputs[0]) + inputs[0];
    }, [NodeValueType.Number, NodeValueType.Number], [NodeValueType.Number]),
    "input": new NodeType("input", (context, data, inputs, outputs) => {
        outputs[0] = inputs[0];
    }, [NodeValueType.AnyType], [NodeValueType.AnyType]),
    "output": new NodeType("output", (context, data, inputs, outputs) => {
        outputs[0] = inputs[0];
    }, [NodeValueType.AnyType], [NodeValueType.AnyType]),*/
