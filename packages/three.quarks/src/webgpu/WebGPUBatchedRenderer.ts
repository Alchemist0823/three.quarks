import {BaseBatchedRenderer, RenderMode, VFXBatch, VFXBatchSettings} from 'three.quarks';
import type {IParticleSystem} from 'three.quarks';
import type {Texture} from 'three';
import {CompositingState, WebGPUSpriteBatch, WebGPUTrailBatch} from './WebGPUBatches';
import {createPerformanceProfile, QuarksPerformanceProfile, QuarksPerformanceProfileOptions} from './PerformanceProfile';

/**
 * Options of {@link WebGPUBatchedRenderer}.
 */
export type WebGPUBatchedRendererOptions = QuarksPerformanceProfileOptions;

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
 * scene.add(batchRenderer);
 * ```
 */
export class WebGPUBatchedRenderer extends BaseBatchedRenderer {
    readonly isWebGPUBatchedRenderer = true;

    /** resolved performance profile used by all batches */
    profile: QuarksPerformanceProfile;

    /** display-space compositing state, set by {@link QuarksCompositor} */
    compositing: CompositingState | null = null;

    constructor(options: WebGPUBatchedRendererOptions = {}) {
        super();
        this.profile = createPerformanceProfile(options);
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

    /**
     * Switches the performance profile (e.g. from `'desktop'` to `'mobile'`) at runtime.
     * All batches are rebuilt; particle simulation state is preserved.
     */
    setProfile(options: WebGPUBatchedRendererOptions) {
        this.profile = createPerformanceProfile(options);
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

    /** Recreates all batches (keeps the particle systems and their simulation state). */
    rebuildBatches() {
        const systems: IParticleSystem[] = Array.from(this.systemToBatchIndex.keys());
        for (const batch of this.batches) {
            this.remove(batch);
            batch.dispose();
        }
        this.batches = [];
        this.systemToBatchIndex.clear();
        for (const system of systems) {
            this.addSystem(system);
        }
        // refill the new batches from the preserved particle state so the next frame is not empty
        for (const batch of this.batches) batch.update();
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
        this.systemToBatchIndex.clear();
    }
}
