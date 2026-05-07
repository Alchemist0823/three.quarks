export default /* glsl */ `
varying vec2 vUV;
varying vec4 vColor;

#ifdef TILE_BLEND
varying vec2 vUV2;
varying float vTileBlend;
#endif

#ifdef USE_MAP
uniform sampler2D map;
#endif

#ifdef SOFT_PARTICLES
uniform sampler2D depthTexture;
uniform vec2 softParams;
uniform vec4 projParams;
#endif

void main() {
    vec4 baseColor = vColor;

#ifdef USE_MAP
    vec4 texColor = texture2D(map, vUV);
    #ifdef TILE_BLEND
        vec4 texColor2 = texture2D(map, vUV2);
        texColor = mix(texColor, texColor2, vTileBlend);
    #endif
    baseColor *= texColor;
#endif

#ifdef USE_COLOR_AS_ALPHA
    baseColor.a *= (baseColor.r + baseColor.g + baseColor.b) / 3.0;
#endif

    if (baseColor.a < 0.01) discard;

    gl_FragColor = baseColor;
}
`;
