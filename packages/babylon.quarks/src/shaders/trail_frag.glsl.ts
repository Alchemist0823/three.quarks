export default /* glsl */ `
varying vec2 vUV;
varying vec4 vColor;

#ifdef USE_MAP
uniform sampler2D map;
#endif

void main() {
    vec4 baseColor = vColor;

#ifdef USE_MAP
    vec4 texColor = texture2D(map, vUV);
    baseColor *= texColor;
#endif

    if (baseColor.a < 0.01) discard;

    gl_FragColor = baseColor;
}
`;
