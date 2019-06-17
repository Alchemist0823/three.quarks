import {Behavior} from './Behavior';
import {Particle} from './Particle';
import {ParticleSystem} from './ParticleSystem';
import {
    AdditiveBlending,
    Blending,
    BufferAttribute,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    InterleavedBuffer,
    InterleavedBufferAttribute, Matrix3, Mesh, ShaderMaterial, Texture, Uniform, Vector2, Vector4
} from 'three';

import particle_frag from './shaders/particle_frag.glsl';
import particle_vert from './shaders/particle_vert.glsl';

export interface ParticleRendererParameters {
    texture?: Texture;
    uTileCount?: number;
    vTileCount?: number;
    worldSpace?: boolean;
    blending?: Blending;
}


export class ParticleEmitter extends Mesh {

    system: ParticleSystem;
    geometry: InstancedBufferGeometry;
    material: ShaderMaterial;
    private rotationBuffer: InstancedBufferAttribute;
    private sizeBuffer: InstancedBufferAttribute;
    private colorBuffer: InstancedBufferAttribute;
    private offsetBuffer: InstancedBufferAttribute;

    private tiling: boolean;
    private uvTileBuffer?: InstancedBufferAttribute;

    constructor(system: ParticleSystem, parameters: ParticleRendererParameters) {
        super();
        this.system = system;
        this.geometry = new InstancedBufferGeometry();

        const float32Array = new Float32Array([
            -0.5, -0.5, 0, 0, 0,
            0.5, -0.5, 0, 1, 0,
            0.5, 0.5, 0, 1, 1,
            -0.5, 0.5, 0, 0, 1
        ]);

        let uniforms: {[a:string]:Uniform} = {};
        let defines: {[b:string]:string} = {};

        const interleavedBuffer = new InterleavedBuffer(float32Array, 5);

        this.geometry.setIndex([0, 1, 2, 0, 2, 3]);
        this.geometry.addAttribute('position', new InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
        this.geometry.addAttribute('uv', new InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));

        this.offsetBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle * 3), 3);
        this.offsetBuffer.setDynamic(true);
        this.geometry.addAttribute('offset', this.offsetBuffer);
        this.colorBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle * 4), 4);
        this.colorBuffer.setDynamic(true);
        this.geometry.addAttribute('color', this.colorBuffer);
        this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle), 1);
        this.rotationBuffer.setDynamic(true);
        this.geometry.addAttribute('rotation', this.rotationBuffer);
        this.sizeBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle), 1);
        this.sizeBuffer.setDynamic(true);
        this.geometry.addAttribute('size', this.sizeBuffer);


        this.tiling = false;
        if (parameters.texture) {
            defines['USE_MAP'] = '';
            uniforms['map'] = new Uniform(parameters.texture);
            //@ts-ignore
            uniforms['uvTransform'] = new Uniform(new Matrix3().copy(parameters.texture.matrix));

            let uTileCount = parameters.uTileCount || 1;
            let vTileCount = parameters.vTileCount || 1;
            this.tiling = uTileCount > 1 || vTileCount > 1;
            this.system.tileCount = uTileCount * vTileCount;
            if (this.tiling) {
                this.uvTileBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle), 1);
                this.uvTileBuffer.setDynamic(true);
                this.geometry.addAttribute('uvTile', this.uvTileBuffer);
                defines['UV_TILE']='';
                uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));
            }
        }

        if (parameters.worldSpace !== undefined? parameters.worldSpace: true) {
            defines['WORLD_SPACE']='';
        }

        this.material = new ShaderMaterial({
            uniforms: uniforms,
            defines: defines,
            vertexShader: particle_vert,
            fragmentShader: particle_frag,
            transparent: true,
            depthWrite: false,
            blending: parameters.blending || AdditiveBlending,
        });

        // TODO: implement boundingVolume
        this.frustumCulled = false;
    }

    update() {
        const particles = this.system.particles;
        let particleNum = this.system.particleNum;

        this.geometry.maxInstancedCount = particleNum;
        for (let i = 0; i < particleNum; i ++) {
            let particle = particles[i];
            this.offsetBuffer.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
            this.colorBuffer.setXYZW(i, particle.color.x, particle.color.y, particle.color.z, particle.color.w);
            this.rotationBuffer.setX(i, particle.rotation);
            this.sizeBuffer.setX(i, particle.size);
            if (this.tiling) {
                this.uvTileBuffer!.setX(i, particle.uvTile);
            }
        }

        if (particleNum > 0) {
            this.offsetBuffer.updateRange.count = particleNum * 3;
            this.offsetBuffer.needsUpdate = true;

            this.colorBuffer.updateRange.count = particleNum * 4;
            this.colorBuffer.needsUpdate = true;

            this.rotationBuffer.updateRange.count = particleNum;
            this.rotationBuffer.needsUpdate = true;

            this.sizeBuffer.updateRange.count = particleNum;
            this.sizeBuffer.needsUpdate = true;

            if (this.tiling) {
                this.uvTileBuffer!.updateRange.count = particleNum;
                this.uvTileBuffer!.needsUpdate = true;
            }
        }
    }
}
