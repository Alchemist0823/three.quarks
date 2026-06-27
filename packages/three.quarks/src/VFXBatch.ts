import {IParticleSystem} from 'quarks.core';
import {BufferGeometry, Layers, Material, Mesh, ShaderMaterial, Texture} from 'three';
import {VFXBatchSettings} from './BatchedRenderer';

export interface StoredBatchSettings {
    instancingGeometry: BufferGeometry;
    material: Material;
    uTileCount: number;
    vTileCount: number;
    blendTiles: boolean;
    softParticles: boolean;
    softNearFade: number;
    softFarFade: number;
    renderMode: RenderMode;
    renderOrder: number;
    layers: Layers;
}

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

    getVisibleSystems(): IParticleSystem[] {
        return [...this.systems].filter((system) => system.emitter.visible);
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
