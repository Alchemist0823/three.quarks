/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TSL building blocks shared by the WebGPU particle node materials.
 *
 * Everything here is a 1:1 port of the GLSL chunks used by the WebGL renderer
 * (see `src/shaders`), written with three.js' shading language so it compiles to WGSL on the
 * WebGPU backend and to GLSL ES 3.0 on the WebGL2 fallback backend of `WebGPURenderer`.
 */
import {
    Fn,
    attribute,
    cameraFar,
    cameraNear,
    cameraViewMatrix,
    cross,
    floor,
    logarithmicDepthToViewZ,
    orthographicDepthToViewZ,
    mix,
    modelNormalMatrix,
    modelViewMatrix,
    modelWorldMatrix,
    perspectiveDepthToViewZ,
    positionGeometry,
    positionView,
    sRGBTransferEOTF,
    screenUV,
    texture,
    vec2,
    vec3,
    vec4,
    viewportDepthTexture,
} from 'three/tsl';
import {LinearSRGBColorSpace} from 'three';
import type {Texture} from 'three';

type N = any;

/**
 * Rotates vector `v` by unit quaternion `q` (`v' = v + 2 * cross(q.xyz, cross(q.xyz, v) + q.w * v)`).
 * Cheaper than building a rotation matrix in the vertex shader (no mat4 construction).
 */
export function rotateByQuaternion(q: N, v: N): N {
    const qv = q.xyz;
    return v.add(cross(qv, cross(qv, v).add(v.mul(q.w))).mul(2.0));
}

/**
 * UV of tile `tileIndex` of a `tileCount.x * tileCount.y` sprite sheet
 * (same convention as `makeTileTransform` in `tile_pars_vertex.glsl`).
 */
export function tileUV(uvNode: N, tileIndex: N, tileCount: N): N {
    const col = tileIndex.mod(tileCount.x);
    const row = tileCount.y.sub(floor(tileIndex.div(tileCount.x))).sub(1.0);
    return uvNode.add(vec2(col, row)).div(tileCount);
}

/**
 * View space position of a camera facing (or vertical / horizontal) billboard vertex.
 * Port of `particle_vert.glsl`.
 */
export function billboardPositionView(mode: 'billboard' | 'horizontal' | 'vertical'): N {
    const offset = attribute('offset', 'vec3');
    const rotation = attribute('rotation', 'float');
    const size = attribute('size', 'vec3');

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

/**
 * View space position of a stretched billboard vertex. Port of `stretched_bb_particle_vert.glsl`.
 */
export function stretchedBillboardPositionView(): N {
    const offset = attribute('offset', 'vec3');
    const size = attribute('size', 'vec3');
    const velocity = attribute('velocity', 'vec4');

    const lengthFactor = velocity.w;
    const avgSize = size.x.add(size.y).mul(0.5);
    const mvPosition = modelViewMatrix.mul(vec4(offset, 1.0)).xyz;
    // normalMatrix * velocity (normal matrix of the model-view transform)
    const viewVelocity = cameraViewMatrix.mul(vec4(modelNormalMatrix.mul(velocity.xyz), 0.0)).xyz;
    const vlength = viewVelocity.length();
    const side = cross(mvPosition, viewVelocity).normalize().mul(positionGeometry.y).mul(avgSize);
    const along = viewVelocity
        .mul(positionGeometry.x.add(0.5))
        .mul(lengthFactor.div(vlength).add(1.0))
        .mul(avgSize);
    return mvPosition.add(side).sub(along);
}

/**
 * Applies the per-instance particle transform (offset, quaternion rotation, non-uniform size)
 * to `positionLocal` / `normalLocal`. Port of the matrix built in `local_particle_vert.glsl`.
 * Must be called from `NodeMaterial.setupPosition` (vertex stage).
 */
export function applyParticleMeshTransform(builder: N, positionLocal: N, normalLocal: N) {
    const offset = attribute('offset', 'vec3');
    const rotation = attribute('rotation', 'vec4');
    const size = attribute('size', 'vec3');

    positionLocal.assign(rotateByQuaternion(rotation, positionLocal.mul(size)).add(offset));
    if (builder.hasGeometryAttribute('normal')) {
        // inverse-transpose of (R * S) applied to n is R * (n / S)
        normalLocal.assign(rotateByQuaternion(rotation, normalLocal.div(size)));
    }
}

/**
 * Converts an sRGB-encoded ("display referred") color to linear.
 *
 * The WebGL particle shaders write their color straight into the sRGB framebuffer without any
 * color-space conversion. WebGPURenderer always blends in a linear working-space framebuffer and
 * encodes to sRGB at the end, so decoding here reproduces the WebGL look exactly for every pixel
 * a single particle covers.
 *
 * `fast` uses a 3-MAD polynomial instead of `pow()` (max error ~0.3%), which is noticeably cheaper on
 * mobile GPUs where transcendental functions run on a quarter-rate special function unit.
 */
export function decodeDisplayColor(rgb: N, fast: boolean): N {
    return Fn((builder: N) => {
        // With linear output nothing is encoded at the end, so there is nothing to undo either
        // (same as the WebGL shaders, which write their raw color in that case too).
        if (builder.renderer.outputColorSpace === LinearSRGBColorSpace) return rgb;
        if (fast) {
            return rgb.mul(rgb.mul(rgb.mul(0.305306011).add(0.682171111)).add(0.012522878));
        }
        return sRGBTransferEOTF(rgb);
    })();
}

export interface SoftParticleNodeOptions {
    /** user supplied scene depth texture (`BatchedRenderer.setDepthTexture`); `null` = use the framebuffer depth */
    depthTexture: Texture | null;
    nearFade: N;
    invFadeDistance: N;
}

/**
 * Soft particle fade factor. Port of `soft_fragment.glsl`.
 *
 * Without a user supplied depth texture the opaque scene depth is read from the current
 * framebuffer via `viewportDepthTexture()`, which WebGPURenderer copies once per render right
 * before the first transparent draw that needs it. This removes the extra full-scene depth
 * pre-pass the WebGL renderer requires.
 */
export function softParticleFade(options: SoftParticleNodeOptions): N {
    return Fn((builder: N) => {
        const depthSample = options.depthTexture
            ? texture(options.depthTexture, screenUV).x
            : viewportDepthTexture(screenUV).x;
        let sceneViewZ;
        if (builder.renderer.logarithmicDepthBuffer) {
            sceneViewZ = logarithmicDepthToViewZ(depthSample, cameraNear, cameraFar);
        } else if (builder.camera && builder.camera.isOrthographicCamera) {
            sceneViewZ = orthographicDepthToViewZ(depthSample, cameraNear, cameraFar);
        } else {
            sceneViewZ = perspectiveDepthToViewZ(depthSample, cameraNear, cameraFar);
        }
        const sceneDepth = sceneViewZ.negate();
        const particleDepth = positionView.z.negate();
        return options.invFadeDistance.mul(sceneDepth.sub(options.nearFade).sub(particleDepth)).saturate();
    })();
}

/**
 * Samples a (possibly frame-blended) sprite sheet.
 */
export function sampleTiled(map: Texture, uvNode: N, uvNextNode: N | null, blendNode: N | null): N {
    const texel = texture(map, uvNode);
    if (uvNextNode && blendNode) {
        return mix(texel, texture(map, uvNextNode), blendNode);
    }
    return texel;
}

