import {
    IParticleSystem,
    Matrix3,
    Matrix4,
    Quaternion,
    SpriteParticle,
    StretchedBillBoardSettings,
    Vector2,
    Vector3,
    Vector4,
} from 'quarks.core';
import {
    DynamicDrawUsage,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    ShaderMaterial,
    Uniform,
    WebGLRenderer,
} from 'three';

import {VFXBatchSettings} from './BatchedRenderer';
import {RenderMode, VFXBatch} from './VFXBatch';
import {ParticleMeshPhysicsMaterial, ParticleMeshStandardMaterial} from './materials/ParticleMaterials';
import local_particle_physics_vert from './shaders/local_particle_physics_vert.glsl';
import local_particle_vert from './shaders/local_particle_vert.glsl';
import particle_frag from './shaders/particle_frag.glsl';
import particle_physics_frag from './shaders/particle_physics_frag.glsl';
import particle_vert from './shaders/particle_vert.glsl';
import stretched_bb_particle_vert from './shaders/stretched_bb_particle_vert.glsl';
import {getMaterialUVChannelName, updateBufferAttribute} from './util/ThreeUtil';

const SUPPORTED_RENDER_MODES: ReadonlySet<RenderMode> = new Set([
    RenderMode.Mesh,
    RenderMode.BillBoard,
    RenderMode.StretchedBillBoard,
    RenderMode.HorizontalBillBoard,
    RenderMode.VerticalBillBoard,
]);

type onBeforeRenderCallback = (renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera) => void;

type SpriteBatchUpdateContext = {
    renderMode: RenderMode;
    worldSpace: boolean;
    emitterMatrix: Matrix4;
    emitterRotation: Quaternion;
    emitterScale: Vector3;
    velocityBuffer?: InstancedBufferAttribute;
    speedFactor: number;
    lengthFactor: number;
};

/**
 * A VFX batch that renders sprites.
 */
export class SpriteBatch extends VFXBatch {
    declare geometry: InstancedBufferGeometry;

    private offsetBuffer!: InstancedBufferAttribute;
    private rotationBuffer!: InstancedBufferAttribute;
    private sizeBuffer!: InstancedBufferAttribute;
    private colorBuffer!: InstancedBufferAttribute;
    private uvTileBuffer!: InstancedBufferAttribute;
    private velocityBuffer?: InstancedBufferAttribute;

    private readonly _vA: Vector3 = new Vector3();
    private readonly _vB: Vector3 = new Vector3();
    private readonly _vC: Vector3 = new Vector3();
    private readonly _qA: Quaternion = new Quaternion();
    private readonly _qB: Quaternion = new Quaternion();
    private readonly _qC: Quaternion = new Quaternion();
    private readonly _mA: Matrix3 = new Matrix3();
    private readonly _mB: Matrix3 = new Matrix3();

    private readonly _visibleSystems: IParticleSystem[] = [];
    private readonly _updateContext: SpriteBatchUpdateContext = {} as SpriteBatchUpdateContext;

    constructor(settings: VFXBatchSettings) {
        if (!SUPPORTED_RENDER_MODES.has(settings.renderMode)) {
            throw new Error(`[SpriteBatch] Unsupported render mode: ${settings.renderMode}`);
        }

        super(settings);

        this.maxParticles = 1000;
        this.setupBuffers();
        this.rebuildMaterial();
        // TODO: implement boundingVolume
    }

    setupBuffers(): void {
        this.geometry?.dispose();
        this.geometry = new InstancedBufferGeometry();

        const instancingGeometry = this.settings.instancingGeometry;
        this.geometry.setIndex(instancingGeometry.getIndex());
        this.geometry.setAttribute('position', instancingGeometry.getAttribute('position'));

        if (instancingGeometry.hasAttribute('normal')) {
            this.geometry.setAttribute('normal', instancingGeometry.getAttribute('normal'));
        }

        if (instancingGeometry.hasAttribute('uv')) {
            this.geometry.setAttribute('uv', instancingGeometry.getAttribute('uv'));
        }

        this.buildExpandableBuffers();
    }

    buildExpandableBuffers(): void {
        this.offsetBuffer = this.assignBufferAttribute('offset', this.maxParticles * 3, 3);
        this.colorBuffer = this.assignBufferAttribute('color', this.maxParticles * 4, 4);
        this.sizeBuffer = this.assignBufferAttribute('size', this.maxParticles * 3, 3);
        this.uvTileBuffer = this.assignBufferAttribute('uvTile', this.maxParticles, 1);

        if (this.settings.renderMode === RenderMode.Mesh) {
            this.rotationBuffer = this.assignBufferAttribute('rotation', this.maxParticles * 4, 4);
        } else {
            this.rotationBuffer = this.assignBufferAttribute('rotation', this.maxParticles, 1);

            if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
                this.velocityBuffer = this.assignBufferAttribute('velocity', this.maxParticles * 4, 4);
            }
        }
    }

    expandBuffers(target: number): void {
        while (target >= this.maxParticles) {
            this.maxParticles *= 2;
        }

        this.setupBuffers();
    }

    rebuildMaterial(): void {
        this.layers.mask = this.settings.layers.mask;

        const renderMode = this.settings.renderMode;
        const isMesh = renderMode === RenderMode.Mesh;
        const isStretchedBillBoard = renderMode === RenderMode.StretchedBillBoard;
        const isVerticalBillBoard = renderMode === RenderMode.VerticalBillBoard;
        const isHorizontalBillBoard = renderMode === RenderMode.HorizontalBillBoard;

        const material = this.settings.material as any;
        const isStandardMaterial = material.type === 'MeshStandardMaterial';
        const isPhysicalMaterial = material.type === 'MeshPhysicalMaterial';
        const isLitMesh = isMesh && (isStandardMaterial || isPhysicalMaterial);

        const uniforms: {[a: string]: Uniform} = {};
        const defines: {[b: string]: string} = {USE_UV: '', USE_COLOR_ALPHA: ''};

        if (material.defines && material.defines['USE_COLOR_AS_ALPHA'] !== undefined) {
            defines['USE_COLOR_AS_ALPHA'] = '';
        }

        if (!isStandardMaterial && !isPhysicalMaterial) {
            uniforms['map'] = new Uniform(material.map);
        }

        if (material.alphaTest) {
            defines['USE_ALPHATEST'] = '';
            uniforms['alphaTest'] = new Uniform(material.alphaTest);
        }

        if (material.map) {
            defines['USE_MAP'] = '';
            defines['MAP_UV'] = getMaterialUVChannelName(material.map.channel);
            if (this.settings.blendTiles) defines['TILE_BLEND'] = '';

            uniforms['mapTransform'] = new Uniform(new Matrix3().copy(material.map.matrix));
        }

        if (material.normalMap) {
            defines['USE_NORMALMAP'] = '';
            defines['NORMALMAP_UV'] = getMaterialUVChannelName(material.normalMap.channel);

            uniforms['normalMapTransform'] = new Uniform(new Matrix3().copy(material.normalMap.matrix));
        }

        const {uTileCount, vTileCount} = this.settings;

        if (uTileCount > 1 || vTileCount > 1) {
            defines['UV_TILE'] = '';
            uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));
        }

        let onBeforeRender: onBeforeRenderCallback | undefined;

        if (this.settings.softParticles) {
            defines['SOFT_PARTICLES'] = '';

            const nearFade = this.settings.softNearFade;
            const invFadeDistance = 1.0 / (this.settings.softFarFade - this.settings.softNearFade);

            uniforms['softParams'] = new Uniform(new Vector2(nearFade, invFadeDistance));
            uniforms['depthTexture'] = new Uniform(null);
            uniforms['projParams'] = new Uniform(new Vector4());

            onBeforeRender = (_, __, camera) => {
                uniforms['projParams'].value.set(camera.near, camera.far, 0, 0);
            };
        }

        if (isLitMesh) defines['USE_COLOR'] = '';
        if (isVerticalBillBoard) defines['VERTICAL'] = '';
        if (isHorizontalBillBoard) defines['HORIZONTAL'] = '';

        let vertexShader = particle_vert;
        let fragmentShader = particle_frag;

        if (isMesh) {
            vertexShader = isLitMesh ? local_particle_physics_vert : local_particle_vert;
            fragmentShader = isLitMesh ? particle_physics_frag : particle_frag;
        }

        if (isStretchedBillBoard) {
            vertexShader = stretched_bb_particle_vert;
            uniforms['speedFactor'] = new Uniform(1.0);
        }

        if (isMesh && isStandardMaterial) {
            this.material = new ParticleMeshStandardMaterial({});
            this.material.copy(this.settings.material as MeshStandardMaterial);
            (this.material as any).uniforms = uniforms;
            (this.material as any).defines = defines;
        } else if (isMesh && isPhysicalMaterial) {
            this.material = new ParticleMeshPhysicsMaterial({});
            this.material.copy(this.settings.material as MeshPhysicalMaterial);
            (this.material as any).uniforms = uniforms;
            (this.material as any).defines = defines;
        } else {
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: this.settings.material.transparent,
                depthWrite: !this.settings.material.transparent,
                blending: this.settings.material.blending,
                blendDst: this.settings.material.blendDst,
                blendSrc: this.settings.material.blendSrc,
                blendEquation: this.settings.material.blendEquation,
                premultipliedAlpha: this.settings.material.premultipliedAlpha,
                side: this.settings.material.side,
                alphaTest: this.settings.material.alphaTest,
                depthTest: this.settings.material.depthTest,
                lights: isLitMesh,
            });
        }

        if (onBeforeRender) {
            (this.material as any).onBeforeRender = onBeforeRender;
        }
    }

    update(): void {
        const visibleSystems = this.collectVisibleSystems(this._visibleSystems);
        const particleCount = this.countParticles(visibleSystems);

        if (particleCount > this.maxParticles) {
            this.expandBuffers(particleCount);
        }

        const renderMode = this.settings.renderMode;
        const context = this._updateContext;

        context.renderMode = renderMode;
        context.velocityBuffer = renderMode === RenderMode.StretchedBillBoard ? this.velocityBuffer : undefined;
        context.speedFactor = 0;
        context.lengthFactor = 0;

        let index = 0;

        for (const system of visibleSystems) {
            this.prepareUpdateContext(system, context);

            const {particles, particleNum} = system;

            for (let j = 0; j < particleNum; j++, index++) {
                const particle = particles[j] as SpriteParticle;

                this.writeParticleRotation(index, particle, context);
                this.writeParticleAttributes(index, particle, context);
                this.writeParticleVelocity(index, particle, context);
            }
        }

        this.geometry.instanceCount = index;
        this.updateBufferRanges(index);
    }

    private assignBufferAttribute(name: string, length: number, itemSize: number): InstancedBufferAttribute {
        const attribute = new InstancedBufferAttribute(new Float32Array(length), itemSize);
        attribute.setUsage(DynamicDrawUsage);

        this.geometry.setAttribute(name, attribute);

        return attribute;
    }

    private countParticles(systems: IParticleSystem[]): number {
        let particleCount = 0;

        for (const system of systems) {
            particleCount += system.particleNum;
        }

        return particleCount;
    }

    private prepareUpdateContext(system: IParticleSystem, context: SpriteBatchUpdateContext): void {
        this.updateEmitterWorldMatrix(system);
        const emitterMatrix = system.emitter.matrixWorld as Matrix4;
        const rotation = this._qB;
        const translation = this._vB;
        const scale = this._vC;

        emitterMatrix.decompose(translation, rotation, scale);
        this._mA.setFromMatrix4(emitterMatrix);

        context.worldSpace = system.worldSpace;
        context.emitterMatrix = emitterMatrix;
        context.emitterRotation = rotation;
        context.emitterScale = scale;

        if (!context.velocityBuffer) return;

        const stretchedSettings = system.rendererEmitterSettings as StretchedBillBoardSettings;
        const speedFactor = stretchedSettings.speedFactor;

        context.speedFactor = speedFactor === 0 ? 0.001 : speedFactor; // TODO: use another buffer
        context.lengthFactor = stretchedSettings.lengthFactor;
    }

    private writeParticleRotation(index: number, particle: SpriteParticle, context: SpriteBatchUpdateContext): void {
        if (context.renderMode === RenderMode.Mesh) {
            const q = context.worldSpace ? (particle.rotation as Quaternion) : this._qA;

            if (!context.worldSpace) {
                const parentMatrix = particle.parentMatrix;
                const parentRotation = parentMatrix
                    ? this._qC.setFromRotationMatrix(parentMatrix)
                    : context.emitterRotation;

                q.copy(parentRotation).multiply(particle.rotation as Quaternion);
            }

            this.rotationBuffer.setXYZW(index, q.x, q.y, q.z, q.w);
        } else {
            this.rotationBuffer.setX(index, particle.rotation as number);
        }
    }

    private writeParticleAttributes(index: number, particle: SpriteParticle, context: SpriteBatchUpdateContext): void {
        const position = context.worldSpace
            ? particle.position
            : this._vA.copy(particle.position).applyMatrix4(particle.parentMatrix ?? context.emitterMatrix);

        this.offsetBuffer.setXYZ(index, position.x, position.y, position.z);
        this.colorBuffer.setXYZW(index, particle.color.x, particle.color.y, particle.color.z, particle.color.w);

        if (context.worldSpace || particle.parentMatrix) {
            this.sizeBuffer.setXYZ(index, particle.size.x, particle.size.y, particle.size.z);
        } else {
            const scale = context.emitterScale;

            this.sizeBuffer.setXYZ(
                index,
                particle.size.x * Math.abs(scale.x),
                particle.size.y * Math.abs(scale.y),
                particle.size.z * Math.abs(scale.z)
            );
        }

        this.uvTileBuffer.setX(index, particle.uvTile);
    }

    private writeParticleVelocity(index: number, particle: SpriteParticle, context: SpriteBatchUpdateContext): void {
        const velocityBuffer = context.velocityBuffer;
        if (!velocityBuffer) return;

        const velocity = context.worldSpace ? particle.velocity : this._vA;

        if (!context.worldSpace) {
            const parentMatrix = particle.parentMatrix;
            const rotationMatrix = parentMatrix ? this._mB.setFromMatrix4(parentMatrix) : this._mA;

            velocity.copy(particle.velocity).applyMatrix3(rotationMatrix);
        }

        velocityBuffer.setXYZW(
            index,
            velocity.x * context.speedFactor,
            velocity.y * context.speedFactor,
            velocity.z * context.speedFactor,
            context.lengthFactor
        );
    }

    private updateBufferRanges(index: number): void {
        if (index === 0) return;

        updateBufferAttribute(this.offsetBuffer, 0, index * 3);
        updateBufferAttribute(this.sizeBuffer, 0, index * 3);
        updateBufferAttribute(this.colorBuffer, 0, index * 4);
        updateBufferAttribute(this.uvTileBuffer, 0, index);

        if (this.settings.renderMode === RenderMode.Mesh) {
            updateBufferAttribute(this.rotationBuffer, 0, index * 4);
        } else {
            updateBufferAttribute(this.rotationBuffer, 0, index);

            if (this.settings.renderMode === RenderMode.StretchedBillBoard && this.velocityBuffer) {
                updateBufferAttribute(this.velocityBuffer, 0, index * 4);
            }
        }
    }

    dispose(): void {
        this.geometry.dispose();
        this._visibleSystems.length = 0;
    }
}
