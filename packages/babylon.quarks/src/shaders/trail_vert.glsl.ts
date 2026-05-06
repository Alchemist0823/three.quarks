export default /* glsl */ `
precision highp float;

attribute vec3 position;
attribute vec3 previous;
attribute vec3 next;
attribute float side;
attribute float width;
attribute vec2 uv;
attribute vec4 color;

uniform mat4 worldViewProjection;
uniform mat4 view;
uniform mat4 projection;
uniform float resolutionX;
uniform float resolutionY;
uniform float lineWidth;
uniform float sizeAttenuation;

varying vec2 vUV;
varying vec4 vColor;

vec2 toScreen(vec4 clipPos) {
    vec2 resolution = vec2(resolutionX, resolutionY);
    return (clipPos.xy / clipPos.w) * resolution * 0.5;
}

void main() {
    vec4 clipCurrent = worldViewProjection * vec4(position, 1.0);
    vec4 clipPrevious = worldViewProjection * vec4(previous, 1.0);
    vec4 clipNext = worldViewProjection * vec4(next, 1.0);

    vec2 screenCurrent = toScreen(clipCurrent);
    vec2 screenPrevious = toScreen(clipPrevious);
    vec2 screenNext = toScreen(clipNext);

    vec2 dir1 = normalize(screenCurrent - screenPrevious);
    vec2 dir2 = normalize(screenNext - screenCurrent);
    vec2 dir = normalize(dir1 + dir2);
    vec2 normal = vec2(-dir.y, dir.x);

    float w = width * lineWidth;
    if (sizeAttenuation > 0.5) {
        w *= clipCurrent.w;
    }

    vec2 res = vec2(resolutionX, resolutionY);
    vec4 offset = vec4(normal * w * side / res * 2.0 * clipCurrent.w, 0.0, 0.0);
    gl_Position = clipCurrent + offset;

    vUV = uv;
    vColor = color;
}
`;
