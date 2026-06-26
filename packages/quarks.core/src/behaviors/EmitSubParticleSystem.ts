import {EmissionState, IEmitter, IParticleSystem} from '../IParticleSystem';
import {Matrix4, Quaternion, Vector3} from '../math';
import {Particle} from '../Particle';
import {ONE_VEC3, Z_VEC3} from '../util/MathUtil';
import {Behavior} from './Behavior';

export enum SubParticleEmitMode {
    Death,
    Birth,
    Frame,
}

interface SubEmissionState extends EmissionState {
    matrix: Matrix4;
    particle: Particle | undefined;
}

/**
 * Emit a sub particle system from particles.
 */
export class EmitSubParticleSystem implements Behavior {
    readonly type = 'EmitSubParticleSystem';

    private readonly _tmpV = new Vector3();
    private readonly _tmpV2 = new Vector3();
    private readonly _tmpQ = new Quaternion();

    subEmissions: SubEmissionState[] = [];

    constructor(
        private particleSystem: IParticleSystem,
        public useVelocityAsBasis: boolean,
        public subParticleSystem: IEmitter | undefined,
        public mode: SubParticleEmitMode = SubParticleEmitMode.Frame,
        public emitProbability: number = 1
    ) {
        if (this.subParticleSystem && this.subParticleSystem.system) {
            (this.subParticleSystem.system as any).onlyUsedByOther = true;
        }
    }

    initialize(particle: Particle): void {}

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
        if (!this.subParticleSystem || Math.random() > this.emitProbability) return;

        const matrix = new Matrix4();
        this.setMatrixFromParticle(matrix, particle);

        this.subEmissions.push({
            burstParticleCount: 0,
            burstParticleIndex: 0,
            isBursting: false,
            burstIndex: 0,
            burstWaveIndex: 0,
            time: 0,
            waitEmiting: 0,
            matrix,
            travelDistance: 0,
            particle,
        });
    }

    frameUpdate(delta: number): void {
        if (!this.subParticleSystem) return;

        for (let i = 0; i < this.subEmissions.length; i++) {
            const subEmissionState = this.subEmissions[i];

            if (subEmissionState.time >= this.subParticleSystem.system.duration) {
                this.subEmissions[i] = this.subEmissions[this.subEmissions.length - 1];
                this.subEmissions.length = this.subEmissions.length - 1;
                i--;

                continue;
            }

            if (subEmissionState.particle && subEmissionState.particle.age < subEmissionState.particle.life) {
                this.setMatrixFromParticle(subEmissionState.matrix, subEmissionState.particle);
            } else {
                subEmissionState.particle = undefined;
            }

            this.subParticleSystem.system.emit(delta, subEmissionState, subEmissionState.matrix);
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

    static fromJSON(json: any, particleSystem: IParticleSystem): Behavior {
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

    private setMatrixFromParticle(matrix: Matrix4, particle: Particle) {
        const {position, rotation, velocity} = particle;
        const usesVelocityBasis = rotation === undefined || this.useVelocityAsBasis;

        if (usesVelocityBasis) {
            if (velocity.lengthSq() === 0) {
                const xAxis = this._tmpV.set(1, 0, 0);
                const yAxis = this._tmpV2.set(0, 1, 0);

                matrix.makeBasis(xAxis, yAxis, Z_VEC3).setPosition(position);
            } else if (velocity.x === 0 && velocity.y === 0) {
                // Z-parallel velocities make Z_VEC3.cross(velocity) degenerate - choose a stable handed basis.
                const ySign = velocity.z < 0 ? -1 : 1;
                const xAxis = this._tmpV.set(1, 0, 0);
                const yAxis = this._tmpV2.set(0, ySign, 0);

                matrix.makeBasis(xAxis, yAxis, velocity).setPosition(position);
            } else {
                // Keep velocity length on the local Z basis, matching the old matrix scale.
                const xAxis = this._tmpV.copy(Z_VEC3).cross(velocity).normalize();
                const yAxis = this._tmpV2.copy(velocity).cross(xAxis).normalize();

                matrix.makeBasis(xAxis, yAxis, velocity).setPosition(position);
            }
        } else {
            const particleRotation =
                rotation instanceof Quaternion ? rotation : this._tmpQ.setFromAxisAngle(Z_VEC3, rotation);

            matrix.compose(position, particleRotation, ONE_VEC3);
        }

        if (!this.particleSystem.worldSpace) {
            matrix.multiplyMatrices(this.particleSystem.emitter.matrixWorld, matrix);
        }
    }
}
