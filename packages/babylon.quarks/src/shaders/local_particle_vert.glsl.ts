export default /* glsl */ `
precision highp float;

// Per-vertex attributes
attribute vec3 position;
attribute vec2 uv;

// Per-instance attributes
attribute vec3 offset;
attribute vec4 color;
attribute vec3 size;
attribute vec4 rotation;
attribute float uvTile;

// Uniforms
uniform mat4 worldViewProjection;

#ifdef UV_TILE
uniform float tileCountX;
uniform float tileCountY;
#endif

// Varyings
varying vec2 vUV;
varying vec4 vColor;

vec3 applyQuaternion(vec3 v, vec4 q) {
    vec3 qVec = q.xyz;
    float qW = q.w;
    vec3 t = 2.0 * cross(qVec, v);
    return v + qW * t + cross(qVec, t);
}

void main() {
    vec3 rotatedPosition = applyQuaternion(position * size, rotation);
    vec3 worldPos = rotatedPosition + offset;

    gl_Position = worldViewProjection * vec4(worldPos, 1.0);

    #ifdef UV_TILE
        float tileIndex = uvTile;
        vec2 tc = vec2(tileCountX, tileCountY);
        float tileU = mod(tileIndex, tc.x) / tc.x;
        float tileV = 1.0 - floor(tileIndex / tc.x) / tc.y - 1.0 / tc.y;
        vUV = uv / tc + vec2(tileU, tileV);
    #else
        vUV = uv;
    #endif

    vColor = color;
}
`;
