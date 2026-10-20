import {Camera, CubeTexture, OrthographicCamera, Texture} from 'three';
import {MaterialReferenceNode} from 'three/webgpu';
import type {ContextNode, Node, NodeBuilder, StorageBufferNode, TextureNode} from 'three/webgpu';
import {
    attribute,
    cameraFar,
    cameraNear,
    ceil,
    colorSpaceToWorking,
    context,
    floor,
    fract,
    Fn,
    mat4,
    materialReference,
    mix,
    mod,
    normalLocal,
    logarithmicDepthToViewZ,
    orthographicDepthToViewZ,
    perspectiveDepthToViewZ,
    positionLocal,
    positionView,
    saturate,
    screenUV,
    select,
    uint,
    transformNormal,
    uv,
    vec2,
    vec3,
    vec4,
    vertexIndex,
    vertexStage,
    viewportDepthTexture,
} from 'three/tsl';

// The nodes below read each material's own values through materialReference(), so that materials of one kind share
// one node graph and three builds their shader once.

// A property of the material being drawn; three's typings leave materialReference without its node type.
function materialProperty<TNodeType extends string>(name: string, type: TNodeType): Node<TNodeType> {
    return materialReference(name, type) as unknown as Node<TNodeType>;
}

const uvTile = attribute<'float'>('uvTile', 'float');
const tileCount = vec2(materialProperty('uTileCount', 'float'), materialProperty('vTileCount', 'float'));

// Maps a UV into a tile of the sprite sheet; tiles count row by row from the top left.
function tileUV(uvNode: Node<'vec2'>, tile: Node<'float'>): Node<'vec2'> {
    return vertexStage(
        uvNode.add(vec2(mod(tile, tileCount.x), tileCount.y.sub(floor(tile.div(tileCount.x))).sub(1))).div(tileCount)
    );
}

// A texture of the material that ignores the texture's own transform, as the WebGL batches sample their maps.
class UntransformedTextureReferenceNode extends MaterialReferenceNode {
    setNodeType(uniformType: string): void {
        super.setNodeType(uniformType);
        (this.node as TextureNode).updateMatrix = false;
    }
}

// A texture of the material, sampled at the given UV.
function materialTextureAt(name: string, uvNode: Node<'vec2'>): Node<'vec4'> {
    const reference = new UntransformedTextureReferenceNode(name, 'texture');
    return context(reference, {getUV: () => uvNode}) as unknown as Node<'vec4'>;
}

const colorNodes = new Map<string, Node<'vec4'>>();

/**
 * The color of a particle: its `color` attribute times its texel of the material's `map`. With tiles, the texel is
 * taken from the particle's tile (the `uvTile` attribute) of a sheet of `uTileCount` by `vTileCount` tiles, counted
 * row by row from the top left; with `blendTiles`, a fractional tile blends into the next one. Materials with the
 * same arguments get the same node.
 * @param {boolean} hasMap - Whether the material has a map.
 * @param {boolean} tiled - Whether the map is a sheet of more than one tile.
 * @param {boolean} blendTiles - Whether to blend a fractional tile into the next one.
 * @returns {Node} The color.
 */
export function particleColor(hasMap: boolean, tiled: boolean, blendTiles: boolean): Node<'vec4'> {
    const key = !hasMap ? 'color' : !tiled ? 'map' : blendTiles ? 'blended tiles' : 'tiles';
    let colorNode = colorNodes.get(key);
    if (colorNode === undefined) {
        const color: Node<'vec4'> = attribute<'vec4'>('color', 'vec4');
        if (!hasMap) {
            colorNode = color;
        } else if (!tiled) {
            colorNode = color.mul(materialTextureAt('map', uv()));
        } else {
            let texel = materialTextureAt('map', tileUV(uv(), floor(uvTile)));
            if (blendTiles) {
                texel = mix(texel, materialTextureAt('map', tileUV(uv(), ceil(uvTile))), vertexStage(fract(uvTile)));
            }
            colorNode = color.mul(texel);
        }
        colorNodes.set(key, colorNode);
    }
    return colorNode;
}

// One tiled UV per UV channel, so that textures sharing a channel share a varying.
const tiledUVs = new Map<number, Node<'vec2'>>();

/**
 * A material context that samples the material's 2D textures at the particle's tile (the `uvTile` attribute rounded
 * down, in a sheet of the material's `uTileCount` by `vTileCount` tiles), for lit mesh particles. three applies a
 * texture's own transform after it, and keeps normal maps out of a material's context, so the particle materials hand
 * it to their normals themselves; bump maps stay untiled.
 * @type {ContextNode}
 */
export const tileUVContext: ContextNode<unknown> = context({
    getUV: (textureNode: TextureNode) => {
        const map = textureNode.value as Texture;
        if ((map as CubeTexture).isCubeTexture) return null;
        let tiledUV = tiledUVs.get(map.channel);
        if (tiledUV === undefined) {
            tiledUV = tileUV(uv(map.channel), floor(uvTile));
            tiledUVs.set(map.channel, tiledUV);
        }
        return tiledUV;
    },
});

/**
 * Converts a color from the renderer's output color space to the working color space. The WebGL batches write their
 * colors without converting them for output; with this conversion an opaque particle shows the same color on
 * WebGPURenderer, which still blends and tone maps in the working color space.
 * @param {Node} color - An RGBA color in the output color space.
 * @returns {Node} The color in the working color space.
 */
export const outputToWorkingColorSpace = Fn(([color]: [Node<'vec4'>], builder: NodeBuilder) =>
    colorSpaceToWorking(color, builder.renderer.outputColorSpace)
) as unknown as (color: Node<'vec4'>) => Node<'vec4'>;

/**
 * The matrix that places a mesh particle: rotated by its `rotation` quaternion, scaled by `size` and moved to `offset`.
 * @returns {Node} The matrix.
 */
export function meshParticleMatrix(): Node<'mat4'> {
    const q = attribute<'vec4'>('rotation', 'vec4');
    const size = attribute<'vec3'>('size', 'vec3');
    const offset = attribute<'vec3'>('offset', 'vec3');
    const x2 = q.x.add(q.x);
    const y2 = q.y.add(q.y);
    const z2 = q.z.add(q.z);
    const xx = q.x.mul(x2);
    const xy = q.x.mul(y2);
    const xz = q.x.mul(z2);
    const yy = q.y.mul(y2);
    const yz = q.y.mul(z2);
    const zz = q.z.mul(z2);
    const wx = q.w.mul(x2);
    const wy = q.w.mul(y2);
    const wz = q.w.mul(z2);
    return mat4(
        vec4(vec3(yy.add(zz).oneMinus(), xy.add(wz), xz.sub(wy)).mul(size.x), 0),
        vec4(vec3(xy.sub(wz), xx.add(zz).oneMinus(), yz.add(wx)).mul(size.y), 0),
        vec4(vec3(xz.add(wy), yz.sub(wx), xx.add(yy).oneMinus()).mul(size.z), 0),
        vec4(offset, 1)
    );
}

/**
 * Moves the vertex of a mesh particle into place, transforming the local position and normal by
 * {@link meshParticleMatrix} as three's InstanceNode does with an instance matrix. Materials call it from
 * `setupPosition()`.
 * @param {NodeBuilder} builder - The current node builder.
 */
export function transformMeshParticle(builder: NodeBuilder): void {
    const matrix = meshParticleMatrix().toVar();
    positionLocal.assign(matrix.mul(vec4(positionLocal, 1)).xyz);
    // three's typings leave out NodeBuilder.hasGeometryAttribute.
    if ((builder as NodeBuilder & {hasGeometryAttribute(name: string): boolean}).hasGeometryAttribute('normal')) {
        normalLocal.assign(transformNormal(normalLocal, matrix));
    }
}

// The depth drawn so far in this render, which three copies before the first soft particles draw.
const frameDepth = viewportDepthTexture();

/**
 * How visible a soft particle is where it nears the scene behind it: 0 up to the material's `softNearFade` in front of
 * the scene's depth, rising to 1 at its `softFarFade`. The scene's depth is the material's `depthTexture`, or else the
 * depth drawn so far in this render.
 * @param {boolean} hasDepthTexture - Whether the material has a depth texture.
 * @returns {Node} The fade, from 0 to 1.
 */
export function softParticleFade(hasDepthTexture: boolean): Node<'float'> {
    const sceneViewZ = Fn((builder: NodeBuilder): Node<'float'> => {
        // A depth texture samples to a float.
        const depth = (hasDepthTexture
            ? materialTextureAt('depthTexture', screenUV)
            : frameDepth) as unknown as Node<'float'>;
        if (builder.renderer.logarithmicDepthBuffer) return logarithmicDepthToViewZ(depth, cameraNear, cameraFar);
        // three's NodeBuilder carries the camera being rendered; its type declarations leave it out.
        const camera = (builder as NodeBuilder & {camera: Camera}).camera;
        if ((camera as OrthographicCamera).isOrthographicCamera) {
            return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
        }
        return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
    })();
    const nearFade = materialProperty('softNearFade', 'float');
    const farFade = materialProperty('softFarFade', 'float');
    return saturate(sceneViewZ.negate().sub(nearFade).add(positionView.z).div(farFade.sub(nearFade)));
}

/**
 * A vertex of a trail ribbon, read from the trail's points: `points` holds three vec4 per point, its position and
 * width, its color, and its u, its v on either side and its flags (1: first point of its trail, 2: last). Each
 * segment from a point to the next draws two triangles, six vertices; the segment from a trail's last point draws
 * nothing.
 */
export interface TrailVertex {
    /** Position of the vertex's point. */
    position: Node<'vec3'>;
    /** Position of the point before it in its trail, or its own for the first. */
    previous: Node<'vec3'>;
    /** Position of the point after it in its trail, or its own for the last. */
    next: Node<'vec3'>;
    width: Node<'float'>;
    /** 1 or -1: the side of the ribbon. */
    side: Node<'float'>;
    color: Node<'vec4'>;
    uv: Node<'vec2'>;
    /** Whether the vertex belongs to the empty segment after a trail's last point. */
    skipped: Node<'bool'>;
}

const trailVertices = new WeakMap<StorageBufferNode<'vec4'>, TrailVertex>();

/**
 * Decodes the trail vertex for `vertexIndex` from a trail's points; one decoding per points node, so the position
 * and the color nodes share it.
 * @param {Node} points - A read-only storage node of vec4, three per point.
 * @returns {TrailVertex} The vertex.
 */
export function trailVertex(points: StorageBufferNode<'vec4'>): TrailVertex {
    let vertex = trailVertices.get(points);
    if (vertex === undefined) {
        // Corners 0..5 of a segment from point p: (p, +1), (p, -1), (p+1, +1), (p+1, +1), (p, -1), (p+1, -1), the
        // order of the WebGL batch's two triangles.
        const segment = vertexIndex.div(6);
        const corner = vertexIndex.mod(6);
        const point = segment.add(uint(0b101100).shiftRight(corner).bitAnd(1));
        const record = (index: Node<'uint'>, offset: number) => points.element(index.mul(3).add(offset));
        const flags = record(point, 2).w;
        const first = mod(flags, 2).greaterThan(0.5);
        const last = flags.greaterThan(1.5);
        const side = select(uint(0b110010).shiftRight(corner).bitAnd(1).equal(1), -1, 1);
        const head = record(point, 0);
        const uvRecord = record(point, 2);
        vertex = {
            position: head.xyz,
            previous: record(select(first, point, point.sub(1)), 0).xyz,
            next: record(select(last, point, point.add(1)), 0).xyz,
            width: head.w,
            side,
            color: vertexStage(record(point, 1)),
            uv: vertexStage(vec2(uvRecord.x, select(side.greaterThan(0), uvRecord.y, uvRecord.z))),
            skipped: record(segment, 2).w.greaterThan(1.5),
        };
        trailVertices.set(points, vertex);
    }
    return vertex;
}

/**
 * The color of a trail vertex: its point's color times its texel of the material's `map`.
 * @param {Node} points - The trail's points (see {@link trailVertex}).
 * @param {boolean} hasMap - Whether the material has a map.
 * @returns {Node} The color.
 */
export function trailColor(points: StorageBufferNode<'vec4'>, hasMap: boolean): Node<'vec4'> {
    const {color, uv: trailUV} = trailVertex(points);
    return hasMap ? color.mul(materialTextureAt('map', trailUV)) : color;
}
