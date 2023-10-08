import {EmitterShape, ShapeJSON} from './EmitterShape';
import {Particle} from '../Particle';
import {MathUtils} from 'three';

export interface CircleEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
}

export class CircleEmitter implements EmitterShape {
    type = 'circle';
    radius: number;
    arc: number; // [0, Math.PI * 2]
    thickness: number; // [0, 1]

    constructor(parameters: CircleEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
    }

    initialize(p: Particle) {
        const u = Math.random();
        const r = MathUtils.lerp(1 - this.thickness, 1, Math.random());
        const theta = u * this.arc;
        p.position.x = Math.cos(theta);
        p.position.y = Math.sin(theta);
        p.position.z = 0;
        p.velocity.copy(p.position).multiplyScalar(p.startSpeed);
        //const v = Math.random();
        p.position.multiplyScalar(this.radius * r);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'circle',
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
        };
    }

    static fromJSON(json: any): CircleEmitter {
        return new CircleEmitter(json);
    }

    clone(): EmitterShape {
        return new CircleEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
        });
    }
}
