import {BatchedRenderer, RenderMode, VFXBatch, VFXBatchSettings} from 'three.quarks';
import {NodeSpriteBatch} from './NodeSpriteBatch';
import {NodeTrailBatch} from './NodeTrailBatch';

/**
 * A {@link BatchedRenderer} for three's WebGPURenderer. Its batches render with node materials, which
 * WebGPURenderer compiles for both its WebGPU and WebGL 2 backends.
 */
export class NodeBatchedRenderer extends BatchedRenderer {
    type = 'NodeBatchedRenderer';

    protected createBatch(settings: VFXBatchSettings): VFXBatch {
        switch (settings.renderMode) {
            case RenderMode.Trail:
                return new NodeTrailBatch(settings);
            case RenderMode.Mesh:
            case RenderMode.BillBoard:
            case RenderMode.VerticalBillBoard:
            case RenderMode.HorizontalBillBoard:
            case RenderMode.StretchedBillBoard:
                return new NodeSpriteBatch(settings);
        }
    }
}
