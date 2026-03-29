import {
    Texture,
    Sprite,
    Group,
    Object3D,
    LoadingManager,
    ObjectLoader,
    Material,
    AnimationClip,
    Scene,
    Color,
    Fog,
    FogExp2,
    PerspectiveCamera,
    OrthographicCamera,
    AmbientLight,
    DirectionalLight,
    PointLight,
    RectAreaLight,
    HemisphereLight,
    LightProbe,
    SphericalHarmonics3,
    SpotLight,
    SkinnedMesh,
    Mesh,
    InstancedMesh,
    InstancedBufferAttribute,
    LOD,
    Line,
    LineSegments,
    LineLoop,
    Points,
    SpriteMaterial,
    Bone,
    BufferGeometry,
    BatchedMesh,
    Sphere,
    Box3,
} from 'three';
import {ParticleSystem} from './ParticleSystem';
import {Behavior, EmitSubParticleSystem} from 'quarks.core';
import {ParticleEmitter} from './ParticleEmitter';
import { QuarksPrefab } from './QuarksPrefab';

/**
 * Loader for quarks particle system.
 */
export class QuarksLoader extends ObjectLoader {
    constructor(manager?: LoadingManager) {
        super(manager);
    }

    /**
     * Links the references of the particle system.
     * It's used to link the references of sub particle systems.
     * @param object the target object to link the references.
     */
    linkReference(object: Object3D) {
        const objectsMap: {[uuid: string]: Object3D} = {};
        object.traverse(function (child) {
            objectsMap[child.uuid] = child;
        });
        object.traverse(function (child) {
            if (child.type === 'ParticleEmitter') {
                const system = (child as ParticleEmitter).system as ParticleSystem;
                const shape = system.emitterShape;
                /*if (shape instanceof MeshSurfaceEmitter) {
                    shape.geometry = objectsMap[shape.geometry as any] as Mesh;
                }*/
                for (let i = 0; i < system.behaviors.length; i++) {
                    if (system.behaviors[i] instanceof EmitSubParticleSystem) {
                        (system.behaviors[i] as EmitSubParticleSystem).subParticleSystem = objectsMap[
                            (system.behaviors[i] as EmitSubParticleSystem).subParticleSystem as any
                        ] as ParticleEmitter;
                    }
                }
            }
        });
    }

    /**
     * Parses the json data to create a quarks particle system.
     * @param json the json data to parse.
     * @param onLoad the callback function to be called after the object is loaded.
     */
    parse<T extends Object3D>(json: any, onLoad?: (object: Object3D) => void): T {
        const object = super.parse(json, onLoad);
        this.linkReference(object);
        return object as T;
    }

    // @ts-ignore
    parseObject(
        data: any,
        geometries: {[uuid: string]: BufferGeometry},
        materials: {[uuid: string]: Material},
        textures: {[uuid: string]: Texture},
        animations: {[uuid: string]: AnimationClip}
    ): Object3D {
        let object;
        function getGeometry(name: string) {
            if (geometries[name] === undefined) {
                console.warn('THREE.ObjectLoader: Undefined geometry', name);
            }
            return geometries[name];
        }

        function getMaterial(name: string | string[] | undefined) {
            if (name === undefined) return undefined;
            if (Array.isArray(name)) {
                const array = [];
                for (let i = 0, l = name.length; i < l; i++) {
                    const uuid = name[i];
                    if (materials[uuid] === undefined) {
                        console.warn('THREE.ObjectLoader: Undefined material', uuid);
                    }
                    array.push(materials[uuid]);
                }
                return array;
            }

            if (materials[name] === undefined) {
                console.warn('THREE.ObjectLoader: Undefined material', name);
            }

            return materials[name];
        }

        function getTexture(uuid: string) {
            if (textures[uuid] === undefined) {
                console.warn('THREE.ObjectLoader: Undefined texture', uuid);
            }
            return textures[uuid];
        }

        let geometry, material;
        const meta = {
            textures: textures,
            geometries: geometries,
            materials: materials,
        };
        const dependencies: {[uuid: string]: Behavior} = {};

        switch (data.type) {
            case 'QuarksPrefab':
                object = QuarksPrefab.fromJSON(data);
                break;
            case 'ParticleEmitter':
                object = ParticleSystem.fromJSON(data.ps, meta as any, dependencies).emitter;
                break;
            case 'Scene':
                object = new Scene();
                if (data.background !== undefined) {
                    if (Number.isInteger(data.background)) {
                        object.background = new Color(data.background);
                    } else {
                        object.background = getTexture(data.background);
                    }
                }

                if (data.environment !== undefined) {
                    object.environment = getTexture(data.environment);
                }

                if (data.fog !== undefined) {
                    if (data.fog.type === 'Fog') {
                        object.fog = new Fog(data.fog.color, data.fog.near, data.fog.far);
                    } else if (data.fog.type === 'FogExp2') {
                        object.fog = new FogExp2(data.fog.color, data.fog.density);
                    }
                    if (data.fog.name !== '') {
                        object.fog!.name = data.fog.name;
                    }
                }

                if (data.backgroundBlurriness !== undefined) object.backgroundBlurriness = data.backgroundBlurriness;
                if (data.backgroundIntensity !== undefined) object.backgroundIntensity = data.backgroundIntensity;
                if (data.backgroundRotation !== undefined) object.backgroundRotation.fromArray(data.backgroundRotation);

                if (data.environmentIntensity !== undefined) object.environmentIntensity = data.environmentIntensity;
                if (data.environmentRotation !== undefined)
                    object.environmentRotation.fromArray(data.environmentRotation);

                break;

            case 'PerspectiveCamera':
                object = new PerspectiveCamera(data.fov, data.aspect, data.near, data.far);

                if (data.focus !== undefined) object.focus = data.focus;
                if (data.zoom !== undefined) object.zoom = data.zoom;
                if (data.filmGauge !== undefined) object.filmGauge = data.filmGauge;
                if (data.filmOffset !== undefined) object.filmOffset = data.filmOffset;
                if (data.view !== undefined) object.view = Object.assign({}, data.view);

                break;

            case 'OrthographicCamera':
                object = new OrthographicCamera(data.left, data.right, data.top, data.bottom, data.near, data.far);

                if (data.zoom !== undefined) object.zoom = data.zoom;
                if (data.view !== undefined) object.view = Object.assign({}, data.view);

                break;

            case 'AmbientLight':
                object = new AmbientLight(data.color, data.intensity);

                break;

            case 'DirectionalLight':
                object = new DirectionalLight(data.color, data.intensity);

                break;

            case 'PointLight':
                object = new PointLight(data.color, data.intensity, data.distance, data.decay);

                break;

            case 'RectAreaLight':
                object = new RectAreaLight(data.color, data.intensity, data.width, data.height);

                break;

            case 'SpotLight':
                object = new SpotLight(
                    data.color,
                    data.intensity,
                    data.distance,
                    data.angle,
                    data.penumbra,
                    data.decay
                );

                break;

            case 'HemisphereLight':
                object = new HemisphereLight(data.color, data.groundColor, data.intensity);

                break;

            case 'LightProbe':
                object = new LightProbe();
                if (data.sh !== undefined) {
                    object.sh = new SphericalHarmonics3().fromArray(data.sh);
                }

                break;

            case 'SkinnedMesh':
                geometry = getGeometry(data.geometry);
                material = getMaterial(data.material);

                object = new SkinnedMesh(geometry, material);

                if (data.bindMode !== undefined) object.bindMode = data.bindMode;
                if (data.bindMatrix !== undefined) object.bindMatrix.fromArray(data.bindMatrix);
                if (data.skeleton !== undefined) object.skeleton = data.skeleton;

                break;

            case 'Mesh':
                geometry = getGeometry(data.geometry);
                material = getMaterial(data.material);

                object = new Mesh(geometry, material);

                break;

            case 'InstancedMesh': {
                geometry = getGeometry(data.geometry);
                material = getMaterial(data.material);
                const count = data.count;
                const instanceMatrix = data.instanceMatrix;
                const instanceColor = data.instanceColor;

                object = new InstancedMesh(geometry, material, count);
                object.instanceMatrix = new InstancedBufferAttribute(new Float32Array(instanceMatrix.array), 16);
                if (instanceColor !== undefined)
                    object.instanceColor = new InstancedBufferAttribute(
                        new Float32Array(instanceColor.array),
                        instanceColor.itemSize
                    );
                break;
            }
            case 'BatchedMesh':
                geometry = getGeometry(data.geometry);
                material = getMaterial(data.material);

                object = new BatchedMesh(
                    data.maxGeometryCount,
                    data.maxVertexCount,
                    data.maxIndexCount,
                    material as Material
                );
                object.geometry = geometry;
                object.perObjectFrustumCulled = data.perObjectFrustumCulled;
                object.sortObjects = data.sortObjects;

                (object as any)._drawRanges = data.drawRanges;
                (object as any)._reservedRanges = data.reservedRanges;

                (object as any)._visibility = data.visibility;
                (object as any)._active = data.active;
                (object as any)._bounds = data.bounds.map((bound: any) => {
                    const box = new Box3();
                    box.min.fromArray(bound.boxMin);
                    box.max.fromArray(bound.boxMax);

                    const sphere = new Sphere();
                    sphere.radius = bound.sphereRadius;
                    sphere.center.fromArray(bound.sphereCenter);

                    return {
                        boxInitialized: bound.boxInitialized,
                        box: box,

                        sphereInitialized: bound.sphereInitialized,
                        sphere: sphere,
                    };
                });

                (object as any)._maxGeometryCount = data.maxGeometryCount;
                (object as any)._maxVertexCount = data.maxVertexCount;
                (object as any)._maxIndexCount = data.maxIndexCount;

                (object as any)._geometryInitialized = data.geometryInitialized;
                (object as any)._geometryCount = data.geometryCount;

                (object as any)._matricesTexture = getTexture(data.matricesTexture.uuid);

                break;

            case 'LOD':
                object = new LOD();

                break;

            case 'Line':
                object = new Line(getGeometry(data.geometry), getMaterial(data.material));

                break;

            case 'LineLoop':
                object = new LineLoop(getGeometry(data.geometry), getMaterial(data.material));

                break;

            case 'LineSegments':
                object = new LineSegments(getGeometry(data.geometry), getMaterial(data.material));

                break;

            case 'PointCloud':
            case 'Points':
                object = new Points(getGeometry(data.geometry), getMaterial(data.material));

                break;

            case 'Sprite':
                object = new Sprite(getMaterial(data.material) as SpriteMaterial);

                break;

            case 'Group':
                object = new Group();

                break;

            case 'Bone':
                object = new Bone();

                break;

            default:
                object = new Object3D();
        }

        object.uuid = data.uuid;

        if (data.name !== undefined) object.name = data.name;

        if (data.matrix !== undefined) {
            object.matrix.fromArray(data.matrix);
            if (data.matrixAutoUpdate !== undefined) object.matrixAutoUpdate = data.matrixAutoUpdate;
            if (object.matrixAutoUpdate) {
                object.matrix.decompose(object.position, object.quaternion, object.scale);
                if (isNaN(object.quaternion.x)) {
                    object.quaternion.set(0, 0, 0, 1);
                }
            }
        } else {
            if (data.position !== undefined) object.position.fromArray(data.position);
            if (data.rotation !== undefined) object.rotation.fromArray(data.rotation);
            if (data.quaternion !== undefined) object.quaternion.fromArray(data.quaternion);
            if (data.scale !== undefined) object.scale.fromArray(data.scale);
        }
        if (data.up !== undefined) object.up.fromArray(data.up);
        if (data.castShadow !== undefined) object.castShadow = data.castShadow;
        if (data.receiveShadow !== undefined) object.receiveShadow = data.receiveShadow;

        if (data.shadow) {
            if (data.shadow.bias !== undefined) (object as any).shadow.bias = data.shadow.bias;
            if (data.shadow.normalBias !== undefined) (object as any).normalBias = data.shadow.normalBias;
            if (data.shadow.radius !== undefined) (object as any).radius = data.shadow.radius;
            if (data.shadow.mapSize !== undefined) (object as any).mapSize.fromArray(data.shadow.mapSize);
            if (data.shadow.camera !== undefined) {
                // @ts-ignore
                (object as any).camera = this.parseObject(data.shadow.camera);
            }
        }

        if (data.visible !== undefined) object.visible = data.visible;
        if (data.frustumCulled !== undefined) object.frustumCulled = data.frustumCulled;
        if (data.renderOrder !== undefined) object.renderOrder = data.renderOrder;
        if (data.userData !== undefined) object.userData = data.userData;
        if (data.layers !== undefined) object.layers.mask = data.layers;

        if (data.children !== undefined) {
            const children = data.children;

            for (let i = 0; i < children.length; i++) {
                object.add(this.parseObject(children[i], geometries, materials, textures, animations));
            }
        }

        if (data.animations !== undefined) {
            const objectAnimations = data.animations;
            for (let i = 0; i < objectAnimations.length; i++) {
                const uuid = objectAnimations[i];

                object.animations.push(animations[uuid]);
            }
        }

        if (data.type === 'LOD') {
            if (data.autoUpdate !== undefined) (object as any).autoUpdate = data.autoUpdate;

            const levels = data.levels;
            for (let l = 0; l < levels.length; l++) {
                const level = levels[l];
                const child = object.getObjectByProperty('uuid', level.object);

                if (child !== undefined) {
                    // @ts-ignore
                    object.addLevel(child, level.distance);
                }
            }
        } else if (data.type === 'QuarksPrefab') {
            (object as QuarksPrefab).resolveReferences(object);
        }

        return object;
    }
}
