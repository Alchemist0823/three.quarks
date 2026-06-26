import {IParticleSystem} from '../IParticleSystem';
import {Matrix4} from '../math';
import {Particle} from '../Particle';
import {EmitterShape, setDefaultRotationFromMatrix, ShapeJSON} from './EmitterUtil';

/**
 * A point emitter emits particles from a single point.
 */
export class PointEmitter implements EmitterShape {
    readonly type = 'point';

    private readonly _tmpM: Matrix4 = new Matrix4();

    initialize(p: Particle) {
        const u = Math.random();
        const v = Math.random();
        const r = Math.cbrt(Math.random());

        const theta = u * Math.PI * 2;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        const phi = Math.acos(2.0 * v - 1.0);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        p.velocity.x = r * sinPhi * cosTheta;
        p.velocity.y = r * sinPhi * sinTheta;
        p.velocity.z = r * cosPhi;
        p.velocity.multiplyScalar(p.startSpeed);

        p.position.setScalar(0);

        // Only set a default facing-along-velocity orientation if the user's
        // startRotation didn't already write a non-identity rotation.
        setDefaultRotationFromMatrix(p.rotation, p.velocity, this._tmpM);
    }

    update(system: IParticleSystem, delta: number): void {}

    toJSON(): ShapeJSON {
        return {
            type: 'point',
        };
    }

    static fromJSON(json: any): PointEmitter {
        return new PointEmitter();
    }

    clone(): EmitterShape {
        return new PointEmitter();
    }
}
