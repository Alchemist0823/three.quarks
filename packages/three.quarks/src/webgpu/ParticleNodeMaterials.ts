/* eslint-disable @typescript-eslint/no-explicit-any */
import {MeshPhysicalNodeMaterial, MeshStandardNodeMaterial, NodeMaterial} from 'three/webgpu';
import {
    all,
    attribute,
    cameraProjectionMatrix,
    equal,
    float,
    floor,
    ceil,
    fract,
    modelViewMatrix,
    normalLocal,
    positionGeometry,
    positionLocal,
    select,
    transpose,
    uniform,
    uv,
    varying,
    vec4,
} from 'three/tsl';
import {Vector2} from 'three';
import type {Material, Texture} from 'three';
import {RenderMode} from 'three.quarks';
import {
    applyParticleMeshTransform,
    billboardPositionView,
    decodeDisplayColor,
    sampleTiled,
    softParticleFade,
    stretchedBillboardPositionView,
    tileUV,
} from './ParticleNodes';

type N = any;

/**
 * How particle colors are written to the (linear) framebuffer of `WebGPURenderer`.
 *
 * - `'webgl-compatible'` (default): particle colors / textures are treated as display (sRGB) values,
 *   exactly like the GLSL particle shaders do in `WebGLRenderer`. Effects authored for the WebGL
 *   renderer (and the quarks editor / Unity exports) look the same.
 * - `'linear'`: particle colors are treated as linear values (physically based workflow; set
 *   `texture.colorSpace = SRGBColorSpace` on color textures yourself).
 */
export type ParticleColorSpaceMode = 'webgl-compatible' | 'linear';

/**
 * Options shared by the particle node materials. They are derived from the batch settings.
 */
export interface ParticleNodeMaterialOptions {
    renderMode: RenderMode;
    map: Texture | null;
    uTileCount: number;
    vTileCount: number;
    blendTiles: boolean;
    colorAsAlpha: boolean;
    alphaTest: number;
    softParticles: boolean;
    softNearFade: number;
    softFarFade: number;
    depthTexture: Texture | null;
    colorSpaceMode: ParticleColorSpaceMode;
    /** use the polynomial sRGB decode instead of `pow` (mobile profile) */
    fastColorDecode: boolean;
}

/**
 * Builds the (frame blended) tile UV varyings. Computed in the vertex stage.
 */
function buildTileUVs(options: ParticleNodeMaterialOptions) {
    const tiled = options.uTileCount > 1 || options.vTileCount > 1;
    if (!tiled) {
        return {uvNode: uv(), uvNextNode: null, blendNode: null};
    }
    const tileCount = uniform(new Vector2(options.uTileCount, options.vTileCount));
    const uvTile = attribute('uvTile', 'float');
    const uvNode = varying(tileUV(uv(), floor(uvTile), tileCount), 'vQuarksUv');
    if (!options.blendTiles || !options.map) {
        return {uvNode, uvNextNode: null, blendNode: null};
    }
    const uvNextNode = varying(tileUV(uv(), ceil(uvTile), tileCount), 'vQuarksUvNext');
    const blendNode = varying(fract(uvTile), 'vQuarksUvBlend');
    return {uvNode, uvNextNode, blendNode};
}

/**
 * Unlit particle material for billboards, stretched billboards and unlit mesh particles.
 * Port of `particle_vert` / `stretched_bb_particle_vert` / `local_particle_vert` + `particle_frag`.
 */
export class ParticleSpriteNodeMaterial extends NodeMaterial {
    static get type() {
        return 'ParticleSpriteNodeMaterial';
    }

    readonly isParticleSpriteNodeMaterial = true;
    readonly renderMode: RenderMode;
    /** soft particle fade start (uniform) */
    readonly softNearFadeNode: N;
    /** 1 / (far fade - near fade) (uniform) */
    readonly softInvFadeDistanceNode: N;
    /** alpha test threshold (uniform) */
    readonly alphaTestValueNode: N;
    /** whether this material fades against the scene depth */
    readonly softParticles: boolean;

    constructor(options: ParticleNodeMaterialOptions) {
        super();
        this.renderMode = options.renderMode;
        this.softParticles = options.softParticles;
        this.lights = false;
        this.fog = false;

        this.softNearFadeNode = uniform(options.softNearFade);
        this.softInvFadeDistanceNode = uniform(1.0 / (options.softFarFade - options.softNearFade));
        this.alphaTestValueNode = uniform(options.alphaTest);

        const {uvNode, uvNextNode, blendNode} = buildTileUVs(options);

        let color: N = attribute('color', 'vec4');
        if (options.map) {
            color = color.mul(sampleTiled(options.map, uvNode, uvNextNode, blendNode));
        }
        const diffuse = color.toVar('quarksDiffuse');

        if (options.alphaTest > 0) {
            // alphatest_fragment: discard if diffuse.a < alphaTest (evaluated before color-as-alpha)
            this.maskNode = diffuse.a.greaterThanEqual(this.alphaTestValueNode);
        }

        let rgba: N = vec4(diffuse.rgb, options.colorAsAlpha ? diffuse.r : diffuse.a);
        if (options.softParticles) {
            rgba = rgba.mul(
                softParticleFade({
                    depthTexture: options.depthTexture,
                    nearFade: this.softNearFadeNode,
                    invFadeDistance: this.softInvFadeDistanceNode,
                })
            );
        }
        if (options.colorSpaceMode === 'webgl-compatible') {
            rgba = vec4(decodeDisplayColor(rgba.rgb, options.fastColorDecode), rgba.a);
        }
        this.colorNode = rgba;
        this.opacityNode = float(1.0);
    }

    setupPositionView(builder: N): N {
        switch (this.renderMode) {
            case RenderMode.BillBoard:
                return billboardPositionView('billboard');
            case RenderMode.HorizontalBillBoard:
                return billboardPositionView('horizontal');
            case RenderMode.VerticalBillBoard:
                return billboardPositionView('vertical');
            case RenderMode.StretchedBillBoard:
                return stretchedBillboardPositionView();
            default:
                return (super.setupPositionView as any)(builder);
        }
    }

    setupPosition(builder: N): N {
        const result = (super.setupPosition as any)(builder);
        if (this.renderMode === RenderMode.Mesh) {
            applyParticleMeshTransform(builder, positionLocal, normalLocal);
        }
        return result;
    }

    // The WebGL particle shaders never premultiply in the shader; `premultipliedAlpha` only selects
    // the blend factors. Keep that behaviour so effects blend identically.
    setupPremultipliedAlpha(_builder: N, outputNode: N): N {
        return outputNode;
    }
}

/**
 * Copies the user facing properties of a classic material onto a node material
 * (the same approach `NodeLibrary.fromMaterial` uses), skipping identity / internal fields.
 */
function copyMaterialProperties(target: Material, source: Material) {
    const skip = new Set(['uuid', 'id', 'type', 'name', 'version', 'userData', 'defines', 'onBeforeCompile']);
    for (const key in source) {
        let property = key;
        if (key.startsWith('_')) {
            // accessor backed fields (`_alphaTest` -> `alphaTest`, `_clearcoat`, `_transmission`, ...): copy
            // through the public accessor so version bookkeeping of the target material stays correct
            property = key.slice(1);
            if (!(property in target)) continue;
        }
        if (skip.has(property) || property.startsWith('is')) continue;
        const value = (source as any)[property];
        if (typeof value === 'function') continue;
        (target as any)[property] = value;
    }
    target.name = source.name;
}

function setupLitParticleColor(material: N, options: ParticleNodeMaterialOptions) {
    // The per-instance `color` attribute (vec4) is applied by three.js' own vertex color path
    // (`diffuseColor *= vertexColor()`), exactly like `USE_COLOR` + `USE_COLOR_ALPHA` in the WebGL
    // shader. This keeps the map alpha intact for alpha test / transparency.
    material.vertexColors = true;
    const tiled = options.uTileCount > 1 || options.vTileCount > 1;
    if (tiled && options.map) {
        const {uvNode, uvNextNode, blendNode} = buildTileUVs(options);
        const base = (vec4 as N)(uniform(material.color), 1.0);
        material.colorNode = base.mul(sampleTiled(options.map, uvNode, uvNextNode, blendNode));
    }
}

/**
 * Lit mesh particle material (`MeshStandardMaterial` source). Port of `ParticleMeshStandardMaterial`.
 */
export class ParticleMeshStandardNodeMaterial extends MeshStandardNodeMaterial {
    static get type() {
        return 'ParticleMeshStandardNodeMaterial';
    }

    readonly isParticleMeshNodeMaterial = true;

    constructor(source: Material, options: ParticleNodeMaterialOptions) {
        super();
        copyMaterialProperties(this, source);
        setupLitParticleColor(this, options);
    }

    setupPosition(builder: N): N {
        const result = (super.setupPosition as any)(builder);
        applyParticleMeshTransform(builder, positionLocal, normalLocal);
        return result;
    }
}

/**
 * Lit mesh particle material (`MeshPhysicalMaterial` source). Port of `ParticleMeshPhysicsMaterial`.
 */
export class ParticleMeshPhysicalNodeMaterial extends MeshPhysicalNodeMaterial {
    static get type() {
        return 'ParticleMeshPhysicalNodeMaterial';
    }

    readonly isParticleMeshNodeMaterial = true;

    constructor(source: Material, options: ParticleNodeMaterialOptions) {
        super();
        copyMaterialProperties(this, source);
        setupLitParticleColor(this, options);
    }

    setupPosition(builder: N): N {
        const result = (super.setupPosition as any)(builder);
        applyParticleMeshTransform(builder, positionLocal, normalLocal);
        return result;
    }
}

/**
 * Trail (ribbon) material. Port of `trail_vert.glsl` / `trail_frag.glsl`: the ribbon is extruded in
 * clip space perpendicular to the projected trail direction.
 */
export class ParticleTrailNodeMaterial extends NodeMaterial {
    static get type() {
        return 'ParticleTrailNodeMaterial';
    }

    readonly isParticleTrailNodeMaterial = true;
    /** global width multiplier (uniform, `lineWidth` in the GLSL shader) */
    readonly lineWidthNode: N;

    constructor(options: ParticleNodeMaterialOptions) {
        super();
        this.lights = false;
        this.fog = false;
        this.lineWidthNode = uniform(1.0);

        let color: N = attribute('color', 'vec4');
        if (options.map) {
            color = color.mul(sampleTiled(options.map, uv(), null, null));
        }
        if (options.colorSpaceMode === 'webgl-compatible') {
            color = vec4(decodeDisplayColor(color.rgb, options.fastColorDecode), color.a);
        }
        this.colorNode = color;
        this.opacityNode = float(1.0);
    }

    setupModelViewProjection(): N {
        const m = cameraProjectionMatrix.mul(modelViewMatrix);
        const finalPosition = m.mul(vec4(positionGeometry, 1.0));
        const prevPos = m.mul(vec4(attribute('previous', 'vec3'), 1.0));
        const nextPos = m.mul(vec4(attribute('next', 'vec3'), 1.0));

        // resolution is (1, 1) in the WebGL implementation => aspect 1
        const currentP = finalPosition.xy.div(finalPosition.w);
        const prevP = prevPos.xy.div(prevPos.w);
        const nextP = nextPos.xy.div(nextPos.w);

        const w = this.lineWidthNode.mul(attribute('width', 'float'));

        const dirA = currentP.sub(prevP).normalize();
        const dirB = nextP.sub(currentP).normalize();
        const dir = select(
            all(equal(nextP, currentP)),
            dirA,
            select(all(equal(prevP, currentP)), dirB, dirA.add(dirB).normalize())
        );

        // normal *= projectionMatrix  (row-vector multiply == transpose(P) * normal)
        const normal = (transpose(cameraProjectionMatrix) as N).mul(
            (vec4 as N)(dir.y.negate().mul(w).mul(0.5), dir.x.mul(w).mul(0.5), 0.0, 1.0)
        );
        const side = attribute('side', 'float');
        return (vec4 as N)(finalPosition.xy.add(normal.xy.mul(side)), finalPosition.zw);
    }

    setupPremultipliedAlpha(_builder: N, outputNode: N): N {
        return outputNode;
    }
}
