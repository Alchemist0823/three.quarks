/* eslint-disable @typescript-eslint/no-explicit-any */
import {AdditiveBlending, Material, Texture} from 'three';
import {BaseSpriteBatch, BaseTrailBatch, RenderMode, VFXBatchSettings, StoredBatchSettings} from 'three.quarks';
import {
    ParticleMeshPhysicalNodeMaterial,
    ParticleMeshStandardNodeMaterial,
    ParticleNodeMaterialOptions,
    ParticleSpriteNodeMaterial,
    ParticleTrailNodeMaterial,
} from './ParticleNodeMaterials';
import {createPerformanceProfile, QuarksPerformanceProfile} from './PerformanceProfile';

function buildMaterialOptions(
    settings: StoredBatchSettings,
    profile: QuarksPerformanceProfile,
    depthTexture: Texture | null
): ParticleNodeMaterialOptions {
    const material = settings.material as any;
    return {
        renderMode: settings.renderMode,
        map: material.map ?? null,
        uTileCount: settings.uTileCount,
        vTileCount: settings.vTileCount,
        blendTiles: settings.blendTiles && profile.frameBlending,
        colorAsAlpha: !!material.defines && material.defines['USE_COLOR_AS_ALPHA'] !== undefined,
        alphaTest: material.alphaTest || 0,
        // Without a depth texture the depth is copied from the framebuffer before the draw. Only for transparent
        // particles (drawn after all opaque objects) is that the complete opaque scene, so opaque soft particles
        // are drawn hard until a depth texture is set.
        softParticles:
            settings.softParticles && profile.softParticles && (depthTexture !== null || settings.material.transparent),
        softNearFade: settings.softNearFade,
        softFarFade: settings.softFarFade,
        depthTexture,
        colorSpaceMode: profile.colorSpaceMode,
        fastColorDecode: profile.fastColorDecode,
    };
}

function applyBlendState(target: Material, source: Material) {
    target.transparent = source.transparent;
    target.depthWrite = !source.transparent;
    target.blending = source.blending;
    target.blendDst = source.blendDst;
    target.blendSrc = source.blendSrc;
    target.blendEquation = source.blendEquation;
    target.premultipliedAlpha = source.premultipliedAlpha;
    target.side = source.side;
}

/**
 * Sprite / mesh batch for `WebGPURenderer` (TSL node materials).
 * Buffers and CPU fill are shared with the WebGL implementation ({@link BaseSpriteBatch}).
 */
export class WebGPUSpriteBatch extends BaseSpriteBatch {
    readonly isWebGPUBatch = true;
    profile: QuarksPerformanceProfile;
    private depthTexture_: Texture | null = null;

    constructor(settings: VFXBatchSettings, profile: QuarksPerformanceProfile = createPerformanceProfile()) {
        super(settings);
        this.profile = profile;
        this.maxParticles = profile.initialSpriteCapacity;
        this.setupBuffers();
        this.rebuildMaterial();
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;
        const source = this.settings.material;
        const options = buildMaterialOptions(this.settings, this.profile, this.depthTexture_);

        let material: Material;
        if (this.settings.renderMode === RenderMode.Mesh && source.type === 'MeshStandardMaterial') {
            material = new ParticleMeshStandardNodeMaterial(source, options);
        } else if (this.settings.renderMode === RenderMode.Mesh && source.type === 'MeshPhysicalMaterial') {
            material = new ParticleMeshPhysicalNodeMaterial(source, options);
        } else {
            material = new ParticleSpriteNodeMaterial(options);
            applyBlendState(material, source);
            material.depthTest = source.depthTest;
        }

        const previous = this.material as Material;
        this.material = material;
        if (previous && previous !== material && (previous as any).isNodeMaterial) previous.dispose();
    }

    applyDepthTexture(depthTexture: Texture | null): void {
        if (this.depthTexture_ === depthTexture) return;
        this.depthTexture_ = depthTexture;
        if (this.settings.softParticles && this.profile.softParticles) this.rebuildMaterial();
    }

    dispose() {
        super.dispose();
        (this.material as Material).dispose();
    }
}

/**
 * Trail batch for `WebGPURenderer` (TSL node materials).
 * Buffers and CPU fill are shared with the WebGL implementation ({@link BaseTrailBatch}).
 */
export class WebGPUTrailBatch extends BaseTrailBatch {
    readonly isWebGPUBatch = true;
    profile: QuarksPerformanceProfile;

    constructor(settings: VFXBatchSettings, profile: QuarksPerformanceProfile = createPerformanceProfile()) {
        super(settings);
        this.profile = profile;
        this.maxParticles = profile.initialTrailCapacity;
        this.setupBuffers();
        this.rebuildMaterial();
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;
        if (this.settings.renderMode !== RenderMode.Trail) {
            throw new Error('render mode unavailable');
        }
        const source = this.settings.material;
        const material = new ParticleTrailNodeMaterial(buildMaterialOptions(this.settings, this.profile, null));
        applyBlendState(material, source);
        material.blending = source.blending || AdditiveBlending;

        const previous = this.material as Material;
        this.material = material;
        if (previous && previous !== material && (previous as any).isNodeMaterial) previous.dispose();
    }

    applyDepthTexture(): void {
        // trails do not support soft particles (same as the WebGL implementation)
    }

    dispose() {
        super.dispose();
        (this.material as Material).dispose();
    }
}
