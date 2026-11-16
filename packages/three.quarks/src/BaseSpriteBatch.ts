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

/**
 * Renderer-agnostic sprite / mesh batch.
 *
 * Owns the instanced geometry and fills one interleaved per-instance buffer from the CPU particle
 * simulation every frame. The concrete subclasses only build the material:
 * {@link SpriteBatch} (WebGL / GLSL) and `WebGPUSpriteBatch` (WebGPU / TSL).
 */
export abstract class BaseSpriteBatch extends VFXBatch {
    declare geometry: InstancedBufferGeometry;

    /** Interleaved per-instance layout of this batch. */
    readonly layout: SpriteInstanceLayout;
    /** Interleaved per-instance buffer (all instance attributes of this batch). */
    instanceBuffer!: InstancedInterleavedBuffer;

    protected constructor(settings: VFXBatchSettings) {
        super(settings);
        this.maxParticles = 1000;
        this.layout = getSpriteInstanceLayout(settings.renderMode);
    }

    buildExpandableBuffers(): void {
        const layout = this.layout;
        this.instanceBuffer = new InstancedInterleavedBuffer(
            new Float32Array(this.maxParticles * layout.stride),
            layout.stride,
            1
        );
        this.instanceBuffer.setUsage(DynamicDrawUsage);
        for (const attribute of layout.attributes) {
            this.geometry.setAttribute(
                attribute.name,
                new InterleavedBufferAttribute(this.instanceBuffer, attribute.itemSize, attribute.offset)
            );
        }
    }

    setupBuffers(): void {
        if (this.geometry) this.geometry.dispose();
        this.geometry = new InstancedBufferGeometry();
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

        const layout = this.layout;
        const stride = layout.stride;
        const oOffset = layout.offset;
        const oRotation = layout.rotation;
        const oSize = layout.size;
        const oUvTile = layout.uvTile;
        const oColor = layout.color;
        const oVelocity = layout.velocity;
        const isMesh = this.settings.renderMode === RenderMode.Mesh;
        const array = this.instanceBuffer.array as Float32Array;

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

        if (index > 0) {
            // upload only the part of the buffer that is actually used this frame
            this.instanceBuffer.clearUpdateRanges();
            this.instanceBuffer.addUpdateRange(0, index * stride);
            this.instanceBuffer.needsUpdate = true;
        }
    }

    dispose() {
        this.geometry.dispose();
    }
}
