export default /* glsl */ `

#include <common>
#include <uv_pars_fragment>
#include <color_pars_fragment>
#include <map_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
#include <alphatest_pars_fragment>

void main() {

    #include <clipping_planes_fragment>
    
    vec3 outgoingLight = vec3( 0.0 );
    vec4 diffuseColor = vColor;
    
    #include <logdepthbuf_fragment>
    
    #ifdef USE_MAP
    diffuseColor *= texture2D( map, vMapUv);
    #endif
    
    #include <alphatest_fragment>

    outgoingLight = diffuseColor.rgb;
    
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    
    #include <tonemapping_fragment>

}
`;
/*
    gl_FragColor = vec4(vUv.x, vUv.y, 1.0, 1.0);

    #ifdef USE_MAP
    vec4 texelColor = texture2D( map, vUv);
    diffuseColor *= texelColor;
    #endif

    outgoingLight = diffuseColor.rgb;

    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
*/
