import {RenderMode} from './VFXBatch';

/**
 * Describes one attribute inside an interleaved per-instance (or per-vertex) buffer.
 * `offset` and `itemSize` are expressed in elements of the buffer (4 bytes for float32, 2 for float16).
 */
export interface InterleavedAttributeLayout {
    name: string;
    itemSize: number;
    offset: number;
}

/**
 * One interleaved buffer of a batch.
 */
export interface InstanceBufferLayout {
    /** elements per instance */
    stride: number;
    /** `true`: Float16Array (half floats), `false`: Float32Array */
    half: boolean;
    attributes: InterleavedAttributeLayout[];
}

/**
 * Where one logical particle field lives: buffer index and element offset inside that buffer's stride.
 */
export interface InstanceField {
    buffer: number;
    offset: number;
}

/**
 * Memory layout of the per-instance data of sprite / mesh batches.
 *
 * All per-instance data lives in one interleaved Float32Array (WebGL and the default WebGPU layout), so that
 * the whole batch is uploaded with a single `bufferSubData` / `queue.writeBuffer` call per frame and binds a
 * single vertex buffer slot. This matters for WebGPU, which limits a pipeline to 8 vertex buffers
 * (`maxVertexBuffers`) and where every buffer write has a fixed submission overhead.
 *
 * The optional half-float layout (WebGPU, native `Float16Array`) splits the data into a float32 buffer for the
 * values that need full precision (world position, rotation angle, tile index) and a float16 buffer for color,
 * size, velocity and mesh rotation, cutting 25-38% of the bytes uploaded per frame.
 */
export interface SpriteInstanceLayout {
    buffers: InstanceBufferLayout[];
    /** vec3 world position */
    offset: InstanceField;
    /** float angle (billboards) or vec4 quaternion (meshes) */
    rotation: InstanceField;
    /** 1 for billboards, 4 for meshes */
    rotationSize: number;
    /** vec3 size */
    size: InstanceField;
    /** float sprite sheet tile index */
    uvTile: InstanceField;
    /** vec4 color */
    color: InstanceField;
    /** vec4 velocity * speedFactor, lengthFactor (stretched billboards only) */
    velocity: InstanceField | null;
    /** bytes uploaded per particle */
    bytesPerInstance: number;
}

function layout(
    buffers: InstanceBufferLayout[],
    fields: Omit<SpriteInstanceLayout, 'buffers' | 'bytesPerInstance'>
): SpriteInstanceLayout {
    const bytesPerInstance = buffers.reduce((sum, b) => sum + b.stride * (b.half ? 2 : 4), 0);
    return {buffers, bytesPerInstance, ...fields};
}

// ---- float32 layouts (WebGL + default WebGPU) ---------------------------------------------------------------

// | offset.xyz rotation | size.xyz uvTile | color.rgba |  48 bytes
const BILLBOARD_LAYOUT = layout(
    [
        {
            stride: 12,
            half: false,
            attributes: [
                {name: 'offset', itemSize: 3, offset: 0},
                {name: 'rotation', itemSize: 1, offset: 3},
                {name: 'size', itemSize: 3, offset: 4},
                {name: 'uvTile', itemSize: 1, offset: 7},
                {name: 'color', itemSize: 4, offset: 8},
            ],
        },
    ],
    {
        offset: {buffer: 0, offset: 0},
        rotation: {buffer: 0, offset: 3},
        rotationSize: 1,
        size: {buffer: 0, offset: 4},
        uvTile: {buffer: 0, offset: 7},
        color: {buffer: 0, offset: 8},
        velocity: null,
    }
);

// ... | velocity.xyz lengthFactor |  64 bytes
const STRETCHED_BILLBOARD_LAYOUT = layout(
    [
        {
            stride: 16,
            half: false,
            attributes: [...BILLBOARD_LAYOUT.buffers[0].attributes, {name: 'velocity', itemSize: 4, offset: 12}],
        },
    ],
    {
        offset: {buffer: 0, offset: 0},
        rotation: {buffer: 0, offset: 3},
        rotationSize: 1,
        size: {buffer: 0, offset: 4},
        uvTile: {buffer: 0, offset: 7},
        color: {buffer: 0, offset: 8},
        velocity: {buffer: 0, offset: 12},
    }
);

// | offset.xyz uvTile | rotation.xyzw | size.xyz (pad) | color.rgba |  64 bytes
const MESH_LAYOUT = layout(
    [
        {
            stride: 16,
            half: false,
            attributes: [
                {name: 'offset', itemSize: 3, offset: 0},
                {name: 'uvTile', itemSize: 1, offset: 3},
                {name: 'rotation', itemSize: 4, offset: 4},
                {name: 'size', itemSize: 3, offset: 8},
                {name: 'color', itemSize: 4, offset: 12},
            ],
        },
    ],
    {
        offset: {buffer: 0, offset: 0},
        uvTile: {buffer: 0, offset: 3},
        rotation: {buffer: 0, offset: 4},
        rotationSize: 4,
        size: {buffer: 0, offset: 8},
        color: {buffer: 0, offset: 12},
        velocity: null,
    }
);

// ---- half-float layouts (WebGPU) ----------------------------------------------------------------------------
// float16 attributes only use 2 or 4 components (WebGPU has no float16x3 vertex format).

// f32 | offset.xyz rotation uvTile |  f16 | color.rgba | size.xyz pad |  20 + 16 = 36 bytes
const BILLBOARD_HALF_LAYOUT = layout(
    [
        {
            stride: 5,
            half: false,
            attributes: [
                {name: 'offset', itemSize: 3, offset: 0},
                {name: 'rotation', itemSize: 1, offset: 3},
                {name: 'uvTile', itemSize: 1, offset: 4},
            ],
        },
        {
            stride: 8,
            half: true,
            attributes: [
                {name: 'color', itemSize: 4, offset: 0},
                {name: 'size', itemSize: 4, offset: 4},
            ],
        },
    ],
    {
        offset: {buffer: 0, offset: 0},
        rotation: {buffer: 0, offset: 3},
        rotationSize: 1,
        uvTile: {buffer: 0, offset: 4},
        color: {buffer: 1, offset: 0},
        size: {buffer: 1, offset: 4},
        velocity: null,
    }
);

// ... f16 | ... | velocity.xyz lengthFactor |  20 + 24 = 44 bytes
const STRETCHED_BILLBOARD_HALF_LAYOUT = layout(
    [
        BILLBOARD_HALF_LAYOUT.buffers[0],
        {
            stride: 12,
            half: true,
            attributes: [...BILLBOARD_HALF_LAYOUT.buffers[1].attributes, {name: 'velocity', itemSize: 4, offset: 8}],
        },
    ],
    {
        offset: {buffer: 0, offset: 0},
        rotation: {buffer: 0, offset: 3},
        rotationSize: 1,
        uvTile: {buffer: 0, offset: 4},
        color: {buffer: 1, offset: 0},
        size: {buffer: 1, offset: 4},
        velocity: {buffer: 1, offset: 8},
    }
);

// f32 | offset.xyz uvTile |  f16 | rotation.xyzw | color.rgba | size.xyz pad |  16 + 24 = 40 bytes
const MESH_HALF_LAYOUT = layout(
    [
        {
            stride: 4,
            half: false,
            attributes: [
                {name: 'offset', itemSize: 3, offset: 0},
                {name: 'uvTile', itemSize: 1, offset: 3},
            ],
        },
        {
            stride: 12,
            half: true,
            attributes: [
                {name: 'rotation', itemSize: 4, offset: 0},
                {name: 'color', itemSize: 4, offset: 4},
                {name: 'size', itemSize: 4, offset: 8},
            ],
        },
    ],
    {
        offset: {buffer: 0, offset: 0},
        uvTile: {buffer: 0, offset: 3},
        rotation: {buffer: 1, offset: 0},
        rotationSize: 4,
        color: {buffer: 1, offset: 4},
        size: {buffer: 1, offset: 8},
        velocity: null,
    }
);

/**
 * Whether the JavaScript engine has a native `Float16Array` (required by the half-float layouts).
 */
export function supportsFloat16Array(): boolean {
    return typeof (globalThis as any).Float16Array === 'function';
}

/**
 * Returns the per-instance layout for a sprite / mesh render mode.
 * @param renderMode
 * @param options.halfFloat use the split float32 / float16 layout (requires a native Float16Array)
 */
export function getSpriteInstanceLayout(
    renderMode: RenderMode,
    options: {halfFloat?: boolean} = {}
): SpriteInstanceLayout {
    const half = options.halfFloat === true && supportsFloat16Array();
    switch (renderMode) {
        case RenderMode.Mesh:
            return half ? MESH_HALF_LAYOUT : MESH_LAYOUT;
        case RenderMode.StretchedBillBoard:
            return half ? STRETCHED_BILLBOARD_HALF_LAYOUT : STRETCHED_BILLBOARD_LAYOUT;
        case RenderMode.BillBoard:
        case RenderMode.HorizontalBillBoard:
        case RenderMode.VerticalBillBoard:
            return half ? BILLBOARD_HALF_LAYOUT : BILLBOARD_LAYOUT;
        default:
            throw new Error('render mode unavailable');
    }
}

/**
 * Memory layout of the interleaved per-vertex buffer used by the WebGL trail batch.
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

/**
 * Memory layout of the storage buffer used by the WebGPU trail batch: one record of three vec4 per trail point
 * (instead of two interleaved vertices that repeat the neighbouring points plus an index buffer).
 * | position.xyz width | color.rgba | u v(side +1) v(side -1) flags |  48 bytes, flags: 1 = first, 2 = last
 */
export const TRAIL_POINT_LAYOUT = {
    stride: 12,
    position: 0,
    width: 3,
    color: 4,
    u: 8,
    v0: 9,
    v1: 10,
    flags: 11,
};
