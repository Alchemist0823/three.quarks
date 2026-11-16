/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Camera,
    DepthTexture,
    HalfFloatType,
    NoToneMapping,
    Object3D,
    SRGBColorSpace,
    UnsignedByteType,
    Vector2,
} from 'three';
import {NodeMaterial, QuadMesh, RenderTarget} from 'three/webgpu';
import {renderOutput, sRGBTransferEOTF, texture, uv, vec4} from 'three/tsl';
import type {WebGPUBatchedRenderer} from './WebGPUBatchedRenderer';

type N = any;

export interface QuarksCompositorOptions {
    /** MSAA samples of the scene pass (default 0) */
    samples?: number;
}

/**
 * Optional compositor that makes transparent particles blend exactly like they do in `WebGLRenderer`.
 *
 * `WebGPURenderer` blends everything in a linear half-float framebuffer and encodes to sRGB at the end. The WebGL
 * particle shaders write display (sRGB) values and blend them in the sRGB framebuffer, so overlapping
 * semi-transparent particles look different between the two renderers. The compositor renders the frame in
 * these passes:
 *
 * 1. the scene, with opaque particle batches, into a linear target with a depth texture;
 * 2. tone mapping + sRGB encoding of that target into an 8-bit display-space target;
 * 3. the transparent particle batches into the display-space target, blending raw display values. Their depth
 *    test (and soft particles) read the depth texture of pass 1;
 * 4. the display-space target to the canvas.
 *
 * It costs two extra full-screen passes, so use it only when exact WebGL-equivalent blending matters.
 * Limitations: transparent *lit* mesh particles receive no scene lights in pass 3, and particles are drawn
 * after all other transparent scene objects.
 *
 * ```js
 * const compositor = new QuarksCompositor(renderer, batchRenderer);
 * renderer.setAnimationLoop(() => {
 *     batchRenderer.update(delta);
 *     compositor.render(scene, camera); // instead of renderer.render(scene, camera)
 * });
 * ```
 */
export class QuarksCompositor {
    readonly renderer: N;
    readonly batchRenderer: WebGPUBatchedRenderer;
    readonly sceneTarget: N;
    readonly displayTarget: N;
    private readonly encodeQuad: N;
    private readonly blitQuad: N;
    private readonly size = new Vector2();
    private visibility: boolean[] = [];
    private toneMapping: number;

    constructor(renderer: N, batchRenderer: WebGPUBatchedRenderer, options: QuarksCompositorOptions = {}) {
        this.renderer = renderer;
        this.batchRenderer = batchRenderer;

        this.sceneTarget = new (RenderTarget as N)(1, 1, {type: HalfFloatType, samples: options.samples ?? 0});
        this.sceneTarget.depthTexture = new DepthTexture(1, 1);
        this.displayTarget = new (RenderTarget as N)(1, 1, {type: UnsignedByteType, depthBuffer: false});

        // pass 2: scene (linear, HDR) -> display space, applying the renderer's tone mapping
        this.toneMapping = renderer.toneMapping;
        this.encodeQuad = new (QuadMesh as N)(this.createEncodeMaterial());

        // pass 4: display space -> canvas. Decoded here and re-encoded by the renderer's output pass.
        const blit = new (NodeMaterial as N)();
        const texel = texture(this.displayTarget.texture, uv());
        blit.fragmentNode = (vec4 as N)(sRGBTransferEOTF(texel.rgb), 1.0);
        this.blitQuad = new (QuadMesh as N)(blit);

        batchRenderer.setCompositing(this.sceneTarget.depthTexture);
    }

    private createEncodeMaterial(): N {
        const encode = new (NodeMaterial as N)();
        encode.fragmentNode = (renderOutput as N)(
            texture(this.sceneTarget.texture, uv()),
            this.toneMapping,
            SRGBColorSpace
        );
        return encode;
    }

    private resize() {
        this.renderer.getDrawingBufferSize(this.size);
        const {x, y} = this.size;
        if (this.sceneTarget.width !== x || this.sceneTarget.height !== y) {
            this.sceneTarget.setSize(x, y);
            this.displayTarget.setSize(x, y);
        }
    }

    /** Renders `scene` from `camera` to the canvas with display-space particle blending. */
    render(scene: Object3D, camera: Camera) {
        const renderer = this.renderer;
        this.resize();

        const previousTarget = renderer.getRenderTarget();
        const previousAutoClear = renderer.autoClear;
        const previousToneMapping = renderer.toneMapping;
        if (previousToneMapping !== this.toneMapping) {
            this.toneMapping = previousToneMapping;
            this.encodeQuad.material.dispose();
            this.encodeQuad.material = this.createEncodeMaterial();
        }

        // 1. scene + opaque particle batches
        const batches = this.batchRenderer.batches;
        this.visibility.length = batches.length;
        for (let i = 0; i < batches.length; i++) {
            this.visibility[i] = batches[i].visible;
            if ((batches[i].material as N).transparent) batches[i].visible = false;
        }
        renderer.setRenderTarget(this.sceneTarget);
        renderer.render(scene, camera);

        // 2. tone map + encode into the display-space target
        renderer.setRenderTarget(this.displayTarget);
        this.encodeQuad.render(renderer);

        // 3. transparent particle batches, blended in display space
        for (let i = 0; i < batches.length; i++) {
            batches[i].visible = this.visibility[i] && (batches[i].material as N).transparent === true;
        }
        renderer.autoClear = false;
        renderer.render(this.batchRenderer, camera);
        renderer.autoClear = previousAutoClear;
        for (let i = 0; i < batches.length; i++) batches[i].visible = this.visibility[i];

        // 4. to the canvas (tone mapping already applied in pass 2)
        renderer.toneMapping = NoToneMapping;
        renderer.setRenderTarget(previousTarget);
        this.blitQuad.render(renderer);
        renderer.toneMapping = previousToneMapping;
    }

    /** Stops compositing (batches go back to normal rendering) and frees the render targets. */
    dispose() {
        this.batchRenderer.setCompositing(null);
        this.sceneTarget.dispose();
        this.displayTarget.dispose();
        this.encodeQuad.material.dispose();
        this.blitQuad.material.dispose();
    }
}
