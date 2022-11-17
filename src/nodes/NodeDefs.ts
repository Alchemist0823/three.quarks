import {Vector2, Vector3, Vector4} from "three";
import {NodeValueType} from "./NodeValueType";
import {NodeType} from "./NodeType";

export const NodeTypes: {[key:string]: NodeType} = {
    "add": new NodeType("add", (context, inputs, outputs) => {
        if (typeof inputs[0] === 'number') {
            outputs[0] = inputs[0] + inputs[1];
        } else if (inputs[0] instanceof Vector3 || inputs[0] instanceof Vector2 || inputs[0] instanceof Vector4) {
            outputs[0].addVectors(inputs[0], inputs[1]);
        }
    }, [NodeValueType.AnyType, NodeValueType.AnyType], [NodeValueType.AnyType]),
    "sub": new NodeType("sub", (context, inputs, outputs) => {
        if (typeof inputs[0] === 'number') {
            outputs[0] = inputs[0] - inputs[1];
        } else if (inputs[0] instanceof Vector3 || inputs[0] instanceof Vector2 || inputs[0] instanceof Vector4) {
            outputs[0].subVectors(inputs[0], inputs[1]);
        }
    }, [NodeValueType.AnyType, NodeValueType.AnyType], [NodeValueType.AnyType]),
    "mul": new NodeType("mul", (context, inputs, outputs) => {
        if (typeof inputs[0] === 'number') {
            outputs[0] = inputs[0] * inputs[1];
        } else if (inputs[0] instanceof Vector3 || inputs[0] instanceof Vector2 || inputs[0] instanceof Vector4) {
            outputs[0].multiplyVectors(inputs[0], inputs[1]);
        }
    }, [NodeValueType.AnyType, NodeValueType.AnyType], [NodeValueType.AnyType]),
    "div": new NodeType("div", (context, inputs, outputs) => {
        if (typeof inputs[0] === 'number') {
            outputs[0] = inputs[0] / inputs[1];
        } else if (inputs[0] instanceof Vector3 || inputs[0] instanceof Vector2 || inputs[0] instanceof Vector4) {
            outputs[0].copy(inputs[0]).divide(inputs[1]);
        }
    }, [NodeValueType.AnyType, NodeValueType.AnyType], [NodeValueType.AnyType]),
    "curve": new NodeType("curve", (context, inputs, outputs) => {
        //outputs[0] = inputs[0] + inputs[1];
    }, [], []),
    "vrand": new NodeType("vrand", (context, inputs, outputs) => {
        //outputs[0] = inputs[0] + inputs[1];
    }, [], []),
    "curveSample": new NodeType("curveSample", (context, inputs, outputs) => {
        //outputs[0] = inputs[0] + inputs[1];
    }, [], []),
    "random": new NodeType("random", (context, inputs, outputs) => {
        outputs[0] = Math.random() * (inputs[1] - inputs[0]) + inputs[0];
    }, [NodeValueType.Number, NodeValueType.Number], [NodeValueType.Number]),

}
