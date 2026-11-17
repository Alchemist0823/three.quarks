/* eslint-disable @typescript-eslint/no-explicit-any */
import {MeshPhysicalNodeMaterial, MeshStandardNodeMaterial, NodeMaterial} from 'three/webgpu';
import {
    Fn,
    If,
    all,
    attribute,
    cameraProjectionMatrix,
    equal,
    float,
    modelViewMatrix,
    normalLocal,
    normalize,
    positionLocal,
    sRGBTransferOETF,
    select,
    transpose,
    vec2,
    vec4,
} from 'three/tsl';
import type {Material, Texture} from 'three';
import {RenderMode} from 'three.quarks';
import {
    applyParticleMeshTransform,
    billboardPositionView,
    decodeDisplayColor,
    inFrontOfScene,
    materialProperty,
    materialTextureAt,
    sampleMap,
    softParticleFade,
    stretchedBillboardPositionView,
    tileUVContext,
    trailVertex,
} from './ParticleNodes';

type N = any;

/**
 * How particle colors are written to the framebuffer of `WebGPURenderer`.
 *
 * - `'webgl-compatible'` (default): particle colors / textures are treated as display (sRGB) values, exactly like
 *   the GLSL particle shaders do in `WebGLRenderer`. Effects authored for the WebGL renderer (and the quarks editor /
 *   Unity exports) look the same for every pixel a single particle covers.
 * - `'linear'`: particle colors are treated as linear values (physically based workflow; set
 *   `texture.colorSpace = SRGBColorSpace` on color textures yourself).
 * - `'display'`: raw display values, used by {@link QuarksCompositor}, which blends particles in a display-space
 *   target exactly like `WebGLRenderer` does.
 */
export type ParticleColorSpaceMode = 'webgl-compatible' | 'linear' | 'display';

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
    /** discard fragments behind `depthTexture` (display-space compositor: the particle target has no depth buffer) */
    manualDepthTest?: boolean;
}

const ONE = float(1.0);

function encodeColor(rgba: N, options: ParticleNodeMaterialOptions): N {
    if (options.colorSpaceMode === 'webgl-compatible') {
        return vec4(decodeDisplayColor(rgba.rgb, options.fastColorDecode), rgba.a);
    }
    return rgba;
}

// ---- unlit sprites / meshes ---------------------------------------------------------------------------------

interface SpriteGraph {
    color: N;
    mask: N | null;
}

const spriteGraphs = new Map<string, SpriteGraph>();

/**
 * The fragment graph of a sprite material. Materials with the same structure share one graph (and therefore one
 * shader build); the values come from the material through `materialReference()`.
 */
function spriteGraph(options: ParticleNodeMaterialOptions): SpriteGraph {
    const tiled = options.uTileCount > 1 || options.vTileCount > 1;
    const hasMap = options.map !== null;
    const blend = hasMap && tiled && options.blendTiles;
    const key = [
        hasMap,
        tiled,
        blend,
        options.colorAsAlpha,
        options.alphaTest > 0,
        options.softParticles,
        options.depthTexture !== null,
        options.colorSpaceMode,
        options.fastColorDecode,
        !!options.manualDepthTest,
    ].join('|');
    let graph = spriteGraphs.get(key);
    if (graph === undefined) {
        let color: N = attribute('color', 'vec4');
        if (hasMap) color = color.mul(sampleMap(tiled, blend));
        const diffuse = color.toVar('quarksDiffuse');

        let mask: N | null = null;
        if (options.alphaTest > 0) {
            // alphatest_fragment: discard if diffuse.a < alphaTest (evaluated before color-as-alpha)
            mask = diffuse.a.greaterThanEqual(materialProperty('quarksAlphaTest', 'float'));
        }
        if (options.manualDepthTest) {
            const visible = inFrontOfScene();
            mask = mask ? mask.and(visible) : visible;
        }

        let rgba: N = vec4(diffuse.rgb, options.colorAsAlpha ? diffuse.r : diffuse.a);
        if (options.softParticles) {
            rgba = rgba.mul(softParticleFade(options.depthTexture !== null));
        }
        graph = {color: encodeColor(rgba, options), mask};
        spriteGraphs.set(key, graph);
    }
    return graph;
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
    /** whether this material fades against the scene depth */
    readonly softParticles: boolean;

    // per-batch values, read by the shared node graph through materialReference()
    map: Texture | null;
    uTileCount: number;
    vTileCount: number;
    quarksAlphaTest: number;
    softNearFade: number;
    softInvFadeDistance: number;
    depthTexture: Texture | null;

    constructor(options: ParticleNodeMaterialOptions) {
        super();
        this.renderMode = options.renderMode;
        this.softParticles = options.softParticles;
        this.map = options.map;
        this.uTileCount = options.uTileCount;
        this.vTileCount = options.vTileCount;
        this.quarksAlphaTest = options.alphaTest;
        this.softNearFade = options.softNearFade;
        this.softInvFadeDistance = 1.0 / (options.softFarFade - options.softNearFade);
        this.depthTexture = options.depthTexture;
        this.lights = false;
        this.fog = false;

        const graph = spriteGraph(options);
        this.colorNode = graph.color;
        this.maskNode = graph.mask;
        this.opacityNode = ONE;
    }

    // three keys numeric properties only as zero / non-zero, but the vertex stage depends on the render mode and
    // an opaque material writes alpha 1 only with NormalBlending.
    customProgramCacheKey(): string {
        return `${super.customProgramCacheKey()}:${this.renderMode}:${this.blending}`;
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

    // The WebGL particle shaders never premultiply in the shader; `premultipliedAlpha` only selects the blend
    // factors. Keep that behaviour so effects blend identically.
    setupPremultipliedAlpha(_builder: N, outputNode: N): N {
        return outputNode;
    }
}

// ---- lit meshes ---------------------------------------------------------------------------------------------

/**
 * Copies the user facing properties of a classic material onto a node material (the same approach
 * `NodeLibrary.fromMaterial` uses), skipping identity / internal fields. Accessor backed properties
 * (`_alphaTest`, `_clearcoat`, ...) are copied through their public accessor.
 */
function copyMaterialProperties(target: Material, source: Material) {
    const skip = new Set(['uuid', 'id', 'type', 'name', 'version', 'userData', 'defines', 'onBeforeCompile']);
    for (const key in source) {
        let property = key;
        if (key.startsWith('_')) {
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

interface LitParticleOptions {
    uTileCount: number;
    vTileCount: number;
    displaySpace: boolean;
    manualDepthTest: boolean;
    depthTexture: Texture | null;
}

function setupLitParticle(material: N, source: Material, options: LitParticleOptions) {
    copyMaterialProperties(material, source);
    // the per-instance `color` attribute (vec4) goes through three's vertex color path, like USE_COLOR +
    // USE_COLOR_ALPHA in the WebGL shader; this keeps the map alpha intact for alpha test / transparency
    material.vertexColors = true;
    material.uTileCount = options.uTileCount;
    material.vTileCount = options.vTileCount;
    material.depthTexture = options.depthTexture;
    material.displaySpace = options.displaySpace;
    if (options.uTileCount > 1 || options.vTileCount > 1) {
        // every 2D texture of the material (map, normal map, roughness map, ...) samples the particle's tile
        material.contextNode = tileUVContext;
    }
    if (options.manualDepthTest) {
        material.maskNode = inFrontOfScene();
    }
}

function litSetupOutput(material: N, superSetupOutput: (builder: N, output: N) => N, builder: N, output: N): N {
    const result = superSetupOutput(builder, output);
    // display-space compositor: lit particles encode their color like the WebGL `colorspace_fragment` does
    return material.displaySpace ? (vec4 as N)(sRGBTransferOETF(result.rgb), result.a) : result;
}

/**
 * Lit mesh particle material (`MeshStandardMaterial` source). Port of `ParticleMeshStandardMaterial`.
 */
export class ParticleMeshStandardNodeMaterial extends MeshStandardNodeMaterial {
    static get type() {
        return 'ParticleMeshStandardNodeMaterial';
    }

    readonly isParticleMeshNodeMaterial = true;
    uTileCount = 1;
    vTileCount = 1;
    depthTexture: Texture | null = null;
    displaySpace = false;

    constructor(source: Material, options: LitParticleOptions) {
        super();
        setupLitParticle(this, source, options);
    }

    customProgramCacheKey(): string {
        return `${super.customProgramCacheKey()}:${this.blending}:${this.displaySpace}`;
    }

    setupPosition(builder: N): N {
        const result = (super.setupPosition as any)(builder);
        applyParticleMeshTransform(builder, positionLocal, normalLocal);
        return result;
    }

    // three builds normals outside the material's context; apply the tile context to normal maps too
    setupNormal(): N {
        const normal = (super.setupNormal as any)();
        return this.contextNode ? normal.context((this.contextNode as N).value) : normal;
    }

    setupOutput(builder: N, output: N): N {
        return litSetupOutput(this, (b, o) => (super.setupOutput as any)(b, o), builder, output);
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
    uTileCount = 1;
    vTileCount = 1;
    depthTexture: Texture | null = null;
    displaySpace = false;

    constructor(source: Material, options: LitParticleOptions) {
        super();
        setupLitParticle(this, source, options);
    }

    customProgramCacheKey(): string {
        return `${super.customProgramCacheKey()}:${this.blending}:${this.displaySpace}`;
    }

    setupPosition(builder: N): N {
        const result = (super.setupPosition as any)(builder);
        applyParticleMeshTransform(builder, positionLocal, normalLocal);
        return result;
    }

    setupNormal(): N {
        const normal = (super.setupNormal as any)();
        return this.contextNode ? normal.context((this.contextNode as N).value) : normal;
    }

    setupOutput(builder: N, output: N): N {
        return litSetupOutput(this, (b, o) => (super.setupOutput as any)(b, o), builder, output);
    }
}

// ---- trails -------------------------------------------------------------------------------------------------

function allEqual(a: N, b: N): N {
    return (all as N)((equal as N)(a, b));
}

/**
 * Trail (ribbon) material. Port of `trail_vert.glsl` / `trail_frag.glsl`: the ribbon is extruded in clip space
 * perpendicular to the projected trail direction. The ribbon vertices are decoded by vertex index from a storage
 * buffer holding one record per trail point (no vertex attributes, no index buffer; approach from PR #115).
 */
export class ParticleTrailNodeMaterial extends NodeMaterial {
    static get type() {
        return 'ParticleTrailNodeMaterial';
    }

    readonly isParticleTrailNodeMaterial = true;
    map: Texture | null;
    depthTexture: Texture | null;
    readonly pointsNode: N;

    constructor(options: ParticleNodeMaterialOptions, pointsNode: N) {
        super();
        this.lights = false;
        this.fog = false;
        this.map = options.map;
        this.depthTexture = options.depthTexture;
        this.pointsNode = pointsNode;

        const vertex = trailVertex(pointsNode);
        let color: N = vertex.color;
        if (options.map) color = color.mul(materialTextureAt('map', vertex.uv));
        this.colorNode = encodeColor(color, options);
        this.opacityNode = ONE;
        if (options.manualDepthTest) this.maskNode = inFrontOfScene();
    }

    customProgramCacheKey(): string {
        return `${super.customProgramCacheKey()}:${this.blending}`;
    }

    // the geometry has no position attribute: these replace the defaults that read it
    setupPosition(): N {
        return trailVertex(this.pointsNode).position;
    }

    setupPositionView(): N {
        return modelViewMatrix.mul(vec4(trailVertex(this.pointsNode).position, 1.0)).xyz;
    }

    setupModelViewProjection(): N {
        const vertex = trailVertex(this.pointsNode);
        return Fn(() => {
            const position = vertex.position.toVar();
            const previousPosition = vertex.previous.toVar();
            const nextPosition = vertex.next.toVar();
            const mvp = cameraProjectionMatrix.mul(modelViewMatrix);
            const clip = mvp.mul(vec4(position, 1.0)).toVar();
            const previousClip = mvp.mul(vec4(previousPosition, 1.0));
            const nextClip = mvp.mul(vec4(nextPosition, 1.0));

            // A neighbour stored at the same position takes the point's own projection, so the equality tests below
            // stay exact where the compiler rounds two projections of one position differently.
            const current = clip.xy.div(clip.w).toVar();
            const previous = select(
                allEqual(previousPosition, position),
                current,
                previousClip.xy.div(previousClip.w)
            ).toVar();
            const next = select(allEqual(nextPosition, position), current, nextClip.xy.div(nextClip.w)).toVar();

            const dir = (vec2 as N)().toVar();
            (If as N)(allEqual(next, current), () => {
                dir.assign(normalize(current.sub(previous)));
            })
                .ElseIf(allEqual(previous, current), () => {
                    dir.assign(normalize(next.sub(current)));
                })
                .Else(() => {
                    dir.assign(normalize(normalize(current.sub(previous)).add(normalize(next.sub(current)))));
                });

            // normal *= projectionMatrix (row-vector multiply == transpose(P) * normal)
            const normal = (transpose(cameraProjectionMatrix) as N).mul(
                (vec4 as N)(dir.y.negate().mul(vertex.width).mul(0.5), dir.x.mul(vertex.width).mul(0.5), 0.0, 1.0)
            );
            const widened = (vec4 as N)(clip.xy.add(normal.xy.mul(vertex.side)), clip.zw);
            // all six vertices of the empty segment after a trail's last point land on one spot
            return select(vertex.skipped, vec4(0.0), widened);
        })();
    }

    setupPremultipliedAlpha(_builder: N, outputNode: N): N {
        return outputNode;
    }
}
