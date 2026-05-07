import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';
import {Effect} from '@babylonjs/core/Materials/effect';
import {ShaderMaterial} from '@babylonjs/core/Materials/shaderMaterial';
import {Scene} from '@babylonjs/core/scene';
import {BoundingInfo} from '@babylonjs/core/Culling/boundingInfo';
import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Matrix4, Quaternion, RecordState, TrailParticle, Vector3} from 'quarks.core';
import {VFXBatch, RenderMode} from './VFXBatch';
import {VFXBatchSettings} from './BatchedRenderer';
import trail_vert from './shaders/trail_vert.glsl';
import trail_frag from './shaders/trail_frag.glsl';

export class TrailBatch extends VFXBatch {
    private positionBuffer!: Float32Array;
    private previousBuffer!: Float32Array;
    private nextBuffer!: Float32Array;
    private uvBuffer!: Float32Array;
    private sideBuffer!: Float32Array;
    private widthBuffer!: Float32Array;
    private colorBuffer!: Float32Array;
    private indexBuffer!: Uint32Array;

    constructor(settings: VFXBatchSettings, scene: Scene) {
        super(settings, scene);
        this.maxParticles = 10000;
        this.setupBuffers();
        this.rebuildMaterial();
        this.mesh.setEnabled(false);
    }

    setupBuffers(): void {
        this.mesh.dispose();
        this.mesh = new Mesh('trailBatch', this.scene);
        this.mesh.alwaysSelectAsActiveMesh = true;

        this.positionBuffer = new Float32Array(this.maxParticles * 6);
        this.previousBuffer = new Float32Array(this.maxParticles * 6);
        this.nextBuffer = new Float32Array(this.maxParticles * 6);
        this.uvBuffer = new Float32Array(this.maxParticles * 4);
        this.sideBuffer = new Float32Array(this.maxParticles * 2);
        this.widthBuffer = new Float32Array(this.maxParticles * 2);
        this.colorBuffer = new Float32Array(this.maxParticles * 8);
        this.indexBuffer = new Uint32Array(this.maxParticles * 6);

        // Initialize with full-capacity buffers (updatable) and a dummy triangle
        this.positionBuffer[0] = 0; this.positionBuffer[1] = 0; this.positionBuffer[2] = 0;
        this.positionBuffer[3] = 1; this.positionBuffer[4] = 0; this.positionBuffer[5] = 0;
        this.positionBuffer[6] = 0; this.positionBuffer[7] = 1; this.positionBuffer[8] = 0;
        this.positionBuffer[9] = 1; this.positionBuffer[10] = 1; this.positionBuffer[11] = 0;
        this.indexBuffer[0] = 0; this.indexBuffer[1] = 1; this.indexBuffer[2] = 2;
        this.indexBuffer[3] = 1; this.indexBuffer[4] = 3; this.indexBuffer[5] = 2;

        // Set standard vertex data with full buffer capacity (updatable)
        this.mesh.setVerticesData(VertexBuffer.PositionKind, this.positionBuffer, true);
        this.mesh.setVerticesData(VertexBuffer.UVKind, this.uvBuffer, true);
        this.mesh.setVerticesData(VertexBuffer.ColorKind, this.colorBuffer, true, 4);
        this.mesh.setIndices(Array.from(this.indexBuffer.subarray(0, 6)), null, true);

        // Disable bounding info recomputation
        this.mesh.doNotSyncBoundingInfo = true;
        const min = new BVector3(-10000, -10000, -10000);
        const max = new BVector3(10000, 10000, 10000);
        this.mesh.setBoundingInfo(new BoundingInfo(min, max));
        if (this.mesh.subMeshes) {
            for (const sub of this.mesh.subMeshes) {
                (sub as any)._boundingInfo = this.mesh.getBoundingInfo();
            }
        }

    }

    expandBuffers(target: number): void {
        while (target >= this.maxParticles) {
            this.maxParticles *= 2;
        }
        this.setupBuffers();
        this.rebuildMaterial();
    }

    rebuildMaterial(): void {
        const shaderName = `quarksTrail_${Date.now()}`;
        const defines: string[] = [];

        if (this.settings.texture) {
            defines.push('USE_MAP');
        }

        Effect.ShadersStore[shaderName + 'VertexShader'] = trail_vert;
        Effect.ShadersStore[shaderName + 'FragmentShader'] = trail_frag;

        const attributes = ['position', 'uv', 'color'];
        const uniforms = ['worldViewProjection', 'view', 'projection'];
        const samplers: string[] = [];

        if (this.settings.texture) {
            samplers.push('map');
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

    update(): void {
        let index = 0;
        let triangles = 0;

        let particleCount = 0;
        const visibleSystems = this.getVisibleSystems();
        for (const system of visibleSystems) {
            for (let j = 0; j < system.particleNum; j++) {
                particleCount += (system.particles[j] as TrailParticle).previous.length * 2;
            }
        }
        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        for (const system of visibleSystems) {
            // Ensure world matrix is up to date
            if ((system.emitter as any).computeWorldMatrix) {
                (system.emitter as any).computeWorldMatrix(true);
            }
            const rotation = this.quaternion_;
            const translation = this.vector2_;
            const scale = this.vector3_;
            system.emitter.matrixWorld.decompose(translation, rotation, scale);

            const particles = system.particles;
            const particleNum = system.particleNum;
            const uTileCount = this.settings.uTileCount;
            const vTileCount = this.settings.vTileCount;
            const tileWidth = 1 / uTileCount;
            const tileHeight = 1 / vTileCount;

            for (let j = 0; j < particleNum; j++) {
                const particle = particles[j] as TrailParticle;
                const col = particle.uvTile % vTileCount;
                const row = Math.floor(particle.uvTile / vTileCount + 0.001);

                const iter = particle.previous.values();
                let curIter = iter.next();
                let previous: RecordState = curIter.value as RecordState;
                let current: RecordState = previous;
                if (!curIter.done) curIter = iter.next();
                let next: RecordState;
                if (curIter.value !== undefined) {
                    next = curIter.value;
                } else {
                    next = current;
                }

                for (let i = 0; i < particle.previous.length; i++, index += 2) {
                    let pos: Vector3;
                    if (system.worldSpace) {
                        pos = current.position;
                    } else {
                        if (particle.parentMatrix) {
                            this.vector_.copy(current.position).applyMatrix4(particle.parentMatrix as unknown as Matrix4);
                        } else {
                            this.vector_.copy(current.position).applyMatrix4(system.emitter.matrixWorld);
                        }
                        pos = this.vector_;
                    }
                    const pi = index * 3;
                    this.positionBuffer[pi] = pos.x;
                    this.positionBuffer[pi + 1] = pos.y;
                    this.positionBuffer[pi + 2] = pos.z;
                    this.positionBuffer[pi + 3] = pos.x;
                    this.positionBuffer[pi + 4] = pos.y;
                    this.positionBuffer[pi + 5] = pos.z;

                    let prevPos: Vector3;
                    if (system.worldSpace) {
                        prevPos = previous.position;
                    } else {
                        if (particle.parentMatrix) {
                            this.vector_.copy(previous.position).applyMatrix4(particle.parentMatrix as unknown as Matrix4);
                        } else {
                            this.vector_.copy(previous.position).applyMatrix4(system.emitter.matrixWorld);
                        }
                        prevPos = this.vector_;
                    }
                    this.previousBuffer[pi] = prevPos.x;
                    this.previousBuffer[pi + 1] = prevPos.y;
                    this.previousBuffer[pi + 2] = prevPos.z;
                    this.previousBuffer[pi + 3] = prevPos.x;
                    this.previousBuffer[pi + 4] = prevPos.y;
                    this.previousBuffer[pi + 5] = prevPos.z;

                    let nextPos: Vector3;
                    if (system.worldSpace) {
                        nextPos = next.position;
                    } else {
                        if (particle.parentMatrix) {
                            this.vector_.copy(next.position).applyMatrix4(particle.parentMatrix as unknown as Matrix4);
                        } else {
                            this.vector_.copy(next.position).applyMatrix4(system.emitter.matrixWorld);
                        }
                        nextPos = this.vector_;
                    }
                    this.nextBuffer[pi] = nextPos.x;
                    this.nextBuffer[pi + 1] = nextPos.y;
                    this.nextBuffer[pi + 2] = nextPos.z;
                    this.nextBuffer[pi + 3] = nextPos.x;
                    this.nextBuffer[pi + 4] = nextPos.y;
                    this.nextBuffer[pi + 5] = nextPos.z;

                    this.sideBuffer[index] = 1;
                    this.sideBuffer[index + 1] = -1;

                    if (system.worldSpace || particle.parentMatrix) {
                        this.widthBuffer[index] = current.size;
                        this.widthBuffer[index + 1] = current.size;
                    } else {
                        const objectScale = (Math.abs(scale.x) + Math.abs(scale.y) + Math.abs(scale.z)) / 3;
                        this.widthBuffer[index] = current.size * objectScale;
                        this.widthBuffer[index + 1] = current.size * objectScale;
                    }

                    const ui = index * 2;
                    this.uvBuffer[ui] = (i / particle.previous.length + col) * tileWidth;
                    this.uvBuffer[ui + 1] = (vTileCount - row - 1) * tileHeight;
                    this.uvBuffer[ui + 2] = (i / particle.previous.length + col) * tileWidth;
                    this.uvBuffer[ui + 3] = (vTileCount - row) * tileHeight;

                    const cci = index * 4;
                    this.colorBuffer[cci] = current.color.x;
                    this.colorBuffer[cci + 1] = current.color.y;
                    this.colorBuffer[cci + 2] = current.color.z;
                    this.colorBuffer[cci + 3] = current.color.w;
                    this.colorBuffer[cci + 4] = current.color.x;
                    this.colorBuffer[cci + 5] = current.color.y;
                    this.colorBuffer[cci + 6] = current.color.z;
                    this.colorBuffer[cci + 7] = current.color.w;

                    if (i + 1 < particle.previous.length) {
                        this.indexBuffer[triangles * 3] = index;
                        this.indexBuffer[triangles * 3 + 1] = index + 1;
                        this.indexBuffer[triangles * 3 + 2] = index + 2;
                        triangles++;
                        this.indexBuffer[triangles * 3] = index + 2;
                        this.indexBuffer[triangles * 3 + 1] = index + 1;
                        this.indexBuffer[triangles * 3 + 2] = index + 3;
                        triangles++;
                    }

                    previous = current;
                    current = next;
                    if (!curIter.done) {
                        curIter = iter.next();
                        if (curIter.value !== undefined) {
                            next = curIter.value;
                        }
                    }
                }
            }
        }

        if (index > 0 && triangles > 0) {
            this.mesh.updateVerticesData(VertexBuffer.PositionKind, this.positionBuffer);
            this.mesh.updateVerticesData(VertexBuffer.UVKind, this.uvBuffer);
            this.mesh.updateIndices(Array.from(this.indexBuffer.subarray(0, triangles * 3)));

            const colorVB = this.mesh.getVertexBuffer(VertexBuffer.ColorKind);
            if (colorVB) colorVB.update(this.colorBuffer);

            this.mesh.setEnabled(true);
            if (this.mesh.subMeshes && this.mesh.subMeshes.length > 0) {
                this.mesh.subMeshes[0].indexCount = triangles * 3;
                this.mesh.subMeshes[0].verticesCount = index;
            }
        } else {
            this.mesh.setEnabled(false);
        }
    }

    dispose(): void {
        if (this.mesh.material) {
            this.mesh.material.dispose();
        }
        super.dispose();
    }
}
