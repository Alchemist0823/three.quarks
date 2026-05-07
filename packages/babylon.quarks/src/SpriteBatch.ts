import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';
import {Effect} from '@babylonjs/core/Materials/effect';
import {ShaderMaterial} from '@babylonjs/core/Materials/shaderMaterial';
import {Scene} from '@babylonjs/core/scene';
import {
    Vector3,
    Vector4,
    Quaternion,
    Matrix3,
    SpriteParticle,
    StretchedBillBoardSettings,
} from 'quarks.core';
import {VFXBatch, RenderMode} from './VFXBatch';
import {VFXBatchSettings} from './BatchedRenderer';
import particle_vert from './shaders/particle_vert.glsl';
import particle_frag from './shaders/particle_frag.glsl';
import stretched_bb_particle_vert from './shaders/stretched_bb_particle_vert.glsl';
import local_particle_vert from './shaders/local_particle_vert.glsl';

export class SpriteBatch extends VFXBatch {
    private offsetBuffer!: Float32Array;
    private rotationBuffer!: Float32Array;
    private sizeBuffer!: Float32Array;
    private colorBuffer!: Float32Array;
    private uvTileBuffer!: Float32Array;
    private velocityBuffer?: Float32Array;

    private offsetVB!: VertexBuffer;
    private rotationVB!: VertexBuffer;
    private sizeVB!: VertexBuffer;
    private colorVB!: VertexBuffer;
    private uvTileVB!: VertexBuffer;
    private velocityVB?: VertexBuffer;

    constructor(settings: VFXBatchSettings, scene: Scene) {
        super(settings, scene);
        this.maxParticles = 1000;
        this.setupBuffers();
        this.rebuildMaterial();
    }

    setupBuffers(): void {
        this.mesh.dispose();
        this.mesh = new Mesh('spriteBatch', this.scene);
        this.mesh.alwaysSelectAsActiveMesh = true;

        const vertexData = new VertexData();
        vertexData.positions = Array.from(this.settings.instancingGeometry);
        vertexData.indices = Array.from(this.settings.instancingIndices);
        if (this.settings.instancingUVs) {
            vertexData.uvs = Array.from(this.settings.instancingUVs);
        }
        if (this.settings.instancingNormals) {
            vertexData.normals = Array.from(this.settings.instancingNormals);
        }
        vertexData.applyToMesh(this.mesh, false);

        this.buildExpandableBuffers();
    }

    private buildExpandableBuffers(): void {
        const engine = this.scene.getEngine();

        this.offsetBuffer = new Float32Array(this.maxParticles * 3);
        this.offsetVB = new VertexBuffer(engine, this.offsetBuffer, 'offset', true, false, 3, true);
        this.mesh.setVerticesBuffer(this.offsetVB);

        this.colorBuffer = new Float32Array(this.maxParticles * 4);
        this.colorVB = new VertexBuffer(engine, this.colorBuffer, 'color', true, false, 4, true);
        this.mesh.setVerticesBuffer(this.colorVB);

        this.sizeBuffer = new Float32Array(this.maxParticles * 3);
        this.sizeVB = new VertexBuffer(engine, this.sizeBuffer, 'size', true, false, 3, true);
        this.mesh.setVerticesBuffer(this.sizeVB);

        this.uvTileBuffer = new Float32Array(this.maxParticles);
        this.uvTileVB = new VertexBuffer(engine, this.uvTileBuffer, 'uvTile', true, false, 1, true);
        this.mesh.setVerticesBuffer(this.uvTileVB);

        if (this.settings.renderMode === RenderMode.Mesh) {
            this.rotationBuffer = new Float32Array(this.maxParticles * 4);
            this.rotationVB = new VertexBuffer(engine, this.rotationBuffer, 'rotation', true, false, 4, true);
        } else {
            this.rotationBuffer = new Float32Array(this.maxParticles);
            this.rotationVB = new VertexBuffer(engine, this.rotationBuffer, 'rotation', true, false, 1, true);
        }
        this.mesh.setVerticesBuffer(this.rotationVB);

        if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
            this.velocityBuffer = new Float32Array(this.maxParticles * 4);
            this.velocityVB = new VertexBuffer(engine, this.velocityBuffer, 'velocity', true, false, 4, true);
            this.mesh.setVerticesBuffer(this.velocityVB);
        }

        this.mesh.forcedInstanceCount = 0;
        this.mesh.doNotSyncBoundingInfo = true;
    }

    expandBuffers(target: number): void {
        while (target >= this.maxParticles) {
            this.maxParticles *= 2;
        }
        this.setupBuffers();
        this.rebuildMaterial();
    }

    rebuildMaterial(): void {
        const shaderName = `quarksParticle_${this.settings.renderMode}_${Date.now()}`;
        let vertexShader: string;
        const defines: string[] = [];

        if (this.settings.renderMode === RenderMode.Mesh) {
            vertexShader = local_particle_vert;
        } else if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
            vertexShader = stretched_bb_particle_vert;
        } else {
            vertexShader = particle_vert;
        }

        if (this.settings.texture) {
            defines.push('USE_MAP');
        }
        if (this.settings.uTileCount > 1 || this.settings.vTileCount > 1) {
            defines.push('UV_TILE');
        }

        Effect.ShadersStore[shaderName + 'VertexShader'] = vertexShader;
        Effect.ShadersStore[shaderName + 'FragmentShader'] = particle_frag;

        const attributes = ['position', 'uv', 'offset', 'color', 'size', 'rotation', 'uvTile'];
        if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
            attributes.push('velocity');
        }

        const uniforms = ['world', 'view', 'projection', 'worldView', 'worldViewProjection'];
        const samplers: string[] = [];

        if (this.settings.uTileCount > 1 || this.settings.vTileCount > 1) {
            uniforms.push('tileCountX');
            uniforms.push('tileCountY');
        }
        if (this.settings.texture) {
            samplers.push('map');
        }
        if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
            uniforms.push('speedFactor');
        }

        const mat = new ShaderMaterial(shaderName, this.scene,
            {vertex: shaderName, fragment: shaderName},
            {
                attributes,
                uniforms,
                samplers,
                defines,
                needAlphaBlending: this.settings.materialTransparent,
            }
        );

        if (this.settings.texture) {
            mat.setTexture('map', this.settings.texture);
        }
        if (this.settings.uTileCount > 1 || this.settings.vTileCount > 1) {
            mat.setFloat('tileCountX', this.settings.uTileCount);
            mat.setFloat('tileCountY', this.settings.vTileCount);
        }
        if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
            mat.setFloat('speedFactor', 1.0);
        }

        mat.backFaceCulling = false;

        if (this.settings.materialTransparent) {
            mat.alphaMode = this.settings.materialBlendMode;
        }

        this.mesh.material = mat;
    }

    private vector_ = new Vector3();
    private vector2_ = new Vector3();
    private vector3_ = new Vector3();
    private quaternion_ = new Quaternion();
    private quaternion2_ = new Quaternion();
    private quaternion3_ = new Quaternion();
    private rotationMat_ = new Matrix3();
    private rotationMat2_ = new Matrix3();

    update(): void {
        let index = 0;
        let particleCount = 0;

        const visibleSystems = this.getVisibleSystems();
        for (const system of visibleSystems) {
            particleCount += system.particleNum;
        }
        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        for (const system of visibleSystems) {
            const particles = system.particles;
            const particleNum = system.particleNum;
            const rotation = this.quaternion2_;
            const translation = this.vector2_;
            const scale = this.vector3_;
            system.emitter.matrixWorld.decompose(translation, rotation, scale);
            this.rotationMat_.setFromMatrix4(system.emitter.matrixWorld);

            for (let j = 0; j < particleNum; j++, index++) {
                const particle = particles[j] as SpriteParticle;

                if (this.settings.renderMode === RenderMode.Mesh) {
                    let q: Quaternion;
                    if (system.worldSpace) {
                        q = particle.rotation as Quaternion;
                    } else {
                        let parentQ: Quaternion;
                        if (particle.parentMatrix) {
                            parentQ = this.quaternion3_.setFromRotationMatrix(particle.parentMatrix);
                        } else {
                            parentQ = rotation;
                        }
                        q = this.quaternion_;
                        q.copy(parentQ).multiply(particle.rotation as Quaternion);
                    }
                    const ri = index * 4;
                    this.rotationBuffer[ri] = q.x;
                    this.rotationBuffer[ri + 1] = q.y;
                    this.rotationBuffer[ri + 2] = q.z;
                    this.rotationBuffer[ri + 3] = q.w;
                } else {
                    this.rotationBuffer[index] = particle.rotation as number;
                }

                let vec: Vector3;
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

                const oi = index * 3;
                this.offsetBuffer[oi] = vec.x;
                this.offsetBuffer[oi + 1] = vec.y;
                this.offsetBuffer[oi + 2] = vec.z;

                const ci = index * 4;
                this.colorBuffer[ci] = particle.color.x;
                this.colorBuffer[ci + 1] = particle.color.y;
                this.colorBuffer[ci + 2] = particle.color.z;
                this.colorBuffer[ci + 3] = particle.color.w;

                const si = index * 3;
                if (system.worldSpace) {
                    this.sizeBuffer[si] = particle.size.x;
                    this.sizeBuffer[si + 1] = particle.size.y;
                    this.sizeBuffer[si + 2] = particle.size.z;
                } else {
                    if (particle.parentMatrix) {
                        this.sizeBuffer[si] = particle.size.x;
                        this.sizeBuffer[si + 1] = particle.size.y;
                        this.sizeBuffer[si + 2] = particle.size.z;
                    } else {
                        this.sizeBuffer[si] = particle.size.x * Math.abs(scale.x);
                        this.sizeBuffer[si + 1] = particle.size.y * Math.abs(scale.y);
                        this.sizeBuffer[si + 2] = particle.size.z * Math.abs(scale.z);
                    }
                }

                this.uvTileBuffer[index] = particle.uvTile;

                if (this.settings.renderMode === RenderMode.StretchedBillBoard && this.velocityBuffer) {
                    let speedFactor = (system.rendererEmitterSettings as StretchedBillBoardSettings).speedFactor;
                    if (speedFactor === 0) speedFactor = 0.001;
                    const lengthFactor = (system.rendererEmitterSettings as StretchedBillBoardSettings).lengthFactor;
                    let vel: Vector3;
                    if (system.worldSpace) {
                        vel = particle.velocity;
                    } else {
                        vel = this.vector_;
                        if (particle.parentMatrix) {
                            this.rotationMat2_.setFromMatrix4(particle.parentMatrix);
                            vel.copy(particle.velocity).applyMatrix3(this.rotationMat2_);
                        } else {
                            vel.copy(particle.velocity).applyMatrix3(this.rotationMat_);
                        }
                    }
                    const vi = index * 4;
                    this.velocityBuffer[vi] = vel.x * speedFactor;
                    this.velocityBuffer[vi + 1] = vel.y * speedFactor;
                    this.velocityBuffer[vi + 2] = vel.z * speedFactor;
                    this.velocityBuffer[vi + 3] = lengthFactor;
                }
            }
        }

        this.mesh.forcedInstanceCount = index;
        this.mesh.setEnabled(index > 0);

        if (index > 0) {
            this.offsetVB.update(this.offsetBuffer);
            this.sizeVB.update(this.sizeBuffer);
            this.colorVB.update(this.colorBuffer);
            this.uvTileVB.update(this.uvTileBuffer);
            this.rotationVB.update(this.rotationBuffer);
            if (this.settings.renderMode === RenderMode.StretchedBillBoard && this.velocityVB && this.velocityBuffer) {
                this.velocityVB.update(this.velocityBuffer);
            }
        }
    }

    dispose(): void {
        if (this.mesh.material) {
            this.mesh.material.dispose();
        }
        super.dispose();
    }
}
