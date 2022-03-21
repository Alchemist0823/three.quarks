import {Behavior} from './behaviors/Behavior';
import {Particle, SpriteParticle, TrailParticle} from './Particle';
import {ParticleSystem} from './ParticleSystem';
import {
    AdditiveBlending,
    Blending,
    BufferAttribute,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    InterleavedBuffer,
    InterleavedBufferAttribute,
    Matrix3,
    Mesh,
    ShaderMaterial,
    Texture,
    Uniform,
    Vector2,
    Vector4,
    Object3D,
    TrianglesDrawMode,
    DynamicDrawUsage, DoubleSide, FrontSide, BufferGeometry, PlaneBufferGeometry, NormalBlending, Vector3, Quaternion, Sprite
} from 'three';

import particle_frag from './shaders/particle_frag.glsl';
import particle_vert from './shaders/particle_vert.glsl';
import local_particle_vert from './shaders/local_particle_vert.glsl';
import stretched_bb_particle_vert from './shaders/stretched_bb_particle_vert.glsl';
import trail_frag from './shaders/trail_frag.glsl';
import trail_vert from './shaders/trail_vert.glsl';

export interface ParticleSystemBatchSettings {
    // 5 component x,y,z,u,v
    instancingGeometry: BufferGeometry;
    texture: Texture;
    uTileCount: number;
    vTileCount: number;
    blending: Blending;
    renderMode : RenderMode;
    renderOrder : number;
    transparent: boolean;
}

export enum RenderMode {
    BillBoard = 0,
    StretchedBillBoard = 1,
    LocalSpace = 2,
    Trail = 3,
}

export abstract class ParticleSystemBatch extends Mesh {
    type: string = "ParticleSystemBatch";
    systems: Set<ParticleSystem>;
    material!: ShaderMaterial;

    settings: ParticleSystemBatchSettings;

    protected constructor(settings: ParticleSystemBatchSettings) {
        super();
        this.systems = new Set<ParticleSystem>();
        this.settings = {
            blending: settings.blending,
            instancingGeometry: settings.instancingGeometry,
            renderMode: settings.renderMode,
            renderOrder: settings.renderOrder,
            texture: settings.texture,
            uTileCount: settings.uTileCount,
            vTileCount: settings.vTileCount,
            transparent: settings.transparent,
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

    abstract setupBuffers(): void;
    abstract rebuildMaterial(): void;
    abstract update(): void;
    abstract dispose(): void;

    /*
    clone() {
        let system = this.system.clone();
        return system.emitter as any;
    }*/
}
