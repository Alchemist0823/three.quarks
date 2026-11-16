import {
    DynamicDrawUsage,
    InstancedBufferGeometry,
    InstancedInterleavedBuffer,
    InterleavedBufferAttribute,
    Object3D,
} from 'three';
import {Vector3, Quaternion, Matrix3, SpriteParticle, StretchedBillBoardSettings} from 'quarks.core';
import type {VFXBatchSettings} from './BaseBatchedRenderer';
import {RenderMode, VFXBatch} from './VFXBatch';
import {getSpriteInstanceLayout, SpriteInstanceLayout} from './BatchLayouts';

type WritableArray = {[index: number]: number; length: number};

/**
 * Renderer-agnostic sprite / mesh batch.
 *
 * Owns the instanced geometry and fills the interleaved per-instance buffer(s) from the CPU particle simulation every
 * frame. The concrete subclasses only build the material: {@link SpriteBatch} (WebGL / GLSL) and `WebGPUSpriteBatch`
 * (WebGPU / TSL).
 *
 * The fill loop always writes the single float32 layout of the render mode, directly into the GPU buffer. Only the
 * optional half-float layout adds a second, table driven pass that repacks the values into its float32 and float16
 * buffers, so the default path keeps one tight loop over one typed array.
 */
export abstract class BaseSpriteBatch extends VFXBatch {
    declare geometry: InstancedBufferGeometry;

    /** Per-instance layout of this batch (what is uploaded). */
    layout: SpriteInstanceLayout;
    /** Interleaved per-instance buffers, one per {@link SpriteInstanceLayout.buffers} entry. */
    instanceBuffers: InstancedInterleavedBuffer[] = [];

    /** float32 scratch in the full layout, only used when `layout` is a split (half-float) layout */
    private scratch_: Float32Array | null = null;
    /** repack table: [dstBuffer, dstOffset, srcOffset, count] per attribute of the split layout */
    private repack_: Int32Array | null = null;

    /** The first (float32) per-instance buffer. */
    get instanceBuffer(): InstancedInterleavedBuffer {
        return this.instanceBuffers[0];
    }

    protected constructor(settings: VFXBatchSettings) {
        super(settings);
        this.maxParticles = 1000;
        this.layout = getSpriteInstanceLayout(settings.renderMode);
    }

    private get fullLayout(): SpriteInstanceLayout {
        return getSpriteInstanceLayout(this.settings.renderMode);
    }

    buildExpandableBuffers(): void {
        this.instanceBuffers = this.layout.buffers.map((bufferLayout) => {
            const length = this.maxParticles * bufferLayout.stride;
            const array = bufferLayout.half ? new (globalThis as any).Float16Array(length) : new Float32Array(length);
            const buffer = new InstancedInterleavedBuffer(array, bufferLayout.stride, 1);
            buffer.setUsage(DynamicDrawUsage);
            for (const attribute of bufferLayout.attributes) {
                this.geometry.setAttribute(
                    attribute.name,
                    new InterleavedBufferAttribute(buffer, attribute.itemSize, attribute.offset)
                );
            }
            return buffer;
        });

        const full = this.fullLayout;
        if (this.layout !== full) {
            this.scratch_ = new Float32Array(this.maxParticles * full.buffers[0].stride);
            const sources = full.buffers[0].attributes;
            const table: number[] = [];
            this.layout.buffers.forEach((bufferLayout, b) => {
                for (const attribute of bufferLayout.attributes) {
                    const source = sources.find((s) => s.name === attribute.name)!;
                    table.push(b, attribute.offset, source.offset, Math.min(attribute.itemSize, source.itemSize));
                }
            });
            this.repack_ = new Int32Array(table);
        } else {
            this.scratch_ = null;
            this.repack_ = null;
        }
    }

    setupBuffers(): void {
        if (this.geometry) this.geometry.dispose();
        this.geometry = new InstancedBufferGeometry();
        // three defaults to Infinity; draw nothing until the first update() fills the buffers
        this.geometry.instanceCount = 0;
        this.geometry.setIndex(this.settings.instancingGeometry.getIndex());
        if (this.settings.instancingGeometry.hasAttribute('normal')) {
            this.geometry.setAttribute('normal', this.settings.instancingGeometry.getAttribute('normal'));
        }
        this.geometry.setAttribute('position', this.settings.instancingGeometry.getAttribute('position'));
        if (this.settings.instancingGeometry.hasAttribute('uv')) {
            this.geometry.setAttribute('uv', this.settings.instancingGeometry.getAttribute('uv'));
        }
        this.buildExpandableBuffers();
    }

    expandBuffers(target: number): void {
        while (target >= this.maxParticles) {
            this.maxParticles *= 2;
        }
        this.setupBuffers();
    }

    vector_: Vector3 = new Vector3();
    vector2_: Vector3 = new Vector3();
    vector3_: Vector3 = new Vector3();
    quaternion_: Quaternion = new Quaternion();
    quaternion2_: Quaternion = new Quaternion();
    quaternion3_: Quaternion = new Quaternion();
    rotationMat_: Matrix3 = new Matrix3();
    rotationMat2_: Matrix3 = new Matrix3();

    update() {
        const visibleSystems = this.collectVisibleSystems();

        let particleCount = 0;
        for (let s = 0; s < visibleSystems.length; s++) {
            particleCount += visibleSystems[s].particleNum;
        }
        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        const full = this.fullLayout;
        const stride = full.buffers[0].stride;
        const oOffset = full.offset.offset;
        const oRotation = full.rotation.offset;
        const oSize = full.size.offset;
        const oUvTile = full.uvTile.offset;
        const oColor = full.color.offset;
        const oVelocity = full.velocity ? full.velocity.offset : -1;
        const isMesh = this.settings.renderMode === RenderMode.Mesh;
        const array = this.scratch_ ?? (this.instanceBuffers[0].array as Float32Array);

        let index = 0;
        for (let s = 0; s < visibleSystems.length; s++) {
            const system = visibleSystems[s];
            const emitter = system.emitter as unknown as Object3D;
            if (emitter.updateMatrixWorld) {
                emitter.updateWorldMatrix(true, false);
                emitter.updateMatrixWorld(true);
            }
            const particles = system.particles;
            const particleNum = system.particleNum;
            const rotation = this.quaternion2_;
            const translation = this.vector2_;
            const scale = this.vector3_;
            system.emitter.matrixWorld.decompose(translation, rotation, scale);
            this.rotationMat_.setFromMatrix4(system.emitter.matrixWorld);

            const worldSpace = system.worldSpace;
            const emitterMatrix = system.emitter.matrixWorld.elements;
            const scaleX = Math.abs(scale.x);
            const scaleY = Math.abs(scale.y);
            const scaleZ = Math.abs(scale.z);

            let speedFactor = 0;
            let lengthFactor = 0;
            if (oVelocity >= 0) {
                speedFactor = (system.rendererEmitterSettings as StretchedBillBoardSettings).speedFactor;
                if (speedFactor === 0) speedFactor = 0.001; // TODO: use an another buffer
                lengthFactor = (system.rendererEmitterSettings as StretchedBillBoardSettings).lengthFactor;
            }

            for (let j = 0; j < particleNum; j++, index++) {
                const particle = particles[j] as SpriteParticle;
                const base = index * stride;

                // rotation
                if (isMesh) {
                    let q: Quaternion;
                    if (worldSpace) {
                        q = particle.rotation as Quaternion;
                    } else {
                        let parentQ;
                        if (particle.parentMatrix) {
                            parentQ = this.quaternion3_.setFromRotationMatrix(particle.parentMatrix);
                        } else {
                            parentQ = rotation;
                        }
                        q = this.quaternion_;
                        q.copy(parentQ).multiply(particle.rotation as Quaternion);
                    }
                    array[base + oRotation] = q.x;
                    array[base + oRotation + 1] = q.y;
                    array[base + oRotation + 2] = q.z;
                    array[base + oRotation + 3] = q.w;
                } else {
                    array[base + oRotation] = particle.rotation as number;
                }

                // position & size
                const position = particle.position;
                const size = particle.size;
                if (worldSpace) {
                    array[base + oOffset] = position.x;
                    array[base + oOffset + 1] = position.y;
                    array[base + oOffset + 2] = position.z;
                    array[base + oSize] = size.x;
                    array[base + oSize + 1] = size.y;
                    array[base + oSize + 2] = size.z;
                } else {
                    const e = particle.parentMatrix ? particle.parentMatrix.elements : emitterMatrix;
                    const x = position.x,
                        y = position.y,
                        z = position.z;
                    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
                    array[base + oOffset] = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
                    array[base + oOffset + 1] = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
                    array[base + oOffset + 2] = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
                    if (particle.parentMatrix) {
                        array[base + oSize] = size.x;
                        array[base + oSize + 1] = size.y;
                        array[base + oSize + 2] = size.z;
                    } else {
                        array[base + oSize] = size.x * scaleX;
                        array[base + oSize + 1] = size.y * scaleY;
                        array[base + oSize + 2] = size.z * scaleZ;
                    }
                }

                // color
                const color = particle.color;
                array[base + oColor] = color.x;
                array[base + oColor + 1] = color.y;
                array[base + oColor + 2] = color.z;
                array[base + oColor + 3] = color.w;

                array[base + oUvTile] = particle.uvTile;

                // velocity (stretched billboards)
                if (oVelocity >= 0) {
                    let vec;
                    if (worldSpace) {
                        vec = particle.velocity;
                    } else {
                        vec = this.vector_;
                        if (particle.parentMatrix) {
                            this.rotationMat2_.setFromMatrix4(particle.parentMatrix);
                            vec.copy(particle.velocity).applyMatrix3(this.rotationMat2_);
                        } else {
                            vec.copy(particle.velocity).applyMatrix3(this.rotationMat_);
                        }
                    }
                    array[base + oVelocity] = vec.x * speedFactor;
                    array[base + oVelocity + 1] = vec.y * speedFactor;
                    array[base + oVelocity + 2] = vec.z * speedFactor;
                    array[base + oVelocity + 3] = lengthFactor;
                }
            }
        }
        this.geometry.instanceCount = index;

        if (this.repack_ !== null) this.repack(index, stride);

        if (index > 0) {
            // upload only the part of the buffers that is actually used this frame
            for (let b = 0; b < this.instanceBuffers.length; b++) {
                const buffer = this.instanceBuffers[b];
                buffer.clearUpdateRanges();
                buffer.addUpdateRange(0, index * this.layout.buffers[b].stride);
                buffer.needsUpdate = true;
            }
        }
    }

    /** Copies the float32 scratch (full layout) into the buffers of the split (half-float) layout. */
    private repack(count: number, sourceStride: number) {
        const source = this.scratch_!;
        const table = this.repack_!;
        const buffers = this.layout.buffers;
        for (let t = 0; t < table.length; t += 4) {
            const b = table[t];
            const target = this.instanceBuffers[b].array as WritableArray;
            const targetStride = buffers[b].stride;
            const dstOffset = table[t + 1];
            const srcOffset = table[t + 2];
            const n = table[t + 3];
            for (let i = 0; i < count; i++) {
                const d = i * targetStride + dstOffset;
                const s = i * sourceStride + srcOffset;
                for (let k = 0; k < n; k++) target[d + k] = source[s + k];
            }
        }
    }

    dispose() {
        this.geometry.dispose();
    }
}
