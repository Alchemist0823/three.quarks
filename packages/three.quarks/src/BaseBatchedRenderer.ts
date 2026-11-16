import {BufferGeometry, Layers, Material, Object3D, Texture} from 'three';
import {IParticleSystem} from 'quarks.core';
import {VFXBatch, RenderMode, StoredBatchSettings} from './VFXBatch';
import type {ParticleSystem} from './ParticleSystem';

/**
 * the settings for rendering a batch of VFX system.
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
     * layers control visibility of the object.
     * @type {Layers}
     * @see {@link https://threejs.org/docs/index.html#api/en/core/Layers | Official Documentation}
     * @see {@link https://github.com/mrdoob/three.js/blob/master/src/core/Layers.js | Source}
     */
    layers: Layers;
}

/**
 * Renderer-agnostic part of the batch renderer.
 *
 * It keeps references of all particle systems and rendering batches and batches all particle
 * systems that share the same rendering pipeline into a single {@link VFXBatch}.
 * Subclasses decide which concrete batch implementation (WebGL `ShaderMaterial` based, or
 * WebGPU / TSL `NodeMaterial` based) is created for a given set of settings.
 *
 * @see BatchedRenderer for the WebGLRenderer implementation
 * @see `three.quarks/webgpu` for the WebGPURenderer implementation
 */
export abstract class BaseBatchedRenderer extends Object3D {
    /**
     * Batches for rendering.
     * @type {Array<VFXBatch>}
     */
    batches: Array<VFXBatch> = [];
    /**
     * Map of systems to batch indices.
     * @type {Map<IParticleSystem, number>}
     */
    systemToBatchIndex: Map<IParticleSystem, number> = new Map<IParticleSystem, number>();
    type = 'BatchedRenderer';

    /**
     * Depth texture.
     * @type {Texture | null}
     */
    depthTexture: Texture | null = null;

    protected constructor() {
        super();
    }

    /**
     * Returns whether a batch created with settings `a` can also render a system with settings `b`.
     */
    protected static equals(a: StoredBatchSettings, b: VFXBatchSettings) {
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

    /**
     * Creates the concrete batch that renders systems with the given settings.
     * @param settings
     */
    protected abstract createBatch(settings: VFXBatchSettings): VFXBatch;

    /**
     * Adds a particle system to a batch.
     * @param {IParticleSystem} system - The particle system to add.
     */
    addSystem(system: IParticleSystem) {
        (system as unknown as ParticleSystem)._renderer = this;
        const settings = (system as unknown as ParticleSystem).getRendererSettings();
        for (let i = 0; i < this.batches.length; i++) {
            if (BaseBatchedRenderer.equals(this.batches[i].settings, settings)) {
                this.batches[i].addSystem(system);
                this.systemToBatchIndex.set(system, i);
                return;
            }
        }
        const batch = this.createBatch(settings);
        if (this.depthTexture) {
            batch.applyDepthTexture(this.depthTexture);
        }
        batch.addSystem(system);
        this.batches.push(batch);
        this.systemToBatchIndex.set(system, this.batches.length - 1);
        this.add(batch);
    }

    /**
     * Deletes a particle system from its batch.
     * @param {IParticleSystem} system - The particle system to delete.
     */
    deleteSystem(system: IParticleSystem) {
        const batchIndex = this.systemToBatchIndex.get(system);
        if (batchIndex != undefined) {
            this.batches[batchIndex].removeSystem(system);
            this.systemToBatchIndex.delete(system);
        }
    }

    /**
     * Sets the depth texture for all batches. it will be used for soft particles.
     * @param {Texture | null} depthTexture - The depth texture to set.
     */
    setDepthTexture(depthTexture: Texture | null) {
        this.depthTexture = depthTexture;
        for (const batch of this.batches) {
            batch.applyDepthTexture(depthTexture);
        }
    }

    /**
     * Updates a particle system when the particle system has changed requires reloading.
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
        this.systemToBatchIndex.forEach((value, ps) => {
            (ps as any).update(delta);
        });
        for (let i = 0; i < this.batches.length; i++) {
            this.batches[i].update();
        }
    }
}
