import {
    AxisAngleGenerator,
    ConstantValue,
    FunctionValueGenerator,
    RendererEmitterSettings,
    RotationGenerator,
    ValueGenerator,
    Vector3,
} from 'quarks.core';
import {BufferGeometry, PlaneGeometry} from 'three';

import {RenderMode} from '../VFXBatch';

export interface RenderModeDefaults {
    rendererEmitterSettings?: RendererEmitterSettings;
    instancingGeometry?: BufferGeometry;
    startRotation?: ValueGenerator | FunctionValueGenerator | RotationGenerator;
}

/**
 * Renderer defaults and render-mode-specific settings construction.
 */
export class RendererDefaults {
    private static readonly DEFAULT_GEOMETRY = new PlaneGeometry(1, 1, 1, 1);

    static getDefaultGeometry(): BufferGeometry {
        return RendererDefaults.DEFAULT_GEOMETRY;
    }

    static createRenderModeTransitionDefaults(
        previousRenderMode: RenderMode,
        renderMode: RenderMode
    ): RenderModeDefaults {
        const defaults = RendererDefaults.createRenderModeDefaults(renderMode);

        if (previousRenderMode === RenderMode.Mesh && renderMode !== RenderMode.Mesh) {
            defaults.startRotation = new ConstantValue(0);
        }

        return defaults;
    }

    private static createRenderModeDefaults(renderMode: RenderMode): RenderModeDefaults {
        switch (renderMode) {
            case RenderMode.Trail:
                return {
                    rendererEmitterSettings: {
                        startLength: new ConstantValue(30),
                        followLocalOrigin: false,
                    },
                };
            case RenderMode.Mesh:
                return {
                    rendererEmitterSettings: {geometry: RendererDefaults.DEFAULT_GEOMETRY},
                    startRotation: new AxisAngleGenerator(new Vector3(0, 1, 0), new ConstantValue(0)),
                };
            case RenderMode.StretchedBillBoard:
                return {
                    rendererEmitterSettings: {speedFactor: 0, lengthFactor: 2},
                    instancingGeometry: RendererDefaults.DEFAULT_GEOMETRY,
                };
            case RenderMode.BillBoard:
            case RenderMode.VerticalBillBoard:
            case RenderMode.HorizontalBillBoard:
                return {
                    rendererEmitterSettings: {},
                    instancingGeometry: RendererDefaults.DEFAULT_GEOMETRY,
                };
            default:
                return {};
        }
    }
}
