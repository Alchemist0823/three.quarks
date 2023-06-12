import {RecordState, TrailParticle} from './Particle';
import {
    AdditiveBlending,
    Matrix3,
    ShaderMaterial,
    Uniform,
    Vector2,
    DynamicDrawUsage,
    DoubleSide,
    BufferGeometry,
    Vector3,
    BufferAttribute,
    Quaternion,
} from 'three';

import trail_frag from './shaders/trail_frag.glsl';
import trail_vert from './shaders/trail_vert.glsl';
import {VFXBatch, VFXBatchSettings, RenderMode} from './VFXBatch';
import {getMaterialUVChannelName} from './util/ThreeUtil';

const UP = new Vector3(0, 0, 1);

export class TrailBatch extends VFXBatch {
    geometry!: BufferGeometry;

    private positionBuffer!: BufferAttribute;
    private previousBuffer!: BufferAttribute;
    private nextBuffer!: BufferAttribute;
    private uvBuffer!: BufferAttribute;
    private sideBuffer!: BufferAttribute;
    private widthBuffer!: BufferAttribute;
    private colorBuffer!: BufferAttribute;
    private indexBuffer!: BufferAttribute;

    constructor(settings: VFXBatchSettings) {
        super(settings);

        this.maxParticles = 10000;
        this.setupBuffers();
        this.rebuildMaterial();
        // TODO: implement boundingVolume
    }

    setupBuffers(): void {
        if (this.geometry) this.geometry.dispose();
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
        this.layers.mask = this.settings.layers.mask;

        const uniforms: {[a: string]: {value: any}} = {
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
        const defines: {[b: string]: string} = {};

        defines['USE_UV'] = '';
        defines['USE_COLOR_ALPHA'] = '';

        if ((this.settings.material as any).map) {
            defines['USE_MAP'] = '';
            defines['MAP_UV'] = getMaterialUVChannelName((this.settings.material as any).map.channel);
            uniforms['map'] = new Uniform((this.settings.material as any).map);
            uniforms['mapTransform'] = new Uniform(new Matrix3().copy((this.settings.material as any).map.matrix));
        }

        if (this.settings.renderMode === RenderMode.Trail) {
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: trail_vert,
                fragmentShader: trail_frag,
                transparent: this.settings.material.transparent,
                depthWrite: !this.settings.material.transparent,
                side: this.settings.material.side,
                blending: this.settings.material.blending || AdditiveBlending,
            });
        } else {
            throw new Error('render mode unavailable');
        }
    }

    /*
    clone() {
        let system = this.system.clone();
        return system.emitter as any;
    }*/
    vector_: Vector3 = new Vector3();
    vector2_: Vector3 = new Vector3();
    vector3_: Vector3 = new Vector3();
    quaternion_: Quaternion = new Quaternion();

    update() {
        let index = 0;
        let triangles = 0;

        let particleCount = 0;
        this.systems.forEach((system) => {
            for (let j = 0; j < system.particleNum; j++) {
                particleCount += (system.particles[j] as TrailParticle).previous.length * 2;
            }
        });
        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        this.systems.forEach((system) => {
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
                const row = Math.floor(particle.uvTile / vTileCount);

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
                    this.positionBuffer.setXYZ(index, current.position.x, current.position.y, current.position.z);
                    this.positionBuffer.setXYZ(index + 1, current.position.x, current.position.y, current.position.z);

                    if (system.worldSpace) {
                        this.positionBuffer.setXYZ(index, current.position.x, current.position.y, current.position.z);
                        this.positionBuffer.setXYZ(
                            index + 1,
                            current.position.x,
                            current.position.y,
                            current.position.z
                        );
                    } else {
                        if (particle.parentMatrix) {
                            this.vector_.copy(current.position).applyMatrix4(particle.parentMatrix);
                        } else {
                            this.vector_.copy(current.position).applyMatrix4(system.emitter.matrixWorld);
                        }
                        this.positionBuffer.setXYZ(index, this.vector_.x, this.vector_.y, this.vector_.z);
                        this.positionBuffer.setXYZ(index + 1, this.vector_.x, this.vector_.y, this.vector_.z);
                    }

                    if (system.worldSpace) {
                        this.previousBuffer.setXYZ(
                            index,
                            previous.position.x,
                            previous.position.y,
                            previous.position.z
                        );
                        this.previousBuffer.setXYZ(
                            index + 1,
                            previous.position.x,
                            previous.position.y,
                            previous.position.z
                        );
                    } else {
                        if (particle.parentMatrix) {
                            this.vector_.copy(previous.position).applyMatrix4(particle.parentMatrix);
                        } else {
                            this.vector_.copy(previous.position).applyMatrix4(system.emitter.matrixWorld);
                        }
                        this.previousBuffer.setXYZ(index, this.vector_.x, this.vector_.y, this.vector_.z);
                        this.previousBuffer.setXYZ(index + 1, this.vector_.x, this.vector_.y, this.vector_.z);
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

                    if (system.worldSpace) {
                        this.widthBuffer.setX(index, current.size);
                        this.widthBuffer.setX(index + 1, current.size);
                    } else {
                        if (particle.parentMatrix) {
                            this.widthBuffer.setX(index, current.size);
                            this.widthBuffer.setX(index + 1, current.size);
                        } else {
                            this.widthBuffer.setX(index, (current.size * (scale.x + scale.y + scale.z)) / 3);
                            this.widthBuffer.setX(index + 1, (current.size * (scale.x + scale.y + scale.z)) / 3);
                        }
                    }

                    this.uvBuffer.setXY(
                        index,
                        (i / particle.previous.length + col) * tileWidth,
                        (vTileCount - row - 1) * tileHeight
                    );
                    this.uvBuffer.setXY(
                        index + 1,
                        (i / particle.previous.length + col) * tileWidth,
                        (vTileCount - row) * tileHeight
                    );

                    this.colorBuffer.setXYZW(index, current.color.x, current.color.y, current.color.z, current.color.w);
                    this.colorBuffer.setXYZW(
                        index + 1,
                        current.color.x,
                        current.color.y,
                        current.color.z,
                        current.color.w
                    );

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
