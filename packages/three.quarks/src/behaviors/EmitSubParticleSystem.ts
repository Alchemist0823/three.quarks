import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {EmissionState, ParticleSystem} from '../ParticleSystem';
import {Object3DEventMap, Matrix4, Quaternion, Vector3} from 'three';
import {ParticleEmitter} from '../ParticleEmitter';

const VECTOR_ONE = new Vector3(1, 1, 1);
const VECTOR_Z = new Vector3(0, 0, 1);

export enum SubParticleEmitMode {
    Death,
    Birth,
    Frame,
}

interface SubEmissionState extends EmissionState {
    matrix: Matrix4;
    particle: undefined | Particle;
}

/**
 * Emit a sub particle system from particles.
 */
export class EmitSubParticleSystem implements Behavior {
    type = 'EmitSubParticleSystem';

    //private matrix_ = new Matrix4();
    private q_ = new Quaternion();
    private v_ = new Vector3();
    private v2_ = new Vector3();

    private subEmissions = new Array<SubEmissionState>();

    constructor(
        private particleSystem: ParticleSystem,
        public useVelocityAsBasis: boolean,
        public subParticleSystem: ParticleEmitter<Object3DEventMap> | undefined,
        public mode: SubParticleEmitMode = SubParticleEmitMode.Frame,
        public emitProbability: number = 1
    ) {
        if (this.subParticleSystem && this.subParticleSystem.system) {
            (this.subParticleSystem.system as ParticleSystem).onlyUsedByOther = true;
        }
    }

    initialize(particle: Particle): void {
        /*particle.emissionState = {
            burstIndex: 0,
            burstWaveIndex: 0,
            time: 0,
            waitEmiting: 0,
            matrix: new Matrix4(),
        } as EmissionState;*/
    }

    update(particle: Particle, delta: number): void {
        if (this.mode === SubParticleEmitMode.Frame) {
            this.emit(particle, delta);
        } else if (this.mode === SubParticleEmitMode.Birth && particle.age === 0) {
            this.emit(particle, delta);
        } else if (this.mode === SubParticleEmitMode.Death && particle.age + delta >= particle.life) {
            this.emit(particle, delta);
        }
    }

    private emit(particle: Particle, delta: number) {
        if (!this.subParticleSystem) return;
        if (Math.random() > this.emitProbability) {
            return;
        }
        const m = new Matrix4();
        this.setMatrixFromParticle(m, particle);
        this.subEmissions.push({
            burstParticleCount: 0,
            burstParticleIndex: 0,
            isBursting: false,
            burstIndex: 0,
            burstWaveIndex: 0,
            time: 0,
            waitEmiting: 0,
            matrix: m,
            travelDistance: 0,
            particle: particle,
        });
        //(this.subParticleSystem.system as ParticleSystem).emit(delta, particle.emissionState, m);
    }

    frameUpdate(delta: number): void {
        if (!this.subParticleSystem) return;
        for (let i = 0; i < this.subEmissions.length; i++) {
            if (this.subEmissions[i].time >= (this.subParticleSystem!.system as ParticleSystem).duration) {
                this.subEmissions[i] = this.subEmissions[this.subEmissions.length - 1];
                this.subEmissions.length = this.subEmissions.length - 1;
                i--;
            } else {
                let subEmissionState = this.subEmissions[i];
                if (subEmissionState.particle && subEmissionState.particle!.age < subEmissionState.particle!.life) {
                    this.setMatrixFromParticle(subEmissionState.matrix, subEmissionState.particle!);
                } else {
                    subEmissionState.particle = undefined;
                }
                (this.subParticleSystem.system as ParticleSystem).emit(
                    delta,
                    subEmissionState,
                    subEmissionState.matrix
                );
            }
        }
    }

    toJSON(): any {
        return {
            type: this.type,
            subParticleSystem: this.subParticleSystem ? this.subParticleSystem.uuid : '',
            useVelocityAsBasis: this.useVelocityAsBasis,
            mode: this.mode,
            emitProbability: this.emitProbability,
        };
    }

    static fromJSON(json: any, particleSystem: ParticleSystem): Behavior {
        return new EmitSubParticleSystem(
            particleSystem,
            json.useVelocityAsBasis,
            json.subParticleSystem,
            json.mode,
            json.emitProbability
        );
    }

    clone(): Behavior {
        return new EmitSubParticleSystem(
            this.particleSystem,
            this.useVelocityAsBasis,
            this.subParticleSystem,
            this.mode,
            this.emitProbability
        );
    }
    reset(): void {}

    private setMatrixFromParticle(m: Matrix4, particle: Particle) {
        let rotation;
        if (particle.rotation === undefined || this.useVelocityAsBasis) {
            if (
                particle.velocity.x === 0 &&
                particle.velocity.y === 0 &&
                (particle.velocity.z === 1 || particle.velocity.z === 0)
            ) {
                m.set(
                    1,
                    0,
                    0,
                    particle.position.x,
                    0,
                    1,
                    0,
                    particle.position.y,
                    0,
                    0,
                    1,
                    particle.position.z,
                    0,
                    0,
                    0,
                    1
                );
            } else {
                this.v_.copy(VECTOR_Z).cross(particle.velocity);
                this.v2_.copy(particle.velocity).cross(this.v_);
                const len = this.v_.length();
                const len2 = this.v2_.length();
                m.set(
                    this.v_.x / len,
                    this.v2_.x / len2,
                    particle.velocity.x,
                    particle.position.x,
                    this.v_.y / len,
                    this.v2_.y / len2,
                    particle.velocity.y,
                    particle.position.y,
                    this.v_.z / len,
                    this.v2_.z / len2,
                    particle.velocity.z,
                    particle.position.z,
                    0,
                    0,
                    0,
                    1
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
    }
}
