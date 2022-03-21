import {EmitterShape, ShapeJSON} from "../EmitterShape";
import {Particle} from "../Particle";
import {Vector3, MathUtils} from "three";


export interface DonutEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
    angle?: number; // [0, Math.PI / 2]
}

export class DonutEmitter implements EmitterShape {
    type: string = "donut";
    radius: number;
    arc: number; // [0, Math.PI * 2]
    thickness: number;
    angle: number; // [0, Math.PI / 2]

    constructor(parameters: DonutEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
        this.angle = parameters.angle ?? Math.PI / 6;
    }

    initialize(p: Particle) {
        const u = Math.random();
        const rand = MathUtils.lerp(this.thickness, 1, Math.random());
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
            type: "donut",
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            angle: this.angle
        };
    }

    clone(): EmitterShape {
        return  new DonutEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            angle: this.angle,
        });
    }
}
