import {Mesh, ShaderMaterial, BufferGeometry, Material, Layers, Texture} from 'three';
import {IParticleSystem, VFXBatchSettings} from './BatchedRenderer';

export interface StoredBatchSettings {
    // 5 component x,y,z,u,v
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
    type = 'VFXBatch';
    systems: Set<IParticleSystem>;
    declare material: ShaderMaterial;

    settings: StoredBatchSettings;
    protected maxParticles;

    protected constructor(settings: VFXBatchSettings) {
        super();
        this.maxParticles = 1000;
        this.systems = new Set<IParticleSystem>();
        const layers = new Layers();
        layers.mask = settings.layers.mask;
        const newMat = settings.material.clone();
        newMat.defines = {};
        Object.assign(newMat.defines, settings.material.defines);
        this.settings = {
            instancingGeometry: settings.instancingGeometry,
            renderMode: settings.renderMode,
            renderOrder: settings.renderOrder,
            material: newMat,
            uTileCount: settings.uTileCount,
            vTileCount: settings.vTileCount,
            blendTiles: settings.blendTiles,
            softParticles: settings.softParticles,
            softNearFade: settings.softNearFade,
            softFarFade: settings.softFarFade,
            layers: layers,
        };
        this.frustumCulled = false;
        this.renderOrder = this.settings.renderOrder;
    }

    addSystem(system: IParticleSystem) {
        this.systems.add(system);
    }

    removeSystem(system: IParticleSystem) {
        this.systems.delete(system);
    }

    applyDepthTexture(depthTexture: Texture | null): void {
        const uniform = this.material.uniforms['depthTexture'];
        if (uniform) {
            if (uniform.value !== depthTexture) {
                uniform.value = depthTexture;
                this.material.needsUpdate = true;
            }
        }
    }

    abstract setupBuffers(): void;
    abstract expandBuffers(target: number): void;
    abstract rebuildMaterial(): void;
    abstract update(): void;
    abstract dispose(): void;

    /*
    clone() {
        let system = this.system.clone();
        return system.emitter as any;
    }*/
}
