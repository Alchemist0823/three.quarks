import {MeshPhysicalNodeMaterial} from 'three/webgpu';
import type {Node, NodeBuilder} from 'three/webgpu';
import {transformMeshParticle} from '../nodes/ParticleNodes';

/**
 * A MeshPhysicalNodeMaterial for mesh particles: each instance of the mesh is placed by {@link transformMeshParticle}.
 */
export class ParticleMeshPhysicalNodeMaterial extends MeshPhysicalNodeMaterial {
    static get type() {
        return 'ParticleMeshPhysicalNodeMaterial';
    }

    /**
     * Number of horizontal tiles in the textures, read by {@link tileUVContext}.
     * @type {number}
     */
    uTileCount = 1;

    /**
     * Number of vertical tiles in the textures, read by {@link tileUVContext}.
     * @type {number}
     */
    vTileCount = 1;

    copy(source: ParticleMeshPhysicalNodeMaterial): this {
        this.uTileCount = source.uTileCount;
        this.vTileCount = source.vTileCount;
        return super.copy(source);
    }

    // three keys numeric properties only as zero or nonzero, but an opaque material writes alpha 1 only with
    // NormalBlending.
    customProgramCacheKey(): string {
        return `${super.customProgramCacheKey()}:${this.blending}`;
    }

    setupPosition(builder: NodeBuilder): Node {
        const position = super.setupPosition(builder);
        transformMeshParticle(builder);
        return position;
    }

    // three builds normals outside the material's context; the tile context (see tileUVContext) applies to them too.
    setupNormal(): Node {
        const normal = super.setupNormal() as Node<'vec3'>;
        return this.contextNode ? normal.context(this.contextNode.value) : normal;
    }

    setupClearcoatNormal(): Node {
        const normal = super.setupClearcoatNormal() as Node<'vec3'>;
        return this.contextNode ? normal.context(this.contextNode.value) : normal;
    }
}
