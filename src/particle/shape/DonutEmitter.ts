import {EmitterShape} from "../EmitterShape";
import {Particle} from "../Particle";
import {Vector3, Math as _Math} from "three";

export class DonutEmitter implements EmitterShape {

    radius: number = 10;
    arc: number = 2.0 * Math.PI;
    thickness: number = 1;
    angle: number = Math.PI / 6; // [0, Math.PI / 6]

    initialize(p: Particle) {
        const u = Math.random();
        const rand = _Math.lerp(this.thickness, 1, Math.random());
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
}