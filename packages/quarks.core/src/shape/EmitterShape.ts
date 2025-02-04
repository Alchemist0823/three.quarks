import { Constructable, ParameterPair } from "../TypeUtil";
import { JsonMetaData } from "../IParticleSystem";
import { CircleEmitter } from "./CircleEmitter";
import { ConeEmitter } from "./ConeEmitter";
import { DonutEmitter } from "./DonutEmitter";
import { PointEmitter } from "./PointEmitter";
import { SphereEmitter } from "./SphereEmitter";
import { HemisphereEmitter } from "./HemisphereEmitter";
import { GridEmitter } from "./GridEmitter";
//import { MeshSurfaceEmitter } from "./MeshSurfaceEmitter";
import { EmitterShape, ShapeJSON } from "./EmitterUtil";
import { RectangleEmitter } from "./RectangleEmitter";

export interface EmitterShapePlugin {
    type: string;
    constructor: Constructable<EmitterShape>;
    params: ParameterPair[];
    loadJSON: (json: any, meta: JsonMetaData) => EmitterShape;
}

export const EmitterShapes: {[key: string]: EmitterShapePlugin} = {
    circle: {
        type: 'circle',
        params: [
            ['radius', ['number']],
            ['arc', ['radian']],
            ['thickness', ['number']],
            ['mode', ['emitterMode']],
            ['spread', ['number']],
            ['speed', ['valueFunc', 'value']],
        ],
        constructor: CircleEmitter,
        loadJSON: CircleEmitter.fromJSON,
    },
    cone: {
        type: 'cone',
        params: [
            ['radius', ['number']],
            ['arc', ['radian']],
            ['thickness', ['number']],
            ['angle', ['radian']],
            ['mode', ['emitterMode']],
            ['spread', ['number']],
            ['speed', ['valueFunc', 'value']],
        ],
        constructor: ConeEmitter,
        loadJSON: ConeEmitter.fromJSON,
    },
    donut: {
        type: 'donut',
        params: [
            ['radius', ['number']],
            ['arc', ['radian']],
            ['thickness', ['number']],
            ['donutRadius', ['number']],
            ['mode', ['emitterMode']],
            ['spread', ['number']],
            ['speed', ['valueFunc', 'value']],
        ],
        constructor: DonutEmitter,
        loadJSON: DonutEmitter.fromJSON,
    },
    point: {type: 'point', params: [], constructor: PointEmitter, loadJSON: PointEmitter.fromJSON},
    sphere: {
        type: 'sphere',
        params: [
            ['radius', ['number']],
            ['arc', ['radian']],
            ['thickness', ['number']],
            ['angle', ['radian']],
            ['mode', ['emitterMode']],
            ['spread', ['number']],
            ['speed', ['valueFunc', 'value']],
        ],
        constructor: SphereEmitter,
        loadJSON: SphereEmitter.fromJSON,
    },
    hemisphere: {
        type: 'hemisphere',
        params: [
            ['radius', ['number']],
            ['arc', ['radian']],
            ['thickness', ['number']],
            ['angle', ['radian']],
            ['mode', ['emitterMode']],
            ['spread', ['number']],
            ['speed', ['valueFunc', 'value']],
        ],
        constructor: HemisphereEmitter,
        loadJSON: HemisphereEmitter.fromJSON,
    },
    grid: {
        type: 'grid',
        params: [
            ['width', ['number']],
            ['height', ['number']],
            ['rows', ['number']],
            ['column', ['number']],
        ],
        constructor: GridEmitter,
        loadJSON: GridEmitter.fromJSON,
    },
    rectangle: {
        type: 'rectangle',
        params: [
            ['width', ['number']],
            ['height', ['number']],
            ['thickness', ['number']],
            ['mode', ['emitterMode']],
            ['spread', ['number']],
            ['speed', ['valueFunc', 'value']],
        ],
        constructor: RectangleEmitter,
        loadJSON: RectangleEmitter.fromJSON,

    },
};


export function EmitterFromJSON(json: ShapeJSON, meta: JsonMetaData): EmitterShape {
    return EmitterShapes[json.type].loadJSON(json, meta);
}
