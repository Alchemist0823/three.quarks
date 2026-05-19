import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {Constants} from '@babylonjs/core/Engines/constants';
import {Matrix, Quaternion, Vector3} from '@babylonjs/core/Maths/math.vector';
import {
    Behavior,
    EmitSubParticleSystem,
    BehaviorFromJSON,
    EmitterFromJSON,
    ValueGeneratorFromJSON,
    ColorGeneratorFromJSON,
    GeneratorFromJSON,
    ConstantValue,
    ConstantColor,
    Vector4,
    RotationGenerator,
    FunctionValueGenerator,
    ValueGenerator,
    Vector3Generator,
    ColorGenerator,
    TrailSettings,
    StretchedBillBoardSettings,
} from 'quarks.core';
import {ParticleSystem} from './ParticleSystem';
import {ParticleEmitter} from './ParticleEmitter';
import {RenderMode} from './VFXBatch';
import {BatchedRenderer} from './BatchedRenderer';

export interface QuarksLoaderOptions {
    baseUrl?: string;
}

interface ParsedGeometry {
    positions: Float32Array;
    indices: Uint32Array | Uint16Array;
    uvs?: Float32Array;
    normals?: Float32Array;
}

interface LoadedMeta {
    textures: {[uuid: string]: Texture | null};
    geometries: {[uuid: string]: ParsedGeometry};
    materials: {[uuid: string]: any};
}

export class QuarksLoader {
    private scene: Scene;
    private options: QuarksLoaderOptions;

    constructor(scene: Scene, options: QuarksLoaderOptions = {}) {
        this.scene = scene;
        this.options = options;
    }

    async load(url: string): Promise<TransformNode> {
        const baseUrl = this.options.baseUrl || url.substring(0, url.lastIndexOf('/') + 1);
        const response = await fetch(url);
        const json = await response.json();
        return this.parse(json, baseUrl);
    }

    parse(json: any, baseUrl: string = ''): TransformNode {
        const meta: LoadedMeta = {
            textures: {},
            geometries: {},
            materials: {},
        };

        if (json.geometries) {
            this.parseGeometries(json.geometries, meta);
        }
        if (json.images) {
            this.parseImages(json.images, baseUrl, meta);
        }
        if (json.textures) {
            this.parseTextures(json.textures, meta);
        }
        if (json.materials) {
            this.parseMaterials(json.materials, meta);
        }

        const root = this.parseObject(json.object, meta);
        this.linkReferences(root);
        return root;
    }

    private parseGeometries(geometries: any[], meta: LoadedMeta): void {
        for (const geom of geometries) {
            if (geom.type === 'PlaneGeometry') {
                const w = geom.width || 1;
                const h = geom.height || 1;
                const hw = w / 2;
                const hh = h / 2;
                meta.geometries[geom.uuid] = {
                    positions: new Float32Array([-hw, -hh, 0, hw, -hh, 0, hw, hh, 0, -hw, hh, 0]),
                    indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
                    uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
                    normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
                };
            } else if (geom.type === 'SphereGeometry') {
                meta.geometries[geom.uuid] = this.parseSphereGeometry(geom);
            } else if (geom.type === 'BufferGeometry' && geom.data) {
                const parsed = this.parseBufferGeometry(geom.data);
                meta.geometries[geom.uuid] = parsed;
            }
        }
    }

    private parseSphereGeometry(geom: any): ParsedGeometry {
        const radius = geom.radius ?? 0.5;
        const widthSegments = Math.max(3, Math.floor(geom.widthSegments ?? 16));
        const heightSegments = Math.max(2, Math.floor(geom.heightSegments ?? 8));
        const phiStart = geom.phiStart ?? 0;
        const phiLength = geom.phiLength ?? Math.PI * 2;
        const thetaStart = geom.thetaStart ?? 0;
        const thetaLength = geom.thetaLength ?? Math.PI;

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];
        const grid: number[][] = [];

        let index = 0;

        for (let iy = 0; iy <= heightSegments; iy++) {
            const verticesRow: number[] = [];
            const v = iy / heightSegments;
            const theta = thetaStart + v * thetaLength;

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;
                const phi = phiStart + u * phiLength;

                const x = -radius * Math.cos(phi) * Math.sin(theta);
                const y = radius * Math.cos(theta);
                const z = radius * Math.sin(phi) * Math.sin(theta);

                positions.push(x, y, z);
                const length = Math.hypot(x, y, z) || 1;
                normals.push(x / length, y / length, z / length);
                uvs.push(u, 1 - v);

                verticesRow.push(index++);
            }

            grid.push(verticesRow);
        }

        const thetaEnd = thetaStart + thetaLength;
        const isTopFull = thetaStart <= 0;
        const isBottomFull = thetaEnd >= Math.PI;

        for (let iy = 0; iy < heightSegments; iy++) {
            for (let ix = 0; ix < widthSegments; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];

                if (iy !== 0 || !isTopFull) {
                    indices.push(a, b, d);
                }
                if (iy !== heightSegments - 1 || !isBottomFull) {
                    indices.push(b, c, d);
                }
            }
        }

        const typedIndices = positions.length / 3 > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
        return {
            positions: new Float32Array(positions),
            indices: typedIndices,
            uvs: new Float32Array(uvs),
            normals: new Float32Array(normals),
        };
    }

    private parseBufferGeometry(data: any): ParsedGeometry {
        let positions = new Float32Array(0);
        let indices: Uint32Array | Uint16Array = new Uint32Array(0);
        let uvs: Float32Array | undefined;
        let normals: Float32Array | undefined;

        if (data.interleavedBuffers && data.arrayBuffers) {
            const buffers: {[uuid: string]: {data: Float32Array; stride: number}} = {};
            for (const [uuid, ibDef] of Object.entries(data.interleavedBuffers) as any[]) {
                const arrayBuffer = data.arrayBuffers[ibDef.buffer];
                if (arrayBuffer) {
                    const floatArray = new Float32Array(
                        Array.isArray(arrayBuffer) ? this.int32ArrayToFloat32(arrayBuffer) : arrayBuffer
                    );
                    buffers[uuid] = {data: floatArray, stride: ibDef.stride};
                }
            }

            if (data.attributes) {
                if (data.attributes.position?.isInterleavedBufferAttribute) {
                    const attr = data.attributes.position;
                    const buf = buffers[attr.data];
                    if (buf) positions = this.extractInterleavedAttribute(buf.data, buf.stride, attr.offset, attr.itemSize);
                }
                if (data.attributes.uv?.isInterleavedBufferAttribute) {
                    const attr = data.attributes.uv;
                    const buf = buffers[attr.data];
                    if (buf) uvs = this.extractInterleavedAttribute(buf.data, buf.stride, attr.offset, attr.itemSize);
                }
                if (data.attributes.normal?.isInterleavedBufferAttribute) {
                    const attr = data.attributes.normal;
                    const buf = buffers[attr.data];
                    if (buf) normals = this.extractInterleavedAttribute(buf.data, buf.stride, attr.offset, attr.itemSize);
                }
            }
        } else if (data.attributes) {
            if (data.attributes.position?.array) {
                positions = new Float32Array(data.attributes.position.array);
            }
            if (data.attributes.uv?.array) {
                uvs = new Float32Array(data.attributes.uv.array);
            }
            if (data.attributes.normal?.array) {
                normals = new Float32Array(data.attributes.normal.array);
            }
        }

        if (data.index) {
            if (data.index.type === 'Uint16Array') {
                indices = new Uint16Array(data.index.array);
            } else {
                indices = new Uint32Array(data.index.array);
            }
        }

        return {positions, indices, uvs, normals};
    }

    private extractInterleavedAttribute(buffer: Float32Array, stride: number, offset: number, itemSize: number): any {
        const count = Math.floor(buffer.length / stride);
        const result = new Float32Array(count * itemSize);
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < itemSize; j++) {
                result[i * itemSize + j] = buffer[i * stride + offset + j];
            }
        }
        return result;
    }

    private int32ArrayToFloat32(intArray: number[]): Float32Array {
        const buffer = new ArrayBuffer(intArray.length * 4);
        const int32View = new Int32Array(buffer);
        for (let i = 0; i < intArray.length; i++) {
            int32View[i] = intArray[i];
        }
        return new Float32Array(buffer) as any;
    }

    private parseImages(images: any[], baseUrl: string, _meta: LoadedMeta): void {
        (this as any)._images = {};
        for (const img of images) {
            (this as any)._images[img.uuid] = img.url ? baseUrl + img.url : null;
        }
    }

    private parseTextures(textures: any[], meta: LoadedMeta): void {
        const images = (this as any)._images || {};
        for (const texDef of textures) {
            const imageUrl = images[texDef.image];
            if (imageUrl) {
                const texture = new Texture(imageUrl, this.scene);
                if (Array.isArray(texDef.wrap)) {
                    texture.wrapU = this.mapWrapMode(texDef.wrap[0]);
                    texture.wrapV = this.mapWrapMode(texDef.wrap[1] ?? texDef.wrap[0]);
                }
                if (Array.isArray(texDef.repeat)) {
                    texture.uScale = texDef.repeat[0] ?? 1;
                    texture.vScale = texDef.repeat[1] ?? 1;
                }
                if (Array.isArray(texDef.offset)) {
                    texture.uOffset = texDef.offset[0] ?? 0;
                    texture.vOffset = texDef.offset[1] ?? 0;
                }
                if (typeof texDef.rotation === 'number') {
                    texture.wAng = texDef.rotation;
                }
                meta.textures[texDef.uuid] = texture;
            } else {
                meta.textures[texDef.uuid] = null;
            }
        }
    }

    private mapWrapMode(wrapMode?: number): number {
        switch (wrapMode) {
            case 1001: // ClampToEdgeWrapping (three.js)
                return Texture.CLAMP_ADDRESSMODE;
            case 1002: // MirroredRepeatWrapping (three.js)
                return Texture.MIRROR_ADDRESSMODE;
            case 1000: // RepeatWrapping (three.js)
            default:
                return Texture.WRAP_ADDRESSMODE;
        }
    }

    private parseMaterials(materials: any[], meta: LoadedMeta): void {
        for (const matDef of materials) {
            const matInfo: any = {
                uuid: matDef.uuid,
                transparent: matDef.transparent ?? true,
                blending: matDef.blending ?? 1,
                side: matDef.side ?? 2,
                depthTest: matDef.depthTest ?? true,
                depthWrite: matDef.depthWrite ?? false,
                alphaTest: matDef.alphaTest ?? 0,
                texture: null,
            };

            if (matDef.map) {
                matInfo.texture = meta.textures[matDef.map] || null;
            }

            const blendingToAlphaMode: {[key: number]: number} = {
                1: Constants.ALPHA_COMBINE,
                2: Constants.ALPHA_ADD,
                3: Constants.ALPHA_SUBTRACT,
                4: Constants.ALPHA_MULTIPLY,
            };
            matInfo.alphaMode = blendingToAlphaMode[matDef.blending] || Constants.ALPHA_COMBINE;

            meta.materials[matDef.uuid] = matInfo;
        }
    }

    private parseObject(data: any, meta: LoadedMeta): TransformNode {
        let node: TransformNode;

        if (data.type === 'ParticleEmitter' && data.ps) {
            const ps = this.parseParticleSystem(data.ps, meta);
            node = ps.emitter;
        } else {
            node = new TransformNode(data.name || data.type || 'node', this.scene);
        }

        if (data.uuid) (node as any)._quarksUUID = data.uuid;
        if (data.name) node.name = data.name;

        if (data.matrix) {
            const matrix = Matrix.FromArray(data.matrix);
            const scaling = new Vector3(1, 1, 1);
            const rotation = Quaternion.Identity();
            const translation = new Vector3(0, 0, 0);
            matrix.decompose(scaling, rotation, translation);
            node.position.copyFrom(translation);
            node.scaling.copyFrom(scaling);
            node.rotationQuaternion = rotation;
        } else {
            if (data.position) node.position.set(data.position[0], data.position[1], data.position[2]);
            if (data.scale) node.scaling.set(data.scale[0], data.scale[1], data.scale[2]);
            if (data.quaternion) {
                node.rotationQuaternion = new Quaternion(data.quaternion[0], data.quaternion[1], data.quaternion[2], data.quaternion[3]);
            } else if (data.rotation) {
                node.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2]);
            }
        }

        if (data.visible !== undefined) node.setEnabled(data.visible);

        if (data.children) {
            for (const childData of data.children) {
                const child = this.parseObject(childData, meta);
                child.parent = node;
            }
        }

        return node;
    }

    private parseParticleSystem(json: any, meta: LoadedMeta): ParticleSystem {
        const shape = EmitterFromJSON(json.shape, meta as any);

        let rendererEmitterSettings: any;
        if (json.renderMode === RenderMode.Trail) {
            const trailSettings = json.rendererEmitterSettings as any;
            rendererEmitterSettings = {
                startLength: trailSettings?.startLength ? ValueGeneratorFromJSON(trailSettings.startLength) : new ConstantValue(30),
                followLocalOrigin: trailSettings?.followLocalOrigin ?? false,
            };
        } else if (json.renderMode === RenderMode.StretchedBillBoard) {
            rendererEmitterSettings = json.rendererEmitterSettings || {};
            if (json.speedFactor != undefined) {
                (rendererEmitterSettings as StretchedBillBoardSettings).speedFactor = json.speedFactor;
            }
        } else {
            rendererEmitterSettings = {};
        }

        const matInfo = meta.materials[json.material];
        const texture = matInfo?.texture || null;
        const transparent = matInfo?.transparent ?? json.transparent ?? true;
        const blendMode = matInfo?.alphaMode ?? Constants.ALPHA_ADD;
        const depthTest = matInfo?.depthTest ?? true;
        const depthWrite = matInfo?.depthWrite ?? false;
        const alphaTest = matInfo?.alphaTest ?? 0;

        let geomData = meta.geometries[json.instancingGeometry];
        if (!geomData) {
            geomData = {
                positions: new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]),
                indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
                uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            };
        }

        const ps = new ParticleSystem({
            scene: this.scene,
            autoDestroy: json.autoDestroy,
            looping: json.looping,
            prewarm: json.prewarm,
            duration: json.duration,
            shape,
            startLife: ValueGeneratorFromJSON(json.startLife),
            startSpeed: ValueGeneratorFromJSON(json.startSpeed),
            startRotation: GeneratorFromJSON(json.startRotation) as any,
            startSize: GeneratorFromJSON(json.startSize) as any,
            startColor: ColorGeneratorFromJSON(json.startColor) as ColorGenerator,
            emissionOverTime: ValueGeneratorFromJSON(json.emissionOverTime),
            emissionOverDistance: ValueGeneratorFromJSON(json.emissionOverDistance),
            emissionBursts: json.emissionBursts?.map((burst: any) => ({
                time: burst.time,
                count: typeof burst.count === 'number' ? new ConstantValue(burst.count) : ValueGeneratorFromJSON(burst.count),
                probability: burst.probability ?? 1,
                interval: burst.interval ?? 0.1,
                cycle: burst.cycle ?? burst.cycleCount ?? 1,
            })),
            onlyUsedByOther: json.onlyUsedByOther,
            instancingGeometry: geomData.positions,
            instancingIndices: geomData.indices,
            instancingUVs: geomData.uvs,
            instancingNormals: geomData.normals,
            renderMode: json.renderMode,
            rendererEmitterSettings,
            renderOrder: json.renderOrder,
            texture,
            transparent,
            blendMode,
            depthTest,
            depthWrite,
            alphaTest,
            startTileIndex: typeof json.startTileIndex === 'number'
                ? new ConstantValue(json.startTileIndex)
                : (ValueGeneratorFromJSON(json.startTileIndex) as ValueGenerator),
            uTileCount: json.uTileCount,
            vTileCount: json.vTileCount,
            blendTiles: json.blendTiles,
            softParticles: json.softParticles,
            softFarFade: json.softFarFade,
            softNearFade: json.softNearFade,
            behaviors: [],
            worldSpace: json.worldSpace,
            layerMask: json.layers,
        });
        (ps as any)._meshSurfaceReferenceUUID = json?.shape?.type === 'mesh_surface' ? json?.shape?.mesh : undefined;

        const dependencies: {[uuid: string]: Behavior} = {};
        ps.behaviors = json.behaviors.map((behaviorJson: any) => {
            const behavior = BehaviorFromJSON(behaviorJson, ps);
            if (behavior && behavior.type === 'EmitSubParticleSystem') {
                dependencies[behaviorJson.subParticleSystem] = behavior;
            }
            return behavior;
        }).filter((b: any) => b !== null);

        return ps;
    }

    private linkReferences(root: TransformNode): void {
        const nodesMap: {[uuid: string]: TransformNode} = {};

        const traverse = (node: TransformNode) => {
            if ((node as any)._quarksUUID) {
                nodesMap[(node as any)._quarksUUID] = node;
            }
            for (const child of node.getChildren()) {
                if (child instanceof TransformNode) {
                    traverse(child);
                }
            }
        };
        traverse(root);

        const linkNode = (node: TransformNode) => {
            if (node instanceof ParticleEmitter) {
                const system = node.system as ParticleSystem;
                const meshSurfaceUUID = (system as any)._meshSurfaceReferenceUUID;
                if (meshSurfaceUUID && (system.emitterShape as any).type === 'mesh_surface') {
                    const targetNode = nodesMap[meshSurfaceUUID];
                    if (targetNode instanceof Mesh) {
                        (system.emitterShape as any).mesh = targetNode;
                    }
                }
                for (let i = 0; i < system.behaviors.length; i++) {
                    if (system.behaviors[i] instanceof EmitSubParticleSystem) {
                        const subEmitter = system.behaviors[i] as EmitSubParticleSystem;
                        const targetUUID = subEmitter.subParticleSystem as any;
                        if (typeof targetUUID === 'string' && nodesMap[targetUUID]) {
                            (subEmitter as any).subParticleSystem = nodesMap[targetUUID];
                        }
                    }
                }
            }
            for (const child of node.getChildren()) {
                if (child instanceof TransformNode) {
                    linkNode(child);
                }
            }
        };
        linkNode(root);
    }
}
