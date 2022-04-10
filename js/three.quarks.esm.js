/**
 * three.quarks v0.7.0 build Sun Apr 10 2022
 * https://github.com/Alchemist0823/three.quarks#readme
 * Copyright 2022 Alchemist0823 <the.forrest.sun@gmail.com>, MIT
 */
import { Object3D, Vector4, Vector3, MathUtils, Quaternion, Line3, Matrix4, Triangle, Mesh, PlaneBufferGeometry, Matrix3, NormalBlending, InstancedBufferGeometry, InstancedBufferAttribute, DynamicDrawUsage, Uniform, Vector2, ShaderMaterial, AdditiveBlending, DoubleSide, FrontSide, BufferGeometry, BufferAttribute, DefaultLoadingManager, LoaderUtils, FileLoader, LoadingManager, ImageLoader, DataTexture, Source, Shape, BufferGeometryLoader, CubeTexture, Texture, Group, BoxGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, DodecahedronGeometry, EdgesGeometry, ExtrudeGeometry, IcosahedronGeometry, LatheGeometry, OctahedronGeometry, PlaneGeometry, PolyhedronGeometry, RingGeometry, ShapeGeometry, SphereGeometry, TetrahedronGeometry, TorusGeometry, TorusKnotGeometry, TubeGeometry, WireframeGeometry, UVMapping, CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, CubeUVReflectionMapping, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping, NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, LinearFilter, LinearMipmapNearestFilter, LinearMipmapLinearFilter } from './three.module.js';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

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

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

var ParticleEmitter = /*#__PURE__*/function (_Object3D) {
  _inherits(ParticleEmitter, _Object3D);

  var _super = _createSuper(ParticleEmitter);

  //interleavedBuffer: InterleavedBuffer;
  function ParticleEmitter(system) {
    var _this;

    _classCallCheck(this, ParticleEmitter);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "type", "ParticleEmitter");

    _defineProperty(_assertThisInitialized(_this), "system", void 0);

    _this.system = system; // this.visible = false;
    // TODO: implement boundingVolume

    return _this;
  }

  _createClass(ParticleEmitter, [{
    key: "clone",
    value: function clone() {
      var system = this.system.clone();
      system.emitter.copy(this, true);
      return system.emitter;
    }
  }, {
    key: "dispose",
    value: function dispose() {} // extract data from the cache hash
    // remove metadata on each item
    // and return as array

  }, {
    key: "extractFromCache",
    value: function extractFromCache(cache) {
      var values = [];

      for (var key in cache) {
        var data = cache[key];
        delete data.metadata;
        values.push(data);
      }

      return values;
    }
  }, {
    key: "toJSON",
    value: function toJSON(meta) {
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
          images: {},
          shapes: {},
          skeletons: {},
          animations: {},
          nodes: {}
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

      if (this.system !== null) object.ps = this.system.toJSON(meta);

      if (this.children.length > 0) {
        object.children = [];

        for (var i = 0; i < this.children.length; i++) {
          if (this.children[i].type !== "ParticleSystemPreview") {
            object.children.push(this.children[i].toJSON(meta).object);
          }
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
  }]);

  return ParticleEmitter;
}(Object3D);

var SpriteParticle = /*#__PURE__*/function () {
  function SpriteParticle() {
    _classCallCheck(this, SpriteParticle);

    _defineProperty(this, "parentMatrix", void 0);

    _defineProperty(this, "startSpeed", 0);

    _defineProperty(this, "startColor", new Vector4());

    _defineProperty(this, "startSize", 1);

    _defineProperty(this, "position", new Vector3());

    _defineProperty(this, "velocity", new Vector3());

    _defineProperty(this, "age", 0);

    _defineProperty(this, "life", 1);

    _defineProperty(this, "size", 1);

    _defineProperty(this, "angularVelocity", void 0);

    _defineProperty(this, "rotation", 0);

    _defineProperty(this, "color", new Vector4());

    _defineProperty(this, "uvTile", 0);
  }

  _createClass(SpriteParticle, [{
    key: "died",
    get: function get() {
      return this.age >= this.life;
    }
  }]);

  return SpriteParticle;
}();
var RecordState = /*#__PURE__*/_createClass(function RecordState(position, size, color) {
  _classCallCheck(this, RecordState);

  this.position = position;
  this.size = size;
  this.color = color;
});
var TrailParticle = /*#__PURE__*/function () {
  function TrailParticle() {
    _classCallCheck(this, TrailParticle);

    _defineProperty(this, "parentMatrix", void 0);

    _defineProperty(this, "startSpeed", 0);

    _defineProperty(this, "startColor", new Vector4());

    _defineProperty(this, "startSize", 1);

    _defineProperty(this, "position", new Vector3());

    _defineProperty(this, "localPosition", void 0);

    _defineProperty(this, "velocity", new Vector3());

    _defineProperty(this, "age", 0);

    _defineProperty(this, "life", 1);

    _defineProperty(this, "size", 1);

    _defineProperty(this, "length", 100);

    _defineProperty(this, "color", new Vector4());

    _defineProperty(this, "previous", []);

    _defineProperty(this, "uvTile", 0);
  }

  _createClass(TrailParticle, [{
    key: "recordCurrentState",
    value: function recordCurrentState() {
      this.previous.push(new RecordState(this.position.clone(), this.size, this.color.clone()));

      while (this.previous.length > this.length) {
        this.previous.shift();
      }
    }
  }, {
    key: "died",
    get: function get() {
      return this.age >= this.life;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.previous.length = 0;
    }
  }]);

  return TrailParticle;
}();

var ConstantValue = /*#__PURE__*/function () {
  function ConstantValue(value) {
    _classCallCheck(this, ConstantValue);

    this.value = value;

    _defineProperty(this, "type", void 0);

    this.type = 'value';
  }

  _createClass(ConstantValue, [{
    key: "genValue",
    value: function genValue() {
      return this.value;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "ConstantValue",
        value: this.value
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ConstantValue(this.value);
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new ConstantValue(json.value);
    }
  }]);

  return ConstantValue;
}();

var IntervalValue = /*#__PURE__*/function () {
  function IntervalValue(a, b) {
    _classCallCheck(this, IntervalValue);

    this.a = a;
    this.b = b;

    _defineProperty(this, "type", void 0);

    this.type = "value";
  }

  _createClass(IntervalValue, [{
    key: "genValue",
    value: function genValue() {
      return MathUtils.lerp(this.a, this.b, Math.random());
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "IntervalValue",
        a: this.a,
        b: this.b
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new IntervalValue(this.a, this.b);
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new IntervalValue(json.a, json.b);
    }
  }]);

  return IntervalValue;
}();

var PiecewiseFunction = /*#__PURE__*/function () {
  function PiecewiseFunction() {
    _classCallCheck(this, PiecewiseFunction);

    _defineProperty(this, "functions", void 0);

    this.functions = new Array();
  }

  _createClass(PiecewiseFunction, [{
    key: "findFunction",
    value: function findFunction(t) {
      var mid = 0;
      var left = 0,
          right = this.functions.length - 1;

      while (left + 1 < right) {
        mid = Math.floor((left + right) / 2);
        if (t < this.getStartX(mid)) right = mid - 1;else if (t > this.getEndX(mid)) left = mid + 1;else return mid;
      }

      for (var i = left; i <= right; i++) {
        if (t >= this.functions[i][1] && t <= this.getEndX(i)) return i;
      }

      return -1;
    }
  }, {
    key: "getStartX",
    value: function getStartX(index) {
      return this.functions[index][1];
    }
  }, {
    key: "setStartX",
    value: function setStartX(index, x) {
      if (index > 0) this.functions[index][1] = x;
    }
  }, {
    key: "getEndX",
    value: function getEndX(index) {
      if (index + 1 < this.functions.length) return this.functions[index + 1][1];
      return 1;
    }
  }, {
    key: "setEndX",
    value: function setEndX(index, x) {
      if (index + 1 < this.functions.length) this.functions[index + 1][1] = x;
    }
  }, {
    key: "getFunction",
    value: function getFunction(index) {
      return this.functions[index][0];
    }
  }, {
    key: "setFunction",
    value: function setFunction(index, func) {
      this.functions[index][0] = func;
    }
  }, {
    key: "numOfFunctions",
    get: function get() {
      return this.functions.length;
    }
  }]);

  return PiecewiseFunction;
}();

var Bezier = /*#__PURE__*/function () {
  function Bezier(p1, p2, p3, p4) {
    _classCallCheck(this, Bezier);

    _defineProperty(this, "p", void 0);

    this.p = [p1, p2, p3, p4];
  }

  _createClass(Bezier, [{
    key: "genValue",
    value: function genValue(t) {
      var t2 = t * t;
      var t3 = t * t * t;
      var mt = 1 - t;
      var mt2 = mt * mt;
      var mt3 = mt2 * mt;
      return this.p[0] * mt3 + this.p[1] * mt2 * t * 3 + this.p[2] * mt * t2 * 3 + this.p[3] * t3;
    } // get the coefficients of the polynomial's derivatives

  }, {
    key: "derivativeCoefficients",
    value: function derivativeCoefficients(points) {
      var dpoints = [];

      for (var p = points, c = p.length - 1; c > 0; c--) {
        var list = [];

        for (var j = 0; j < c; j++) {
          var dpt = c * (p[j + 1] - p[j]);
          list.push(dpt);
        }

        dpoints.push(list);
        p = list;
      }

      return dpoints;
    } // calculate the slope

  }, {
    key: "getSlope",
    value: function getSlope(t) {
      var p = this.derivativeCoefficients(this.p)[0];
      var mt = 1 - t;
      var a = mt * mt;
      var b = mt * t * 2;
      var c = t * t;
      return a * p[0] + b * p[1] + c * p[2]; //return  a * (p[1] - p[0]) * 3 + b * (p[2] - p[1]) * 3 + c * (p[3] - p[2]) * 3;
    } // derivative(0) = (p[1] - p[0]) * 3
    // derivative(1) = (p[3] - p[2]) * 3

  }, {
    key: "controlCurve",
    value: function controlCurve(d0, d1) {
      this.p[1] = d0 / 3 + this.p[0];
      this.p[2] = this.p[3] - d1 / 3;
    }
  }, {
    key: "hull",
    value: function hull(t) {
      var p = this.p;
      var _p = [],
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
  }, {
    key: "split",
    value: function split(t) {
      // no shortcut: use "de Casteljau" iteration.
      var q = this.hull(t);
      var result = {
        left: new Bezier(q[0], q[4], q[7], q[9]),
        right: new Bezier(q[9], q[8], q[6], q[3]),
        span: q
      };
      return result;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Bezier(this.p[0], this.p[1], this.p[2], this.p[3]);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        p0: this.p[0],
        p1: this.p[1],
        p2: this.p[2],
        p3: this.p[3]
      };
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new Bezier(json.p0, json.p1, json.p2, json.p3);
    }
  }]);

  return Bezier;
}();

var PiecewiseBezier = /*#__PURE__*/function (_PiecewiseFunction) {
  _inherits(PiecewiseBezier, _PiecewiseFunction);

  var _super = _createSuper(PiecewiseBezier);

  // default linear bezier
  function PiecewiseBezier() {
    var _this;

    var curves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [[new Bezier(0, 1.0 / 3, 1.0 / 3 * 2, 1), 0]];

    _classCallCheck(this, PiecewiseBezier);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "type", void 0);

    _this.type = "function";
    _this.functions = curves;
    return _this;
  }

  _createClass(PiecewiseBezier, [{
    key: "genValue",
    value: function genValue() {
      var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var index = this.findFunction(t);

      if (index === -1) {
        console.error(t);
        return 0;
      }

      return this.functions[index][0].genValue((t - this.getStartX(index)) / (this.getEndX(index) - this.getStartX(index)));
    }
  }, {
    key: "toSVG",
    value: function toSVG(length, segments) {
      if (segments < 1) return "";
      var result = ["M", 0, this.functions[0][0].p[0]].join(" ");

      for (var i = 1.0 / segments; i <= 1; i += 1.0 / segments) {
        result = [result, "L", i * length, this.genValue(i)].join(" ");
      }

      return result;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "PiecewiseBezier",
        functions: this.functions.map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              bezier = _ref2[0],
              start = _ref2[1];

          return {
            "function": bezier.toJSON(),
            start: start
          };
        })
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new PiecewiseBezier(this.functions.map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            bezier = _ref4[0],
            start = _ref4[1];

        return [bezier.clone(), start];
      }));
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new PiecewiseBezier(json.functions.map(function (piecewiseFunction) {
        return [Bezier.fromJSON(piecewiseFunction["function"]), piecewiseFunction.start];
      }));
    }
  }]);

  return PiecewiseBezier;
}(PiecewiseFunction);

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

var ColorToJSON = function ColorToJSON(color) {
  return {
    r: color.x,
    g: color.y,
    b: color.z,
    a: color.w
  };
};
var JSONToColor = function JSONToColor(json) {
  return new Vector4(json.r, json.g, json.b, json.a);
};

var RandomColor = /*#__PURE__*/function () {
  function RandomColor(a, b) {
    _classCallCheck(this, RandomColor);

    this.a = a;
    this.b = b;

    _defineProperty(this, "type", void 0);

    this.type = "value";
  }

  _createClass(RandomColor, [{
    key: "genColor",
    value: function genColor(color) {
      var rand = Math.random();
      return color.copy(this.a).lerp(this.b, rand);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "RandomColor",
        a: ColorToJSON(this.a),
        b: ColorToJSON(this.b)
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new RandomColor(this.a.clone(), this.b.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new RandomColor(JSONToColor(json.a), JSONToColor(json.b));
    }
  }]);

  return RandomColor;
}();

var ColorRange = /*#__PURE__*/function () {
  function ColorRange(a, b) {
    _classCallCheck(this, ColorRange);

    this.a = a;
    this.b = b;

    _defineProperty(this, "type", void 0);

    this.type = "function";
  }

  _createClass(ColorRange, [{
    key: "genColor",
    value: function genColor(color, t) {
      return color.copy(this.a).lerp(this.b, t);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "ColorRange",
        a: ColorToJSON(this.a),
        b: ColorToJSON(this.b)
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ColorRange(this.a.clone(), this.b.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new ColorRange(JSONToColor(json.a), JSONToColor(json.b));
    }
  }]);

  return ColorRange;
}();

var ConstantColor = /*#__PURE__*/function () {
  function ConstantColor(color) {
    _classCallCheck(this, ConstantColor);

    this.color = color;

    _defineProperty(this, "type", void 0);

    this.type = 'value';
  }

  _createClass(ConstantColor, [{
    key: "genColor",
    value: function genColor(color) {
      return color.copy(this.color);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "ConstantColor",
        color: ColorToJSON(this.color)
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ConstantColor(this.color.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new ConstantColor(JSONToColor(json.color));
    }
  }]);

  return ConstantColor;
}();
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

var Gradient = /*#__PURE__*/function (_PiecewiseFunction) {
  _inherits(Gradient, _PiecewiseFunction);

  var _super = _createSuper(Gradient);

  // default linear bezier
  function Gradient() {
    var _this;

    var functions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [[new ColorRange(new Vector4(0, 0, 0, 1), new Vector4(1, 1, 1, 1)), 0]];

    _classCallCheck(this, Gradient);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "type", void 0);

    _this.type = "function";
    _this.functions = functions;
    return _this;
  }

  _createClass(Gradient, [{
    key: "genColor",
    value: function genColor(color, t) {
      var index = this.findFunction(t);

      if (index === -1) {
        console.error(t);
        return color.copy(this.functions[0][0].a);
      }

      return this.getFunction(index).genColor(color, (t - this.getStartX(index)) / (this.getEndX(index) - this.getStartX(index)));
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "Gradient",
        functions: this.functions.map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              range = _ref2[0],
              start = _ref2[1];

          return {
            "function": range.toJSON(),
            start: start
          };
        })
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Gradient(this.functions.map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            range = _ref4[0],
            start = _ref4[1];

        return [range.clone(), start];
      }));
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new Gradient(json.functions.map(function (piecewiseFunction) {
        return [ColorRange.fromJSON(piecewiseFunction["function"]), piecewiseFunction.start];
      }));
    }
  }]);

  return Gradient;
}(PiecewiseFunction);

var ColorOverLife = /*#__PURE__*/function () {
  function ColorOverLife(color) {
    _classCallCheck(this, ColorOverLife);

    this.color = color;

    _defineProperty(this, "type", 'ColorOverLife');
  }

  _createClass(ColorOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle, delta) {
      this.color.genColor(particle.color, particle.age / particle.life);
      particle.color.x *= particle.startColor.x;
      particle.color.y *= particle.startColor.y;
      particle.color.z *= particle.startColor.z;
      particle.color.w *= particle.startColor.w;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        color: this.color.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ColorOverLife(this.color.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new ColorOverLife(ColorGeneratorFromJSON(json.color));
    }
  }]);

  return ColorOverLife;
}();

var RotationOverLife = /*#__PURE__*/function () {
  function RotationOverLife(angularVelocity) {
    _classCallCheck(this, RotationOverLife);

    this.angularVelocity = angularVelocity;

    _defineProperty(this, "type", 'RotationOverLife');
  }

  _createClass(RotationOverLife, [{
    key: "initialize",
    value: function initialize(particle) {
      if (particle instanceof SpriteParticle) {
        if (this.angularVelocity.type === 'value') {
          particle.angularVelocity = this.angularVelocity.genValue();
        } else {
          particle.angularVelocity = 0;
        }
      }
    }
  }, {
    key: "update",
    value: function update(particle, delta) {
      if (particle instanceof SpriteParticle && typeof particle.rotation === "number") {
        if (this.angularVelocity.type === 'value') {
          particle.rotation += delta * particle.angularVelocity;
        } else {
          particle.rotation += delta * this.angularVelocity.genValue(particle.age / particle.life);
        }
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        angularVelocity: this.angularVelocity.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new RotationOverLife(this.angularVelocity);
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new RotationOverLife(ValueGeneratorFromJSON(json.angularVelocity));
    }
  }]);

  return RotationOverLife;
}();

var SizeOverLife = /*#__PURE__*/function () {
  function SizeOverLife(size) {
    _classCallCheck(this, SizeOverLife);

    this.size = size;

    _defineProperty(this, "type", 'SizeOverLife');
  }

  _createClass(SizeOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle) {
      particle.size = particle.startSize * this.size.genValue(particle.age / particle.life);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        size: this.size.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new SizeOverLife(this.size.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new SizeOverLife(ValueGeneratorFromJSON(json.size));
    }
  }]);

  return SizeOverLife;
}();

var SpeedOverLife = /*#__PURE__*/function () {
  function SpeedOverLife(speed) {
    _classCallCheck(this, SpeedOverLife);

    this.speed = speed;

    _defineProperty(this, "type", 'SpeedOverLife');
  }

  _createClass(SpeedOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle) {
      particle.velocity.normalize().multiplyScalar(particle.startSpeed * this.speed.genValue(particle.age / particle.life));
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        speed: this.speed.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new SpeedOverLife(this.speed.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new SpeedOverLife(ValueGeneratorFromJSON(json.speed));
    }
  }]);

  return SpeedOverLife;
}();

var FrameOverLife = /*#__PURE__*/function () {
  function FrameOverLife(frame) {
    _classCallCheck(this, FrameOverLife);

    this.frame = frame;

    _defineProperty(this, "type", 'FrameOverLife');
  }

  _createClass(FrameOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle, delta) {
      particle.uvTile = Math.floor(this.frame.genValue(particle.age / particle.life));
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        frame: this.frame.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new FrameOverLife(this.frame.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new FrameOverLife(ValueGeneratorFromJSON(json.frame));
    }
  }]);

  return FrameOverLife;
}();

new Vector3(0, 0, 1);
var OrbitOverLife = /*#__PURE__*/function () {
  function OrbitOverLife(orbitSpeed) {
    var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3(0, 1, 0);

    _classCallCheck(this, OrbitOverLife);

    this.orbitSpeed = orbitSpeed;
    this.axis = axis;

    _defineProperty(this, "type", 'OrbitOverLife');

    _defineProperty(this, "rotation", void 0);

    _defineProperty(this, "line", void 0);

    _defineProperty(this, "temp", new Vector3());

    this.rotation = new Quaternion();
    this.line = new Line3();
  }

  _createClass(OrbitOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle, delta) {
      this.line.set(new Vector3(0, 0, 0), this.axis);
      this.line.closestPointToPoint(particle.position, false, this.temp);
      this.rotation.setFromAxisAngle(this.axis, this.orbitSpeed.genValue(particle.age / particle.life) * delta);
      particle.position.sub(this.temp);
      particle.position.applyQuaternion(this.rotation);
      particle.position.add(this.temp);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        orbitSpeed: this.orbitSpeed.toJSON(),
        axis: [this.axis.x, this.axis.y, this.axis.z]
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new OrbitOverLife(this.orbitSpeed.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new OrbitOverLife(ValueGeneratorFromJSON(json.orbitSpeed), json.axis ? new Vector3(json.axis[0], json.axis[1], json.axis[2]) : undefined);
    }
  }]);

  return OrbitOverLife;
}();

var ApplyForce = /*#__PURE__*/function () {
  function ApplyForce(direction, force) {
    _classCallCheck(this, ApplyForce);

    this.direction = direction;
    this.force = force;

    _defineProperty(this, "type", 'ApplyForce');
  }

  _createClass(ApplyForce, [{
    key: "initialize",
    value: function initialize(particle) {
      particle.force = this.force.genValue();
    }
  }, {
    key: "update",
    value: function update(particle, delta) {
      particle.velocity.addScaledVector(this.direction, particle.force * delta);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        direction: [this.direction.x, this.direction.y, this.direction.z],
        force: this.force.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ApplyForce(this.direction.clone(), this.force.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new ApplyForce(new Vector3(json.direction[0], json.direction[1], json.direction[2]), ValueGeneratorFromJSON(json.force));
    }
  }]);

  return ApplyForce;
}();

var GravityForce = /*#__PURE__*/function () {
  function GravityForce(center, magnitude) {
    _classCallCheck(this, GravityForce);

    this.center = center;
    this.magnitude = magnitude;

    _defineProperty(this, "type", 'GravityForce');

    _defineProperty(this, "temp", new Vector3());
  }

  _createClass(GravityForce, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle, delta) {
      this.temp.copy(this.center).sub(particle.position).normalize();
      particle.velocity.addScaledVector(this.temp, this.magnitude / particle.position.distanceToSquared(this.center) * delta);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        center: [this.center.x, this.center.y, this.center.z],
        magnitude: this.magnitude
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new GravityForce(this.center.clone(), this.magnitude);
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new GravityForce(new Vector3(json.center[0], json.center[1], json.center[2]), json.magnitude);
    }
  }]);

  return GravityForce;
}();

var WidthOverLength = /*#__PURE__*/function () {
  function WidthOverLength(width) {
    _classCallCheck(this, WidthOverLength);

    this.width = width;

    _defineProperty(this, "type", 'WidthOverLength');
  }

  _createClass(WidthOverLength, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle) {
      if (particle instanceof TrailParticle) {
        for (var i = 0; i < particle.previous.length; i++) {
          particle.previous[i].size = this.width.genValue((particle.previous.length - i) / particle.length);
        }
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        width: this.width.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new WidthOverLength(this.width.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new WidthOverLength(ValueGeneratorFromJSON(json.width));
    }
  }]);

  return WidthOverLength;
}();

new Vector3(0, 0, 1);
var ChangeEmitDirection = /*#__PURE__*/function () {
  function ChangeEmitDirection(angle) {
    _classCallCheck(this, ChangeEmitDirection);

    this.angle = angle;

    _defineProperty(this, "type", 'ChangeEmitDirection');

    _defineProperty(this, "_temp", new Vector3());

    _defineProperty(this, "_q", new Quaternion());
  }

  _createClass(ChangeEmitDirection, [{
    key: "initialize",
    value: function initialize(particle) {
      var len = particle.velocity.length();
      if (len == 0) return;
      particle.velocity.normalize();

      if (particle.velocity.x === 0 && particle.velocity.y === 0) {
        this._temp.set(0, particle.velocity.z, 0);
      } else {
        this._temp.set(-particle.velocity.y, particle.velocity.x, 0);
      }

      this._q.setFromAxisAngle(this._temp.normalize(), this.angle.genValue());

      this._temp.copy(particle.velocity);

      particle.velocity.applyQuaternion(this._q);

      this._q.setFromAxisAngle(this._temp, Math.random() * Math.PI * 2);

      particle.velocity.applyQuaternion(this._q);
      particle.velocity.setLength(len);
    }
  }, {
    key: "update",
    value: function update(particle, delta) {}
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        angle: this.angle.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ChangeEmitDirection(this.angle);
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new ChangeEmitDirection(ValueGeneratorFromJSON(json.angle));
    }
  }]);

  return ChangeEmitDirection;
}();

var VECTOR_ONE = new Vector3(1, 1, 1);
var VECTOR_Z = new Vector3(0, 0, 1);
var EmitSubParticleSystem = /*#__PURE__*/function () {
  //private matrix_ = new Matrix4();
  function EmitSubParticleSystem(particleSystem, useVelocityAsBasis, subParticleSystem) {
    _classCallCheck(this, EmitSubParticleSystem);

    this.particleSystem = particleSystem;
    this.useVelocityAsBasis = useVelocityAsBasis;
    this.subParticleSystem = subParticleSystem;

    _defineProperty(this, "type", "EmitSubParticleSystem");

    _defineProperty(this, "q_", new Quaternion());

    _defineProperty(this, "v_", new Vector3());

    _defineProperty(this, "v2_", new Vector3());

    if (this.subParticleSystem) {
      this.subParticleSystem.system.onlyUsedByOther = true;
    }
  }

  _createClass(EmitSubParticleSystem, [{
    key: "initialize",
    value: function initialize(particle) {
      particle.emissionState = {
        burstIndex: 0,
        burstWaveIndex: 0,
        time: 0,
        waitEmiting: 0,
        matrix: new Matrix4()
      };
    }
  }, {
    key: "update",
    value: function update(particle, delta) {
      if (!this.subParticleSystem || !particle.emissionState) return;
      var m = particle.emissionState.matrix;
      var rotation;

      if (particle.rotation === undefined || this.useVelocityAsBasis) {
        if (particle.velocity.x === 0 && particle.velocity.y === 0 && (particle.velocity.z === 1 || particle.velocity.z === 0)) {
          m.set(1, 0, 0, particle.position.x, 0, 1, 0, particle.position.y, 0, 0, 1, particle.position.z, 0, 0, 0, 1);
        } else {
          this.v_.copy(VECTOR_Z).cross(particle.velocity);
          this.v2_.copy(particle.velocity).cross(this.v_);
          var len = this.v_.length();
          var len2 = this.v2_.length();
          m.set(this.v_.x / len, this.v2_.x / len2, particle.velocity.x, particle.position.x, this.v_.y / len, this.v2_.y / len2, particle.velocity.y, particle.position.y, this.v_.z / len, this.v2_.z / len2, particle.velocity.z, particle.position.z, 0, 0, 0, 1);
        }
      } else {
        if (particle.rotation instanceof Quaternion) {
          rotation = particle.rotation;
        } else {
          this.q_.setFromAxisAngle(VECTOR_Z, particle.rotation);
          rotation = this.q_;
        }

        m.compose(VECTOR_ONE, rotation, particle.position);
      }

      if (!this.particleSystem.worldSpace) {
        m.multiplyMatrices(this.particleSystem.emitter.matrixWorld, m);
      }

      this.subParticleSystem.system.emit(delta, particle.emissionState, m);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        subParticleSystem: this.subParticleSystem ? this.subParticleSystem.uuid : "",
        useVelocityAsBasis: this.useVelocityAsBasis
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new EmitSubParticleSystem(this.particleSystem, this.useVelocityAsBasis, this.subParticleSystem);
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json, particleSystem) {
      return new EmitSubParticleSystem(particleSystem, json.useVelocityAsBasis, undefined);
    }
  }]);

  return EmitSubParticleSystem;
}();

var BehaviorTypes = {
  "ApplyForce": {
    type: "ApplyForce",
    constructor: ApplyForce,
    params: [["direction", "vec3"], ["force", "value"]],
    loadJSON: ApplyForce.fromJSON
  },
  "GravityForce": {
    type: "GravityForce",
    constructor: GravityForce,
    params: [["center", "vec3"], ["magnitude", "number"]],
    loadJSON: GravityForce.fromJSON
  },
  "ColorOverLife": {
    type: "ColorOverLife",
    constructor: ColorOverLife,
    params: [["color", "colorFunc"]],
    loadJSON: ColorOverLife.fromJSON
  },
  "RotationOverLife": {
    type: "RotationOverLife",
    constructor: RotationOverLife,
    params: [["angularVelocity", "valueFunc"]],
    loadJSON: RotationOverLife.fromJSON
  },
  "SizeOverLife": {
    type: "SizeOverLife",
    constructor: SizeOverLife,
    params: [["size", "valueFunc"]],
    loadJSON: SizeOverLife.fromJSON
  },
  "SpeedOverLife": {
    type: "SpeedOverLife",
    constructor: SpeedOverLife,
    params: [["speed", "valueFunc"]],
    loadJSON: SpeedOverLife.fromJSON
  },
  "FrameOverLife": {
    type: "FrameOverLife",
    constructor: FrameOverLife,
    params: [["frame", "valueFunc"]],
    loadJSON: FrameOverLife.fromJSON
  },
  "OrbitOverLife": {
    type: "OrbitOverLife",
    constructor: OrbitOverLife,
    params: [["orbitSpeed", "valueFunc"], ["axis", "vec3"]],
    loadJSON: OrbitOverLife.fromJSON
  },
  "WidthOverLength": {
    type: "WidthOverLength",
    constructor: WidthOverLength,
    params: [["width", "valueFunc"]],
    loadJSON: WidthOverLength.fromJSON
  },
  "ChangeEmitDirection": {
    type: "ChangeEmitDirection",
    constructor: ChangeEmitDirection,
    params: [["angle", "value"]],
    loadJSON: ChangeEmitDirection.fromJSON
  },
  "EmitSubParticleSystem": {
    type: "EmitSubParticleSystem",
    constructor: EmitSubParticleSystem,
    params: [["particleSystem", "self"], ['useVelocityAsBasis', 'boolean'], ["subParticleSystem", "particleSystem"]],
    loadJSON: EmitSubParticleSystem.fromJSON
  }
};
function BehaviorFromJSON(json, particleSystem) {
  return BehaviorTypes[json.type].loadJSON(json, particleSystem);
}

var ConeEmitter = /*#__PURE__*/function () {
  // [0, Math.PI * 2]
  // [0, 1]
  // [0, Math.PI / 2]
  function ConeEmitter() {
    var _parameters$radius, _parameters$arc, _parameters$thickness, _parameters$angle;

    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ConeEmitter);

    _defineProperty(this, "type", "cone");

    _defineProperty(this, "radius", void 0);

    _defineProperty(this, "arc", void 0);

    _defineProperty(this, "thickness", void 0);

    _defineProperty(this, "angle", void 0);

    this.radius = (_parameters$radius = parameters.radius) !== null && _parameters$radius !== void 0 ? _parameters$radius : 10;
    this.arc = (_parameters$arc = parameters.arc) !== null && _parameters$arc !== void 0 ? _parameters$arc : 2.0 * Math.PI;
    this.thickness = (_parameters$thickness = parameters.thickness) !== null && _parameters$thickness !== void 0 ? _parameters$thickness : 1;
    this.angle = (_parameters$angle = parameters.angle) !== null && _parameters$angle !== void 0 ? _parameters$angle : Math.PI / 6;
  }

  _createClass(ConeEmitter, [{
    key: "initialize",
    value: function initialize(p) {
      var u = Math.random();
      var rand = MathUtils.lerp(1 - this.thickness, 1, Math.random());
      var theta = u * this.arc;
      var r = Math.sqrt(rand);
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      p.position.x = r * cosTheta;
      p.position.y = r * sinTheta;
      p.position.z = 0;
      var angle = this.angle * r;
      p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed); //const v = Math.random();

      p.position.multiplyScalar(this.radius);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "cone",
        radius: this.radius,
        arc: this.arc,
        thickness: this.thickness,
        angle: this.angle
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ConeEmitter({
        radius: this.radius,
        arc: this.arc,
        thickness: this.thickness,
        angle: this.angle
      });
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new ConeEmitter(json);
    }
  }]);

  return ConeEmitter;
}();

var DonutEmitter = /*#__PURE__*/function () {
  // [0, Math.PI * 2]
  // [0, Math.PI / 2]
  function DonutEmitter() {
    var _parameters$radius, _parameters$arc, _parameters$thickness, _parameters$angle;

    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, DonutEmitter);

    _defineProperty(this, "type", "donut");

    _defineProperty(this, "radius", void 0);

    _defineProperty(this, "arc", void 0);

    _defineProperty(this, "thickness", void 0);

    _defineProperty(this, "angle", void 0);

    this.radius = (_parameters$radius = parameters.radius) !== null && _parameters$radius !== void 0 ? _parameters$radius : 10;
    this.arc = (_parameters$arc = parameters.arc) !== null && _parameters$arc !== void 0 ? _parameters$arc : 2.0 * Math.PI;
    this.thickness = (_parameters$thickness = parameters.thickness) !== null && _parameters$thickness !== void 0 ? _parameters$thickness : 1;
    this.angle = (_parameters$angle = parameters.angle) !== null && _parameters$angle !== void 0 ? _parameters$angle : Math.PI / 6;
  }

  _createClass(DonutEmitter, [{
    key: "initialize",
    value: function initialize(p) {
      var u = Math.random();
      var rand = MathUtils.lerp(this.thickness, 1, Math.random());
      var theta = u * this.arc;
      var r = Math.sqrt(rand);
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      p.position.x = r * cosTheta;
      p.position.y = r * sinTheta;
      p.position.z = 0;
      var angle = this.angle * r;
      p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed); //const v = Math.random();

      p.position.multiplyScalar(this.radius);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "donut",
        radius: this.radius,
        arc: this.arc,
        thickness: this.thickness,
        angle: this.angle
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new DonutEmitter({
        radius: this.radius,
        arc: this.arc,
        thickness: this.thickness,
        angle: this.angle
      });
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new DonutEmitter(json);
    }
  }]);

  return DonutEmitter;
}();

var PointEmitter = /*#__PURE__*/function () {
  function PointEmitter() {
    _classCallCheck(this, PointEmitter);

    _defineProperty(this, "type", "point");
  }

  _createClass(PointEmitter, [{
    key: "initialize",
    value: function initialize(p) {
      var u = Math.random();
      var v = Math.random();
      var theta = u * Math.PI * 2;
      var phi = Math.acos(2.0 * v - 1.0);
      var r = Math.cbrt(Math.random());
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);
      p.velocity.x = r * sinPhi * cosTheta;
      p.velocity.y = r * sinPhi * sinTheta;
      p.velocity.z = r * cosPhi;
      p.velocity.multiplyScalar(p.startSpeed);
      p.position.setScalar(0);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: 'point'
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new PointEmitter();
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new PointEmitter();
    }
  }]);

  return PointEmitter;
}();

var SphereEmitter = /*#__PURE__*/function () {
  //[0, 1]
  function SphereEmitter() {
    var _parameters$radius, _parameters$arc, _parameters$thickness;

    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SphereEmitter);

    _defineProperty(this, "type", "sphere");

    _defineProperty(this, "radius", void 0);

    _defineProperty(this, "arc", void 0);

    _defineProperty(this, "thickness", void 0);

    this.radius = (_parameters$radius = parameters.radius) !== null && _parameters$radius !== void 0 ? _parameters$radius : 10;
    this.arc = (_parameters$arc = parameters.arc) !== null && _parameters$arc !== void 0 ? _parameters$arc : 2.0 * Math.PI;
    this.thickness = (_parameters$thickness = parameters.thickness) !== null && _parameters$thickness !== void 0 ? _parameters$thickness : 1;
  }

  _createClass(SphereEmitter, [{
    key: "initialize",
    value: function initialize(p) {
      var u = Math.random();
      var v = Math.random();
      var rand = MathUtils.lerp(1 - this.thickness, 1, Math.random());
      var theta = u * this.arc;
      var phi = Math.acos(2.0 * v - 1.0);
      var r = Math.cbrt(rand);
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);
      p.position.x = r * sinPhi * cosTheta;
      p.position.y = r * sinPhi * sinTheta;
      p.position.z = r * cosPhi;
      p.velocity.setScalar(0).addScaledVector(p.position, p.startSpeed);
      p.position.multiplyScalar(this.radius);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "sphere",
        radius: this.radius,
        arc: this.arc,
        thickness: this.thickness
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new SphereEmitter({
        radius: this.radius,
        arc: this.arc,
        thickness: this.thickness
      });
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new SphereEmitter(json);
    }
  }]);

  return SphereEmitter;
}();

var MeshSurfaceEmitter = /*#__PURE__*/function () {
  function MeshSurfaceEmitter(mesh) {
    _classCallCheck(this, MeshSurfaceEmitter);

    _defineProperty(this, "type", "mesh_surface");

    _defineProperty(this, "_triangleIndexToArea", []);

    _defineProperty(this, "_mesh", void 0);

    _defineProperty(this, "_tempA", new Vector3());

    _defineProperty(this, "_tempB", new Vector3());

    _defineProperty(this, "_tempC", new Vector3());

    if (!mesh) {
      return;
    }

    this.mesh = mesh;
  }

  _createClass(MeshSurfaceEmitter, [{
    key: "mesh",
    get: function get() {
      return this._mesh;
    },
    set: function set(mesh) {
      this._mesh = mesh;

      if (mesh.userData.triangleIndexToArea) {
        this._triangleIndexToArea = mesh.userData.triangleIndexToArea;
        return;
      }

      var tri = new Triangle();
      var area = 0;
      var geometry = mesh.geometry;

      if (!geometry.getIndex()) {
        return;
      }

      var array = geometry.getIndex().array;
      var triCount = array.length / 3;

      this._triangleIndexToArea.push(0);

      for (var i = 0; i < triCount; i++) {
        tri.setFromAttributeAndIndices(geometry.getAttribute("position"), array[i * 3], array[i * 3 + 1], array[i * 3 + 2]);
        area += tri.getArea();

        this._triangleIndexToArea.push(area);
      }

      mesh.userData.triangleIndexToArea = this._triangleIndexToArea;
    }
  }, {
    key: "initialize",
    value: function initialize(p) {
      if (!this._mesh) {
        p.position.set(0, 0, 0);
        p.velocity.set(0, 0, 1).multiplyScalar(p.startSpeed);
        return;
      }

      var triCount = this._triangleIndexToArea.length - 1;
      var left = 0,
          right = triCount;

      var target = Math.random() * this._triangleIndexToArea[triCount];

      while (left + 1 < right) {
        var mid = Math.floor((left + right) / 2);

        if (target < this._triangleIndexToArea[mid]) {
          right = mid;
        } else {
          left = mid;
        }
      } //const area = this._triangleIndexToArea[left + 1] - this._triangleIndexToArea[left];
      //const percent = (target - this._triangleIndexToArea[left]) / area;


      var u1 = Math.random();
      var u2 = Math.random();

      if (u1 + u2 > 1) {
        u1 = 1 - u1;
        u2 = 1 - u2;
      }

      var geometry = this._mesh.geometry;
      var index1 = geometry.getIndex().array[left * 3];
      var index2 = geometry.getIndex().array[left * 3 + 1];
      var index3 = geometry.getIndex().array[left * 3 + 2];
      var positionBuffer = geometry.getAttribute("position");

      this._tempA.fromBufferAttribute(positionBuffer, index1);

      this._tempB.fromBufferAttribute(positionBuffer, index2);

      this._tempC.fromBufferAttribute(positionBuffer, index3);

      this._tempB.sub(this._tempA);

      this._tempC.sub(this._tempA);

      this._tempA.addScaledVector(this._tempB, u1).addScaledVector(this._tempC, u2);

      p.position.copy(this._tempA);
      p.velocity.copy(this._tempA).normalize().multiplyScalar(p.startSpeed);
      /*p.position.applyMatrix4(this._mesh.matrixWorld);
      p.velocity.applyMatrix3(this._mesh.normalMatrix);*/
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: 'mesh_surface',
        mesh: this._mesh ? this._mesh.uuid : ""
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new MeshSurfaceEmitter(this._mesh);
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new MeshSurfaceEmitter();
    }
  }]);

  return MeshSurfaceEmitter;
}();

var EmitterShapes = {
  "cone": {
    type: "cone",
    params: [["radius", "number"], ["arc", "radian"], ["thickness", "number"], ["angle", "radian"]],
    constructor: ConeEmitter,
    loadJSON: ConeEmitter.fromJSON
  },
  "donut": {
    type: "donut",
    params: [["radius", "number"], ["arc", "radian"], ["thickness", "number"], ["angle", "radian"]],
    constructor: DonutEmitter,
    loadJSON: DonutEmitter.fromJSON
  },
  "point": {
    type: "point",
    params: [],
    constructor: PointEmitter,
    loadJSON: PointEmitter.fromJSON
  },
  "sphere": {
    type: "sphere",
    params: [["radius", "number"], ["arc", "radian"], ["thickness", "number"], ["angle", "radian"]],
    constructor: SphereEmitter,
    loadJSON: SphereEmitter.fromJSON
  },
  "mesh_surface": {
    type: "mesh_surface",
    params: [["mesh", "mesh"]],
    constructor: MeshSurfaceEmitter,
    loadJSON: MeshSurfaceEmitter.fromJSON
  }
};
function EmitterFromJSON(json) {
  return EmitterShapes[json.type].loadJSON(json);
}

var RenderMode;

(function (RenderMode) {
  RenderMode[RenderMode["BillBoard"] = 0] = "BillBoard";
  RenderMode[RenderMode["StretchedBillBoard"] = 1] = "StretchedBillBoard";
  RenderMode[RenderMode["LocalSpace"] = 2] = "LocalSpace";
  RenderMode[RenderMode["Trail"] = 3] = "Trail";
})(RenderMode || (RenderMode = {}));

var ParticleSystemBatch = /*#__PURE__*/function (_Mesh) {
  _inherits(ParticleSystemBatch, _Mesh);

  var _super = _createSuper(ParticleSystemBatch);

  function ParticleSystemBatch(settings) {
    var _this;

    _classCallCheck(this, ParticleSystemBatch);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "type", "ParticleSystemBatch");

    _defineProperty(_assertThisInitialized(_this), "systems", void 0);

    _defineProperty(_assertThisInitialized(_this), "material", void 0);

    _defineProperty(_assertThisInitialized(_this), "settings", void 0);

    _this.systems = new Set();
    _this.settings = {
      blending: settings.blending,
      instancingGeometry: settings.instancingGeometry,
      renderMode: settings.renderMode,
      renderOrder: settings.renderOrder,
      texture: settings.texture,
      uTileCount: settings.uTileCount,
      vTileCount: settings.vTileCount,
      transparent: settings.transparent
    };
    _this.frustumCulled = false;
    _this.renderOrder = _this.settings.renderOrder;
    return _this;
  }

  _createClass(ParticleSystemBatch, [{
    key: "addSystem",
    value: function addSystem(system) {
      this.systems.add(system);
    }
  }, {
    key: "removeSystem",
    value: function removeSystem(system) {
      this.systems["delete"](system);
    }
  }]);

  return ParticleSystemBatch;
}(Mesh);

var UP = new Vector3(0, 0, 1);
var DEFAULT_GEOMETRY = new PlaneBufferGeometry(1, 1, 1, 1);
var ParticleSystem = /*#__PURE__*/function () {
  function ParticleSystem(renderer, parameters) {
    var _parameters$duration, _parameters$maxPartic, _parameters$startLife, _parameters$startSpee, _parameters$startRota, _parameters$startSize, _parameters$startColo, _parameters$emissionO, _parameters$emissionO2, _parameters$emissionB, _parameters$onlyUsedB, _parameters$shape, _parameters$behaviors, _parameters$worldSpac, _parameters$speedFact, _parameters$rendererE, _parameters$blending, _parameters$transpare, _parameters$instancin, _parameters$renderMod, _parameters$renderOrd, _parameters$uTileCoun, _parameters$vTileCoun;

    _classCallCheck(this, ParticleSystem);

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

    _defineProperty(this, "rendererEmitterSettings", void 0);

    _defineProperty(this, "emissionOverTime", void 0);

    _defineProperty(this, "emissionOverDistance", void 0);

    _defineProperty(this, "emissionBursts", void 0);

    _defineProperty(this, "onlyUsedByOther", void 0);

    _defineProperty(this, "worldSpace", void 0);

    _defineProperty(this, "speedFactor", void 0);

    _defineProperty(this, "particleNum", void 0);

    _defineProperty(this, "paused", void 0);

    _defineProperty(this, "emissionState", void 0);

    _defineProperty(this, "emitEnded", void 0);

    _defineProperty(this, "markForDestroy", void 0);

    _defineProperty(this, "normalMatrix", new Matrix3());

    _defineProperty(this, "behaviors", void 0);

    _defineProperty(this, "particles", void 0);

    _defineProperty(this, "emitterShape", void 0);

    _defineProperty(this, "emitter", void 0);

    _defineProperty(this, "rendererSettings", void 0);

    _defineProperty(this, "renderer", void 0);

    _defineProperty(this, "neededToUpdateRender", void 0);

    this.renderer = renderer;
    this.autoDestroy = parameters.autoDestroy === undefined ? false : parameters.autoDestroy;
    this.duration = (_parameters$duration = parameters.duration) !== null && _parameters$duration !== void 0 ? _parameters$duration : 1;
    this.maxParticle = (_parameters$maxPartic = parameters.maxParticle) !== null && _parameters$maxPartic !== void 0 ? _parameters$maxPartic : 100;
    this.looping = parameters.looping === undefined ? true : parameters.looping;
    this.startLife = (_parameters$startLife = parameters.startLife) !== null && _parameters$startLife !== void 0 ? _parameters$startLife : new ConstantValue(5);
    this.startSpeed = (_parameters$startSpee = parameters.startSpeed) !== null && _parameters$startSpee !== void 0 ? _parameters$startSpee : new ConstantValue(0);
    this.startRotation = (_parameters$startRota = parameters.startRotation) !== null && _parameters$startRota !== void 0 ? _parameters$startRota : new ConstantValue(0);
    this.startSize = (_parameters$startSize = parameters.startSize) !== null && _parameters$startSize !== void 0 ? _parameters$startSize : new ConstantValue(1);
    this.startColor = (_parameters$startColo = parameters.startColor) !== null && _parameters$startColo !== void 0 ? _parameters$startColo : new ConstantColor(new Vector4(1, 1, 1, 1)); //this.startLength = parameters.startLength ?? new ConstantValue(30);

    this.emissionOverTime = (_parameters$emissionO = parameters.emissionOverTime) !== null && _parameters$emissionO !== void 0 ? _parameters$emissionO : new ConstantValue(10);
    this.emissionOverDistance = (_parameters$emissionO2 = parameters.emissionOverDistance) !== null && _parameters$emissionO2 !== void 0 ? _parameters$emissionO2 : new ConstantValue(0);
    this.emissionBursts = (_parameters$emissionB = parameters.emissionBursts) !== null && _parameters$emissionB !== void 0 ? _parameters$emissionB : [];
    this.onlyUsedByOther = (_parameters$onlyUsedB = parameters.onlyUsedByOther) !== null && _parameters$onlyUsedB !== void 0 ? _parameters$onlyUsedB : false;
    this.emitterShape = (_parameters$shape = parameters.shape) !== null && _parameters$shape !== void 0 ? _parameters$shape : new SphereEmitter();
    this.behaviors = (_parameters$behaviors = parameters.behaviors) !== null && _parameters$behaviors !== void 0 ? _parameters$behaviors : new Array();
    this.worldSpace = (_parameters$worldSpac = parameters.worldSpace) !== null && _parameters$worldSpac !== void 0 ? _parameters$worldSpac : false;
    this.speedFactor = (_parameters$speedFact = parameters.speedFactor) !== null && _parameters$speedFact !== void 0 ? _parameters$speedFact : 0;
    this.rendererEmitterSettings = (_parameters$rendererE = parameters.rendererEmitterSettings) !== null && _parameters$rendererE !== void 0 ? _parameters$rendererE : {};
    this.rendererSettings = {
      blending: (_parameters$blending = parameters.blending) !== null && _parameters$blending !== void 0 ? _parameters$blending : NormalBlending,
      transparent: (_parameters$transpare = parameters.transparent) !== null && _parameters$transpare !== void 0 ? _parameters$transpare : true,
      instancingGeometry: (_parameters$instancin = parameters.instancingGeometry) !== null && _parameters$instancin !== void 0 ? _parameters$instancin : DEFAULT_GEOMETRY,
      renderMode: (_parameters$renderMod = parameters.renderMode) !== null && _parameters$renderMod !== void 0 ? _parameters$renderMod : RenderMode.BillBoard,
      renderOrder: (_parameters$renderOrd = parameters.renderOrder) !== null && _parameters$renderOrd !== void 0 ? _parameters$renderOrd : 0,
      texture: parameters.texture,
      uTileCount: (_parameters$uTileCoun = parameters.uTileCount) !== null && _parameters$uTileCoun !== void 0 ? _parameters$uTileCoun : 1,
      vTileCount: (_parameters$vTileCoun = parameters.vTileCount) !== null && _parameters$vTileCoun !== void 0 ? _parameters$vTileCoun : 1
    };
    this.neededToUpdateRender = true;
    this.particles = new Array();
    this.startTileIndex = parameters.startTileIndex || new ConstantValue(0);
    this.emitter = new ParticleEmitter(this);
    this.paused = false;
    this.particleNum = 0;
    this.emissionState = {
      burstIndex: 0,
      burstWaveIndex: 0,
      time: 0,
      waitEmiting: 0
    };
    this.emitEnded = false;
    this.markForDestroy = false;
    this.renderer.addSystem(this);
  }

  _createClass(ParticleSystem, [{
    key: "texture",
    get: // parameters
    // runtime data
    function get() {
      return this.rendererSettings.texture;
    },
    set: function set(texture) {
      this.rendererSettings.texture = texture;
      this.neededToUpdateRender = true; //this.emitter.material.uniforms.map.value = texture;
    }
  }, {
    key: "uTileCount",
    get: function get() {
      return this.rendererSettings.uTileCount;
    },
    set: function set(u) {
      this.rendererSettings.uTileCount = u;
      this.neededToUpdateRender = true; //this.emitter.material.uniforms.tileCount.value.x = u;
    }
  }, {
    key: "vTileCount",
    get: function get() {
      return this.rendererSettings.vTileCount;
    },
    set: function set(v) {
      this.rendererSettings.vTileCount = v;
      this.neededToUpdateRender = true;
    }
  }, {
    key: "renderMode",
    get: function get() {
      return this.rendererSettings.renderMode;
    },
    set: function set(renderMode) {
      if (this.rendererSettings.renderMode != RenderMode.Trail && renderMode === RenderMode.Trail || this.rendererSettings.renderMode == RenderMode.Trail && renderMode !== RenderMode.Trail) {
        this.restart();
        this.particles.length = 0;
      }

      if (this.rendererSettings.renderMode !== renderMode) {
        switch (renderMode) {
          case RenderMode.Trail:
            this.rendererEmitterSettings = {
              startLength: new ConstantValue(30),
              followLocalOrigin: false
            };
            break;

          case RenderMode.LocalSpace:
            this.rendererEmitterSettings = {
              geometry: new PlaneBufferGeometry(1, 1)
            };
            break;

          case RenderMode.BillBoard:
          case RenderMode.StretchedBillBoard:
            this.rendererEmitterSettings = {};
            break;
        }
      }

      this.rendererSettings.renderMode = renderMode;
      this.neededToUpdateRender = true; //this.emitter.rebuildMaterial();
    }
  }, {
    key: "renderOrder",
    get: function get() {
      return this.rendererSettings.renderOrder;
    },
    set: function set(renderOrder) {
      this.rendererSettings.renderOrder = renderOrder;
      this.neededToUpdateRender = true; //this.emitter.rebuildMaterial();
    }
  }, {
    key: "blending",
    get: function get() {
      return this.rendererSettings.blending;
    },
    set: function set(blending) {
      this.rendererSettings.blending = blending;
      this.neededToUpdateRender = true;
    }
  }, {
    key: "pause",
    value: function pause() {
      this.paused = true;
    }
  }, {
    key: "play",
    value: function play() {
      this.paused = false;
    }
  }, {
    key: "spawn",
    value: function spawn(count, emissionState, matrix) {
      for (var i = 0; i < count && this.particleNum < this.maxParticle; i++) {
        this.particleNum++;

        while (this.particles.length < this.particleNum) {
          if (this.rendererSettings.renderMode === RenderMode.Trail) {
            this.particles.push(new TrailParticle());
          } else {
            this.particles.push(new SpriteParticle());
          }
        }

        var particle = this.particles[this.particleNum - 1];
        this.startColor.genColor(particle.startColor, emissionState.time);
        particle.color.copy(particle.startColor);
        particle.startSpeed = this.startSpeed.genValue(emissionState.time);
        particle.life = this.startLife.genValue(emissionState.time);
        particle.age = 0;
        particle.startSize = this.startSize.genValue(emissionState.time);
        particle.uvTile = Math.floor(this.startTileIndex.genValue());
        particle.size = particle.startSize;

        if (this.rendererSettings.renderMode === RenderMode.LocalSpace || this.rendererSettings.renderMode === RenderMode.BillBoard || this.rendererSettings.renderMode === RenderMode.StretchedBillBoard) {
          var sprite = particle;
          sprite.rotation = this.startRotation.genValue(emissionState.time);

          if (this.rendererSettings.renderMode === RenderMode.LocalSpace) {
            sprite.rotation = new Quaternion().setFromAxisAngle(UP, sprite.rotation);
          }
        } else if (this.rendererSettings.renderMode === RenderMode.Trail) {
          var trail = particle;
          trail.length = this.rendererEmitterSettings.startLength.genValue(emissionState.time);
          trail.reset();
        }

        this.emitterShape.initialize(particle);

        if (this.rendererSettings.renderMode === RenderMode.Trail && this.rendererEmitterSettings.followLocalOrigin) {
          var _trail = particle;
          _trail.localPosition = new Vector3().copy(_trail.position);
        }

        if (this.worldSpace) {
          particle.position.applyMatrix4(matrix);
          particle.velocity.applyMatrix3(this.normalMatrix);
        } else {
          if (this.onlyUsedByOther) {
            particle.parentMatrix = matrix;
          }
        }

        for (var j = 0; j < this.behaviors.length; j++) {
          this.behaviors[j].initialize(particle);
        }
      }
    }
  }, {
    key: "endEmit",
    value: function endEmit() {
      this.emitEnded = true;

      if (this.autoDestroy) {
        this.markForDestroy = true;
      }
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.renderer.deleteSystem(this);
      this.emitter.dispose();
      if (this.emitter.parent) this.emitter.parent.remove(this.emitter);
    }
  }, {
    key: "restart",
    value: function restart() {
      this.paused = false;
      this.particleNum = 0;
      this.emissionState.burstIndex = 0;
      this.emissionState.burstWaveIndex = 0;
      this.emissionState.time = 0;
      this.emissionState.waitEmiting = 0;
      this.emitEnded = false;
      this.markForDestroy = false;
    } //firstTimeUpdate = true;

  }, {
    key: "update",
    value: function update(delta) {
      /*if (this.firstTimeUpdate) {
          this.renderer.addSystem(this);
          this.firstTimeUpdate = false;
      }*/
      if (delta > 0.1) delta = 0.1;
      if (this.paused) return;

      if (this.emitEnded && this.particleNum === 0) {
        if (this.markForDestroy && this.emitter.parent) this.dispose();
        return;
      }

      if (this.neededToUpdateRender) {
        this.renderer.updateSystem(this);
        this.neededToUpdateRender = false;
      }

      if (!this.onlyUsedByOther) {
        this.emit(delta, this.emissionState, this.emitter.matrixWorld);
      } // simulate


      for (var j = 0; j < this.behaviors.length; j++) {
        for (var i = 0; i < this.particleNum; i++) {
          this.behaviors[j].update(this.particles[i], delta);
        }
      }

      for (var _i = 0; _i < this.particleNum; _i++) {
        if (this.rendererEmitterSettings.followLocalOrigin && this.particles[_i].localPosition) {
          this.particles[_i].position.copy(this.particles[_i].localPosition);

          if (this.particles[_i].parentMatrix) {
            this.particles[_i].position.applyMatrix4(this.particles[_i].parentMatrix);
          } else {
            this.particles[_i].position.applyMatrix4(this.emitter.matrixWorld);
          }
        } else {
          this.particles[_i].position.addScaledVector(this.particles[_i].velocity, delta);
        }

        this.particles[_i].age += delta;
      }

      if (this.rendererSettings.renderMode === RenderMode.Trail) {
        for (var _i2 = 0; _i2 < this.particleNum; _i2++) {
          var particle = this.particles[_i2];
          particle.recordCurrentState();
        }
      } // particle die


      for (var _i3 = 0; _i3 < this.particleNum; _i3++) {
        var _particle = this.particles[_i3];

        if (_particle.age >= _particle.life) {
          this.particles[_i3] = this.particles[this.particleNum - 1];
          this.particles[this.particleNum - 1] = _particle;
          this.particleNum--;
          _i3--;
        }
      }
    }
  }, {
    key: "emit",
    value: function emit(delta, emissionState, emitterMatrix) {
      if (emissionState.time > this.duration) {
        if (this.looping) {
          emissionState.time -= this.duration;
          emissionState.burstIndex = 0;
        } else {
          if (!this.emitEnded && !this.onlyUsedByOther) {
            this.endEmit();
          }
        }
      }

      this.normalMatrix.getNormalMatrix(emitterMatrix); // spawn

      if (!this.emitEnded) {
        var totalSpawn = Math.ceil(emissionState.waitEmiting);
        this.spawn(totalSpawn, emissionState, emitterMatrix);
        emissionState.waitEmiting -= totalSpawn;
      } // spawn burst


      while (emissionState.burstIndex < this.emissionBursts.length && this.emissionBursts[emissionState.burstIndex].time <= emissionState.time) {
        if (Math.random() < this.emissionBursts[emissionState.burstIndex].probability) {
          var count = this.emissionBursts[emissionState.burstIndex].count;
          this.spawn(count, emissionState, emitterMatrix);
        }

        emissionState.burstIndex++;
      }

      if (!this.emitEnded) {
        emissionState.waitEmiting += delta * this.emissionOverTime.genValue(emissionState.time / this.duration);
      }

      emissionState.time += delta;
    }
  }, {
    key: "toJSON",
    value: function toJSON(meta) {
      var isRootObject = meta === undefined || typeof meta === 'string';

      if (isRootObject) {
        // initialize meta obj
        meta = {
          geometries: {},
          materials: {},
          textures: {},
          images: {},
          shapes: {},
          skeletons: {},
          animations: {},
          nodes: {}
        };
      }

      this.texture.toJSON(meta); // TODO: support URL

      /*if ( this.texture.source !== undefined ) {
          const image = this.texture.source;
          meta.images[ image.uuid ] = {
              uuid: image.uuid,
              url: this.texture.image.url,
          };
      }*/

      var rendererSettingsJSON;

      if (this.renderMode === RenderMode.Trail) {
        rendererSettingsJSON = {
          startLength: this.rendererEmitterSettings.startLength.toJSON(),
          followLocalOrigin: this.rendererEmitterSettings.followLocalOrigin
        };
      } else if (this.renderMode === RenderMode.LocalSpace) {
        rendererSettingsJSON = {};
        /*;*/
      } else {
        rendererSettingsJSON = {};
      }

      var geometry = this.rendererSettings.instancingGeometry;

      if (meta.geometries && !meta.geometries[geometry.uuid]) {
        meta.geometries[geometry.uuid] = geometry.toJSON();
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
        onlyUsedByOther: this.onlyUsedByOther,
        instancingGeometry: this.rendererSettings.instancingGeometry.uuid,
        //Array.from(this.emitter.interleavedBuffer.array as Float32Array),
        renderOrder: this.renderOrder,
        renderMode: this.renderMode,
        rendererEmitterSettings: rendererSettingsJSON,
        speedFactor: this.renderMode === RenderMode.StretchedBillBoard ? this.speedFactor : 0,
        texture: this.texture.uuid,
        startTileIndex: this.startTileIndex.toJSON(),
        uTileCount: this.uTileCount,
        vTileCount: this.vTileCount,
        blending: this.blending,
        behaviors: this.behaviors.map(function (behavior) {
          return behavior.toJSON();
        }),
        worldSpace: this.worldSpace
      };
    }
  }, {
    key: "addBehavior",
    value: function addBehavior(behavior) {
      this.behaviors.push(behavior);
    }
  }, {
    key: "getRendererSettings",
    value: function getRendererSettings() {
      return this.rendererSettings;
    }
  }, {
    key: "clone",
    value: function clone() {
      var newEmissionBursts = [];

      var _iterator = _createForOfIteratorHelper(this.emissionBursts),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var emissionBurst = _step.value;
          var newEmissionBurst = {};
          Object.assign(newEmissionBurst, emissionBurst);
          newEmissionBursts.push(newEmissionBurst);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var newBehaviors = [];

      var _iterator2 = _createForOfIteratorHelper(this.behaviors),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var behavior = _step2.value;
          newBehaviors.push(behavior.clone());
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var rendererEmitterSettings;

      if (this.renderMode === RenderMode.Trail) {
        rendererEmitterSettings = {
          startLength: this.rendererEmitterSettings.startLength.clone(),
          followLocalOrigin: this.rendererEmitterSettings.followLocalOrigin
        };
      } else {
        rendererEmitterSettings = {};
      }

      return new ParticleSystem(this.renderer, {
        autoDestroy: this.autoDestroy,
        looping: this.looping,
        duration: this.duration,
        maxParticle: this.maxParticle,
        shape: this.emitterShape.clone(),
        startLife: this.startLife.clone(),
        startSpeed: this.startSpeed.clone(),
        startRotation: this.startRotation.clone(),
        startSize: this.startSize.clone(),
        startColor: this.startColor.clone(),
        emissionOverTime: this.emissionOverTime.clone(),
        emissionOverDistance: this.emissionOverDistance.clone(),
        emissionBursts: newEmissionBursts,
        onlyUsedByOther: this.onlyUsedByOther,
        instancingGeometry: this.rendererSettings.instancingGeometry,
        //.interleavedBuffer.array,
        renderMode: this.renderMode,
        rendererEmitterSettings: rendererEmitterSettings,
        speedFactor: this.speedFactor,
        texture: this.texture,
        startTileIndex: this.startTileIndex,
        uTileCount: this.uTileCount,
        vTileCount: this.vTileCount,
        blending: this.blending,
        behaviors: newBehaviors,
        worldSpace: this.worldSpace
      });
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json, meta, dependencies, renderer) {
      var shape = EmitterFromJSON(json.shape);
      var rendererEmitterSettings;

      if (json.renderMode === RenderMode.Trail) {
        rendererEmitterSettings = {
          startLength: ValueGeneratorFromJSON(json.rendererEmitterSettings.startLength),
          followLocalOrigin: json.rendererEmitterSettings.followLocalOrigin
        };
      } else if (json.renderMode === RenderMode.LocalSpace) {
        rendererEmitterSettings = {};
      } else {
        rendererEmitterSettings = {};
      }

      var ps = new ParticleSystem(renderer, {
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
        onlyUsedByOther: json.onlyUsedByOther,
        instancingGeometry: meta.geometries[json.instancingGeometry],
        renderMode: json.renderMode,
        rendererEmitterSettings: rendererEmitterSettings,
        renderOrder: json.renderOrder,
        speedFactor: json.speedFactor,
        texture: meta.textures[json.texture],
        startTileIndex: typeof json.startTileIndex === 'number' ? new ConstantValue(json.startTileIndex) : ValueGeneratorFromJSON(json.startTileIndex),
        uTileCount: json.uTileCount,
        vTileCount: json.vTileCount,
        blending: json.blending,
        behaviors: [],
        worldSpace: json.worldSpace
      });
      ps.behaviors = json.behaviors.map(function (behaviorJson) {
        var behavior = BehaviorFromJSON(behaviorJson, ps);

        if (behavior.type === "EmitSubParticleSystem") {
          dependencies[behaviorJson.subParticleSystem] = behavior;
        }

        return behavior;
      });
      return ps;
    }
  }]);

  return ParticleSystem;
}();

var particle_frag = /* glsl */
"\n\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\nvarying vec4 vColor;\n\nvoid main() {\n\n    #include <clipping_planes_fragment>\n    \n    vec3 outgoingLight = vec3( 0.0 );\n    vec4 diffuseColor = vColor;\n    \n    #include <logdepthbuf_fragment>\n    \n    #ifdef USE_MAP\n    vec4 texelColor = texture2D( map, vUv);\n    diffuseColor *= texelColor;\n    #endif\n\n    outgoingLight = diffuseColor.rgb;\n\n    gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n    \n    #include <tonemapping_fragment>\n\n}\n";
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
"\n\n#include <uv_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\nattribute vec3 offset;\nattribute float rotation;\nattribute float size;\nattribute vec4 color;\nattribute float uvTile;\n\nvarying vec4 vColor;\n\n#ifdef UV_TILE\nuniform vec2 tileCount;\n#endif\n\nvoid main() {\n\n    #ifdef UV_TILE\n        vUv = vec2((mod(uvTile, tileCount.y) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.y) - 1.0) + uv.y) * (1.0 / tileCount.y));\n    #else\n        #include <uv_vertex>\n    #endif\n\t\n    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );\n\t\n    vec2 alignedPosition = ( position.xy ) * size;\n    \n    vec2 rotatedPosition;\n    rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\n    rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\n    \n    mvPosition.xy += rotatedPosition;\n\n\tvColor = color;\n\n\tgl_Position = projectionMatrix * mvPosition;\n\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\n}\n";
/*
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
		if ( isPerspective ) computedSize *= - mvPosition.z;
	#endif
 */

var local_particle_vert = /* glsl */
"\n\n#include <uv_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\nattribute vec3 offset;\nattribute vec4 rotation;\nattribute float size;\nattribute vec4 color;\nattribute float uvTile;\n\nvarying vec4 vColor;\n\n#ifdef UV_TILE\nuniform vec2 tileCount;\n#endif\n\nvoid main() {\n\n    #ifdef UV_TILE\n        vUv = vec2((mod(uvTile, tileCount.y) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.y) - 1.0) + uv.y) * (1.0 / tileCount.y));\n    #else\n        #include <uv_vertex>\n    #endif\n    \n    float x2 = rotation.x + rotation.x, y2 = rotation.y + rotation.y, z2 = rotation.z + rotation.z;\n    float xx = rotation.x * x2, xy = rotation.x * y2, xz = rotation.x * z2;\n    float yy = rotation.y * y2, yz = rotation.y * z2, zz = rotation.z * z2;\n    float wx = rotation.w * x2, wy = rotation.w * y2, wz = rotation.w * z2;\n    float sx = size, sy = size, sz = size;\n    \n    mat4 matrix = mat4(( 1.0 - ( yy + zz ) ) * sx, ( xy + wz ) * sx, ( xz - wy ) * sx, 0.0,  // 1. column\n                      ( xy - wz ) * sy, ( 1.0 - ( xx + zz ) ) * sy, ( yz + wx ) * sy, 0.0,  // 2. column\n                      ( xz + wy ) * sz, ( yz - wx ) * sz, ( 1.0 - ( xx + yy ) ) * sz, 0.0,  // 3. column\n                      offset.x, offset.y, offset.z, 1.0);\n    \n    vec4 mvPosition = modelViewMatrix * (matrix * vec4( position, 1.0 ));\n\n\tvColor = color;\n\n\tgl_Position = projectionMatrix * mvPosition;\n\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\n}\n";

var stretched_bb_particle_vert = /* glsl */
"\n\n#include <uv_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\nattribute vec3 offset;\nattribute float rotation;\nattribute float size;\nattribute vec4 color;\nattribute vec3 velocity;\nattribute float uvTile;\n\nvarying vec4 vColor;\n\n#ifdef UV_TILE\nuniform vec2 tileCount;\n#endif\n\nuniform float speedFactor;\n\nvoid main() {\n\n    #ifdef UV_TILE\n        vUv = vec2((mod(uvTile, tileCount.y) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.y) - 1.0) + uv.y) * (1.0 / tileCount.y));\n    #else\n        #include <uv_vertex>\n    #endif\n\t\n    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );\n    vec3 viewVelocity = normalMatrix * velocity;\n\n    vec3 scaledPos = vec3(position.xy * size, position.z);\n    mvPosition.xyz += scaledPos + dot(scaledPos, viewVelocity) * viewVelocity / length(viewVelocity) * speedFactor;\n\n\tvColor = color;\n\n\tgl_Position = projectionMatrix * mvPosition;\n\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\n}\n";
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

var DEFAULT_MAX_PARTICLE$1 = 1000;
new Vector3(0, 0, 1);
var SpriteBatch = /*#__PURE__*/function (_ParticleSystemBatch) {
  _inherits(SpriteBatch, _ParticleSystemBatch);

  var _super = _createSuper(SpriteBatch);

  function SpriteBatch(settings) {
    var _this;

    _classCallCheck(this, SpriteBatch);

    _this = _super.call(this, settings);

    _defineProperty(_assertThisInitialized(_this), "geometry", void 0);

    _defineProperty(_assertThisInitialized(_this), "offsetBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "rotationBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "sizeBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "colorBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "uvTileBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "velocityBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "vector_", new Vector3());

    _defineProperty(_assertThisInitialized(_this), "quaternion_", new Quaternion());

    _defineProperty(_assertThisInitialized(_this), "quaternion2_", new Quaternion());

    _defineProperty(_assertThisInitialized(_this), "quaternion3_", new Quaternion());

    _defineProperty(_assertThisInitialized(_this), "rotationMat_", new Matrix3());

    _defineProperty(_assertThisInitialized(_this), "rotationMat2_", new Matrix3());

    _this.setupBuffers();

    _this.rebuildMaterial(); // TODO: implement boundingVolume


    return _this;
  }

  _createClass(SpriteBatch, [{
    key: "setupBuffers",
    value: function setupBuffers() {
      this.geometry = new InstancedBufferGeometry();
      this.geometry.setIndex(this.settings.instancingGeometry.getIndex());
      this.geometry.setAttribute('position', this.settings.instancingGeometry.getAttribute('position')); //new InterleavedBufferAttribute(this.interleavedBuffer, 3, 0, false));

      this.geometry.setAttribute('uv', this.settings.instancingGeometry.getAttribute('uv')); //new InterleavedBufferAttribute(this.interleavedBuffer, 2, 3, false));

      this.offsetBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE$1 * 3), 3);
      this.offsetBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('offset', this.offsetBuffer);
      this.colorBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE$1 * 4), 4);
      this.colorBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('color', this.colorBuffer);

      if (this.settings.renderMode === RenderMode.LocalSpace) {
        this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE$1 * 4), 4);
        this.rotationBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('rotation', this.rotationBuffer);
      } else if (this.settings.renderMode === RenderMode.BillBoard || this.settings.renderMode === RenderMode.StretchedBillBoard) {
        this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE$1), 1);
        this.rotationBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('rotation', this.rotationBuffer);
      }

      this.sizeBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE$1), 1);
      this.sizeBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('size', this.sizeBuffer);
      this.uvTileBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE$1), 1);
      this.uvTileBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('uvTile', this.uvTileBuffer);

      if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
        this.velocityBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE$1 * 3), 3);
        this.velocityBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('velocity', this.velocityBuffer);
      }
    }
  }, {
    key: "rebuildMaterial",
    value: function rebuildMaterial() {
      var uniforms = {};
      var defines = {};
      defines['USE_MAP'] = '';
      defines['USE_UV'] = '';
      uniforms['map'] = new Uniform(this.settings.texture); //@ts-ignore

      uniforms['uvTransform'] = new Uniform(new Matrix3().copy(this.settings.texture.matrix));
      var uTileCount = this.settings.uTileCount;
      var vTileCount = this.settings.vTileCount;
      defines['UV_TILE'] = '';
      uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));

      if (this.settings.renderMode === RenderMode.BillBoard || this.settings.renderMode === RenderMode.LocalSpace) {
        var vertexShader;
        var side;

        if (this.settings.renderMode === RenderMode.LocalSpace) {
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
          transparent: this.settings.transparent,
          depthWrite: !this.settings.transparent,
          blending: this.settings.blending || AdditiveBlending,
          side: side
        });
      } else if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
        uniforms['speedFactor'] = new Uniform(1.0);
        this.material = new ShaderMaterial({
          uniforms: uniforms,
          defines: defines,
          vertexShader: stretched_bb_particle_vert,
          fragmentShader: particle_frag,
          transparent: this.settings.transparent,
          depthWrite: !this.settings.transparent,
          blending: this.settings.blending || AdditiveBlending
        });
      } else {
        throw new Error("render mode unavailable");
      }
    }
    /*
    clone() {
        let system = this.system.clone();
        return system.emitter as any;
    }*/

  }, {
    key: "update",
    value: function update() {
      var _this2 = this;

      var index = 0;
      this.systems.forEach(function (system) {
        var particles = system.particles;
        var particleNum = system.particleNum;

        _this2.quaternion2_.setFromRotationMatrix(system.emitter.matrixWorld);

        _this2.rotationMat_.setFromMatrix4(system.emitter.matrixWorld);

        for (var j = 0; j < particleNum; j++, index++) {
          var particle = particles[j];

          if (_this2.settings.renderMode === RenderMode.LocalSpace) {
            //this.quaternion_.setFromAxisAngle(UP, particle.rotation as number);
            var q = void 0;

            if (system.worldSpace) {
              q = particle.rotation;
            } else {
              var parentQ = void 0;

              if (particle.parentMatrix) {
                parentQ = _this2.quaternion3_.setFromRotationMatrix(particle.parentMatrix);
              } else {
                parentQ = _this2.quaternion2_;
              }

              q = _this2.quaternion_;
              q.copy(particle.rotation).multiply(parentQ);
            }

            _this2.rotationBuffer.setXYZW(index, q.x, q.y, q.z, q.w);
          } else if (_this2.settings.renderMode === RenderMode.StretchedBillBoard || _this2.settings.renderMode === RenderMode.BillBoard) {
            _this2.rotationBuffer.setX(index, particle.rotation);
          }

          var vec = void 0;

          if (system.worldSpace) {
            vec = particle.position;
          } else {
            vec = _this2.vector_;

            if (particle.parentMatrix) {
              vec.copy(particle.position).applyMatrix4(particle.parentMatrix);
            } else {
              vec.copy(particle.position).applyMatrix4(system.emitter.matrixWorld);
            }
          }

          _this2.offsetBuffer.setXYZ(index, vec.x, vec.y, vec.z);

          _this2.colorBuffer.setXYZW(index, particle.color.x, particle.color.y, particle.color.z, particle.color.w);

          _this2.sizeBuffer.setX(index, particle.size);

          _this2.uvTileBuffer.setX(index, particle.uvTile);

          if (_this2.settings.renderMode === RenderMode.StretchedBillBoard) {
            var speedFactor = system.speedFactor;

            var _vec = void 0;

            if (system.worldSpace) {
              _vec = particle.velocity;
            } else {
              _vec = _this2.vector_;

              if (particle.parentMatrix) {
                _this2.rotationMat2_.setFromMatrix4(particle.parentMatrix);

                _vec.copy(particle.velocity).applyMatrix3(_this2.rotationMat2_);
              } else {
                _vec.copy(particle.velocity).applyMatrix3(_this2.rotationMat_);
              }
            }

            _this2.velocityBuffer.setXYZ(index, _vec.x * speedFactor, _vec.y * speedFactor, _vec.z * speedFactor);
          }
        }
      });
      this.geometry.instanceCount = index;

      if (index > 0) {
        this.offsetBuffer.updateRange.count = index * 3;
        this.offsetBuffer.needsUpdate = true;
        this.sizeBuffer.updateRange.count = index;
        this.sizeBuffer.needsUpdate = true;
        this.colorBuffer.updateRange.count = index * 4;
        this.colorBuffer.needsUpdate = true;
        this.uvTileBuffer.updateRange.count = index;
        this.uvTileBuffer.needsUpdate = true;

        if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
          this.velocityBuffer.updateRange.count = index * 3;
          this.velocityBuffer.needsUpdate = true;
        }

        if (this.settings.renderMode === RenderMode.LocalSpace) {
          this.rotationBuffer.updateRange.count = index * 4;
          this.rotationBuffer.needsUpdate = true;
        } else if (this.settings.renderMode === RenderMode.StretchedBillBoard || this.settings.renderMode === RenderMode.BillBoard) {
          this.rotationBuffer.updateRange.count = index;
          this.rotationBuffer.needsUpdate = true;
        }
      }
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.geometry.dispose();
    }
  }]);

  return SpriteBatch;
}(ParticleSystemBatch);

var trail_frag = /* glsl */
"\n\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\nuniform sampler2D alphaMap;\nuniform float useAlphaMap;\nuniform float visibility;\nuniform float alphaTest;\nuniform vec2 repeat;\n\nvarying vec4 vColor;\n    \nvoid main() {\n    #include <clipping_planes_fragment>\n    #include <logdepthbuf_fragment>\n\n    vec4 c = vColor;\n    \n    #ifdef USE_MAP\n    c *= texture2D( map, vUv * repeat );\n    #endif\n    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUv * repeat ).a;\n    if( c.a < alphaTest ) discard;\n    gl_FragColor = c;\n\n    #include <fog_fragment>\n    #include <tonemapping_fragment>\n}";

var trail_vert = /* glsl */
"\n\n#include <uv_pars_vertex>\n#include <clipping_planes_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <fog_pars_vertex>\n\nattribute vec3 previous;\nattribute vec3 next;\nattribute vec4 color;\nattribute float side;\nattribute float width;\n\nuniform vec2 resolution;\nuniform float lineWidth;\nuniform float sizeAttenuation;\n\nvarying vec2 vUV;\nvarying vec4 vColor;\n    \nvec2 fix(vec4 i, float aspect) {\n    vec2 res = i.xy / i.w;\n    res.x *= aspect;\n    return res;\n}\n    \nvoid main() {\n\n    #include <uv_vertex>\n    \n    float aspect = resolution.x / resolution.y;\n\n    vColor = color;\n\n    mat4 m = projectionMatrix * modelViewMatrix;\n    vec4 finalPosition = m * vec4( position, 1.0 );\n    vec4 prevPos = m * vec4( previous, 1.0 );\n    vec4 nextPos = m * vec4( next, 1.0 );\n\n    vec2 currentP = fix( finalPosition, aspect );\n    vec2 prevP = fix( prevPos, aspect );\n    vec2 nextP = fix( nextPos, aspect );\n\n    float w = lineWidth * width;\n\n    vec2 dir;\n    if( nextP == currentP ) dir = normalize( currentP - prevP );\n    else if( prevP == currentP ) dir = normalize( nextP - currentP );\n    else {\n        vec2 dir1 = normalize( currentP - prevP );\n        vec2 dir2 = normalize( nextP - currentP );\n        dir = normalize( dir1 + dir2 );\n\n        vec2 perp = vec2( -dir1.y, dir1.x );\n        vec2 miter = vec2( -dir.y, dir.x );\n        //w = clamp( w / dot( miter, perp ), 0., 4., * lineWidth * width );\n\n    }\n\n    //vec2 normal = ( cross( vec3( dir, 0. ) vec3( 0., 0., 1. ) ) ).xy;\n    vec4 normal = vec4( -dir.y, dir.x, 0., 1. );\n    normal.xy *= .5 * w;\n    normal *= projectionMatrix;\n    if( sizeAttenuation == 0. ) {\n        normal.xy *= finalPosition.w;\n        normal.xy /= ( vec4( resolution, 0., 1. ) * projectionMatrix ).xy;\n    }\n\n    finalPosition.xy += normal.xy * side;\n\n    gl_Position = finalPosition;\n\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    \n\t#include <fog_vertex>\n}";

var DEFAULT_MAX_PARTICLE = 10000;
new Vector3(0, 0, 1);
var TrailBatch = /*#__PURE__*/function (_ParticleSystemBatch) {
  _inherits(TrailBatch, _ParticleSystemBatch);

  var _super = _createSuper(TrailBatch);

  function TrailBatch(settings) {
    var _this;

    _classCallCheck(this, TrailBatch);

    _this = _super.call(this, settings);

    _defineProperty(_assertThisInitialized(_this), "geometry", void 0);

    _defineProperty(_assertThisInitialized(_this), "positionBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "previousBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "nextBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "uvBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "sideBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "widthBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "colorBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "indexBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "vector_", new Vector3());

    _this.setupBuffers();

    _this.rebuildMaterial(); // TODO: implement boundingVolume


    return _this;
  }

  _createClass(TrailBatch, [{
    key: "setupBuffers",
    value: function setupBuffers() {
      this.geometry = new BufferGeometry();
      this.indexBuffer = new BufferAttribute(new Uint32Array(DEFAULT_MAX_PARTICLE * 6), 1);
      this.indexBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setIndex(this.indexBuffer);
      this.positionBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 6), 3);
      this.positionBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('position', this.positionBuffer);
      this.previousBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 6), 3);
      this.previousBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('previous', this.previousBuffer);
      this.nextBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 6), 3);
      this.nextBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('next', this.nextBuffer);
      this.widthBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 2), 1);
      this.widthBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('width', this.widthBuffer);
      this.sideBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 2), 1);
      this.sideBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('side', this.sideBuffer);
      this.uvBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 4), 2);
      this.uvBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('uv', this.uvBuffer);
      this.colorBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 8), 4);
      this.colorBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('color', this.colorBuffer);
    }
  }, {
    key: "rebuildMaterial",
    value: function rebuildMaterial() {
      var uniforms = {
        lineWidth: {
          value: 1
        },
        map: {
          value: null
        },
        useMap: {
          value: 0
        },
        alphaMap: {
          value: null
        },
        useAlphaMap: {
          value: 0
        },
        resolution: {
          value: new Vector2(1, 1)
        },
        sizeAttenuation: {
          value: 1
        },
        visibility: {
          value: 1
        },
        alphaTest: {
          value: 0
        },
        repeat: {
          value: new Vector2(1, 1)
        }
      };
      var defines = {};
      defines['USE_MAP'] = '';
      defines['USE_UV'] = '';
      uniforms['map'] = new Uniform(this.settings.texture); //@ts-ignore

      uniforms['uvTransform'] = new Uniform(new Matrix3().copy(this.settings.texture.matrix));

      if (this.settings.renderMode === RenderMode.Trail) {
        this.material = new ShaderMaterial({
          uniforms: uniforms,
          defines: defines,
          vertexShader: trail_vert,
          fragmentShader: trail_frag,
          transparent: this.settings.transparent,
          depthWrite: !this.settings.transparent,
          side: DoubleSide,
          blending: this.settings.blending || AdditiveBlending
        });
      } else {
        throw new Error("render mode unavailable");
      }
    }
    /*
    clone() {
        let system = this.system.clone();
        return system.emitter as any;
    }*/

  }, {
    key: "update",
    value: function update() {
      var _this2 = this;

      var index = 0;
      var triangles = 0;
      this.systems.forEach(function (system) {
        var particles = system.particles;
        var particleNum = system.particleNum;
        var uTileCount = _this2.settings.uTileCount;
        var vTileCount = _this2.settings.vTileCount;
        var tileWidth = 1 / uTileCount;
        var tileHeight = 1 / vTileCount;

        for (var j = 0; j < particleNum; j++) {
          var particle = particles[j];
          var col = particle.uvTile % vTileCount;
          var row = Math.floor(particle.uvTile / vTileCount);

          for (var i = 0; i < particle.previous.length; i++, index += 2) {
            var recordState = particle.previous[i];

            _this2.positionBuffer.setXYZ(index, recordState.position.x, recordState.position.y, recordState.position.z);

            _this2.positionBuffer.setXYZ(index + 1, recordState.position.x, recordState.position.y, recordState.position.z);

            if (system.worldSpace) {
              _this2.positionBuffer.setXYZ(index, recordState.position.x, recordState.position.y, recordState.position.z);

              _this2.positionBuffer.setXYZ(index + 1, recordState.position.x, recordState.position.y, recordState.position.z);
            } else {
              if (particle.parentMatrix) {
                _this2.vector_.copy(recordState.position).applyMatrix4(particle.parentMatrix);
              } else {
                _this2.vector_.copy(recordState.position).applyMatrix4(system.emitter.matrixWorld);
              }

              _this2.positionBuffer.setXYZ(index, _this2.vector_.x, _this2.vector_.y, _this2.vector_.z);

              _this2.positionBuffer.setXYZ(index + 1, _this2.vector_.x, _this2.vector_.y, _this2.vector_.z);
            }

            var previous = void 0;

            if (i - 1 >= 0) {
              previous = particle.previous[i - 1];
            } else {
              previous = particle.previous[0];
            }

            if (system.worldSpace) {
              _this2.previousBuffer.setXYZ(index, previous.position.x, previous.position.y, previous.position.z);

              _this2.previousBuffer.setXYZ(index + 1, previous.position.x, previous.position.y, previous.position.z);
            } else {
              if (particle.parentMatrix) {
                _this2.vector_.copy(previous.position).applyMatrix4(particle.parentMatrix);
              } else {
                _this2.vector_.copy(previous.position).applyMatrix4(system.emitter.matrixWorld);
              }

              _this2.previousBuffer.setXYZ(index, _this2.vector_.x, _this2.vector_.y, _this2.vector_.z);

              _this2.previousBuffer.setXYZ(index + 1, _this2.vector_.x, _this2.vector_.y, _this2.vector_.z);
            }

            var next = void 0;

            if (i + 1 < particle.previous.length) {
              next = particle.previous[i + 1];
            } else {
              next = particle.previous[particle.previous.length - 1];
            }

            if (system.worldSpace) {
              _this2.nextBuffer.setXYZ(index, next.position.x, next.position.y, next.position.z);

              _this2.nextBuffer.setXYZ(index + 1, next.position.x, next.position.y, next.position.z);
            } else {
              if (particle.parentMatrix) {
                _this2.vector_.copy(next.position).applyMatrix4(particle.parentMatrix);
              } else {
                _this2.vector_.copy(next.position).applyMatrix4(system.emitter.matrixWorld);
              }

              _this2.nextBuffer.setXYZ(index, _this2.vector_.x, _this2.vector_.y, _this2.vector_.z);

              _this2.nextBuffer.setXYZ(index + 1, _this2.vector_.x, _this2.vector_.y, _this2.vector_.z);
            }

            _this2.sideBuffer.setX(index, -1);

            _this2.sideBuffer.setX(index + 1, 1);

            _this2.widthBuffer.setX(index, recordState.size);

            _this2.widthBuffer.setX(index + 1, recordState.size);

            _this2.uvBuffer.setXY(index, (i / particle.previous.length + col) * tileWidth, (vTileCount - row - 1) * tileHeight);

            _this2.uvBuffer.setXY(index + 1, (i / particle.previous.length + col) * tileWidth, (vTileCount - row) * tileHeight);

            _this2.colorBuffer.setXYZW(index, recordState.color.x, recordState.color.y, recordState.color.z, recordState.color.w);

            _this2.colorBuffer.setXYZW(index + 1, recordState.color.x, recordState.color.y, recordState.color.z, recordState.color.w);

            if (i + 1 < particle.previous.length) {
              _this2.indexBuffer.setX(triangles * 3, index);

              _this2.indexBuffer.setX(triangles * 3 + 1, index + 1);

              _this2.indexBuffer.setX(triangles * 3 + 2, index + 2);

              triangles++;

              _this2.indexBuffer.setX(triangles * 3, index + 2);

              _this2.indexBuffer.setX(triangles * 3 + 1, index + 1);

              _this2.indexBuffer.setX(triangles * 3 + 2, index + 3);

              triangles++;
            }
          }
        }
      });
      this.positionBuffer.updateRange.count = index * 3;
      this.positionBuffer.needsUpdate = true;
      this.previousBuffer.updateRange.count = index * 3;
      this.previousBuffer.needsUpdate = true;
      this.nextBuffer.updateRange.count = index * 3;
      this.nextBuffer.needsUpdate = true;
      this.sideBuffer.updateRange.count = index;
      this.sideBuffer.needsUpdate = true;
      this.widthBuffer.updateRange.count = index;
      this.widthBuffer.needsUpdate = true;
      this.uvBuffer.updateRange.count = index * 2;
      this.uvBuffer.needsUpdate = true;
      this.colorBuffer.updateRange.count = index * 4;
      this.colorBuffer.needsUpdate = true;
      this.indexBuffer.updateRange.count = triangles * 3;
      this.indexBuffer.needsUpdate = true;
      this.geometry.setDrawRange(0, triangles * 3);
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.geometry.dispose();
    }
  }]);

  return TrailBatch;
}(ParticleSystemBatch);

var BatchedParticleRenderer = /*#__PURE__*/function (_Object3D) {
  _inherits(BatchedParticleRenderer, _Object3D);

  var _super = _createSuper(BatchedParticleRenderer);

  function BatchedParticleRenderer() {
    var _this;

    _classCallCheck(this, BatchedParticleRenderer);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "batches", []);

    _defineProperty(_assertThisInitialized(_this), "systemToBatchIndex", new Map());

    _defineProperty(_assertThisInitialized(_this), "type", "BatchedParticleRenderer");

    return _this;
  }

  _createClass(BatchedParticleRenderer, [{
    key: "addSystem",
    value: function addSystem(system) {
      var settings = system.getRendererSettings();

      for (var i = 0; i < this.batches.length; i++) {
        if (BatchedParticleRenderer.equals(this.batches[i].settings, settings)) {
          this.batches[i].addSystem(system);
          this.systemToBatchIndex.set(system, i);
          return;
        }
      }

      var batch;

      switch (settings.renderMode) {
        case RenderMode.Trail:
          batch = new TrailBatch(settings);
          break;

        case RenderMode.LocalSpace:
        case RenderMode.BillBoard:
        case RenderMode.StretchedBillBoard:
          batch = new SpriteBatch(settings);
          break;
      }

      batch.addSystem(system);
      this.batches.push(batch);
      this.systemToBatchIndex.set(system, this.batches.length - 1);
      this.add(batch);
    }
  }, {
    key: "deleteSystem",
    value: function deleteSystem(system) {
      var batchIndex = this.systemToBatchIndex.get(system);

      if (batchIndex != undefined) {
        this.batches[batchIndex].removeSystem(system);
        this.systemToBatchIndex["delete"](system);
      }
      /*const settings = system.getRendererSettings();
      for (let i = 0; i < this.batches.length; i++) {
          if (BatchedParticleRenderer.equals(this.batches[i].settings, settings)) {
              this.batches[i].removeSystem(system);
              return;
          }
      }*/

    }
  }, {
    key: "updateSystem",
    value: function updateSystem(system) {
      this.deleteSystem(system);
      this.addSystem(system);
    }
  }, {
    key: "update",
    value: function update(delta) {
      this.systemToBatchIndex.forEach(function (value, ps) {
        ps.update(delta);
      });

      for (var i = 0; i < this.batches.length; i++) {
        this.batches[i].update();
      }
    }
  }], [{
    key: "equals",
    value: function equals(a, b) {
      return a.texture === b.texture && a.blending === b.blending && a.renderMode === b.renderMode && a.uTileCount === b.uTileCount && a.vTileCount === b.vTileCount && a.instancingGeometry === b.instancingGeometry && a.transparent === b.transparent && a.renderOrder === b.renderOrder;
    }
  }]);

  return BatchedParticleRenderer;
}(Object3D);

var TYPED_ARRAYS = {
  Int8Array: Int8Array,
  Uint8Array: Uint8Array,
  Uint8ClampedArray: Uint8ClampedArray,
  Int16Array: Int16Array,
  Uint16Array: Uint16Array,
  Int32Array: Int32Array,
  Uint32Array: Uint32Array,
  Float32Array: Float32Array,
  Float64Array: Float64Array
};
var Geometries = {
  BoxGeometry: BoxGeometry,
  //CapsuleGeometry: CapsuleGeometry,
  CircleGeometry: CircleGeometry,
  ConeGeometry: ConeGeometry,
  CylinderGeometry: CylinderGeometry,
  DodecahedronGeometry: DodecahedronGeometry,
  EdgesGeometry: EdgesGeometry,
  ExtrudeGeometry: ExtrudeGeometry,
  IcosahedronGeometry: IcosahedronGeometry,
  LatheGeometry: LatheGeometry,
  OctahedronGeometry: OctahedronGeometry,
  PlaneGeometry: PlaneGeometry,
  PolyhedronGeometry: PolyhedronGeometry,
  RingGeometry: RingGeometry,
  ShapeGeometry: ShapeGeometry,
  SphereGeometry: SphereGeometry,
  TetrahedronGeometry: TetrahedronGeometry,
  TorusGeometry: TorusGeometry,
  TorusKnotGeometry: TorusKnotGeometry,
  TubeGeometry: TubeGeometry,
  WireframeGeometry: WireframeGeometry
};

function getTypedArray(type, buffer) {
  return new TYPED_ARRAYS[type](buffer);
}

var QuarksLoader = /*#__PURE__*/function () {
  function QuarksLoader(manager) {
    _classCallCheck(this, QuarksLoader);

    _defineProperty(this, "manager", void 0);

    _defineProperty(this, "crossOrigin", "anonymous");

    _defineProperty(this, "path", void 0);

    _defineProperty(this, "resourcePath", void 0);

    this.manager = manager !== undefined ? manager : DefaultLoadingManager;
    this.resourcePath = '';
  }

  _createClass(QuarksLoader, [{
    key: "setPath",
    value: function setPath(value) {
      this.path = value;
      return this;
    }
  }, {
    key: "setResourcePath",
    value: function setResourcePath(value) {
      this.resourcePath = value;
      return this;
    }
  }, {
    key: "setCrossOrigin",
    value: function setCrossOrigin(value) {
      this.crossOrigin = value;
      return this;
    }
  }, {
    key: "load",
    value: function load(url, renderer, onLoad, onProgress, onError) {
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

        scope.parse(json, onLoad, renderer);
      }, onProgress, onError);
    }
  }, {
    key: "loadImage",
    value: function loadImage(loader, url) {
      var scope = this;
      scope.manager.itemStart(url);
      return loader.load(url, function () {
        scope.manager.itemEnd(url);
      }, undefined, function () {
        scope.manager.itemError(url);
        scope.manager.itemEnd(url);
      });
    }
  }, {
    key: "deserializeImage",
    value: function deserializeImage(loader, image) {
      if (typeof image === 'string') {
        var url = image;
        var path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(url) ? url : this.resourcePath + url;
        return this.loadImage(loader, path);
      } else {
        if (image.data) {
          return {
            data: getTypedArray(image.type, image.data),
            width: image.width,
            height: image.height
          };
        } else {
          return null;
        }
      }
    }
  }, {
    key: "parseImages",
    value: function parseImages(json, onLoad) {
      var scope = this;
      var images = {};
      var loader;

      if (json !== undefined && json.length > 0) {
        var manager = new LoadingManager(onLoad);
        loader = new ImageLoader(manager);
        loader.setCrossOrigin(this.crossOrigin);

        for (var i = 0, il = json.length; i < il; i++) {
          var image = json[i];
          var url = image.url;

          if (Array.isArray(url)) {
            // load array of images e.g CubeTexture
            var imageArray = [];

            for (var j = 0, jl = url.length; j < jl; j++) {
              var currentUrl = url[j];
              var deserializedImage = scope.deserializeImage(loader, currentUrl);

              if (deserializedImage !== null) {
                if (deserializedImage instanceof HTMLImageElement) {
                  imageArray.push(deserializedImage);
                } else {
                  // special case: handle array of data textures for cube textures
                  imageArray.push(new DataTexture(deserializedImage.data, deserializedImage.width, deserializedImage.height));
                }
              }
            }

            images[image.uuid] = new Source(imageArray);
          } else {
            // load single image
            var _deserializedImage = scope.deserializeImage(loader, image.url);

            images[image.uuid] = new Source(_deserializedImage);
          }
        }
      }

      return images;
    }
  }, {
    key: "parseShapes",
    value: function parseShapes(json) {
      var shapes = {};

      if (json !== undefined) {
        for (var i = 0, l = json.length; i < l; i++) {
          var shape = new Shape().fromJSON(json[i]);
          shapes[shape.uuid] = shape;
        }
      }

      return shapes;
    }
  }, {
    key: "parseGeometries",
    value: function parseGeometries(json, shapes) {
      var geometries = {};

      if (json !== undefined) {
        var bufferGeometryLoader = new BufferGeometryLoader();

        for (var i = 0, l = json.length; i < l; i++) {
          var geometry = void 0;
          var data = json[i];

          switch (data.type) {
            case 'BufferGeometry':
            case 'InstancedBufferGeometry':
              geometry = bufferGeometryLoader.parse(data);
              break;

            case 'Geometry':
              console.error('THREE.ObjectLoader: The legacy Geometry type is no longer supported.');
              break;

            default:
              if (data.type in Geometries && Geometries[data.type].fromJSON) {
                geometry = Geometries[data.type].fromJSON(data, shapes);
              } else {
                console.warn("THREE.ObjectLoader: Unsupported geometry type \"".concat(data.type, "\""));
                continue;
              }

          }

          geometry.uuid = data.uuid;
          if (data.name !== undefined) geometry.name = data.name;
          if (geometry.isBufferGeometry && data.userData !== undefined) geometry.userData = data.userData;
          geometries[data.uuid] = geometry;
        }
      }

      return geometries;
    }
  }, {
    key: "parseTextures",
    value: function parseTextures(json, images) {
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

          var source = images[data.image];
          var image = source.data;
          var texture = void 0;

          if (Array.isArray(image)) {
            texture = new CubeTexture();
            if (image.length === 6) texture.needsUpdate = true;
          } else {
            if (image && image.data) {
              texture = new DataTexture();
            } else {
              texture = new Texture();
            }

            if (image) texture.needsUpdate = true; // textures can have undefined image data
          }

          texture.source = source;
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
          if (data.userData !== undefined) texture.userData = data.userData;
          textures[data.uuid] = texture;
        }
      }

      return textures;
    }
  }, {
    key: "parseObject",
    value: function parseObject(data, meta, dependencies, renderer) {
      var object;

      switch (data.type) {
        case 'ParticleEmitter':
          object = ParticleSystem.fromJSON(data.ps, meta, dependencies, renderer).emitter;
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
          object.add(this.parseObject(children[i], meta, dependencies, renderer));
        }
      }

      return object;
    }
  }, {
    key: "parse",
    value: function parse(json, onLoad, renderer) {
      var images = this.parseImages(json.images, function () {
        if (onLoad !== undefined) onLoad(object);
      });
      var textures = this.parseTextures(json.textures, images);
      var shapes = this.parseShapes(json.shapes);
      var geometries = this.parseGeometries(json.geometries, shapes);
      var meta = {
        images: images,
        textures: textures,
        shapes: shapes,
        geometries: geometries
      };
      var dependencies = {};
      var object = this.parseObject(json.object, meta, dependencies, renderer);
      object.traverse(function (obj) {
        if (dependencies[obj.uuid]) {
          dependencies[obj.uuid].subParticleSystem = obj;
        }
      });

      if (json.images === undefined || json.images.length === 0) {
        if (onLoad !== undefined) onLoad(object);
      }

      return object;
    }
  }]);

  return QuarksLoader;
}();
var TEXTURE_MAPPING = {
  UVMapping: UVMapping,
  CubeReflectionMapping: CubeReflectionMapping,
  CubeRefractionMapping: CubeRefractionMapping,
  EquirectangularReflectionMapping: EquirectangularReflectionMapping,
  EquirectangularRefractionMapping: EquirectangularRefractionMapping,
  CubeUVReflectionMapping: CubeUVReflectionMapping
};
var TEXTURE_WRAPPING = {
  RepeatWrapping: RepeatWrapping,
  ClampToEdgeWrapping: ClampToEdgeWrapping,
  MirroredRepeatWrapping: MirroredRepeatWrapping
};
var TEXTURE_FILTER = {
  NearestFilter: NearestFilter,
  NearestMipmapNearestFilter: NearestMipmapNearestFilter,
  NearestMipmapLinearFilter: NearestMipmapLinearFilter,
  LinearFilter: LinearFilter,
  LinearMipmapNearestFilter: LinearMipmapNearestFilter,
  LinearMipmapLinearFilter: LinearMipmapLinearFilter
};

export { ApplyForce, BatchedParticleRenderer, BehaviorFromJSON, BehaviorTypes, Bezier, ChangeEmitDirection, ColorGeneratorFromJSON, ColorOverLife, ColorRange, ConeEmitter, ConstantColor, ConstantValue, DonutEmitter, EmitSubParticleSystem, EmitterFromJSON, EmitterShapes, FrameOverLife, Gradient, GravityForce, IntervalValue, MeshSurfaceEmitter, OrbitOverLife, ParticleEmitter, ParticleSystem, ParticleSystemBatch, PiecewiseBezier, PiecewiseFunction, PointEmitter, QuarksLoader, RandomColor, RecordState, RenderMode, RotationOverLife, SizeOverLife, SpeedOverLife, SphereEmitter, SpriteBatch, SpriteParticle, TrailBatch, TrailParticle, ValueGeneratorFromJSON, WidthOverLength };
