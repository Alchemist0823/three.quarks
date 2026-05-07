export default /* glsl */ `
attribute vec3 position;
attribute vec3 previous;
attribute vec3 next;
attribute float side;
attribute float width;
attribute vec2 uv;
attribute vec4 color;

uniform mat4 worldViewProjection;

varying vec2 vUV;
varying vec4 vColor;

void main() {
    // Simple passthrough - position is already the ribbon vertex position
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vUV = uv;
    vColor = color;
}
`;
