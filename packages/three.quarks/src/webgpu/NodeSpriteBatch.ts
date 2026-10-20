import {Texture} from 'three';
import {RenderMode, SpriteBatch} from 'three.quarks';
import {ParticleMeshPhysicalNodeMaterial} from './materials/ParticleMeshPhysicalNodeMaterial';
import {ParticleMeshStandardNodeMaterial} from './materials/ParticleMeshStandardNodeMaterial';
import {ParticleSpriteNodeMaterial} from './materials/ParticleSpriteNodeMaterial';
import {particleColor, tileUVContext} from './nodes/ParticleNodes';

/**
 * A {@link SpriteBatch} that renders with a node material, for three's WebGPURenderer.
 */
export class NodeSpriteBatch extends SpriteBatch {
    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;

        const material = this.settings.material;
        const tiled = this.settings.uTileCount > 1 || this.settings.vTileCount > 1;
        if (
            this.settings.renderMode === RenderMode.Mesh &&
            (material.type === 'MeshStandardMaterial' || material.type === 'MeshPhysicalMaterial')
        ) {
            const litMaterial =
                material.type === 'MeshStandardMaterial'
                    ? new ParticleMeshStandardNodeMaterial()
                    : new ParticleMeshPhysicalNodeMaterial();
            // Takes the material's properties as WebGPURenderer does when it renders a classic material.
            for (const key in material) {
                if (key !== 'uuid') (litMaterial as any)[key] = (material as any)[key];
            }
            litMaterial.vertexColors = true;
            litMaterial.uTileCount = this.settings.uTileCount;
            litMaterial.vTileCount = this.settings.vTileCount;
            if (tiled) {
                litMaterial.contextNode = tileUVContext;
            }
            this.material = litMaterial;
            return;
        }

        const map: Texture | null = (material as any).map ?? null;
        this.material = new ParticleSpriteNodeMaterial({
            renderMode: this.settings.renderMode,
            colorNode: particleColor(map !== null, tiled, this.settings.blendTiles),
            map: map,
            uTileCount: this.settings.uTileCount,
            vTileCount: this.settings.vTileCount,
            useColorAsAlpha: material.defines !== undefined && material.defines['USE_COLOR_AS_ALPHA'] !== undefined,
            softParticles: this.settings.softParticles,
            softNearFade: this.settings.softNearFade,
            softFarFade: this.settings.softFarFade,
            fog: false,
            transparent: material.transparent,
            depthWrite: !material.transparent,
            blending: material.blending,
            blendDst: material.blendDst,
            blendSrc: material.blendSrc,
            blendEquation: material.blendEquation,
            premultipliedAlpha: material.premultipliedAlpha,
            side: material.side,
            alphaTest: material.alphaTest,
            depthTest: material.depthTest,
        });
    }

    applyDepthTexture(depthTexture: Texture | null): void {
        // Only the unlit material fades soft particles; the WebGL lit shader has no soft-particle code either.
        const material = this.material;
        if (
            this.settings.softParticles &&
            material instanceof ParticleSpriteNodeMaterial &&
            material.depthTexture !== depthTexture
        ) {
            material.depthTexture = depthTexture;
            material.needsUpdate = true;
        }
    }
}
