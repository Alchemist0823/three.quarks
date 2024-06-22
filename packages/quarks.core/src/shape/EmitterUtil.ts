import {Particle} from '../Particle';
import {EmissionState, IParticleSystem} from '../IParticleSystem';

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
    let u;
    if (EmitterMode.Random === mode) {
        currentValue = Math.random();
    } else if (EmitterMode.Burst === mode && emissionState.isBursting) {
        currentValue = emissionState.burstParticleIndex / emissionState.burstParticleCount;
    }
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

export interface EmitterShape {
    type: string;
    initialize(particle: Particle, emissionState: EmissionState): void;
    toJSON(): ShapeJSON;
    update(system: IParticleSystem, delta: number): void;
    clone(): EmitterShape;
}
