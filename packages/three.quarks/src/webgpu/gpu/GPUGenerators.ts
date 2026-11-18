/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TSL versions of the quarks value / color / vector / rotation generators, used by the GPU simulation kernels.
 *
 * Generator parameters become uniforms refreshed every step (see {@link GPUCompileContext}); the generated code only
 * depends on the generator classes and the number of curve segments / gradient keys. Random generators that roll once
 * per particle (`IntervalValue`, `ColorRange`, ...) use a per-particle hash stream instead of a memory slot.
 */
import * as TSL from 'three/tsl';
import {
    AxisAngleGenerator,
    ColorRange,
    ConstantColor,
    ConstantValue,
    EulerGenerator,
    Gradient,
    IntervalValue,
    PiecewiseBezier,
    RandomColor,
    RandomColorBetweenGradient,
    RandomQuatGenerator,
    Vector3Function,
} from 'three.quarks';
import type {GPUCompileContext} from './GPUCompileContext';

// untyped TSL: the generated graphs mix node types the typings cannot follow
const {cos, cross, dot, float, max, mix, saturate, sin, sqrt, vec3, vec4} = TSL as any;

type N = any;

// ---- quaternion helpers -------------------------------------------------------------------------------------

/** Hamilton product `a * b` (same convention as `Quaternion.multiply`). */
export function quatMul(a: N, b: N): N {
    return vec4(
        b.xyz.mul(a.w).add(a.xyz.mul(b.w)).add(cross(a.xyz, b.xyz)),
        a.w.mul(b.w).sub(dot(a.xyz, b.xyz))
    );
}

/** Rotation of `angle` radians around the unit vector `axis`. */
export function quatFromAxisAngle(axis: N, angle: N): N {
    const half = angle.mul(0.5);
    return vec4(axis.mul(sin(half)), cos(half));
}

/** Rotates vector `v` by unit quaternion `q`. */
export function quatRotate(q: N, v: N): N {
    const qv = q.xyz;
    return v.add(cross(qv, cross(qv, v).add(v.mul(q.w))).mul(2.0));
}

// signs of the second product term of x, y, z, w for each Euler order (three.js `Quaternion.setFromEuler`)
const EULER_SIGNS: Record<string, [number, number, number, number]> = {
    XYZ: [1, -1, 1, -1],
    YXZ: [1, -1, -1, 1],
    ZXY: [-1, 1, 1, -1],
    ZYX: [-1, 1, -1, 1],
    YZX: [1, 1, -1, -1],
    XZY: [-1, -1, 1, 1],
};

/** Quaternion of the Euler angles `x`, `y`, `z` (radians) applied in `order`. */
export function quatFromEuler(x: N, y: N, z: N, order: string): N {
    const signs = EULER_SIGNS[order] ?? EULER_SIGNS.XYZ;
    const c1 = cos(x.mul(0.5)),
        c2 = cos(y.mul(0.5)),
        c3 = cos(z.mul(0.5));
    const s1 = sin(x.mul(0.5)),
        s2 = sin(y.mul(0.5)),
        s3 = sin(z.mul(0.5));
    const term = (a: N, b: N, sign: number) => (sign > 0 ? a.add(b) : a.sub(b));
    return vec4(
        term(s1.mul(c2).mul(c3), c1.mul(s2).mul(s3), signs[0]),
        term(c1.mul(s2).mul(c3), s1.mul(c2).mul(s3), signs[1]),
        term(c1.mul(c2).mul(s3), s1.mul(s2).mul(c3), signs[2]),
        term(c1.mul(c2).mul(c3), s1.mul(s2).mul(s3), signs[3])
    );
}

// ---- value generators ---------------------------------------------------------------------------------------

/** Upper bound of a value generator, or `null` if unknown. */
export function maxGeneratorValue(gen: unknown): number | null {
    if (gen instanceof ConstantValue) return gen.value;
    if (gen instanceof IntervalValue) return Math.max(gen.a, gen.b);
    if (gen instanceof PiecewiseBezier) {
        let max = -Infinity;
        for (const [bezier] of gen.functions) for (const p of bezier.p) max = Math.max(max, p);
        return Number.isFinite(max) ? max : null;
    }
    return null;
}

/** Whether {@link compileValue} supports the generator. */
export function canCompileValue(gen: unknown): boolean {
    return gen instanceof ConstantValue || gen instanceof IntervalValue || gen instanceof PiecewiseBezier;
}

function bezier(p: N, u: N): N {
    const mt = float(1).sub(u);
    return p.x
        .mul(mt.mul(mt).mul(mt))
        .add(p.y.mul(mt.mul(mt).mul(u).mul(3)))
        .add(p.z.mul(mt.mul(u).mul(u).mul(3)))
        .add(p.w.mul(u.mul(u).mul(u)));
}

function compilePiecewiseBezier(ctx: GPUCompileContext, gen: PiecewiseBezier, t: N): N {
    const n = gen.functions.length;
    ctx.watch(() => gen.functions.length);
    if (n === 0) return float(0);
    const coefficients: N[] = [];
    const starts: N[] = [];
    for (let i = 0; i < n; i++) {
        coefficients.push(
            ctx.vec4(() => {
                const segment = gen.functions[i];
                if (!segment) return null as any;
                const p = segment[0].p;
                return {x: p[0], y: p[1], z: p[2], w: p[3]};
            })
        );
        starts.push(ctx.float(() => (gen.functions[i] ? gen.functions[i][1] : 0)));
    }
    // segment containing t: the last one whose start <= t (segments are sorted by start)
    let p = coefficients[0];
    let start = starts[0];
    let end: N = n > 1 ? starts[1] : float(1);
    for (let i = 1; i < n; i++) {
        const inside = t.greaterThanEqual(starts[i]);
        p = inside.select(coefficients[i], p);
        start = inside.select(starts[i], start);
        end = inside.select(i + 1 < n ? starts[i + 1] : float(1), end);
    }
    const u = t.sub(start).div(max(end.sub(start), 1e-6));
    return bezier(p, u);
}

/**
 * A `ValueGenerator` / `FunctionValueGenerator` evaluated at `t` (normalized age or speed).
 */
export function compileValue(ctx: GPUCompileContext, gen: unknown, t: N): N {
    ctx.token((gen as any)?.constructor?.name ?? 'none');
    if (gen instanceof ConstantValue) {
        return ctx.float(() => gen.value);
    }
    if (gen instanceof IntervalValue) {
        return mix(
            ctx.float(() => gen.a),
            ctx.float(() => gen.b),
            ctx.random()
        );
    }
    if (gen instanceof PiecewiseBezier) {
        return compilePiecewiseBezier(ctx, gen, t);
    }
    throw new Error(`GPU simulation: unsupported value generator ${(gen as any)?.constructor?.name}`);
}

// ---- vector generators --------------------------------------------------------------------------------------

/** Whether {@link compileVector3} supports the generator. */
export function canCompileVector3(gen: unknown): boolean {
    return (
        gen instanceof Vector3Function && canCompileValue(gen.x) && canCompileValue(gen.y) && canCompileValue(gen.z)
    );
}

export function compileVector3(ctx: GPUCompileContext, gen: Vector3Function, t: N): N {
    ctx.token('Vector3Function');
    return vec3(compileValue(ctx, gen.x, t), compileValue(ctx, gen.y, t), compileValue(ctx, gen.z, t));
}

// ---- color generators ---------------------------------------------------------------------------------------

/** Whether {@link compileColor} supports the generator. */
export function canCompileColor(gen: unknown): boolean {
    return (
        gen instanceof ConstantColor ||
        gen instanceof ColorRange ||
        gen instanceof RandomColor ||
        gen instanceof Gradient ||
        gen instanceof RandomColorBetweenGradient
    );
}

/** Piecewise linear keys: starting from the first key, each segment blends in by its own progress. */
function compileLinearKeys(
    ctx: GPUCompileContext,
    count: () => number,
    value: (i: number) => N,
    time: (i: number) => N,
    t: N
): N {
    const n = count();
    ctx.watch(count);
    let result = value(0);
    for (let i = 1; i < n; i++) {
        const t0 = time(i - 1);
        const t1 = time(i);
        const f = saturate(t.sub(t0).div(max(t1.sub(t0), 1e-6)));
        result = mix(result, value(i), f);
    }
    return result;
}

function compileGradient(ctx: GPUCompileContext, gen: Gradient, t: N): N {
    const colorKeys = () => gen.color.keys;
    const alphaKeys = () => gen.alpha.keys;
    const rgb = compileLinearKeys(
        ctx,
        () => colorKeys().length,
        (i) => ctx.vec3(() => colorKeys()[i]?.[0]),
        (i) => ctx.float(() => colorKeys()[i]?.[1] ?? 1),
        t
    );
    const alpha = compileLinearKeys(
        ctx,
        () => alphaKeys().length,
        (i) => ctx.float(() => alphaKeys()[i]?.[0] ?? 1),
        (i) => ctx.float(() => alphaKeys()[i]?.[1] ?? 1),
        t
    );
    return vec4(rgb, alpha);
}

/**
 * A `ColorGenerator` / `FunctionColorGenerator` evaluated at `t`, as vec4.
 */
export function compileColor(ctx: GPUCompileContext, gen: unknown, t: N): N {
    ctx.token((gen as any)?.constructor?.name ?? 'none');
    if (gen instanceof ConstantColor) {
        return ctx.vec4(() => gen.color);
    }
    if (gen instanceof ColorRange) {
        return mix(
            ctx.vec4(() => gen.a),
            ctx.vec4(() => gen.b),
            ctx.random()
        );
    }
    if (gen instanceof RandomColor) {
        // rolls a new value every evaluation, like the CPU version
        return mix(
            ctx.vec4(() => gen.a),
            ctx.vec4(() => gen.b),
            ctx.randomPerStep()
        );
    }
    if (gen instanceof Gradient) {
        return compileGradient(ctx, gen, t);
    }
    if (gen instanceof RandomColorBetweenGradient) {
        ctx.watch(() => gen.gradient1);
        ctx.watch(() => gen.gradient2);
        return mix(compileGradient(ctx, gen.gradient1, t), compileGradient(ctx, gen.gradient2, t), ctx.random());
    }
    throw new Error(`GPU simulation: unsupported color generator ${(gen as any)?.constructor?.name}`);
}

// ---- rotation generators ------------------------------------------------------------------------------------

/** Whether {@link compileRotation} supports the generator. */
export function canCompileRotation(gen: unknown): boolean {
    if (gen instanceof AxisAngleGenerator) return canCompileValue(gen.angle);
    if (gen instanceof EulerGenerator) {
        return canCompileValue(gen.angleX) && canCompileValue(gen.angleY) && canCompileValue(gen.angleZ);
    }
    return gen instanceof RandomQuatGenerator;
}

/**
 * A `RotationGenerator` evaluated for one step (`delta` seconds) at `t`, as a quaternion.
 */
export function compileRotation(ctx: GPUCompileContext, gen: unknown, delta: N, t: N): N {
    ctx.token((gen as any)?.constructor?.name ?? 'none');
    if (gen instanceof AxisAngleGenerator) {
        return quatFromAxisAngle(
            ctx.vec3(() => gen.axis),
            compileValue(ctx, gen.angle, t).mul(delta)
        );
    }
    if (gen instanceof EulerGenerator) {
        const order = (gen as any).eular?.order ?? 'XYZ';
        ctx.watch(() => (gen as any).eular?.order ?? 'XYZ');
        return quatFromEuler(
            compileValue(ctx, gen.angleX, t).mul(delta),
            compileValue(ctx, gen.angleY, t).mul(delta),
            compileValue(ctx, gen.angleZ, t).mul(delta),
            order
        );
    }
    if (gen instanceof RandomQuatGenerator) {
        // uniformly distributed rotation, fixed per particle (Shoemake)
        const u1 = ctx.random();
        const u2 = ctx.random().mul(Math.PI * 2);
        const u3 = ctx.random().mul(Math.PI * 2);
        const a = sqrt(float(1).sub(u1));
        const b = sqrt(u1);
        return vec4(a.mul(sin(u2)), a.mul(cos(u2)), b.mul(sin(u3)), b.mul(cos(u3)));
    }
    throw new Error(`GPU simulation: unsupported rotation generator ${(gen as any)?.constructor?.name}`);
}
