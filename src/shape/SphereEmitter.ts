import {EmitterShape, ShapeJSON} from "./EmitterShape";
import {Particle} from "../Particle";
import { MathUtils} from "three";

export interface SphereEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
}

export class SphereEmitter implements EmitterShape {
    type = "sphere";
    radius: number;
    arc: number;
    thickness: number; //[0, 1]

    constructor(parameters: SphereEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
    }

    initialize(p: Particle) {
        const u = Math.random();
        const v = Math.random();
        const rand = MathUtils.lerp(1 - this.thickness, 1, Math.random());
        const theta = u * this.arc;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(rand);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        p.position.x = r * sinPhi * cosTheta;
        p.position.y = r * sinPhi * sinTheta;
        p.position.z = r * cosPhi;

        p.velocity.setScalar(0).addScaledVector(p.position, p.startSpeed);
        p.position.multiplyScalar(this.radius);
    }

    toJSON(): ShapeJSON {
        return {
            type: "sphere",
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
        };
    }

    static fromJSON(json: any): SphereEmitter {
        return new SphereEmitter(json);
    }

    clone(): EmitterShape {
        return  new SphereEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
        });
    }
}
