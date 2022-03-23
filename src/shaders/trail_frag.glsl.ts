export default /* glsl */`

#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform sampler2D alphaMap;
uniform float useAlphaMap;
uniform float visibility;
uniform float alphaTest;
uniform vec2 repeat;

varying vec4 vColor;
    
void main() {
    #include <clipping_planes_fragment>
    #include <logdepthbuf_fragment>

    vec4 c = vColor;
    
    #ifdef USE_MAP
    c *= texture2D( map, vUv * repeat );
    #endif
    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUv * repeat ).a;
    if( c.a < alphaTest ) discard;
    gl_FragColor = c;

    #include <fog_fragment>
    #include <tonemapping_fragment>
}`;
