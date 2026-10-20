import {Texture} from 'three';
import {NodeMaterial} from 'three/webgpu';
import type {Node, NodeBuilder, NodeMaterialParameters} from 'three/webgpu';
import {
    attribute,
    cameraViewMatrix,
    cross,
    modelNormalMatrix,
    modelViewMatrix,
    modelWorldMatrix,
    normalize,
    positionGeometry,
    rotate,
    vec3,
    vec4,
} from 'three/tsl';
import {RenderMode} from 'three.quarks';
import {outputToWorkingColorSpace, softParticleFade, transformMeshParticle} from '../nodes/ParticleNodes';

export interface ParticleSpriteNodeMaterialParameters extends NodeMaterialParameters {
    renderMode?: RenderMode;
    map?: Texture | null;
    uTileCount?: number;
    vTileCount?: number;
    useColorAsAlpha?: boolean;
    softParticles?: boolean;
    depthTexture?: Texture | null;
    softNearFade?: number;
    softFarFade?: number;
}

/**
 * The unlit node material of sprite particles. In the billboard modes it places each instance of the quad at the
 * particle's `offset`, sized by `size` and turned by `rotation`, facing the camera as the render mode says;
 * `StretchedBillBoard` also reads `velocity` (the velocity scaled by the speed factor, and the length factor in `w`).
 * In `Mesh` mode each instance of the mesh is placed by {@link transformMeshParticle}. Its `colorNode` usually comes
 * from {@link particleColor}, which reads `map`, `uTileCount` and `vTileCount` from the material.
 */
export class ParticleSpriteNodeMaterial extends NodeMaterial {
    static get type() {
        return 'ParticleSpriteNodeMaterial';
    }

    private _renderMode: RenderMode = RenderMode.BillBoard;

    /**
     * The texture of the particles, a sheet of `uTileCount` by `vTileCount` tiles. Whether there is one, and whether it
     * has more than one tile, is fixed by the `colorNode` from {@link particleColor}.
     * @type {Texture | null}
     */
    map: Texture | null = null;

    /**
     * Number of horizontal tiles in `map`.
     * @type {number}
     */
    uTileCount = 1;

    /**
     * Number of vertical tiles in `map`.
     * @type {number}
     */
    vTileCount = 1;

    /**
     * Whether the red channel of the color is written as its alpha. Set `needsUpdate` after changing it.
     * @type {boolean}
     */
    useColorAsAlpha = false;

    /**
     * Whether the particles fade where they near the scene behind them. Set `needsUpdate` after changing it.
     * @type {boolean}
     */
    softParticles = false;

    /**
     * The scene's depth, rendered with the same camera, which soft particles fade into. null: for transparent
     * particles, the depth this render has drawn before them, the opaque objects; opaque particles are drawn hard.
     * Set `needsUpdate` when it changes between null and a texture.
     * @type {Texture | null}
     */
    depthTexture: Texture | null = null;

    /**
     * Distance in front of the scene's depth where a soft particle starts to show.
     * @type {number}
     */
    softNearFade = 0;

    /**
     * Distance in front of the scene's depth where a soft particle is fully visible.
     * @type {number}
     */
    softFarFade = 1;

    constructor(parameters?: ParticleSpriteNodeMaterialParameters) {
        super();
        this.setValues(parameters);
    }

    /**
     * The render mode, any but `Trail`. Changing it rebuilds the shader.
     * @type {RenderMode}
     */
    get renderMode(): RenderMode {
        return this._renderMode;
    }

    set renderMode(value: RenderMode) {
        if (this._renderMode !== value) {
            this._renderMode = value;
            this.needsUpdate = true;
        }
    }

    copy(source: ParticleSpriteNodeMaterial): this {
        this.renderMode = source.renderMode;
        this.map = source.map;
        this.uTileCount = source.uTileCount;
        this.vTileCount = source.vTileCount;
        this.useColorAsAlpha = source.useColorAsAlpha;
        this.softParticles = source.softParticles;
        this.depthTexture = source.depthTexture;
        this.softNearFade = source.softNearFade;
        this.softFarFade = source.softFarFade;
        return super.copy(source);
    }

    // three keys numeric properties only as zero or nonzero, but the shader depends on the render mode, and an opaque
    // material writes alpha 1 only with NormalBlending.
    customProgramCacheKey(): string {
        return `${super.customProgramCacheKey()}:${this.renderMode}:${this.blending}`;
    }

    // As the WebGL batches: the color-as-alpha swap and the soft fade come after the alpha test, and the color is
    // written unconverted.
    setupOutput(builder: NodeBuilder, outputNode: Node<'vec4'>): Node {
        let color = outputNode;
        if (this.useColorAsAlpha) {
            color = vec4(color.rgb, color.r);
        }
        // The frame's depth holds what was drawn before the particles; only for transparent particles is that the
        // opaque scene, so opaque ones fade only against a depth texture.
        if (this.softParticles && (this.depthTexture !== null || this.transparent)) {
            color = color.mul(softParticleFade(this.depthTexture !== null));
        }
        return super.setupOutput(builder, outputToWorkingColorSpace(color));
    }

    // premultipliedAlpha only selects the premultiplied blend factors, as in the WebGL batches.
    setupPremultipliedAlpha(_builder: NodeBuilder, outputNode: Node): Node {
        return outputNode;
    }

    setupPosition(builder: NodeBuilder): Node {
        const position = super.setupPosition(builder);
        if (this.renderMode === RenderMode.Mesh) {
            transformMeshParticle(builder);
        }
        return position;
    }

    setupPositionView(builder: NodeBuilder): Node {
        if (this.renderMode === RenderMode.Mesh) {
            return super.setupPositionView(builder);
        }

        const offset = attribute<'vec3'>('offset', 'vec3');
        const size = attribute<'vec3'>('size', 'vec3');

        if (this.renderMode === RenderMode.StretchedBillBoard) {
            const velocity = attribute<'vec4'>('velocity', 'vec4');
            const avgSize = size.x.add(size.y).mul(0.5);
            const mvPosition = modelViewMatrix.mul(vec4(offset, 1)).xyz;
            const viewVelocity = cameraViewMatrix.mul(vec4(modelNormalMatrix.mul(velocity.xyz), 0)).xyz;
            const lengthScale = velocity.w.div(viewVelocity.length()).add(1);
            return mvPosition
                .add(normalize(cross(mvPosition, viewVelocity)).mul(positionGeometry.y.mul(avgSize)))
                .sub(viewVelocity.mul(positionGeometry.x.add(0.5).mul(lengthScale).mul(avgSize)));
        }

        const rotated = rotate(positionGeometry.xy.mul(size.xy), attribute<'float'>('rotation', 'float'));
        switch (this.renderMode) {
            case RenderMode.HorizontalBillBoard: {
                const worldPosition = modelWorldMatrix
                    .mul(vec4(offset, 1))
                    .add(vec4(rotated.x, 0, rotated.y.negate(), 0));
                return cameraViewMatrix.mul(worldPosition).xyz;
            }
            case RenderMode.VerticalBillBoard: {
                const worldPosition = modelWorldMatrix.mul(vec4(offset, 1)).add(vec4(0, rotated.y, 0, 0));
                return cameraViewMatrix.mul(worldPosition).xyz.add(vec3(rotated.x, 0, 0));
            }
            default:
                return modelViewMatrix.mul(vec4(offset, 1)).xyz.add(vec3(rotated, 0));
        }
    }
}
