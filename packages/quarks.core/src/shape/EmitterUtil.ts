import {EmissionState, IParticleSystem} from '../IParticleSystem';
import {Matrix4, Quaternion, Vector3} from '../math';
import {Particle} from '../Particle';
import {IDENTITY_QUAT, UP_VEC3, ZERO_VEC3} from '../util/MathUtil';

export interface EmitterShape {
    readonly type: string;
    initialize(particle: Particle, emissionState: EmissionState): void;
    toJSON(): ShapeJSON;
    update(system: IParticleSystem, delta: number): void;
    clone(): EmitterShape;
}

export interface ShapeJSON {
    type: string;
    radius?: number;
    arc?: number;
    thickness?: number;
    donutRadius?: number;
    angle?: number;
    width?: number;
    height?: number;
    column?: number;
    row?: number;
    mesh?: string;
    mode?: number;
    particleSystem?: string;
    spread?: number;
    speed?: any;
}

/**
 * Enum representing the emitter modes for particles.
 */
export enum EmitterMode {
    /**
     * Emit particles randomly over the specified duration.
     */
    Random,
    /**
     * Emit particles in a continuous loop.
     */
    Loop,
    /**
     * Emit particles back and forth in a ping-pong manner.
     */
    PingPong,
    /**
     * Emit particles in bursts.
     */
    Burst,
}

export function getValueFromEmitterMode(
    mode: EmitterMode,
    currentValue: number,
    spread: number,
    emissionState: EmissionState
): number {
    if (EmitterMode.Random === mode) {
        currentValue = Math.random();
    } else if (EmitterMode.Burst === mode && emissionState.isBursting) {
        currentValue = emissionState.burstParticleIndex / emissionState.burstParticleCount;
    }

    let u;

    if (spread > 0) {
        u = Math.floor(currentValue / spread) * spread;
    } else {
        u = currentValue;
    }

    switch (mode) {
        case EmitterMode.Loop:
            u = u % 1;
            break;
        case EmitterMode.PingPong:
            u = Math.abs((u % 2) - 1);
            break;
    }

    return u;
}

/**
 * Defaults a rotation quaternion from given matrix, unless it's a non-identity quaternion.
 *
 * @param rotation - The rotation quaternion.
 * @param target - The matrix target vector.
 * @param matrix - The matrix to set the rotation from.
 */
export function setDefaultRotationFromMatrix(
    rotation: number | Quaternion | undefined,
    target: Vector3,
    matrix: Matrix4
): void {
    if (rotation instanceof Quaternion && rotation.equals(IDENTITY_QUAT)) {
        matrix.lookAt(ZERO_VEC3, target, UP_VEC3);
        rotation.setFromRotationMatrix(matrix);
    }
}
