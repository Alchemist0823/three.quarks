/**
 * three.quarks v0.4.0 build Sun Oct 17 2021
 * https://github.com/Alchemist0823/three.quarks#readme
 * Copyright 2021 Alchemist0823 <the.forrest.sun@gmail.com>, MIT
 */
import { Object3D, Vector4, Vector3, MathUtils, Quaternion, Matrix3, InstancedBufferGeometry, InstancedBufferAttribute, DynamicDrawUsage, Uniform, Vector2, ShaderMaterial, AdditiveBlending, Mesh, DoubleSide, FrontSide, PlaneBufferGeometry, Matrix4, NormalBlending, DefaultLoadingManager, LoaderUtils, FileLoader, LoadingManager, ImageLoader, CubeTexture, Texture, Group, UVMapping, CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, CubeUVReflectionMapping, CubeUVRefractionMapping, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping, NearestFilter, NearestMipMapNearestFilter, NearestMipMapLinearFilter, LinearFilter, LinearMipMapNearestFilter, LinearMipMapLinearFilter } from './three.module.js';

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

    _this.system = system;
    _this.visible = false; // TODO: implement boundingVolume

    return _this;
  }

  _createClass(ParticleEmitter, [{
    key: "clone",
    value: function clone() {
      var system = this.system.clone();
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
          shapes: {}
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
  }]);

  return ParticleEmitter;
}(Object3D);

var Particle = function Particle() {
  _classCallCheck(this, Particle);

  _defineProperty(this, "startSpeed", 0);

  _defineProperty(this, "startColor", new Vector4());

  _defineProperty(this, "startSize", 1);

  _defineProperty(this, "velocity", new Vector3());

  _defineProperty(this, "age", 0);

  _defineProperty(this, "life", 1);

  _defineProperty(this, "angularVelocity", void 0);

  _defineProperty(this, "position", new Vector3());

  _defineProperty(this, "rotation", 0);

  _defineProperty(this, "rotationQuat", void 0);

  _defineProperty(this, "size", 1);

  _defineProperty(this, "color", new Vector4());

  _defineProperty(this, "uvTile", 0);
};

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

var ColorOverLife = /*#__PURE__*/function () {
  function ColorOverLife(func) {
    _classCallCheck(this, ColorOverLife);

    this.func = func;

    _defineProperty(this, "type", 'ColorOverLife');
  }

  _createClass(ColorOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle, delta) {
      this.func.genColor(particle.color, particle.age / particle.life);
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
        func: this.func.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ColorOverLife(this.func.clone());
    }
  }]);

  return ColorOverLife;
}();

var RotationOverLife = /*#__PURE__*/function () {
  function RotationOverLife(angularVelocityFunc) {
    _classCallCheck(this, RotationOverLife);

    this.angularVelocityFunc = angularVelocityFunc;

    _defineProperty(this, "type", 'RotationOverLife');
  }

  _createClass(RotationOverLife, [{
    key: "initialize",
    value: function initialize(particle) {
      if (this.angularVelocityFunc.type === 'value') {
        particle.angularVelocity = this.angularVelocityFunc.genValue();
      } else {
        particle.angularVelocity = 0;
      }
    }
  }, {
    key: "update",
    value: function update(particle, delta) {
      if (this.angularVelocityFunc.type === 'value') {
        particle.rotation += delta * particle.angularVelocity;
      } else {
        particle.rotation += delta * this.angularVelocityFunc.genValue(particle.age / particle.life);
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        func: this.angularVelocityFunc.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new RotationOverLife(this.angularVelocityFunc);
    }
  }]);

  return RotationOverLife;
}();

var SizeOverLife = /*#__PURE__*/function () {
  function SizeOverLife(func) {
    _classCallCheck(this, SizeOverLife);

    this.func = func;

    _defineProperty(this, "type", 'SizeOverLife');
  }

  _createClass(SizeOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle) {
      particle.size = particle.startSize * this.func.genValue(particle.age / particle.life);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        func: this.func.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new SizeOverLife(this.func.clone());
    }
  }]);

  return SizeOverLife;
}();

var SpeedOverLife = /*#__PURE__*/function () {
  function SpeedOverLife(func) {
    _classCallCheck(this, SpeedOverLife);

    this.func = func;

    _defineProperty(this, "type", 'SpeedOverLife');
  }

  _createClass(SpeedOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle) {
      particle.velocity.normalize().multiplyScalar(particle.startSpeed * this.func.genValue(particle.age / particle.life));
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        func: this.func.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new SpeedOverLife(this.func.clone());
    }
  }]);

  return SpeedOverLife;
}();

var FrameOverLife = /*#__PURE__*/function () {
  function FrameOverLife(func) {
    _classCallCheck(this, FrameOverLife);

    this.func = func;

    _defineProperty(this, "type", 'FrameOverLife');
  }

  _createClass(FrameOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle, delta) {
      particle.uvTile = Math.floor(this.func.genValue(particle.age / particle.life));
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        func: this.func.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new FrameOverLife(this.func.clone());
    }
  }]);

  return FrameOverLife;
}();

new Vector3();
var OrbitOverLife = /*#__PURE__*/function () {
  function OrbitOverLife(angularVelocityFunc) {
    _classCallCheck(this, OrbitOverLife);

    this.angularVelocityFunc = angularVelocityFunc;

    _defineProperty(this, "type", 'OrbitOverLife');
  }

  _createClass(OrbitOverLife, [{
    key: "initialize",
    value: function initialize(particle) {
      if (this.angularVelocityFunc.type === 'value') {
        particle.angularVelocity = this.angularVelocityFunc.genValue();
      } else {
        particle.angularVelocity = 0;
      }
    }
  }, {
    key: "update",
    value: function update(particle, delta) {
      var rotation = Math.atan2(particle.position.y, particle.position.x);
      var len = Math.sqrt(particle.position.x * particle.position.x + particle.position.y * particle.position.y);
      rotation += this.angularVelocityFunc.genValue(particle.age / particle.life) * delta;
      particle.position.x = Math.cos(rotation) * len;
      particle.position.y = Math.sin(rotation) * len; //let v1x = particle.position.x
      //let v1y = particle.position.y;

      /*let v2x = particle.position.y;
      let v2y = -particle.position.x;
      v2x /= len;
      v2y /= len;
      particle.position.distanceTo(V3_ZERO) * this.angularVelocityFunc.genValue(particle.age / particle.life);*/
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        func: this.angularVelocityFunc.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new OrbitOverLife(this.angularVelocityFunc.clone());
    }
  }]);

  return OrbitOverLife;
}();

function BehaviorFromJSON(json) {
  switch (json.type) {
    case 'ColorOverLife':
      return new ColorOverLife(ColorGeneratorFromJSON(json.func));

    case 'RotationOverLife':
      return new RotationOverLife(ValueGeneratorFromJSON(json.func));

    case 'SizeOverLife':
      return new SizeOverLife(ValueGeneratorFromJSON(json.func));

    case 'SpeedOverLife':
      return new SpeedOverLife(ValueGeneratorFromJSON(json.func));

    case 'FrameOverLife':
      return new FrameOverLife(ValueGeneratorFromJSON(json.func));

    case 'OrbitOverLife':
      return new OrbitOverLife(ValueGeneratorFromJSON(json.func));

    default:
      return new ColorOverLife(new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 1)));
  }
}

var ConeEmitter = /*#__PURE__*/function () {
  // [0, Math.PI * 2]
  // [0, Math.PI / 2]
  function ConeEmitter() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ConeEmitter);

    _defineProperty(this, "radius", void 0);

    _defineProperty(this, "arc", void 0);

    _defineProperty(this, "thickness", void 0);

    _defineProperty(this, "angle", void 0);

    this.radius = parameters.radius || 10;
    this.arc = parameters.arc || 2.0 * Math.PI;
    this.thickness = parameters.thickness || 1;
    this.angle = parameters.angle || Math.PI / 6;
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
  }]);

  return ConeEmitter;
}();

var SphereEmitter = /*#__PURE__*/function () {
  //[0, 1]
  function SphereEmitter() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SphereEmitter);

    _defineProperty(this, "radius", void 0);

    _defineProperty(this, "arc", void 0);

    _defineProperty(this, "thickness", void 0);

    this.radius = parameters.radius || 10;
    this.arc = parameters.arc || 2.0 * Math.PI;
    this.thickness = parameters.thickness || 1;
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
  }]);

  return SphereEmitter;
}();

var PointEmitter = /*#__PURE__*/function () {
  function PointEmitter() {
    _classCallCheck(this, PointEmitter);
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
  }]);

  return PointEmitter;
}();

var DonutEmitter = /*#__PURE__*/function () {
  // [0, Math.PI * 2]
  // [0, Math.PI / 2]
  function DonutEmitter() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, DonutEmitter);

    _defineProperty(this, "radius", void 0);

    _defineProperty(this, "arc", void 0);

    _defineProperty(this, "thickness", void 0);

    _defineProperty(this, "angle", void 0);

    this.radius = parameters.radius || 10;
    this.arc = parameters.arc || 2.0 * Math.PI;
    this.thickness = parameters.thickness || 1;
    this.angle = parameters.angle || Math.PI / 6;
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
  }]);

  return DonutEmitter;
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

var RenderMode;

(function (RenderMode) {
  RenderMode[RenderMode["BillBoard"] = 0] = "BillBoard";
  RenderMode[RenderMode["StretchedBillBoard"] = 1] = "StretchedBillBoard";
  RenderMode[RenderMode["LocalSpace"] = 2] = "LocalSpace";
})(RenderMode || (RenderMode = {}));

var DEFAULT_MAX_PARTICLE = 1000;
var UP$1 = new Vector3(0, 0, 1);
var ParticleSystemBatch = /*#__PURE__*/function (_Mesh) {
  _inherits(ParticleSystemBatch, _Mesh);

  var _super = _createSuper(ParticleSystemBatch);

  function ParticleSystemBatch(settings) {
    var _this;

    _classCallCheck(this, ParticleSystemBatch);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "type", "ParticleSystemBatch");

    _defineProperty(_assertThisInitialized(_this), "systems", void 0);

    _defineProperty(_assertThisInitialized(_this), "geometry", void 0);

    _defineProperty(_assertThisInitialized(_this), "material", void 0);

    _defineProperty(_assertThisInitialized(_this), "offsetBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "rotationBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "sizeBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "colorBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "uvTileBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "velocityBuffer", void 0);

    _defineProperty(_assertThisInitialized(_this), "settings", void 0);

    _defineProperty(_assertThisInitialized(_this), "vector_", new Vector3());

    _defineProperty(_assertThisInitialized(_this), "quaternion_", new Quaternion());

    _defineProperty(_assertThisInitialized(_this), "quaternion2_", new Quaternion());

    _defineProperty(_assertThisInitialized(_this), "rotationMat_", new Matrix3());

    _this.systems = new Set();
    _this.geometry = new InstancedBufferGeometry();
    _this.settings = settings;

    _this.geometry.setIndex(_this.settings.instancingGeometry.getIndex());

    _this.geometry.setAttribute('position', _this.settings.instancingGeometry.getAttribute('position')); //new InterleavedBufferAttribute(this.interleavedBuffer, 3, 0, false));


    _this.geometry.setAttribute('uv', _this.settings.instancingGeometry.getAttribute('uv')); //new InterleavedBufferAttribute(this.interleavedBuffer, 2, 3, false));


    _this.offsetBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 3), 3);

    _this.offsetBuffer.setUsage(DynamicDrawUsage);

    _this.geometry.setAttribute('offset', _this.offsetBuffer);

    _this.colorBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 4), 4);

    _this.colorBuffer.setUsage(DynamicDrawUsage);

    _this.geometry.setAttribute('color', _this.colorBuffer);

    if (settings.renderMode === RenderMode.LocalSpace) {
      _this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 4), 4);
    } else {
      _this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE), 1);
    }

    _this.rotationBuffer.setUsage(DynamicDrawUsage);

    _this.geometry.setAttribute('rotation', _this.rotationBuffer);

    _this.sizeBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE), 1);

    _this.sizeBuffer.setUsage(DynamicDrawUsage);

    _this.geometry.setAttribute('size', _this.sizeBuffer);

    _this.uvTileBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE), 1);

    _this.uvTileBuffer.setUsage(DynamicDrawUsage);

    _this.geometry.setAttribute('uvTile', _this.uvTileBuffer);

    _this.rebuildMaterial(); // TODO: implement boundingVolume


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
          transparent: true,
          depthWrite: false,
          blending: this.settings.blending || AdditiveBlending,
          side: side
        });
      } else if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
        this.velocityBuffer = new InstancedBufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 3), 3);
        this.velocityBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('velocity', this.velocityBuffer);
        uniforms['speedFactor'] = new Uniform(1.0);
        this.material = new ShaderMaterial({
          uniforms: uniforms,
          defines: defines,
          vertexShader: stretched_bb_particle_vert,
          fragmentShader: particle_frag,
          transparent: true,
          depthWrite: false,
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
            particle.rotationQuat.setFromAxisAngle(UP$1, particle.rotation);

            if (system.worldSpace) {
              _this2.rotationBuffer.setXYZW(index, particle.rotationQuat.x, particle.rotationQuat.y, particle.rotationQuat.z, particle.rotationQuat.w);
            } else {
              _this2.quaternion_.copy(particle.rotationQuat).multiply(_this2.quaternion2_);

              _this2.rotationBuffer.setXYZW(index, _this2.quaternion_.x, _this2.quaternion_.y, _this2.quaternion_.z, _this2.quaternion_.w);
            }
          } else {
            _this2.rotationBuffer.setX(index, particle.rotation);
          }

          if (system.worldSpace) {
            _this2.offsetBuffer.setXYZ(index, particle.position.x, particle.position.y, particle.position.z);
          } else {
            _this2.vector_.copy(particle.position).applyMatrix4(system.emitter.matrixWorld);

            _this2.offsetBuffer.setXYZ(index, _this2.vector_.x, _this2.vector_.y, _this2.vector_.z);
          }

          _this2.colorBuffer.setXYZW(index, particle.color.x, particle.color.y, particle.color.z, particle.color.w);

          _this2.sizeBuffer.setX(index, particle.size);

          _this2.uvTileBuffer.setX(index, particle.uvTile);

          if (_this2.settings.renderMode === RenderMode.StretchedBillBoard) {
            if (system.worldSpace) {
              _this2.velocityBuffer.setXYZ(index, particle.velocity.x * system.speedFactor, particle.velocity.y * system.speedFactor, particle.velocity.z * system.speedFactor);
            } else {
              _this2.vector_.copy(particle.velocity).applyMatrix3(_this2.rotationMat_);

              _this2.velocityBuffer.setXYZ(index, _this2.vector_.x * system.speedFactor, _this2.vector_.y * system.speedFactor, _this2.vector_.z * system.speedFactor);
            }
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
        } else {
          this.rotationBuffer.updateRange.count = index;
        }

        this.rotationBuffer.needsUpdate = true;
      }
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.geometry.dispose();
    }
  }]);

  return ParticleSystemBatch;
}(Mesh);

var UP = new Vector3(0, 0, 1);
var DEFAULT_GEOMETRY = new PlaneBufferGeometry(1, 1, 1, 1);
var ParticleSystem = /*#__PURE__*/function () {
  function ParticleSystem(renderer, parameters) {
    var _parameters$duration, _parameters$maxPartic, _parameters$startLife, _parameters$startSpee, _parameters$startRota, _parameters$startSize, _parameters$startColo, _parameters$emissionO, _parameters$emissionO2, _parameters$emissionB, _parameters$shape, _parameters$behaviors, _parameters$worldSpac, _parameters$speedFact, _parameters$blending, _parameters$instancin, _parameters$renderMod, _parameters$renderOrd, _parameters$uTileCoun, _parameters$vTileCoun;

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

    _defineProperty(this, "emissionOverTime", void 0);

    _defineProperty(this, "emissionOverDistance", void 0);

    _defineProperty(this, "emissionBursts", void 0);

    _defineProperty(this, "worldSpace", void 0);

    _defineProperty(this, "speedFactor", void 0);

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

    _defineProperty(this, "rendererSettings", void 0);

    _defineProperty(this, "renderer", void 0);

    _defineProperty(this, "neededToUpdateRender", void 0);

    _defineProperty(this, "oldWorldMatrix", new Matrix4());

    _defineProperty(this, "normalMatrix", new Matrix3());

    _defineProperty(this, "firstTimeUpdate", true);

    this.renderer = renderer;
    this.autoDestroy = parameters.autoDestroy === undefined ? false : parameters.autoDestroy;
    this.duration = (_parameters$duration = parameters.duration) !== null && _parameters$duration !== void 0 ? _parameters$duration : 1;
    this.maxParticle = (_parameters$maxPartic = parameters.maxParticle) !== null && _parameters$maxPartic !== void 0 ? _parameters$maxPartic : 100;
    this.looping = parameters.looping === undefined ? true : parameters.looping;
    this.startLife = (_parameters$startLife = parameters.startLife) !== null && _parameters$startLife !== void 0 ? _parameters$startLife : new ConstantValue(5);
    this.startSpeed = (_parameters$startSpee = parameters.startSpeed) !== null && _parameters$startSpee !== void 0 ? _parameters$startSpee : new ConstantValue(0);
    this.startRotation = (_parameters$startRota = parameters.startRotation) !== null && _parameters$startRota !== void 0 ? _parameters$startRota : new ConstantValue(0);
    this.startSize = (_parameters$startSize = parameters.startSize) !== null && _parameters$startSize !== void 0 ? _parameters$startSize : new ConstantValue(1);
    this.startColor = (_parameters$startColo = parameters.startColor) !== null && _parameters$startColo !== void 0 ? _parameters$startColo : new ConstantColor(new Vector4(1, 1, 1, 1));
    this.emissionOverTime = (_parameters$emissionO = parameters.emissionOverTime) !== null && _parameters$emissionO !== void 0 ? _parameters$emissionO : new ConstantValue(10);
    this.emissionOverDistance = (_parameters$emissionO2 = parameters.emissionOverDistance) !== null && _parameters$emissionO2 !== void 0 ? _parameters$emissionO2 : new ConstantValue(0);
    this.emissionBursts = (_parameters$emissionB = parameters.emissionBursts) !== null && _parameters$emissionB !== void 0 ? _parameters$emissionB : [];
    this.emitterShape = (_parameters$shape = parameters.shape) !== null && _parameters$shape !== void 0 ? _parameters$shape : new SphereEmitter();
    this.behaviors = (_parameters$behaviors = parameters.behaviors) !== null && _parameters$behaviors !== void 0 ? _parameters$behaviors : new Array();
    this.worldSpace = (_parameters$worldSpac = parameters.worldSpace) !== null && _parameters$worldSpac !== void 0 ? _parameters$worldSpac : false;
    this.speedFactor = (_parameters$speedFact = parameters.speedFactor) !== null && _parameters$speedFact !== void 0 ? _parameters$speedFact : 0;
    this.rendererSettings = {
      blending: (_parameters$blending = parameters.blending) !== null && _parameters$blending !== void 0 ? _parameters$blending : NormalBlending,
      instancingGeometry: (_parameters$instancin = parameters.instancingGeometry) !== null && _parameters$instancin !== void 0 ? _parameters$instancin : DEFAULT_GEOMETRY,
      renderMode: (_parameters$renderMod = parameters.renderMode) !== null && _parameters$renderMod !== void 0 ? _parameters$renderMod : RenderMode.BillBoard,
      renderOrder: (_parameters$renderOrd = parameters.renderOrder) !== null && _parameters$renderOrd !== void 0 ? _parameters$renderOrd : 0,
      texture: parameters.texture,
      uTileCount: (_parameters$uTileCoun = parameters.uTileCount) !== null && _parameters$uTileCoun !== void 0 ? _parameters$uTileCoun : 1,
      vTileCount: (_parameters$vTileCoun = parameters.vTileCount) !== null && _parameters$vTileCoun !== void 0 ? _parameters$vTileCoun : 1
    };
    this.neededToUpdateRender = true;
    this.particles = new Array();
    this.startTileIndex = parameters.startTileIndex || 0;
    this.emitter = new ParticleEmitter(this);
    this.particleNum = 0;
    this.burstIndex = 0;
    this.burstWaveIndex = 0;
    this.time = 0;
    this.paused = false;
    this.waitEmiting = 0;
    this.emitEnded = false;
    this.markForDestroy = false;
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
    value: function spawn(count) {
      for (var i = 0; i < count && this.particleNum < this.maxParticle; i++) {
        this.particleNum++;

        while (this.particles.length < this.particleNum) {
          this.particles.push(new Particle());
        }

        var particle = this.particles[this.particleNum - 1];
        this.startColor.genColor(particle.startColor, this.time);
        particle.color.copy(particle.startColor);
        particle.startSpeed = this.startSpeed.genValue(this.time);
        particle.life = this.startLife.genValue(this.time);
        particle.age = 0;
        particle.rotation = this.startRotation.genValue(this.time);
        if (this.rendererSettings.renderMode === RenderMode.LocalSpace) particle.rotationQuat = new Quaternion().setFromAxisAngle(UP, particle.rotation);
        particle.startSize = particle.size = this.startSize.genValue(this.time);
        particle.uvTile = this.startTileIndex;
        this.emitterShape.initialize(particle);

        if (this.worldSpace) {
          particle.position.applyMatrix4(this.emitter.matrixWorld);
          particle.velocity.applyMatrix3(this.normalMatrix);
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
      this.burstIndex = 0;
      this.burstWaveIndex = 0;
      this.time = 0;
      this.waitEmiting = 0;
      this.emitEnded = false;
      this.markForDestroy = false;
    }
  }, {
    key: "update",
    value: function update(delta) {
      if (this.firstTimeUpdate) {
        this.renderer.addSystem(this);
        this.firstTimeUpdate = false;
      }

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

      if (this.neededToUpdateRender) {
        this.renderer.updateSystem(this);
        this.neededToUpdateRender = false;
      }

      this.normalMatrix.getNormalMatrix(this.emitter.matrixWorld); // particle die

      for (var i = 0; i < this.particleNum; i++) {
        var particle = this.particles[i];

        if (particle.age >= particle.life) {
          this.particles[i] = this.particles[this.particleNum - 1];
          this.particles[this.particleNum - 1] = particle;
          this.particleNum--;
          i--;
        }
      } // spawn


      if (!this.emitEnded) {
        var totalSpawn = Math.ceil(this.waitEmiting);
        this.spawn(totalSpawn);
        this.waitEmiting -= totalSpawn;
      } // spawn burst


      while (this.burstIndex < this.emissionBursts.length && this.emissionBursts[this.burstIndex].time <= this.time) {
        if (Math.random() < this.emissionBursts[this.burstIndex].probability) {
          var count = this.emissionBursts[this.burstIndex].count;
          this.spawn(count);
        }

        this.burstIndex++;
      }

      for (var _i = 0; _i < this.particleNum; _i++) {
        var _particle = this.particles[_i];

        for (var j = 0; j < this.behaviors.length; j++) {
          this.behaviors[j].update(_particle, delta);
        }

        _particle.position.addScaledVector(_particle.velocity, delta);

        _particle.age += delta;
      } //this.emitter.update();


      this.oldWorldMatrix.copy(this.emitter.matrixWorld);

      if (!this.emitEnded) {
        this.waitEmiting += delta * this.emissionOverTime.genValue(this.time / this.duration);
      }

      this.time += delta;
    }
  }, {
    key: "toJSON",
    value: function toJSON(meta) {
      this.texture.toJSON(meta);

      if (this.texture.image !== undefined) {
        var image = this.texture.image;
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
        instancingGeometry: this.rendererSettings.instancingGeometry.toJSON(),
        //Array.from(this.emitter.interleavedBuffer.array as Float32Array),
        renderOrder: this.renderOrder,
        renderMode: this.renderMode,
        speedFactor: this.renderMode === RenderMode.StretchedBillBoard ? this.speedFactor : 0,
        texture: this.texture.uuid,
        startTileIndex: this.startTileIndex,
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
        instancingGeometry: this.rendererSettings.instancingGeometry,
        //.interleavedBuffer.array,
        renderMode: this.renderMode,
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
    value: function fromJSON(json, textures, renderer) {
      var shape;

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

      return new ParticleSystem(renderer, {
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
        //instancingGeometry: json.instancingGeometry, //TODO: Support instancing Geometry in deserialization
        renderMode: json.renderMode,
        renderOrder: json.renderOrder,
        speedFactor: json.speedFactor,
        texture: textures[json.texture],
        startTileIndex: json.startTileIndex,
        uTileCount: json.uTileCount,
        vTileCount: json.vTileCount,
        blending: json.blending,
        behaviors: json.behaviors.map(function (behavior) {
          return BehaviorFromJSON(behavior);
        }),
        worldSpace: json.worldSpace
      });
    }
  }]);

  return ParticleSystem;
}();

var BatchedParticleRenderer = /*#__PURE__*/function (_Object3D) {
  _inherits(BatchedParticleRenderer, _Object3D);

  var _super = _createSuper(BatchedParticleRenderer);

  function BatchedParticleRenderer() {
    var _this;

    _classCallCheck(this, BatchedParticleRenderer);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "batches", []);

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
          return;
        }
      }

      var batch = new ParticleSystemBatch(settings);
      batch.addSystem(system);
      this.batches.push(batch);
      this.add(batch);
    }
  }, {
    key: "deleteSystem",
    value: function deleteSystem(system) {
      var settings = system.getRendererSettings();

      for (var i = 0; i < this.batches.length; i++) {
        if (BatchedParticleRenderer.equals(this.batches[i].settings, settings)) {
          this.batches[i].removeSystem(system);
          return;
        }
      }
    }
  }, {
    key: "updateSystem",
    value: function updateSystem(system) {}
  }, {
    key: "update",
    value: function update() {
      for (var i = 0; i < this.batches.length; i++) {
        this.batches[i].update();
      }
    }
  }], [{
    key: "equals",
    value: function equals(a, b) {
      return a.texture === b.texture && a.blending === b.blending && a.renderMode === b.renderMode && a.uTileCount === b.uTileCount && a.vTileCount === b.vTileCount && a.instancingGeometry === b.instancingGeometry && a.renderOrder === b.renderOrder;
    }
  }]);

  return BatchedParticleRenderer;
}(Object3D);

var TEXTURE_MAPPING = {
  UVMapping: UVMapping,
  CubeReflectionMapping: CubeReflectionMapping,
  CubeRefractionMapping: CubeRefractionMapping,
  EquirectangularReflectionMapping: EquirectangularReflectionMapping,
  EquirectangularRefractionMapping: EquirectangularRefractionMapping,
  //SphericalReflectionMapping: SphericalReflectionMapping,
  CubeUVReflectionMapping: CubeUVReflectionMapping,
  CubeUVRefractionMapping: CubeUVRefractionMapping
};
var TEXTURE_WRAPPING = {
  RepeatWrapping: RepeatWrapping,
  ClampToEdgeWrapping: ClampToEdgeWrapping,
  MirroredRepeatWrapping: MirroredRepeatWrapping
};
var TEXTURE_FILTER = {
  NearestFilter: NearestFilter,
  NearestMipmapNearestFilter: NearestMipMapNearestFilter,
  NearestMipmapLinearFilter: NearestMipMapLinearFilter,
  LinearFilter: LinearFilter,
  LinearMipmapNearestFilter: LinearMipMapNearestFilter,
  LinearMipmapLinearFilter: LinearMipMapLinearFilter
};
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
    key: "parseImages",
    value: function parseImages(json, onLoad) {
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
  }, {
    key: "parseObject",
    value: function parseObject(data, textures, renderer) {
      var object;

      switch (data.type) {
        case 'ParticleEmitter':
          object = ParticleSystem.fromJSON(data.ps, textures, renderer).emitter;
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
          object.add(this.parseObject(children[i], textures, renderer));
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
      var object = this.parseObject(json.object, textures, renderer);

      if (json.images === undefined || json.images.length === 0) {
        if (onLoad !== undefined) onLoad(object);
      }

      return object;
    }
  }]);

  return QuarksLoader;
}();

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

export { BatchedParticleRenderer, BehaviorFromJSON, Bezier, ColorGeneratorFromJSON, ColorOverLife, ColorRange, ConeEmitter, ConstantColor, ConstantValue, DonutEmitter, FrameOverLife, Gradient, IntervalValue, OrbitOverLife, Particle, ParticleEmitter, ParticleSystem, ParticleSystemBatch, PiecewiseBezier, PiecewiseFunction, PointEmitter, QuarksLoader, RandomColor, RenderMode, RotationOverLife, SizeOverLife, SpeedOverLife, SphereEmitter, ValueGeneratorFromJSON };
