export default /* glsl */ `
#ifdef USE_MAP
    vec4 texelColor = texture2D( map, vUv);
    #ifdef TILE_BLEND
        texelColor = mix( texelColor, texture2D( map, vUvNext ), vUvBlend );
    #endif
    diffuseColor *= texelColor;
#endif
`