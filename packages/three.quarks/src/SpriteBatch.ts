import {
    WebGLRenderer,
    Uniform,
    MeshStandardMaterial,
    ShaderMaterial,
    Scene,
    PerspectiveCamera,
    MeshPhysicalMaterial,
} from 'three';
import {Vector2, Vector4, Matrix3} from 'quarks.core';
import particle_frag from './shaders/particle_frag.glsl';
import particle_vert from './shaders/particle_vert.glsl';
import local_particle_vert from './shaders/local_particle_vert.glsl';
import local_particle_physics_vert from './shaders/local_particle_physics_vert.glsl';
import stretched_bb_particle_vert from './shaders/stretched_bb_particle_vert.glsl';
import {getMaterialUVChannelName} from './util/ThreeUtil';
import type {VFXBatchSettings} from './BaseBatchedRenderer';
import {RenderMode} from './VFXBatch';
import {BaseSpriteBatch} from './BaseSpriteBatch';
import {ParticleMeshPhysicsMaterial, ParticleMeshStandardMaterial} from './materials/ParticleMaterials';

/**
 * A VFX batch that render sprites in a batch.
 * (WebGLRenderer / GLSL implementation, buffers and CPU fill are shared in {@link BaseSpriteBatch})
 */
export class SpriteBatch extends BaseSpriteBatch {
    constructor(settings: VFXBatchSettings) {
        super(settings);
        this.setupBuffers();
        this.rebuildMaterial();
        // TODO: implement boundingVolume
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;

        const uniforms: {[a: string]: Uniform} = {};
        const defines: {[b: string]: string} = {};

        if (
            this.settings.material.type !== 'MeshStandardMaterial' &&
            this.settings.material.type !== 'MeshPhysicalMaterial'
        ) {
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
                    fragmentShader = particle_frag; // unused: lit materials use ParticleMeshStandardMaterial
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

            let specialMats = false;
            if (this.settings.renderMode === RenderMode.Mesh) {
                //const mat = this.settings.material as MeshStandardMaterial;
                if (this.settings.material.type === 'MeshStandardMaterial') {
                    this.material = new ParticleMeshStandardMaterial({});
                    this.material.copy(this.settings.material as MeshStandardMaterial);
                    (this.material as any).uniforms = uniforms;
                    (this.material as any).defines = defines;
                    specialMats = true;
                } else if (this.settings.material.type === 'MeshPhysicalMaterial') {
                    this.material = new ParticleMeshPhysicsMaterial({});
                    this.material.copy(this.settings.material as MeshPhysicalMaterial);
                    (this.material as any).uniforms = uniforms;
                    (this.material as any).defines = defines;
                    specialMats = true;
                }
            }
            if (!specialMats) {
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
                    lights: needLights,
                });
            }
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
                blendDst: this.settings.material.blendDst,
                blendSrc: this.settings.material.blendSrc,
                blendEquation: this.settings.material.blendEquation,
                premultipliedAlpha: this.settings.material.premultipliedAlpha,
                side: this.settings.material.side,
                alphaTest: this.settings.material.alphaTest,
                depthTest: this.settings.material.depthTest,
            });
        } else {
            throw new Error('render mode unavailable');
        }
        if (this.material && onBeforeRender) {
            (this.material as any).onBeforeRender = onBeforeRender;
        }
    }
}
