export default /* glsl */ `
// Per-vertex attributes
attribute vec3 position;
attribute vec2 uv;

// Per-instance attributes
attribute vec3 offset;
attribute vec4 color;
attribute vec3 size;
attribute float rotation;
attribute float uvTile;

// Uniforms
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 worldViewProjection;

#ifdef UV_TILE
uniform float tileCountX;
uniform float tileCountY;
#endif

// Varyings
varying vec2 vUV;
varying vec4 vColor;
#ifdef TILE_BLEND
varying vec2 vUV2;
varying float vTileBlend;
#endif
#ifdef SOFT_PARTICLES
varying vec4 projPosition;
varying float linearDepth;
#endif

void main() {
    float c = cos(rotation);
    float s = sin(rotation);

    vec2 alignedPosition = position.xy * size.xy;
    vec2 rotatedPosition;
    rotatedPosition.x = c * alignedPosition.x - s * alignedPosition.y;
    rotatedPosition.y = s * alignedPosition.x + c * alignedPosition.y;

#ifdef HORIZONTAL
    vec4 mvPosition = world * vec4(offset, 1.0);
    mvPosition.x += rotatedPosition.x;
    mvPosition.z -= rotatedPosition.y;
    mvPosition = view * mvPosition;
#elif defined(VERTICAL)
    vec4 mvPosition = world * vec4(offset, 1.0);
    mvPosition.y += rotatedPosition.y;
    mvPosition = view * mvPosition;
    mvPosition.x += rotatedPosition.x;
#else
    vec4 mvPosition = view * world * vec4(offset, 1.0);
    mvPosition.xy += rotatedPosition;
#endif

    gl_Position = projection * mvPosition;
#ifdef SOFT_PARTICLES
    projPosition = gl_Position;
    linearDepth = -mvPosition.z;
#endif

    #ifdef UV_TILE
        vec2 tc = vec2(tileCountX, tileCountY);
        float baseTile = floor(uvTile);
        float tileU = mod(baseTile, tc.x) / tc.x;
        float tileV = 1.0 - floor(baseTile / tc.x) / tc.y - 1.0 / tc.y;
        vUV = uv / tc + vec2(tileU, tileV);
        #ifdef TILE_BLEND
            float nextTile = ceil(uvTile);
            float nextU = mod(nextTile, tc.x) / tc.x;
            float nextV = 1.0 - floor(nextTile / tc.x) / tc.y - 1.0 / tc.y;
            vUV2 = uv / tc + vec2(nextU, nextV);
            vTileBlend = fract(uvTile);
        #endif
    #else
        vUV = uv;
    #endif

    vColor = color;
}
`;
