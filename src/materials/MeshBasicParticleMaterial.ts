import { Color, Material, MeshBasicMaterial, MeshBasicMaterialParameters, ShaderMaterial, Uniform, Vector2 } from 'three';
import { RenderMode } from '../VFXBatch';

import local_particle_vert from '../shaders/local_particle_vert.glsl';
import particle_frag from '../shaders/particle_frag.glsl';
import particle_vert from '../shaders/particle_vert.glsl';
import stretched_bb_particle_vert from '../shaders/stretched_bb_particle_vert.glsl';

type InstanceParameter = {
     renderMode: RenderMode;
     uTileCount: number;
     vTileCount: number;
}

type MeshBasicParticleMaterialParameters = MeshBasicMaterialParameters & {
    blendTiles?: boolean;
};

export class MeshBasicParticleMaterial extends MeshBasicMaterial {
    public blendTiles: boolean;

    public isParticleMaterial = true;
    public type = "MeshBasicParticleMaterial";

    constructor(parameters?: MeshBasicParticleMaterialParameters) {
        super();
        this.color = new Color(0xffffff);
        this.map = parameters?.map ?? null;
        this.blendTiles = parameters?.blendTiles ?? false;

        if (parameters !== undefined) {
            this.setValues(parameters);
        }
    }

    build({renderMode,uTileCount,vTileCount}: InstanceParameter) {
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

        defines['USE_COLOR_ALPHA'] = '';
        uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));

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
                throw new Error("Error");
        }

        const fragmentShader = particle_frag;

        const result = new ShaderMaterial({ uniforms, defines, vertexShader, fragmentShader });

        Material.prototype.copy.bind(result)(this);
        result.depthWrite = !result.transparent;
        
        return result;
    }

    clone() {
        const clone = super.clone();

        return clone;
    }

    copy(source: MeshBasicParticleMaterial) {
        super.copy(source);

        this.blendTiles = source.blendTiles;

        return this;
    }

    toJSON(meta: any) {
        const data = super.toJSON(meta);

        data.blendTiles = this.blendTiles;

        return data;
    }    
    
    fromJSON(json: any) {
      this.blendTiles = json.blendTiles;
    }
}