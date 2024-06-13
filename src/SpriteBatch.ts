import {
    DynamicDrawUsage,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    Matrix3,
    WebGLRenderer,
    Quaternion,
    Uniform,
    Vector2,
    Vector3,
    MeshStandardMaterial,
    UniformsLib,
    UniformsUtils,
    ShaderMaterial,
    Color,
    Vector4,
    Scene,
    PerspectiveCamera,
} from 'three';
import {SpriteParticle} from './Particle';

import particle_frag from './shaders/particle_frag.glsl';
import particle_physics_frag from './shaders/particle_physics_frag.glsl';
import particle_vert from './shaders/particle_vert.glsl';
import local_particle_vert from './shaders/local_particle_vert.glsl';
import local_particle_physics_vert from './shaders/local_particle_physics_vert.glsl';
import stretched_bb_particle_vert from './shaders/stretched_bb_particle_vert.glsl';
import {getMaterialUVChannelName} from './util/ThreeUtil';
import {StretchedBillBoardSettings, VFXBatchSettings} from './BatchedRenderer';
import {RenderMode, VFXBatch} from './VFXBatch';

const UP = new Vector3(0, 0, 1);

/**
 * A VFX batch that render sprites in a batch.
 */
export class SpriteBatch extends VFXBatch {
    declare geometry: InstancedBufferGeometry;

    private offsetBuffer!: InstancedBufferAttribute;
    private rotationBuffer!: InstancedBufferAttribute;
    private sizeBuffer!: InstancedBufferAttribute;
    private colorBuffer!: InstancedBufferAttribute;
    private uvTileBuffer!: InstancedBufferAttribute;
    private velocityBuffer?: InstancedBufferAttribute;

    constructor(settings: VFXBatchSettings) {
        super(settings);

        this.maxParticles = 1000;
        this.setupBuffers();
        this.rebuildMaterial();
        // TODO: implement boundingVolume
    }

    buildExpandableBuffers(): void {
        this.offsetBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 3), 3);
        this.offsetBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('offset', this.offsetBuffer);
        this.colorBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 4), 4);
        this.colorBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('color', this.colorBuffer);
        if (this.settings.renderMode === RenderMode.Mesh) {
            this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 4), 4);
            this.rotationBuffer.setUsage(DynamicDrawUsage);
            this.geometry.setAttribute('rotation', this.rotationBuffer);
        } else if (
            this.settings.renderMode === RenderMode.BillBoard ||
            this.settings.renderMode === RenderMode.HorizontalBillBoard ||
            this.settings.renderMode === RenderMode.VerticalBillBoard ||
            this.settings.renderMode === RenderMode.StretchedBillBoard
        ) {
            this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles), 1);
            this.rotationBuffer.setUsage(DynamicDrawUsage);
            this.geometry.setAttribute('rotation', this.rotationBuffer);
        }
        this.sizeBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles), 1);
        this.sizeBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('size', this.sizeBuffer);
        this.uvTileBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles), 1);
        this.uvTileBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('uvTile', this.uvTileBuffer);
        if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
            this.velocityBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 4), 4);
            this.velocityBuffer.setUsage(DynamicDrawUsage);
            this.geometry.setAttribute('velocity', this.velocityBuffer);
        }
    }

    setupBuffers(): void {
        if (this.geometry) this.geometry.dispose();
        this.geometry = new InstancedBufferGeometry();
        this.geometry.setIndex(this.settings.instancingGeometry.getIndex());
        if (this.settings.instancingGeometry.hasAttribute('normal')) {
            this.geometry.setAttribute('normal', this.settings.instancingGeometry.getAttribute('normal'));
        }
        this.geometry.setAttribute('position', this.settings.instancingGeometry.getAttribute('position')); //new InterleavedBufferAttribute(this.interleavedBuffer, 3, 0, false));
        this.geometry.setAttribute('uv', this.settings.instancingGeometry.getAttribute('uv')); //new InterleavedBufferAttribute(this.interleavedBuffer, 2, 3, false));

        this.buildExpandableBuffers();
    }

    expandBuffers(target: number): void {
        while (target >= this.maxParticles) {
            this.maxParticles *= 2;
        }
        this.setupBuffers();
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;

        let uniforms: {[a: string]: Uniform};
        const defines: {[b: string]: string} = {};

        if (
            this.settings.material.type === 'MeshStandardMaterial' ||
            this.settings.material.type === 'MeshPhysicalMaterial'
        ) {
            const mat = this.settings.material as MeshStandardMaterial;
            uniforms = UniformsUtils.merge([
                UniformsLib.common,
                UniformsLib.envmap,
                UniformsLib.aomap,
                UniformsLib.lightmap,
                UniformsLib.emissivemap,
                UniformsLib.bumpmap,
                UniformsLib.normalmap,
                UniformsLib.displacementmap,
                UniformsLib.roughnessmap,
                UniformsLib.metalnessmap,
                UniformsLib.fog,
                UniformsLib.lights,
                {
                    emissive: {value: /*@__PURE__*/ new Color(0x000000)},
                    roughness: {value: 1.0},
                    metalness: {value: 0.0},
                    envMapIntensity: {value: 1}, // temporary
                },
            ]) as {[a: string]: Uniform};
            uniforms['diffuse'].value = mat.color;
            uniforms['opacity'].value = mat.opacity;
            uniforms['emissive'].value = mat.emissive;
            uniforms['roughness'].value = mat.roughness;
            uniforms['metalness'].value = mat.metalness;

            if (mat.envMap) {
                uniforms['envMap'].value = mat.envMap;
                uniforms['envMapIntensity'].value = mat.envMapIntensity;
            }
            if (mat.normalMap) {
                uniforms['normalMap'].value = mat.normalMap;
                uniforms['normalScale'].value = mat.normalScale;
            }
            if (mat.roughnessMap) {
                uniforms['roughnessMap'].value = mat.roughnessMap;
            }
            if (mat.metalnessMap) {
                uniforms['metalnessMap'].value = mat.metalnessMap;
            }
            if (mat.map) {
                uniforms['map'] = new Uniform(mat.map);
            }
        } else {
            uniforms = {};
            uniforms['map'] = new Uniform((this.settings.material as any).map);
        }

        if ((this.settings.material as any).alphaTest) {
            defines['USE_ALPHATEST'] = '';
            uniforms['alphaTest'] = new Uniform((this.settings.material as any).alphaTest);
        }

        defines['USE_UV'] = '';
        const uTileCount = this.settings.uTileCount;
        const vTileCount = this.settings.vTileCount;
        if (uTileCount > 1 || vTileCount > 1) {
            defines['UV_TILE'] = '';
            uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));
        }

        if (
            (this.settings.material as any).defines &&
            (this.settings.material as any).defines['USE_COLOR_AS_ALPHA'] !== undefined
        ) {
            defines['USE_COLOR_AS_ALPHA'] = '';
        }

        if ((this.settings.material as any).normalMap) {
            defines['USE_NORMALMAP'] = '';
            defines['NORMALMAP_UV'] = getMaterialUVChannelName((this.settings.material as any).normalMap.channel);
            uniforms['normalMapTransform'] = new Uniform(
                new Matrix3().copy((this.settings.material as any).normalMap.matrix)
            );
        }

        if ((this.settings.material as any).map) {
            defines['USE_MAP'] = '';
            if (this.settings.blendTiles) defines['TILE_BLEND'] = '';
            defines['MAP_UV'] = getMaterialUVChannelName((this.settings.material as any).map.channel);
            uniforms['mapTransform'] = new Uniform(new Matrix3().copy((this.settings.material as any).map.matrix));
        }
        defines['USE_COLOR_ALPHA'] = '';

        let onBeforeRender;
        if (this.settings.softParticles) {
            defines['SOFT_PARTICLES'] = '';

            const nearFade = this.settings.softNearFade;
            const invFadeDistance = 1.0 / (this.settings.softFarFade - this.settings.softNearFade);

            uniforms['softParams'] = new Uniform(new Vector2(nearFade, invFadeDistance));
            uniforms['depthTexture'] = new Uniform(null);
            const projParams = (uniforms['projParams'] = new Uniform(new Vector4()));

            onBeforeRender = (_renderer: WebGLRenderer, _scene: Scene, camera: PerspectiveCamera) => {
                projParams.value.set(camera.near, camera.far, 0, 0);
            };
        }

        let needLights = false;
        if (
            this.settings.renderMode === RenderMode.BillBoard ||
            this.settings.renderMode === RenderMode.VerticalBillBoard ||
            this.settings.renderMode === RenderMode.HorizontalBillBoard ||
            this.settings.renderMode === RenderMode.Mesh
        ) {
            let vertexShader;
            let fragmentShader;
            if (this.settings.renderMode === RenderMode.Mesh) {
                if (
                    this.settings.material.type === 'MeshStandardMaterial' ||
                    this.settings.material.type === 'MeshPhysicalMaterial'
                ) {
                    defines['USE_COLOR'] = '';
                    vertexShader = local_particle_physics_vert;
                    fragmentShader = particle_physics_frag;
                    needLights = true;
                } else {
                    vertexShader = local_particle_vert;
                    fragmentShader = particle_frag;
                }
            } else {
                vertexShader = particle_vert;
                fragmentShader = particle_frag;
            }
            if (this.settings.renderMode === RenderMode.VerticalBillBoard) {
                defines['VERTICAL'] = '';
            } else if (this.settings.renderMode === RenderMode.HorizontalBillBoard) {
                defines['HORIZONTAL'] = '';
            }
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: this.settings.material.transparent,
                depthWrite: !this.settings.material.transparent,
                blending: this.settings.material.blending,
                side: this.settings.material.side,
                alphaTest: this.settings.material.alphaTest,
                lights: needLights,
            });
        } else if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
            uniforms['speedFactor'] = new Uniform(1.0);
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: stretched_bb_particle_vert,
                fragmentShader: particle_frag,
                transparent: this.settings.material.transparent,
                depthWrite: !this.settings.material.transparent,
                blending: this.settings.material.blending,
                side: this.settings.material.side,
                alphaTest: this.settings.material.alphaTest,
            });
        } else {
            throw new Error('render mode unavailable');
        }
        if (this.material && onBeforeRender) {
            (this.material as any).onBeforeRender = onBeforeRender;
        }
    }

    vector_: Vector3 = new Vector3();
    vector2_: Vector3 = new Vector3();
    vector3_: Vector3 = new Vector3();
    quaternion_: Quaternion = new Quaternion();
    quaternion2_: Quaternion = new Quaternion();
    quaternion3_: Quaternion = new Quaternion();
    rotationMat_: Matrix3 = new Matrix3();
    rotationMat2_: Matrix3 = new Matrix3();

    update() {
        let index = 0;

        let particleCount = 0;
        this.systems.forEach((system) => {
            particleCount += system.particleNum;
        });
        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        this.systems.forEach((system) => {
            const particles = system.particles;
            const particleNum = system.particleNum;
            const rotation = this.quaternion2_;
            const translation = this.vector2_;
            const scale = this.vector3_;
            system.emitter.matrixWorld.decompose(translation, rotation, scale);
            this.rotationMat_.setFromMatrix4(system.emitter.matrixWorld);

            for (let j = 0; j < particleNum; j++, index++) {
                const particle = particles[j] as SpriteParticle;

                if (this.settings.renderMode === RenderMode.Mesh) {
                    //this.quaternion_.setFromAxisAngle(UP, particle.rotation as number);
                    let q;
                    if (system.worldSpace) {
                        q = particle.rotation as Quaternion;
                    } else {
                        let parentQ;
                        if (particle.parentMatrix) {
                            parentQ = this.quaternion3_.setFromRotationMatrix(particle.parentMatrix);
                        } else {
                            parentQ = rotation;
                        }
                        q = this.quaternion_;
                        q.copy(parentQ).multiply(particle.rotation as Quaternion);
                    }
                    this.rotationBuffer.setXYZW(index, q.x, q.y, q.z, q.w);
                } else if (
                    this.settings.renderMode === RenderMode.StretchedBillBoard ||
                    this.settings.renderMode === RenderMode.VerticalBillBoard ||
                    this.settings.renderMode === RenderMode.HorizontalBillBoard ||
                    this.settings.renderMode === RenderMode.BillBoard
                ) {
                    this.rotationBuffer.setX(index, particle.rotation as number);
                }

                let vec;
                if (system.worldSpace) {
                    vec = particle.position;
                } else {
                    vec = this.vector_;
                    if (particle.parentMatrix) {
                        vec.copy(particle.position).applyMatrix4(particle.parentMatrix);
                    } else {
                        vec.copy(particle.position).applyMatrix4(system.emitter.matrixWorld);
                    }
                }
                this.offsetBuffer.setXYZ(index, vec.x, vec.y, vec.z);
                this.colorBuffer.setXYZW(index, particle.color.x, particle.color.y, particle.color.z, particle.color.w);

                if (system.worldSpace) {
                    this.sizeBuffer.setX(index, particle.size);
                } else {
                    if (particle.parentMatrix) {
                        this.sizeBuffer.setX(index, particle.size);
                    } else {
                        this.sizeBuffer.setX(
                            index,
                            (particle.size * (Math.abs(scale.x) + Math.abs(scale.y) + Math.abs(scale.z))) / 3
                        );
                    }
                }
                this.uvTileBuffer.setX(index, particle.uvTile);

                if (this.settings.renderMode === RenderMode.StretchedBillBoard && this.velocityBuffer) {
                    let speedFactor = (system.rendererEmitterSettings as StretchedBillBoardSettings).speedFactor;
                    if (speedFactor === 0) speedFactor = 0.001; // TODO: use an another buffer
                    const lengthFactor = (system.rendererEmitterSettings as StretchedBillBoardSettings).lengthFactor;
                    let vec;
                    if (system.worldSpace) {
                        vec = particle.velocity;
                    } else {
                        vec = this.vector_;
                        if (particle.parentMatrix) {
                            this.rotationMat2_.setFromMatrix4(particle.parentMatrix);
                            vec.copy(particle.velocity).applyMatrix3(this.rotationMat2_);
                        } else {
                            vec.copy(particle.velocity).applyMatrix3(this.rotationMat_);
                        }
                    }
                    this.velocityBuffer.setXYZW(
                        index,
                        vec.x * speedFactor,
                        vec.y * speedFactor,
                        vec.z * speedFactor,
                        lengthFactor
                    );
                }
            }
        });
        this.geometry.instanceCount = index;

        if (index > 0) {
            this.offsetBuffer.updateRange.count = index * 3;
            this.offsetBuffer.needsUpdate = true;

            this.sizeBuffer.updateRange.count = index;
            this.sizeBuffer.needsUpdate = true;

            this.colorBuffer.updateRange.count = index * 4;
            this.colorBuffer.needsUpdate = true;

            this.uvTileBuffer.updateRange.count = index;
            this.uvTileBuffer.needsUpdate = true;

            if (this.settings.renderMode === RenderMode.StretchedBillBoard && this.velocityBuffer) {
                this.velocityBuffer.updateRange.count = index * 4;
                this.velocityBuffer.needsUpdate = true;
            }

            if (this.settings.renderMode === RenderMode.Mesh) {
                this.rotationBuffer.updateRange.count = index * 4;
                this.rotationBuffer.needsUpdate = true;
            } else if (
                this.settings.renderMode === RenderMode.StretchedBillBoard ||
                this.settings.renderMode === RenderMode.HorizontalBillBoard ||
                this.settings.renderMode === RenderMode.VerticalBillBoard ||
                this.settings.renderMode === RenderMode.BillBoard
            ) {
                this.rotationBuffer.updateRange.count = index;
                this.rotationBuffer.needsUpdate = true;
            }
        }
    }

    dispose() {
        this.geometry.dispose();
    }
}
