import {Particle, RecordState, TrailParticle} from './Particle';
import {
    AdditiveBlending,
    Blending,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    Matrix3,
    Mesh,
    ShaderMaterial,
    Texture,
    Uniform,
    Vector2,
    DynamicDrawUsage,
    DoubleSide,
    FrontSide,
    BufferGeometry,
    PlaneBufferGeometry,
    NormalBlending,
    Vector3,
    Quaternion,
    Sprite,
    BufferAttribute,
    BoxBufferGeometry, Vector4
} from 'three';

import trail_frag from './shaders/trail_frag.glsl';
import trail_vert from './shaders/trail_vert.glsl';
import {ParticleSystemBatch, ParticleSystemBatchSettings, RenderMode} from "./ParticleSystemBatch";

const UP = new Vector3(0, 0, 1);

export class TrailBatch extends ParticleSystemBatch {
    geometry!: BufferGeometry;

    private positionBuffer!: BufferAttribute;
    private previousBuffer!: BufferAttribute;
    private nextBuffer!: BufferAttribute;
    private uvBuffer!: BufferAttribute;
    private sideBuffer!: BufferAttribute;
    private widthBuffer!: BufferAttribute;
    private colorBuffer!: BufferAttribute;
    private indexBuffer!: BufferAttribute;

    constructor(settings: ParticleSystemBatchSettings) {
        super(settings);

        this.maxParticles = 10000;
        this.setupBuffers();
        this.rebuildMaterial();
        // TODO: implement boundingVolume
    }

    setupBuffers(): void {
        if (this.geometry)
            this.geometry.dispose();
        this.geometry = new BufferGeometry();
        this.indexBuffer = new BufferAttribute(new Uint32Array(this.maxParticles * 6), 1);
        this.indexBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setIndex(this.indexBuffer);

        this.positionBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 6), 3);
        this.positionBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('position', this.positionBuffer);
        this.previousBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 6), 3);
        this.previousBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('previous', this.previousBuffer);
        this.nextBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 6), 3);
        this.nextBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('next', this.nextBuffer);
        this.widthBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 2), 1);
        this.widthBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('width', this.widthBuffer);
        this.sideBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 2), 1);
        this.sideBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('side', this.sideBuffer);
        this.uvBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 4), 2);
        this.uvBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('uv', this.uvBuffer);
        this.colorBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 8), 4);
        this.colorBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('color', this.colorBuffer);
    }

    expandBuffers(target: number): void {
        while (target >= this.maxParticles) {
            this.maxParticles *= 2;
        }
        this.setupBuffers();
    }

    rebuildMaterial() {
        let uniforms: { [a: string]: { value: any } } = {
            lineWidth: {value: 1},
            map: {value: null},
            useMap: {value: 0},
            alphaMap: {value: null},
            useAlphaMap: {value: 0},
            resolution: {value: new Vector2(1, 1)},
            sizeAttenuation: {value: 1},
            visibility: {value: 1},
            alphaTest: {value: 0},
            repeat: {value: new Vector2(1, 1)},
        };
        let defines: { [b: string]: string } = {};

        defines['USE_MAP'] = '';
        defines['USE_UV'] = '';
        uniforms['map'] = new Uniform(this.settings.texture);
        //@ts-ignore
        uniforms['uvTransform'] = new Uniform(new Matrix3().copy(this.settings.texture.matrix));

        if (this.settings.renderMode === RenderMode.Trail) {
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: trail_vert,
                fragmentShader: trail_frag,
                transparent: this.settings.transparent,
                depthWrite: !this.settings.transparent,
                side: DoubleSide,
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

    update() {
        let index = 0;
        let triangles = 0;

        let particleCount = 0;
        this.systems.forEach(system => {
            for (let j = 0; j < system.particleNum; j++) {
                particleCount += (system.particles[j] as TrailParticle).previous.length * 2;
            }
        });
        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        this.systems.forEach(system => {
            const particles = system.particles;
            let particleNum = system.particleNum;

            let uTileCount = this.settings.uTileCount;
            let vTileCount = this.settings.vTileCount;

            const tileWidth = 1 / uTileCount;
            const tileHeight = 1 / vTileCount;

            for (let j = 0; j < particleNum; j++) {
                let particle = particles[j] as TrailParticle;
                const col = particle.uvTile % vTileCount;
                const row = Math.floor(particle.uvTile / vTileCount);

                for (let i = 0; i < particle.previous.length; i++, index += 2) {

                    const recordState = particle.previous[i];
                    this.positionBuffer.setXYZ(index, recordState.position.x, recordState.position.y, recordState.position.z);
                    this.positionBuffer.setXYZ(index + 1, recordState.position.x, recordState.position.y, recordState.position.z);

                    if (system.worldSpace) {
                        this.positionBuffer.setXYZ(index, recordState.position.x, recordState.position.y, recordState.position.z);
                        this.positionBuffer.setXYZ(index + 1, recordState.position.x, recordState.position.y, recordState.position.z);
                    } else {
                        if (particle.parentMatrix) {
                            this.vector_.copy(recordState.position).applyMatrix4(particle.parentMatrix);
                        } else {
                            this.vector_.copy(recordState.position).applyMatrix4(system.emitter.matrixWorld);
                        }
                        this.positionBuffer.setXYZ(index, this.vector_.x, this.vector_.y, this.vector_.z);
                        this.positionBuffer.setXYZ(index + 1, this.vector_.x, this.vector_.y, this.vector_.z);
                    }

                    let previous;
                    if (i - 1 >= 0) {
                        previous = particle.previous[i - 1];
                    } else {
                        previous = particle.previous[0];
                    }

                    if (system.worldSpace) {
                        this.previousBuffer.setXYZ(index, previous.position.x, previous.position.y, previous.position.z);
                        this.previousBuffer.setXYZ(index + 1, previous.position.x, previous.position.y, previous.position.z);
                    } else {
                        if (particle.parentMatrix) {
                            this.vector_.copy(previous.position).applyMatrix4(particle.parentMatrix);
                        } else {
                            this.vector_.copy(previous.position).applyMatrix4(system.emitter.matrixWorld);
                        }
                        this.previousBuffer.setXYZ(index, this.vector_.x, this.vector_.y, this.vector_.z);
                        this.previousBuffer.setXYZ(index + 1, this.vector_.x, this.vector_.y, this.vector_.z);
                    }

                    let next;
                    if (i + 1 < particle.previous.length) {
                        next = particle.previous[i + 1];
                    } else {
                        next = particle.previous[particle.previous.length - 1];
                    }
                    if (system.worldSpace) {
                        this.nextBuffer.setXYZ(index, next.position.x, next.position.y, next.position.z);
                        this.nextBuffer.setXYZ(index + 1, next.position.x, next.position.y, next.position.z);
                    } else {
                        if (particle.parentMatrix) {
                            this.vector_.copy(next.position).applyMatrix4(particle.parentMatrix);
                        } else {
                            this.vector_.copy(next.position).applyMatrix4(system.emitter.matrixWorld);
                        }
                        this.nextBuffer.setXYZ(index, this.vector_.x, this.vector_.y, this.vector_.z);
                        this.nextBuffer.setXYZ(index + 1, this.vector_.x, this.vector_.y, this.vector_.z);
                    }

                    this.sideBuffer.setX(index, -1);
                    this.sideBuffer.setX(index + 1, 1);

                    this.widthBuffer.setX(index, recordState.size);
                    this.widthBuffer.setX(index + 1, recordState.size);

                    this.uvBuffer.setXY(index, (i / particle.previous.length + col) * tileWidth, (vTileCount - row - 1) * tileHeight);
                    this.uvBuffer.setXY(index + 1, (i / particle.previous.length + col) * tileWidth, (vTileCount - row) * tileHeight);

                    this.colorBuffer.setXYZW(index, recordState.color.x, recordState.color.y, recordState.color.z, recordState.color.w);
                    this.colorBuffer.setXYZW(index + 1, recordState.color.x, recordState.color.y, recordState.color.z, recordState.color.w);

                    if (i + 1 < particle.previous.length) {
                        this.indexBuffer.setX(triangles * 3, index);
                        this.indexBuffer.setX(triangles * 3 + 1, index + 1);
                        this.indexBuffer.setX(triangles * 3 + 2, index + 2);
                        triangles++;
                        this.indexBuffer.setX(triangles * 3, index + 2);
                        this.indexBuffer.setX(triangles * 3 + 1, index + 1);
                        this.indexBuffer.setX(triangles * 3 + 2, index + 3);
                        triangles++;
                    }
                }
            }
        });
        this.positionBuffer.updateRange.count = index * 3;
        this.positionBuffer.needsUpdate = true;

        this.previousBuffer.updateRange.count = index * 3;
        this.previousBuffer.needsUpdate = true;

        this.nextBuffer.updateRange.count = index * 3;
        this.nextBuffer.needsUpdate = true;

        this.sideBuffer.updateRange.count = index;
        this.sideBuffer.needsUpdate = true;

        this.widthBuffer.updateRange.count = index;
        this.widthBuffer.needsUpdate = true;

        this.uvBuffer.updateRange.count = index * 2;
        this.uvBuffer.needsUpdate = true;

        this.colorBuffer.updateRange.count = index * 4;
        this.colorBuffer.needsUpdate = true;

        this.indexBuffer.updateRange.count = triangles * 3;
        this.indexBuffer.needsUpdate = true;

        this.geometry.setDrawRange(0, triangles * 3);
    }

    dispose() {
        this.geometry.dispose();
    }
}
