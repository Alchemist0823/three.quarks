/* eslint-disable @typescript-eslint/no-explicit-any */
import {BaseBatchedRenderer, RenderMode, VFXBatch, VFXBatchSettings} from 'three.quarks';
import type {IParticleSystem} from 'three.quarks';
import type {Texture} from 'three';
import {CompositingState, WebGPUSpriteBatch, WebGPUTrailBatch} from './WebGPUBatches';
import {createPerformanceProfile, QuarksPerformanceProfile, QuarksPerformanceProfileOptions} from './PerformanceProfile';
import {GPUParticleBatch} from './gpu/GPUParticleBatch';
import {
    estimateParticleCount,
    getGPUSimulationSupport,
    GPUParticleSimulation,
    GPUSimulatedSystem,
    GPUSimulationHost,
} from './gpu/GPUParticleSimulation';

/**
 * Where particles are simulated.
 * - `'off'` (default): on the CPU, like the WebGL renderer.
 * - `'auto'`: large systems (at least `gpuSimulationThreshold` live particles estimated from emission rate, lifetime
 *   and bursts) whose behaviors all have a GPU version are simulated by compute shaders (see
 *   {@link GPUParticleSimulation}); small systems stay on the CPU, where many of them share one draw call.
 * - `'all'`: every system whose behaviors all have a GPU version.
 *
 * GPU simulation needs the `renderer` and its WebGPU backend; anything else falls back to the CPU.
 */
export type GPUSimulationMode = 'off' | 'auto' | 'all';

/**
 * Options of {@link WebGPUBatchedRenderer}.
 */
export interface WebGPUBatchedRendererOptions extends QuarksPerformanceProfileOptions {
    /** the `WebGPURenderer` (required for GPU simulation, which dispatches compute work) */
    renderer?: any;
    /** where particles are simulated, default `'off'` */
    gpuSimulation?: GPUSimulationMode;
    /**
     * `'auto'` mode: minimum estimated number of live particles for a system to be simulated on the GPU,
     * default 512. Each GPU simulated system has its own draw call and compute dispatch, which only pays off for
     * systems with many particles.
     */
    gpuSimulationThreshold?: number;
}

/**
 * Batch renderer for three.js `WebGPURenderer` (`three/webgpu`).
 *
 * Drop-in replacement of the WebGL `BatchedRenderer`: same API, same particle systems, same JSON
 * effects. All batches are rendered with TSL node materials, so the same code runs on the WebGPU
 * backend and on the WebGL2 fallback backend of `WebGPURenderer`.
 *
 * ```js
 * import {WebGPURenderer} from 'three/webgpu';
 * import {BatchedRenderer, ParticleSystem} from 'three.quarks/webgpu';
 *
 * const batchRenderer = new BatchedRenderer({target: 'auto'}); // 'desktop' | 'mobile' | 'auto'
 * // optional: simulate supported systems with compute shaders
 * // const batchRenderer = new BatchedRenderer({renderer, gpuSimulation: 'auto'});
 * scene.add(batchRenderer);
 * ```
 */
export class WebGPUBatchedRenderer extends BaseBatchedRenderer implements GPUSimulationHost {
    readonly isWebGPUBatchedRenderer = true;

    /** resolved performance profile used by all batches */
    profile: QuarksPerformanceProfile;

    /** display-space compositing state, set by {@link QuarksCompositor} */
    compositing: CompositingState | null = null;

    /** where particles are simulated (see {@link GPUSimulationMode}) */
    gpuSimulation: GPUSimulationMode;

    /** `'auto'` mode: minimum estimated number of live particles of a GPU simulated system */
    gpuSimulationThreshold: number;

    /** the `WebGPURenderer` used to dispatch the GPU simulation */
    renderer: any;

    private queued_: GPUParticleSimulation[] = [];
    private gpuUnavailable_ = false;

    constructor(options: WebGPUBatchedRendererOptions = {}) {
        super();
        this.profile = createPerformanceProfile(options);
        this.renderer = options.renderer ?? null;
        this.gpuSimulation = options.gpuSimulation ?? 'off';
        this.gpuSimulationThreshold = options.gpuSimulationThreshold ?? 512;
    }

    protected createBatch(settings: VFXBatchSettings): VFXBatch {
        switch (settings.renderMode) {
            case RenderMode.Trail:
                return new WebGPUTrailBatch(settings, this.profile, this);
            case RenderMode.Mesh:
            case RenderMode.BillBoard:
            case RenderMode.VerticalBillBoard:
            case RenderMode.HorizontalBillBoard:
            case RenderMode.StretchedBillBoard:
                return new WebGPUSpriteBatch(settings, this.profile, this);
        }
        throw new Error('render mode unavailable');
    }

    // ---- GPU simulation -----------------------------------------------------------------------------------

    /** Sets the renderer used to dispatch the GPU simulation. */
    setRenderer(renderer: any) {
        this.renderer = renderer;
        this.gpuUnavailable_ = false;
    }

    /**
     * Switches between CPU and GPU simulation at runtime. Systems that change sides restart with no particles.
     */
    setGPUSimulation(mode: GPUSimulationMode) {
        if (mode === this.gpuSimulation) return;
        this.gpuSimulation = mode;
        this.readdSystems();
    }

    /** Whether `system` is currently simulated on the GPU. */
    isGPUSimulated(system: IParticleSystem): boolean {
        const index = this.systemToBatchIndex.get(system);
        return index !== undefined && (this.batches[index] as any).isGPUParticleBatch === true;
    }

    /**
     * Why `system` would not be simulated on the GPU, or `null` if it would be.
     */
    getGPUSimulationSupport(system: IParticleSystem): string | null {
        if (this.gpuSimulation === 'off') return "gpuSimulation is 'off'";
        if (!this.renderer) return 'no renderer: pass `renderer` to the WebGPUBatchedRenderer';
        if (this.gpuUnavailable_ || !this.hasWebGPUBackend()) {
            return 'GPU simulation needs the WebGPU backend';
        }
        const particleSystem = system as unknown as GPUSimulatedSystem;
        const support = getGPUSimulationSupport(particleSystem);
        if (support !== null || this.gpuSimulation === 'all') return support;
        const estimate = estimateParticleCount(particleSystem);
        if (estimate === null || estimate < this.gpuSimulationThreshold) {
            return `fewer than gpuSimulationThreshold (${this.gpuSimulationThreshold}) particles`;
        }
        return null;
    }

    /** Before `init()` this is the requested backend; init() may still fall back to WebGL 2 (checked in update()). */
    private hasWebGPUBackend(): boolean {
        const backend = this.renderer ? this.renderer.backend : null;
        return !!backend && backend.isWebGPUBackend === true;
    }

    addSystem(system: IParticleSystem) {
        if (this.getGPUSimulationSupport(system) !== null) {
            super.addSystem(system);
            return;
        }
        (system as any)._renderer = this;
        const settings = (system as unknown as GPUSimulatedSystem).getRendererSettings();
        const batch = new GPUParticleBatch(settings, this, this.profile, this);
        if (this.depthTexture) batch.applyDepthTexture(this.depthTexture);
        batch.addSystem(system);
        this.batches.push(batch);
        this.systemToBatchIndex.set(system, this.batches.length - 1);
        this.add(batch);
    }

    deleteSystem(system: IParticleSystem) {
        const index = this.systemToBatchIndex.get(system);
        if (index === undefined) return;
        const batch = this.batches[index];
        if (!(batch as any).isGPUParticleBatch) {
            super.deleteSystem(system);
            return;
        }
        // a GPU batch belongs to one system: remove it and shift the indices of the batches after it
        this.systemToBatchIndex.delete(system);
        this.batches.splice(index, 1);
        this.systemToBatchIndex.forEach((value, key) => {
            if (value > index) this.systemToBatchIndex.set(key, value - 1);
        });
        this.queued_ = this.queued_.filter((simulation) => simulation !== (batch as GPUParticleBatch).simulation);
        this.remove(batch);
        batch.dispose();
    }

    /**
     * Moves a system to a batch matching its changed renderer settings. GPU simulated systems keep their particles
     * when the new settings still fit their simulation.
     */
    updateSystem(system: IParticleSystem) {
        const index = this.systemToBatchIndex.get(system);
        const batch = index !== undefined ? (this.batches[index] as GPUParticleBatch) : null;
        const simulation = batch && batch.isGPUParticleBatch ? batch.simulation : null;
        const particleSystem = system as unknown as GPUSimulatedSystem;
        if (
            simulation &&
            simulation.invalidReason === null &&
            this.getGPUSimulationSupport(system) === null &&
            simulation.isCompatible(particleSystem)
        ) {
            batch!.detachSimulation();
            const replacement = new GPUParticleBatch(particleSystem.getRendererSettings(), this, this.profile, this);
            if (this.depthTexture) replacement.applyDepthTexture(this.depthTexture);
            replacement.addSystem(system, simulation);
            this.batches[index!] = replacement;
            this.remove(batch!);
            batch!.dispose();
            this.add(replacement);
            return;
        }
        super.updateSystem(system);
    }

    /** @internal {@link GPUSimulationHost} */
    enqueue(simulation: GPUParticleSimulation) {
        this.queued_.push(simulation);
    }

    /**
     * Dispatches the queued GPU simulation work (all systems in one compute pass). Called by {@link update};
     * call it yourself only if you step particle systems without `update()`.
     */
    flush() {
        if (this.queued_.length === 0) return;
        const queued = this.queued_;
        this.queued_ = [];
        const nodes: any[] = [];
        for (const simulation of queued) nodes.push(...simulation.takePending());
        const renderer = this.renderer;
        // compute work before the backend is ready is dropped: those particles are not drawn
        if (nodes.length === 0 || !renderer || (renderer.hasInitialized && !renderer.hasInitialized())) return;
        renderer.compute(nodes);
    }

    /**
     * Updates all particle systems, dispatches the GPU simulation and refreshes the batches.
     * @param delta - The time delta for the update.
     */
    update(delta: number) {
        this.systemToBatchIndex.forEach((_, system) => {
            (system as any).update(delta);
        });
        this.flush();

        // systems whose GPU simulation became invalid (an edit, or the backend fell back to WebGL 2)
        if (this.gpuSimulation !== 'off' && this.renderer && !this.gpuUnavailable_ && !this.hasWebGPUBackend()) {
            if (this.renderer.hasInitialized && this.renderer.hasInitialized()) {
                this.gpuUnavailable_ = true;
            }
        }
        let invalid: IParticleSystem[] | null = null;
        for (const batch of this.batches) {
            const simulation = (batch as GPUParticleBatch).simulation;
            if (simulation && (simulation.invalidReason !== null || this.gpuUnavailable_)) {
                (invalid ??= []).push(simulation.system as unknown as IParticleSystem);
            }
        }
        if (invalid) for (const system of invalid) this.updateSystem(system);

        for (let i = 0; i < this.batches.length; i++) {
            this.batches[i].update();
        }
    }

    // ---- profile / compositing ----------------------------------------------------------------------------

    /**
     * Switches the performance profile (e.g. from `'desktop'` to `'mobile'`) at runtime.
     * All batches are rebuilt; particle simulation state is preserved.
     */
    setProfile(options: WebGPUBatchedRendererOptions) {
        this.profile = createPerformanceProfile(options);
        if (options.gpuSimulation !== undefined) this.gpuSimulation = options.gpuSimulation;
        if (options.gpuSimulationThreshold !== undefined) this.gpuSimulationThreshold = options.gpuSimulationThreshold;
        if (options.renderer !== undefined) this.renderer = options.renderer;
        this.rebuildBatches();
    }

    /**
     * Enables (depth texture of the scene pass) or disables (`null`) display-space compositing of transparent
     * batches. Called by {@link QuarksCompositor}.
     */
    setCompositing(depthTexture: Texture | null) {
        const current = this.compositing ? this.compositing.depthTexture : null;
        if (current === depthTexture) return;
        this.compositing = depthTexture ? {depthTexture} : null;
        this.rebuildBatches();
    }

    /**
     * Recreates all batches. CPU particles are preserved; GPU simulated systems keep their simulation and only
     * rebuild their material.
     */
    rebuildBatches() {
        const kept: VFXBatch[] = [];
        const cpuSystems: IParticleSystem[] = [];
        this.systemToBatchIndex.forEach((index, system) => {
            const batch = this.batches[index];
            if ((batch as any).isGPUParticleBatch) {
                (batch as GPUParticleBatch).profile = this.profile;
                batch.rebuildMaterial();
                kept.push(batch);
            } else {
                cpuSystems.push(system);
            }
        });
        for (const batch of this.batches) {
            if (kept.includes(batch)) continue;
            this.remove(batch);
            batch.dispose();
        }
        this.batches = [];
        this.systemToBatchIndex.clear();
        for (const batch of kept) {
            this.batches.push(batch);
            this.systemToBatchIndex.set(Array.from(batch.systems)[0], this.batches.length - 1);
        }
        for (const system of cpuSystems) {
            super.addSystem(system);
        }
        // refill the new batches from the preserved particle state so the next frame is not empty
        for (const batch of this.batches) batch.update();
    }

    /** Re-adds every system, so each one picks CPU or GPU simulation again. */
    private readdSystems() {
        for (const system of Array.from(this.systemToBatchIndex.keys())) this.updateSystem(system);
    }

    /**
     * Releases GPU resources of all batches.
     */
    dispose() {
        for (const batch of this.batches) {
            this.remove(batch);
            batch.dispose();
        }
        this.batches = [];
        this.queued_ = [];
        this.systemToBatchIndex.clear();
    }
}
