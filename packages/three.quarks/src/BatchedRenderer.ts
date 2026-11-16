import {VFXBatch, RenderMode} from './VFXBatch';
import {SpriteBatch} from './SpriteBatch';
import {TrailBatch} from './TrailBatch';
import {BaseBatchedRenderer, VFXBatchSettings} from './BaseBatchedRenderer';

export type {VFXBatchSettings} from './BaseBatchedRenderer';

/**
 * the class represents the batch renderer. a three.js scene should only have one batchedRenderer
 * It keeps references of all particle systems and rendering batch.
 * It batches all particle systems that has the same rendering pipeline to a single VFXBatch.
 *
 * This implementation targets `WebGLRenderer` (GLSL `ShaderMaterial`s).
 * For `WebGPURenderer` import `BatchedRenderer` from `three.quarks/webgpu` instead.
 */
export class BatchedRenderer extends BaseBatchedRenderer {
    constructor() {
        super();
    }

    protected createBatch(settings: VFXBatchSettings): VFXBatch {
        switch (settings.renderMode) {
            case RenderMode.Trail:
                return new TrailBatch(settings);
            case RenderMode.Mesh:
            case RenderMode.BillBoard:
            case RenderMode.VerticalBillBoard:
            case RenderMode.HorizontalBillBoard:
            case RenderMode.StretchedBillBoard:
                return new SpriteBatch(settings);
        }
        throw new Error('render mode unavailable');
    }
}
