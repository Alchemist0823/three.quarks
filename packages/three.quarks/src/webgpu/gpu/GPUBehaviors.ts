/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TSL versions of the quarks behaviors' per-particle `update()`, used by the GPU simulation kernel.
 *
 * `initialize()` and `frameUpdate()` keep running on the CPU (spawn and per-frame state such as `ApplyForce`'s rolled
 * magnitude or `TurbulenceField`'s time offset), so only the per-particle update is ported. Third-party behaviors can
 * opt in with {@link registerGPUBehavior}; a system with any behavior that has no GPU version is simulated on the
 * CPU.
 */
import * as TSL from 'three/tsl';
import {PiecewiseBezier, RenderMode, Vector3Function} from 'three.quarks';
import type {Behavior, ParticleSystem} from 'three.quarks';
import type {GPUCompileContext} from './GPUCompileContext';
import type {GPUParticleLayout} from './GPUParticleLayout';
import {
    canCompileColor,
    canCompileRotation,
    canCompileValue,
    canCompileVector3,
    compileColor,
    compileRotation,
    compileValue,
    compileVector3,
    quatFromAxisAngle,
    quatMul,
    quatRotate,
} from './GPUGenerators';

// untyped TSL: the generated graphs mix node types the typings cannot follow
const {dot, float, length, max, mx_noise_float, normalize, select, vec2, vec3, vec4} = TSL as any;

type N = any;

/**
 * Keys of `GPUCompileContext.written`: `'velocity'`, `'color'`, `'sizeRotation'` (size and rotation angle), `'misc'`
 * (speed modifier, uv tile), `'quaternion'`, `'noise'`. Position and age are always stored.
 *
 * The particle being simulated, as TSL variables. Behaviors read and assign them; the kernel loads them from the
 * state buffer before the behaviors and stores the fields listed in `GPUCompileContext.written` afterwards.
 */
export interface GPUParticleState {
    layout: GPUParticleLayout;
    position: N;
    age: N;
    velocity: N;
    life: N;
    color: N;
    size: N;
    /** rotation angle (billboards) */
    rotation: N;
    /** rotation quaternion (meshes), `null` for billboards */
    quaternion: N | null;
    startColor: N;
    startSize: N;
    /** per-particle random seed (uint) */
    seed: N;
    startSpeed: N;
    speedModifier: N;
    uvTile: N;
    /** Noise behavior state: last position offset xyz, last rotation offset; `null` without Noise */
    noise: N | null;
    /** last Noise rotation (meshes with Noise) */
    noiseQuaternion: N | null;
    /** normalized age at the start of the step */
    t: N;
}

/**
 * GPU version of a behavior's per-particle update.
 */
export interface GPUBehaviorCompiler {
    /** whether this behavior instance (its generators) can run on the GPU */
    supports(behavior: Behavior, system: ParticleSystem): boolean;
    /** emits the TSL code of `behavior.update()` for particle `p` */
    compile(ctx: GPUCompileContext, behavior: Behavior, p: GPUParticleState, system: ParticleSystem): void;
    /** the behavior keeps per-particle Noise state */
    usesNoiseState?: boolean;
}

const compilers = new Map<string, GPUBehaviorCompiler>();

/**
 * Registers the GPU version of a behavior type (`behavior.type`). Use it to let systems with a custom behavior run on
 * the GPU.
 */
export function registerGPUBehavior(type: string, compiler: GPUBehaviorCompiler) {
    compilers.set(type, compiler);
}

/** The GPU version of a behavior, or `undefined`. */
export function getGPUBehaviorCompiler(behavior: Behavior): GPUBehaviorCompiler | undefined {
    return compilers.get(behavior.type);
}

const isBillboard = (system: ParticleSystem) => system.rendererSettings.renderMode !== RenderMode.Mesh;

/** normalized start speed in `speedRange` (the *BySpeed behaviors) */
function speedT(ctx: GPUCompileContext, behavior: any, p: GPUParticleState): N {
    const a = ctx.float(() => behavior.speedRange.a);
    const b = ctx.float(() => behavior.speedRange.b);
    return p.startSpeed.sub(a).div(b.sub(a));
}

function compileSize(ctx: GPUCompileContext, gen: unknown, t: N, p: GPUParticleState): N {
    if (gen instanceof Vector3Function) return compileVector3(ctx, gen, t).mul(p.startSize);
    return p.startSize.mul(compileValue(ctx, gen, t));
}

const canCompileSize = (gen: unknown) => canCompileVector3(gen) || canCompileValue(gen);

// ---- over life ----------------------------------------------------------------------------------------------

registerGPUBehavior('ColorOverLife', {
    supports: (b: any) => canCompileColor(b.color),
    compile(ctx, b: any, p) {
        ctx.watch(() => b.color);
        p.color.assign(compileColor(ctx, b.color, p.t).mul(p.startColor));
        ctx.written.add('color');
    },
});

registerGPUBehavior('SizeOverLife', {
    supports: (b: any) => canCompileSize(b.size),
    compile(ctx, b: any, p) {
        ctx.watch(() => b.size);
        p.size.assign(compileSize(ctx, b.size, p.t, p));
        ctx.written.add('sizeRotation');
    },
});

registerGPUBehavior('RotationOverLife', {
    supports: (b: any) => canCompileValue(b.angularVelocity),
    compile(ctx, b: any, p, system) {
        // billboards only, like the CPU version (it skips quaternion rotations)
        if (!isBillboard(system)) return;
        ctx.watch(() => b.angularVelocity);
        p.rotation.addAssign(ctx.delta.mul(compileValue(ctx, b.angularVelocity, p.t)));
        ctx.written.add('sizeRotation');
    },
});

registerGPUBehavior('Rotation3DOverLife', {
    supports: (b: any) => canCompileRotation(b.angularVelocity),
    compile(ctx, b: any, p) {
        // meshes only, like the CPU version
        if (p.quaternion === null) return;
        ctx.watch(() => b.angularVelocity);
        const step = compileRotation(ctx, b.angularVelocity, ctx.delta, p.t);
        p.quaternion.assign(normalize(quatMul(p.quaternion, step)));
        ctx.written.add('quaternion');
    },
});

registerGPUBehavior('SpeedOverLife', {
    supports: (b: any) => canCompileValue(b.speed),
    compile(ctx, b: any, p) {
        ctx.watch(() => b.speed);
        p.speedModifier.assign(compileValue(ctx, b.speed, p.t));
        ctx.written.add('misc');
    },
});

registerGPUBehavior('FrameOverLife', {
    supports: (b: any) => canCompileValue(b.frame),
    compile(ctx, b: any, p) {
        ctx.watch(() => b.frame);
        // the CPU version only animates frames with a curve
        if (!(b.frame instanceof PiecewiseBezier)) return;
        p.uvTile.assign(compileValue(ctx, b.frame, p.t));
        ctx.written.add('misc');
    },
});

registerGPUBehavior('OrbitOverLife', {
    supports: (b: any) => canCompileValue(b.orbitSpeed),
    compile(ctx, b: any, p) {
        ctx.watch(() => b.orbitSpeed);
        const axis = ctx.vec3(() => b.axis);
        const angle = compileValue(ctx, b.orbitSpeed, p.t).mul(ctx.delta);
        // rotating around an axis through the origin leaves the component along the axis unchanged
        p.position.assign(quatRotate(quatFromAxisAngle(axis, angle), p.position));
    },
});

registerGPUBehavior('LimitSpeedOverLife', {
    supports: (b: any) => canCompileValue(b.speed),
    compile(ctx, b: any, p) {
        ctx.watch(() => b.speed);
        const speed = length(p.velocity);
        const limit = compileValue(ctx, b.speed, p.t);
        const dampen = ctx.float(() => b.dampen);
        const percent = speed.sub(limit).div(max(speed, 1e-9));
        const factor = select(speed.greaterThan(limit), float(1).sub(percent.mul(dampen).mul(ctx.delta).mul(20)), 1);
        p.velocity.mulAssign(factor);
        ctx.written.add('velocity');
    },
});

// ---- by speed -----------------------------------------------------------------------------------------------

registerGPUBehavior('ColorBySpeed', {
    supports: (b: any) => canCompileColor(b.color),
    compile(ctx, b: any, p) {
        ctx.watch(() => b.color);
        p.color.assign(compileColor(ctx, b.color, speedT(ctx, b, p)).mul(p.startColor));
        ctx.written.add('color');
    },
});

registerGPUBehavior('SizeBySpeed', {
    supports: (b: any) => canCompileSize(b.size),
    compile(ctx, b: any, p) {
        ctx.watch(() => b.size);
        p.size.assign(compileSize(ctx, b.size, speedT(ctx, b, p), p));
        ctx.written.add('sizeRotation');
    },
});

registerGPUBehavior('RotationBySpeed', {
    supports: (b: any) => canCompileValue(b.angularVelocity),
    compile(ctx, b: any, p, system) {
        if (!isBillboard(system)) return;
        ctx.watch(() => b.angularVelocity);
        p.rotation.addAssign(ctx.delta.mul(compileValue(ctx, b.angularVelocity, speedT(ctx, b, p))));
        ctx.written.add('sizeRotation');
    },
});

// ---- forces -------------------------------------------------------------------------------------------------

registerGPUBehavior('ApplyForce', {
    supports: () => true,
    compile(ctx, b: any, p) {
        const direction = ctx.vec3(() => b.direction);
        // rolled once per frame on the CPU in frameUpdate()
        const magnitude = ctx.float(() => b.magnitudeValue);
        p.velocity.addAssign(direction.mul(magnitude.mul(ctx.delta)));
        ctx.written.add('velocity');
    },
});

registerGPUBehavior('GravityForce', {
    supports: () => true,
    compile(ctx, b: any, p) {
        const center = ctx.vec3(() => b.center);
        const magnitude = ctx.float(() => b.magnitude);
        const toCenter = center.sub(p.position);
        const distanceSq = dot(toCenter, toCenter);
        p.velocity.addAssign(normalize(toCenter).mul(magnitude.div(distanceSq).mul(ctx.delta)));
        ctx.written.add('velocity');
    },
});

registerGPUBehavior('ForceOverLife', {
    supports: (b: any) => canCompileValue(b.x) && canCompileValue(b.y) && canCompileValue(b.z),
    compile(ctx, b: any, p) {
        ctx.watch(() => b.x);
        ctx.watch(() => b.y);
        ctx.watch(() => b.z);
        let force: N = vec3(compileValue(ctx, b.x, p.t), compileValue(ctx, b.y, p.t), compileValue(ctx, b.z, p.t));
        if (!ctx.worldSpace) {
            // world space force into the emitter's local space (inverse rotation / scale computed in frameUpdate())
            const scale = ctx.vec3(() => b._tempScale);
            const rotation = ctx.vec4(() => b._tempQ);
            force = quatRotate(rotation, force.mul(scale));
        }
        p.velocity.addAssign(force.mul(ctx.delta));
        ctx.written.add('velocity');
    },
});

registerGPUBehavior('TurbulenceField', {
    supports: () => true,
    compile(ctx, b: any, p) {
        ctx.watch(() => b.octaves);
        const scale = ctx.vec3(() => b.scale);
        const multiplier = ctx.vec3(() => b.velocityMultiplier);
        const timeOffset = ctx.vec3(() => b.timeOffset);
        const x = p.position.div(scale);
        // 4D simplex noise of the CPU version approximated with 3D gradient noise whose domain drifts with time
        const sample = (q: N, time: N, channel: number) =>
            mx_noise_float(q.add(vec3(time.mul(0.71), time.mul(1.37), time).add(channel * 19.19)));
        let sum: N = vec3(0);
        let level = 1;
        for (let i = 0; i < b.octaves; i++) {
            const q = x.mul(level);
            sum = sum.add(
                vec3(
                    sample(q, timeOffset.x.mul(level), 0),
                    sample(q, timeOffset.y.mul(level), 1),
                    sample(q, timeOffset.z.mul(level), 2)
                ).div(level)
            );
            level *= 2;
        }
        p.velocity.addAssign(sum.mul(multiplier).mul(ctx.delta));
        ctx.written.add('velocity');
    },
});

registerGPUBehavior('Noise', {
    usesNoiseState: true,
    supports: (b: any) =>
        canCompileValue(b.frequency) &&
        canCompileValue(b.power) &&
        canCompileValue(b.positionAmount) &&
        canCompileValue(b.rotationAmount),
    compile(ctx, b: any, p) {
        for (const key of ['frequency', 'power', 'positionAmount', 'rotationAmount']) ctx.watch(() => b[key]);
        const state = p.noise!;
        const frequency = compileValue(ctx, b.frequency, p.t);
        const power = compileValue(ctx, b.power, p.t);
        const positionAmount = compileValue(ctx, b.positionAmount, p.t);
        const rotationAmount = compileValue(ctx, b.rotationAmount, p.t);
        // the CPU version picks 4 of 100 noise generators per particle; offset the noise domain per particle instead
        const time = p.age.mul(frequency);
        const channel = (offset: N) => mx_noise_float(vec2(offset.mul(1000.0), time));
        const n0 = channel(ctx.random());
        const n1 = channel(ctx.random());
        const n2 = channel(ctx.random());
        const n3 = channel(ctx.random());

        const offset = vec3(n0, n1, n2).mul(power.mul(positionAmount)).toVar();
        const movePosition = positionAmount.greaterThan(0);
        p.position.assign(select(movePosition, p.position.sub(state.xyz).add(offset), p.position));
        const lastOffset = select(movePosition, offset, state.xyz);

        const rotate = rotationAmount.greaterThan(0);
        if (p.quaternion !== null) {
            const last = p.noiseQuaternion!;
            const raw = vec4(n0, n1, n2, n3).mul(power.mul(rotationAmount));
            const q = raw.div(max(length(raw), 1e-9)).toVar();
            const inverseLast = vec4(last.xyz.negate(), last.w);
            const rotated = quatMul(quatMul(p.quaternion, inverseLast), q);
            p.quaternion.assign(select(rotate, rotated, p.quaternion));
            last.assign(select(rotate, q, last));
            state.assign(vec4(lastOffset, state.w));
            ctx.written.add('quaternion');
        } else {
            const angle = n3.mul(Math.PI).mul(power).mul(rotationAmount);
            p.rotation.assign(select(rotate, p.rotation.sub(state.w).add(angle), p.rotation));
            state.assign(vec4(lastOffset, select(rotate, angle, state.w)));
            ctx.written.add('sizeRotation');
        }
        ctx.written.add('noise');
    },
});

// ---- initialize-only / not applicable -----------------------------------------------------------------------

const noUpdate: GPUBehaviorCompiler = {supports: () => true, compile: () => undefined};
// changes the emit direction in initialize(), which runs on the CPU at spawn
registerGPUBehavior('ChangeEmitDirection', noUpdate);
// trails only (trails are not simulated on the GPU)
registerGPUBehavior('WidthOverLength', noUpdate);
