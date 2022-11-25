/**
 * three.quarks v0.8.1 build Sun Nov 20 2022
 * https://github.com/Alchemist0823/three.quarks#readme
 * Copyright 2022 Alchemist0823 <the.forrest.sun@gmail.com>, MIT
 */
import { Object3D, Vector4, Vector3, MathUtils, Quaternion, Line3, Matrix4, Triangle, Mesh, PlaneGeometry, Matrix3, NormalBlending, InstancedBufferAttribute, DynamicDrawUsage, InstancedBufferGeometry, Uniform, Vector2, ShaderMaterial, AdditiveBlending, DoubleSide, FrontSide, BufferGeometry, BufferAttribute, Bone, Group, Sprite, Points, LineSegments, LineLoop, Line, LOD, InstancedMesh, SkinnedMesh, LightProbe, HemisphereLight, SpotLight, RectAreaLight, PointLight, DirectionalLight, AmbientLight, OrthographicCamera, PerspectiveCamera, Scene, Color, Fog, FogExp2, ObjectLoader } from './three.module.js';

function _regeneratorRuntime() {
  _regeneratorRuntime = function () {
    return exports;
  };
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == typeof value && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function (method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (undefined === method) {
      if (context.delegate = null, "throw" === context.method) {
        if (delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel;
        context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }
      return ContinueSentinel;
    }
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) keys.push(key);
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
    },
    stop: function () {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function (record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    catch: function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
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
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
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
function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }
  return object;
}
function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get.bind();
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }
      return desc.value;
    };
  }
  return _get.apply(this, arguments);
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
    // this.visible = false;
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
    value: function dispose() {}

    // extract data from the cache hash
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
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      // meta is a string when called from JSON.stringify
      var isRootObject = meta === undefined || typeof meta === 'string';
      var output = {};
      // meta is a hash used to collect geometries, materials.
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
      }

      // standard Object3D serialization
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
      if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;

      // object specific properties

      if (this.system !== null) object.ps = this.system.toJSON(meta, options);
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

var LinkedListNode = /*#__PURE__*/function () {
  function LinkedListNode(data) {
    _classCallCheck(this, LinkedListNode);
    _defineProperty(this, "data", void 0);
    _defineProperty(this, "next", void 0);
    _defineProperty(this, "prev", void 0);
    this.data = data;
    this.next = null;
    this.prev = null;
  }
  _createClass(LinkedListNode, [{
    key: "hasPrev",
    value: function hasPrev() {
      return this.prev !== null;
    }
  }, {
    key: "hasNext",
    value: function hasNext() {
      return this.next !== null;
    }
  }]);
  return LinkedListNode;
}();
var LinkedList = /*#__PURE__*/function () {
  function LinkedList() {
    _classCallCheck(this, LinkedList);
    _defineProperty(this, "length", void 0);
    _defineProperty(this, "head", void 0);
    _defineProperty(this, "tail", void 0);
    this.length = 0;
    this.head = this.tail = null;
  }
  _createClass(LinkedList, [{
    key: "isEmpty",
    value: function isEmpty() {
      return this.head === null;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.length = 0;
      this.head = this.tail = null;
    }
  }, {
    key: "front",
    value: function front() {
      if (this.head === null) return null;
      return this.head.data;
    }
  }, {
    key: "back",
    value: function back() {
      if (this.tail === null) return null;
      return this.tail.data;
    }

    /**
     * remove at head in O(1)
     */
  }, {
    key: "dequeue",
    value: function dequeue() {
      if (this.head) {
        var value = this.head.data;
        this.head = this.head.next;
        if (!this.head) {
          this.tail = null;
        } else {
          this.head.prev = null;
        }
        this.length--;
        return value;
      }
      return undefined;
    }

    /**
     * remove at tail in O(1)
     */
  }, {
    key: "pop",
    value: function pop() {
      if (this.tail) {
        var value = this.tail.data;
        this.tail = this.tail.prev;
        if (!this.tail) {
          this.head = null;
        } else {
          this.tail.next = null;
        }
        this.length--;
        return value;
      }
      return undefined;
    }

    /**
     * add at head in O(1)
     */
  }, {
    key: "queue",
    value: function queue(data) {
      var node = new LinkedListNode(data);
      if (!this.tail) {
        this.tail = node;
      }
      if (this.head) {
        this.head.prev = node;
        node.next = this.head;
      }
      this.head = node;
      this.length++;
    }

    /**
     * add at tail in O(1)
     */
  }, {
    key: "push",
    value: function push(data) {
      var node = new LinkedListNode(data);
      if (!this.head) {
        this.head = node;
      }
      if (this.tail) {
        this.tail.next = node;
        node.prev = this.tail;
      }
      this.tail = node;
      this.length++;
    }
  }, {
    key: "insertBefore",
    value: function insertBefore(node, data) {
      var newNode = new LinkedListNode(data);
      newNode.next = node;
      newNode.prev = node.prev;
      if (newNode.prev !== null) {
        newNode.prev.next = newNode;
      }
      newNode.next.prev = newNode;
      if (node == this.head) {
        this.head = newNode;
      }
      this.length++;
    }
  }, {
    key: "remove",
    value: function remove(data) {
      if (this.head === null || this.tail === null) {
        return;
      }
      var tempNode = this.head;
      if (data === this.head.data) {
        this.head = this.head.next;
      }
      if (data === this.tail.data) {
        this.tail = this.tail.prev;
      }
      while (tempNode.next !== null && tempNode.data !== data) {
        tempNode = tempNode.next;
      }
      if (tempNode.data === data) {
        if (tempNode.prev !== null) tempNode.prev.next = tempNode.next;
        if (tempNode.next !== null) tempNode.next.prev = tempNode.prev;
        this.length--;
      }
    }

    /**
     * Returns an iterator over the values
     */
  }, {
    key: "values",
    value:
    /*#__PURE__*/
    _regeneratorRuntime().mark(function values() {
      var current;
      return _regeneratorRuntime().wrap(function values$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              current = this.head;
            case 1:
              if (!(current !== null)) {
                _context2.next = 7;
                break;
              }
              _context2.next = 4;
              return current.data;
            case 4:
              current = current.next;
              _context2.next = 1;
              break;
            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, values, this);
    })
  }]);
  return LinkedList;
}();

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
    _defineProperty(this, "previous", new LinkedList());
    _defineProperty(this, "uvTile", 0);
  }
  _createClass(TrailParticle, [{
    key: "update",
    value: function update() {
      if (this.age <= this.life) {
        this.previous.push(new RecordState(this.position.clone(), this.size, this.color.clone()));
      } else {
        if (this.previous.length > 0) {
          this.previous.dequeue();
        }
      }
      while (this.previous.length > this.length) {
        this.previous.dequeue();
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
      this.previous.clear();
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
    key: "insertFunction",
    value: function insertFunction(t, func) {
      var index = this.findFunction(t);
      this.functions.splice(index + 1, 0, [func, t]);
    }
  }, {
    key: "removeFunction",
    value: function removeFunction(index) {
      return this.functions.splice(index, 1)[0][0];
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
    }

    // get the coefficients of the polynomial's derivatives
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
    }

    // calculate the slope
  }, {
    key: "getSlope",
    value: function getSlope(t) {
      var p = this.derivativeCoefficients(this.p)[0];
      var mt = 1 - t;
      var a = mt * mt;
      var b = mt * t * 2;
      var c = t * t;
      return a * p[0] + b * p[1] + c * p[2];
      //return  a * (p[1] - p[0]) * 3 + b * (p[2] - p[1]) * 3 + c * (p[3] - p[2]) * 3;
    }

    // derivative(0) = (p[1] - p[0]) * 3
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
      q[idx++] = p[3];

      // we lerp between all points at each iteration, until we have 1 point left.
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

var RandomQuatGenerator = /*#__PURE__*/function () {
  function RandomQuatGenerator() {
    _classCallCheck(this, RandomQuatGenerator);
    _defineProperty(this, "type", void 0);
    this.type = "rotation";
  }
  _createClass(RandomQuatGenerator, [{
    key: "genValue",
    value: function genValue(quat, t) {
      var x, y, z, u, v, w, s;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = x * x + y * y;
      } while (z > 1);
      do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        w = u * u + v * v;
      } while (w > 1);
      s = Math.sqrt((1 - z) / w);
      quat.set(x, y, s * u, s * v);
      return quat;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "RandomQuat"
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new RandomQuatGenerator();
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new RandomQuatGenerator();
    }
  }]);
  return RandomQuatGenerator;
}();

var AxisAngleGenerator = /*#__PURE__*/function () {
  function AxisAngleGenerator(axis, angle) {
    _classCallCheck(this, AxisAngleGenerator);
    this.axis = axis;
    this.angle = angle;
    _defineProperty(this, "type", void 0);
    this.type = "rotation";
  }
  _createClass(AxisAngleGenerator, [{
    key: "genValue",
    value: function genValue(quat, t) {
      return quat.setFromAxisAngle(this.axis, this.angle.genValue(t));
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: "AxisAngle",
        axis: {
          x: this.axis.x,
          y: this.axis.y,
          z: this.axis.z
        },
        angle: this.angle.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new AxisAngleGenerator(this.axis.clone(), this.angle.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new AxisAngleGenerator(json.axis, ValueGeneratorFromJSON(json.angle));
    }
  }]);
  return AxisAngleGenerator;
}();

function RotationGeneratorFromJSON(json) {
  switch (json.type) {
    case 'AxisAngle':
      return AxisAngleGenerator.fromJSON(json);
    case 'RandomQuat':
      return RandomQuatGenerator.fromJSON(json);
    default:
      return new RandomQuatGenerator();
  }
}

function GeneratorFromJSON(json) {
  switch (json.type) {
    case 'ConstantValue':
    case 'IntervalValue':
    case 'PiecewiseBezier':
      return ValueGeneratorFromJSON(json);
    case 'AxisAngle':
    case 'RandomQuat':
      return RotationGeneratorFromJSON(json);
    default:
      return new ConstantValue(0);
  }
}

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
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
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
  function RotationOverLife(angularVelocity, dynamic) {
    _classCallCheck(this, RotationOverLife);
    this.angularVelocity = angularVelocity;
    this.dynamic = dynamic;
    _defineProperty(this, "type", 'RotationOverLife');
    _defineProperty(this, "tempQuat", new Quaternion());
  }
  _createClass(RotationOverLife, [{
    key: "initialize",
    value: function initialize(particle) {
      if (!this.dynamic && particle instanceof SpriteParticle) {
        particle.angularVelocity = this.angularVelocity.genValue();
      }
    }
  }, {
    key: "update",
    value: function update(particle, delta) {
      if (!this.dynamic) {
        if (particle instanceof SpriteParticle) {
          particle.rotation += delta * particle.angularVelocity;
        }
      } else {
        particle.rotation += delta * this.angularVelocity.genValue(particle.age / particle.life);
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        angularVelocity: this.angularVelocity.toJSON(),
        dynamic: this.dynamic
      };
    }
  }, {
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
  }, {
    key: "clone",
    value: function clone() {
      return new RotationOverLife(this.angularVelocity.clone(), this.dynamic);
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new RotationOverLife(ValueGeneratorFromJSON(json.angularVelocity), json.dynamic);
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
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
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
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
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
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
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
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
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
  function ApplyForce(direction, magnitude) {
    _classCallCheck(this, ApplyForce);
    this.direction = direction;
    this.magnitude = magnitude;
    _defineProperty(this, "type", 'ApplyForce');
    _defineProperty(this, "magnitudeValue", void 0);
    this.magnitudeValue = this.magnitude.genValue();
  }
  _createClass(ApplyForce, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle, delta) {
      particle.velocity.addScaledVector(this.direction, this.magnitudeValue * delta);
    }
  }, {
    key: "frameUpdate",
    value: function frameUpdate(delta) {
      this.magnitudeValue = this.magnitude.genValue();
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        direction: [this.direction.x, this.direction.y, this.direction.z],
        magnitude: this.magnitude.toJSON()
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ApplyForce(this.direction.clone(), this.magnitude.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      var _json$magnitude;
      return new ApplyForce(new Vector3(json.direction[0], json.direction[1], json.direction[2]), ValueGeneratorFromJSON((_json$magnitude = json.magnitude) !== null && _json$magnitude !== void 0 ? _json$magnitude : json.force));
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
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
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
        var iter = particle.previous.values();
        for (var i = 0; i < particle.previous.length; i++) {
          var cur = iter.next();
          cur.value.size = this.width.genValue((particle.previous.length - i) / particle.length);
        }
      }
    }
  }, {
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
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
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
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
    if (this.subParticleSystem && this.subParticleSystem.system) {
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
        m.compose(particle.position, rotation, VECTOR_ONE);
      }
      if (!this.particleSystem.worldSpace) {
        m.multiplyMatrices(this.particleSystem.emitter.matrixWorld, m);
      }
      this.subParticleSystem.system.emit(delta, particle.emissionState, m);
    }
  }, {
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
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
      return new EmitSubParticleSystem(particleSystem, json.useVelocityAsBasis, json.subParticleSystem);
    }
  }]);
  return EmitSubParticleSystem;
}();

/*
 * A fast javascript implementation of simplex noise by Jonas Wagner
Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.
 Copyright (c) 2021 Jonas Wagner
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
var F3 = 1.0 / 3.0;
var G3 = 1.0 / 6.0;
var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;
var grad3 = new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]);
var grad4 = new Float32Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1, -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1, 1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1, -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]);

/**
 * A random() function, must return a numer in the interval [0,1), just like Math.random().
 */

/** Deterministic simplex noise generator suitable for 2D, 3D and 4D spaces. */
var SimplexNoise = /*#__PURE__*/function () {
  /**
   * Creates a new `SimplexNoise` instance.
   * This involves some setup. You can save a few cpu cycles by reusing the same instance.
   * @param randomOrSeed A random number generator or a seed (string|number).
   * Defaults to Math.random (random irreproducible initialization).
   */
  function SimplexNoise() {
    var randomOrSeed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Math.random;
    _classCallCheck(this, SimplexNoise);
    _defineProperty(this, "p", void 0);
    _defineProperty(this, "perm", void 0);
    _defineProperty(this, "permMod12", void 0);
    var random = typeof randomOrSeed == 'function' ? randomOrSeed : alea(randomOrSeed);
    this.p = buildPermutationTable(random);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  /**
   * Samples the noise field in 2 dimensions
   * @param x
   * @param y
   * @returns a number in the interval [-1, 1]
   */
  _createClass(SimplexNoise, [{
    key: "noise2D",
    value: function noise2D(x, y) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var n0 = 0; // Noise contributions from the three corners
      var n1 = 0;
      var n2 = 0;
      // Skew the input space to determine which simplex cell we're in
      var s = (x + y) * F2; // Hairy factor for 2D
      var i = Math.floor(x + s);
      var j = Math.floor(y + s);
      var t = (i + j) * G2;
      var X0 = i - t; // Unskew the cell origin back to (x,y) space
      var Y0 = j - t;
      var x0 = x - X0; // The x,y distances from the cell origin
      var y0 = y - Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      else {
        i1 = 0;
        j1 = 1;
      } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1.0 + 2.0 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = i & 255;
      var jj = j & 255;
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        var gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
      }

      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70.0 * (n0 + n1 + n2);
    }

    /**
     * Samples the noise field in 3 dimensions
     * @param x
     * @param y
     * @param z
     * @returns a number in the interval [-1, 1]
     */
  }, {
    key: "noise3D",
    value: function noise3D(x, y, z) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var n0, n1, n2, n3; // Noise contributions from the four corners
      // Skew the input space to determine which simplex cell we're in
      var s = (x + y + z) * F3; // Very nice and simple skew factor for 3D
      var i = Math.floor(x + s);
      var j = Math.floor(y + s);
      var k = Math.floor(z + s);
      var t = (i + j + k) * G3;
      var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
      var Y0 = j - t;
      var Z0 = k - t;
      var x0 = x - X0; // The x,y,z distances from the cell origin
      var y0 = y - Y0;
      var z0 = z - Z0;
      // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
      // Determine which simplex we are in.
      var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
      var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
      if (x0 >= y0) {
        if (y0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // X Y Z order
        else if (x0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // X Z Y order
        else {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // Z X Y order
      } else {
        // x0<y0
        if (y0 < z0) {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Z Y X order
        else if (x0 < z0) {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Y Z X order
        else {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // Y X Z order
      }
      // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
      // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
      // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
      // c = 1/6.
      var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
      var y1 = y0 - j1 + G3;
      var z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
      var y2 = y0 - j2 + 2.0 * G3;
      var z2 = z0 - k2 + 2.0 * G3;
      var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
      var y3 = y0 - 1.0 + 3.0 * G3;
      var z3 = z0 - 1.0 + 3.0 * G3;
      // Work out the hashed gradient indices of the four simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      // Calculate the contribution from the four corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) n0 = 0.0;else {
        var gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) n1 = 0.0;else {
        var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) n2 = 0.0;else {
        var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) n3 = 0.0;else {
        var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
        t3 *= t3;
        n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to stay just inside [-1,1]
      return 32.0 * (n0 + n1 + n2 + n3);
    }

    /**
     * Samples the noise field in 4 dimensions
     * @param x
     * @param y
     * @param z
     * @returns a number in the interval [-1, 1]
     */
  }, {
    key: "noise4D",
    value: function noise4D(x, y, z, w) {
      var perm = this.perm;
      var n0, n1, n2, n3, n4; // Noise contributions from the five corners
      // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
      var s = (x + y + z + w) * F4; // Factor for 4D skewing
      var i = Math.floor(x + s);
      var j = Math.floor(y + s);
      var k = Math.floor(z + s);
      var l = Math.floor(w + s);
      var t = (i + j + k + l) * G4; // Factor for 4D unskewing
      var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
      var Y0 = j - t;
      var Z0 = k - t;
      var W0 = l - t;
      var x0 = x - X0; // The x,y,z,w distances from the cell origin
      var y0 = y - Y0;
      var z0 = z - Z0;
      var w0 = w - W0;
      // For the 4D case, the simplex is a 4D shape I won't even try to describe.
      // To find out which of the 24 possible simplices we're in, we need to
      // determine the magnitude ordering of x0, y0, z0 and w0.
      // Six pair-wise comparisons are performed between each possible pair
      // of the four coordinates, and the results are used to rank the numbers.
      var rankx = 0;
      var ranky = 0;
      var rankz = 0;
      var rankw = 0;
      if (x0 > y0) rankx++;else ranky++;
      if (x0 > z0) rankx++;else rankz++;
      if (x0 > w0) rankx++;else rankw++;
      if (y0 > z0) ranky++;else rankz++;
      if (y0 > w0) ranky++;else rankw++;
      if (z0 > w0) rankz++;else rankw++;
      // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
      // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
      // impossible. Only the 24 indices which have non-zero entries make any sense.
      // We use a thresholding to set the coordinates in turn from the largest magnitude.
      // Rank 3 denotes the largest coordinate.
      // Rank 2 denotes the second largest coordinate.
      // Rank 1 denotes the second smallest coordinate.

      // The integer offsets for the second simplex corner
      var i1 = rankx >= 3 ? 1 : 0;
      var j1 = ranky >= 3 ? 1 : 0;
      var k1 = rankz >= 3 ? 1 : 0;
      var l1 = rankw >= 3 ? 1 : 0;
      // The integer offsets for the third simplex corner
      var i2 = rankx >= 2 ? 1 : 0;
      var j2 = ranky >= 2 ? 1 : 0;
      var k2 = rankz >= 2 ? 1 : 0;
      var l2 = rankw >= 2 ? 1 : 0;

      // The integer offsets for the fourth simplex corner
      var i3 = rankx >= 1 ? 1 : 0;
      var j3 = ranky >= 1 ? 1 : 0;
      var k3 = rankz >= 1 ? 1 : 0;
      var l3 = rankw >= 1 ? 1 : 0;
      // The fifth corner has all coordinate offsets = 1, so no need to compute that.
      var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
      var y1 = y0 - j1 + G4;
      var z1 = z0 - k1 + G4;
      var w1 = w0 - l1 + G4;
      var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
      var y2 = y0 - j2 + 2.0 * G4;
      var z2 = z0 - k2 + 2.0 * G4;
      var w2 = w0 - l2 + 2.0 * G4;
      var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
      var y3 = y0 - j3 + 3.0 * G4;
      var z3 = z0 - k3 + 3.0 * G4;
      var w3 = w0 - l3 + 3.0 * G4;
      var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
      var y4 = y0 - 1.0 + 4.0 * G4;
      var z4 = z0 - 1.0 + 4.0 * G4;
      var w4 = w0 - 1.0 + 4.0 * G4;
      // Work out the hashed gradient indices of the five simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      var ll = l & 255;
      // Calculate the contribution from the five corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
      if (t0 < 0) n0 = 0.0;else {
        var gi0 = perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32 * 4;
        t0 *= t0;
        n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
      if (t1 < 0) n1 = 0.0;else {
        var gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32 * 4;
        t1 *= t1;
        n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
      if (t2 < 0) n2 = 0.0;else {
        var gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32 * 4;
        t2 *= t2;
        n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
      if (t3 < 0) n3 = 0.0;else {
        var gi3 = perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32 * 4;
        t3 *= t3;
        n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
      }
      var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
      if (t4 < 0) n4 = 0.0;else {
        var gi4 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32 * 4;
        t4 *= t4;
        n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
      }
      // Sum up and scale the result to cover the range [-1,1]
      return 27.0 * (n0 + n1 + n2 + n3 + n4);
    }
  }]);
  return SimplexNoise;
}();

/**
 * Builds a random permutation table.
 * This is exported only for (internal) testing purposes.
 * Do not rely on this export.
 * @private
 */
function buildPermutationTable(random) {
  var p = new Uint8Array(256);
  for (var i = 0; i < 256; i++) {
    p[i] = i;
  }
  for (var _i = 0; _i < 255; _i++) {
    var r = _i + ~~(random() * (256 - _i));
    var aux = p[_i];
    p[_i] = p[r];
    p[r] = aux;
  }
  return p;
}

/*
The ALEA PRNG and masher code used by simplex-noise.js
is based on code by Johannes Baagøe, modified by Jonas Wagner.
See alea.md for the full license.
*/
function alea(seed) {
  var s0 = 0;
  var s1 = 0;
  var s2 = 0;
  var c = 1;
  var mash = masher();
  s0 = mash(' ');
  s1 = mash(' ');
  s2 = mash(' ');
  s0 -= mash(seed);
  if (s0 < 0) {
    s0 += 1;
  }
  s1 -= mash(seed);
  if (s1 < 0) {
    s1 += 1;
  }
  s2 -= mash(seed);
  if (s2 < 0) {
    s2 += 1;
  }
  return function () {
    var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
    s0 = s1;
    s1 = s2;
    return s2 = t - (c = t | 0);
  };
}
function masher() {
  var n = 0xefc8249d;
  return function (data) {
    data = data.toString();
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }

    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };
}

var TurbulenceField = /*#__PURE__*/function () {
  function TurbulenceField(scale, octaves, velocityMultiplier, timeScale) {
    _classCallCheck(this, TurbulenceField);
    this.scale = scale;
    this.octaves = octaves;
    this.velocityMultiplier = velocityMultiplier;
    this.timeScale = timeScale;
    _defineProperty(this, "type", 'TurbulenceField');
    _defineProperty(this, "generator", new SimplexNoise());
    _defineProperty(this, "timeOffset", new Vector3());
    _defineProperty(this, "temp", new Vector3());
    _defineProperty(this, "temp2", new Vector3());
    this.timeOffset.x = Math.random() / this.scale.x * this.timeScale.x;
    this.timeOffset.y = Math.random() / this.scale.y * this.timeScale.y;
    this.timeOffset.z = Math.random() / this.scale.z * this.timeScale.z;
  }
  _createClass(TurbulenceField, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle, delta) {
      var x = particle.position.x / this.scale.x;
      var y = particle.position.y / this.scale.y;
      var z = particle.position.z / this.scale.z;
      this.temp.set(0, 0, 0);
      var lvl = 1;
      for (var i = 0; i < this.octaves; i++) {
        this.temp2.set(this.generator.noise4D(x * lvl, y * lvl, z * lvl, this.timeOffset.x * lvl) / lvl, this.generator.noise4D(x * lvl, y * lvl, z * lvl, this.timeOffset.y * lvl) / lvl, this.generator.noise4D(x * lvl, y * lvl, z * lvl, this.timeOffset.z * lvl) / lvl);
        this.temp.add(this.temp2);
        lvl *= 2;
      }
      this.temp.multiply(this.velocityMultiplier);
      particle.velocity.addScaledVector(this.temp, delta);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        scale: [this.scale.x, this.scale.y, this.scale.z],
        octaves: this.octaves,
        velocityMultiplier: [this.velocityMultiplier.x, this.velocityMultiplier.y, this.velocityMultiplier.z],
        timeScale: [this.timeScale.x, this.timeScale.y, this.timeScale.z]
      };
    }
  }, {
    key: "frameUpdate",
    value: function frameUpdate(delta) {
      this.timeOffset.x += delta * this.timeScale.x;
      this.timeOffset.y += delta * this.timeScale.y;
      this.timeOffset.z += delta * this.timeScale.z;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new TurbulenceField(this.scale.clone(), this.octaves, this.velocityMultiplier.clone(), this.timeScale.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new TurbulenceField(new Vector3(json.scale[0], json.scale[1], json.scale[2]), json.octaves, new Vector3(json.velocityMultiplier[0], json.velocityMultiplier[1], json.velocityMultiplier[2]), new Vector3(json.timeScale[0], json.timeScale[1], json.timeScale[2]));
    }
  }]);
  return TurbulenceField;
}();

var IdentityQuaternion = new Quaternion();
var Rotation3DOverLife = /*#__PURE__*/function () {
  function Rotation3DOverLife(angularVelocity, dynamic) {
    _classCallCheck(this, Rotation3DOverLife);
    this.angularVelocity = angularVelocity;
    this.dynamic = dynamic;
    _defineProperty(this, "type", 'Rotation3DOverLife');
    _defineProperty(this, "tempQuat", new Quaternion());
  }
  _createClass(Rotation3DOverLife, [{
    key: "initialize",
    value: function initialize(particle) {
      if (!this.dynamic && particle instanceof SpriteParticle) {
        particle.angularVelocity = new Quaternion();
        this.angularVelocity.genValue(particle.angularVelocity);
      }
    }
  }, {
    key: "update",
    value: function update(particle, delta) {
      if (!this.dynamic) {
        if (particle instanceof SpriteParticle) {
          this.tempQuat.slerpQuaternions(IdentityQuaternion, particle.angularVelocity, delta);
          particle.rotation.multiply(this.tempQuat);
        }
      } else {
        this.angularVelocity.genValue(this.tempQuat, particle.age / particle.life);
        this.tempQuat.slerpQuaternions(IdentityQuaternion, this.tempQuat, delta);
        particle.rotation.multiply(this.tempQuat);
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        angularVelocity: this.angularVelocity.toJSON(),
        dynamic: this.dynamic
      };
    }
  }, {
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
  }, {
    key: "clone",
    value: function clone() {
      return new Rotation3DOverLife(this.angularVelocity.clone(), this.dynamic);
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new Rotation3DOverLife(RotationGeneratorFromJSON(json.angularVelocity), json.dynamic);
    }
  }]);
  return Rotation3DOverLife;
}();

var ForceOverLife = /*#__PURE__*/function () {
  function ForceOverLife(x, y, z) {
    _classCallCheck(this, ForceOverLife);
    this.x = x;
    this.y = y;
    this.z = z;
    _defineProperty(this, "type", 'ForceOverLife');
    _defineProperty(this, "_temp", new Vector3());
  }
  _createClass(ForceOverLife, [{
    key: "initialize",
    value: function initialize(particle) {}
  }, {
    key: "update",
    value: function update(particle) {
      this._temp.set(this.x.genValue(particle.age / particle.life), this.y.genValue(particle.age / particle.life), this.z.genValue(particle.age / particle.life));
      particle.velocity.add(this._temp);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        x: this.x.toJSON(),
        y: this.y.toJSON(),
        z: this.z.toJSON()
      };
    }
  }, {
    key: "frameUpdate",
    value: function frameUpdate(delta) {}
  }, {
    key: "clone",
    value: function clone() {
      return new ForceOverLife(this.x.clone(), this.y.clone(), this.z.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new ForceOverLife(ValueGeneratorFromJSON(json.x), ValueGeneratorFromJSON(json.y), ValueGeneratorFromJSON(json.z));
    }
  }]);
  return ForceOverLife;
}();

var Noise = /*#__PURE__*/function () {
  function Noise(frequency, power) {
    _classCallCheck(this, Noise);
    this.frequency = frequency;
    this.power = power;
    _defineProperty(this, "type", 'Noise');
    _defineProperty(this, "generator", new SimplexNoise());
    _defineProperty(this, "duration", 0);
    _defineProperty(this, "temp", new Vector3());
  }
  _createClass(Noise, [{
    key: "initialize",
    value: function initialize(particle) {
      particle.startTime = this.duration;
    }
  }, {
    key: "update",
    value: function update(particle, delta) {
      this.temp.set(this.generator.noise2D(particle.startTime * this.frequency.x, particle.life / particle.age * this.frequency.x), this.generator.noise2D(particle.startTime * this.frequency.y + 100.25, particle.life / particle.age * this.frequency.y + 100.154), this.generator.noise2D(particle.startTime * this.frequency.z + 200.89, particle.life / particle.age * this.frequency.z + 200.1)).multiply(this.power);
      particle.position.addScaledVector(this.temp, delta);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: this.type,
        frequency: [this.frequency.x, this.frequency.y, this.frequency.z],
        power: [this.power.x, this.power.y, this.power.z]
      };
    }
  }, {
    key: "frameUpdate",
    value: function frameUpdate(delta) {
      this.duration += delta;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Noise(this.frequency.clone(), this.power.clone());
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      return new Noise(new Vector3(json.frequency[0], json.frequency[1], json.frequency[2]), new Vector3(json.power[0], json.power[1], json.power[2]));
    }
  }]);
  return Noise;
}();

var BehaviorTypes = {
  "ApplyForce": {
    type: "ApplyForce",
    constructor: ApplyForce,
    params: [["direction", "vec3"], ["magnitude", "value"]],
    loadJSON: ApplyForce.fromJSON
  },
  "Noise": {
    type: "Noise",
    constructor: Noise,
    params: [["frequency", "vec3"], ["power", "vec3"]],
    loadJSON: Noise.fromJSON
  },
  "TurbulenceField": {
    type: "TurbulenceField",
    constructor: TurbulenceField,
    params: [["scale", "vec3"], ["octaves", "number"], ["velocityMultiplier", "vec3"], ["timeScale", "vec3"]],
    loadJSON: TurbulenceField.fromJSON
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
    params: [["angularVelocity", "valueFunc"], ["dynamic", "boolean"]],
    loadJSON: RotationOverLife.fromJSON
  },
  "Rotation3DOverLife": {
    type: "Rotation3DOverLife",
    constructor: Rotation3DOverLife,
    params: [["angularVelocity", "rotationFunc"], ["dynamic", "boolean"]],
    loadJSON: Rotation3DOverLife.fromJSON
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
  "ForceOverLife": {
    type: "ForceOverLife",
    constructor: ForceOverLife,
    params: [["x", "valueFunc"], ["y", "valueFunc"], ["z", "valueFunc"]],
    loadJSON: ForceOverLife.fromJSON
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
      p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed);
      //const v = Math.random();
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
      p.velocity.set(0, 0, Math.cos(angle)).addScaledVector(p.position, Math.sin(angle)).multiplyScalar(p.startSpeed);
      //const v = Math.random();
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
      if (typeof mesh === "string") return;
      // optimization
      /*if (mesh.userData.triangleIndexToArea) {
          this._triangleIndexToArea = mesh.userData.triangleIndexToArea;
          return;
      }*/
      var tri = new Triangle();
      this._triangleIndexToArea.length = 0;
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
      }

      //const area = this._triangleIndexToArea[left + 1] - this._triangleIndexToArea[left];
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

      // velocity based on tri normal
      this._tempA.copy(this._tempB).cross(this._tempC).normalize();
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
      return new MeshSurfaceEmitter(json.mesh);
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
  RenderMode[RenderMode["Mesh"] = 2] = "Mesh";
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
    _defineProperty(_assertThisInitialized(_this), "maxParticles", void 0);
    _this.maxParticles = 1000;
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
var tempQ = new Quaternion();
var DEFAULT_GEOMETRY = new PlaneGeometry(1, 1, 1, 1);
var ParticleSystem = /*#__PURE__*/function () {
  function ParticleSystem(renderer, parameters) {
    var _parameters$duration, _parameters$startLife, _parameters$startSpee, _parameters$startRota, _parameters$startSize, _parameters$startColo, _parameters$emissionO, _parameters$emissionO2, _parameters$emissionB, _parameters$onlyUsedB, _parameters$shape, _parameters$behaviors, _parameters$worldSpac, _parameters$speedFact, _parameters$rendererE, _parameters$blending, _parameters$transpare, _parameters$instancin, _parameters$renderMod, _parameters$renderOrd, _parameters$uTileCoun, _parameters$vTileCoun;
    _classCallCheck(this, ParticleSystem);
    _defineProperty(this, "autoDestroy", void 0);
    _defineProperty(this, "looping", void 0);
    _defineProperty(this, "duration", void 0);
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
    _defineProperty(this, "previousWorldPos", void 0);
    _defineProperty(this, "temp", new Vector3());
    _defineProperty(this, "travelDistance", 0);
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
    this.looping = parameters.looping === undefined ? true : parameters.looping;
    this.startLife = (_parameters$startLife = parameters.startLife) !== null && _parameters$startLife !== void 0 ? _parameters$startLife : new ConstantValue(5);
    this.startSpeed = (_parameters$startSpee = parameters.startSpeed) !== null && _parameters$startSpee !== void 0 ? _parameters$startSpee : new ConstantValue(0);
    this.startRotation = (_parameters$startRota = parameters.startRotation) !== null && _parameters$startRota !== void 0 ? _parameters$startRota : new ConstantValue(0);
    this.startSize = (_parameters$startSize = parameters.startSize) !== null && _parameters$startSize !== void 0 ? _parameters$startSize : new ConstantValue(1);
    this.startColor = (_parameters$startColo = parameters.startColor) !== null && _parameters$startColo !== void 0 ? _parameters$startColo : new ConstantColor(new Vector4(1, 1, 1, 1));
    //this.startLength = parameters.startLength ?? new ConstantValue(30);
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
    key: "time",
    get: function get() {
      return this.emissionState.time;
    },
    set:
    // parameters

    // runtime data

    function set(time) {
      this.emissionState.time = time;
    }
  }, {
    key: "texture",
    get: function get() {
      return this.rendererSettings.texture;
    },
    set: function set(texture) {
      this.rendererSettings.texture = texture;
      this.neededToUpdateRender = true;
      //this.emitter.material.uniforms.map.value = texture;
    }
  }, {
    key: "uTileCount",
    get: function get() {
      return this.rendererSettings.uTileCount;
    },
    set: function set(u) {
      this.rendererSettings.uTileCount = u;
      this.neededToUpdateRender = true;
      //this.emitter.material.uniforms.tileCount.value.x = u;
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
    key: "instancingGeometry",
    get: function get() {
      return this.rendererSettings.instancingGeometry;
    },
    set: function set(geometry) {
      this.restart();
      this.particles.length = 0;
      this.rendererSettings.instancingGeometry = geometry;
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
          case RenderMode.Mesh:
            this.rendererEmitterSettings = {
              geometry: new PlaneGeometry(1, 1)
            };
            this.startRotation = new AxisAngleGenerator(new Vector3(0, 1, 0), new ConstantValue(0));
            break;
          case RenderMode.BillBoard:
          case RenderMode.StretchedBillBoard:
            this.rendererEmitterSettings = {};
            if (this.rendererSettings.renderMode === RenderMode.Mesh) {
              this.startRotation = new ConstantValue(0);
            }
            break;
        }
      }
      this.rendererSettings.renderMode = renderMode;
      this.neededToUpdateRender = true;
      //this.emitter.rebuildMaterial();
    }
  }, {
    key: "renderOrder",
    get: function get() {
      return this.rendererSettings.renderOrder;
    },
    set: function set(renderOrder) {
      this.rendererSettings.renderOrder = renderOrder;
      this.neededToUpdateRender = true;
      //this.emitter.rebuildMaterial();
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
      tempQ.setFromRotationMatrix(matrix);
      for (var i = 0; i < count; i++) {
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
        particle.startSpeed = this.startSpeed.genValue(emissionState.time / this.duration);
        particle.life = this.startLife.genValue(emissionState.time / this.duration);
        particle.age = 0;
        particle.startSize = this.startSize.genValue(emissionState.time / this.duration);
        particle.uvTile = Math.floor(this.startTileIndex.genValue());
        particle.size = particle.startSize;
        if (this.rendererSettings.renderMode === RenderMode.Mesh || this.rendererSettings.renderMode === RenderMode.BillBoard || this.rendererSettings.renderMode === RenderMode.StretchedBillBoard) {
          var sprite = particle;
          if (this.rendererSettings.renderMode === RenderMode.Mesh) {
            if (!(sprite.rotation instanceof Quaternion)) {
              sprite.rotation = new Quaternion();
            }
            if (this.startRotation.type === "rotation") {
              this.startRotation.genValue(sprite.rotation, emissionState.time / this.duration);
            } else {
              sprite.rotation.setFromAxisAngle(UP, this.startRotation.genValue(emissionState.time / this.duration));
            }
          } else {
            if (this.startRotation.type === "rotation") {
              sprite.rotation = 0;
            } else {
              sprite.rotation = this.startRotation.genValue(emissionState.time / this.duration);
            }
          }
        } else if (this.rendererSettings.renderMode === RenderMode.Trail) {
          var trail = particle;
          trail.length = this.rendererEmitterSettings.startLength.genValue(emissionState.time / this.duration);
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
          if (particle.rotation && particle.rotation instanceof Quaternion) {
            particle.rotation.multiplyQuaternions(tempQ, particle.rotation);
          }
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
    }

    //firstTimeUpdate = true;
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
      }

      // simulate
      for (var j = 0; j < this.behaviors.length; j++) {
        for (var i = 0; i < this.particleNum; i++) {
          if (!this.particles[i].died) {
            this.behaviors[j].update(this.particles[i], delta);
          }
        }
        this.behaviors[j].frameUpdate(delta);
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
          particle.update();
        }
      }

      // particle die
      for (var _i3 = 0; _i3 < this.particleNum; _i3++) {
        var _particle = this.particles[_i3];
        if (_particle.died && (!(_particle instanceof TrailParticle) || _particle.previous.length === 0)) {
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
      this.normalMatrix.getNormalMatrix(emitterMatrix);

      // spawn
      var totalSpawn = Math.ceil(emissionState.waitEmiting);
      this.spawn(totalSpawn, emissionState, emitterMatrix);
      emissionState.waitEmiting -= totalSpawn;

      // spawn burst
      while (emissionState.burstIndex < this.emissionBursts.length && this.emissionBursts[emissionState.burstIndex].time <= emissionState.time) {
        if (Math.random() < this.emissionBursts[emissionState.burstIndex].probability) {
          var count = this.emissionBursts[emissionState.burstIndex].count;
          this.spawn(count, emissionState, emitterMatrix);
        }
        emissionState.burstIndex++;
      }
      if (!this.emitEnded) {
        emissionState.waitEmiting += delta * this.emissionOverTime.genValue(emissionState.time / this.duration);
        if (this.previousWorldPos != undefined) {
          this.emitter.getWorldPosition(this.temp);
          this.travelDistance += this.previousWorldPos.distanceTo(this.temp);
          var emitPerMeter = this.emissionOverDistance.genValue(emissionState.time / this.duration);
          if (this.travelDistance * emitPerMeter > 0) {
            var _count = Math.floor(this.travelDistance * emitPerMeter);
            this.travelDistance -= _count / emitPerMeter;
            emissionState.waitEmiting += _count;
          }
        }
      }
      if (this.previousWorldPos === undefined) this.previousWorldPos = new Vector3();
      this.emitter.getWorldPosition(this.previousWorldPos);
      emissionState.time += delta;
    }
  }, {
    key: "toJSON",
    value: function toJSON(meta) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
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
      this.texture.toJSON(meta);
      if (options.useUrlForImage) {
        if (this.texture.source !== undefined) {
          var image = this.texture.source;
          meta.images[image.uuid] = {
            uuid: image.uuid,
            url: this.texture.image.url
          };
        }
      }
      // TODO: support URL
      var rendererSettingsJSON;
      if (this.renderMode === RenderMode.Trail) {
        rendererSettingsJSON = {
          startLength: this.rendererEmitterSettings.startLength.toJSON(),
          followLocalOrigin: this.rendererEmitterSettings.followLocalOrigin
        };
      } else if (this.renderMode === RenderMode.Mesh) {
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
      } else if (json.renderMode === RenderMode.Mesh) {
        rendererEmitterSettings = {};
      } else {
        rendererEmitterSettings = {};
      }
      var ps = new ParticleSystem(renderer, {
        autoDestroy: json.autoDestroy,
        looping: json.looping,
        duration: json.duration,
        shape: shape,
        startLife: ValueGeneratorFromJSON(json.startLife),
        startSpeed: ValueGeneratorFromJSON(json.startSpeed),
        startRotation: GeneratorFromJSON(json.startRotation),
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

var particle_frag = /* glsl */"\n\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\nvarying vec4 vColor;\n\nvoid main() {\n\n    #include <clipping_planes_fragment>\n    \n    vec3 outgoingLight = vec3( 0.0 );\n    vec4 diffuseColor = vColor;\n    \n    #include <logdepthbuf_fragment>\n    \n    #ifdef USE_MAP\n    vec4 texelColor = texture2D( map, vUv);\n    diffuseColor *= texelColor;\n    #endif\n\n    outgoingLight = diffuseColor.rgb;\n\n    gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n    \n    #include <tonemapping_fragment>\n\n}\n";
/*
    gl_FragColor = vec4(vUv.x, vUv.y, 1.0, 1.0);

    #ifdef USE_MAP
    vec4 texelColor = texture2D( map, vUv);
    diffuseColor *= texelColor;
    #endif

    outgoingLight = diffuseColor.rgb;

    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
*/

var particle_vert = /* glsl */"\n#include <common>\n#include <uv_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\nattribute vec3 offset;\nattribute float rotation;\nattribute float size;\nattribute vec4 color;\nattribute float uvTile;\n\nvarying vec4 vColor;\n\n#ifdef UV_TILE\nuniform vec2 tileCount;\n#endif\n\nvoid main() {\n\n    #ifdef UV_TILE\n        vUv = vec2((mod(uvTile, tileCount.x) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.x) - 1.0) + uv.y) * (1.0 / tileCount.y));\n    #else\n        #include <uv_vertex>\n    #endif\n\t\n    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );\n\t\n    vec2 alignedPosition = ( position.xy ) * size;\n    \n    vec2 rotatedPosition;\n    rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\n    rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\n    \n    mvPosition.xy += rotatedPosition;\n\n\tvColor = color;\n\n\tgl_Position = projectionMatrix * mvPosition;\n\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\n}\n";
/*
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
		if ( isPerspective ) computedSize *= - mvPosition.z;
	#endif
 */

var local_particle_vert = /* glsl */"\n#include <common>\n#include <uv_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\nattribute vec3 offset;\nattribute vec4 rotation;\nattribute float size;\nattribute vec4 color;\nattribute float uvTile;\n\nvarying vec4 vColor;\n\n#ifdef UV_TILE\nuniform vec2 tileCount;\n#endif\n\nvoid main() {\n\n    #ifdef UV_TILE\n        vUv = vec2((mod(uvTile, tileCount.x) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.x) - 1.0) + uv.y) * (1.0 / tileCount.y));\n    #else\n        #include <uv_vertex>\n    #endif\n    \n    float x2 = rotation.x + rotation.x, y2 = rotation.y + rotation.y, z2 = rotation.z + rotation.z;\n    float xx = rotation.x * x2, xy = rotation.x * y2, xz = rotation.x * z2;\n    float yy = rotation.y * y2, yz = rotation.y * z2, zz = rotation.z * z2;\n    float wx = rotation.w * x2, wy = rotation.w * y2, wz = rotation.w * z2;\n    float sx = size, sy = size, sz = size;\n    \n    mat4 matrix = mat4(( 1.0 - ( yy + zz ) ) * sx, ( xy + wz ) * sx, ( xz - wy ) * sx, 0.0,  // 1. column\n                      ( xy - wz ) * sy, ( 1.0 - ( xx + zz ) ) * sy, ( yz + wx ) * sy, 0.0,  // 2. column\n                      ( xz + wy ) * sz, ( yz - wx ) * sz, ( 1.0 - ( xx + yy ) ) * sz, 0.0,  // 3. column\n                      offset.x, offset.y, offset.z, 1.0);\n    \n    vec4 mvPosition = modelViewMatrix * (matrix * vec4( position, 1.0 ));\n\n\tvColor = color;\n\n\tgl_Position = projectionMatrix * mvPosition;\n\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\n}\n";

var stretched_bb_particle_vert = /* glsl */"\n#include <common>\n#include <uv_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\nattribute vec3 offset;\nattribute float rotation;\nattribute float size;\nattribute vec4 color;\nattribute vec3 velocity;\nattribute float uvTile;\n\nvarying vec4 vColor;\n\n#ifdef UV_TILE\nuniform vec2 tileCount;\n#endif\n\nuniform float speedFactor;\n\nvoid main() {\n\n    #ifdef UV_TILE\n        vUv = vec2((mod(uvTile, tileCount.x) + uv.x) * (1.0 / tileCount.x), ((tileCount.y - floor(uvTile / tileCount.x) - 1.0) + uv.y) * (1.0 / tileCount.y));\n    #else\n        #include <uv_vertex>\n    #endif\n\t\n    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );\n    vec3 viewVelocity = normalMatrix * velocity;\n\n    vec3 scaledPos = vec3(position.xy * size, position.z);\n    mvPosition.xyz += scaledPos + dot(scaledPos, viewVelocity) * viewVelocity / length(viewVelocity) * speedFactor;\n\n\tvColor = color;\n\n\tgl_Position = projectionMatrix * mvPosition;\n\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\n}\n";
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
    _this.maxParticles = 1000;
    _this.setupBuffers();
    _this.rebuildMaterial();
    // TODO: implement boundingVolume
    return _this;
  }
  _createClass(SpriteBatch, [{
    key: "buildExpandableBuffers",
    value: function buildExpandableBuffers() {
      this.offsetBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 3), 3);
      this.offsetBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('offset', this.offsetBuffer);
      this.colorBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 4), 4);
      this.colorBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('color', this.colorBuffer);
      if (this.settings.renderMode === RenderMode.Mesh) {
        this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 4), 4);
        this.rotationBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('rotation', this.rotationBuffer);
      } else if (this.settings.renderMode === RenderMode.BillBoard || this.settings.renderMode === RenderMode.StretchedBillBoard) {
        this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles), 1);
        this.rotationBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('rotation', this.rotationBuffer);
      }
      this.sizeBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles), 1);
      this.sizeBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('size', this.sizeBuffer);
      this.uvTileBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles), 1);
      this.uvTileBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('uvTile', this.uvTileBuffer);
      if (this.settings.renderMode === RenderMode.StretchedBillBoard) {
        this.velocityBuffer = new InstancedBufferAttribute(new Float32Array(this.maxParticles * 3), 3);
        this.velocityBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('velocity', this.velocityBuffer);
      }
    }
  }, {
    key: "setupBuffers",
    value: function setupBuffers() {
      if (this.geometry) this.geometry.dispose();
      this.geometry = new InstancedBufferGeometry();
      this.geometry.setIndex(this.settings.instancingGeometry.getIndex());
      this.geometry.setAttribute('position', this.settings.instancingGeometry.getAttribute('position')); //new InterleavedBufferAttribute(this.interleavedBuffer, 3, 0, false));
      this.geometry.setAttribute('uv', this.settings.instancingGeometry.getAttribute('uv')); //new InterleavedBufferAttribute(this.interleavedBuffer, 2, 3, false));

      this.buildExpandableBuffers();
    }
  }, {
    key: "expandBuffers",
    value: function expandBuffers(target) {
      while (target >= this.maxParticles) {
        this.maxParticles *= 2;
      }
      this.setupBuffers();
    }
  }, {
    key: "rebuildMaterial",
    value: function rebuildMaterial() {
      var uniforms = {};
      var defines = {};
      defines['USE_MAP'] = '';
      defines['USE_UV'] = '';
      uniforms['map'] = new Uniform(this.settings.texture);
      //@ts-ignore
      uniforms['uvTransform'] = new Uniform(new Matrix3().copy(this.settings.texture.matrix));
      var uTileCount = this.settings.uTileCount;
      var vTileCount = this.settings.vTileCount;
      defines['UV_TILE'] = '';
      uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));
      if (this.settings.renderMode === RenderMode.BillBoard || this.settings.renderMode === RenderMode.Mesh) {
        var vertexShader;
        var side;
        if (this.settings.renderMode === RenderMode.Mesh) {
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
      var particleCount = 0;
      this.systems.forEach(function (system) {
        particleCount += system.particleNum;
      });
      if (particleCount > this.maxParticles) {
        this.expandBuffers(particleCount);
      }
      this.systems.forEach(function (system) {
        var particles = system.particles;
        var particleNum = system.particleNum;
        _this2.quaternion2_.setFromRotationMatrix(system.emitter.matrixWorld);
        _this2.rotationMat_.setFromMatrix4(system.emitter.matrixWorld);
        for (var j = 0; j < particleNum; j++, index++) {
          var particle = particles[j];
          if (_this2.settings.renderMode === RenderMode.Mesh) {
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
        if (this.settings.renderMode === RenderMode.Mesh) {
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

var trail_frag = /* glsl */"\n\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\nuniform sampler2D alphaMap;\nuniform float useAlphaMap;\nuniform float visibility;\nuniform float alphaTest;\nuniform vec2 repeat;\n\nvarying vec4 vColor;\n    \nvoid main() {\n    #include <clipping_planes_fragment>\n    #include <logdepthbuf_fragment>\n\n    vec4 c = vColor;\n    \n    #ifdef USE_MAP\n    c *= texture2D( map, vUv * repeat );\n    #endif\n    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUv * repeat ).a;\n    if( c.a < alphaTest ) discard;\n    gl_FragColor = c;\n\n    #include <fog_fragment>\n    #include <tonemapping_fragment>\n}";

var trail_vert = /* glsl */"\n#include <common>\n#include <uv_pars_vertex>\n#include <clipping_planes_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <fog_pars_vertex>\n\nattribute vec3 previous;\nattribute vec3 next;\nattribute vec4 color;\nattribute float side;\nattribute float width;\n\nuniform vec2 resolution;\nuniform float lineWidth;\nuniform float sizeAttenuation;\n\nvarying vec2 vUV;\nvarying vec4 vColor;\n    \nvec2 fix(vec4 i, float aspect) {\n    vec2 res = i.xy / i.w;\n    res.x *= aspect;\n    return res;\n}\n    \nvoid main() {\n\n    #include <uv_vertex>\n    \n    float aspect = resolution.x / resolution.y;\n\n    vColor = color;\n\n    mat4 m = projectionMatrix * modelViewMatrix;\n    vec4 finalPosition = m * vec4( position, 1.0 );\n    vec4 prevPos = m * vec4( previous, 1.0 );\n    vec4 nextPos = m * vec4( next, 1.0 );\n\n    vec2 currentP = fix( finalPosition, aspect );\n    vec2 prevP = fix( prevPos, aspect );\n    vec2 nextP = fix( nextPos, aspect );\n\n    float w = lineWidth * width;\n\n    vec2 dir;\n    if( nextP == currentP ) dir = normalize( currentP - prevP );\n    else if( prevP == currentP ) dir = normalize( nextP - currentP );\n    else {\n        vec2 dir1 = normalize( currentP - prevP );\n        vec2 dir2 = normalize( nextP - currentP );\n        dir = normalize( dir1 + dir2 );\n\n        vec2 perp = vec2( -dir1.y, dir1.x );\n        vec2 miter = vec2( -dir.y, dir.x );\n        //w = clamp( w / dot( miter, perp ), 0., 4., * lineWidth * width );\n\n    }\n\n    //vec2 normal = ( cross( vec3( dir, 0. ) vec3( 0., 0., 1. ) ) ).xy;\n    vec4 normal = vec4( -dir.y, dir.x, 0., 1. );\n    normal.xy *= .5 * w;\n    normal *= projectionMatrix;\n    if( sizeAttenuation == 0. ) {\n        normal.xy *= finalPosition.w;\n        normal.xy /= ( vec4( resolution, 0., 1. ) * projectionMatrix ).xy;\n    }\n\n    finalPosition.xy += normal.xy * side;\n\n    gl_Position = finalPosition;\n\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    \n\t#include <fog_vertex>\n}";

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
    _this.maxParticles = 10000;
    _this.setupBuffers();
    _this.rebuildMaterial();
    // TODO: implement boundingVolume
    return _this;
  }
  _createClass(TrailBatch, [{
    key: "setupBuffers",
    value: function setupBuffers() {
      if (this.geometry) this.geometry.dispose();
      this.geometry = new BufferGeometry();
      this.indexBuffer = new BufferAttribute(new Uint32Array(this.maxParticles * 6), 1);
      this.indexBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setIndex(this.indexBuffer);
      this.positionBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 6), 3);
      this.positionBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('position', this.positionBuffer);
      this.previousBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 6), 3);
      this.previousBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('previous', this.previousBuffer);
      this.nextBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 6), 3);
      this.nextBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('next', this.nextBuffer);
      this.widthBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 2), 1);
      this.widthBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('width', this.widthBuffer);
      this.sideBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 2), 1);
      this.sideBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('side', this.sideBuffer);
      this.uvBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 4), 2);
      this.uvBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('uv', this.uvBuffer);
      this.colorBuffer = new BufferAttribute(new Float32Array(this.maxParticles * 8), 4);
      this.colorBuffer.setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('color', this.colorBuffer);
    }
  }, {
    key: "expandBuffers",
    value: function expandBuffers(target) {
      while (target >= this.maxParticles) {
        this.maxParticles *= 2;
      }
      this.setupBuffers();
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
      uniforms['map'] = new Uniform(this.settings.texture);
      //@ts-ignore
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
      var particleCount = 0;
      this.systems.forEach(function (system) {
        for (var j = 0; j < system.particleNum; j++) {
          particleCount += system.particles[j].previous.length * 2;
        }
      });
      if (particleCount > this.maxParticles) {
        this.expandBuffers(particleCount);
      }
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
          var iter = particle.previous.values();
          var curIter = iter.next();
          var previous = curIter.value;
          var current = previous;
          if (!curIter.done) curIter = iter.next();
          var next = void 0;
          if (curIter.value !== undefined) {
            next = curIter.value;
          } else {
            next = current;
          }
          for (var i = 0; i < particle.previous.length; i++, index += 2) {
            _this2.positionBuffer.setXYZ(index, current.position.x, current.position.y, current.position.z);
            _this2.positionBuffer.setXYZ(index + 1, current.position.x, current.position.y, current.position.z);
            if (system.worldSpace) {
              _this2.positionBuffer.setXYZ(index, current.position.x, current.position.y, current.position.z);
              _this2.positionBuffer.setXYZ(index + 1, current.position.x, current.position.y, current.position.z);
            } else {
              if (particle.parentMatrix) {
                _this2.vector_.copy(current.position).applyMatrix4(particle.parentMatrix);
              } else {
                _this2.vector_.copy(current.position).applyMatrix4(system.emitter.matrixWorld);
              }
              _this2.positionBuffer.setXYZ(index, _this2.vector_.x, _this2.vector_.y, _this2.vector_.z);
              _this2.positionBuffer.setXYZ(index + 1, _this2.vector_.x, _this2.vector_.y, _this2.vector_.z);
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
            _this2.widthBuffer.setX(index, current.size);
            _this2.widthBuffer.setX(index + 1, current.size);
            _this2.uvBuffer.setXY(index, (i / particle.previous.length + col) * tileWidth, (vTileCount - row - 1) * tileHeight);
            _this2.uvBuffer.setXY(index + 1, (i / particle.previous.length + col) * tileWidth, (vTileCount - row) * tileHeight);
            _this2.colorBuffer.setXYZW(index, current.color.x, current.color.y, current.color.z, current.color.w);
            _this2.colorBuffer.setXYZW(index + 1, current.color.x, current.color.y, current.color.z, current.color.w);
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
            previous = current;
            current = next;
            if (!curIter.done) {
              curIter = iter.next();
              if (curIter.value !== undefined) {
                next = curIter.value;
              }
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
        case RenderMode.Mesh:
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

var QuarksLoader = /*#__PURE__*/function (_ObjectLoader) {
  _inherits(QuarksLoader, _ObjectLoader);
  var _super = _createSuper(QuarksLoader);
  /*manager: LoadingManager;
  crossOrigin: string = "anonymous";
  path?: string;
  resourcePath: string;
  */

  function QuarksLoader(renderer, manager) {
    var _this;
    _classCallCheck(this, QuarksLoader);
    _this = _super.call(this, manager);
    _defineProperty(_assertThisInitialized(_this), "renderer", void 0);
    _this.renderer = renderer;
    //this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
    //this.resourcePath = '';
    return _this;
  }
  _createClass(QuarksLoader, [{
    key: "linkReference",
    value: function linkReference(object) {
      var objectsMap = {};
      object.traverse(function (child) {
        objectsMap[child.uuid] = child;
      });
      object.traverse(function (child) {
        if (child.type === "ParticleEmitter") {
          var system = child.system;
          var shape = system.emitterShape;
          if (shape instanceof MeshSurfaceEmitter) {
            shape.mesh = objectsMap[shape.mesh];
          }
          for (var i = 0; i < system.behaviors.length; i++) {
            if (system.behaviors[i] instanceof EmitSubParticleSystem) {
              system.behaviors[i].subParticleSystem = objectsMap[system.behaviors[i].subParticleSystem];
            }
          }
        }
      });
    }
  }, {
    key: "parse",
    value: function parse(json, onLoad) {
      var object = _get(_getPrototypeOf(QuarksLoader.prototype), "parse", this).call(this, json, onLoad);
      this.linkReference(object);
      return object;
    }

    // @ts-ignore
  }, {
    key: "parseObject",
    value: function parseObject(data, geometries, materials, textures, animations) {
      var object;
      function getGeometry(name) {
        if (geometries[name] === undefined) {
          console.warn('THREE.ObjectLoader: Undefined geometry', name);
        }
        return geometries[name];
      }
      function getMaterial(name) {
        if (name === undefined) return undefined;
        if (Array.isArray(name)) {
          var array = [];
          for (var i = 0, l = name.length; i < l; i++) {
            var _uuid = name[i];
            if (materials[_uuid] === undefined) {
              console.warn('THREE.ObjectLoader: Undefined material', _uuid);
            }
            array.push(materials[_uuid]);
          }
          return array;
        }
        if (materials[name] === undefined) {
          console.warn('THREE.ObjectLoader: Undefined material', name);
        }
        return materials[name];
      }
      function getTexture(uuid) {
        if (textures[uuid] === undefined) {
          console.warn('THREE.ObjectLoader: Undefined texture', uuid);
        }
        return textures[uuid];
      }
      var geometry, material;
      var meta = {
        textures: textures,
        geometries: geometries
      };
      var dependencies = {};
      switch (data.type) {
        case 'ParticleEmitter':
          object = ParticleSystem.fromJSON(data.ps, meta, dependencies, this.renderer).emitter;
          break;
        case 'Scene':
          object = new Scene();
          if (data.background !== undefined) {
            if (Number.isInteger(data.background)) {
              object.background = new Color(data.background);
            } else {
              object.background = getTexture(data.background);
            }
          }
          if (data.environment !== undefined) {
            object.environment = getTexture(data.environment);
          }
          if (data.fog !== undefined) {
            if (data.fog.type === 'Fog') {
              object.fog = new Fog(data.fog.color, data.fog.near, data.fog.far);
            } else if (data.fog.type === 'FogExp2') {
              object.fog = new FogExp2(data.fog.color, data.fog.density);
            }
          }
          if (data.backgroundBlurriness !== undefined) object.backgroundBlurriness = data.backgroundBlurriness;
          break;
        case 'PerspectiveCamera':
          object = new PerspectiveCamera(data.fov, data.aspect, data.near, data.far);
          if (data.focus !== undefined) object.focus = data.focus;
          if (data.zoom !== undefined) object.zoom = data.zoom;
          if (data.filmGauge !== undefined) object.filmGauge = data.filmGauge;
          if (data.filmOffset !== undefined) object.filmOffset = data.filmOffset;
          if (data.view !== undefined) object.view = Object.assign({}, data.view);
          break;
        case 'OrthographicCamera':
          object = new OrthographicCamera(data.left, data.right, data.top, data.bottom, data.near, data.far);
          if (data.zoom !== undefined) object.zoom = data.zoom;
          if (data.view !== undefined) object.view = Object.assign({}, data.view);
          break;
        case 'AmbientLight':
          object = new AmbientLight(data.color, data.intensity);
          break;
        case 'DirectionalLight':
          object = new DirectionalLight(data.color, data.intensity);
          break;
        case 'PointLight':
          object = new PointLight(data.color, data.intensity, data.distance, data.decay);
          break;
        case 'RectAreaLight':
          object = new RectAreaLight(data.color, data.intensity, data.width, data.height);
          break;
        case 'SpotLight':
          object = new SpotLight(data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay);
          break;
        case 'HemisphereLight':
          object = new HemisphereLight(data.color, data.groundColor, data.intensity);
          break;
        case 'LightProbe':
          object = new LightProbe().fromJSON(data);
          break;
        case 'SkinnedMesh':
          geometry = getGeometry(data.geometry);
          material = getMaterial(data.material);
          object = new SkinnedMesh(geometry, material);
          if (data.bindMode !== undefined) object.bindMode = data.bindMode;
          if (data.bindMatrix !== undefined) object.bindMatrix.fromArray(data.bindMatrix);
          if (data.skeleton !== undefined) object.skeleton = data.skeleton;
          break;
        case 'Mesh':
          geometry = getGeometry(data.geometry);
          material = getMaterial(data.material);
          object = new Mesh(geometry, material);
          break;
        case 'InstancedMesh':
          geometry = getGeometry(data.geometry);
          material = getMaterial(data.material);
          var count = data.count;
          var instanceMatrix = data.instanceMatrix;
          var instanceColor = data.instanceColor;
          object = new InstancedMesh(geometry, material, count);
          object.instanceMatrix = new InstancedBufferAttribute(new Float32Array(instanceMatrix.array), 16);
          if (instanceColor !== undefined) object.instanceColor = new InstancedBufferAttribute(new Float32Array(instanceColor.array), instanceColor.itemSize);
          break;
        case 'LOD':
          object = new LOD();
          break;
        case 'Line':
          object = new Line(getGeometry(data.geometry), getMaterial(data.material));
          break;
        case 'LineLoop':
          object = new LineLoop(getGeometry(data.geometry), getMaterial(data.material));
          break;
        case 'LineSegments':
          object = new LineSegments(getGeometry(data.geometry), getMaterial(data.material));
          break;
        case 'PointCloud':
        case 'Points':
          object = new Points(getGeometry(data.geometry), getMaterial(data.material));
          break;
        case 'Sprite':
          object = new Sprite(getMaterial(data.material));
          break;
        case 'Group':
          object = new Group();
          break;
        case 'Bone':
          object = new Bone();
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
      if (data.shadow) {
        if (data.shadow.bias !== undefined) object.shadow.bias = data.shadow.bias;
        if (data.shadow.normalBias !== undefined) object.normalBias = data.shadow.normalBias;
        if (data.shadow.radius !== undefined) object.radius = data.shadow.radius;
        if (data.shadow.mapSize !== undefined) object.mapSize.fromArray(data.shadow.mapSize);
        if (data.shadow.camera !== undefined) {
          // @ts-ignore
          object.camera = this.parseObject(data.shadow.camera);
        }
      }
      if (data.visible !== undefined) object.visible = data.visible;
      if (data.frustumCulled !== undefined) object.frustumCulled = data.frustumCulled;
      if (data.renderOrder !== undefined) object.renderOrder = data.renderOrder;
      if (data.userData !== undefined) object.userData = data.userData;
      if (data.layers !== undefined) object.layers.mask = data.layers;
      if (data.children !== undefined) {
        var children = data.children;
        for (var i = 0; i < children.length; i++) {
          object.add(this.parseObject(children[i], geometries, materials, textures, animations));
        }
      }
      if (data.animations !== undefined) {
        var objectAnimations = data.animations;
        for (var _i = 0; _i < objectAnimations.length; _i++) {
          var _uuid2 = objectAnimations[_i];
          object.animations.push(animations[_uuid2]);
        }
      }
      if (data.type === 'LOD') {
        if (data.autoUpdate !== undefined) object.autoUpdate = data.autoUpdate;
        var levels = data.levels;
        for (var l = 0; l < levels.length; l++) {
          var level = levels[l];
          var child = object.getObjectByProperty('uuid', level.object);
          if (child !== undefined) {
            // @ts-ignore
            object.addLevel(child, level.distance);
          }
        }
      }

      // @ts-ignore
      return object;
    }
  }]);
  return QuarksLoader;
}(ObjectLoader);

var NodeValueType;
(function (NodeValueType) {
  NodeValueType[NodeValueType["Number"] = 0] = "Number";
  NodeValueType[NodeValueType["Vec2"] = 1] = "Vec2";
  NodeValueType[NodeValueType["Vec3"] = 2] = "Vec3";
  NodeValueType[NodeValueType["Vec4"] = 3] = "Vec4";
  NodeValueType[NodeValueType["Boolean"] = 4] = "Boolean";
  NodeValueType[NodeValueType["AnyType"] = 5] = "AnyType";
})(NodeValueType || (NodeValueType = {}));
var genDefaultForNodeValueType = function genDefaultForNodeValueType(type) {
  switch (type) {
    case NodeValueType.Boolean:
      return false;
    case NodeValueType.Number:
      return 0;
    case NodeValueType.Vec2:
      return new Vector2();
    case NodeValueType.Vec3:
      return new Vector3();
    case NodeValueType.Vec4:
      return new Vector4();
    case NodeValueType.AnyType:
      return 0;
  }
};

var Node = /*#__PURE__*/_createClass(
// display

// execution

function Node(type) {
  _classCallCheck(this, Node);
  _defineProperty(this, "id", void 0);
  _defineProperty(this, "inputs", []);
  _defineProperty(this, "outputs", []);
  _defineProperty(this, "type", void 0);
  _defineProperty(this, "data", {});
  _defineProperty(this, "position", new Vector2());
  _defineProperty(this, "outputValues", []);
  this.id = "" + Math.round(Math.random() * 100000); //TODO use real random
  this.type = type;
  for (var i = 0; i < type.inputTypes.length; i++) {
    this.inputs.push(undefined);
  }
  for (var _i = 0; _i < type.outputTypes.length; _i++) {
    this.outputs.push(undefined);
    this.outputValues.push(genDefaultForNodeValueType(type.outputTypes[_i]));
  }
});
var Wire = /*#__PURE__*/_createClass(function Wire(input, inputIndex, output, outputIndex) {
  _classCallCheck(this, Wire);
  _defineProperty(this, "input", void 0);
  _defineProperty(this, "inputIndex", void 0);
  _defineProperty(this, "output", void 0);
  _defineProperty(this, "outputIndex", void 0);
  this.input = input;
  this.inputIndex = inputIndex;
  this.input.outputs[inputIndex] = this;
  this.output = output;
  this.outputIndex = outputIndex;
  this.output.inputs[outputIndex] = this;
});

var Interpreter = /*#__PURE__*/function () {
  function Interpreter() {
    _classCallCheck(this, Interpreter);
    _defineProperty(this, "visited", new Set());
    _defineProperty(this, "graph_", void 0);
    _defineProperty(this, "context_", void 0);
    Interpreter.Instance = this;
  }
  _createClass(Interpreter, [{
    key: "traverse",
    value: function traverse(node) {
      this.visited.add(node.id);
      var inputValues = [];
      for (var i = 0; i < node.inputs.length; i++) {
        if (node.inputs[i] instanceof Wire) {
          var inputNode = node.inputs[i].input;
          //if (inputNode) {
          if (!this.visited.has(inputNode.id)) {
            this.traverse(inputNode);
          }
          inputValues.push(inputNode.outputValues[node.inputs[i].inputIndex]);
          /*} else {
              throw new Error(`Node ${node.id} has not inputs`);
          }*/
        } else {
          inputValues.push(node.inputs[i].getValue(this.context_));
        }
      }
      // calculation
      node.type.func(this.context_, inputValues, node.outputValues);
      this.graph_.nodesInOrder.push(node);
    }
  }, {
    key: "executeCompiledGraph",
    value: function executeCompiledGraph() {
      var nodes = this.graph_.nodesInOrder;
      for (var i = 0; i < nodes.length; i++) {
        var inputValues = [];
        var node = nodes[i];
        for (var j = 0; j < node.inputs.length; j++) {
          if (node.inputs[j] instanceof Wire) {
            inputValues.push(node.inputs[j].input.outputValues[node.inputs[j].inputIndex]);
          } else if (node.inputs[j] !== undefined) {
            inputValues.push(node.inputs[j].getValue(this.context_));
          } else {
            throw new Error("miss input for node ".concat(node.id));
          }
        }
        node.type.func(this.context_, inputValues, node.outputValues);
      }
    }
  }, {
    key: "run",
    value: function run(graph, context) {
      this.graph_ = graph;
      this.context_ = context;
      if (graph.compiled) {
        this.executeCompiledGraph();
      } else {
        graph.nodesInOrder.length = 0;
        this.visited.clear();
        for (var i = 0; i < graph.outputNodes.length; i++) {
          var node = graph.outputNodes[i];
          this.traverse(node);
        }
        graph.compiled = true;
      }
    }
  }]);
  return Interpreter;
}();
_defineProperty(Interpreter, "Instance", void 0);

var NodeType = /*#__PURE__*/_createClass(function NodeType(name, func, inputTypes, outputTypes) {
  _classCallCheck(this, NodeType);
  _defineProperty(this, "name", void 0);
  _defineProperty(this, "inputTypes", []);
  _defineProperty(this, "outputTypes", []);
  _defineProperty(this, "func", void 0);
  this.name = name;
  this.func = func;
  this.inputTypes = inputTypes;
  this.outputTypes = outputTypes;
});
var GraphNodeType = /*#__PURE__*/function (_NodeType) {
  _inherits(GraphNodeType, _NodeType);
  var _super = _createSuper(GraphNodeType);
  function GraphNodeType(nodeGraph) {
    var _this;
    _classCallCheck(this, GraphNodeType);
    var inputTypes = [];
    for (var i = 0; i < nodeGraph.inputNodes.length; i++) {
      if (nodeGraph.inputNodes[i].type.name === 'input') {
        inputTypes.push(nodeGraph.inputNodes[i].data.type);
      }
    }
    var outputTypes = [];
    for (var _i = 0; _i < nodeGraph.outputNodes.length; _i++) {
      if (nodeGraph.outputNodes[_i].type.name === 'output') {
        outputTypes.push(nodeGraph.outputNodes[_i].data.type);
      }
    }
    _this = _super.call(this, nodeGraph.name, function (context, inputs, outputs) {
      context.inputs = inputs;
      context.outputs = outputs;
      Interpreter.Instance.run(nodeGraph, context);
    }, inputTypes, outputTypes);
    _defineProperty(_assertThisInitialized(_this), "nodeGraph", void 0);
    _this.nodeGraph = nodeGraph;
    return _this;
  }
  return _createClass(GraphNodeType);
}(NodeType);

var NodeTypes = {
  "add": new NodeType("add", function (context, inputs, outputs) {
    if (typeof inputs[0] === 'number') {
      outputs[0] = inputs[0] + inputs[1];
    } else if (inputs[0] instanceof Vector3 || inputs[0] instanceof Vector2 || inputs[0] instanceof Vector4) {
      outputs[0].addVectors(inputs[0], inputs[1]);
    }
  }, [NodeValueType.AnyType, NodeValueType.AnyType], [NodeValueType.AnyType]),
  "sub": new NodeType("sub", function (context, inputs, outputs) {
    if (typeof inputs[0] === 'number') {
      outputs[0] = inputs[0] - inputs[1];
    } else if (inputs[0] instanceof Vector3 || inputs[0] instanceof Vector2 || inputs[0] instanceof Vector4) {
      outputs[0].subVectors(inputs[0], inputs[1]);
    }
  }, [NodeValueType.AnyType, NodeValueType.AnyType], [NodeValueType.AnyType]),
  "mul": new NodeType("mul", function (context, inputs, outputs) {
    if (typeof inputs[0] === 'number') {
      outputs[0] = inputs[0] * inputs[1];
    } else if (inputs[0] instanceof Vector3 || inputs[0] instanceof Vector2 || inputs[0] instanceof Vector4) {
      outputs[0].multiplyVectors(inputs[0], inputs[1]);
    }
  }, [NodeValueType.AnyType, NodeValueType.AnyType], [NodeValueType.AnyType]),
  "div": new NodeType("div", function (context, inputs, outputs) {
    if (typeof inputs[0] === 'number') {
      outputs[0] = inputs[0] / inputs[1];
    } else if (inputs[0] instanceof Vector3 || inputs[0] instanceof Vector2 || inputs[0] instanceof Vector4) {
      outputs[0].copy(inputs[0]).divide(inputs[1]);
    }
  }, [NodeValueType.AnyType, NodeValueType.AnyType], [NodeValueType.AnyType]),
  "curve": new NodeType("curve", function (context, inputs, outputs) {
    //outputs[0] = inputs[0] + inputs[1];
  }, [], []),
  "vrand": new NodeType("vrand", function (context, inputs, outputs) {
    //outputs[0] = inputs[0] + inputs[1];
  }, [], []),
  "curveSample": new NodeType("curveSample", function (context, inputs, outputs) {
    //outputs[0] = inputs[0] + inputs[1];
  }, [], []),
  "random": new NodeType("random", function (context, inputs, outputs) {
    outputs[0] = Math.random() * (inputs[1] - inputs[0]) + inputs[0];
  }, [NodeValueType.Number, NodeValueType.Number], [NodeValueType.Number]),
  "input": new NodeType("input", function (context, inputs, outputs) {
    outputs[0] = inputs[0];
  }, [NodeValueType.AnyType], [NodeValueType.AnyType]),
  "output": new NodeType("output", function (context, inputs, outputs) {
    outputs[0] = inputs[0];
  }, [NodeValueType.AnyType], [NodeValueType.AnyType])
};

var NodeGraph = /*#__PURE__*/function () {
  function NodeGraph(name) {
    _classCallCheck(this, NodeGraph);
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "name", void 0);
    _defineProperty(this, "inputNodes", []);
    _defineProperty(this, "outputNodes", []);
    _defineProperty(this, "nodes", []);
    _defineProperty(this, "allNodes", new Map());
    _defineProperty(this, "wires", []);
    _defineProperty(this, "compiled", false);
    _defineProperty(this, "nodesInOrder", []);
    this.id = "" + Math.round(Math.random() * 100000); //TODO use real random
    this.name = name;
  }
  _createClass(NodeGraph, [{
    key: "addWire",
    value: function addWire(wire) {
      this.wires.push(wire);
    }
  }, {
    key: "addNode",
    value: function addNode(node) {
      this.nodes.push(node);
      this.allNodes.set(node.id, node);
      if (node.type === NodeTypes['input']) {
        this.inputNodes.push(node);
      } else if (node.type === NodeTypes['output']) {
        this.outputNodes.push(node);
      }
    }
  }, {
    key: "getNode",
    value: function getNode(id) {
      return this.allNodes.get(id);
    }
  }, {
    key: "deleteNode",
    value: function deleteNode(node) {
      var index = this.nodes.indexOf(node);
      if (index != -1) {
        this.nodes[index] = this.nodes[this.nodes.length - 1];
        this.nodes.pop();
      }
      this.allNodes["delete"](node.id);
    }
  }, {
    key: "deleteWire",
    value: function deleteWire(wire) {
      wire.input.outputs[wire.inputIndex] = undefined;
      wire.input.outputs[wire.inputIndex] = undefined;
      var index = this.wires.indexOf(wire);
      if (index != -1) {
        this.wires[index] = this.wires[this.wires.length - 1];
        this.wires.pop();
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      throw new Error("not implemented");
    }
  }, {
    key: "clone",
    value: function clone() {
      throw new Error("not implemented");
    }
  }]);
  return NodeGraph;
}();

export { ApplyForce, AxisAngleGenerator, BatchedParticleRenderer, BehaviorFromJSON, BehaviorTypes, Bezier, ChangeEmitDirection, ColorGeneratorFromJSON, ColorOverLife, ColorRange, ConeEmitter, ConstantColor, ConstantValue, DonutEmitter, EmitSubParticleSystem, EmitterFromJSON, EmitterShapes, ForceOverLife, FrameOverLife, GeneratorFromJSON, Gradient, GraphNodeType, GravityForce, Interpreter, IntervalValue, MeshSurfaceEmitter, Node, NodeGraph, NodeType, NodeTypes, NodeValueType, Noise, OrbitOverLife, ParticleEmitter, ParticleSystem, ParticleSystemBatch, PiecewiseBezier, PiecewiseFunction, PointEmitter, QuarksLoader, RandomColor, RandomQuatGenerator, RecordState, RenderMode, Rotation3DOverLife, RotationGeneratorFromJSON, RotationOverLife, SizeOverLife, SpeedOverLife, SphereEmitter, SpriteBatch, SpriteParticle, TrailBatch, TrailParticle, TurbulenceField, ValueGeneratorFromJSON, WidthOverLength, Wire, genDefaultForNodeValueType };
