import {Texture} from 'three';
import {NodeMaterial} from 'three/webgpu';
import type {Node, NodeBuilder, NodeMaterialParameters, StorageBufferNode} from 'three/webgpu';
import {all, cameraProjectionMatrix, equal, Fn, If, modelViewMatrix, normalize, select, vec2, vec4} from 'three/tsl';
import {outputToWorkingColorSpace, trailVertex} from '../nodes/ParticleNodes';

// Whether two vectors are equal in every component. three's typings disagree between releases on what equal() returns
// for vectors.
function allEqual(a: Node, b: Node): Node<'bool'> {
    return (all as (node: unknown) => Node<'bool'>)((equal as (a: Node, b: Node) => unknown)(a, b));
}

export interface ParticleTrailNodeMaterialParameters extends NodeMaterialParameters {
    map?: Texture | null;
    pointsNode?: StorageBufferNode<'vec4'> | null;
}

/**
 * The node material of particle trails. It draws the ribbon from the trail points in `pointsNode` (see
 * {@link trailVertex}), with no vertex attributes: each point is widened to its width across the screen-space
 * direction from the point before it to the point after it. Its `colorNode` usually comes from {@link trailColor},
 * which reads `map` from the material.
 */
export class ParticleTrailNodeMaterial extends NodeMaterial {
    static get type() {
        return 'ParticleTrailNodeMaterial';
    }

    /**
     * The texture of the trail.
     * @type {Texture | null}
     */
    map: Texture | null = null;

    /**
     * The trail points, a read-only storage node of vec4, three per point. Required.
     * @type {Node | null}
     */
    pointsNode: StorageBufferNode<'vec4'> | null = null;

    constructor(parameters?: ParticleTrailNodeMaterialParameters) {
        super();
        this.setValues(parameters);
    }

    copy(source: ParticleTrailNodeMaterial): this {
        this.map = source.map;
        this.pointsNode = source.pointsNode;
        return super.copy(source);
    }

    // three keys numeric properties only as zero or nonzero, but an opaque material writes alpha 1 only with
    // NormalBlending.
    customProgramCacheKey(): string {
        return `${super.customProgramCacheKey()}:${this.blending}`;
    }

    // The WebGL batches write the color unconverted.
    setupOutput(builder: NodeBuilder, outputNode: Node<'vec4'>): Node {
        return super.setupOutput(builder, outputToWorkingColorSpace(outputNode));
    }

    // premultipliedAlpha only selects the premultiplied blend factors, as in the WebGL batches.
    setupPremultipliedAlpha(_builder: NodeBuilder, outputNode: Node): Node {
        return outputNode;
    }

    // The geometry has no position attribute: these replace the defaults that read it.
    setupPosition(): Node {
        return trailVertex(this.pointsNode!).position;
    }

    setupPositionView(): Node {
        return modelViewMatrix.mul(vec4(trailVertex(this.pointsNode!).position, 1)).xyz;
    }

    setupModelViewProjection(): Node {
        const vertex = trailVertex(this.pointsNode!);
        return Fn(() => {
            // Everything the branches below share is computed before them, as the WebGL batch does; a node first
            // used inside one branch would otherwise be declared only there.
            const position = vertex.position.toVar();
            const previousPosition = vertex.previous.toVar();
            const nextPosition = vertex.next.toVar();
            const modelViewProjection = cameraProjectionMatrix.mul(modelViewMatrix);
            const clipPosition = modelViewProjection.mul(vec4(position, 1)).toVar();
            const previousClip = modelViewProjection.mul(vec4(previousPosition, 1));
            const nextClip = modelViewProjection.mul(vec4(nextPosition, 1));

            // The WebGL batch tests whether the projected neighbours equal the projected point. A neighbour stored
            // at the same position takes the point's own projection, so the test stays exact where the shader
            // compiler rounds two projections of one position differently.
            const current = clipPosition.xy.div(clipPosition.w).toVar();
            const previous = select(
                allEqual(previousPosition, position),
                current,
                previousClip.xy.div(previousClip.w)
            ).toVar();
            const next = select(allEqual(nextPosition, position), current, nextClip.xy.div(nextClip.w)).toVar();

            const dir = vec2().toVar();
            If(allEqual(next, current), () => {
                dir.assign(normalize(current.sub(previous)));
            })
                .ElseIf(allEqual(previous, current), () => {
                    dir.assign(normalize(next.sub(current)));
                })
                .Else(() => {
                    dir.assign(normalize(normalize(current.sub(previous)).add(normalize(next.sub(current)))));
                });

            const normal = vec4(vec2(dir.y.negate(), dir.x).mul(vertex.width.mul(0.5)), 0, 1).mul(
                cameraProjectionMatrix
            );
            const widened = vec4(clipPosition.xy.add(normal.xy.mul(vertex.side)), clipPosition.zw);
            // All six vertices of the empty segment after a trail's last point land on one spot.
            return select(vertex.skipped, vec4(0), widened);
        })();
    }
}
