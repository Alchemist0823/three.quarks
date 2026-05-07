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
attribute vec4 velocity;

// Uniforms
uniform mat4 view;
uniform mat4 projection;
uniform float speedFactor;

#ifdef UV_TILE
uniform float tileCountX;
uniform float tileCountY;
#endif

// Varyings
varying vec2 vUV;
varying vec4 vColor;

void main() {
    vec4 viewOffset = view * vec4(offset, 1.0);
    vec3 viewVelocity = (view * vec4(velocity.xyz, 0.0)).xyz;

    float lenVel = length(viewVelocity);
    vec3 dirVelocity = lenVel > 0.0001 ? viewVelocity / lenVel : vec3(0.0, 1.0, 0.0);
    vec3 sideDir = normalize(cross(dirVelocity, vec3(0.0, 0.0, 1.0)));

    float stretchLength = lenVel * speedFactor + velocity.w;
    vec3 scaledPos = dirVelocity * (position.y * size.y + stretchLength * position.y)
                   + sideDir * position.x * size.x;

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
