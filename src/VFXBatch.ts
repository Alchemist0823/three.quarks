
import {
    BufferGeometry, Layers,
    Mesh,
    ShaderMaterial
} from 'three';
import { ParticleSystem } from './ParticleSystem';
import type { ParticleMaterial } from './types/ParticleMaterial';

export interface VFXBatchSettings {
    // 5 component x,y,z,u,v
    instancingGeometry: BufferGeometry;
    material: ParticleMaterial;
    uTileCount: number;
    vTileCount: number;
    blendTiles: boolean;
    renderMode : RenderMode;
    renderOrder : number;
    layers: Layers;
}

export enum RenderMode {
    BillBoard = 0,
    StretchedBillBoard = 1,
    Mesh = 2,
    Trail = 3,
}

export abstract class VFXBatch extends Mesh {
    type = "VFXBatch";
    systems: Set<ParticleSystem>;
    material!: ShaderMaterial;

    settings: VFXBatchSettings;
    protected maxParticles;

    protected constructor(settings: VFXBatchSettings) {
        super();
        this.maxParticles = 1000;
        this.systems = new Set<ParticleSystem>();
        const layers = new Layers();
        layers.mask = settings.layers.mask;
        this.settings = {
            instancingGeometry: settings.instancingGeometry,
            renderMode: settings.renderMode,
            renderOrder: settings.renderOrder,
            material: settings.material,
            uTileCount: settings.uTileCount,
            vTileCount: settings.vTileCount,
            blendTiles: settings.blendTiles,
            layers: layers,
        };
        this.frustumCulled = false;
        this.renderOrder = this.settings.renderOrder;
    }

    addSystem(system: ParticleSystem) {
        this.systems.add(system);
    }

    removeSystem(system: ParticleSystem) {
        this.systems.delete(system);
    }

    applyDepthTexture(depthTexture: THREE.Texture | null): void {
        const uniform = this.material.uniforms['depthTexture'];
        if (uniform) {
            if(uniform.value !==depthTexture) {
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
