import {SpriteParticle} from './Particle';
import {
    AdditiveBlending,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    Matrix3,
    ShaderMaterial,
    Uniform,
    Vector2,
    DynamicDrawUsage, DoubleSide, FrontSide, Vector3, Quaternion
} from 'three';

import particle_frag from './shaders/particle_frag.glsl';
import particle_vert from './shaders/particle_vert.glsl';
import local_particle_vert from './shaders/local_particle_vert.glsl';
import stretched_bb_particle_vert from './shaders/stretched_bb_particle_vert.glsl';
import {VFXBatch, VFXBatchSettings, RenderMode} from "./VFXBatch";

const UP = new Vector3(0, 0, 1);

export class SpriteBatch extends VFXBatch {
    geometry!: InstancedBufferGeometry;

    private offsetBuffer!: InstancedBufferAttribute;
    private rotationBuffer!: InstancedBufferAttribute;
    private sizeBuffer!: InstancedBufferAttribute;
    private colorBuffer!: InstancedBufferAttribute;
    private uvTileBuffer!: InstancedBufferAttribute;
    private velocityBuffer? : InstancedBufferAttribute;

    constructor(settings: VFXBatchSettings) {
        super(settings);

        this.maxParticles = 1000;
        this.setupBuffers();
        this.rebuildMaterial();
        // TODO: implement boundingVolume
    }

    buildExpandableBuffers(): void {
        this.offsetBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 3), 3);
        this.offsetBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('offset', this.offsetBuffer);
        this.colorBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 4), 4);
        this.colorBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('color', this.colorBuffer);
        if (this.settings.renderMode === RenderMode.Mesh) {
            this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 4), 4);
            this.rotationBuffer.setUsage(DynamicDrawUsage);
            this.geometry.setAttribute('rotation', this.rotationBuffer);
        } else if (this.settings.renderMode === RenderMode.BillBoard || this.settings.renderMode === RenderMode.StretchedBillBoard) {
            this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles), 1);
            this.rotationBuffer.setUsage(DynamicDrawUsage);
            this.geometry.setAttribute('rotation', this.rotationBuffer);
        }
        this.sizeBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles), 1);
        this.sizeBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('size', this.sizeBuffer);
        this.uvTileBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles), 1);
        this.uvTileBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('uvTile', this.uvTileBuffer);
        if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
            this.velocityBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 3), 3);
            this.velocityBuffer.setUsage(DynamicDrawUsage);
            this.geometry.setAttribute('velocity', this.velocityBuffer);
        }
    }

    setupBuffers(): void {
        if (this.geometry)
            this.geometry.dispose();
        this.geometry = new InstancedBufferGeometry();
        this.geometry.setIndex(this.settings.instancingGeometry.getIndex());
        this.geometry.setAttribute('position', this.settings.instancingGeometry.getAttribute('position')); //new InterleavedBufferAttribute(this.interleavedBuffer, 3, 0, false));
        this.geometry.setAttribute('uv', this.settings.instancingGeometry.getAttribute('uv')); //new InterleavedBufferAttribute(this.interleavedBuffer, 2, 3, false));

        this.buildExpandableBuffers();
    }

    expandBuffers(target: number): void {
        while (target >= this.maxParticles) {
            this.maxParticles *= 2;
        }
        this.setupBuffers();
    }

    rebuildMaterial() {
        let uniforms: { [a: string]: Uniform } = {};
        let defines: { [b: string]: string } = {};

        defines['USE_MAP'] = '';
        defines['USE_UV'] = '';
        uniforms['map'] = new Uniform(this.settings.texture);
        //@ts-ignore
        uniforms['uvTransform'] = new Uniform(new Matrix3().copy(this.settings.texture.matrix));
        let uTileCount = this.settings.uTileCount;
        let vTileCount = this.settings.vTileCount;

        defines['UV_TILE'] = '';
        uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));

        if (this.settings.renderMode === RenderMode.BillBoard || this.settings.renderMode === RenderMode.Mesh) {
            let vertexShader;
            let side;
            if (this.settings.renderMode === RenderMode.Mesh) {
                vertexShader = local_particle_vert;
                side = DoubleSide;
            } else {
                vertexShader = particle_vert;
                side = FrontSide;
            }
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: vertexShader,
                fragmentShader: particle_frag,
                transparent: this.settings.transparent,
                depthWrite: !this.settings.transparent,
                blending: this.settings.blending || AdditiveBlending,
                side: side,
            });
        } else if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
            uniforms['speedFactor'] = new Uniform(1.0);
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: stretched_bb_particle_vert,
                fragmentShader: particle_frag,
                transparent: this.settings.transparent,
                depthWrite: !this.settings.transparent,
                blending: this.settings.blending || AdditiveBlending,
            });
        } else {
            throw new Error("render mode unavailable");
        }
    }

    /*
    clone() {
        let system = this.system.clone();
        return system.emitter as any;
    }*/
    vector_: Vector3 = new Vector3();
    quaternion_: Quaternion = new Quaternion();
    quaternion2_: Quaternion = new Quaternion();
    quaternion3_: Quaternion = new Quaternion();
    rotationMat_: Matrix3 = new Matrix3();
    rotationMat2_: Matrix3 = new Matrix3();

    update() {
        let index = 0;

        let particleCount = 0;
        this.systems.forEach(system => {
            particleCount += system.particleNum;
        });
        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        this.systems.forEach(system => {
            const particles = system.particles;
            let particleNum = system.particleNum;
            this.quaternion2_.setFromRotationMatrix(system.emitter.matrixWorld);
            this.rotationMat_.setFromMatrix4(system.emitter.matrixWorld);

            for (let j = 0; j < particleNum; j++, index ++) {
                let particle = particles[j] as SpriteParticle;

                if (this.settings.renderMode === RenderMode.Mesh) {
                    //this.quaternion_.setFromAxisAngle(UP, particle.rotation as number);
                    let q;
                    if (system.worldSpace) {
                        q = particle.rotation as Quaternion;
                    } else {
                        let parentQ;
                        if (particle.parentMatrix) {
                            parentQ = this.quaternion3_.setFromRotationMatrix(particle.parentMatrix);
                        } else {
                            parentQ = this.quaternion2_;
                        }
                        q = this.quaternion_;
                        q.copy(particle.rotation as Quaternion).multiply(parentQ);
                    }
                    this.rotationBuffer!.setXYZW(index, q.x, q.y, q.z, q.w);
                } else if (this.settings.renderMode === RenderMode.StretchedBillBoard || this.settings.renderMode === RenderMode.BillBoard) {
                    this.rotationBuffer!.setX(index, particle.rotation as number);
                }

                let vec;
                if (system.worldSpace) {
                    vec = particle.position;
                } else {
                    vec = this.vector_;
                    if (particle.parentMatrix) {
                        vec.copy(particle.position).applyMatrix4(particle.parentMatrix);
                    } else {
                        vec.copy(particle.position).applyMatrix4(system.emitter.matrixWorld);
                    }
                }
                this.offsetBuffer.setXYZ(index, vec.x, vec.y, vec.z);
                this.colorBuffer.setXYZW(index, particle.color.x, particle.color.y, particle.color.z, particle.color.w);

                if (system.worldSpace) {
                    this.sizeBuffer.setX(index, particle.size);
                } else {
                    if (particle.parentMatrix) {
                        this.sizeBuffer.setX(index, particle.size * particle.parentMatrix.elements[0]);
                    } else {
                        this.sizeBuffer.setX(index, particle.size * system.emitter.matrixWorld.elements[0]);
                    }
                }
                this.uvTileBuffer.setX(index, particle.uvTile);

                if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
                    let speedFactor = system.speedFactor;
                    let vec;
                    if (system.worldSpace) {
                        vec = particle.velocity;
                    } else {
                        vec = this.vector_;
                        if (particle.parentMatrix) {
                            this.rotationMat2_.setFromMatrix4(particle.parentMatrix)
                            vec.copy(particle.velocity).applyMatrix3(this.rotationMat2_);
                        } else {
                            vec.copy(particle.velocity).applyMatrix3(this.rotationMat_);
                        }
                    }
                    this.velocityBuffer!.setXYZ(index, vec.x * speedFactor, vec.y * speedFactor, vec.z * speedFactor);
                }
            }
        });
        this.geometry.instanceCount = index;

        if (index > 0) {
            this.offsetBuffer.updateRange.count = index * 3;
            this.offsetBuffer.needsUpdate = true;

            this.sizeBuffer.updateRange.count = index;
            this.sizeBuffer.needsUpdate = true;

            this.colorBuffer.updateRange.count = index * 4;
            this.colorBuffer.needsUpdate = true;

            this.uvTileBuffer.updateRange.count = index;
            this.uvTileBuffer.needsUpdate = true;

            if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
                this.velocityBuffer!.updateRange.count = index * 3;
                this.velocityBuffer!.needsUpdate = true;
            }

            if (this.settings.renderMode === RenderMode.Mesh) {
                this.rotationBuffer!.updateRange.count = index * 4;
                this.rotationBuffer!.needsUpdate = true;
            } else if (this.settings.renderMode === RenderMode.StretchedBillBoard || this.settings.renderMode === RenderMode.BillBoard) {
                this.rotationBuffer!.updateRange.count = index;
                this.rotationBuffer!.needsUpdate = true;
            }
        }
    }

    dispose() {
        this.geometry.dispose();
    }
}
