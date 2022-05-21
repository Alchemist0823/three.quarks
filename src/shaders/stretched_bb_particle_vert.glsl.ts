export default /* glsl */`

#include <uv_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

attribute vec3 offset;
attribute float rotation;
attribute float size;
attribute vec4 color;
attribute vec3 velocity;
attribute float uvTile;

varying vec4 vColor;

#ifdef UV_TILE
uniform vec2 tileCount;
#endif

uniform float speedFactor;

void main() {

    #ifdef UV_TILE
        vUv = vec2((mod(uvTile, tileCount.x) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.x) - 1.0) + uv.y) * (1.0 / tileCount.y));
    #else
        #include <uv_vertex>
    #endif
	
    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );
    vec3 viewVelocity = normalMatrix * velocity;

    vec3 scaledPos = vec3(position.xy * size, position.z);
    mvPosition.xyz += scaledPos + dot(scaledPos, viewVelocity) * viewVelocity / length(viewVelocity) * speedFactor;

	vColor = color;

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

}
`;
/*

    vec3 instancePos = vec3(position.xy * size, position.z);
    instancePos += dot(instancePos, viewVelocity) * viewVelocity * speedFactor;
    mvPosition.xyz += instancePos;

	vColor = color; //vec4(1, 1, 1, 1); //color; //length(viewVelocity) * 0.1

	#ifndef USE_SIZEATTENUATION
		bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
		if ( isPerspective ) computedSize *= - mvPosition.z;
	#endif
 */
