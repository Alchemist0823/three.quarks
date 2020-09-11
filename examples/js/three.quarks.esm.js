/**
 * three.quarks v0.2.0 build Thu Sep 03 2020
 * https://github.com/Alchemist0823/three.quarks#readme
 * Copyright 2020 undefined, MIT
 */
import { Mesh, InstancedBufferGeometry, InterleavedBuffer, InterleavedBufferAttribute, InstancedBufferAttribute, DynamicDrawUsage, Uniform, Matrix3, Vector2, ShaderMaterial, AdditiveBlending, TrianglesDrawMode, DoubleSide, FrontSide, Vector4, Vector3, Math as Math$1, DefaultLoadingManager, LoaderUtils, FileLoader, LoadingManager, ImageLoader, CubeTexture, Texture, Object3D, Group, UVMapping, CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, SphericalReflectionMapping, CubeUVReflectionMapping, CubeUVRefractionMapping, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping, NearestFilter, NearestMipMapNearestFilter, NearestMipMapLinearFilter, LinearFilter, LinearMipMapNearestFilter, LinearMipMapLinearFilter } from './three.module.js';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var particle_frag = /* glsl */
`

#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec4 vColor;

void main() {

    #include <clipping_planes_fragment>
    
    vec3 outgoingLight = vec3( 0.0 );
    vec4 diffuseColor = vColor;
    
    #include <logdepthbuf_fragment>
    
    #ifdef USE_MAP
    vec4 texelColor = texture2D( map, vUv);
    diffuseColor *= texelColor;
    #endif

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

var particle_vert = /* glsl */
`

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
	
	#ifdef WORLD_SPACE
	    vec4 mvPosition = viewMatrix * vec4( offset, 1.0 );
	#else
	    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );
	#endif
	
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

var local_particle_vert = /* glsl */
`

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
	    vec4 mvPosition = viewMatrix * vec4( offset + vec3(rotatedPosition, 0.0), 1.0 );
	#else
	    vec4 mvPosition = modelViewMatrix * vec4( offset + vec3(rotatedPosition, 0.0), 1.0 );
	#endif

	vColor = color;

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

}
`;

var stretched_bb_particle_vert = /* glsl */
`

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
        vUv = vec2((mod(uvTile, tileCount.y) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.y) - 1.0) + uv.y) * (1.0 / tileCount.y));
    #else
        #include <uv_vertex>
    #endif
	
	#ifdef WORLD_SPACE
	    vec4 mvPosition = viewMatrix * vec4( offset, 1.0 );
        vec3 viewVelocity = vec3(viewMatrix * vec4(velocity, 1.0));
	#else
	    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );
        vec3 viewVelocity = vec3(modelViewMatrix * vec4(velocity, 1.0));
	#endif

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

let RenderMode;

(function (RenderMode) {
  RenderMode[RenderMode["BillBoard"] = 0] = "BillBoard";
  RenderMode[RenderMode["StretchedBillBoard"] = 1] = "StretchedBillBoard";
  RenderMode[RenderMode["LocalSpaceBillBoard"] = 2] = "LocalSpaceBillBoard";
})(RenderMode || (RenderMode = {}));

class ParticleEmitter extends Mesh {
  constructor(system, parameters) {
    super();

    _defineProperty(this, "type", "ParticleEmitter");

    _defineProperty(this, "system", void 0);

    _defineProperty(this, "geometry", void 0);

    _defineProperty(this, "material", void 0);

    _defineProperty(this, "interleavedBuffer", void 0);

    _defineProperty(this, "rotationBuffer", void 0);

    _defineProperty(this, "sizeBuffer", void 0);

    _defineProperty(this, "colorBuffer", void 0);

    _defineProperty(this, "offsetBuffer", void 0);

    _defineProperty(this, "velocityBuffer", void 0);

    _defineProperty(this, "tiling", void 0);

    _defineProperty(this, "uvTileBuffer", void 0);

    _defineProperty(this, "renderMode", void 0);

    _defineProperty(this, "speedFactor", void 0);

    this.system = system;
    this.geometry = new InstancedBufferGeometry();
    this.renderMode = parameters.renderMode || RenderMode.BillBoard;
    this.speedFactor = parameters.speedFactor || 1;
    const instancingGeometry = new Float32Array(parameters.instancingGeometry || [-0.5, -0.5, 0, 0, 0, 0.5, -0.5, 0, 1, 0, 0.5, 0.5, 0, 1, 1, -0.5, 0.5, 0, 0, 1]);
    let uniforms = {};
    let defines = {};
    this.interleavedBuffer = new InterleavedBuffer(instancingGeometry, 5);
    this.geometry.setIndex([0, 1, 2, 0, 2, 3]);
    this.geometry.setAttribute('position', new InterleavedBufferAttribute(this.interleavedBuffer, 3, 0, false));
    this.geometry.setAttribute('uv', new InterleavedBufferAttribute(this.interleavedBuffer, 2, 3, false));
    this.offsetBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle * 3), 3);
    this.offsetBuffer.setUsage(DynamicDrawUsage);
    this.geometry.setAttribute('offset', this.offsetBuffer);
    this.colorBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle * 4), 4);
    this.offsetBuffer.setUsage(DynamicDrawUsage);
    this.geometry.setAttribute('color', this.colorBuffer);
    this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle), 1);
    this.offsetBuffer.setUsage(DynamicDrawUsage);
    this.geometry.setAttribute('rotation', this.rotationBuffer);
    this.sizeBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle), 1);
    this.offsetBuffer.setUsage(DynamicDrawUsage);
    this.geometry.setAttribute('size', this.sizeBuffer);
    this.tiling = true;

    if (parameters.texture) {
      defines['USE_MAP'] = '';
      defines['USE_UV'] = '';
      uniforms['map'] = new Uniform(parameters.texture); //@ts-ignore

      uniforms['uvTransform'] = new Uniform(new Matrix3().copy(parameters.texture.matrix));
      let uTileCount = parameters.uTileCount || 1;
      let vTileCount = parameters.vTileCount || 1; //this.tiling = uTileCount > 1 || vTileCount > 1;

      this.system.tileCount = uTileCount * vTileCount;

      if (this.tiling) {
        this.uvTileBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle), 1);
        this.uvTileBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('uvTile', this.uvTileBuffer);
        defines['UV_TILE'] = '';
        uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));
      }
    }

    if (parameters.worldSpace !== undefined ? parameters.worldSpace : true) {
      defines['WORLD_SPACE'] = '';
    }

    if (this.renderMode === RenderMode.BillBoard || this.renderMode === RenderMode.LocalSpaceBillBoard) {
      let vertexShader;
      let side;

      if (this.renderMode === RenderMode.LocalSpaceBillBoard) {
        vertexShader = local_particle_vert;
        side = DoubleSide;
      } else {
        vertexShader = particle_vert;
        side = FrontSide;
      }

      this.material = new ShaderMaterial({
        uniforms: uniforms,
        defines: defines,
        vertexShader: vertexShader,
        fragmentShader: particle_frag,
        transparent: true,
        depthWrite: false,
        blending: parameters.blending || AdditiveBlending,
        side: side
      });
    } else if (this.renderMode === RenderMode.StretchedBillBoard) {
      this.velocityBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle * 3), 3);
      this.velocityBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('velocity', this.velocityBuffer);
      uniforms['speedFactor'] = new Uniform(parameters.speedFactor);
      this.material = new ShaderMaterial({
        uniforms: uniforms,
        defines: defines,
        vertexShader: stretched_bb_particle_vert,
        fragmentShader: particle_frag,
        transparent: true,
        depthWrite: false,
        blending: parameters.blending || AdditiveBlending
      });
    } else {
      throw new Error("render mode unavailable");
    } // TODO: implement boundingVolume


    this.frustumCulled = false;
  }

  update() {
    const particles = this.system.particles;
    let particleNum = this.system.particleNum;
    this.geometry.maxInstancedCount = particleNum;

    for (let i = 0; i < particleNum; i++) {
      let particle = particles[i];
      this.offsetBuffer.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
      this.colorBuffer.setXYZW(i, particle.color.x, particle.color.y, particle.color.z, particle.color.w);
      this.rotationBuffer.setX(i, particle.rotation);
      this.sizeBuffer.setX(i, particle.size);

      if (this.renderMode === RenderMode.StretchedBillBoard) {
        this.velocityBuffer.setXYZ(i, particle.velocity.x, particle.velocity.y, particle.velocity.z);
      }

      if (this.tiling) {
        this.uvTileBuffer.setX(i, particle.uvTile);
      }
    }

    if (particleNum > 0) {
      this.offsetBuffer.updateRange.count = particleNum * 3;
      this.offsetBuffer.needsUpdate = true;
      this.colorBuffer.updateRange.count = particleNum * 4;
      this.colorBuffer.needsUpdate = true;
      this.rotationBuffer.updateRange.count = particleNum;
      this.rotationBuffer.needsUpdate = true;
      this.sizeBuffer.updateRange.count = particleNum;
      this.sizeBuffer.needsUpdate = true;

      if (this.renderMode === RenderMode.StretchedBillBoard) {
        this.velocityBuffer.updateRange.count = particleNum * 3;
        this.velocityBuffer.needsUpdate = true;
      }

      if (this.tiling) {
        this.uvTileBuffer.updateRange.count = particleNum;
        this.uvTileBuffer.needsUpdate = true;
      }
    }
  }

  dispose() {
    this.geometry.dispose();
  } // extract data from the cache hash
  // remove metadata on each item
  // and return as array


  extractFromCache(cache) {
    var values = [];

    for (var key in cache) {
      var data = cache[key];
      delete data.metadata;
      values.push(data);
    }

    return values;
  }

  toJSON(meta) {
    // meta is a string when called from JSON.stringify
    var isRootObject = meta === undefined || typeof meta === 'string';
    var output = {}; // meta is a hash used to collect geometries, materials.
    // not providing it implies that this is the root object
    // being serialized.

    if (isRootObject) {
      // initialize meta obj
      meta = {
        geometries: {},
        materials: {},
        textures: {},
        images: {}
      };
      output.metadata = {
        version: 4.5,
        type: 'Object',
        generator: 'Object3D.toJSON'
      };
    } // standard Object3D serialization


    var object = {};
    object.uuid = this.uuid;
    object.type = this.type;
    if (this.name !== '') object.name = this.name;
    if (this.castShadow === true) object.castShadow = true;
    if (this.receiveShadow === true) object.receiveShadow = true;
    if (this.visible === false) object.visible = false;
    if (this.frustumCulled === false) object.frustumCulled = false;
    if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
    if (JSON.stringify(this.userData) !== '{}') object.userData = this.userData;
    object.layers = this.layers.mask;
    object.matrix = this.matrix.toArray();
    if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false; // object specific properties

    if (this.isMesh && this.drawMode !== TrianglesDrawMode) object.drawMode = this.drawMode;
    if (this.system !== null) object.ps = this.system.toJSON(meta);

    if (this.children.length > 0) {
      object.children = [];

      for (var i = 0; i < this.children.length; i++) {
        object.children.push(this.children[i].toJSON(meta).object);
      }
    }

    if (isRootObject) {
      var geometries = this.extractFromCache(meta.geometries);
      var materials = this.extractFromCache(meta.materials);
      var textures = this.extractFromCache(meta.textures);
      var images = this.extractFromCache(meta.images);
      if (geometries.length > 0) output.geometries = geometries;
      if (materials.length > 0) output.materials = materials;
      if (textures.length > 0) output.textures = textures;
      if (images.length > 0) output.images = images;
    }

    output.object = object;
    return output;
  }

}

class Particle {
  constructor() {
    _defineProperty(this, "startSpeed", 0);

    _defineProperty(this, "startColor", new Vector4());

    _defineProperty(this, "startSize", 1);

    _defineProperty(this, "velocity", new Vector3());

    _defineProperty(this, "age", 0);

    _defineProperty(this, "life", 1);

    _defineProperty(this, "angularVelocity", void 0);

    _defineProperty(this, "position", new Vector3());

    _defineProperty(this, "rotation", 0);

    _defineProperty(this, "size", 1);

    _defineProperty(this, "color", new Vector4());

    _defineProperty(this, "uvTile", 0);
  }

}

class ConstantValue {
  constructor(value) {
    this.value = value;

    _defineProperty(this, "type", void 0);

    this.type = 'value';
  }

  genValue() {
    return this.value;
  }

  toJSON() {
    return {
      type: "ConstantValue",
      value: this.value
    };
  }

  static fromJSON(json) {
    return new ConstantValue(json.value);
  }

}

class IntervalValue {
  constructor(a, b) {
    this.a = a;
    this.b = b;

    _defineProperty(this, "type", void 0);

    this.type = "value";
  }

  genValue() {
    return Math$1.lerp(this.a, this.b, Math.random());
  }

  toJSON() {
    return {
      type: "IntervalValue",
      a: this.a,
      b: this.b
    };
  }

  static fromJSON(json) {
    return new IntervalValue(json.a, json.b);
  }

}

class PiecewiseFunction {
  constructor() {
    _defineProperty(this, "functions", void 0);

    this.functions = new Array();
  }

  findFunction(t) {
    let mid = 0;
    let left = 0,
        right = this.functions.length - 1;

    while (left + 1 < right) {
      mid = (left + right) / 2;
      if (t < this.getStartX(mid)) right = mid - 1;else if (t > this.getEndX(mid)) left = mid + 1;else return mid;
    }

    for (let i = left; i <= right; i++) {
      if (t >= this.functions[i][1] && t <= this.getEndX(i)) return i;
    }

    return -1;
  }

  getStartX(index) {
    return this.functions[index][1];
  }

  setStartX(index, x) {
    if (index > 0) this.functions[index][1] = x;
  }

  getEndX(index) {
    if (index + 1 < this.functions.length) return this.functions[index + 1][1];
    return 1;
  }

  setEndX(index, x) {
    if (index + 1 < this.functions.length) this.functions[index + 1][1] = x;
  }

  getFunction(index) {
    return this.functions[index][0];
  }

  setFunction(index, func) {
    this.functions[index][0] = func;
  }

  get numOfFunctions() {
    return this.functions.length;
  }

}

class Bezier {
  constructor(p1, p2, p3, p4) {
    _defineProperty(this, "p", void 0);

    this.p = [p1, p2, p3, p4];
  }

  genValue(t) {
    const t2 = t * t;
    const t3 = t * t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return this.p[0] * mt3 + this.p[1] * mt2 * t * 3 + this.p[2] * mt * t2 * 3 + this.p[3] * t3;
  }

  derive(points) {
    let dpoints = [];

    for (let p = points, d = p.length, c = d - 1; d > 1; d--, c--) {
      let list = [];

      for (let j = 0, dpt; j < c; j++) {
        dpt = c * (p[j + 1] - p[j]);
        list.push(dpt);
      }

      dpoints.push(list);
      p = list;
    }

    return dpoints;
  }

  derivative(t) {
    const p = this.derive(this.p)[0];
    const mt = 1 - t;
    const a = mt * mt;
    const b = mt * t * 2;
    const c = t * t;
    return a * p[0] + b * p[1] + c * p[2];
  } // derivative(0) = (p[1] - p[0]) * 3
  // derivative(1) = (p[3] - p[2]) * 3


  controlCurve(d0, d1) {
    this.p[1] = d0 / 3 + this.p[0];
    this.p[2] = this.p[3] - d1 / 3;
  }

  hull(t) {
    let p = this.p;
    let _p = [],
        pt,
        q = [],
        idx = 0,
        i = 0,
        l = 0;
    q[idx++] = p[0];
    q[idx++] = p[1];
    q[idx++] = p[2];
    q[idx++] = p[3]; // we lerp between all points at each iteration, until we have 1 point left.

    while (p.length > 1) {
      _p = [];

      for (i = 0, l = p.length - 1; i < l; i++) {
        pt = t * p[i] + (1 - t) * p[i + 1];
        q[idx++] = pt;

        _p.push(pt);
      }

      p = _p;
    }

    return q;
  }

  split(t) {
    // no shortcut: use "de Casteljau" iteration.
    let q = this.hull(t);
    let result = {
      left: new Bezier(q[0], q[4], q[7], q[9]),
      right: new Bezier(q[9], q[8], q[6], q[3]),
      span: q
    };
    return result;
  }

  clone() {
    return new Bezier(this.p[0], this.p[1], this.p[2], this.p[3]);
  }

  toJSON() {
    return {
      p0: this.p[0],
      p1: this.p[1],
      p2: this.p[2],
      p3: this.p[3]
    };
  }

  static fromJSON(json) {
    return new Bezier(json.p0, json.p1, json.p2, json.p3);
  }

}

class PiecewiseBezier extends PiecewiseFunction {
  // default linear bezier
  constructor(curves = [[new Bezier(0, 1.0 / 3, 1.0 / 3 * 2, 1), 0]]) {
    super();

    _defineProperty(this, "type", void 0);

    this.type = "function";
    this.functions = curves;
  }

  genValue(t = 0) {
    let index = this.findFunction(t);

    if (index === -1) {
      console.error(t);
      return 0;
    }

    return this.functions[index][0].genValue((t - this.getStartX(index)) / (this.getEndX(index) - this.getStartX(index)));
  }

  toSVG(length, segments) {
    if (segments < 1) return "";
    let result = ["M", 0, this.functions[0][0].p[0]].join(" ");

    for (let i = 1.0 / segments; i <= 1; i += 1.0 / segments) {
      result = [result, "L", i * length, this.genValue(i)].join(" ");
    }

    return result;
  }

  toJSON() {
    return {
      type: "PiecewiseBezier",
      functions: this.functions.map(([bezier, start]) => ({
        function: bezier.toJSON(),
        start: start
      }))
    };
  }

  static fromJSON(json) {
    return new PiecewiseBezier(json.functions.map(piecewiseFunction => [Bezier.fromJSON(piecewiseFunction.function), piecewiseFunction.start]));
  }

}

function ValueGeneratorFromJSON(json) {
  switch (json.type) {
    case 'ConstantValue':
      return ConstantValue.fromJSON(json);

    case 'IntervalValue':
      return IntervalValue.fromJSON(json);

    case 'PiecewiseBezier':
      return PiecewiseBezier.fromJSON(json);

    default:
      return new ConstantValue(0);
  }
}

const ColorToJSON = color => {
  return {
    r: color.x,
    g: color.y,
    b: color.z,
    a: color.w
  };
};
const JSONToColor = json => {
  return new Vector4(json.r, json.g, json.b, json.a);
};

class RandomColor {
  constructor(a, b) {
    this.a = a;
    this.b = b;

    _defineProperty(this, "type", void 0);

    this.type = "value";
  }

  genColor(color) {
    const rand = Math.random();
    return color.copy(this.a).lerp(this.b, rand);
  }

  toJSON() {
    return {
      type: "RandomColor",
      a: ColorToJSON(this.a),
      b: ColorToJSON(this.b)
    };
  }

  static fromJSON(json) {
    return new RandomColor(JSONToColor(json.a), JSONToColor(json.b));
  }

}

class ColorRange {
  constructor(a, b) {
    this.a = a;
    this.b = b;

    _defineProperty(this, "type", void 0);

    this.type = "function";
  }

  genColor(color, t) {
    return color.copy(this.a).lerp(this.b, t);
  }

  toJSON() {
    return {
      type: "ColorRange",
      a: ColorToJSON(this.a),
      b: ColorToJSON(this.b)
    };
  }

  static fromJSON(json) {
    return new ColorRange(JSONToColor(json.a), JSONToColor(json.b));
  }

}

class ConstantColor {
  constructor(color) {
    this.color = color;

    _defineProperty(this, "type", void 0);

    this.type = 'value';
  }

  genColor(color) {
    return color.copy(this.color);
  }

  toJSON() {
    return {
      type: "ConstantColor",
      color: ColorToJSON(this.color)
    };
  }

  static fromJSON(json) {
    return new ConstantColor(JSONToColor(json.color));
  }

}
function ColorGeneratorFromJSON(json) {
  switch (json.type) {
    case 'ConstantColor':
      return ConstantColor.fromJSON(json);

    case 'ColorRange':
      return ColorRange.fromJSON(json);

    case 'RandomColor':
      return RandomColor.fromJSON(json);

    default:
      return new ConstantColor(new Vector4(1, 1, 1, 1));
  }
}

class ColorOverLife {
  constructor(func) {
    this.func = func;
  }

  initialize(particle) {}

  update(particle, delta) {
    this.func.genColor(particle.color, particle.age / particle.life).dot(particle.startColor);
  }

  toJSON() {
    return {
      type: 'ColorOverLife',
      func: this.func.toJSON()
    };
  }

}

class RotationOverLife {
  constructor(angularVelocityFunc) {
    this.angularVelocityFunc = angularVelocityFunc;
  }

  initialize(particle) {
    if (this.angularVelocityFunc.type === 'value') {
      particle.angularVelocity = this.angularVelocityFunc.genValue();
    } else {
      particle.angularVelocity = 0;
    }
  }

  update(particle, delta) {
    if (this.angularVelocityFunc.type === 'value') {
      particle.rotation += delta * particle.angularVelocity;
    } else {
      particle.rotation += delta * this.angularVelocityFunc.genValue(particle.age / particle.life);
    }
  }

  toJSON() {
    return {
      type: 'RotationOverLife',
      func: this.angularVelocityFunc.toJSON()
    };
  }

}

class SizeOverLife {
  initialize(particle) {}

  constructor(func) {
    this.func = func;
  }

  update(particle) {
    particle.size = particle.startSize * this.func.genValue(particle.age / particle.life);
  }

  toJSON() {
    return {
      type: 'SizeOverLife',
      func: this.func.toJSON()
    };
  }

}

class FrameOverLife {
  constructor(func) {
    this.func = func;
  }

  initialize(particle) {}

  update(particle, delta) {
    particle.uvTile = Math.floor(this.func.genValue(particle.age / particle.life));
  }

  toJSON() {
    return {
      type: 'FrameOverLife',
      func: this.func.toJSON()
    };
  }

}

function BehaviorFromJSON(json) {
  switch (json.type) {
    case 'ColorOverLife':
      return new ColorOverLife(ColorGeneratorFromJSON(json.func));

    case 'RotationOverLife':
      return new RotationOverLife(ValueGeneratorFromJSON(json.func));

    case 'SizeOverLife':
      return new SizeOverLife(ValueGeneratorFromJSON(json.func));

    case 'FrameOverLife':
      return new FrameOverLife(ValueGeneratorFromJSON(json.func));

    default:
      return new ColorOverLife(new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 1)));
  }
}

class ConeEmitter {
  // [0, Math.PI * 2]
  // [0, Math.PI / 2]
  constructor(parameters = {}) {
    _defineProperty(this, "radius", void 0);

    _defineProperty(this, "arc", void 0);

    _defineProperty(this, "thickness", void 0);

    _defineProperty(this, "angle", void 0);

    this.radius = parameters.radius || 10;
    this.arc = parameters.arc || 2.0 * Math.PI;
    this.thickness = parameters.thickness || 1;
    this.angle = parameters.angle || Math.PI / 6;
  }

  initialize(p) {
    const u = Math.random();

    const rand = Math$1.lerp(1 - this.thickness, 1, Math.random());

    const theta = u * this.arc;
    const r = Math.sqrt(rand);
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    p.position.x = r * cosTheta;
    p.position.y = r * sinTheta;
    p.position.z = 0;
    const angle = this.angle * r;
    p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed); //const v = Math.random();

    p.position.multiplyScalar(this.radius);
  }

  toJSON() {
    return {
      type: "cone",
      radius: this.radius,
      arc: this.arc,
      thickness: this.thickness,
      angle: this.angle
    };
  }

}

class SphereEmitter {
  //[0, 1]
  constructor(parameters = {}) {
    _defineProperty(this, "radius", void 0);

    _defineProperty(this, "arc", void 0);

    _defineProperty(this, "thickness", void 0);

    this.radius = parameters.radius || 10;
    this.arc = parameters.arc || 2.0 * Math.PI;
    this.thickness = parameters.thickness || 1;
  }

  initialize(p) {
    const u = Math.random();
    const v = Math.random();

    const rand = Math$1.lerp(1 - this.thickness, 1, Math.random());

    const theta = u * this.arc;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(rand);
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    p.position.x = r * sinPhi * cosTheta;
    p.position.y = r * sinPhi * sinTheta;
    p.position.z = r * cosPhi;
    p.velocity.setScalar(0).addScaledVector(p.position, p.startSpeed);
    p.position.multiplyScalar(this.radius);
  }

  toJSON() {
    return {
      type: "sphere",
      radius: this.radius,
      arc: this.arc,
      thickness: this.thickness
    };
  }

}

class PointEmitter {
  constructor() {}

  initialize(p) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random());
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    p.velocity.x = r * sinPhi * cosTheta;
    p.velocity.y = r * sinPhi * sinTheta;
    p.velocity.z = r * cosPhi;
    p.velocity.multiplyScalar(p.startSpeed);
    p.position.setScalar(0);
  }

  toJSON() {
    return {
      type: 'point'
    };
  }

}

class DonutEmitter {
  // [0, Math.PI * 2]
  // [0, Math.PI / 2]
  constructor(parameters = {}) {
    _defineProperty(this, "radius", void 0);

    _defineProperty(this, "arc", void 0);

    _defineProperty(this, "thickness", void 0);

    _defineProperty(this, "angle", void 0);

    this.radius = parameters.radius || 10;
    this.arc = parameters.arc || 2.0 * Math.PI;
    this.thickness = parameters.thickness || 1;
    this.angle = parameters.angle || Math.PI / 6;
  }

  initialize(p) {
    const u = Math.random();

    const rand = Math$1.lerp(this.thickness, 1, Math.random());

    const theta = u * this.arc;
    const r = Math.sqrt(rand);
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    p.position.x = r * cosTheta;
    p.position.y = r * sinTheta;
    p.position.z = 0;
    const angle = this.angle * r;
    p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed); //const v = Math.random();

    p.position.multiplyScalar(this.radius);
  }

  toJSON() {
    return {
      type: "donut",
      radius: this.radius,
      arc: this.arc,
      thickness: this.thickness,
      angle: this.angle
    };
  }

}

class ParticleSystem {
  // parameters
  // runtime data
  get texture() {
    return this.emitter.material.uniforms.map.value;
  }

  set texture(texture) {
    this.emitter.material.uniforms.map.value = texture;
  }

  get uTileCount() {
    return this.emitter.material.uniforms.tileCount.value.x;
  }

  set uTileCount(u) {
    this.emitter.material.uniforms.tileCount.value.x = u;
  }

  get vTileCount() {
    return this.emitter.material.uniforms.tileCount.value.y;
  }

  set vTileCount(v) {
    this.emitter.material.uniforms.tileCount.value.y = v;
  }

  get renderMode() {
    return this.emitter.renderMode;
  }

  get speedFactor() {
    return this.emitter.material.uniforms.speedFactor.value;
  }

  set speedFactor(v) {
    this.emitter.material.uniforms.speedFactor.value = v;
  }

  get blending() {
    return this.emitter.material.blending;
  }

  set blending(blending) {
    this.emitter.material.blending = blending;
  }

  constructor(parameters = {}) {
    _defineProperty(this, "autoDestroy", void 0);

    _defineProperty(this, "looping", void 0);

    _defineProperty(this, "duration", void 0);

    _defineProperty(this, "maxParticle", void 0);

    _defineProperty(this, "startLife", void 0);

    _defineProperty(this, "startSpeed", void 0);

    _defineProperty(this, "startRotation", void 0);

    _defineProperty(this, "startSize", void 0);

    _defineProperty(this, "startColor", void 0);

    _defineProperty(this, "startTileIndex", void 0);

    _defineProperty(this, "emissionOverTime", void 0);

    _defineProperty(this, "emissionOverDistance", void 0);

    _defineProperty(this, "emissionBursts", void 0);

    _defineProperty(this, "tileCount", 1);

    _defineProperty(this, "worldSpace", void 0);

    _defineProperty(this, "particleNum", void 0);

    _defineProperty(this, "burstIndex", void 0);

    _defineProperty(this, "burstWaveIndex", void 0);

    _defineProperty(this, "time", void 0);

    _defineProperty(this, "paused", void 0);

    _defineProperty(this, "waitEmiting", void 0);

    _defineProperty(this, "emitEnded", void 0);

    _defineProperty(this, "markForDestroy", void 0);

    _defineProperty(this, "behaviors", void 0);

    _defineProperty(this, "particles", void 0);

    _defineProperty(this, "emitterShape", void 0);

    _defineProperty(this, "emitter", void 0);

    _defineProperty(this, "normalMatrix", new Matrix3());

    this.autoDestroy = parameters.autoDestroy || false;
    this.duration = parameters.duration || 1;
    this.maxParticle = parameters.maxParticle || 100;
    this.looping = parameters.looping === undefined ? true : parameters.looping;
    this.startLife = parameters.startLife || new ConstantValue(5);
    this.startSpeed = parameters.startSpeed || new ConstantValue(0);
    this.startRotation = parameters.startRotation || new ConstantValue(0);
    this.startSize = parameters.startSize || new ConstantValue(1);
    this.startColor = parameters.startColor || new ConstantColor(new Vector4(1, 1, 1, 1));
    this.emissionOverTime = parameters.emissionOverTime || new ConstantValue(10);
    this.emissionOverDistance = parameters.emissionOverDistance || new ConstantValue(0);
    this.emissionBursts = parameters.emissionBursts || [];
    this.emitterShape = parameters.shape || new SphereEmitter();
    this.behaviors = parameters.behaviors || new Array();
    if (parameters.worldSpace === undefined) parameters.worldSpace = true;
    this.worldSpace = parameters.worldSpace;
    this.particles = new Array();
    this.startTileIndex = parameters.startTileIndex || 0;
    this.emitter = new ParticleEmitter(this, parameters);
    this.particleNum = 0;
    this.burstIndex = 0;
    this.burstWaveIndex = 0;
    this.time = 0;
    this.paused = false;
    this.waitEmiting = 0;
    this.emitEnded = false;
    this.markForDestroy = false;
  }

  pause() {
    this.paused = true;
  }

  play() {
    this.paused = false;
  }

  spawn() {
    while (this.particleNum >= this.particles.length) {
      this.particles.push(new Particle());
    }

    this.particleNum++;
    const particle = this.particles[this.particleNum - 1];
    this.startColor.genColor(particle.startColor, this.time);
    particle.color.copy(particle.startColor);
    particle.startSpeed = this.startSpeed.genValue(this.time);
    particle.life = this.startLife.genValue(this.time);
    particle.age = 0;
    particle.rotation = this.startRotation.genValue(this.time);
    particle.startSize = particle.size = this.startSize.genValue(this.time);
    particle.uvTile = this.startTileIndex;
    this.emitterShape.initialize(particle);

    if (this.worldSpace) {
      particle.position.applyMatrix4(this.emitter.matrixWorld);
      particle.velocity.applyMatrix3(this.normalMatrix);
    }

    for (let j = 0; j < this.behaviors.length; j++) {
      this.behaviors[j].initialize(particle);
    }
  }

  endEmit() {
    this.emitEnded = true;

    if (this.autoDestroy) {
      this.markForDestroy = true;
    }
  }

  dispose() {
    this.emitter.dispose();
    if (this.emitter.parent) this.emitter.parent.remove(this.emitter);
  }

  restart() {
    this.paused = false;
    this.particleNum = 0;
    this.burstIndex = 0;
    this.burstWaveIndex = 0;
    this.time = 0;
    this.waitEmiting = 0;
    this.emitEnded = false;
    this.markForDestroy = false;
  }

  update(delta) {
    if (delta > 0.1) delta = 0.1;
    if (this.paused) return;

    if (this.emitEnded && this.particleNum === 0) {
      if (this.markForDestroy && this.emitter.parent) this.dispose();
      return;
    }

    if (this.time > this.duration) {
      if (this.looping) {
        this.time -= this.duration;
      } else {
        if (!this.emitEnded) {
          this.endEmit();
        }
      }
    }

    this.normalMatrix.getNormalMatrix(this.emitter.matrixWorld); // particle die

    for (let i = 0; i < this.particleNum; i++) {
      let particle = this.particles[i];

      if (particle.age >= particle.life) {
        this.particles[i] = this.particles[this.particleNum - 1];
        this.particles[this.particleNum - 1] = particle;
        this.particleNum--;
        i--;
      }
    } // spawn


    while (this.waitEmiting > 0 && this.particleNum < this.maxParticle && !this.emitEnded) {
      this.spawn();
      this.waitEmiting--;
    } // spawn burst


    while (this.burstIndex < this.emissionBursts.length && this.emissionBursts[this.burstIndex].time >= this.time) {
      if (Math.random() < this.emissionBursts[this.burstIndex].probability) {
        let count = this.emissionBursts[this.burstIndex].count;

        while (count > 0 && this.particleNum < this.maxParticle) {
          this.spawn();
          count--;
        }
      }

      this.burstIndex++;
    }

    for (let i = 0; i < this.particleNum; i++) {
      let particle = this.particles[i];

      for (let j = 0; j < this.behaviors.length; j++) {
        this.behaviors[j].update(particle, delta);
      }

      particle.position.addScaledVector(particle.velocity, delta);
      particle.age += delta;
    }

    this.emitter.update();

    if (!this.emitEnded) {
      this.waitEmiting += delta * this.emissionOverTime.genValue(this.time);
    }

    this.time += delta;
  }

  toJSON(meta) {
    this.texture.toJSON(meta);

    if (this.texture.image !== undefined) {
      const image = this.texture.image;
      meta.images[image.uuid] = {
        uuid: image.uuid,
        url: this.texture.name
      };
    }

    return {
      autoDestroy: this.autoDestroy,
      looping: this.looping,
      duration: this.duration,
      maxParticle: this.maxParticle,
      shape: this.emitterShape.toJSON(),
      startLife: this.startLife.toJSON(),
      startSpeed: this.startSpeed.toJSON(),
      startRotation: this.startRotation.toJSON(),
      startSize: this.startSize.toJSON(),
      startColor: this.startColor.toJSON(),
      emissionOverTime: this.emissionOverTime.toJSON(),
      emissionOverDistance: this.emissionOverDistance.toJSON(),
      emissionBursts: this.emissionBursts,
      instancingGeometry: Array.from(this.emitter.interleavedBuffer.array),
      renderMode: this.renderMode,
      speedFactor: this.renderMode == RenderMode.StretchedBillBoard ? this.speedFactor : 0,
      texture: this.texture.uuid,
      startTileIndex: this.startTileIndex,
      uTileCount: this.uTileCount,
      vTileCount: this.vTileCount,
      blending: this.blending,
      behaviors: this.behaviors.map(behavior => behavior.toJSON()),
      worldSpace: this.worldSpace
    };
  }

  static fromJSON(json, textures) {
    let shape;

    switch (json.shape.type) {
      case 'cone':
        shape = new ConeEmitter(json.shape);
        break;

      case 'donut':
        shape = new DonutEmitter(json.shape);
        break;

      case 'point':
        shape = new PointEmitter();
        break;

      case 'sphere':
        shape = new SphereEmitter(json.shape);
        break;

      default:
        shape = new PointEmitter();
        break;
    }

    return new ParticleSystem({
      autoDestroy: json.autoDestroy,
      looping: json.looping,
      duration: json.duration,
      maxParticle: json.maxParticle,
      shape: shape,
      startLife: ValueGeneratorFromJSON(json.startLife),
      startSpeed: ValueGeneratorFromJSON(json.startSpeed),
      startRotation: ValueGeneratorFromJSON(json.startRotation),
      startSize: ValueGeneratorFromJSON(json.startSize),
      startColor: ColorGeneratorFromJSON(json.startColor),
      emissionOverTime: ValueGeneratorFromJSON(json.emissionOverTime),
      emissionOverDistance: ValueGeneratorFromJSON(json.emissionOverDistance),
      emissionBursts: json.emissionBursts,
      instancingGeometry: json.instancingGeometry,
      renderMode: json.renderMode,
      speedFactor: json.speedFactor,
      texture: textures[json.texture],
      startTileIndex: json.startTileIndex,
      uTileCount: json.uTileCount,
      vTileCount: json.vTileCount,
      blending: json.blending,
      behaviors: json.behaviors.map(behavior => BehaviorFromJSON(behavior)),
      worldSpace: json.worldSpace
    });
  }

  addBehavior(behavior) {
    this.behaviors.push(behavior);
  }

}

const TEXTURE_MAPPING = {
  UVMapping: UVMapping,
  CubeReflectionMapping: CubeReflectionMapping,
  CubeRefractionMapping: CubeRefractionMapping,
  EquirectangularReflectionMapping: EquirectangularReflectionMapping,
  EquirectangularRefractionMapping: EquirectangularRefractionMapping,
  SphericalReflectionMapping: SphericalReflectionMapping,
  CubeUVReflectionMapping: CubeUVReflectionMapping,
  CubeUVRefractionMapping: CubeUVRefractionMapping
};
const TEXTURE_WRAPPING = {
  RepeatWrapping: RepeatWrapping,
  ClampToEdgeWrapping: ClampToEdgeWrapping,
  MirroredRepeatWrapping: MirroredRepeatWrapping
};
const TEXTURE_FILTER = {
  NearestFilter: NearestFilter,
  NearestMipmapNearestFilter: NearestMipMapNearestFilter,
  NearestMipmapLinearFilter: NearestMipMapLinearFilter,
  LinearFilter: LinearFilter,
  LinearMipmapNearestFilter: LinearMipMapNearestFilter,
  LinearMipmapLinearFilter: LinearMipMapLinearFilter
};
class QuarksLoader {
  constructor(manager) {
    _defineProperty(this, "manager", void 0);

    _defineProperty(this, "crossOrigin", "anonymous");

    _defineProperty(this, "path", void 0);

    _defineProperty(this, "resourcePath", void 0);

    this.manager = manager !== undefined ? manager : DefaultLoadingManager;
    this.resourcePath = '';
  }

  setPath(value) {
    this.path = value;
    return this;
  }

  setResourcePath(value) {
    this.resourcePath = value;
    return this;
  }

  setCrossOrigin(value) {
    this.crossOrigin = value;
    return this;
  }

  load(url, onLoad, onProgress, onError) {
    var scope = this;
    var path = this.path === undefined ? LoaderUtils.extractUrlBase(url) : this.path;
    this.resourcePath = this.resourcePath || path;
    var loader = new FileLoader(scope.manager);
    if (this.path) loader.setPath(this.path);
    loader.load(url, function (text) {
      var json = null;

      try {
        json = JSON.parse(text);
      } catch (error) {
        if (onError !== undefined) onError(error);
        console.error('THREE:ObjectLoader: Can\'t parse ' + url + '.', error.message);
        return;
      }

      var metadata = json.metadata;

      if (metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry') {
        console.error('THREE.ObjectLoader: Can\'t load ' + url);
        return;
      }

      scope.parse(json, onLoad);
    }, onProgress, onError);
  }

  loadImage(loader, url) {
    const scope = this;
    scope.manager.itemStart(url);
    return loader.load(url, function () {
      scope.manager.itemEnd(url);
    }, undefined, function () {
      scope.manager.itemError(url);
      scope.manager.itemEnd(url);
    });
  }

  parseImages(json, onLoad) {
    var scope = this;
    var images = {};

    if (json !== undefined && json.length > 0) {
      var manager = new LoadingManager(onLoad);
      var loader = new ImageLoader(manager);
      loader.setCrossOrigin(this.crossOrigin);

      for (var i = 0, il = json.length; i < il; i++) {
        var image = json[i];
        var url = image.url;

        if (Array.isArray(url)) {
          // load array of images e.g CubeTexture
          images[image.uuid] = [];

          for (var j = 0, jl = url.length; j < jl; j++) {
            var currentUrl = url[j];
            var path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(currentUrl) ? currentUrl : scope.resourcePath + currentUrl;
            images[image.uuid].push(this.loadImage(loader, path));
          }
        } else {
          // load single image
          var path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(image.url) ? image.url : scope.resourcePath + image.url;
          images[image.uuid] = this.loadImage(loader, path);
        }
      }
    }

    return images;
  }

  parseTextures(json, images) {
    function parseConstant(value, type) {
      if (typeof value === 'number') return value;
      console.warn('THREE.ObjectLoader.parseTexture: Constant should be in numeric form.', value);
      return type[value];
    }

    var textures = {};

    if (json !== undefined) {
      for (var i = 0, l = json.length; i < l; i++) {
        var data = json[i];

        if (data.image === undefined) {
          console.warn('THREE.ObjectLoader: No "image" specified for', data.uuid);
        }

        if (images[data.image] === undefined) {
          console.warn('THREE.ObjectLoader: Undefined image', data.image);
        }

        var texture;

        if (Array.isArray(images[data.image])) {
          texture = new CubeTexture(images[data.image]);
        } else {
          texture = new Texture(images[data.image]);
        }

        texture.needsUpdate = true;
        texture.uuid = data.uuid;
        if (data.name !== undefined) texture.name = data.name;
        if (data.mapping !== undefined) texture.mapping = parseConstant(data.mapping, TEXTURE_MAPPING);
        if (data.offset !== undefined) texture.offset.fromArray(data.offset);
        if (data.repeat !== undefined) texture.repeat.fromArray(data.repeat);
        if (data.center !== undefined) texture.center.fromArray(data.center);
        if (data.rotation !== undefined) texture.rotation = data.rotation;

        if (data.wrap !== undefined) {
          texture.wrapS = parseConstant(data.wrap[0], TEXTURE_WRAPPING);
          texture.wrapT = parseConstant(data.wrap[1], TEXTURE_WRAPPING);
        }

        if (data.format !== undefined) texture.format = data.format;
        if (data.type !== undefined) texture.type = data.type;
        if (data.encoding !== undefined) texture.encoding = data.encoding;
        if (data.minFilter !== undefined) texture.minFilter = parseConstant(data.minFilter, TEXTURE_FILTER);
        if (data.magFilter !== undefined) texture.magFilter = parseConstant(data.magFilter, TEXTURE_FILTER);
        if (data.anisotropy !== undefined) texture.anisotropy = data.anisotropy;
        if (data.flipY !== undefined) texture.flipY = data.flipY;
        if (data.premultiplyAlpha !== undefined) texture.premultiplyAlpha = data.premultiplyAlpha;
        if (data.unpackAlignment !== undefined) texture.unpackAlignment = data.unpackAlignment;
        textures[data.uuid] = texture;
      }
    }

    return textures;
  }

  parseObject(data, textures) {
    var object;

    switch (data.type) {
      case 'ParticleEmitter':
        object = ParticleSystem.fromJSON(data.ps, textures).emitter;
        break;

      case 'Group':
        object = new Group();
        break;

      default:
        object = new Object3D();
    }

    object.uuid = data.uuid;
    if (data.name !== undefined) object.name = data.name;

    if (data.matrix !== undefined) {
      object.matrix.fromArray(data.matrix);
      if (data.matrixAutoUpdate !== undefined) object.matrixAutoUpdate = data.matrixAutoUpdate;
      if (object.matrixAutoUpdate) object.matrix.decompose(object.position, object.quaternion, object.scale);
    } else {
      if (data.position !== undefined) object.position.fromArray(data.position);
      if (data.rotation !== undefined) object.rotation.fromArray(data.rotation);
      if (data.quaternion !== undefined) object.quaternion.fromArray(data.quaternion);
      if (data.scale !== undefined) object.scale.fromArray(data.scale);
    }

    if (data.castShadow !== undefined) object.castShadow = data.castShadow;
    if (data.receiveShadow !== undefined) object.receiveShadow = data.receiveShadow;
    if (data.visible !== undefined) object.visible = data.visible;
    if (data.frustumCulled !== undefined) object.frustumCulled = data.frustumCulled;
    if (data.renderOrder !== undefined) object.renderOrder = data.renderOrder;
    if (data.userData !== undefined) object.userData = data.userData;
    if (data.layers !== undefined) object.layers.mask = data.layers;

    if (data.children !== undefined) {
      var children = data.children;

      for (var i = 0; i < children.length; i++) {
        object.add(this.parseObject(children[i], textures));
      }
    }

    return object;
  }

  parse(json, onLoad) {
    var images = this.parseImages(json.images, function () {
      if (onLoad !== undefined) onLoad(object);
    });
    var textures = this.parseTextures(json.textures, images);
    var object = this.parseObject(json.object, textures);

    if (json.images === undefined || json.images.length === 0) {
      if (onLoad !== undefined) onLoad(object);
    }

    return object;
  }

}

class Gradient extends PiecewiseFunction {
  // default linear bezier
  constructor(functions = [[new ColorRange(new Vector4(0, 0, 0, 1), new Vector4(1, 1, 1, 1)), 0]]) {
    super();

    _defineProperty(this, "type", void 0);

    this.type = "function";
    this.functions = functions;
  }

  genColor(color, t) {
    let index = this.findFunction(t);

    if (index === -1) {
      console.error(t);
      return color.copy(this.functions[0][0].a);
    }

    return this.getFunction(index).genColor(color, t);
  }

  toJSON() {
    return {
      type: "Gradient",
      functions: this.functions.map(([range, start]) => ({
        function: range.toJSON(),
        start: start
      }))
    };
  }

  static fromJSON(json) {
    return new Gradient(json.functions.map(piecewiseFunction => [ColorRange.fromJSON(piecewiseFunction.function), piecewiseFunction.start]));
  }

}

export { BehaviorFromJSON, Bezier, ColorGeneratorFromJSON, ColorOverLife, ColorRange, ConeEmitter, ConstantColor, ConstantValue, DonutEmitter, FrameOverLife, Gradient, IntervalValue, Particle, ParticleEmitter, ParticleSystem, PiecewiseBezier, PiecewiseFunction, PointEmitter, QuarksLoader, RandomColor, RenderMode, RotationOverLife, SizeOverLife, SphereEmitter, ValueGeneratorFromJSON };
