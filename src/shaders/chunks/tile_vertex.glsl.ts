export default /* glsl */ `
#ifdef UV_TILE
    vUv = makeTile(uv, floor(uvTile));
    #ifdef TILE_BLEND
        vUvNext = makeTile(uv, ceil(uvTile));
        vUvBlend = fract(uvTile);
    #endif
#else
    #include <uv_vertex>
#endif

`