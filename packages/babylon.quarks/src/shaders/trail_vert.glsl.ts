export default /* glsl */ `
attribute vec3 position;
attribute vec3 previous;
attribute vec3 next;
attribute float side;
attribute float width;
attribute vec2 uv;
attribute vec4 color;

uniform mat4 view;
uniform mat4 projection;
uniform float lineWidth;
uniform vec2 resolution;
uniform float sizeAttenuation;

varying vec2 vUV;
varying vec4 vColor;

vec2 fix(vec4 i, float aspect) {
    vec2 res = i.xy / i.w;
    res.x *= aspect;
    return res;
}

void main() {
    float aspect = resolution.x / resolution.y;
    vec4 finalPosition = projection * view * vec4(position, 1.0);
    vec4 prevPos = projection * view * vec4(previous, 1.0);
    vec4 nextPos = projection * view * vec4(next, 1.0);

    vec2 currentP = fix(finalPosition, aspect);
    vec2 prevP = fix(prevPos, aspect);
    vec2 nextP = fix(nextPos, aspect);

    float w = lineWidth * width;
    vec2 dir;
    if (distance(nextP, currentP) < 0.0001) {
        dir = normalize(currentP - prevP);
    } else if (distance(prevP, currentP) < 0.0001) {
        dir = normalize(nextP - currentP);
    } else {
        vec2 dir1 = normalize(currentP - prevP);
        vec2 dir2 = normalize(nextP - currentP);
        dir = normalize(dir1 + dir2);
    }
    vec2 normal = vec2(-dir.y, dir.x) * 0.5 * w;
    if (sizeAttenuation == 0.0) {
        normal *= finalPosition.w;
    }
    finalPosition.xy += normal * side;
    gl_Position = finalPosition;
    vUV = uv;
    vColor = color;
}
`;
