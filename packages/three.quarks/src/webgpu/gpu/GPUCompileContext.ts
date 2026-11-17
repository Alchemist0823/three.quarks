/* eslint-disable @typescript-eslint/no-explicit-any */
import {Vector3, Vector4} from 'three';
import * as TSL from 'three/tsl';

// untyped TSL: the generated graphs mix node types the typings cannot follow
const {hash, uint, uniform} = TSL as any;

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

/**
 * State shared by the TSL code generated for one GPU simulated system.
 *
 * Values that can change while an effect runs (curve keys, force magnitudes, ...) become uniforms that are refreshed
 * from the CPU objects every step ({@link sync}), so editing an effect never recompiles a shader. Values that change
 * the shape of the generated code (generator classes, number of curve segments, behavior list) are recorded with
 * {@link watch}; {@link isStale} reports when the kernel has to be rebuilt.
 */
export class GPUCompileContext {
    /** step duration, seconds */
    readonly delta: N = uniform(0);
    /** step counter, used by per-frame random values */
    readonly frame: N = uniform(0);
    /** per-particle random seed (uint), set by the kernel before behaviors are compiled */
    seed: N = null;
    /** state fields written by the compiled behaviors */
    readonly written = new Set<string>();

    private readonly syncs_: Array<() => void> = [];
    private readonly watches_: Array<{get: () => unknown; value: unknown}> = [];
    private randomStreams_ = 0;

    constructor(readonly worldSpace: boolean) {}

    /** A float uniform refreshed from `get()` every step. */
    float(get: () => number): N {
        const node = uniform(get());
        this.syncs_.push(() => {
            node.value = get();
        });
        return node;
    }

    /** A vec3 uniform refreshed from `get()` every step. */
    vec3(get: () => XYZ): N {
        const value = new Vector3();
        const read = () => {
            const v = get();
            if (v) value.set(v.x, v.y, v.z);
        };
        read();
        this.syncs_.push(read);
        return uniform(value);
    }

    /** A vec4 uniform refreshed from `get()` every step. */
    vec4(get: () => XYZW): N {
        const value = new Vector4();
        const read = () => {
            const v = get();
            if (v) value.set(v.x, v.y, v.z, v.w);
        };
        read();
        this.syncs_.push(read);
        return uniform(value);
    }

    /** Records a structural value; the kernel is rebuilt when it changes. */
    watch(get: () => unknown) {
        this.watches_.push({get, value: get()});
    }

    /**
     * A random value in [0, 1) that is fixed for the particle's whole life (like the memory slot a CPU generator
     * fills in `startGen()`). Each call returns an independent stream.
     */
    random(): N {
        const stream = uint(streamConstant(this.randomStreams_++));
        return (hash as N)(this.seed.bitXor(stream));
    }

    /** A random value in [0, 1) that changes every step (generators that call `Math.random()` per evaluation). */
    randomPerStep(): N {
        const stream = uint(streamConstant(this.randomStreams_++));
        const frame = this.frame.toUint().mul(uint(0x632be5ab));
        return (hash as N)(this.seed.bitXor(stream).add(frame));
    }

    /** Refreshes every uniform from the CPU objects. */
    sync() {
        for (let i = 0; i < this.syncs_.length; i++) this.syncs_[i]();
    }

    /** Whether a watched structural value changed since the kernel was built. */
    isStale(): boolean {
        for (let i = 0; i < this.watches_.length; i++) {
            const watch = this.watches_[i];
            if (watch.get() !== watch.value) return true;
        }
        return false;
    }
}
