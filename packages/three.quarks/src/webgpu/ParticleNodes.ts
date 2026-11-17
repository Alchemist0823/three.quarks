/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TSL building blocks shared by the WebGPU particle node materials.
 *
 * Everything here is a port of the GLSL chunks used by the WebGL renderer (see `src/shaders`), written with
 * three.js' shading language so it compiles to WGSL on the WebGPU backend and to GLSL ES 3.0 on the WebGL2
 * fallback backend of `WebGPURenderer`.
 *
 * Per-batch values (map, tile counts, fade distances, alpha test, depth texture) are read from the material
 * through `materialReference()`, so all materials of one kind share one node graph and three builds their shader
 * once instead of once per batch (approach adopted from PR #115).
 */
import {LinearSRGBColorSpace} from 'three';
import type {Texture} from 'three';
import {MaterialReferenceNode} from 'three/webgpu';
import {
    Fn,
    attribute,
    cameraFar,
    cameraNear,
    cameraViewMatrix,
    ceil,
    context,
    cross,
    float,
    floor,
    fract,
    logarithmicDepthToViewZ,
    materialReference,
    mix,
    modelNormalMatrix,
    modelViewMatrix,
    modelWorldMatrix,
    orthographicDepthToViewZ,
    perspectiveDepthToViewZ,
    positionGeometry,
    positionView,
    sRGBTransferEOTF,
    screenUV,
    select,
    uint,
    uv,
    vec2,
    vec3,
    vec4,
    vertexIndex,
    vertexStage,
    viewportDepthTexture,
} from 'three/tsl';

type N = any;

/** A property of the material being drawn (shared across materials, value read per draw). */
export function materialProperty(name: string, type: string): N {
    return (materialReference as N)(name, type);
}

/**
 * A texture of the material that ignores the texture's own transform, as the WebGL batches sample their maps.
 */
class UntransformedTextureReferenceNode extends (MaterialReferenceNode as N) {
    setNodeType(uniformType: string): void {
        super.setNodeType(uniformType);
        (this as N).node.updateMatrix = false;
    }
}

/** A texture of the material, sampled at the given UV. */
export function materialTextureAt(name: string, uvNode: N): N {
    const reference = new (UntransformedTextureReferenceNode as N)(name, 'texture');
    return (context as N)(reference, {getUV: () => uvNode});
}

/**
 * Rotates vector `v` by unit quaternion `q` (`v' = v + 2 * cross(q.xyz, cross(q.xyz, v) + q.w * v)`).
 * Cheaper than building a rotation matrix in the vertex shader.
 */
export function rotateByQuaternion(q: N, v: N): N {
    const qv = q.xyz;
    return v.add(cross(qv, cross(qv, v).add(v.mul(q.w))).mul(2.0));
}

/**
 * Where a particle material reads the per-particle values from.
 *
 * The default source is the batch's per-instance attributes (CPU simulation, {@link attributeFields}). GPU simulated
 * systems read the simulation's storage buffer instead (`GPUParticleSimulation.createRenderFields()`); those values
 * must be wrapped in `vertexStage()` where the fragment stage uses them (`color`, `uvTile`).
 */
export interface ParticleFields {
    /** vec3 position in batch (world) space */
    offset: N;
    /** float angle (billboards) or vec4 quaternion (meshes) */
    rotation: N;
    /** vec3 size */
    size: N;
    /** float sprite sheet tile index */
    uvTile: N;
    /** vec4 color */
    color: N;
    /** vec4: velocity * speedFactor, lengthFactor (stretched billboards) */
    velocity: N;
    /**
     * `true` when every material of a kind can share one node graph (attributes); per-system sources (storage
     * buffers) build their own graph.
     */
    shared: boolean;
}

const attributeFieldSets = new Map<boolean, ParticleFields>();

/** The per-instance attributes written by the CPU batches (see `BatchLayouts`). */
export function attributeFields(mesh: boolean): ParticleFields {
    let fields = attributeFieldSets.get(mesh);
    if (fields === undefined) {
        fields = {
            offset: attribute('offset', 'vec3'),
            rotation: attribute('rotation', mesh ? 'vec4' : 'float'),
            size: attribute('size', 'vec3'),
            uvTile: attribute('uvTile', 'float'),
            color: attribute('color', 'vec4'),
            velocity: attribute('velocity', 'vec4'),
            shared: true,
        };
        attributeFieldSets.set(mesh, fields);
    }
    return fields;
}

const tileCount = vec2(materialProperty('uTileCount', 'float'), materialProperty('vTileCount', 'float'));

/**
 * UV of tile `tileIndex` of the material's `uTileCount` x `vTileCount` sprite sheet
 * (same convention as `makeTileTransform` in `tile_pars_vertex.glsl`). Computed in the vertex stage.
 */
export function tileUV(uvNode: N, tileIndex: N): N {
    const col = tileIndex.mod(tileCount.x);
    const row = tileCount.y.sub(floor(tileIndex.div(tileCount.x))).sub(1.0);
    return (vertexStage as N)(uvNode.add(vec2(col, row)).div(tileCount));
}

/**
 * View space position of a camera facing (or vertical / horizontal) billboard vertex. Port of `particle_vert.glsl`.
 */
export function billboardPositionView(
    mode: 'billboard' | 'horizontal' | 'vertical',
    fields: ParticleFields = attributeFields(false)
): N {
    const offset = fields.offset;
    const rotation = fields.rotation;
    const size = fields.size;

    const aligned = positionGeometry.xy.mul(size.xy);
    const c = rotation.cos();
    const s = rotation.sin();
    const rotated = vec2(c.mul(aligned.x).sub(s.mul(aligned.y)), s.mul(aligned.x).add(c.mul(aligned.y)));

    if (mode === 'horizontal') {
        const world = modelWorldMatrix.mul(vec4(offset, 1.0)).add(vec4(rotated.x, 0.0, rotated.y.negate(), 0.0));
        return cameraViewMatrix.mul(world).xyz;
    }
    if (mode === 'vertical') {
        const world = modelWorldMatrix.mul(vec4(offset, 1.0)).add(vec4(0.0, rotated.y, 0.0, 0.0));
        return cameraViewMatrix.mul(world).xyz.add(vec3(rotated.x, 0.0, 0.0));
    }
    return modelViewMatrix.mul(vec4(offset, 1.0)).xyz.add(vec3(rotated, 0.0));
}

/** View space position of a stretched billboard vertex. Port of `stretched_bb_particle_vert.glsl`. */
export function stretchedBillboardPositionView(fields: ParticleFields = attributeFields(false)): N {
    const offset = fields.offset;
    const size = fields.size;
    const velocity = fields.velocity;

    const lengthFactor = velocity.w;
    const avgSize = size.x.add(size.y).mul(0.5);
    const mvPosition = modelViewMatrix.mul(vec4(offset, 1.0)).xyz;
    // normalMatrix * velocity (normal matrix of the model-view transform)
    const viewVelocity = cameraViewMatrix.mul(vec4((modelNormalMatrix as N).mul(velocity.xyz), 0.0)).xyz;
    const vlength = viewVelocity.length();
    const side = cross(mvPosition, viewVelocity).normalize().mul(positionGeometry.y).mul(avgSize);
    const along = viewVelocity
        .mul(positionGeometry.x.add(0.5))
        .mul(lengthFactor.div(vlength).add(1.0))
        .mul(avgSize);
    return mvPosition.add(side).sub(along);
}

/**
 * Applies the per-instance particle transform (offset, quaternion rotation, non-uniform size) to
 * `positionLocal` / `normalLocal`. Port of the matrix built in `local_particle_vert.glsl`.
 * Must be called from `NodeMaterial.setupPosition` (vertex stage).
 */
export function applyParticleMeshTransform(
    builder: N,
    positionLocal: N,
    normalLocal: N,
    fields: ParticleFields = attributeFields(true)
) {
    const offset = fields.offset;
    const rotation = fields.rotation;
    const size = fields.size;

    positionLocal.assign(rotateByQuaternion(rotation, positionLocal.mul(size)).add(offset));
    if (builder.hasGeometryAttribute('normal')) {
        // inverse-transpose of (R * S) applied to n is R * (n / S)
        normalLocal.assign(rotateByQuaternion(rotation, normalLocal.div(size)));
    }
}

/**
 * Converts an sRGB-encoded ("display referred") color to linear.
 *
 * The WebGL particle shaders write their color straight into the sRGB framebuffer without any color-space
 * conversion. WebGPURenderer blends in a linear working-space framebuffer and encodes to sRGB at the end, so
 * decoding here reproduces the WebGL look exactly for every pixel a single particle covers. With linear output
 * nothing is encoded at the end, so nothing is decoded either.
 *
 * `fast` uses a 3-MAD polynomial instead of `pow()` (max error ~0.3%), cheaper on mobile GPUs where
 * transcendental functions run on a quarter-rate special function unit.
 */
export function decodeDisplayColor(rgb: N, fast: boolean): N {
    return Fn((builder: N) => {
        if (builder.renderer.outputColorSpace === LinearSRGBColorSpace) return rgb;
        if (fast) {
            return rgb.mul(rgb.mul(rgb.mul(0.305306011).add(0.682171111)).add(0.012522878));
        }
        return sRGBTransferEOTF(rgb);
    })();
}

/** Linear (positive) view depth of the scene behind the current fragment. */
function sceneDepth(hasDepthTexture: boolean): N {
    return Fn((builder: N) => {
        const depthSample = hasDepthTexture
            ? materialTextureAt('depthTexture', screenUV).x
            : (viewportDepthTexture as N)(screenUV).x;
        let viewZ;
        if (builder.renderer.logarithmicDepthBuffer) {
            viewZ = logarithmicDepthToViewZ(depthSample, cameraNear, cameraFar);
        } else if (builder.camera && builder.camera.isOrthographicCamera) {
            viewZ = orthographicDepthToViewZ(depthSample, cameraNear, cameraFar);
        } else {
            viewZ = perspectiveDepthToViewZ(depthSample, cameraNear, cameraFar);
        }
        return viewZ.negate();
    })();
}

/**
 * Soft particle fade factor. Port of `soft_fragment.glsl`.
 *
 * Without a depth texture the opaque scene depth is read from the current framebuffer through
 * `viewportDepthTexture()`, which WebGPURenderer copies once per render right before the first transparent draw
 * that needs it. This removes the extra full-scene depth pre-pass the WebGL renderer requires.
 */
export function softParticleFade(hasDepthTexture: boolean): N {
    const nearFade = materialProperty('softNearFade', 'float');
    const invFadeDistance = materialProperty('softInvFadeDistance', 'float');
    return invFadeDistance.mul(sceneDepth(hasDepthTexture).sub(nearFade).sub(positionView.z.negate())).saturate();
}

/**
 * `true` where the fragment is in front of the scene depth (manual depth test used by the display-space
 * compositor, whose particle target has no depth attachment).
 */
export function inFrontOfScene(): N {
    return positionView.z.negate().lessThanEqual(sceneDepth(true).mul(1.0001).add(1e-4));
}

/**
 * Samples a (possibly frame-blended) sprite sheet of the material's `map`.
 */
export function sampleMap(tiled: boolean, blendTiles: boolean, uvTile: N = attributeFields(false).uvTile): N {
    if (!tiled) return materialTextureAt('map', uv());
    const texel = materialTextureAt('map', tileUV(uv(), floor(uvTile)));
    if (!blendTiles) return texel;
    return mix(texel, materialTextureAt('map', tileUV(uv(), ceil(uvTile))), (vertexStage as N)(fract(uvTile)));
}

const tileUVContexts = new WeakMap<object, N>();

/**
 * A material context that samples the material's 2D textures (map, normal map, roughness map, ...) at the
 * particle's tile `uvTile`, for lit mesh particles (approach from PR #115). Cube textures (env maps) are left alone.
 */
export function createTileUVContext(uvTile: N): N {
    let tileContext = tileUVContexts.get(uvTile);
    if (tileContext === undefined) {
        // one tiled UV per UV channel, so that textures sharing a channel share a varying
        const tiledUVs = new Map<number, N>();
        tileContext = (context as N)({
            getUV: (textureNode: N) => {
                const map = textureNode.value as Texture;
                if ((map as N).isCubeTexture) return null;
                let tiled = tiledUVs.get(map.channel);
                if (tiled === undefined) {
                    tiled = tileUV(uv(map.channel), floor(uvTile));
                    tiledUVs.set(map.channel, tiled);
                }
                return tiled;
            },
        });
        tileUVContexts.set(uvTile, tileContext);
    }
    return tileContext;
}

/** {@link createTileUVContext} of the per-instance `uvTile` attribute. */
export const tileUVContext: N = createTileUVContext(attributeFields(true).uvTile);

/**
 * A vertex of a trail ribbon, decoded from the trail's storage buffer of points (see `TRAIL_POINT_LAYOUT`): each
 * segment from a point to the next draws two triangles (six vertices, no index buffer); the segment after a
 * trail's last point is collapsed. Port of the approach of PR #115.
 */
export interface TrailVertex {
    position: N;
    previous: N;
    next: N;
    width: N;
    side: N;
    color: N;
    uv: N;
    skipped: N;
}

const trailVertices = new WeakMap<object, TrailVertex>();

export function trailVertex(points: N): TrailVertex {
    let vertex = trailVertices.get(points);
    if (vertex === undefined) {
        // corners 0..5 of segment p: (p,+1) (p,-1) (p+1,+1) (p+1,+1) (p,-1) (p+1,-1), as the WebGL index buffer
        const segment = vertexIndex.div(6);
        const corner = vertexIndex.mod(6);
        const point = segment.add(uint(0b101100).shiftRight(corner).bitAnd(1));
        const record = (index: N, offset: number) => points.element(index.mul(3).add(offset));
        const flags = record(point, 2).w;
        const first = flags.mod(2).greaterThan(0.5);
        const last = flags.greaterThan(1.5);
        const side = select(uint(0b110010).shiftRight(corner).bitAnd(1).equal(1), float(-1), float(1));
        const head = record(point, 0);
        const uvRecord = record(point, 2);
        vertex = {
            position: head.xyz,
            previous: record(select(first, point, point.sub(1)), 0).xyz,
            next: record(select(last, point, point.add(1)), 0).xyz,
            width: head.w,
            side,
            color: (vertexStage as N)(record(point, 1)),
            uv: (vertexStage as N)(vec2(uvRecord.x, select(side.greaterThan(0), uvRecord.y, uvRecord.z))),
            skipped: record(segment, 2).w.greaterThan(1.5),
        };
        trailVertices.set(points, vertex);
    }
    return vertex;
}
