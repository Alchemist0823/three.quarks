import {EmitterShape, ShapeJSON} from "./EmitterShape";
import {Particle} from "../Particle";

export class PointEmitter implements EmitterShape {
    type = "point";

    constructor() {
    }

    initialize(p: Particle) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * Math.PI * 2;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random());
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        p.velocity.x = r * sinPhi * cosTheta;
        p.velocity.y = r * sinPhi * sinTheta;
        p.velocity.z = r * cosPhi;
        p.velocity.multiplyScalar(p.startSpeed);

        p.position.setScalar(0);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'point',
        };
    }

    static fromJSON(json: any): PointEmitter {
        return new PointEmitter();
    }

    clone(): EmitterShape {
        return  new PointEmitter();
    }
}
