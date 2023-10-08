import {EmitterShape, ShapeJSON} from './EmitterShape';
import {Particle} from '../Particle';
import {MathUtils} from 'three';

export interface HemisphereEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
}

export class HemisphereEmitter implements EmitterShape {
    type = 'sphere';
    radius: number;
    arc: number;
    thickness: number; //[0, 1]

    constructor(parameters: HemisphereEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
    }

    initialize(p: Particle) {
        const u = Math.random();
        const v = Math.random();
        const rand = MathUtils.lerp(1 - this.thickness, 1, Math.random());
        const theta = u * this.arc;
        const phi = Math.acos(v);
        //const r = Math.cbrt(rand);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        p.position.x = sinPhi * cosTheta;
        p.position.y = sinPhi * sinTheta;
        p.position.z = cosPhi;

        p.velocity.copy(p.position).multiplyScalar(p.startSpeed);
        p.position.multiplyScalar(this.radius * rand);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'hemisphere',
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
        };
    }

    static fromJSON(json: any): HemisphereEmitter {
        return new HemisphereEmitter(json);
    }

    clone(): EmitterShape {
        return new HemisphereEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
        });
    }
}
