/* eslint-disable @typescript-eslint/no-explicit-any */
import {AdditiveBlending, BufferGeometry, DynamicDrawUsage, Material, Object3D, Sphere, Texture} from 'three';
import {StorageBufferAttribute} from 'three/webgpu';
import {storage} from 'three/tsl';
import {
    BaseSpriteBatch,
    RenderMode,
    VFXBatch,
    VFXBatchSettings,
    StoredBatchSettings,
    TRAIL_POINT_LAYOUT,
    TrailParticle,
    getSpriteInstanceLayout,
} from 'three.quarks';
import {
    ParticleMeshPhysicalNodeMaterial,
    ParticleMeshStandardNodeMaterial,
    ParticleNodeMaterialOptions,
    ParticleSpriteNodeMaterial,
    ParticleTrailNodeMaterial,
} from './ParticleNodeMaterials';
import {createPerformanceProfile, QuarksPerformanceProfile} from './PerformanceProfile';

/**
 * Display-space compositing state set by {@link QuarksCompositor} on the batch renderer.
 */
export interface CompositingState {
    /** depth texture of the scene pass */
    depthTexture: Texture;
}

function buildMaterialOptions(
    settings: StoredBatchSettings,
    profile: QuarksPerformanceProfile,
    depthTexture: Texture | null,
    compositing: CompositingState | null
): ParticleNodeMaterialOptions {
    const material = settings.material as any;
    const composited = compositing !== null && material.transparent;
    const depth = composited ? compositing!.depthTexture : depthTexture;
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
            settings.softParticles &&
            (composited || profile.softParticles) &&
            (depth !== null || material.transparent),
        softNearFade: settings.softNearFade,
        softFarFade: settings.softFarFade,
        depthTexture: settings.softParticles || composited ? depth : null,
        colorSpaceMode: composited ? 'display' : profile.colorSpaceMode,
        fastColorDecode: profile.fastColorDecode,
        manualDepthTest: composited,
    };
}

function applyBlendState(target: Material, source: Material, composited: boolean) {
    target.transparent = source.transparent;
    target.depthWrite = !source.transparent;
    target.blending = source.blending;
    target.blendDst = source.blendDst;
    target.blendSrc = source.blendSrc;
    target.blendEquation = source.blendEquation;
    target.premultipliedAlpha = source.premultipliedAlpha;
    target.side = source.side;
    // the compositor's particle target has no depth buffer; depth is tested in the shader instead
    if (composited) target.depthTest = false;
}

/** `true` for a CubeTexture whose images have not been loaded yet. */
function isPendingCubeTexture(texture: any): boolean {
    return !!texture && texture.isCubeTexture === true && texture.isRenderTargetTexture !== true && texture.version === 0;
}

/** Base for the WebGPU batches: access to the renderer's compositing state. */
interface CompositingSource {
    compositing: CompositingState | null;
}

/**
 * Sprite / mesh batch for `WebGPURenderer` (TSL node materials).
 * Buffers and CPU fill are shared with the WebGL implementation ({@link BaseSpriteBatch}).
 */
export class WebGPUSpriteBatch extends BaseSpriteBatch {
    readonly isWebGPUBatch = true;
    profile: QuarksPerformanceProfile;
    private depthTexture_: Texture | null = null;
    private compositingSource_: CompositingSource | null = null;
    private pendingEnvMap_: Texture | null = null;

    constructor(
        settings: VFXBatchSettings,
        profile: QuarksPerformanceProfile = createPerformanceProfile(),
        compositingSource: CompositingSource | null = null
    ) {
        super(settings);
        this.profile = profile;
        this.compositingSource_ = compositingSource;
        this.maxParticles = profile.initialSpriteCapacity;
        this.layout = getSpriteInstanceLayout(settings.renderMode, {halfFloat: profile.halfFloat});
        this.setupBuffers();
        this.rebuildMaterial();
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;
        const source = this.settings.material;
        const compositing = this.compositingSource_ ? this.compositingSource_.compositing : null;
        const options = buildMaterialOptions(this.settings, this.profile, this.depthTexture_, compositing);
        const composited = options.manualDepthTest === true;

        let material: Material;
        if (
            this.settings.renderMode === RenderMode.Mesh &&
            (source.type === 'MeshStandardMaterial' || source.type === 'MeshPhysicalMaterial')
        ) {
            const litOptions = {
                uTileCount: this.settings.uTileCount,
                vTileCount: this.settings.vTileCount,
                displaySpace: composited,
                manualDepthTest: composited,
                depthTexture: composited ? options.depthTexture : null,
            };
            material =
                source.type === 'MeshStandardMaterial'
                    ? new ParticleMeshStandardNodeMaterial(source, litOptions)
                    : new ParticleMeshPhysicalNodeMaterial(source, litOptions);
            if (composited) material.depthTest = false;
            // Workaround for three r187: binding a CubeTexture env map before its images are loaded raises a WebGPU
            // validation error. Render without it until it is loaded, then rebuild.
            const envMap = (material as any).envMap;
            this.pendingEnvMap_ = isPendingCubeTexture(envMap) ? envMap : null;
            if (this.pendingEnvMap_) (material as any).envMap = null;
        } else {
            material = new ParticleSpriteNodeMaterial(options);
            applyBlendState(material, source, composited);
            if (!composited) material.depthTest = source.depthTest;
        }

        const previous = this.material as Material;
        this.material = material;
        if (previous && previous !== material && (previous as any).isNodeMaterial) previous.dispose();
    }

    update() {
        super.update();
        if (this.pendingEnvMap_ && !isPendingCubeTexture(this.pendingEnvMap_)) {
            this.pendingEnvMap_ = null;
            this.rebuildMaterial();
        }
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
 * Trail batch for `WebGPURenderer`. Each trail point is uploaded once, as three vec4 in a storage buffer
 * ({@link TRAIL_POINT_LAYOUT}, 48 bytes), and the ribbon is expanded in the vertex shader by vertex index with no
 * vertex attributes and no index buffer. The WebGL trail batch uploads two vertices per point that repeat the
 * neighbouring points plus indices (~148 bytes per point). On the WebGL2 fallback backend three reads the buffer
 * through a texture. Approach adopted from PR #115.
 */
export class WebGPUTrailBatch extends VFXBatch {
    readonly isWebGPUBatch = true;
    declare geometry: BufferGeometry;
    profile: QuarksPerformanceProfile;
    /** trail points, three vec4 per point; `maxParticles` counts points */
    points!: StorageBufferAttribute;
    private compositingSource_: CompositingSource | null = null;
    private bounds_ = new Sphere();

    constructor(
        settings: VFXBatchSettings,
        profile: QuarksPerformanceProfile = createPerformanceProfile(),
        compositingSource: CompositingSource | null = null
    ) {
        super(settings);
        this.profile = profile;
        this.compositingSource_ = compositingSource;
        this.maxParticles = profile.initialTrailCapacity;
        this.setupBuffers();
        this.rebuildMaterial();
    }

    setupBuffers(): void {
        if (this.geometry) this.geometry.dispose();
        this.geometry = new BufferGeometry();
        // no position attribute: without a draw range three would draw an infinite vertex count
        this.geometry.setDrawRange(0, 0);
        this.geometry.boundingSphere = this.bounds_;
        this.points = new StorageBufferAttribute(new Float32Array(this.maxParticles * TRAIL_POINT_LAYOUT.stride), 4);
        this.points.setUsage(DynamicDrawUsage);
    }

    expandBuffers(target: number): void {
        while (target >= this.maxParticles) {
            this.maxParticles *= 2;
        }
        this.setupBuffers();
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;
        if (this.settings.renderMode !== RenderMode.Trail) {
            throw new Error('render mode unavailable');
        }
        const source = this.settings.material;
        const compositing = this.compositingSource_ ? this.compositingSource_.compositing : null;
        const options = buildMaterialOptions(this.settings, this.profile, null, compositing);
        // trails have no soft particles (same as the WebGL implementation)
        options.softParticles = false;
        // setPBO: the WebGL 2 backend reads storage by index through a texture. The fixed name keeps the generated
        // shader identical for every trail batch, so they share one GPU program.
        const pointsNode = (storage as any)(this.points, 'vec4', this.points.count)
            .toReadOnly()
            .setPBO(true)
            .setName('quarksTrailPoints');
        const material = new ParticleTrailNodeMaterial(options, pointsNode);
        applyBlendState(material, source, options.manualDepthTest === true);
        material.blending = source.blending || AdditiveBlending;

        const previous = this.material as Material;
        this.material = material;
        if (previous && previous !== material && (previous as any).isNodeMaterial) previous.dispose();
    }

    update() {
        const systems = this.collectVisibleSystems();
        let pointCount = 0;
        for (let s = 0; s < systems.length; s++) {
            const system = systems[s];
            for (let j = 0; j < system.particleNum; j++) {
                pointCount += (system.particles[j] as TrailParticle).previous.length;
            }
        }
        if (pointCount > this.maxParticles) {
            this.expandBuffers(pointCount);
            this.rebuildMaterial();
        }

        const L = TRAIL_POINT_LAYOUT;
        const data = this.points.array as Float32Array;
        const uTileCount = this.settings.uTileCount;
        const vTileCount = this.settings.vTileCount;
        const tileWidth = 1 / uTileCount;
        const tileHeight = 1 / vTileCount;
        let minX = Infinity,
            minY = Infinity,
            minZ = Infinity,
            maxX = -Infinity,
            maxY = -Infinity,
            maxZ = -Infinity;
        let offset = 0;
        for (let s = 0; s < systems.length; s++) {
            const system = systems[s];
            const emitter = system.emitter as unknown as Object3D;
            if (emitter.updateMatrixWorld) {
                emitter.updateWorldMatrix(true, false);
                emitter.updateMatrixWorld(true);
            }
            const m = system.emitter.matrixWorld.elements;
            // object scale as (|sx| + |sy| + |sz|) / 3 from the matrix columns, like the WebGL batch's decompose()
            const objectScale =
                (Math.hypot(m[0], m[1], m[2]) + Math.hypot(m[4], m[5], m[6]) + Math.hypot(m[8], m[9], m[10])) / 3;
            const worldSpace = system.worldSpace;

            for (let j = 0; j < system.particleNum; j++) {
                const particle = system.particles[j] as TrailParticle;
                const col = particle.uvTile % vTileCount;
                const row = Math.floor(particle.uvTile / vTileCount + 0.001);
                const v0 = (vTileCount - row - 1) * tileHeight;
                const v1 = (vTileCount - row) * tileHeight;
                const length = particle.previous.length;
                const e = worldSpace ? null : particle.parentMatrix ? particle.parentMatrix.elements : m;
                const widthScale = worldSpace || particle.parentMatrix ? 1 : objectScale;
                let i = 0;
                for (const record of particle.previous.values()) {
                    let x = record.position.x,
                        y = record.position.y,
                        z = record.position.z;
                    if (e !== null) {
                        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
                        const tx = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
                        const ty = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
                        z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
                        x = tx;
                        y = ty;
                    }
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (z < minZ) minZ = z;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                    if (z > maxZ) maxZ = z;
                    data[offset + L.position] = x;
                    data[offset + L.position + 1] = y;
                    data[offset + L.position + 2] = z;
                    data[offset + L.width] = record.size * widthScale;
                    const color = record.color;
                    data[offset + L.color] = color.x;
                    data[offset + L.color + 1] = color.y;
                    data[offset + L.color + 2] = color.z;
                    data[offset + L.color + 3] = color.w;
                    data[offset + L.u] = (i / length + col) * tileWidth;
                    data[offset + L.v0] = v0;
                    data[offset + L.v1] = v1;
                    data[offset + L.flags] = (i === 0 ? 1 : 0) + (i === length - 1 ? 2 : 0);
                    offset += L.stride;
                    i++;
                }
            }
        }
        this.points.clearUpdateRanges();
        if (offset > 0) this.points.addUpdateRange(0, offset);
        this.points.needsUpdate = true;
        // three's WebGL 2 backend copies storage into this texture once and refreshes it only when asked
        const pbo = (this.points as any).pbo as Texture | undefined;
        if (pbo) pbo.needsUpdate = true;
        this.geometry.setDrawRange(0, (offset / L.stride) * 6);

        // bounds of this frame's points, used by three to sort transparent objects
        if (offset > 0) {
            this.bounds_.center.set((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
            this.bounds_.radius = Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) / 2;
        }
    }

    applyDepthTexture(): void {
        // trails do not support soft particles (same as the WebGL implementation)
    }

    dispose() {
        this.geometry.dispose();
        (this.material as Material).dispose();
    }
}
