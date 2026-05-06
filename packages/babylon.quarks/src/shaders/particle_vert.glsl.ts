export default /* glsl */ `
precision highp float;

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
uniform mat4 worldView;
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

void main() {
    float c = cos(rotation);
    float s = sin(rotation);

    vec3 rotatedPosition;

#ifdef HORIZONTAL
    rotatedPosition = vec3(
        position.x * c - position.z * s,
        position.y,
        position.x * s + position.z * c
    );
#elif defined(VERTICAL)
    rotatedPosition = vec3(
        position.x * c - position.y * s,
        position.x * s + position.y * c,
        position.z
    );
#else
    // Billboard: rotate in view space
    vec4 viewOffset = view * vec4(offset, 1.0);
    vec3 scaledPos = vec3(
        (position.x * c - position.y * s) * size.x,
        (position.x * s + position.y * c) * size.y,
        position.z * size.z
    );
    vec4 viewPos = vec4(viewOffset.xyz + scaledPos, 1.0);
    gl_Position = projection * viewPos;

    #ifdef UV_TILE
        float tileIndex = uvTile;
        vec2 tc = vec2(tileCountX, tileCountY);
        float tileU = mod(tileIndex, tc.x) / tc.x;
        float tileV = 1.0 - floor(tileIndex / tc.x) / tc.y - 1.0 / tc.y;
        vUV = uv / tc + vec2(tileU, tileV);
        #ifdef TILE_BLEND
            float nextTile = tileIndex + 1.0;
            float nextU = mod(nextTile, tc.x) / tc.x;
            float nextV = 1.0 - floor(nextTile / tc.x) / tc.y - 1.0 / tc.y;
            vUV2 = uv / tc + vec2(nextU, nextV);
            vTileBlend = fract(uvTile);
        #endif
    #else
        vUV = uv;
    #endif

    vColor = color;
    return;
#endif

    // For HORIZONTAL and VERTICAL modes
    vec3 worldPos = rotatedPosition * size + offset;
    gl_Position = worldViewProjection * vec4(worldPos, 1.0);

    #ifdef UV_TILE
        float tileIndex2 = uvTile;
        vec2 tc2 = vec2(tileCountX, tileCountY);
        float tileU2 = mod(tileIndex2, tc2.x) / tc2.x;
        float tileV2 = 1.0 - floor(tileIndex2 / tc2.x) / tc2.y - 1.0 / tc2.y;
        vUV = uv / tc2 + vec2(tileU2, tileV2);
    #else
        vUV = uv;
    #endif

    vColor = color;
}
`;
