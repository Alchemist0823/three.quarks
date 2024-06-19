import {Vector3, Vector4} from 'three';

export const ColorToJSON = (color: Vector4) => {
    return {r: color.x, g: color.y, b: color.z, a: color.w};
};

export const JSONToColor = (json: any) => {
    return new Vector4(json.r, json.g, json.b, json.a);
};

export const JSONToValue = (json: any, type: string) => {
    switch (type) {
        case 'Vector3':
            return new Vector3(json.x, json.y, json.z);
        case 'Vector4':
            return new Vector4(json.x, json.y, json.z, json.w);
        case 'Color':
            return new Vector3(json.r, json.g, json.b);
        case 'Number':
            return json;
        default:
            return json;
    }
};

export const ValueToJSON = (value: any, type: string) => {
    switch (type) {
        case 'Vector3':
            return {x: value.x, y: value.y, z: value.z};
        case 'Vector4':
            return {x: value.x, y: value.y, z: value.z, w: value.w};
        case 'Color':
            return {r: value.x, g: value.y, b: value.z};
        case 'Number':
            return value;
        default:
            return value;
    }
};
