export default /* glsl */`

#include <uv_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

attribute vec3 offset;
attribute float rotation;
attribute float size;
attribute vec4 color;
attribute float uvTile;

varying vec4 vColor;

#ifdef UV_TILE
uniform vec2 tileCount;
#endif

void main() {

    #ifdef UV_TILE
        vUv = vec2((mod(uvTile, tileCount.x) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.x) - 1.0) + uv.y) * (1.0 / tileCount.y));
    #else
        #include <uv_vertex>
    #endif
	
    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );
	
    vec2 alignedPosition = ( position.xy ) * size;
    
    vec2 rotatedPosition;
    rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
    rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
    
    mvPosition.xy += rotatedPosition;

	vColor = color;

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

}
`;
/*
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
		if ( isPerspective ) computedSize *= - mvPosition.z;
	#endif
 */
