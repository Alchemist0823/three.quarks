import {EmitterShape, ShapeJSON} from "./EmitterShape";
import {Particle} from "../Particle";
import { MathUtils} from "three";

export interface ConeEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
    angle?: number; // [0, Math.PI / 2]
}

export class ConeEmitter implements EmitterShape {

    type = "cone";
    radius: number;
    arc: number; // [0, Math.PI * 2]
    thickness: number; // [0, 1]
    angle: number; // [0, Math.PI / 2]

    constructor(parameters: ConeEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
        this.angle = parameters.angle ?? Math.PI / 6;
    }

    initialize(p: Particle) {
        const u = Math.random();
        const rand = MathUtils.lerp(1 - this.thickness, 1, Math.random());
        const theta = u * this.arc;
        const r = Math.sqrt(rand);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        p.position.x = r * cosTheta;
        p.position.y = r * sinTheta;
        p.position.z = 0;

        const angle = this.angle * r;
        p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed);
        //const v = Math.random();
        p.position.multiplyScalar(this.radius);
    }

    toJSON(): ShapeJSON {
        return {
            type: "cone",
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            angle: this.angle,
        };
    }

    static fromJSON(json: any): ConeEmitter {
        return new ConeEmitter(json);
    }

    clone(): EmitterShape {
        return  new ConeEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            angle: this.angle,
        });
    }
}
