import {Matrix3, Vector2} from 'quarks.core';
import {AdditiveBlending, ShaderMaterial, Uniform} from 'three';

import trail_frag from './shaders/trail_frag.glsl';
import trail_vert from './shaders/trail_vert.glsl';
import {RenderMode} from './VFXBatch';
import {getMaterialUVChannelName} from './util/ThreeUtil';
import type {VFXBatchSettings} from './BaseBatchedRenderer';
import {BaseTrailBatch} from './BaseTrailBatch';

/**
 * A VFX batch that render trails in a batch.
 * (WebGLRenderer / GLSL implementation, buffers and CPU fill are shared in {@link BaseTrailBatch})
 */
export class TrailBatch extends BaseTrailBatch {
    constructor(settings: VFXBatchSettings) {
        super(settings);
        this.setupBuffers();
        this.rebuildMaterial();
        // TODO: implement boundingVolume
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;

        const uniforms: {[a: string]: {value: any}} = {
            lineWidth: {value: 1},
            map: {value: null},
            useMap: {value: 0},
            alphaMap: {value: null},
            useAlphaMap: {value: 0},
            resolution: {value: new Vector2(1, 1)},
            sizeAttenuation: {value: 1},
            visibility: {value: 1},
            alphaTest: {value: 0},
            //repeat: {value: new Vector2(1, 1)},
        };
        const defines: {[b: string]: string} = {};

        defines['USE_UV'] = '';
        defines['USE_COLOR_ALPHA'] = '';

        if ((this.settings.material as any).map) {
            defines['USE_MAP'] = '';
            defines['MAP_UV'] = getMaterialUVChannelName((this.settings.material as any).map.channel);
            uniforms['map'] = new Uniform((this.settings.material as any).map);
            uniforms['mapTransform'] = new Uniform(new Matrix3().copy((this.settings.material as any).map.matrix));
        }

        if (
            (this.settings.material as any).defines &&
            (this.settings.material as any).defines['USE_COLOR_AS_ALPHA'] !== undefined
        ) {
            defines['USE_COLOR_AS_ALPHA'] = '';
        }

        if (this.settings.renderMode === RenderMode.Trail) {
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: trail_vert,
                fragmentShader: trail_frag,
                transparent: this.settings.material.transparent,
                depthWrite: !this.settings.material.transparent,
                side: this.settings.material.side,
                blending: this.settings.material.blending || AdditiveBlending,
                blendDst: this.settings.material.blendDst,
                blendSrc: this.settings.material.blendSrc,
                blendEquation: this.settings.material.blendEquation,
                premultipliedAlpha: this.settings.material.premultipliedAlpha,
            });
        } else {
            throw new Error('render mode unavailable');
        }
    }
}
