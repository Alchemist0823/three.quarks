import {ParticleEmitter} from "../ParticleEmitter";
import {Particle} from "../Particle";
import {Vector3, Math as _Math} from "three";

export class SphereEmitter implements ParticleEmitter {

    radius: number = 10;
    arc: number = 2.0 * Math.PI;
    thickness: number = 1; //[0, 1]

    initialize(p: Particle) {
        const u = Math.random();
        const v = Math.random();
        const rand = _Math.lerp(1 - this.thickness, 1, Math.random());
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
}