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
        vUv = vec2((mod(uvTile, tileCount.y) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.y) - 1.0) + uv.y) * (1.0 / tileCount.y));
    #else
        #include <uv_vertex>
    #endif
	
    vec2 alignedPosition = ( position.xy ) * size;
    
    vec2 rotatedPosition;
    rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
    rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
    
	#ifdef WORLD_SPACE
	    vec4 mvPosition = viewMatrix * vec4( offset + vec3(rotatedPosition, position.z), 1.0 );
	#else
	    vec4 mvPosition = modelViewMatrix * vec4( offset + vec3(rotatedPosition, position.z), 1.0 );
	#endif

	vColor = color;

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

}
`;
