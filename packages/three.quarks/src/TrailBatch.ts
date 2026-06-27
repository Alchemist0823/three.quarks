import {IParticleSystem, Matrix3, Matrix4, Quaternion, RecordState, TrailParticle, Vector2, Vector3} from 'quarks.core';
import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    DynamicDrawUsage,
    IUniform,
    ShaderMaterial,
    Uniform,
    UniformsUtils,
} from 'three';

import {VFXBatchSettings} from './BatchedRenderer';
import trail_frag from './shaders/trail_frag.glsl';
import trail_vert from './shaders/trail_vert.glsl';
import {getMaterialUVChannelName, updateBufferAttribute} from './util/ThreeUtil';
import {RenderMode, VFXBatch} from './VFXBatch';

const DEFAULT_MATERIAL_UNIFORMS = {
    lineWidth: {value: 1},
    map: {value: null},
    useMap: {value: 0},
    alphaMap: {value: null},
    useAlphaMap: {value: 0},
    resolution: {value: new Vector2(1, 1)},
    sizeAttenuation: {value: 1},
    visibility: {value: 1},
    alphaTest: {value: 0},
} satisfies Record<string, IUniform>;

/**
 * A VFX batch that renders trails.
 */
export class TrailBatch extends VFXBatch {
    declare geometry: BufferGeometry;

    private readonly _vA: Vector3 = new Vector3();
    private readonly _vB: Vector3 = new Vector3();
    private readonly _vC: Vector3 = new Vector3();
    private readonly _qA: Quaternion = new Quaternion();
    private readonly _visibleSystems: IParticleSystem[] = [];

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
        this.geometry?.dispose();
        this.geometry = new BufferGeometry();

        this.indexBuffer = new BufferAttribute(new Uint32Array(this.maxParticles * 6), 1);
        this.indexBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setIndex(this.indexBuffer);

        this.positionBuffer = this.assignBufferAttribute('position', this.maxParticles * 6, 3);
        this.previousBuffer = this.assignBufferAttribute('previous', this.maxParticles * 6, 3);
        this.nextBuffer = this.assignBufferAttribute('next', this.maxParticles * 6, 3);
        this.widthBuffer = this.assignBufferAttribute('width', this.maxParticles * 2, 1);
        this.sideBuffer = this.assignBufferAttribute('side', this.maxParticles * 2, 1);
        this.uvBuffer = this.assignBufferAttribute('uv', this.maxParticles * 4, 2);
        this.colorBuffer = this.assignBufferAttribute('color', this.maxParticles * 8, 4);
    }

    expandBuffers(target: number): void {
        while (target >= this.maxParticles) {
            this.maxParticles *= 2;
        }

        this.setupBuffers();
    }

    rebuildMaterial(): void {
        if (this.settings.renderMode !== RenderMode.Trail) {
            throw new Error(`[TrailBatch] Unsupported render mode: ${this.settings.renderMode}`);
        }

        this.layers.mask = this.settings.layers.mask;

        const uniforms: Record<string, IUniform> = UniformsUtils.clone(DEFAULT_MATERIAL_UNIFORMS);
        const material = this.settings.material as any;
        const defines: {[b: string]: string} = {USE_UV: '', USE_COLOR_ALPHA: ''};

        if (material.map) {
            defines['USE_MAP'] = '';
            defines['MAP_UV'] = getMaterialUVChannelName(material.map.channel);

            uniforms['map'] = new Uniform(material.map);
            uniforms['mapTransform'] = new Uniform(new Matrix3().copy(material.map.matrix));
        }

        if (material.defines && material.defines['USE_COLOR_AS_ALPHA'] !== undefined) {
            defines['USE_COLOR_AS_ALPHA'] = '';
        }

        this.material = new ShaderMaterial({
            uniforms: uniforms,
            defines: defines,
            vertexShader: trail_vert,
            fragmentShader: trail_frag,
            transparent: material.transparent,
            depthWrite: !material.transparent,
            side: material.side,
            blending: material.blending || AdditiveBlending,
            blendDst: material.blendDst,
            blendSrc: material.blendSrc,
            blendEquation: material.blendEquation,
            premultipliedAlpha: material.premultipliedAlpha,
        });
    }

    update(): void {
        let vertexIndex = 0;
        let triangleCount = 0;

        const visibleSystems = this.collectVisibleSystems(this._visibleSystems);
        const particleCount = this.countTrailPoints(visibleSystems);

        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        const {uTileCount, vTileCount} = this.settings;
        const tileWidth = 1 / uTileCount;
        const tileHeight = 1 / vTileCount;

        const translation = this._vB;
        const rotation = this._qA;
        const scale = this._vC;

        for (const system of visibleSystems) {
            this.updateEmitterWorldMatrix(system);

            const worldSpace = system.worldSpace;
            const emitterMatrix = system.emitter.matrixWorld;
            emitterMatrix.decompose(translation, rotation, scale);

            const objectScale = (Math.abs(scale.x) + Math.abs(scale.y) + Math.abs(scale.z)) / 3;

            for (let j = 0; j < system.particleNum; j++) {
                const particle = system.particles[j] as TrailParticle;
                const trailLength = particle.previous.length;
                if (trailLength === 0) continue;

                const iter = particle.previous.values();
                let curIter = iter.next();

                // Duplicate the first and last records at the trail ends for stable shader tangents.
                let previous: RecordState = curIter.value as RecordState;
                let current: RecordState = previous;
                let next: RecordState;

                if (!curIter.done) curIter = iter.next();

                if (curIter.value !== undefined) {
                    next = curIter.value;
                } else {
                    next = current;
                }

                const parentMatrix = particle.parentMatrix;
                const col = particle.uvTile % vTileCount;
                const row = Math.floor(particle.uvTile / vTileCount + 0.001);

                for (let trailIndex = 0; trailIndex < trailLength; trailIndex++, vertexIndex += 2) {
                    this.writeTrailPosition(
                        this.positionBuffer,
                        vertexIndex,
                        current.position,
                        worldSpace,
                        parentMatrix,
                        emitterMatrix
                    );

                    this.writeTrailPosition(
                        this.previousBuffer,
                        vertexIndex,
                        previous.position,
                        worldSpace,
                        parentMatrix,
                        emitterMatrix
                    );

                    this.writeTrailPosition(
                        this.nextBuffer,
                        vertexIndex,
                        next.position,
                        worldSpace,
                        parentMatrix,
                        emitterMatrix
                    );

                    const width = !worldSpace && !parentMatrix ? current.size * objectScale : current.size;
                    const u = (trailIndex / trailLength + col) * tileWidth;
                    const nextVertexIndex = vertexIndex + 1;

                    this.sideBuffer.setX(vertexIndex, 1);
                    this.sideBuffer.setX(nextVertexIndex, -1);

                    this.widthBuffer.setX(vertexIndex, width);
                    this.widthBuffer.setX(nextVertexIndex, width);

                    this.uvBuffer.setXY(vertexIndex, u, (vTileCount - row - 1) * tileHeight);
                    this.uvBuffer.setXY(nextVertexIndex, u, (vTileCount - row) * tileHeight);

                    this.colorBuffer.setXYZW(
                        vertexIndex,
                        current.color.x,
                        current.color.y,
                        current.color.z,
                        current.color.w
                    );
                    this.colorBuffer.setXYZW(
                        nextVertexIndex,
                        current.color.x,
                        current.color.y,
                        current.color.z,
                        current.color.w
                    );

                    if (trailIndex + 1 < trailLength) {
                        this.writeTrailIndices(vertexIndex, triangleCount);
                        triangleCount += 2;
                    }

                    previous = current;
                    current = next;

                    if (curIter.done) continue;

                    curIter = iter.next();

                    if (curIter.value !== undefined) {
                        next = curIter.value;
                    }
                }
            }
        }

        this.updateBufferRanges(vertexIndex, triangleCount);
    }

    private assignBufferAttribute(name: string, length: number, itemSize: number): BufferAttribute {
        const attribute = new BufferAttribute(new Float32Array(length), itemSize);
        attribute.setUsage(DynamicDrawUsage);

        this.geometry.setAttribute(name, attribute);

        return attribute;
    }

    private countTrailPoints(systems: IParticleSystem[]): number {
        let particleCount = 0;

        for (const system of systems) {
            for (let j = 0; j < system.particleNum; j++) {
                particleCount += (system.particles[j] as TrailParticle).previous.length * 2;
            }
        }

        return particleCount;
    }

    private writeTrailIndices(vertexIndex: number, triangleCount: number): void {
        const triangleOffset = triangleCount * 3;

        this.indexBuffer.setX(triangleOffset, vertexIndex);
        this.indexBuffer.setX(triangleOffset + 1, vertexIndex + 1);
        this.indexBuffer.setX(triangleOffset + 2, vertexIndex + 2);
        this.indexBuffer.setX(triangleOffset + 3, vertexIndex + 2);
        this.indexBuffer.setX(triangleOffset + 4, vertexIndex + 1);
        this.indexBuffer.setX(triangleOffset + 5, vertexIndex + 3);
    }

    private updateBufferRanges(vertexIndex: number, triangleCount: number): void {
        const vertexIndexTimesThree = vertexIndex * 3;
        const triangleOffset = triangleCount * 3;

        updateBufferAttribute(this.positionBuffer, 0, vertexIndexTimesThree);
        updateBufferAttribute(this.previousBuffer, 0, vertexIndexTimesThree);
        updateBufferAttribute(this.nextBuffer, 0, vertexIndexTimesThree);
        updateBufferAttribute(this.sideBuffer, 0, vertexIndex);
        updateBufferAttribute(this.widthBuffer, 0, vertexIndex);
        updateBufferAttribute(this.uvBuffer, 0, vertexIndex * 2);
        updateBufferAttribute(this.colorBuffer, 0, vertexIndex * 4);
        updateBufferAttribute(this.indexBuffer, 0, triangleOffset);

        this.geometry.setDrawRange(0, triangleOffset);
    }

    private writeTrailPosition(
        buffer: BufferAttribute,
        index: number,
        position: Vector3,
        worldSpace: boolean,
        parentMatrix: Matrix4 | undefined,
        emitterMatrix: Matrix4
    ): void {
        const transformed = worldSpace ? position : this._vA.copy(position).applyMatrix4(parentMatrix ?? emitterMatrix);

        buffer.setXYZ(index, transformed.x, transformed.y, transformed.z);
        buffer.setXYZ(index + 1, transformed.x, transformed.y, transformed.z);
    }

    dispose() {
        this.geometry.dispose();
        this._visibleSystems.length = 0;
    }
}
