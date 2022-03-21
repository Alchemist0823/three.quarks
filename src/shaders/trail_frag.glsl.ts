export default /* glsl */`
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
    
uniform sampler2D map;
uniform sampler2D alphaMap;
uniform float useMap;
uniform float useAlphaMap;
uniform float visibility;
uniform float alphaTest;
uniform vec2 repeat;

varying vec2 vUV;
varying vec4 vColor;
    
void main() {

    #include <logdepthbuf_fragment>

    vec4 c = vColor;
    if( useMap == 1. ) c *= texture2D( map, vUV * repeat );
    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUV * repeat ).a;
    if( c.a < alphaTest ) discard;
    gl_FragColor = c;

    #include <fog_fragment>
}`;
