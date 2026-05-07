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

void main() {
    float c = cos(rotation);
    float s = sin(rotation);

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
        vec2 tc = vec2(tileCountX, tileCountY);
        float tileU = mod(uvTile, tc.x) / tc.x;
        float tileV = 1.0 - floor(uvTile / tc.x) / tc.y - 1.0 / tc.y;
        vUV = uv / tc + vec2(tileU, tileV);
    #else
        vUV = uv;
    #endif

    vColor = color;
}
`;
