export default /* glsl */ `
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

void main() {
    vec2 resolution = vec2(resolutionX, resolutionY);

    vec4 clipCurrent = worldViewProjection * vec4(position, 1.0);
    vec4 clipPrevious = worldViewProjection * vec4(previous, 1.0);
    vec4 clipNext = worldViewProjection * vec4(next, 1.0);

    vec2 screenCurrent = (clipCurrent.xy / clipCurrent.w) * resolution * 0.5;
    vec2 screenPrevious = (clipPrevious.xy / clipPrevious.w) * resolution * 0.5;
    vec2 screenNext = (clipNext.xy / clipNext.w) * resolution * 0.5;

    vec2 dir1 = screenCurrent - screenPrevious;
    vec2 dir2 = screenNext - screenCurrent;

    if (length(dir1) < 0.001) dir1 = dir2;
    if (length(dir2) < 0.001) dir2 = dir1;

    dir1 = normalize(dir1);
    dir2 = normalize(dir2);

    vec2 dir = normalize(dir1 + dir2);
    vec2 normal = vec2(-dir.y, dir.x);

    float w = width * lineWidth;
    if (sizeAttenuation < 0.5) {
        w /= clipCurrent.w;
    }

    vec4 offset = vec4(normal * w * side / resolution * 2.0 * clipCurrent.w, 0.0, 0.0);
    gl_Position = clipCurrent + offset;

    vUV = uv;
    vColor = color;
}
`;
