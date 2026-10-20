import {AdditiveBlending, BufferGeometry, DynamicDrawUsage, Material, Sphere, Texture, Vector3} from 'three';
import {StorageBufferAttribute} from 'three/webgpu';
import {storage} from 'three/tsl';
import {Matrix4, TrailBatch, TrailParticle} from 'three.quarks';
import {ParticleTrailNodeMaterial} from './materials/ParticleTrailNodeMaterial';
import {trailColor} from './nodes/ParticleNodes';

/**
 * A {@link TrailBatch} that renders with a node material, for three's WebGPURenderer. Each trail point is uploaded
 * once, as three vec4 in a storage buffer (see {@link trailVertex}), where the WebGL batch uploads two vertices that
 * each repeat the neighboring points, and an index buffer.
 */
export class NodeTrailBatch extends TrailBatch {
    declare geometry: BufferGeometry;

    // The trail points; maxParticles counts points here.
    private points!: StorageBufferAttribute;

    setupBuffers(): void {
        if (this.geometry) this.geometry.dispose();
        this.geometry = new BufferGeometry();
        this.points = new StorageBufferAttribute(new Float32Array(this.maxParticles * 12), 4);
        this.points.setUsage(DynamicDrawUsage);
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;

        const material = this.settings.material;
        const map: Texture | null = (material as any).map ?? null;
        // setPBO: the WebGL 2 backend reads the points from a texture, as it reads storage by index. The name keeps
        // the generated shader the same for every trail batch, so they share one program.
        const pointsNode = storage(this.points, 'vec4', this.points.count)
            .toReadOnly()
            .setPBO(true)
            .setName('trailPoints');
        this.material = new ParticleTrailNodeMaterial({
            pointsNode: pointsNode,
            colorNode: trailColor(pointsNode, map !== null),
            map: map,
            fog: false,
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

    update() {
        const systems = this.getVisibleSystems();
        let pointCount = 0;
        for (const system of systems) {
            for (let j = 0; j < system.particleNum; j++) {
                pointCount += (system.particles[j] as TrailParticle).previous.length;
            }
        }
        if (pointCount > this.maxParticles) {
            this.expandBuffers(pointCount);
            (this.material as Material).dispose();
            this.rebuildMaterial();
        }

        // The same values as the WebGL batch, once per point.
        const data = this.points.array as Float32Array;
        const uTileCount = this.settings.uTileCount;
        const vTileCount = this.settings.vTileCount;
        const tileWidth = 1 / uTileCount;
        const tileHeight = 1 / vTileCount;
        let offset = 0;
        for (const system of systems) {
            const emitter = system.emitter as any;
            if (emitter.updateMatrixWorld) {
                emitter.updateWorldMatrix(true, false);
                emitter.updateMatrixWorld(true);
            }
            system.emitter.matrixWorld.decompose(this.vector2_, this.quaternion_, this.vector3_);
            const scale = this.vector3_;
            const objectScale = (Math.abs(scale.x) + Math.abs(scale.y) + Math.abs(scale.z)) / 3;

            for (let j = 0; j < system.particleNum; j++) {
                const particle = system.particles[j] as TrailParticle;
                const col = particle.uvTile % vTileCount;
                const row = Math.floor(particle.uvTile / vTileCount + 0.001);
                const length = particle.previous.length;
                let i = 0;
                for (const record of particle.previous.values()) {
                    let position = record.position;
                    let width = record.size;
                    if (!system.worldSpace) {
                        position = this.vector_
                            .copy(record.position)
                            .applyMatrix4(particle.parentMatrix ?? (system.emitter.matrixWorld as unknown as Matrix4));
                        if (!particle.parentMatrix) width *= objectScale;
                    }
                    data[offset] = position.x;
                    data[offset + 1] = position.y;
                    data[offset + 2] = position.z;
                    data[offset + 3] = width;
                    data[offset + 4] = record.color.x;
                    data[offset + 5] = record.color.y;
                    data[offset + 6] = record.color.z;
                    data[offset + 7] = record.color.w;
                    data[offset + 8] = (i / length + col) * tileWidth;
                    data[offset + 9] = (vTileCount - row - 1) * tileHeight;
                    data[offset + 10] = (vTileCount - row) * tileHeight;
                    data[offset + 11] = (i === 0 ? 1 : 0) + (i === length - 1 ? 2 : 0);
                    offset += 12;
                    i++;
                }
            }
        }
        this.points.clearUpdateRanges();
        this.points.addUpdateRange(0, offset);
        this.points.needsUpdate = true;
        // three's WebGL 2 backend copies the points into this texture once and refreshes it only after a compute pass.
        const pbo = (this.points as StorageBufferAttribute & {pbo?: Texture}).pbo;
        if (pbo) pbo.needsUpdate = true;
        this.geometry.setDrawRange(0, (offset / 12) * 6);

        // three bounds a geometry from its positions once, at its first render; this one has no position attribute,
        // so it is bounded here the same way, from every point slot, for sorting among transparent objects.
        if (this.geometry.boundingSphere === null) {
            this.geometry.boundingSphere = boundingSphere(data);
        }
    }

    // Trails have no soft particles, in the WebGL batches either.
    applyDepthTexture(): void {}
}

const point = new Vector3();

// The bounding sphere of the positions in the points array, computed as BufferGeometry.computeBoundingSphere does.
function boundingSphere(data: Float32Array): Sphere {
    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < data.length; i += 12) {
        point.set(data[i], data[i + 1], data[i + 2]);
        min.min(point);
        max.max(point);
    }
    const sphere = new Sphere(min.add(max).multiplyScalar(0.5), 0);
    let radiusSq = 0;
    for (let i = 0; i < data.length; i += 12) {
        radiusSq = Math.max(radiusSq, sphere.center.distanceToSquared(point.set(data[i], data[i + 1], data[i + 2])));
    }
    sphere.radius = Math.sqrt(radiusSq);
    return sphere;
}
