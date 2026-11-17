/* eslint-disable @typescript-eslint/no-explicit-any */
import * as TSL from 'three/tsl';

// untyped TSL: the generated graphs mix node types the typings cannot follow
const {float, hash, uint, uniform, vec3, vec4} = TSL as any;

type N = any;

interface XYZ {
    x: number;
    y: number;
    z: number;
}
interface XYZW extends XYZ {
    w: number;
}

/** 32-bit odd constant that decorrelates the random streams of different generators. */
function streamConstant(index: number): number {
    return (Math.imul(index + 1, 0x9e3779b9) ^ 0x85ebca6b) >>> 0;
}

/** One value read by the generated code (`size` floats in the system's parameter row). */
interface ParameterSlot {
    offset: number;
    size: 1 | 3 | 4;
    get: () => any;
}

/** How the generated code reads per-system values. */
export interface GPUParameterSource {
    /** float storage of all systems' parameter rows */
    params: N;
    /** first float of the current system's row (uint node) */
    base: N;
}

function describe(value: unknown): unknown {
    if (value !== null && typeof value === 'object') return `<${(value as any).constructor?.name ?? 'object'}>`;
    return value;
}

/**
 * State shared by the TSL code generated for the per-particle update of a particle system.
 *
 * Values that can change while an effect runs (curve keys, force magnitudes, ...) become *parameters*: every system has
 * a row of floats in a parameter buffer, refreshed from the CPU objects every step ({@link writeParameters}), and the
 * generated code reads the row of the particle's system. So editing an effect never recompiles a shader, and systems
 * whose code has the same shape share one kernel (see {@link signature}).
 *
 * Values that change the shape of the code (generator classes, number of curve segments, behavior list) are recorded
 * with {@link watch} / {@link token}; {@link isStale} reports when a system's code has to be rebuilt.
 *
 * A context either records (no parameter source: parameters read as zero, only the layout / getters / signature
 * matter) or emits kernel code (parameters read from the buffer).
 */
export class GPUCompileContext {
    /** step duration of the particle's system, seconds (set by the kernel) */
    delta: N = float(0);
    /** step counter, used by per-frame random values */
    readonly frame: N;
    /** per-particle random seed (uint), set by the kernel before the program is compiled */
    seed: N = uint(0);
    /** state fields written by the compiled code */
    readonly written = new Set<string>();

    private readonly slots_: ParameterSlot[] = [];
    private parameterSize_ = 0;
    private readonly watches_: Array<{get: () => unknown; value: unknown; structural: boolean}> = [];
    private readonly tokens_: string[] = [];
    private randomStreams_ = 0;

    /**
     * @param worldSpace whether the system simulates in world space
     * @param source where parameters are read from; omit to record
     * @param frame shared step counter uniform
     */
    constructor(
        readonly worldSpace: boolean,
        readonly source: GPUParameterSource | null = null,
        frame: N = uniform(0)
    ) {
        this.frame = frame;
    }

    /** number of floats of a parameter row */
    get parameterSize(): number {
        return this.parameterSize_;
    }

    private parameter(size: 1 | 3 | 4, get: () => any): N {
        const offset = this.parameterSize_;
        this.slots_.push({offset, size, get});
        this.parameterSize_ += size;
        if (!this.source) return size === 1 ? float(0) : size === 3 ? vec3(0) : vec4(0);
        const {params, base} = this.source;
        const at = (k: number) => params.element(base.add(offset + k));
        if (size === 1) return at(0);
        if (size === 3) return vec3(at(0), at(1), at(2));
        return vec4(at(0), at(1), at(2), at(3));
    }

    /** A float parameter, refreshed from `get()` every step. */
    float(get: () => number): N {
        return this.parameter(1, get);
    }

    /** A vec3 parameter, refreshed from `get()` every step. */
    vec3(get: () => XYZ): N {
        return this.parameter(3, get);
    }

    /** A vec4 parameter, refreshed from `get()` every step. */
    vec4(get: () => XYZW): N {
        return this.parameter(4, get);
    }

    /**
     * Records a value the generated code depends on; the system's code is rebuilt when it changes.
     * @param structural `true` (default) when the value shapes the code: it becomes part of the {@link signature}
     *   (objects by class). `false` for values that only signal an edit (object identity, revision counters).
     */
    watch(get: () => unknown, structural = true) {
        this.watches_.push({get, value: get(), structural});
    }

    /** Records a choice made while generating code (e.g. a generator class) in the {@link signature}. */
    token(value: string) {
        this.tokens_.push(value);
    }

    /**
     * A random value in [0, 1) that is fixed for the particle's whole life (like the memory slot a CPU generator
     * fills in `startGen()`). Each call returns an independent stream.
     */
    random(): N {
        const stream = uint(streamConstant(this.randomStreams_++));
        return hash(this.seed.bitXor(stream));
    }

    /** A random value in [0, 1) that changes every step (generators that call `Math.random()` per evaluation). */
    randomPerStep(): N {
        const stream = uint(streamConstant(this.randomStreams_++));
        const frame = this.frame.toUint().mul(uint(0x632be5ab));
        return hash(this.seed.bitXor(stream).add(frame));
    }

    /** Writes the current parameter values into `target` starting at `base`. */
    writeParameters(target: Float32Array, base: number) {
        for (let i = 0; i < this.slots_.length; i++) {
            const slot = this.slots_[i];
            const value = slot.get();
            const o = base + slot.offset;
            if (slot.size === 1) {
                target[o] = Number(value) || 0;
            } else if (value) {
                target[o] = value.x;
                target[o + 1] = value.y;
                target[o + 2] = value.z;
                if (slot.size === 4) target[o + 3] = value.w;
            }
        }
    }

    /** Whether a watched value changed since the code was generated. */
    isStale(): boolean {
        for (let i = 0; i < this.watches_.length; i++) {
            const watch = this.watches_[i];
            if (watch.get() !== watch.value) return true;
        }
        return false;
    }

    /**
     * Shape of the generated code: systems with the same signature run the same kernel (with their own parameter
     * rows).
     */
    signature(): string {
        return JSON.stringify([
            this.worldSpace,
            this.tokens_,
            this.watches_.filter((w) => w.structural).map((w) => describe(w.value)),
            this.slots_.map((s) => s.size),
            this.randomStreams_,
            [...this.written].sort(),
        ]);
    }
}
