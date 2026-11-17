import {Quaternion} from 'three.quarks';
import type {Particle, SpriteParticle} from 'three.quarks';

/**
 * vec4 slots of a GPU particle record. The same record layout is used by the state buffer and by the spawn records
 * the CPU uploads (which have one more vec4 in front: the target slot).
 */
export const GPU_SLOT = {
    /** position.xyz, age */
    POSITION_AGE: 0,
    /** velocity.xyz, life */
    VELOCITY_LIFE: 1,
    /** color.rgba (current, drawn) */
    COLOR: 2,
    /** size.xyz (current, drawn), rotation angle (billboards) */
    SIZE_ROTATION: 3,
    /** startColor.rgba */
    START_COLOR: 4,
    /** startSize.xyz, index of the particle's system in its batch */
    START_SIZE: 5,
    /** seed, startSpeed, speedModifier, uvTile */
    MISC: 6,
} as const;

/**
 * Layout of the GPU particle record of one system: 7 vec4 (112 bytes) plus optional slots.
 */
export interface GPUParticleLayout {
    /** vec4 per particle */
    stride: number;
    /** mesh particles: rotation is a quaternion */
    mesh: boolean;
    /** slot of the rotation quaternion (meshes), -1 if none */
    quaternion: number;
    /** slot of the Noise behavior state (last position offset xyz, last rotation offset), -1 if none */
    noise: number;
    /** slot of the last Noise rotation quaternion (meshes with Noise), -1 if none */
    noiseQuaternion: number;
}

export function createGPUParticleLayout(options: {mesh: boolean; noise: boolean}): GPUParticleLayout {
    let stride = 7;
    const quaternion = options.mesh ? stride++ : -1;
    const noise = options.noise ? stride++ : -1;
    const noiseQuaternion = options.noise && options.mesh ? stride++ : -1;
    return {stride, mesh: options.mesh, quaternion, noise, noiseQuaternion};
}

/** Largest integer seed exactly representable as float32. */
export const GPU_SEED_RANGE = 1 << 24;

/**
 * Writes the GPU record of a freshly spawned particle (after the emitter shape and every behavior's `initialize()`).
 * @param array float array
 * @param o float offset of the record
 * @param systemIndex index of the particle's system in its batch
 * @param seed per-particle random seed, integer in `[0, 2^24)`
 */
export function writeSpawnRecord(
    array: Float32Array,
    o: number,
    layout: GPUParticleLayout,
    particle: Particle,
    systemIndex: number,
    seed: number
) {
    const sprite = particle as SpriteParticle;
    const p = particle.position;
    const v = particle.velocity;
    const c = particle.color;
    const s = particle.size;
    // particles of other system types (e.g. NodeParticle) may not have the start values
    const sc = particle.startColor ?? c;
    const ss = particle.startSize ?? s;

    array[o] = p.x;
    array[o + 1] = p.y;
    array[o + 2] = p.z;
    array[o + 3] = particle.age;
    array[o + 4] = v.x;
    array[o + 5] = v.y;
    array[o + 6] = v.z;
    array[o + 7] = particle.life;
    array[o + 8] = c.x;
    array[o + 9] = c.y;
    array[o + 10] = c.z;
    array[o + 11] = c.w;
    array[o + 12] = s.x;
    array[o + 13] = s.y;
    array[o + 14] = s.z;
    array[o + 15] = typeof sprite.rotation === 'number' ? sprite.rotation : 0;
    array[o + 16] = sc.x;
    array[o + 17] = sc.y;
    array[o + 18] = sc.z;
    array[o + 19] = sc.w;
    array[o + 20] = ss.x;
    array[o + 21] = ss.y;
    array[o + 22] = ss.z;
    array[o + 23] = systemIndex;
    array[o + 24] = seed;
    array[o + 25] = particle.startSpeed ?? 0;
    array[o + 26] = particle.speedModifier ?? 1;
    array[o + 27] = particle.uvTile;
    if (layout.quaternion >= 0) {
        const q = sprite.rotation instanceof Quaternion ? sprite.rotation : null;
        const b = o + layout.quaternion * 4;
        array[b] = q ? q.x : 0;
        array[b + 1] = q ? q.y : 0;
        array[b + 2] = q ? q.z : 0;
        array[b + 3] = q ? q.w : 1;
    }
    if (layout.noise >= 0) {
        const b = o + layout.noise * 4;
        array[b] = array[b + 1] = array[b + 2] = array[b + 3] = 0;
    }
    if (layout.noiseQuaternion >= 0) {
        const b = o + layout.noiseQuaternion * 4;
        array[b] = array[b + 1] = array[b + 2] = 0;
        array[b + 3] = 1;
    }
}
