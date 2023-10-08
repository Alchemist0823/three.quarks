import {EmitterShape, ShapeJSON} from './EmitterShape';
import {Particle} from '../Particle';
import {MathUtils} from 'three';

export interface DonutEmitterParameters {
    radius?: number;
    arc?: number;
    thickness?: number;
    donutRadius?: number;
}

export class DonutEmitter implements EmitterShape {
    type = 'donut';
    radius: number;
    donutRadius: number;
    arc: number; // [0, Math.PI * 2]
    thickness: number;

    constructor(parameters: DonutEmitterParameters = {}) {
        this.radius = parameters.radius ?? 10;
        this.arc = parameters.arc ?? 2.0 * Math.PI;
        this.thickness = parameters.thickness ?? 1;
        this.donutRadius = parameters.donutRadius ?? this.radius * 0.2;
    }

    initialize(p: Particle) {
        const u = Math.random();
        const v = Math.random();
        const rand = MathUtils.lerp(1 - this.thickness, 1, Math.random());
        const theta = u * this.arc;
        const phi = v * Math.PI * 2;
        //const r = Math.sqrt(rand);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        p.position.x = this.radius * cosTheta;
        p.position.y = this.radius * sinTheta;
        p.position.z = 0;

        p.velocity.z = this.donutRadius * rand * Math.sin(phi);
        p.velocity.x = this.donutRadius * rand * Math.cos(phi) * cosTheta;
        p.velocity.y = this.donutRadius * rand * Math.cos(phi) * sinTheta;

        p.position.add(p.velocity);

        p.velocity.normalize().multiplyScalar(p.startSpeed);

        //const angle = this.angle * r;
        //p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed);
        //const v = Math.random();

            //.multiplyScalar(this.radius);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'donut',
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            donutRadius: this.donutRadius,
        };
    }

    static fromJSON(json: any): DonutEmitter {
        return new DonutEmitter(json);
    }

    clone(): EmitterShape {
        return new DonutEmitter({
            radius: this.radius,
            arc: this.arc,
            thickness: this.thickness,
            donutRadius: this.donutRadius,
        });
    }
}
