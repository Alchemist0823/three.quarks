export default /* glsl */ `
#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
    #ifdef TILE_BLEND
        varying vec2 vUvNext;
        varying float vUvBlend;
    #endif
#endif

#ifdef UV_TILE
    attribute float uvTile;
    uniform vec2 tileCount;

    vec2 makeTile(vec2 uv, float tile) {
        return vec2((mod(tile, tileCount.x) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(tile / tileCount.x) - 1.0) + uv.y) * (1.0 / tileCount.y));
    }
#endif
`