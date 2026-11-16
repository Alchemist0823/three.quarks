import {
    BufferAttribute,
    BufferGeometry,
    DynamicDrawUsage,
    InterleavedBuffer,
    InterleavedBufferAttribute,
    Object3D,
} from 'three';
import {Quaternion, RecordState, TrailParticle, Vector3} from 'quarks.core';
import type {VFXBatchSettings} from './BaseBatchedRenderer';
import {VFXBatch} from './VFXBatch';
import {TRAIL_VERTEX_LAYOUT} from './BatchLayouts';

/**
 * Renderer-agnostic trail batch.
 *
 * Builds the trail ribbon geometry on the CPU into one interleaved vertex buffer
 * (position, previous, next, side, width, uv, color) and an index buffer. 16 bit indices are used
 * while the vertex capacity allows it, which halves index upload bandwidth for typical scenes.
 * Concrete subclasses only build the material: {@link TrailBatch} (WebGL / GLSL) and
 * `WebGPUTrailBatch` (WebGPU / TSL).
 */
export abstract class BaseTrailBatch extends VFXBatch {
    declare geometry: BufferGeometry;

    /** Interleaved per-vertex buffer. */
    vertexBuffer!: InterleavedBuffer;
    /** Index buffer (Uint16Array or Uint32Array depending on capacity). */
    indexBuffer!: BufferAttribute;

    protected constructor(settings: VFXBatchSettings) {
        super(settings);
        this.maxParticles = 10000;
    }

    setupBuffers(): void {
        if (this.geometry) this.geometry.dispose();
        this.geometry = new BufferGeometry();
        // three defaults to an infinite draw range; draw nothing until the first update() fills the buffers
        this.geometry.setDrawRange(0, 0);

        const vertexCapacity = this.maxParticles * 2;
        const indexArray =
            vertexCapacity <= 65536 ? new Uint16Array(this.maxParticles * 6) : new Uint32Array(this.maxParticles * 6);
        this.indexBuffer = new BufferAttribute(indexArray, 1);
        this.indexBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setIndex(this.indexBuffer);

        const layout = TRAIL_VERTEX_LAYOUT;
        this.vertexBuffer = new InterleavedBuffer(new Float32Array(vertexCapacity * layout.stride), layout.stride);
        this.vertexBuffer.setUsage(DynamicDrawUsage);
        for (const attribute of layout.attributes) {
            this.geometry.setAttribute(
                attribute.name,
                new InterleavedBufferAttribute(this.vertexBuffer, attribute.itemSize, attribute.offset)
            );
        }
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

    update() {
        let index = 0;
        let triangles = 0;

        let particleCount = 0;
        const visibleSystems = this.collectVisibleSystems();
        for (let s = 0; s < visibleSystems.length; s++) {
            const system = visibleSystems[s];
            for (let j = 0; j < system.particleNum; j++) {
                particleCount += (system.particles[j] as TrailParticle).previous.length * 2;
            }
        }
        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        const layout = TRAIL_VERTEX_LAYOUT;
        const stride = layout.stride;
        const oPosition = layout.position;
        const oPrevious = layout.previous;
        const oNext = layout.next;
        const oSide = layout.side;
        const oWidth = layout.width;
        const oUv = layout.uv;
        const oColor = layout.color;
        const array = this.vertexBuffer.array as Float32Array;
        const indices = this.indexBuffer.array as Uint16Array | Uint32Array;

        const uTileCount = this.settings.uTileCount;
        const vTileCount = this.settings.vTileCount;
        const tileWidth = 1 / uTileCount;
        const tileHeight = 1 / vTileCount;

        for (let s = 0; s < visibleSystems.length; s++) {
            const system = visibleSystems[s];
            const emitter = system.emitter as unknown as Object3D;
            if (emitter.updateMatrixWorld) {
                emitter.updateWorldMatrix(true, false);
                emitter.updateMatrixWorld(true);
            }
            const rotation = this.quaternion_;
            const translation = this.vector2_;
            const scale = this.vector3_;
            system.emitter.matrixWorld.decompose(translation, rotation, scale);
            const objectScale = (Math.abs(scale.x) + Math.abs(scale.y) + Math.abs(scale.z)) / 3;

            const worldSpace = system.worldSpace;
            const emitterMatrix = system.emitter.matrixWorld.elements;
            const particles = system.particles;
            const particleNum = system.particleNum;

            for (let j = 0; j < particleNum; j++) {
                const particle = particles[j] as TrailParticle;
                const col = particle.uvTile % vTileCount;
                const row = Math.floor(particle.uvTile / vTileCount + 0.001);
                const e = worldSpace ? null : particle.parentMatrix ? particle.parentMatrix.elements : emitterMatrix;
                const widthScale = worldSpace || particle.parentMatrix ? 1 : objectScale;
                const trailLength = particle.previous.length;

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
                for (let i = 0; i < trailLength; i++, index += 2) {
                    const b0 = index * stride;
                    const b1 = b0 + stride;

                    writePoint(array, b0 + oPosition, b1 + oPosition, current.position, e);
                    writePoint(array, b0 + oPrevious, b1 + oPrevious, previous.position, e);
                    writePoint(array, b0 + oNext, b1 + oNext, next.position, e);

                    array[b0 + oSide] = 1;
                    array[b1 + oSide] = -1;

                    const width = current.size * widthScale;
                    array[b0 + oWidth] = width;
                    array[b1 + oWidth] = width;

                    const u = (i / trailLength + col) * tileWidth;
                    array[b0 + oUv] = u;
                    array[b0 + oUv + 1] = (vTileCount - row - 1) * tileHeight;
                    array[b1 + oUv] = u;
                    array[b1 + oUv + 1] = (vTileCount - row) * tileHeight;

                    const color = current.color;
                    array[b0 + oColor] = color.x;
                    array[b0 + oColor + 1] = color.y;
                    array[b0 + oColor + 2] = color.z;
                    array[b0 + oColor + 3] = color.w;
                    array[b1 + oColor] = color.x;
                    array[b1 + oColor + 1] = color.y;
                    array[b1 + oColor + 2] = color.z;
                    array[b1 + oColor + 3] = color.w;

                    if (i + 1 < trailLength) {
                        const t = triangles * 3;
                        indices[t] = index;
                        indices[t + 1] = index + 1;
                        indices[t + 2] = index + 2;
                        indices[t + 3] = index + 2;
                        indices[t + 4] = index + 1;
                        indices[t + 5] = index + 3;
                        triangles += 2;
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

        this.vertexBuffer.clearUpdateRanges();
        this.vertexBuffer.addUpdateRange(0, index * stride);
        this.vertexBuffer.needsUpdate = true;

        this.indexBuffer.clearUpdateRanges();
        this.indexBuffer.addUpdateRange(0, triangles * 3);
        this.indexBuffer.needsUpdate = true;

        this.geometry.setDrawRange(0, triangles * 3);
    }

    dispose() {
        this.geometry.dispose();
    }
}

/**
 * Writes the (optionally transformed) point into two consecutive vertices (both ribbon sides).
 */
function writePoint(
    array: Float32Array,
    o0: number,
    o1: number,
    p: {x: number; y: number; z: number},
    e: ArrayLike<number> | null
) {
    let x = p.x,
        y = p.y,
        z = p.z;
    if (e !== null) {
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
        const tx = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        const ty = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        const tz = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
        x = tx;
        y = ty;
        z = tz;
    }
    array[o0] = x;
    array[o0 + 1] = y;
    array[o0 + 2] = z;
    array[o1] = x;
    array[o1 + 1] = y;
    array[o1 + 2] = z;
}
