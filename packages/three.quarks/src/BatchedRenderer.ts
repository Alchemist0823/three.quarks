import {IParticleSystem} from 'quarks.core';
import {BufferGeometry, Layers, Material, Object3D, Texture} from 'three';
import {ParticleSystem} from './ParticleSystem';
import {SpriteBatch} from './SpriteBatch';
import {TrailBatch} from './TrailBatch';
import {RenderMode, StoredBatchSettings, VFXBatch} from './VFXBatch';

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
 * Batches particle systems that share compatible render settings.
 *
 * A scene should generally use one BatchedRenderer. Registered systems are grouped
 * into VFXBatch instances by material, geometry, render mode, tiling, soft-particle
 * settings, render order, and layers.
 */
export class BatchedRenderer extends Object3D {
    readonly type = 'BatchedRenderer';

    /**
     * Batches for rendering.
     * @type {VFXBatch[]}
     */
    readonly batches: VFXBatch[] = [];

    /**
     * Map of systems to batch indices.
     * @type {Map<IParticleSystem, number>}
     */
    private readonly systemToBatchIndex: Map<IParticleSystem, number> = new Map();

    /**
     * Depth texture.
     * @type {Texture | null}
     */
    private depthTexture: Texture | null = null;

    constructor() {
        super();
    }

    /**
     * Adds a particle system to a batch.
     * @param {IParticleSystem} system - The particle system to add.
     */
    addSystem(system: IParticleSystem) {
        const particleSystem = system as unknown as ParticleSystem;
        particleSystem._renderer = this;

        const settings = particleSystem.getRendererSettings();

        for (let i = 0; i < this.batches.length; i++) {
            if (BatchedRenderer.hasMatchingBatch(this.batches[i].settings, settings)) {
                this.batches[i].addSystem(system);
                this.systemToBatchIndex.set(system, i);

                return;
            }
        }

        const vfxBatch = this.createVFXBatchFromSettings(settings);
        vfxBatch.addSystem(system);

        if (this.depthTexture) {
            vfxBatch.applyDepthTexture(this.depthTexture);
        }

        this.addVFXBatch(system, vfxBatch);
    }

    /**
     * Deletes a particle system from its batch.
     * @param {IParticleSystem} system - The particle system to delete.
     */
    deleteSystem(system: IParticleSystem) {
        const batchIndex = this.systemToBatchIndex.get(system);
        if (batchIndex === undefined) return;

        this.batches[batchIndex].removeSystem(system);
        this.systemToBatchIndex.delete(system);
    }

    /**
     * Updates a particle system when the system has changed and requires reloading.
     * @param {IParticleSystem} system - The particle system to update.
     */
    updateSystem(system: IParticleSystem) {
        this.deleteSystem(system);
        this.addSystem(system);
    }

    /**
     * Updates all batches.
     * @param {number} delta - The time delta for the update.
     */
    update(delta: number) {
        for (const system of this.systemToBatchIndex.keys()) {
            (system as any).update(delta);
        }

        for (let i = 0; i < this.batches.length; i++) {
            this.batches[i].update();
        }
    }

    /**
     * Sets the depth texture for all batches. It will be used for soft particles.
     * @param {Texture | null} depthTexture - The depth texture to set.
     */
    setDepthTexture(depthTexture: Texture | null) {
        this.depthTexture = depthTexture;

        for (const batch of this.batches) {
            batch.applyDepthTexture(depthTexture);
        }
    }

    private createVFXBatchFromSettings(settings: VFXBatchSettings): VFXBatch {
        switch (settings.renderMode) {
            case RenderMode.Trail:
                return new TrailBatch(settings);
            case RenderMode.Mesh:
            case RenderMode.BillBoard:
            case RenderMode.VerticalBillBoard:
            case RenderMode.HorizontalBillBoard:
            case RenderMode.StretchedBillBoard:
                return new SpriteBatch(settings);
            default:
                settings.renderMode satisfies never;
                throw new Error(`Unsupported render mode: ${settings.renderMode}`);
        }
    }

    private addVFXBatch(system: IParticleSystem, batch: VFXBatch) {
        this.batches.push(batch);
        this.systemToBatchIndex.set(system, this.batches.length - 1);

        this.add(batch);
    }

    private static hasMatchingBatch(a: StoredBatchSettings, b: VFXBatchSettings) {
        return (
            a.material.side === b.material.side &&
            a.material.blending === b.material.blending &&
            a.material.blendSrc === b.material.blendSrc &&
            a.material.blendDst === b.material.blendDst &&
            a.material.blendEquation === b.material.blendEquation &&
            a.material.premultipliedAlpha === b.material.premultipliedAlpha &&
            a.material.transparent === b.material.transparent &&
            a.material.depthTest === b.material.depthTest &&
            a.material.type === b.material.type &&
            a.material.alphaTest === b.material.alphaTest &&
            (a.material as any).map === (b.material as any).map &&
            a.renderMode === b.renderMode &&
            a.blendTiles === b.blendTiles &&
            a.softParticles === b.softParticles &&
            a.softFarFade === b.softFarFade &&
            a.softNearFade === b.softNearFade &&
            a.uTileCount === b.uTileCount &&
            a.vTileCount === b.vTileCount &&
            a.instancingGeometry === b.instancingGeometry &&
            a.renderOrder === b.renderOrder &&
            a.layers.mask === b.layers.mask
        );
    }
}
