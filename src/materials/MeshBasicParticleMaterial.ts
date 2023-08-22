import { Color, Material, MeshBasicMaterial, MeshBasicMaterialParameters, ShaderMaterial, Uniform, Vector2, Vector4 } from 'three';
import { RenderMode } from '../VFXBatch';

import local_particle_vert from '../shaders/local_particle_vert.glsl';
import particle_frag from '../shaders/particle_frag.glsl';
import particle_vert from '../shaders/particle_vert.glsl';
import stretched_bb_particle_vert from '../shaders/stretched_bb_particle_vert.glsl';

type InstanceParameter = {
    renderMode: RenderMode;
    uTileCount: number;
    vTileCount: number;
};

type MeshBasicParticleMaterialParameters = MeshBasicMaterialParameters & {
    blendTiles?: boolean;
    softParticles?: boolean;
    softNearFade?: number;
    softFarFade?: number;
};

export class MeshBasicParticleMaterial extends MeshBasicMaterial {
    public blendTiles: boolean;
    public softParticles: boolean;
    public softNearFade: number;
    public softFarFade: number;

    public isParticleMaterial = true;
    public type = 'MeshBasicParticleMaterial';

    constructor(parameters?: MeshBasicParticleMaterialParameters) {
        super();
        this.color = new Color(0xffffff);
        this.map = parameters?.map ?? null;
        this.blendTiles = parameters?.blendTiles ?? false;
        this.softParticles = parameters?.softParticles ?? false;
        this.softNearFade = parameters?.softNearFade ?? 0;
        this.softFarFade = parameters?.softFarFade ?? 0.5;

        if (parameters !== undefined) {
            this.setValues(parameters);
        }
    }

    build({ renderMode, uTileCount, vTileCount }: InstanceParameter) {

        let onBeforeRender : any = undefined;
        const defines = {} as Record<string, string>;
        const uniforms = {} as Record<string, Uniform>;

        if (this.map) {
            defines['USE_MAP'] = '';
            defines['USE_UV'] = '';
            defines['UV_TILE'] = '';
            if (this.blendTiles) {
                defines['TILE_BLEND'] = '';
            }
            const channel = this.map.channel;
            defines['MAP_UV'] = `uv${channel === 0 ? '' : channel}`;

            uniforms['map'] = new Uniform(this.map);
            uniforms['uvTransform'] = new Uniform(this.map.matrix);
        }

        if (this.softParticles) {
            defines['SOFT_PARTICLES'] = '';

            const nearFade = this.softNearFade;
            const invFadeDistance = 1.0 / (this.softFarFade - this.softNearFade);

            uniforms['softParams'] = new Uniform(new Vector2(nearFade, invFadeDistance));
            uniforms['depthTexture'] = new Uniform(null);
            const projParams = uniforms['projParams'] = new Uniform(new Vector4());

            onBeforeRender = (_renderer: THREE.WebGLRenderer, _scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
                projParams.value.set(camera.near, camera.far, 0, 0);
            }
        }

        defines['USE_COLOR_ALPHA'] = '';
        uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));

        if (renderMode === RenderMode.StretchedBillBoard) {
            uniforms['speedFactor'] = new Uniform(1.0);
        }

        let vertexShader;
        switch (renderMode) {
            case RenderMode.StretchedBillBoard:
                vertexShader = stretched_bb_particle_vert;
                break;
            case RenderMode.Mesh:
                vertexShader = local_particle_vert;
                break;
            case RenderMode.BillBoard:
                vertexShader = particle_vert;
                break;
            case RenderMode.Trail:
                throw new Error('Error');
        }

        const fragmentShader = particle_frag;

        const result = new ShaderMaterial({ uniforms, defines, vertexShader, fragmentShader });

        Material.prototype.copy.bind(result)(this);
        result.depthWrite = !result.transparent;

        if(onBeforeRender) {
            (result as any).onBeforeRender = onBeforeRender;
        }
        return result;
    }

    copy(source: MeshBasicParticleMaterial) {
        super.copy(source);

        this.blendTiles = source.blendTiles;

        return this;
    }

    toJSON(meta: any) {
        const data = super.toJSON(meta);

        data.blendTiles = this.blendTiles;
        data.softParticles = this.blendTiles;
        data.softNearFade = this.softNearFade;
        data.softFarFade = this.softFarFade;

        return data;
    }

    fromJSON(json: any) {
        this.blendTiles = json.blendTiles;
        this.softParticles = json.softParticles;
        this.softNearFade = json.softNearFade;
        this.softFarFade = json.softFarFade;
    }
}
