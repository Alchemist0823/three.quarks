import {RenderMode} from './VFXBatch';

/**
 * Describes one attribute inside an interleaved per-instance (or per-vertex) buffer.
 * `offset` and `itemSize` are expressed in floats (4 bytes).
 */
export interface InterleavedAttributeLayout {
    name: string;
    itemSize: number;
    offset: number;
}

/**
 * Memory layout of the interleaved per-instance buffer used by sprite / mesh batches.
 *
 * All particle data of one batch lives in a single Float32Array so that the whole batch can be
 * uploaded with a single `bufferSubData` (WebGL) / `queue.writeBuffer` (WebGPU) call per frame and
 * binds a single vertex buffer slot. This matters a lot for WebGPU, which limits a pipeline to
 * 8 vertex buffers (`maxVertexBuffers`) – the previous non-interleaved layout needed up to 9 for
 * stretched billboards – and where every buffer write has a fixed submission overhead.
 *
 * Strides are padded to 16 byte multiples (48 or 64 bytes) so instances never straddle cache lines
 * unnecessarily on desktop and mobile GPUs.
 */
export interface SpriteInstanceLayout {
    /** floats per instance */
    stride: number;
    /** offset of vec3 `offset` (world position) */
    offset: number;
    /** offset of `rotation` (float angle for billboards, vec4 quaternion for meshes) */
    rotation: number;
    /** 1 for billboards, 4 for meshes */
    rotationSize: number;
    /** offset of vec3 `size` */
    size: number;
    /** offset of float `uvTile` */
    uvTile: number;
    /** offset of vec4 `color` */
    color: number;
    /** offset of vec4 `velocity` (stretched billboard only), -1 if absent */
    velocity: number;
    attributes: InterleavedAttributeLayout[];
}

const BILLBOARD_LAYOUT: SpriteInstanceLayout = {
    // | offset.xyz rotation | size.xyz uvTile | color.rgba |
    stride: 12,
    offset: 0,
    rotation: 3,
    rotationSize: 1,
    size: 4,
    uvTile: 7,
    color: 8,
    velocity: -1,
    attributes: [
        {name: 'offset', itemSize: 3, offset: 0},
        {name: 'rotation', itemSize: 1, offset: 3},
        {name: 'size', itemSize: 3, offset: 4},
        {name: 'uvTile', itemSize: 1, offset: 7},
        {name: 'color', itemSize: 4, offset: 8},
    ],
};

const STRETCHED_BILLBOARD_LAYOUT: SpriteInstanceLayout = {
    // | offset.xyz rotation | size.xyz uvTile | color.rgba | velocity.xyz lengthFactor |
    ...BILLBOARD_LAYOUT,
    stride: 16,
    velocity: 12,
    attributes: [...BILLBOARD_LAYOUT.attributes, {name: 'velocity', itemSize: 4, offset: 12}],
};

const MESH_LAYOUT: SpriteInstanceLayout = {
    // | offset.xyz uvTile | rotation.xyzw | size.xyz (pad) | color.rgba |
    stride: 16,
    offset: 0,
    uvTile: 3,
    rotation: 4,
    rotationSize: 4,
    size: 8,
    color: 12,
    velocity: -1,
    attributes: [
        {name: 'offset', itemSize: 3, offset: 0},
        {name: 'uvTile', itemSize: 1, offset: 3},
        {name: 'rotation', itemSize: 4, offset: 4},
        {name: 'size', itemSize: 3, offset: 8},
        {name: 'color', itemSize: 4, offset: 12},
    ],
};

/**
 * Returns the interleaved instance layout for a sprite / mesh render mode.
 */
export function getSpriteInstanceLayout(renderMode: RenderMode): SpriteInstanceLayout {
    switch (renderMode) {
        case RenderMode.Mesh:
            return MESH_LAYOUT;
        case RenderMode.StretchedBillBoard:
            return STRETCHED_BILLBOARD_LAYOUT;
        case RenderMode.BillBoard:
        case RenderMode.HorizontalBillBoard:
        case RenderMode.VerticalBillBoard:
            return BILLBOARD_LAYOUT;
        default:
            throw new Error('render mode unavailable');
    }
}

/**
 * Memory layout of the interleaved per-vertex buffer used by trail batches.
 * | position.xyz | previous.xyz | next.xyz | side | width | uv.xy | color.rgba |  (17 floats)
 */
export const TRAIL_VERTEX_LAYOUT = {
    stride: 17,
    position: 0,
    previous: 3,
    next: 6,
    side: 9,
    width: 10,
    uv: 11,
    color: 13,
    attributes: [
        {name: 'position', itemSize: 3, offset: 0},
        {name: 'previous', itemSize: 3, offset: 3},
        {name: 'next', itemSize: 3, offset: 6},
        {name: 'side', itemSize: 1, offset: 9},
        {name: 'width', itemSize: 1, offset: 10},
        {name: 'uv', itemSize: 2, offset: 11},
        {name: 'color', itemSize: 4, offset: 13},
    ] as InterleavedAttributeLayout[],
};
