/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GPU emission: TSL versions of what `ParticleSystem.spawn()` does for each new particle (start values, emitter
 * shape, emitter transform, every behavior's `initialize()`), used by the spawn kernels of the GPU simulation.
 *
 * The CPU still decides *how many* particles a system emits (emission rate, bursts, emission over distance); it hands
 * the GPU one small range per emission call instead of one record per particle. Shape parameters, start value curves
 * and so on are parameters (see {@link GPUCompileContext}), so systems whose emission code has the same shape share
 * one spawn kernel.
 */
import * as TSL from 'three/tsl';
import {EmitterMode, ParticleSystem, RenderMode} from 'three.quarks';
import type {EmissionState} from 'three.quarks';
import type {GPUCompileContext} from './GPUCompileContext';
import {getGPUBehaviorCompiler, GPUParticleState} from './GPUBehaviors';
import {
    canCompileColor,
    canCompileRotation,
    canCompileValue,
    canCompileVector3,
    compileColor,
    compileRotation,
    compileValue,
    compileVector3,
    maxGeneratorValue,
    quatFromAxisAngle,
    quatMul,
} from './GPUGenerators';

// untyped TSL: the generated graphs mix node types the typings cannot follow
const {abs, acos, cos, cross, dot, float, floor, max, mix, normalize, pow, select, sin, sqrt, trunc, vec3, vec4} =
    TSL as any;

type N = any;

/** Per-particle inputs of the emission code, read from the emission range of the particle. */
export interface GPUEmissionInput {
    /** emission time / duration of the emission call (start value curves) */
    t: N;
    /** emission time of the emission call, seconds (`startColor` is evaluated at it, like on the CPU) */
    time: N;
    /** current value of the emitter shape (`EmitterMode.Loop` / `PingPong` / `Burst`) */
    shapeValue: N;
    /** index of the particle in its emission call */
    burstIndex: N;
    /** number of particles of the burst, 0 when the call is not a burst */
    burstCount: N;
    /** columns of the emitter's world matrix (applied by world space systems) */
    matrix: [N, N, N, N];
    /** columns of the emitter's normal matrix */
    normalMatrix: [N, N, N];
    /** emitter scale (from the world matrix) */
    scale: N;
    /** emitter rotation quaternion (from the world matrix) */
    rotation: N;
}

/**
 * How a particle system emits on the GPU (see `GPUSimulationProgram.emission`).
 */
export interface GPUEmissionProgram {
    /** why particles of the system have to be emitted on the CPU, or `null` */
    support(): string | null;
    /** Records the structural values of the emission code (`ctx.watch`), like `GPUSimulationProgram.watch`. */
    watch(ctx: GPUCompileContext): void;
    /**
     * Emits the TSL code that initializes particle `p` (variables preset to a dead-free default: age 0, speed
     * modifier 1, zero noise state; `p.seed` is the particle's seed).
     */
    compile(ctx: GPUCompileContext, p: GPUParticleState, e: GPUEmissionInput): void;
    /** upper bound of the lifetime of emitted particles, seconds */
    maxLife(): number;
    /** Appends the CPU values of an emission call, read by the code as `e.t`, `e.time`, `e.shapeValue`. */
    rangeValues(emissionState: EmissionState, out: number[]): void;
}

// ---- math helpers -------------------------------------------------------------------------------------------

/** `normalize(v)`, or zero for a zero vector (like three.js `Vector3.normalize`). */
export function safeNormalize(v: N): N {
    return select(dot(v, v).greaterThan(0), normalize(v), vec3(0));
}

/** Quaternion of the rotation matrix with columns `x`, `y`, `z` (three.js `Quaternion.setFromRotationMatrix`). */
export function quatFromBasis(x: N, y: N, z: N): N {
    const m11 = x.x,
        m21 = x.y,
        m31 = x.z;
    const m12 = y.x,
        m22 = y.y,
        m32 = y.z;
    const m13 = z.x,
        m23 = z.y,
        m33 = z.z;
    const trace = m11.add(m22).add(m33);
    const sA = float(0.5).div(sqrt(trace.add(1)));
    const qA = vec4(m32.sub(m23).mul(sA), m13.sub(m31).mul(sA), m21.sub(m12).mul(sA), float(0.25).div(sA));
    const sB = sqrt(float(1).add(m11).sub(m22).sub(m33)).mul(2);
    const qB = vec4(sB.mul(0.25), m12.add(m21).div(sB), m13.add(m31).div(sB), m32.sub(m23).div(sB));
    const sC = sqrt(float(1).add(m22).sub(m11).sub(m33)).mul(2);
    const qC = vec4(m12.add(m21).div(sC), sC.mul(0.25), m23.add(m32).div(sC), m13.sub(m31).div(sC));
    const sD = sqrt(float(1).add(m33).sub(m11).sub(m22)).mul(2);
    const qD = vec4(m13.add(m31).div(sD), m23.add(m32).div(sD), sD.mul(0.25), m21.sub(m12).div(sD));
    return select(
        trace.greaterThan(0),
        qA,
        select(m11.greaterThan(m22).and(m11.greaterThan(m33)), qB, select(m22.greaterThan(m33), qC, qD))
    );
}

/**
 * Moves a particle emitted in emitter space into world space, like the world space branch of
 * `ParticleSystem.spawn()`: position by the emitter matrix, `size` scaled by the emitter scale (absolute), velocity by
 * the scale and the normal matrix, mesh rotation by the emitter rotation.
 * @param size the size variable the CPU scales (`startSize` for `ParticleSystem`, `size` for `NodeVFX`)
 */
export function applyEmitterTransform(p: GPUParticleState, e: GPUEmissionInput, size: N) {
    const [c0, c1, c2, c3] = e.matrix;
    const [n0, n1, n2] = e.normalMatrix;
    const position = p.position;
    p.position.assign(c0.mul(position.x).add(c1.mul(position.y)).add(c2.mul(position.z)).add(c3));
    size.assign(abs(size.mul(e.scale)));
    const velocity = p.velocity.mul(e.scale);
    p.velocity.assign(n0.mul(velocity.x).add(n1.mul(velocity.y)).add(n2.mul(velocity.z)));
    if (p.quaternion) p.quaternion.assign(quatMul(e.rotation, p.quaternion));
}

/**
 * Rotation that points an object's +Z axis away from `target` as seen from the origin, with +Y up (three.js
 * `Matrix4.lookAt(origin, target, up)` then `Quaternion.setFromRotationMatrix`).
 */
export function quatLookAt(target: N): N {
    const up = vec3(0, 1, 0);
    const z0 = target.negate();
    const z1 = normalize(select(dot(z0, z0).equal(0), vec3(0, 0, 1), z0));
    // looking straight up or down: nudge the direction like three.js does
    const parallel = z1.x.equal(0).and(z1.z.equal(0));
    const z = select(parallel, normalize(vec3(z1.x, z1.y, z1.z.add(0.0001))), z1);
    const x = normalize(cross(up, z));
    const y = cross(z, x);
    return quatFromBasis(x, y, z);
}

// ---- emitter shapes -----------------------------------------------------------------------------------------

/**
 * GPU version of an emitter shape's `initialize()`: sets `p.position` and `p.velocity` (emitter space) from
 * `p.startSpeed`, and the default mesh rotation when the shape has one.
 */
export interface GPUEmitterShapeCompiler {
    /** whether this shape instance can be emitted on the GPU (default: yes) */
    supports?(shape: any): boolean;
    compile(ctx: GPUCompileContext, shape: any, p: GPUParticleState, e: GPUEmissionInput): void;
}

const shapeCompilers = new Map<string, GPUEmitterShapeCompiler>();

/** Registers the GPU version of an emitter shape type (`shape.type`), e.g. for a custom shape plugin. */
export function registerGPUEmitterShape(type: string, compiler: GPUEmitterShapeCompiler) {
    shapeCompilers.set(type, compiler);
}

/** The GPU version of an emitter shape, or `undefined`. */
export function getGPUEmitterShapeCompiler(shape: {type: string}): GPUEmitterShapeCompiler | undefined {
    return shapeCompilers.get(shape.type);
}

/** `getValueFromEmitterMode()`: where along the shape (`[0, 1]`) the particle is emitted. */
export function compileEmitterModeValue(ctx: GPUCompileContext, shape: any, e: GPUEmissionInput): N {
    const mode: EmitterMode = shape.mode ?? EmitterMode.Random;
    ctx.token(`mode:${mode}`);
    let value: N;
    if (mode === EmitterMode.Random) {
        value = ctx.random();
    } else if (mode === EmitterMode.Burst) {
        value = select(e.burstCount.greaterThan(0), e.burstIndex.div(max(e.burstCount, 1)), e.shapeValue);
    } else {
        value = e.shapeValue;
    }
    const spread = ctx.float(() => shape.spread ?? 0);
    const u = select(spread.greaterThan(0), floor(value.div(max(spread, 1e-30))).mul(spread), value);
    // JS `%` (truncated remainder)
    if (mode === EmitterMode.Loop) return u.sub(trunc(u));
    if (mode === EmitterMode.PingPong) return abs(u.sub(trunc(u.mul(0.5)).mul(2)).sub(1));
    return u;
}

/** `lerp(1 - thickness, 1, random)` */
function thicknessFactor(ctx: GPUCompileContext, shape: any): N {
    const thickness = ctx.float(() => shape.thickness);
    return mix(float(1).sub(thickness), float(1), ctx.random());
}

/** Mesh particles whose start rotation is the identity face `direction` (the shapes' default orientation). */
function defaultMeshRotation(p: GPUParticleState, direction: N) {
    const q = p.quaternion;
    if (!q) return;
    const identity = q.x.equal(0).and(q.y.equal(0)).and(q.z.equal(0)).and(q.w.equal(1));
    q.assign(select(identity, quatLookAt(direction), q));
}

/** Unit vector at polar angle `phi` and azimuth `theta`. */
function spherical(theta: N, phi: N): N {
    return vec3(sin(phi).mul(cos(theta)), sin(phi).mul(sin(theta)), cos(phi));
}

registerGPUEmitterShape('point', {
    compile(ctx, shape, p) {
        const theta = ctx.random().mul(Math.PI * 2);
        const phi = acos(ctx.random().mul(2).sub(1));
        const r = pow(ctx.random(), 1 / 3);
        p.velocity.assign(spherical(theta, phi).mul(r).mul(p.startSpeed));
        p.position.assign(vec3(0));
        defaultMeshRotation(p, p.velocity);
    },
});

function sphereLike(hemisphere: boolean): GPUEmitterShapeCompiler {
    return {
        compile(ctx, shape, p, e) {
            const u = compileEmitterModeValue(ctx, shape, e);
            const v = ctx.random();
            const rand = thicknessFactor(ctx, shape);
            const theta = u.mul(ctx.float(() => shape.arc));
            const phi = hemisphere ? acos(v) : acos(v.mul(2).sub(1));
            const direction = spherical(theta, phi);
            p.velocity.assign(direction.mul(p.startSpeed));
            p.position.assign(direction.mul(ctx.float(() => shape.radius).mul(rand)));
            defaultMeshRotation(p, p.position);
        },
    };
}
registerGPUEmitterShape('sphere', sphereLike(false));
registerGPUEmitterShape('hemisphere', sphereLike(true));

registerGPUEmitterShape('cone', {
    compile(ctx, shape, p, e) {
        const u = compileEmitterModeValue(ctx, shape, e);
        const rand = thicknessFactor(ctx, shape);
        const theta = u.mul(ctx.float(() => shape.arc));
        const r = sqrt(rand);
        const disc = vec3(r.mul(cos(theta)), r.mul(sin(theta)), 0);
        const angle = ctx.float(() => shape.angle).mul(r);
        p.velocity.assign(
            vec3(0, 0, cos(angle))
                .add(disc.mul(sin(angle)))
                .mul(p.startSpeed)
        );
        p.position.assign(disc.mul(ctx.float(() => shape.radius)));
    },
});

registerGPUEmitterShape('circle', {
    compile(ctx, shape, p, e) {
        const u = compileEmitterModeValue(ctx, shape, e);
        const r = thicknessFactor(ctx, shape);
        const theta = u.mul(ctx.float(() => shape.arc));
        const direction = vec3(cos(theta), sin(theta), 0);
        p.velocity.assign(direction.mul(p.startSpeed));
        p.position.assign(direction.mul(ctx.float(() => shape.radius).mul(r)));
    },
});

registerGPUEmitterShape('donut', {
    compile(ctx, shape, p, e) {
        const u = compileEmitterModeValue(ctx, shape, e);
        const v = ctx.random();
        const rand = thicknessFactor(ctx, shape);
        const theta = u.mul(ctx.float(() => shape.arc));
        const phi = v.mul(Math.PI * 2);
        const radius = ctx.float(() => shape.radius);
        const tube = ctx.float(() => shape.donutRadius).mul(rand);
        const offset = vec3(tube.mul(cos(phi)).mul(cos(theta)), tube.mul(cos(phi)).mul(sin(theta)), tube.mul(sin(phi)));
        p.position.assign(vec3(radius.mul(cos(theta)), radius.mul(sin(theta)), 0).add(offset));
        p.velocity.assign(safeNormalize(offset).mul(p.startSpeed));
        defaultMeshRotation(p, p.velocity);
    },
});

registerGPUEmitterShape('rectangle', {
    compile(ctx, shape, p, e) {
        const u = compileEmitterModeValue(ctx, shape, e);
        const w = ctx.float(() => shape.width);
        const h = ctx.float(() => shape.height);
        const point = u.mul(w.add(h).mul(2));
        const halfW = w.mul(0.5);
        const halfH = h.mul(0.5);
        // walk the perimeter: bottom, right, top, left edge
        const x = select(
            point.lessThan(w),
            point.sub(halfW),
            select(
                point.lessThan(w.add(h)),
                halfW,
                select(point.lessThan(w.mul(2).add(h)), halfW.sub(point.sub(w).sub(h)), halfW.negate())
            )
        );
        const y = select(
            point.lessThan(w),
            halfH.negate(),
            select(
                point.lessThan(w.add(h)),
                point.sub(w).sub(halfH),
                select(point.lessThan(w.mul(2).add(h)), halfH, halfH.sub(point.sub(w.mul(2)).sub(h)))
            )
        );
        const scale = float(1).sub(ctx.float(() => shape.thickness).mul(ctx.random()));
        const edge = vec3(x, y, 0);
        p.position.assign(edge.mul(scale));
        p.velocity.assign(safeNormalize(edge).mul(p.startSpeed));
        defaultMeshRotation(p, p.velocity);
    },
});

registerGPUEmitterShape('grid', {
    compile(ctx, shape, p) {
        const width = ctx.float(() => shape.width);
        const height = ctx.float(() => shape.height);
        const column = ctx.float(() => shape.column);
        const row = ctx.float(() => shape.row);
        const r = floor(ctx.random().mul(row));
        const c = floor(ctx.random().mul(column));
        p.position.assign(
            vec3(c.mul(width).div(column).sub(width.mul(0.5)), r.mul(height).div(row).sub(height.mul(0.5)), 0)
        );
        p.velocity.assign(vec3(0, 0, p.startSpeed));
    },
});

// ---- ParticleSystem -----------------------------------------------------------------------------------------

const isMesh = (system: ParticleSystem) => system.rendererSettings.renderMode === RenderMode.Mesh;
const isVec3Size = (system: ParticleSystem) => (system.startSize as any).type === 'vec3function';
const isRotationGenerator = (gen: unknown) => (gen as any)?.type === 'rotation';

/** The GPU emission of a {@link ParticleSystem}: `spawn()` for one particle. */
export function createBehaviorEmission(system: ParticleSystem): GPUEmissionProgram {
    return {
        support() {
            const shape = system.emitterShape;
            const shapeCompiler = getGPUEmitterShapeCompiler(shape);
            if (!shapeCompiler || (shapeCompiler.supports && !shapeCompiler.supports(shape))) {
                return `emitter shape ${shape.type} has no GPU version`;
            }
            if (!canCompileValue(system.startLife) || maxGeneratorValue(system.startLife) === null) {
                return 'startLife has no GPU version';
            }
            if (!canCompileValue(system.startSpeed)) return 'startSpeed has no GPU version';
            if (!(isVec3Size(system) ? canCompileVector3(system.startSize) : canCompileValue(system.startSize))) {
                return 'startSize has no GPU version';
            }
            if (!canCompileColor(system.startColor)) return 'startColor has no GPU version';
            if (!canCompileValue(system.startTileIndex)) return 'startTileIndex has no GPU version';
            const rotation = system.startRotation;
            if (
                isRotationGenerator(rotation)
                    ? isMesh(system) && !canCompileRotation(rotation)
                    : !canCompileValue(rotation)
            ) {
                return 'startRotation has no GPU version';
            }
            for (const behavior of system.behaviors) {
                const compiler = getGPUBehaviorCompiler(behavior);
                if (!compiler || (!compiler.initialize && !compiler.trivialInitialize)) {
                    return `behavior ${behavior.type} initializes particles on the CPU`;
                }
            }
            return null;
        },
        watch(ctx) {
            ctx.watch(() => system.emitterShape);
            ctx.watch(() => (system.emitterShape as any).mode);
            ctx.watch(() => system.startLife);
            ctx.watch(() => system.startSpeed);
            ctx.watch(() => system.startSize);
            ctx.watch(() => system.startColor);
            ctx.watch(() => system.startTileIndex);
            ctx.watch(() => system.startRotation);
            ctx.watch(() => system.rendererSettings.renderMode);
            // only behaviors with a GPU initialize() shape the code; the others just signal an edit
            ctx.watch(() => system.behaviors.length, false);
            system.behaviors.forEach((_, i) => ctx.watch(() => system.behaviors[i], false));
        },
        compile(ctx, p, e) {
            // start values (ParticleSystem.spawn)
            p.startColor.assign(compileColor(ctx, system.startColor, e.time));
            p.color.assign(p.startColor);
            p.startSpeed.assign(compileValue(ctx, system.startSpeed, e.t));
            p.life.assign(compileValue(ctx, system.startLife, e.t));
            if (isVec3Size(system)) {
                p.startSize.assign(compileVector3(ctx, system.startSize as any, e.t));
            } else {
                p.startSize.assign(vec3(compileValue(ctx, system.startSize, e.t)));
            }
            p.uvTile.assign(compileValue(ctx, system.startTileIndex, float(0)));
            p.size.assign(p.startSize);
            const rotation = system.startRotation;
            if (p.quaternion) {
                p.quaternion.assign(
                    isRotationGenerator(rotation)
                        ? compileRotation(ctx, rotation, float(1), e.t)
                        : quatFromAxisAngle(vec3(0, 1, 0), compileValue(ctx, rotation, e.t))
                );
            } else if (!isRotationGenerator(rotation)) {
                p.rotation.assign(compileValue(ctx, rotation, e.t));
            }

            // emitter shape (emitter space)
            ctx.token(`shape:${system.emitterShape.type}`);
            getGPUEmitterShapeCompiler(system.emitterShape)!.compile(ctx, system.emitterShape, p, e);

            // emitter transform
            if (ctx.worldSpace) {
                applyEmitterTransform(p, e, p.startSize);
                p.size.assign(p.startSize);
            }

            // behaviors
            for (const behavior of system.behaviors) {
                const compiler = getGPUBehaviorCompiler(behavior)!;
                if (!compiler.initialize) continue;
                ctx.token(`init:${behavior.type}`);
                compiler.initialize(ctx, behavior, p, system);
            }
        },
        maxLife() {
            return maxGeneratorValue(system.startLife) ?? Infinity;
        },
        rangeValues(emissionState, out) {
            out.push(
                emissionState.time / system.duration,
                emissionState.time,
                (system.emitterShape as any).currentValue ?? 0
            );
        },
    };
}
