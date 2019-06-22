import {Vector4} from "three";

export const ColorToJSON = (color: Vector4) => {
    return {r: color.x, g: color.y, b: color.z, a: color.w};
};

export const JSONToColor = (json: any) => {
    return new Vector4(json.r, json.g, json.b, json.a);
};