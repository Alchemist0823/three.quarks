export default /* glsl */ `
precision highp float;

varying vec2 vUV;
varying vec4 vColor;

#ifdef USE_MAP
uniform sampler2D map;
#endif

#ifdef USE_COLOR_AS_ALPHA
#endif

void main() {
    vec4 baseColor = vColor;

#ifdef USE_MAP
    vec4 texColor = texture2D(map, vUV);
    baseColor *= texColor;
#endif

#ifdef USE_COLOR_AS_ALPHA
    baseColor.a *= (baseColor.r + baseColor.g + baseColor.b) / 3.0;
#endif

    gl_FragColor = baseColor;
}
`;
