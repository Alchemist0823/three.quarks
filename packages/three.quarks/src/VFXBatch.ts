import {IParticleSystem} from 'quarks.core';
import {BufferGeometry, Layers, Material, Mesh, Object3D, ShaderMaterial, Texture} from 'three';

/**
 * Settings for rendering a batch of VFX systems.
 */
export interface VFXBatchSettings {
    /**
     * Geometry for instancing.
     * @type {BufferGeometry}
     */
    instancingGeometry: BufferGeometry;
    /**
     * Material for rendering.
     * @type {Material}
     */
    material: Material;
    /**
     * Number of horizontal tiles in the texture.
     * @type {number}
     */
    uTileCount: number;
    /**
     * Number of vertical tiles in the texture.
     * @type {number}
     */
    vTileCount: number;
    /**
     * Whether to blend tiles.
     * @type {boolean}
     */
    blendTiles: boolean;
    /**
     * Enable soft particles.
     * @type {boolean}
     */
    softParticles: boolean;
    /**
     * Near fade distance for soft particles.
     * @type {number}
     */
    softNearFade: number;
    /**
     * Far fade distance for soft particles.
     * @type {number}
     */
    softFarFade: number;
    /**
     * Render mode.
     * @type {RenderMode}
     */
    renderMode: RenderMode;
    /**
     * Render order.
     * @type {number}
     */
    renderOrder: number;
    /**
     * Layers control the visibility of the object.
     * @type {Layers}
     * @see {@link https://threejs.org/docs/index.html#api/en/core/Layers | Official Documentation}
     * @see {@link https://github.com/mrdoob/three.js/blob/master/src/core/Layers.js | Source}
     */
    layers: Layers;
}

/**
 * Batch settings snapshot stored after material and layer settings are cloned.
 */
export type StoredBatchSettings = VFXBatchSettings;

/**
 * Enum representing the render modes for particles.
 */
export enum RenderMode {
    /**
     * Renders particles as billboards facing the camera.
     */
    BillBoard = 0,
    /**
     * Renders particles as billboards that stretches towards the direction the particle is moving to.
     */
    StretchedBillBoard = 1,
    /**
     * Renders particles as meshes.
     */
    Mesh = 2,
    /**
     * Renders particles as trails.
     */
    Trail = 3,
    /**
     * Renders particles as horizontal billboards.
     */
    HorizontalBillBoard = 4,
    /**
     * Renders particles as vertical billboards.
     */
    VerticalBillBoard = 5,
}

/**
 * Base class for VFX batches.
 */
export abstract class VFXBatch extends Mesh {
    readonly type = 'VFXBatch';

    readonly systems: Set<IParticleSystem> = new Set();
    readonly settings: StoredBatchSettings;

    protected maxParticles = 1000;

    protected constructor(settings: VFXBatchSettings) {
        super();

        const layers = this.createLayersWithMask(settings.layers.mask);
        const material = this.cloneBatchMaterial(settings.material);
        this.settings = this.storeBatchSettings(settings, material, layers);

        this.frustumCulled = false;
        this.renderOrder = settings.renderOrder;
    }

    addSystem(system: IParticleSystem) {
        this.systems.add(system);
    }

    removeSystem(system: IParticleSystem) {
        this.systems.delete(system);
    }

    applyDepthTexture(depthTexture: Texture | null): void {
        const material = this.material as ShaderMaterial;
        const uniform = material.uniforms['depthTexture'];
        if (!uniform || uniform.value === depthTexture) return;

        uniform.value = depthTexture;
        material.needsUpdate = true;
    }

    protected collectVisibleSystems(out: IParticleSystem[]): IParticleSystem[] {
        out.length = 0;

        for (const system of this.systems) {
            if (system.emitter.visible) {
                out.push(system);
            }
        }

        return out;
    }

    protected updateEmitterWorldMatrix(system: IParticleSystem): void {
        const emitter = system.emitter as unknown as Object3D;
        if (typeof emitter.updateMatrixWorld !== 'function') return;

        emitter.updateWorldMatrix(true, false);
        emitter.updateMatrixWorld(true);
    }

    getVisibleSystems(): IParticleSystem[] {
        return this.collectVisibleSystems([]);
    }

    abstract setupBuffers(): void;
    abstract expandBuffers(target: number): void;
    abstract rebuildMaterial(): void;
    abstract update(): void;
    abstract dispose(): void;

    private createLayersWithMask(mask: number): Layers {
        const layers = new Layers();
        layers.mask = mask;

        return layers;
    }

    private cloneBatchMaterial(material: Material): Material {
        const clone = material.clone();
        clone.defines = {};
        Object.assign(clone.defines, material.defines);

        return clone;
    }

    private storeBatchSettings(settings: VFXBatchSettings, material: Material, layers: Layers): StoredBatchSettings {
        return {
            instancingGeometry: settings.instancingGeometry,
            renderMode: settings.renderMode,
            renderOrder: settings.renderOrder,
            material,
            uTileCount: settings.uTileCount,
            vTileCount: settings.vTileCount,
            blendTiles: settings.blendTiles,
            softParticles: settings.softParticles,
            softNearFade: settings.softNearFade,
            softFarFade: settings.softFarFade,
            layers,
        };
    }
}
