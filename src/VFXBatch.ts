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

export enum RenderMode {
    BillBoard = 0,
    StretchedBillBoard = 1,
    Mesh = 2,
    Trail = 3,
    HorizontalBillBoard = 4,
    VerticalBillBoard = 5,
}

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
