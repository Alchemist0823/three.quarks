import {EmitterShape, ShapeJSON} from "./EmitterShape";
import {Particle} from "../Particle";
import {ParticleSystem} from "../ParticleSystem";

export class ParticleSystemEmitter implements EmitterShape {
    type: string = "particle_system";

    private _particleSystem?: ParticleSystem;

    get particleSystem() {
        return this._particleSystem!;
    }
    set particleSystem(particleSystem: ParticleSystem) {
        this._particleSystem = particleSystem;
    }

    constructor(particleSystem?: ParticleSystem) {
        if (!particleSystem) {
            return;
        }
        this.particleSystem = particleSystem;
    }

    initialize(p: Particle) {
        if (!this._particleSystem) {
            p.position.set(0, 0, 0);
            p.velocity.set(0, 0, 1).multiplyScalar(p.startSpeed);
            return;
        }
        /*p.position.copy(this._tempA);
        p.velocity.copy(this._tempA).normalize().multiplyScalar(p.startSpeed);
        p.position.applyMatrix4(this._mesh.matrixWorld);
        p.velocity.applyMatrix3(this._mesh.normalMatrix);*/
    }

    toJSON(): ShapeJSON {
        return {
            type: 'particle_system',
            particleSystem: this._particleSystem ? this._particleSystem.emitter.uuid : "",
        };
    }

    clone(): EmitterShape {
        return new ParticleSystemEmitter(this._particleSystem);
    }
}
