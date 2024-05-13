import { ShaderChunk as ShaderChunkReadOnly } from "three";
import soft_fragment from "./soft_fragment.glsl";
import soft_pars_fragment from "./soft_pars_fragment.glsl";
import soft_pars_vertex from "./soft_pars_vertex.glsl";
import soft_vertex from "./soft_vertex.glsl";

import tile_fragment from "./tile_fragment.glsl";
import tile_pars_fragment from "./tile_pars_fragment.glsl";
import tile_pars_vertex from "./tile_pars_vertex.glsl";
import tile_vertex from "./tile_vertex.glsl";

const ShaderChunk = ShaderChunkReadOnly as Record<string, string>;

export default function registerShaderChunks() {
    ShaderChunk["tile_pars_vertex"] = tile_pars_vertex;
    ShaderChunk["tile_vertex"] = tile_vertex;

    ShaderChunk["tile_pars_fragment"] = tile_pars_fragment;
    ShaderChunk["tile_fragment"] = tile_fragment;

    ShaderChunk["soft_pars_vertex"] = soft_pars_vertex;
    ShaderChunk["soft_vertex"] = soft_vertex;

    ShaderChunk["soft_pars_fragment"] = soft_pars_fragment;
    ShaderChunk["soft_fragment"] = soft_fragment;
}

