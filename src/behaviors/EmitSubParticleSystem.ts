import {Behavior} from "./Behavior";
import {Particle} from "../Particle";
import {FunctionValueGenerator, ValueGeneratorFromJSON} from "../functions";
import {EmissionState, ParticleSystem} from "../ParticleSystem";
import { Matrix4, Quaternion, Vector3 } from "three";
import {ParticleEmitter} from "../ParticleEmitter";

const VECTOR_ONE = new Vector3(1, 1, 1);
const VECTOR_Z = new Vector3(0, 0, 1);

export class EmitSubParticleSystem implements Behavior {

    type = "EmitSubParticleSystem";

    //private matrix_ = new Matrix4();
    private q_ = new Quaternion();
    private v_ = new Vector3();
    private v2_ = new Vector3();

    constructor(private particleSystem: ParticleSystem, public useVelocityAsBasis: boolean, public subParticleSystem?: ParticleEmitter<Event>) {
        if (this.subParticleSystem) {
            this.subParticleSystem.system.onlyUsedByOther = true;
        }
    }

    initialize(particle: Particle): void {
        particle.emissionState = {
            burstIndex: 0,
            burstWaveIndex:0,
            time:0,
            waitEmiting: 0,
            matrix: new Matrix4(),
        } as EmissionState;
    }

    update(particle: Particle, delta: number): void {
        if (!this.subParticleSystem || !particle.emissionState)
            return;
        let m = (particle.emissionState! as any).matrix;
        let rotation;
        if (particle.rotation === undefined || this.useVelocityAsBasis) {
            if (particle.velocity.x === 0 && particle.velocity.y === 0 && (particle.velocity.z === 1 || particle.velocity.z === 0)) {
                m.set(
                    1, 0, 0, particle.position.x,
                    0, 1, 0, particle.position.y,
                    0, 0, 1, particle.position.z,
                    0, 0, 0, 1
                );
            } else {
                this.v_.copy(VECTOR_Z).cross(particle.velocity);
                this.v2_.copy(particle.velocity).cross(this.v_);
                const len = this.v_.length();
                const len2 = this.v2_.length();
                m.set(
                    this.v_.x / len, this.v2_.x / len2, particle.velocity.x, particle.position.x,
                    this.v_.y / len, this.v2_.y / len2, particle.velocity.y, particle.position.y,
                    this.v_.z / len, this.v2_.z / len2, particle.velocity.z, particle.position.z,
                    0, 0, 0, 1
                );
            }
        } else {
            if (particle.rotation instanceof Quaternion) {
                rotation = particle.rotation;
            } else {
                this.q_.setFromAxisAngle(VECTOR_Z, particle.rotation);
                rotation = this.q_;
            }
            m.compose(particle.position, rotation, VECTOR_ONE);
        }
        if (!this.particleSystem.worldSpace) {
            m.multiplyMatrices(this.particleSystem.emitter.matrixWorld, m);
        }
        this.subParticleSystem!.system.emit(delta, particle.emissionState!, m);
    }

    frameUpdate(delta: number): void {
    }


    toJSON(): any {
        return {
            type: this.type,
            subParticleSystem: this.subParticleSystem ? this.subParticleSystem.uuid : "",
            useVelocityAsBasis: this.useVelocityAsBasis
        };
    }

    static fromJSON(json: any, particleSystem: ParticleSystem): Behavior {
        return new EmitSubParticleSystem(particleSystem, json.useVelocityAsBasis, undefined);
    }

    clone(): Behavior {
        return new EmitSubParticleSystem(this.particleSystem, this.useVelocityAsBasis, this.subParticleSystem);
    }
}
