
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-underscore/index.js", Function("exports, require, module",
"//     Underscore.js 1.3.3\n\
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.\n\
//     Underscore is freely distributable under the MIT license.\n\
//     Portions of Underscore are inspired or borrowed from Prototype,\n\
//     Oliver Steele's Functional, and John Resig's Micro-Templating.\n\
//     For all details and documentation:\n\
//     http://documentcloud.github.com/underscore\n\
\n\
(function() {\n\
\n\
  // Baseline setup\n\
  // --------------\n\
\n\
  // Establish the root object, `window` in the browser, or `global` on the server.\n\
  var root = this;\n\
\n\
  // Save the previous value of the `_` variable.\n\
  var previousUnderscore = root._;\n\
\n\
  // Establish the object that gets returned to break out of a loop iteration.\n\
  var breaker = {};\n\
\n\
  // Save bytes in the minified (but not gzipped) version:\n\
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;\n\
\n\
  // Create quick reference variables for speed access to core prototypes.\n\
  var push             = ArrayProto.push,\n\
      slice            = ArrayProto.slice,\n\
      unshift          = ArrayProto.unshift,\n\
      toString         = ObjProto.toString,\n\
      hasOwnProperty   = ObjProto.hasOwnProperty;\n\
\n\
  // All **ECMAScript 5** native function implementations that we hope to use\n\
  // are declared here.\n\
  var\n\
    nativeForEach      = ArrayProto.forEach,\n\
    nativeMap          = ArrayProto.map,\n\
    nativeReduce       = ArrayProto.reduce,\n\
    nativeReduceRight  = ArrayProto.reduceRight,\n\
    nativeFilter       = ArrayProto.filter,\n\
    nativeEvery        = ArrayProto.every,\n\
    nativeSome         = ArrayProto.some,\n\
    nativeIndexOf      = ArrayProto.indexOf,\n\
    nativeLastIndexOf  = ArrayProto.lastIndexOf,\n\
    nativeIsArray      = Array.isArray,\n\
    nativeKeys         = Object.keys,\n\
    nativeBind         = FuncProto.bind;\n\
\n\
  // Create a safe reference to the Underscore object for use below.\n\
  var _ = function(obj) { return new wrapper(obj); };\n\
\n\
  // Export the Underscore object for **Node.js**, with\n\
  // backwards-compatibility for the old `require()` API. If we're in\n\
  // the browser, add `_` as a global object via a string identifier,\n\
  // for Closure Compiler \"advanced\" mode.\n\
  if (typeof exports !== 'undefined') {\n\
    if (typeof module !== 'undefined' && module.exports) {\n\
      exports = module.exports = _;\n\
    }\n\
    exports._ = _;\n\
  } else {\n\
    root['_'] = _;\n\
  }\n\
\n\
  // Current version.\n\
  _.VERSION = '1.3.3';\n\
\n\
  // Collection Functions\n\
  // --------------------\n\
\n\
  // The cornerstone, an `each` implementation, aka `forEach`.\n\
  // Handles objects with the built-in `forEach`, arrays, and raw objects.\n\
  // Delegates to **ECMAScript 5**'s native `forEach` if available.\n\
  var each = _.each = _.forEach = function(obj, iterator, context) {\n\
    if (obj == null) return;\n\
    if (nativeForEach && obj.forEach === nativeForEach) {\n\
      obj.forEach(iterator, context);\n\
    } else if (obj.length === +obj.length) {\n\
      for (var i = 0, l = obj.length; i < l; i++) {\n\
        if (iterator.call(context, obj[i], i, obj) === breaker) return;\n\
      }\n\
    } else {\n\
      for (var key in obj) {\n\
        if (_.has(obj, key)) {\n\
          if (iterator.call(context, obj[key], key, obj) === breaker) return;\n\
        }\n\
      }\n\
    }\n\
  };\n\
\n\
  // Return the results of applying the iterator to each element.\n\
  // Delegates to **ECMAScript 5**'s native `map` if available.\n\
  _.map = _.collect = function(obj, iterator, context) {\n\
    var results = [];\n\
    if (obj == null) return results;\n\
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);\n\
    each(obj, function(value, index, list) {\n\
      results[results.length] = iterator.call(context, value, index, list);\n\
    });\n\
    return results;\n\
  };\n\
\n\
  // **Reduce** builds up a single result from a list of values, aka `inject`,\n\
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.\n\
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {\n\
    var initial = arguments.length > 2;\n\
    if (obj == null) obj = [];\n\
    if (nativeReduce && obj.reduce === nativeReduce) {\n\
      if (context) iterator = _.bind(iterator, context);\n\
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);\n\
    }\n\
    each(obj, function(value, index, list) {\n\
      if (!initial) {\n\
        memo = value;\n\
        initial = true;\n\
      } else {\n\
        memo = iterator.call(context, memo, value, index, list);\n\
      }\n\
    });\n\
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');\n\
    return memo;\n\
  };\n\
\n\
  // The right-associative version of reduce, also known as `foldr`.\n\
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.\n\
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {\n\
    var initial = arguments.length > 2;\n\
    if (obj == null) obj = [];\n\
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {\n\
      if (context) iterator = _.bind(iterator, context);\n\
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);\n\
    }\n\
    var reversed = _.toArray(obj).reverse();\n\
    if (context && !initial) iterator = _.bind(iterator, context);\n\
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);\n\
  };\n\
\n\
  // Return the first value which passes a truth test. Aliased as `detect`.\n\
  _.find = _.detect = function(obj, iterator, context) {\n\
    var result;\n\
    any(obj, function(value, index, list) {\n\
      if (iterator.call(context, value, index, list)) {\n\
        result = value;\n\
        return true;\n\
      }\n\
    });\n\
    return result;\n\
  };\n\
\n\
  // Return all the elements that pass a truth test.\n\
  // Delegates to **ECMAScript 5**'s native `filter` if available.\n\
  // Aliased as `select`.\n\
  _.filter = _.select = function(obj, iterator, context) {\n\
    var results = [];\n\
    if (obj == null) return results;\n\
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);\n\
    each(obj, function(value, index, list) {\n\
      if (iterator.call(context, value, index, list)) results[results.length] = value;\n\
    });\n\
    return results;\n\
  };\n\
\n\
  // Return all the elements for which a truth test fails.\n\
  _.reject = function(obj, iterator, context) {\n\
    var results = [];\n\
    if (obj == null) return results;\n\
    each(obj, function(value, index, list) {\n\
      if (!iterator.call(context, value, index, list)) results[results.length] = value;\n\
    });\n\
    return results;\n\
  };\n\
\n\
  // Determine whether all of the elements match a truth test.\n\
  // Delegates to **ECMAScript 5**'s native `every` if available.\n\
  // Aliased as `all`.\n\
  _.every = _.all = function(obj, iterator, context) {\n\
    var result = true;\n\
    if (obj == null) return result;\n\
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);\n\
    each(obj, function(value, index, list) {\n\
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;\n\
    });\n\
    return !!result;\n\
  };\n\
\n\
  // Determine if at least one element in the object matches a truth test.\n\
  // Delegates to **ECMAScript 5**'s native `some` if available.\n\
  // Aliased as `any`.\n\
  var any = _.some = _.any = function(obj, iterator, context) {\n\
    iterator || (iterator = _.identity);\n\
    var result = false;\n\
    if (obj == null) return result;\n\
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);\n\
    each(obj, function(value, index, list) {\n\
      if (result || (result = iterator.call(context, value, index, list))) return breaker;\n\
    });\n\
    return !!result;\n\
  };\n\
\n\
  // Determine if a given value is included in the array or object using `===`.\n\
  // Aliased as `contains`.\n\
  _.include = _.contains = function(obj, target) {\n\
    var found = false;\n\
    if (obj == null) return found;\n\
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;\n\
    found = any(obj, function(value) {\n\
      return value === target;\n\
    });\n\
    return found;\n\
  };\n\
\n\
  // Invoke a method (with arguments) on every item in a collection.\n\
  _.invoke = function(obj, method) {\n\
    var args = slice.call(arguments, 2);\n\
    return _.map(obj, function(value) {\n\
      return (_.isFunction(method) ? method : value[method]).apply(value, args);\n\
    });\n\
  };\n\
\n\
  // Convenience version of a common use case of `map`: fetching a property.\n\
  _.pluck = function(obj, key) {\n\
    return _.map(obj, function(value){ return value[key]; });\n\
  };\n\
\n\
  // Return the maximum element or (element-based computation).\n\
  // Can't optimize arrays of integers longer than 65,535 elements.\n\
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797\n\
  _.max = function(obj, iterator, context) {\n\
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {\n\
      return Math.max.apply(Math, obj);\n\
    }\n\
    if (!iterator && _.isEmpty(obj)) return -Infinity;\n\
    var result = {computed : -Infinity};\n\
    each(obj, function(value, index, list) {\n\
      var computed = iterator ? iterator.call(context, value, index, list) : value;\n\
      computed >= result.computed && (result = {value : value, computed : computed});\n\
    });\n\
    return result.value;\n\
  };\n\
\n\
  // Return the minimum element (or element-based computation).\n\
  _.min = function(obj, iterator, context) {\n\
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {\n\
      return Math.min.apply(Math, obj);\n\
    }\n\
    if (!iterator && _.isEmpty(obj)) return Infinity;\n\
    var result = {computed : Infinity};\n\
    each(obj, function(value, index, list) {\n\
      var computed = iterator ? iterator.call(context, value, index, list) : value;\n\
      computed < result.computed && (result = {value : value, computed : computed});\n\
    });\n\
    return result.value;\n\
  };\n\
\n\
  // Shuffle an array.\n\
  _.shuffle = function(obj) {\n\
    var rand;\n\
    var index = 0;\n\
    var shuffled = [];\n\
    each(obj, function(value) {\n\
      rand = Math.floor(Math.random() * ++index);\n\
      shuffled[index - 1] = shuffled[rand];\n\
      shuffled[rand] = value;\n\
    });\n\
    return shuffled;\n\
  };\n\
\n\
  // Sort the object's values by a criterion produced by an iterator.\n\
  _.sortBy = function(obj, val, context) {\n\
    var iterator = lookupIterator(obj, val);\n\
    return _.pluck(_.map(obj, function(value, index, list) {\n\
      return {\n\
        value : value,\n\
        criteria : iterator.call(context, value, index, list)\n\
      };\n\
    }).sort(function(left, right) {\n\
      var a = left.criteria, b = right.criteria;\n\
      if (a === void 0) return 1;\n\
      if (b === void 0) return -1;\n\
      return a < b ? -1 : a > b ? 1 : 0;\n\
    }), 'value');\n\
  };\n\
\n\
  // An internal function to generate lookup iterators.\n\
  var lookupIterator = function(obj, val) {\n\
    return _.isFunction(val) ? val : function(obj) { return obj[val]; };\n\
  };\n\
\n\
  // An internal function used for aggregate \"group by\" operations.\n\
  var group = function(obj, val, behavior) {\n\
    var result = {};\n\
    var iterator = lookupIterator(obj, val);\n\
    each(obj, function(value, index) {\n\
      var key = iterator(value, index);\n\
      behavior(result, key, value);\n\
    });\n\
    return result;\n\
  };\n\
\n\
  // Groups the object's values by a criterion. Pass either a string attribute\n\
  // to group by, or a function that returns the criterion.\n\
  _.groupBy = function(obj, val) {\n\
    return group(obj, val, function(result, key, value) {\n\
      (result[key] || (result[key] = [])).push(value);\n\
    });\n\
  };\n\
\n\
  // Counts instances of an object that group by a certain criterion. Pass\n\
  // either a string attribute to count by, or a function that returns the\n\
  // criterion.\n\
  _.countBy = function(obj, val) {\n\
    return group(obj, val, function(result, key, value) {\n\
      result[key] || (result[key] = 0);\n\
      result[key]++;\n\
    });\n\
  };\n\
\n\
  // Use a comparator function to figure out the smallest index at which\n\
  // an object should be inserted so as to maintain order. Uses binary search.\n\
  _.sortedIndex = function(array, obj, iterator) {\n\
    iterator || (iterator = _.identity);\n\
    var value = iterator(obj);\n\
    var low = 0, high = array.length;\n\
    while (low < high) {\n\
      var mid = (low + high) >> 1;\n\
      iterator(array[mid]) < value ? low = mid + 1 : high = mid;\n\
    }\n\
    return low;\n\
  };\n\
\n\
  // Safely convert anything iterable into a real, live array.\n\
  _.toArray = function(obj) {\n\
    if (!obj)                                     return [];\n\
    if (_.isArray(obj))                           return slice.call(obj);\n\
    if (_.isArguments(obj))                       return slice.call(obj);\n\
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();\n\
    return _.values(obj);\n\
  };\n\
\n\
  // Return the number of elements in an object.\n\
  _.size = function(obj) {\n\
    return _.isArray(obj) ? obj.length : _.keys(obj).length;\n\
  };\n\
\n\
  // Array Functions\n\
  // ---------------\n\
\n\
  // Get the first element of an array. Passing **n** will return the first N\n\
  // values in the array. Aliased as `head` and `take`. The **guard** check\n\
  // allows it to work with `_.map`.\n\
  _.first = _.head = _.take = function(array, n, guard) {\n\
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];\n\
  };\n\
\n\
  // Returns everything but the last entry of the array. Especially useful on\n\
  // the arguments object. Passing **n** will return all the values in\n\
  // the array, excluding the last N. The **guard** check allows it to work with\n\
  // `_.map`.\n\
  _.initial = function(array, n, guard) {\n\
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));\n\
  };\n\
\n\
  // Get the last element of an array. Passing **n** will return the last N\n\
  // values in the array. The **guard** check allows it to work with `_.map`.\n\
  _.last = function(array, n, guard) {\n\
    if ((n != null) && !guard) {\n\
      return slice.call(array, Math.max(array.length - n, 0));\n\
    } else {\n\
      return array[array.length - 1];\n\
    }\n\
  };\n\
\n\
  // Returns everything but the first entry of the array. Aliased as `tail`.\n\
  // Especially useful on the arguments object. Passing an **index** will return\n\
  // the rest of the values in the array from that index onward. The **guard**\n\
  // check allows it to work with `_.map`.\n\
  _.rest = _.tail = function(array, index, guard) {\n\
    return slice.call(array, (index == null) || guard ? 1 : index);\n\
  };\n\
\n\
  // Trim out all falsy values from an array.\n\
  _.compact = function(array) {\n\
    return _.filter(array, function(value){ return !!value; });\n\
  };\n\
\n\
  // Internal implementation of a recursive `flatten` function.\n\
  var flatten = function(input, shallow, output) {\n\
    each(input, function(value) {\n\
      if (_.isArray(value)) {\n\
        shallow ? push.apply(output, value) : flatten(value, shallow, output);\n\
      } else {\n\
        output.push(value);\n\
      }\n\
    });\n\
    return output;\n\
  };\n\
\n\
  // Return a completely flattened version of an array.\n\
  _.flatten = function(array, shallow) {\n\
    return flatten(array, shallow, []);\n\
  };\n\
\n\
  // Return a version of the array that does not contain the specified value(s).\n\
  _.without = function(array) {\n\
    return _.difference(array, slice.call(arguments, 1));\n\
  };\n\
\n\
  // Produce a duplicate-free version of the array. If the array has already\n\
  // been sorted, you have the option of using a faster algorithm.\n\
  // Aliased as `unique`.\n\
  _.uniq = _.unique = function(array, isSorted, iterator) {\n\
    var initial = iterator ? _.map(array, iterator) : array;\n\
    var results = [];\n\
    _.reduce(initial, function(memo, value, index) {\n\
      if (isSorted ? (_.last(memo) !== value || !memo.length) : !_.include(memo, value)) {\n\
        memo.push(value);\n\
        results.push(array[index]);\n\
      }\n\
      return memo;\n\
    }, []);\n\
    return results;\n\
  };\n\
\n\
  // Produce an array that contains the union: each distinct element from all of\n\
  // the passed-in arrays.\n\
  _.union = function() {\n\
    return _.uniq(flatten(arguments, true, []));\n\
  };\n\
\n\
  // Produce an array that contains every item shared between all the\n\
  // passed-in arrays.\n\
  _.intersection = function(array) {\n\
    var rest = slice.call(arguments, 1);\n\
    return _.filter(_.uniq(array), function(item) {\n\
      return _.every(rest, function(other) {\n\
        return _.indexOf(other, item) >= 0;\n\
      });\n\
    });\n\
  };\n\
\n\
  // Take the difference between one array and a number of other arrays.\n\
  // Only the elements present in just the first array will remain.\n\
  _.difference = function(array) {\n\
    var rest = flatten(slice.call(arguments, 1), true, []);\n\
    return _.filter(array, function(value){ return !_.include(rest, value); });\n\
  };\n\
\n\
  // Zip together multiple lists into a single array -- elements that share\n\
  // an index go together.\n\
  _.zip = function() {\n\
    var args = slice.call(arguments);\n\
    var length = _.max(_.pluck(args, 'length'));\n\
    var results = new Array(length);\n\
    for (var i = 0; i < length; i++) {\n\
      results[i] = _.pluck(args, \"\" + i);\n\
    }\n\
    return results;\n\
  };\n\
\n\
  // Zip together two arrays -- an array of keys and an array of values -- into\n\
  // a single object.\n\
  _.zipObject = function(keys, values) {\n\
    var result = {};\n\
    for (var i = 0, l = keys.length; i < l; i++) {\n\
      result[keys[i]] = values[i];\n\
    }\n\
    return result;\n\
  };\n\
\n\
  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),\n\
  // we need this function. Return the position of the first occurrence of an\n\
  // item in an array, or -1 if the item is not included in the array.\n\
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.\n\
  // If the array is large and already in sort order, pass `true`\n\
  // for **isSorted** to use binary search.\n\
  _.indexOf = function(array, item, isSorted) {\n\
    if (array == null) return -1;\n\
    var i, l;\n\
    if (isSorted) {\n\
      i = _.sortedIndex(array, item);\n\
      return array[i] === item ? i : -1;\n\
    }\n\
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);\n\
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;\n\
    return -1;\n\
  };\n\
\n\
  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.\n\
  _.lastIndexOf = function(array, item) {\n\
    if (array == null) return -1;\n\
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);\n\
    var i = array.length;\n\
    while (i--) if (array[i] === item) return i;\n\
    return -1;\n\
  };\n\
\n\
  // Generate an integer Array containing an arithmetic progression. A port of\n\
  // the native Python `range()` function. See\n\
  // [the Python documentation](http://docs.python.org/library/functions.html#range).\n\
  _.range = function(start, stop, step) {\n\
    if (arguments.length <= 1) {\n\
      stop = start || 0;\n\
      start = 0;\n\
    }\n\
    step = arguments[2] || 1;\n\
\n\
    var len = Math.max(Math.ceil((stop - start) / step), 0);\n\
    var idx = 0;\n\
    var range = new Array(len);\n\
\n\
    while(idx < len) {\n\
      range[idx++] = start;\n\
      start += step;\n\
    }\n\
\n\
    return range;\n\
  };\n\
\n\
  // Function (ahem) Functions\n\
  // ------------------\n\
\n\
  // Reusable constructor function for prototype setting.\n\
  var ctor = function(){};\n\
\n\
  // Create a function bound to a given object (assigning `this`, and arguments,\n\
  // optionally). Binding with arguments is also known as `curry`.\n\
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.\n\
  // We check for `func.bind` first, to fail fast when `func` is undefined.\n\
  _.bind = function bind(func, context) {\n\
    var bound, args;\n\
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));\n\
    if (!_.isFunction(func)) throw new TypeError;\n\
    args = slice.call(arguments, 2);\n\
    return bound = function() {\n\
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));\n\
      ctor.prototype = func.prototype;\n\
      var self = new ctor;\n\
      var result = func.apply(self, args.concat(slice.call(arguments)));\n\
      if (Object(result) === result) return result;\n\
      return self;\n\
    };\n\
  };\n\
\n\
  // Bind all of an object's methods to that object. Useful for ensuring that\n\
  // all callbacks defined on an object belong to it.\n\
  _.bindAll = function(obj) {\n\
    var funcs = slice.call(arguments, 1);\n\
    if (funcs.length == 0) funcs = _.functions(obj);\n\
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });\n\
    return obj;\n\
  };\n\
\n\
  // Memoize an expensive function by storing its results.\n\
  _.memoize = function(func, hasher) {\n\
    var memo = {};\n\
    hasher || (hasher = _.identity);\n\
    return function() {\n\
      var key = hasher.apply(this, arguments);\n\
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));\n\
    };\n\
  };\n\
\n\
  // Delays a function for the given number of milliseconds, and then calls\n\
  // it with the arguments supplied.\n\
  _.delay = function(func, wait) {\n\
    var args = slice.call(arguments, 2);\n\
    return setTimeout(function(){ return func.apply(null, args); }, wait);\n\
  };\n\
\n\
  // Defers a function, scheduling it to run after the current call stack has\n\
  // cleared.\n\
  _.defer = function(func) {\n\
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));\n\
  };\n\
\n\
  // Returns a function, that, when invoked, will only be triggered at most once\n\
  // during a given window of time.\n\
  _.throttle = function(func, wait) {\n\
    var context, args, timeout, throttling, more, result;\n\
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);\n\
    return function() {\n\
      context = this; args = arguments;\n\
      var later = function() {\n\
        timeout = null;\n\
        if (more) func.apply(context, args);\n\
        whenDone();\n\
      };\n\
      if (!timeout) timeout = setTimeout(later, wait);\n\
      if (throttling) {\n\
        more = true;\n\
      } else {\n\
        throttling = true;\n\
        result = func.apply(context, args);\n\
      }\n\
      whenDone();\n\
      return result;\n\
    };\n\
  };\n\
\n\
  // Returns a function, that, as long as it continues to be invoked, will not\n\
  // be triggered. The function will be called after it stops being called for\n\
  // N milliseconds. If `immediate` is passed, trigger the function on the\n\
  // leading edge, instead of the trailing.\n\
  _.debounce = function(func, wait, immediate) {\n\
    var timeout;\n\
    return function() {\n\
      var context = this, args = arguments;\n\
      var later = function() {\n\
        timeout = null;\n\
        if (!immediate) func.apply(context, args);\n\
      };\n\
      var callNow = immediate && !timeout;\n\
      clearTimeout(timeout);\n\
      timeout = setTimeout(later, wait);\n\
      if (callNow) func.apply(context, args);\n\
    };\n\
  };\n\
\n\
  // Returns a function that will be executed at most one time, no matter how\n\
  // often you call it. Useful for lazy initialization.\n\
  _.once = function(func) {\n\
    var ran = false, memo;\n\
    return function() {\n\
      if (ran) return memo;\n\
      ran = true;\n\
      return memo = func.apply(this, arguments);\n\
    };\n\
  };\n\
\n\
  // Returns the first function passed as an argument to the second,\n\
  // allowing you to adjust arguments, run code before and after, and\n\
  // conditionally execute the original function.\n\
  _.wrap = function(func, wrapper) {\n\
    return function() {\n\
      var args = [func].concat(slice.call(arguments, 0));\n\
      return wrapper.apply(this, args);\n\
    };\n\
  };\n\
\n\
  // Returns a function that is the composition of a list of functions, each\n\
  // consuming the return value of the function that follows.\n\
  _.compose = function() {\n\
    var funcs = arguments;\n\
    return function() {\n\
      var args = arguments;\n\
      for (var i = funcs.length - 1; i >= 0; i--) {\n\
        args = [funcs[i].apply(this, args)];\n\
      }\n\
      return args[0];\n\
    };\n\
  };\n\
\n\
  // Returns a function that will only be executed after being called N times.\n\
  _.after = function(times, func) {\n\
    if (times <= 0) return func();\n\
    return function() {\n\
      if (--times < 1) {\n\
        return func.apply(this, arguments);\n\
      }\n\
    };\n\
  };\n\
\n\
  // Object Functions\n\
  // ----------------\n\
\n\
  // Retrieve the names of an object's properties.\n\
  // Delegates to **ECMAScript 5**'s native `Object.keys`\n\
  _.keys = nativeKeys || function(obj) {\n\
    if (obj !== Object(obj)) throw new TypeError('Invalid object');\n\
    var keys = [];\n\
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;\n\
    return keys;\n\
  };\n\
\n\
  // Retrieve the values of an object's properties.\n\
  _.values = function(obj) {\n\
    return _.map(obj, _.identity);\n\
  };\n\
\n\
  // Return a sorted list of the function names available on the object.\n\
  // Aliased as `methods`\n\
  _.functions = _.methods = function(obj) {\n\
    var names = [];\n\
    for (var key in obj) {\n\
      if (_.isFunction(obj[key])) names.push(key);\n\
    }\n\
    return names.sort();\n\
  };\n\
\n\
  // Extend a given object with all the properties in passed-in object(s).\n\
  _.extend = function(obj) {\n\
    each(slice.call(arguments, 1), function(source) {\n\
      for (var prop in source) {\n\
        obj[prop] = source[prop];\n\
      }\n\
    });\n\
    return obj;\n\
  };\n\
\n\
  // Return a copy of the object only containing the whitelisted properties.\n\
  _.pick = function(obj) {\n\
    var result = {};\n\
    each(flatten(slice.call(arguments, 1), true, []), function(key) {\n\
      if (key in obj) result[key] = obj[key];\n\
    });\n\
    return result;\n\
  };\n\
\n\
  // Fill in a given object with default properties.\n\
  _.defaults = function(obj) {\n\
    each(slice.call(arguments, 1), function(source) {\n\
      for (var prop in source) {\n\
        if (obj[prop] == null) obj[prop] = source[prop];\n\
      }\n\
    });\n\
    return obj;\n\
  };\n\
\n\
  // Create a (shallow-cloned) duplicate of an object.\n\
  _.clone = function(obj) {\n\
    if (!_.isObject(obj)) return obj;\n\
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);\n\
  };\n\
\n\
  // Invokes interceptor with the obj, and then returns obj.\n\
  // The primary purpose of this method is to \"tap into\" a method chain, in\n\
  // order to perform operations on intermediate results within the chain.\n\
  _.tap = function(obj, interceptor) {\n\
    interceptor(obj);\n\
    return obj;\n\
  };\n\
\n\
  // Internal recursive comparison function for `isEqual`.\n\
  var eq = function(a, b, stack) {\n\
    // Identical objects are equal. `0 === -0`, but they aren't identical.\n\
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.\n\
    if (a === b) return a !== 0 || 1 / a == 1 / b;\n\
    // A strict comparison is necessary because `null == undefined`.\n\
    if (a == null || b == null) return a === b;\n\
    // Unwrap any wrapped objects.\n\
    if (a._chain) a = a._wrapped;\n\
    if (b._chain) b = b._wrapped;\n\
    // Invoke a custom `isEqual` method if one is provided.\n\
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);\n\
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);\n\
    // Compare `[[Class]]` names.\n\
    var className = toString.call(a);\n\
    if (className != toString.call(b)) return false;\n\
    switch (className) {\n\
      // Strings, numbers, dates, and booleans are compared by value.\n\
      case '[object String]':\n\
        // Primitives and their corresponding object wrappers are equivalent; thus, `\"5\"` is\n\
        // equivalent to `new String(\"5\")`.\n\
        return a == String(b);\n\
      case '[object Number]':\n\
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for\n\
        // other numeric values.\n\
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);\n\
      case '[object Date]':\n\
      case '[object Boolean]':\n\
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their\n\
        // millisecond representations. Note that invalid dates with millisecond representations\n\
        // of `NaN` are not equivalent.\n\
        return +a == +b;\n\
      // RegExps are compared by their source patterns and flags.\n\
      case '[object RegExp]':\n\
        return a.source == b.source &&\n\
               a.global == b.global &&\n\
               a.multiline == b.multiline &&\n\
               a.ignoreCase == b.ignoreCase;\n\
    }\n\
    if (typeof a != 'object' || typeof b != 'object') return false;\n\
    // Assume equality for cyclic structures. The algorithm for detecting cyclic\n\
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.\n\
    var length = stack.length;\n\
    while (length--) {\n\
      // Linear search. Performance is inversely proportional to the number of\n\
      // unique nested structures.\n\
      if (stack[length] == a) return true;\n\
    }\n\
    // Add the first object to the stack of traversed objects.\n\
    stack.push(a);\n\
    var size = 0, result = true;\n\
    // Recursively compare objects and arrays.\n\
    if (className == '[object Array]') {\n\
      // Compare array lengths to determine if a deep comparison is necessary.\n\
      size = a.length;\n\
      result = size == b.length;\n\
      if (result) {\n\
        // Deep compare the contents, ignoring non-numeric properties.\n\
        while (size--) {\n\
          // Ensure commutative equality for sparse arrays.\n\
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;\n\
        }\n\
      }\n\
    } else {\n\
      // Objects with different constructors are not equivalent.\n\
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;\n\
      // Deep compare objects.\n\
      for (var key in a) {\n\
        if (_.has(a, key)) {\n\
          // Count the expected number of properties.\n\
          size++;\n\
          // Deep compare each member.\n\
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;\n\
        }\n\
      }\n\
      // Ensure that both objects contain the same number of properties.\n\
      if (result) {\n\
        for (key in b) {\n\
          if (_.has(b, key) && !(size--)) break;\n\
        }\n\
        result = !size;\n\
      }\n\
    }\n\
    // Remove the first object from the stack of traversed objects.\n\
    stack.pop();\n\
    return result;\n\
  };\n\
\n\
  // Perform a deep comparison to check if two objects are equal.\n\
  _.isEqual = function(a, b) {\n\
    return eq(a, b, []);\n\
  };\n\
\n\
  // Is a given array, string, or object empty?\n\
  // An \"empty\" object has no enumerable own-properties.\n\
  _.isEmpty = function(obj) {\n\
    if (obj == null) return true;\n\
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;\n\
    for (var key in obj) if (_.has(obj, key)) return false;\n\
    return true;\n\
  };\n\
\n\
  // Is a given value a DOM element?\n\
  _.isElement = function(obj) {\n\
    return !!(obj && obj.nodeType == 1);\n\
  };\n\
\n\
  // Is a given value an array?\n\
  // Delegates to ECMA5's native Array.isArray\n\
  _.isArray = nativeIsArray || function(obj) {\n\
    return toString.call(obj) == '[object Array]';\n\
  };\n\
\n\
  // Is a given variable an object?\n\
  _.isObject = function(obj) {\n\
    return obj === Object(obj);\n\
  };\n\
\n\
  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.\n\
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {\n\
    _['is' + name] = function(obj) {\n\
      return toString.call(obj) == '[object ' + name + ']';\n\
    };\n\
  });\n\
\n\
  // Define a fallback version of the method in browsers (ahem, IE), where\n\
  // there isn't any inspectable \"Arguments\" type.\n\
  if (!_.isArguments(arguments)) {\n\
    _.isArguments = function(obj) {\n\
      return !!(obj && _.has(obj, 'callee'));\n\
    };\n\
  }\n\
\n\
  // Is a given object a finite number?\n\
  _.isFinite = function(obj) {\n\
    return _.isNumber(obj) && isFinite(obj);\n\
  };\n\
\n\
  // Is the given value `NaN`?\n\
  _.isNaN = function(obj) {\n\
    // `NaN` is the only value for which `===` is not reflexive.\n\
    return obj !== obj;\n\
  };\n\
\n\
  // Is a given value a boolean?\n\
  _.isBoolean = function(obj) {\n\
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';\n\
  };\n\
\n\
  // Is a given value equal to null?\n\
  _.isNull = function(obj) {\n\
    return obj === null;\n\
  };\n\
\n\
  // Is a given variable undefined?\n\
  _.isUndefined = function(obj) {\n\
    return obj === void 0;\n\
  };\n\
\n\
  // Shortcut function for checking if an object has a given property directly\n\
  // on itself (in other words, not on a prototype).\n\
  _.has = function(obj, key) {\n\
    return hasOwnProperty.call(obj, key);\n\
  };\n\
\n\
  // Utility Functions\n\
  // -----------------\n\
\n\
  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its\n\
  // previous owner. Returns a reference to the Underscore object.\n\
  _.noConflict = function() {\n\
    root._ = previousUnderscore;\n\
    return this;\n\
  };\n\
\n\
  // Keep the identity function around for default iterators.\n\
  _.identity = function(value) {\n\
    return value;\n\
  };\n\
\n\
  // Run a function **n** times.\n\
  _.times = function(n, iterator, context) {\n\
    for (var i = 0; i < n; i++) iterator.call(context, i);\n\
  };\n\
\n\
  // List of HTML entities for escaping.\n\
  var htmlEscapes = {\n\
    '&': '&amp;',\n\
    '<': '&lt;',\n\
    '>': '&gt;',\n\
    '\"': '&quot;',\n\
    \"'\": '&#x27;',\n\
    '/': '&#x2F;'\n\
  };\n\
\n\
  // Regex containing the keys listed immediately above.\n\
  var htmlEscaper = /[&<>\"'\\/]/g;\n\
\n\
  // Escape a string for HTML interpolation.\n\
  _.escape = function(string) {\n\
    return ('' + string).replace(htmlEscaper, function(match) {\n\
      return htmlEscapes[match];\n\
    });\n\
  };\n\
\n\
  // If the value of the named property is a function then invoke it;\n\
  // otherwise, return it.\n\
  _.result = function(object, property) {\n\
    if (object == null) return null;\n\
    var value = object[property];\n\
    return _.isFunction(value) ? value.call(object) : value;\n\
  };\n\
\n\
  // Add your own custom functions to the Underscore object, ensuring that\n\
  // they're correctly added to the OOP wrapper as well.\n\
  _.mixin = function(obj) {\n\
    each(_.functions(obj), function(name){\n\
      addToWrapper(name, _[name] = obj[name]);\n\
    });\n\
  };\n\
\n\
  // Generate a unique integer id (unique within the entire client session).\n\
  // Useful for temporary DOM ids.\n\
  var idCounter = 0;\n\
  _.uniqueId = function(prefix) {\n\
    var id = idCounter++;\n\
    return prefix ? prefix + id : id;\n\
  };\n\
\n\
  // By default, Underscore uses ERB-style template delimiters, change the\n\
  // following template settings to use alternative delimiters.\n\
  _.templateSettings = {\n\
    evaluate    : /<%([\\s\\S]+?)%>/g,\n\
    interpolate : /<%=([\\s\\S]+?)%>/g,\n\
    escape      : /<%-([\\s\\S]+?)%>/g\n\
  };\n\
\n\
  // When customizing `templateSettings`, if you don't want to define an\n\
  // interpolation, evaluation or escaping regex, we need one that is\n\
  // guaranteed not to match.\n\
  var noMatch = /.^/;\n\
\n\
  // Certain characters need to be escaped so that they can be put into a\n\
  // string literal.\n\
  var escapes = {\n\
    '\\\\':   '\\\\',\n\
    \"'\":    \"'\",\n\
    r:      '\\r',\n\
    n:      '\\n\
',\n\
    t:      '\\t',\n\
    u2028:  '\\u2028',\n\
    u2029:  '\\u2029'\n\
  };\n\
\n\
  for (var key in escapes) escapes[escapes[key]] = key;\n\
  var escaper = /\\\\|'|\\r|\\n\
|\\t|\\u2028|\\u2029/g;\n\
  var unescaper = /\\\\(\\\\|'|r|n|t|u2028|u2029)/g;\n\
\n\
  // Within an interpolation, evaluation, or escaping, remove HTML escaping\n\
  // that had been previously added.\n\
  var unescape = function(code) {\n\
    return code.replace(unescaper, function(match, escape) {\n\
      return escapes[escape];\n\
    });\n\
  };\n\
\n\
  // JavaScript micro-templating, similar to John Resig's implementation.\n\
  // Underscore templating handles arbitrary delimiters, preserves whitespace,\n\
  // and correctly escapes quotes within interpolated code.\n\
  _.template = function(text, data, settings) {\n\
    settings = _.defaults(settings || {}, _.templateSettings);\n\
\n\
    // Compile the template source, taking care to escape characters that\n\
    // cannot be included in a string literal and then unescape them in code\n\
    // blocks.\n\
    var source = \"__p+='\" + text\n\
      .replace(escaper, function(match) {\n\
        return '\\\\' + escapes[match];\n\
      })\n\
      .replace(settings.escape || noMatch, function(match, code) {\n\
        return \"'+\\n\
((__t=(\" + unescape(code) + \"))==null?'':_.escape(__t))+\\n\
'\";\n\
      })\n\
      .replace(settings.interpolate || noMatch, function(match, code) {\n\
        return \"'+\\n\
((__t=(\" + unescape(code) + \"))==null?'':__t)+\\n\
'\";\n\
      })\n\
      .replace(settings.evaluate || noMatch, function(match, code) {\n\
        return \"';\\n\
\" + unescape(code) + \"\\n\
__p+='\";\n\
      }) + \"';\\n\
\";\n\
\n\
    // If a variable is not specified, place data values in local scope.\n\
    if (!settings.variable) source = 'with(obj||{}){\\n\
' + source + '}\\n\
';\n\
\n\
    source = \"var __t,__p='',__j=Array.prototype.join,\" +\n\
      \"print=function(){__p+=__j.call(arguments,'')};\\n\
\" +\n\
      source + \"return __p;\\n\
\";\n\
\n\
    var render = new Function(settings.variable || 'obj', '_', source);\n\
    if (data) return render(data, _);\n\
    var template = function(data) {\n\
      return render.call(this, data, _);\n\
    };\n\
\n\
    // Provide the compiled function source as a convenience for precompilation.\n\
    template.source = 'function(' + (settings.variable || 'obj') + '){\\n\
' + source + '}';\n\
\n\
    return template;\n\
  };\n\
\n\
  // Add a \"chain\" function, which will delegate to the wrapper.\n\
  _.chain = function(obj) {\n\
    return _(obj).chain();\n\
  };\n\
\n\
  // The OOP Wrapper\n\
  // ---------------\n\
\n\
  // If Underscore is called as a function, it returns a wrapped object that\n\
  // can be used OO-style. This wrapper holds altered versions of all the\n\
  // underscore functions. Wrapped objects may be chained.\n\
  var wrapper = function(obj) { this._wrapped = obj; };\n\
\n\
  // Expose `wrapper.prototype` as `_.prototype`\n\
  _.prototype = wrapper.prototype;\n\
\n\
  // Helper function to continue chaining intermediate results.\n\
  var result = function(obj, chain) {\n\
    return chain ? _(obj).chain() : obj;\n\
  };\n\
\n\
  // A method to easily add functions to the OOP wrapper.\n\
  var addToWrapper = function(name, func) {\n\
    wrapper.prototype[name] = function() {\n\
      var args = slice.call(arguments);\n\
      unshift.call(args, this._wrapped);\n\
      return result(func.apply(_, args), this._chain);\n\
    };\n\
  };\n\
\n\
  // Add all of the Underscore functions to the wrapper object.\n\
  _.mixin(_);\n\
\n\
  // Add all mutator Array functions to the wrapper.\n\
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {\n\
    var method = ArrayProto[name];\n\
    wrapper.prototype[name] = function() {\n\
      var obj = this._wrapped;\n\
      method.apply(obj, arguments);\n\
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];\n\
      return result(obj, this._chain);\n\
    };\n\
  });\n\
\n\
  // Add all accessor Array functions to the wrapper.\n\
  each(['concat', 'join', 'slice'], function(name) {\n\
    var method = ArrayProto[name];\n\
    wrapper.prototype[name] = function() {\n\
      return result(method.apply(this._wrapped, arguments), this._chain);\n\
    };\n\
  });\n\
\n\
  // Start chaining a wrapped Underscore object.\n\
  wrapper.prototype.chain = function() {\n\
    this._chain = true;\n\
    return this;\n\
  };\n\
\n\
  // Extracts the result from a wrapped and chained object.\n\
  wrapper.prototype.value = function() {\n\
    return this._wrapped;\n\
  };\n\
\n\
}).call(this);\n\
//@ sourceURL=component-underscore/index.js"
));
require.register("noflo-fbp/lib/fbp.js", Function("exports, require, module",
"module.exports = (function(){\n\
  /*\n\
   * Generated by PEG.js 0.7.0.\n\
   *\n\
   * http://pegjs.majda.cz/\n\
   */\n\
  \n\
  function quote(s) {\n\
    /*\n\
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a\n\
     * string literal except for the closing quote character, backslash,\n\
     * carriage return, line separator, paragraph separator, and line feed.\n\
     * Any character may appear in the form of an escape sequence.\n\
     *\n\
     * For portability, we also escape escape all control and non-ASCII\n\
     * characters. Note that \"\\0\" and \"\\v\" escape sequences are not used\n\
     * because JSHint does not like the first and IE the second.\n\
     */\n\
     return '\"' + s\n\
      .replace(/\\\\/g, '\\\\\\\\')  // backslash\n\
      .replace(/\"/g, '\\\\\"')    // closing quote character\n\
      .replace(/\\x08/g, '\\\\b') // backspace\n\
      .replace(/\\t/g, '\\\\t')   // horizontal tab\n\
      .replace(/\\n\
/g, '\\\\n\
')   // line feed\n\
      .replace(/\\f/g, '\\\\f')   // form feed\n\
      .replace(/\\r/g, '\\\\r')   // carriage return\n\
      .replace(/[\\x00-\\x07\\x0B\\x0E-\\x1F\\x80-\\uFFFF]/g, escape)\n\
      + '\"';\n\
  }\n\
  \n\
  var result = {\n\
    /*\n\
     * Parses the input with a generated parser. If the parsing is successfull,\n\
     * returns a value explicitly or implicitly specified by the grammar from\n\
     * which the parser was generated (see |PEG.buildParser|). If the parsing is\n\
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.\n\
     */\n\
    parse: function(input, startRule) {\n\
      var parseFunctions = {\n\
        \"start\": parse_start,\n\
        \"line\": parse_line,\n\
        \"LineTerminator\": parse_LineTerminator,\n\
        \"comment\": parse_comment,\n\
        \"connection\": parse_connection,\n\
        \"bridge\": parse_bridge,\n\
        \"leftlet\": parse_leftlet,\n\
        \"iip\": parse_iip,\n\
        \"rightlet\": parse_rightlet,\n\
        \"node\": parse_node,\n\
        \"component\": parse_component,\n\
        \"compMeta\": parse_compMeta,\n\
        \"port\": parse_port,\n\
        \"anychar\": parse_anychar,\n\
        \"iipchar\": parse_iipchar,\n\
        \"_\": parse__,\n\
        \"__\": parse___\n\
      };\n\
      \n\
      if (startRule !== undefined) {\n\
        if (parseFunctions[startRule] === undefined) {\n\
          throw new Error(\"Invalid rule name: \" + quote(startRule) + \".\");\n\
        }\n\
      } else {\n\
        startRule = \"start\";\n\
      }\n\
      \n\
      var pos = 0;\n\
      var reportFailures = 0;\n\
      var rightmostFailuresPos = 0;\n\
      var rightmostFailuresExpected = [];\n\
      \n\
      function padLeft(input, padding, length) {\n\
        var result = input;\n\
        \n\
        var padLength = length - input.length;\n\
        for (var i = 0; i < padLength; i++) {\n\
          result = padding + result;\n\
        }\n\
        \n\
        return result;\n\
      }\n\
      \n\
      function escape(ch) {\n\
        var charCode = ch.charCodeAt(0);\n\
        var escapeChar;\n\
        var length;\n\
        \n\
        if (charCode <= 0xFF) {\n\
          escapeChar = 'x';\n\
          length = 2;\n\
        } else {\n\
          escapeChar = 'u';\n\
          length = 4;\n\
        }\n\
        \n\
        return '\\\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);\n\
      }\n\
      \n\
      function matchFailed(failure) {\n\
        if (pos < rightmostFailuresPos) {\n\
          return;\n\
        }\n\
        \n\
        if (pos > rightmostFailuresPos) {\n\
          rightmostFailuresPos = pos;\n\
          rightmostFailuresExpected = [];\n\
        }\n\
        \n\
        rightmostFailuresExpected.push(failure);\n\
      }\n\
      \n\
      function parse_start() {\n\
        var result0, result1;\n\
        var pos0;\n\
        \n\
        pos0 = pos;\n\
        result0 = [];\n\
        result1 = parse_line();\n\
        while (result1 !== null) {\n\
          result0.push(result1);\n\
          result1 = parse_line();\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset) { return parser.getResult();  })(pos0);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_line() {\n\
        var result0, result1, result2, result3, result4, result5, result6;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        result0 = parse__();\n\
        if (result0 !== null) {\n\
          if (input.substr(pos, 7) === \"EXPORT=\") {\n\
            result1 = \"EXPORT=\";\n\
            pos += 7;\n\
          } else {\n\
            result1 = null;\n\
            if (reportFailures === 0) {\n\
              matchFailed(\"\\\"EXPORT=\\\"\");\n\
            }\n\
          }\n\
          if (result1 !== null) {\n\
            if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {\n\
              result3 = input.charAt(pos);\n\
              pos++;\n\
            } else {\n\
              result3 = null;\n\
              if (reportFailures === 0) {\n\
                matchFailed(\"[A-Z.0-9_]\");\n\
              }\n\
            }\n\
            if (result3 !== null) {\n\
              result2 = [];\n\
              while (result3 !== null) {\n\
                result2.push(result3);\n\
                if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {\n\
                  result3 = input.charAt(pos);\n\
                  pos++;\n\
                } else {\n\
                  result3 = null;\n\
                  if (reportFailures === 0) {\n\
                    matchFailed(\"[A-Z.0-9_]\");\n\
                  }\n\
                }\n\
              }\n\
            } else {\n\
              result2 = null;\n\
            }\n\
            if (result2 !== null) {\n\
              if (input.charCodeAt(pos) === 58) {\n\
                result3 = \":\";\n\
                pos++;\n\
              } else {\n\
                result3 = null;\n\
                if (reportFailures === 0) {\n\
                  matchFailed(\"\\\":\\\"\");\n\
                }\n\
              }\n\
              if (result3 !== null) {\n\
                if (/^[A-Z0-9_]/.test(input.charAt(pos))) {\n\
                  result5 = input.charAt(pos);\n\
                  pos++;\n\
                } else {\n\
                  result5 = null;\n\
                  if (reportFailures === 0) {\n\
                    matchFailed(\"[A-Z0-9_]\");\n\
                  }\n\
                }\n\
                if (result5 !== null) {\n\
                  result4 = [];\n\
                  while (result5 !== null) {\n\
                    result4.push(result5);\n\
                    if (/^[A-Z0-9_]/.test(input.charAt(pos))) {\n\
                      result5 = input.charAt(pos);\n\
                      pos++;\n\
                    } else {\n\
                      result5 = null;\n\
                      if (reportFailures === 0) {\n\
                        matchFailed(\"[A-Z0-9_]\");\n\
                      }\n\
                    }\n\
                  }\n\
                } else {\n\
                  result4 = null;\n\
                }\n\
                if (result4 !== null) {\n\
                  result5 = parse__();\n\
                  if (result5 !== null) {\n\
                    result6 = parse_LineTerminator();\n\
                    result6 = result6 !== null ? result6 : \"\";\n\
                    if (result6 !== null) {\n\
                      result0 = [result0, result1, result2, result3, result4, result5, result6];\n\
                    } else {\n\
                      result0 = null;\n\
                      pos = pos1;\n\
                    }\n\
                  } else {\n\
                    result0 = null;\n\
                    pos = pos1;\n\
                  }\n\
                } else {\n\
                  result0 = null;\n\
                  pos = pos1;\n\
                }\n\
              } else {\n\
                result0 = null;\n\
                pos = pos1;\n\
              }\n\
            } else {\n\
              result0 = null;\n\
              pos = pos1;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, priv, pub) {return parser.registerExports(priv.join(\"\"),pub.join(\"\"))})(pos0, result0[2], result0[4]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        if (result0 === null) {\n\
          pos0 = pos;\n\
          result0 = parse_comment();\n\
          if (result0 !== null) {\n\
            if (/^[\\n\
\\r\\u2028\\u2029]/.test(input.charAt(pos))) {\n\
              result1 = input.charAt(pos);\n\
              pos++;\n\
            } else {\n\
              result1 = null;\n\
              if (reportFailures === 0) {\n\
                matchFailed(\"[\\\\n\
\\\\r\\\\u2028\\\\u2029]\");\n\
              }\n\
            }\n\
            result1 = result1 !== null ? result1 : \"\";\n\
            if (result1 !== null) {\n\
              result0 = [result0, result1];\n\
            } else {\n\
              result0 = null;\n\
              pos = pos0;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos0;\n\
          }\n\
          if (result0 === null) {\n\
            pos0 = pos;\n\
            result0 = parse__();\n\
            if (result0 !== null) {\n\
              if (/^[\\n\
\\r\\u2028\\u2029]/.test(input.charAt(pos))) {\n\
                result1 = input.charAt(pos);\n\
                pos++;\n\
              } else {\n\
                result1 = null;\n\
                if (reportFailures === 0) {\n\
                  matchFailed(\"[\\\\n\
\\\\r\\\\u2028\\\\u2029]\");\n\
                }\n\
              }\n\
              if (result1 !== null) {\n\
                result0 = [result0, result1];\n\
              } else {\n\
                result0 = null;\n\
                pos = pos0;\n\
              }\n\
            } else {\n\
              result0 = null;\n\
              pos = pos0;\n\
            }\n\
            if (result0 === null) {\n\
              pos0 = pos;\n\
              pos1 = pos;\n\
              result0 = parse__();\n\
              if (result0 !== null) {\n\
                result1 = parse_connection();\n\
                if (result1 !== null) {\n\
                  result2 = parse__();\n\
                  if (result2 !== null) {\n\
                    result3 = parse_LineTerminator();\n\
                    result3 = result3 !== null ? result3 : \"\";\n\
                    if (result3 !== null) {\n\
                      result0 = [result0, result1, result2, result3];\n\
                    } else {\n\
                      result0 = null;\n\
                      pos = pos1;\n\
                    }\n\
                  } else {\n\
                    result0 = null;\n\
                    pos = pos1;\n\
                  }\n\
                } else {\n\
                  result0 = null;\n\
                  pos = pos1;\n\
                }\n\
              } else {\n\
                result0 = null;\n\
                pos = pos1;\n\
              }\n\
              if (result0 !== null) {\n\
                result0 = (function(offset, edges) {return parser.registerEdges(edges);})(pos0, result0[1]);\n\
              }\n\
              if (result0 === null) {\n\
                pos = pos0;\n\
              }\n\
            }\n\
          }\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_LineTerminator() {\n\
        var result0, result1, result2, result3;\n\
        var pos0;\n\
        \n\
        pos0 = pos;\n\
        result0 = parse__();\n\
        if (result0 !== null) {\n\
          if (input.charCodeAt(pos) === 44) {\n\
            result1 = \",\";\n\
            pos++;\n\
          } else {\n\
            result1 = null;\n\
            if (reportFailures === 0) {\n\
              matchFailed(\"\\\",\\\"\");\n\
            }\n\
          }\n\
          result1 = result1 !== null ? result1 : \"\";\n\
          if (result1 !== null) {\n\
            result2 = parse_comment();\n\
            result2 = result2 !== null ? result2 : \"\";\n\
            if (result2 !== null) {\n\
              if (/^[\\n\
\\r\\u2028\\u2029]/.test(input.charAt(pos))) {\n\
                result3 = input.charAt(pos);\n\
                pos++;\n\
              } else {\n\
                result3 = null;\n\
                if (reportFailures === 0) {\n\
                  matchFailed(\"[\\\\n\
\\\\r\\\\u2028\\\\u2029]\");\n\
                }\n\
              }\n\
              result3 = result3 !== null ? result3 : \"\";\n\
              if (result3 !== null) {\n\
                result0 = [result0, result1, result2, result3];\n\
              } else {\n\
                result0 = null;\n\
                pos = pos0;\n\
              }\n\
            } else {\n\
              result0 = null;\n\
              pos = pos0;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos0;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_comment() {\n\
        var result0, result1, result2, result3;\n\
        var pos0;\n\
        \n\
        pos0 = pos;\n\
        result0 = parse__();\n\
        if (result0 !== null) {\n\
          if (input.charCodeAt(pos) === 35) {\n\
            result1 = \"#\";\n\
            pos++;\n\
          } else {\n\
            result1 = null;\n\
            if (reportFailures === 0) {\n\
              matchFailed(\"\\\"#\\\"\");\n\
            }\n\
          }\n\
          if (result1 !== null) {\n\
            result2 = [];\n\
            result3 = parse_anychar();\n\
            while (result3 !== null) {\n\
              result2.push(result3);\n\
              result3 = parse_anychar();\n\
            }\n\
            if (result2 !== null) {\n\
              result0 = [result0, result1, result2];\n\
            } else {\n\
              result0 = null;\n\
              pos = pos0;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos0;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_connection() {\n\
        var result0, result1, result2, result3, result4;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        result0 = parse_bridge();\n\
        if (result0 !== null) {\n\
          result1 = parse__();\n\
          if (result1 !== null) {\n\
            if (input.substr(pos, 2) === \"->\") {\n\
              result2 = \"->\";\n\
              pos += 2;\n\
            } else {\n\
              result2 = null;\n\
              if (reportFailures === 0) {\n\
                matchFailed(\"\\\"->\\\"\");\n\
              }\n\
            }\n\
            if (result2 !== null) {\n\
              result3 = parse__();\n\
              if (result3 !== null) {\n\
                result4 = parse_connection();\n\
                if (result4 !== null) {\n\
                  result0 = [result0, result1, result2, result3, result4];\n\
                } else {\n\
                  result0 = null;\n\
                  pos = pos1;\n\
                }\n\
              } else {\n\
                result0 = null;\n\
                pos = pos1;\n\
              }\n\
            } else {\n\
              result0 = null;\n\
              pos = pos1;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, x, y) { return [x,y]; })(pos0, result0[0], result0[4]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        if (result0 === null) {\n\
          result0 = parse_bridge();\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_bridge() {\n\
        var result0, result1, result2, result3, result4;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        result0 = parse_port();\n\
        if (result0 !== null) {\n\
          result1 = parse__();\n\
          if (result1 !== null) {\n\
            result2 = parse_node();\n\
            if (result2 !== null) {\n\
              result3 = parse__();\n\
              if (result3 !== null) {\n\
                result4 = parse_port();\n\
                if (result4 !== null) {\n\
                  result0 = [result0, result1, result2, result3, result4];\n\
                } else {\n\
                  result0 = null;\n\
                  pos = pos1;\n\
                }\n\
              } else {\n\
                result0 = null;\n\
                pos = pos1;\n\
              }\n\
            } else {\n\
              result0 = null;\n\
              pos = pos1;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, x, proc, y) { return [{\"tgt\":{process:proc, port:x}},{\"src\":{process:proc, port:y}}]; })(pos0, result0[0], result0[2], result0[4]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        if (result0 === null) {\n\
          result0 = parse_iip();\n\
          if (result0 === null) {\n\
            result0 = parse_rightlet();\n\
            if (result0 === null) {\n\
              result0 = parse_leftlet();\n\
            }\n\
          }\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_leftlet() {\n\
        var result0, result1, result2;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        result0 = parse_node();\n\
        if (result0 !== null) {\n\
          result1 = parse__();\n\
          if (result1 !== null) {\n\
            result2 = parse_port();\n\
            if (result2 !== null) {\n\
              result0 = [result0, result1, result2];\n\
            } else {\n\
              result0 = null;\n\
              pos = pos1;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, proc, port) { return {\"src\":{process:proc, port:port}} })(pos0, result0[0], result0[2]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_iip() {\n\
        var result0, result1, result2;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        if (input.charCodeAt(pos) === 39) {\n\
          result0 = \"'\";\n\
          pos++;\n\
        } else {\n\
          result0 = null;\n\
          if (reportFailures === 0) {\n\
            matchFailed(\"\\\"'\\\"\");\n\
          }\n\
        }\n\
        if (result0 !== null) {\n\
          result1 = [];\n\
          result2 = parse_iipchar();\n\
          while (result2 !== null) {\n\
            result1.push(result2);\n\
            result2 = parse_iipchar();\n\
          }\n\
          if (result1 !== null) {\n\
            if (input.charCodeAt(pos) === 39) {\n\
              result2 = \"'\";\n\
              pos++;\n\
            } else {\n\
              result2 = null;\n\
              if (reportFailures === 0) {\n\
                matchFailed(\"\\\"'\\\"\");\n\
              }\n\
            }\n\
            if (result2 !== null) {\n\
              result0 = [result0, result1, result2];\n\
            } else {\n\
              result0 = null;\n\
              pos = pos1;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, iip) { return {\"data\":iip.join(\"\")} })(pos0, result0[1]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_rightlet() {\n\
        var result0, result1, result2;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        result0 = parse_port();\n\
        if (result0 !== null) {\n\
          result1 = parse__();\n\
          if (result1 !== null) {\n\
            result2 = parse_node();\n\
            if (result2 !== null) {\n\
              result0 = [result0, result1, result2];\n\
            } else {\n\
              result0 = null;\n\
              pos = pos1;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, port, proc) { return {\"tgt\":{process:proc, port:port}} })(pos0, result0[0], result0[2]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_node() {\n\
        var result0, result1;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        if (/^[a-zA-Z0-9_]/.test(input.charAt(pos))) {\n\
          result1 = input.charAt(pos);\n\
          pos++;\n\
        } else {\n\
          result1 = null;\n\
          if (reportFailures === 0) {\n\
            matchFailed(\"[a-zA-Z0-9_]\");\n\
          }\n\
        }\n\
        if (result1 !== null) {\n\
          result0 = [];\n\
          while (result1 !== null) {\n\
            result0.push(result1);\n\
            if (/^[a-zA-Z0-9_]/.test(input.charAt(pos))) {\n\
              result1 = input.charAt(pos);\n\
              pos++;\n\
            } else {\n\
              result1 = null;\n\
              if (reportFailures === 0) {\n\
                matchFailed(\"[a-zA-Z0-9_]\");\n\
              }\n\
            }\n\
          }\n\
        } else {\n\
          result0 = null;\n\
        }\n\
        if (result0 !== null) {\n\
          result1 = parse_component();\n\
          result1 = result1 !== null ? result1 : \"\";\n\
          if (result1 !== null) {\n\
            result0 = [result0, result1];\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, node, comp) { if(comp){parser.addNode(node.join(\"\"),comp);}; return node.join(\"\")})(pos0, result0[0], result0[1]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_component() {\n\
        var result0, result1, result2, result3;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        if (input.charCodeAt(pos) === 40) {\n\
          result0 = \"(\";\n\
          pos++;\n\
        } else {\n\
          result0 = null;\n\
          if (reportFailures === 0) {\n\
            matchFailed(\"\\\"(\\\"\");\n\
          }\n\
        }\n\
        if (result0 !== null) {\n\
          if (/^[a-zA-Z\\/\\-0-9_]/.test(input.charAt(pos))) {\n\
            result2 = input.charAt(pos);\n\
            pos++;\n\
          } else {\n\
            result2 = null;\n\
            if (reportFailures === 0) {\n\
              matchFailed(\"[a-zA-Z\\\\/\\\\-0-9_]\");\n\
            }\n\
          }\n\
          if (result2 !== null) {\n\
            result1 = [];\n\
            while (result2 !== null) {\n\
              result1.push(result2);\n\
              if (/^[a-zA-Z\\/\\-0-9_]/.test(input.charAt(pos))) {\n\
                result2 = input.charAt(pos);\n\
                pos++;\n\
              } else {\n\
                result2 = null;\n\
                if (reportFailures === 0) {\n\
                  matchFailed(\"[a-zA-Z\\\\/\\\\-0-9_]\");\n\
                }\n\
              }\n\
            }\n\
          } else {\n\
            result1 = null;\n\
          }\n\
          result1 = result1 !== null ? result1 : \"\";\n\
          if (result1 !== null) {\n\
            result2 = parse_compMeta();\n\
            result2 = result2 !== null ? result2 : \"\";\n\
            if (result2 !== null) {\n\
              if (input.charCodeAt(pos) === 41) {\n\
                result3 = \")\";\n\
                pos++;\n\
              } else {\n\
                result3 = null;\n\
                if (reportFailures === 0) {\n\
                  matchFailed(\"\\\")\\\"\");\n\
                }\n\
              }\n\
              if (result3 !== null) {\n\
                result0 = [result0, result1, result2, result3];\n\
              } else {\n\
                result0 = null;\n\
                pos = pos1;\n\
              }\n\
            } else {\n\
              result0 = null;\n\
              pos = pos1;\n\
            }\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, comp, meta) { var o = {}; comp ? o.comp = comp.join(\"\") : o.comp = ''; meta ? o.meta = meta.join(\"\").split(',') : null; return o; })(pos0, result0[1], result0[2]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_compMeta() {\n\
        var result0, result1, result2;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        if (input.charCodeAt(pos) === 58) {\n\
          result0 = \":\";\n\
          pos++;\n\
        } else {\n\
          result0 = null;\n\
          if (reportFailures === 0) {\n\
            matchFailed(\"\\\":\\\"\");\n\
          }\n\
        }\n\
        if (result0 !== null) {\n\
          if (/^[a-zA-Z\\/]/.test(input.charAt(pos))) {\n\
            result2 = input.charAt(pos);\n\
            pos++;\n\
          } else {\n\
            result2 = null;\n\
            if (reportFailures === 0) {\n\
              matchFailed(\"[a-zA-Z\\\\/]\");\n\
            }\n\
          }\n\
          if (result2 !== null) {\n\
            result1 = [];\n\
            while (result2 !== null) {\n\
              result1.push(result2);\n\
              if (/^[a-zA-Z\\/]/.test(input.charAt(pos))) {\n\
                result2 = input.charAt(pos);\n\
                pos++;\n\
              } else {\n\
                result2 = null;\n\
                if (reportFailures === 0) {\n\
                  matchFailed(\"[a-zA-Z\\\\/]\");\n\
                }\n\
              }\n\
            }\n\
          } else {\n\
            result1 = null;\n\
          }\n\
          if (result1 !== null) {\n\
            result0 = [result0, result1];\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, meta) {return meta})(pos0, result0[1]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_port() {\n\
        var result0, result1;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {\n\
          result1 = input.charAt(pos);\n\
          pos++;\n\
        } else {\n\
          result1 = null;\n\
          if (reportFailures === 0) {\n\
            matchFailed(\"[A-Z.0-9_]\");\n\
          }\n\
        }\n\
        if (result1 !== null) {\n\
          result0 = [];\n\
          while (result1 !== null) {\n\
            result0.push(result1);\n\
            if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {\n\
              result1 = input.charAt(pos);\n\
              pos++;\n\
            } else {\n\
              result1 = null;\n\
              if (reportFailures === 0) {\n\
                matchFailed(\"[A-Z.0-9_]\");\n\
              }\n\
            }\n\
          }\n\
        } else {\n\
          result0 = null;\n\
        }\n\
        if (result0 !== null) {\n\
          result1 = parse___();\n\
          if (result1 !== null) {\n\
            result0 = [result0, result1];\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset, portname) {return portname.join(\"\").toLowerCase()})(pos0, result0[0]);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_anychar() {\n\
        var result0;\n\
        \n\
        if (/^[^\\n\
\\r\\u2028\\u2029]/.test(input.charAt(pos))) {\n\
          result0 = input.charAt(pos);\n\
          pos++;\n\
        } else {\n\
          result0 = null;\n\
          if (reportFailures === 0) {\n\
            matchFailed(\"[^\\\\n\
\\\\r\\\\u2028\\\\u2029]\");\n\
          }\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse_iipchar() {\n\
        var result0, result1;\n\
        var pos0, pos1;\n\
        \n\
        pos0 = pos;\n\
        pos1 = pos;\n\
        if (/^[\\\\]/.test(input.charAt(pos))) {\n\
          result0 = input.charAt(pos);\n\
          pos++;\n\
        } else {\n\
          result0 = null;\n\
          if (reportFailures === 0) {\n\
            matchFailed(\"[\\\\\\\\]\");\n\
          }\n\
        }\n\
        if (result0 !== null) {\n\
          if (/^[']/.test(input.charAt(pos))) {\n\
            result1 = input.charAt(pos);\n\
            pos++;\n\
          } else {\n\
            result1 = null;\n\
            if (reportFailures === 0) {\n\
              matchFailed(\"[']\");\n\
            }\n\
          }\n\
          if (result1 !== null) {\n\
            result0 = [result0, result1];\n\
          } else {\n\
            result0 = null;\n\
            pos = pos1;\n\
          }\n\
        } else {\n\
          result0 = null;\n\
          pos = pos1;\n\
        }\n\
        if (result0 !== null) {\n\
          result0 = (function(offset) { return \"'\"; })(pos0);\n\
        }\n\
        if (result0 === null) {\n\
          pos = pos0;\n\
        }\n\
        if (result0 === null) {\n\
          if (/^[^']/.test(input.charAt(pos))) {\n\
            result0 = input.charAt(pos);\n\
            pos++;\n\
          } else {\n\
            result0 = null;\n\
            if (reportFailures === 0) {\n\
              matchFailed(\"[^']\");\n\
            }\n\
          }\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      function parse__() {\n\
        var result0, result1;\n\
        \n\
        result0 = [];\n\
        if (input.charCodeAt(pos) === 32) {\n\
          result1 = \" \";\n\
          pos++;\n\
        } else {\n\
          result1 = null;\n\
          if (reportFailures === 0) {\n\
            matchFailed(\"\\\" \\\"\");\n\
          }\n\
        }\n\
        while (result1 !== null) {\n\
          result0.push(result1);\n\
          if (input.charCodeAt(pos) === 32) {\n\
            result1 = \" \";\n\
            pos++;\n\
          } else {\n\
            result1 = null;\n\
            if (reportFailures === 0) {\n\
              matchFailed(\"\\\" \\\"\");\n\
            }\n\
          }\n\
        }\n\
        result0 = result0 !== null ? result0 : \"\";\n\
        return result0;\n\
      }\n\
      \n\
      function parse___() {\n\
        var result0, result1;\n\
        \n\
        if (input.charCodeAt(pos) === 32) {\n\
          result1 = \" \";\n\
          pos++;\n\
        } else {\n\
          result1 = null;\n\
          if (reportFailures === 0) {\n\
            matchFailed(\"\\\" \\\"\");\n\
          }\n\
        }\n\
        if (result1 !== null) {\n\
          result0 = [];\n\
          while (result1 !== null) {\n\
            result0.push(result1);\n\
            if (input.charCodeAt(pos) === 32) {\n\
              result1 = \" \";\n\
              pos++;\n\
            } else {\n\
              result1 = null;\n\
              if (reportFailures === 0) {\n\
                matchFailed(\"\\\" \\\"\");\n\
              }\n\
            }\n\
          }\n\
        } else {\n\
          result0 = null;\n\
        }\n\
        return result0;\n\
      }\n\
      \n\
      \n\
      function cleanupExpected(expected) {\n\
        expected.sort();\n\
        \n\
        var lastExpected = null;\n\
        var cleanExpected = [];\n\
        for (var i = 0; i < expected.length; i++) {\n\
          if (expected[i] !== lastExpected) {\n\
            cleanExpected.push(expected[i]);\n\
            lastExpected = expected[i];\n\
          }\n\
        }\n\
        return cleanExpected;\n\
      }\n\
      \n\
      function computeErrorPosition() {\n\
        /*\n\
         * The first idea was to use |String.split| to break the input up to the\n\
         * error position along newlines and derive the line and column from\n\
         * there. However IE's |split| implementation is so broken that it was\n\
         * enough to prevent it.\n\
         */\n\
        \n\
        var line = 1;\n\
        var column = 1;\n\
        var seenCR = false;\n\
        \n\
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {\n\
          var ch = input.charAt(i);\n\
          if (ch === \"\\n\
\") {\n\
            if (!seenCR) { line++; }\n\
            column = 1;\n\
            seenCR = false;\n\
          } else if (ch === \"\\r\" || ch === \"\\u2028\" || ch === \"\\u2029\") {\n\
            line++;\n\
            column = 1;\n\
            seenCR = true;\n\
          } else {\n\
            column++;\n\
            seenCR = false;\n\
          }\n\
        }\n\
        \n\
        return { line: line, column: column };\n\
      }\n\
      \n\
      \n\
        var parser, edges, nodes; \n\
      \n\
        parser = this;\n\
      \n\
        edges = parser.edges = [];\n\
        \n\
        parser.exports = []\n\
      \n\
        nodes = {};\n\
      \n\
        parser.addNode = function (nodeName, comp) {\n\
          if (!nodes[nodeName]) {\n\
            nodes[nodeName] = {}\n\
          }\n\
          if (!!comp.comp) {\n\
            nodes[nodeName].component = comp.comp;\n\
          }\n\
          if (!!comp.meta) {\n\
            nodes[nodeName].metadata={routes:comp.meta};\n\
          }\n\
         \n\
        }\n\
      \n\
        parser.getResult = function () {\n\
          return {processes:nodes, connections:parser.processEdges(), exports:parser.exports};\n\
        }  \n\
      \n\
        var flatten = function (array, isShallow) {\n\
          var index = -1,\n\
            length = array ? array.length : 0,\n\
            result = [];\n\
      \n\
          while (++index < length) {\n\
            var value = array[index];\n\
      \n\
            if (value instanceof Array) {\n\
              Array.prototype.push.apply(result, isShallow ? value : flatten(value));\n\
            }\n\
            else {\n\
              result.push(value);\n\
            }\n\
          }\n\
          return result;\n\
        }\n\
        \n\
        parser.registerExports = function (priv, pub) {\n\
          parser.exports.push({private:priv.toLowerCase(), public:pub.toLowerCase()})\n\
        }\n\
      \n\
        parser.registerEdges = function (edges) {\n\
      \n\
          edges.forEach(function (o, i) {\n\
            parser.edges.push(o);\n\
          });\n\
        }  \n\
      \n\
        parser.processEdges = function () {   \n\
          var flats, grouped;\n\
          flats = flatten(parser.edges);\n\
          grouped = [];\n\
          var current = {};\n\
          flats.forEach(function (o, i) {\n\
            if (i % 2 !== 0) { \n\
              var pair = grouped[grouped.length - 1];\n\
              pair.tgt = o.tgt;\n\
              return;\n\
            }\n\
            grouped.push(o);\n\
          });\n\
          return grouped;\n\
        }\n\
      \n\
      \n\
      var result = parseFunctions[startRule]();\n\
      \n\
      /*\n\
       * The parser is now in one of the following three states:\n\
       *\n\
       * 1. The parser successfully parsed the whole input.\n\
       *\n\
       *    - |result !== null|\n\
       *    - |pos === input.length|\n\
       *    - |rightmostFailuresExpected| may or may not contain something\n\
       *\n\
       * 2. The parser successfully parsed only a part of the input.\n\
       *\n\
       *    - |result !== null|\n\
       *    - |pos < input.length|\n\
       *    - |rightmostFailuresExpected| may or may not contain something\n\
       *\n\
       * 3. The parser did not successfully parse any part of the input.\n\
       *\n\
       *   - |result === null|\n\
       *   - |pos === 0|\n\
       *   - |rightmostFailuresExpected| contains at least one failure\n\
       *\n\
       * All code following this comment (including called functions) must\n\
       * handle these states.\n\
       */\n\
      if (result === null || pos !== input.length) {\n\
        var offset = Math.max(pos, rightmostFailuresPos);\n\
        var found = offset < input.length ? input.charAt(offset) : null;\n\
        var errorPosition = computeErrorPosition();\n\
        \n\
        throw new this.SyntaxError(\n\
          cleanupExpected(rightmostFailuresExpected),\n\
          found,\n\
          offset,\n\
          errorPosition.line,\n\
          errorPosition.column\n\
        );\n\
      }\n\
      \n\
      return result;\n\
    },\n\
    \n\
    /* Returns the parser source code. */\n\
    toSource: function() { return this._source; }\n\
  };\n\
  \n\
  /* Thrown when a parser encounters a syntax error. */\n\
  \n\
  result.SyntaxError = function(expected, found, offset, line, column) {\n\
    function buildMessage(expected, found) {\n\
      var expectedHumanized, foundHumanized;\n\
      \n\
      switch (expected.length) {\n\
        case 0:\n\
          expectedHumanized = \"end of input\";\n\
          break;\n\
        case 1:\n\
          expectedHumanized = expected[0];\n\
          break;\n\
        default:\n\
          expectedHumanized = expected.slice(0, expected.length - 1).join(\", \")\n\
            + \" or \"\n\
            + expected[expected.length - 1];\n\
      }\n\
      \n\
      foundHumanized = found ? quote(found) : \"end of input\";\n\
      \n\
      return \"Expected \" + expectedHumanized + \" but \" + foundHumanized + \" found.\";\n\
    }\n\
    \n\
    this.name = \"SyntaxError\";\n\
    this.expected = expected;\n\
    this.found = found;\n\
    this.message = buildMessage(expected, found);\n\
    this.offset = offset;\n\
    this.line = line;\n\
    this.column = column;\n\
  };\n\
  \n\
  result.SyntaxError.prototype = Error.prototype;\n\
  \n\
  return result;\n\
})();//@ sourceURL=noflo-fbp/lib/fbp.js"
));
require.register("noflo-noflo/component.json", Function("exports, require, module",
"module.exports = JSON.parse('{\"name\":\"noflo\",\"description\":\"Flow-Based Programming environment for JavaScript\",\"keywords\":[\"fbp\",\"workflow\",\"flow\"],\"repo\":\"noflo/noflo\",\"version\":\"0.4.1\",\"dependencies\":{\"component/emitter\":\"*\",\"component/underscore\":\"*\",\"noflo/fbp\":\"*\"},\"development\":{},\"license\":\"MIT\",\"main\":\"src/lib/NoFlo.js\",\"scripts\":[\"src/lib/Graph.coffee\",\"src/lib/InternalSocket.coffee\",\"src/lib/Port.coffee\",\"src/lib/ArrayPort.coffee\",\"src/lib/Component.coffee\",\"src/lib/AsyncComponent.coffee\",\"src/lib/LoggingComponent.coffee\",\"src/lib/ComponentLoader.coffee\",\"src/lib/NoFlo.coffee\",\"src/lib/Network.coffee\",\"src/components/Graph.coffee\"],\"json\":[\"component.json\"],\"noflo\":{\"components\":{\"Graph\":\"src/components/Graph.js\"}}}');//@ sourceURL=noflo-noflo/component.json"
));
require.register("noflo-noflo/src/lib/Graph.js", Function("exports, require, module",
"var EventEmitter, Graph,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
  EventEmitter = require('events').EventEmitter;\n\
} else {\n\
  EventEmitter = require('emitter');\n\
}\n\
\n\
Graph = (function(_super) {\n\
  __extends(Graph, _super);\n\
\n\
  Graph.prototype.name = '';\n\
\n\
  Graph.prototype.properties = {};\n\
\n\
  Graph.prototype.nodes = [];\n\
\n\
  Graph.prototype.edges = [];\n\
\n\
  Graph.prototype.initializers = [];\n\
\n\
  Graph.prototype.exports = [];\n\
\n\
  Graph.prototype.groups = [];\n\
\n\
  function Graph(name) {\n\
    this.name = name != null ? name : '';\n\
    this.properties = {};\n\
    this.nodes = [];\n\
    this.edges = [];\n\
    this.initializers = [];\n\
    this.exports = [];\n\
    this.groups = [];\n\
  }\n\
\n\
  Graph.prototype.addExport = function(privatePort, publicPort, metadata) {\n\
    return this.exports.push({\n\
      \"private\": privatePort.toLowerCase(),\n\
      \"public\": publicPort.toLowerCase(),\n\
      metadata: metadata\n\
    });\n\
  };\n\
\n\
  Graph.prototype.removeExport = function(publicPort) {\n\
    var exported, _i, _len, _ref, _results;\n\
    _ref = this.exports;\n\
    _results = [];\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      exported = _ref[_i];\n\
      if (!exported) {\n\
        continue;\n\
      }\n\
      if (exported[\"public\"] !== publicPort) {\n\
        continue;\n\
      }\n\
      _results.push(this.exports.splice(this.exports.indexOf(exported), 1));\n\
    }\n\
    return _results;\n\
  };\n\
\n\
  Graph.prototype.addGroup = function(group, nodes, metadata) {\n\
    return this.groups.push({\n\
      name: group,\n\
      nodes: nodes,\n\
      metadata: metadata\n\
    });\n\
  };\n\
\n\
  Graph.prototype.removeGroup = function(group) {\n\
    var _i, _len, _ref, _results;\n\
    _ref = this.groups;\n\
    _results = [];\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      group = _ref[_i];\n\
      if (!group) {\n\
        continue;\n\
      }\n\
      if (group.name !== group) {\n\
        continue;\n\
      }\n\
      _results.push(this.groups.splice(this.groups.indexOf(group), 1));\n\
    }\n\
    return _results;\n\
  };\n\
\n\
  Graph.prototype.addNode = function(id, component, metadata) {\n\
    var node;\n\
    if (!metadata) {\n\
      metadata = {};\n\
    }\n\
    node = {\n\
      id: id,\n\
      component: component,\n\
      metadata: metadata\n\
    };\n\
    this.nodes.push(node);\n\
    this.emit('addNode', node);\n\
    return node;\n\
  };\n\
\n\
  Graph.prototype.removeNode = function(id) {\n\
    var edge, exported, group, index, initializer, node, privateNode, privatePort, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;\n\
    node = this.getNode(id);\n\
    _ref = this.edges;\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      edge = _ref[_i];\n\
      if (!edge) {\n\
        continue;\n\
      }\n\
      if (edge.from.node === node.id) {\n\
        this.removeEdge(edge.from.node, edge.from.port);\n\
      }\n\
      if (edge.to.node === node.id) {\n\
        this.removeEdge(edge.to.node, edge.to.port);\n\
      }\n\
    }\n\
    _ref1 = this.initializers;\n\
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {\n\
      initializer = _ref1[_j];\n\
      if (!initializer) {\n\
        continue;\n\
      }\n\
      if (initializer.to.node === node.id) {\n\
        this.removeInitial(initializer.to.node, initializer.to.port);\n\
      }\n\
    }\n\
    _ref2 = this.exports;\n\
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {\n\
      exported = _ref2[_k];\n\
      if (!exported) {\n\
        continue;\n\
      }\n\
      _ref3 = exported[\"private\"].split('.'), privateNode = _ref3[0], privatePort = _ref3[1];\n\
      if (privateNode === id.toLowerCase()) {\n\
        this.removeExport(exported[\"public\"]);\n\
      }\n\
    }\n\
    _ref4 = this.groups;\n\
    for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {\n\
      group = _ref4[_l];\n\
      if (!group) {\n\
        continue;\n\
      }\n\
      index = group.nodes.indexOf(id) === -1;\n\
      if (index === -1) {\n\
        continue;\n\
      }\n\
      group.nodes.splice(index, 1);\n\
    }\n\
    if (-1 !== this.nodes.indexOf(node)) {\n\
      this.nodes.splice(this.nodes.indexOf(node), 1);\n\
    }\n\
    return this.emit('removeNode', node);\n\
  };\n\
\n\
  Graph.prototype.getNode = function(id) {\n\
    var node, _i, _len, _ref;\n\
    _ref = this.nodes;\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      node = _ref[_i];\n\
      if (!node) {\n\
        continue;\n\
      }\n\
      if (node.id === id) {\n\
        return node;\n\
      }\n\
    }\n\
    return null;\n\
  };\n\
\n\
  Graph.prototype.renameNode = function(oldId, newId) {\n\
    var edge, exported, group, iip, index, node, privateNode, privatePort, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;\n\
    node = this.getNode(oldId);\n\
    if (!node) {\n\
      return;\n\
    }\n\
    node.id = newId;\n\
    _ref = this.edges;\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      edge = _ref[_i];\n\
      if (!edge) {\n\
        continue;\n\
      }\n\
      if (edge.from.node === oldId) {\n\
        edge.from.node = newId;\n\
      }\n\
      if (edge.to.node === oldId) {\n\
        edge.to.node = newId;\n\
      }\n\
    }\n\
    _ref1 = this.initializers;\n\
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {\n\
      iip = _ref1[_j];\n\
      if (!iip) {\n\
        continue;\n\
      }\n\
      if (iip.to.node === oldId) {\n\
        iip.to.node = newId;\n\
      }\n\
    }\n\
    _ref2 = this.exports;\n\
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {\n\
      exported = _ref2[_k];\n\
      if (!exported) {\n\
        continue;\n\
      }\n\
      _ref3 = exported[\"private\"].split('.'), privateNode = _ref3[0], privatePort = _ref3[1];\n\
      if (privateNode !== oldId.toLowerCase()) {\n\
        continue;\n\
      }\n\
      exported[\"private\"] = \"\" + (newId.toLowerCase()) + \".\" + privatePort;\n\
    }\n\
    _ref4 = this.groups;\n\
    for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {\n\
      group = _ref4[_l];\n\
      if (!group) {\n\
        continue;\n\
      }\n\
      index = group.nodes.indexOf(oldId);\n\
      if (index === -1) {\n\
        continue;\n\
      }\n\
      group.nodes[index] = newId;\n\
    }\n\
    return this.emit('renameNode', oldId, newId);\n\
  };\n\
\n\
  Graph.prototype.addEdge = function(outNode, outPort, inNode, inPort, metadata) {\n\
    var edge;\n\
    if (!this.getNode(outNode)) {\n\
      return;\n\
    }\n\
    if (!this.getNode(inNode)) {\n\
      return;\n\
    }\n\
    if (!metadata) {\n\
      metadata = {};\n\
    }\n\
    edge = {\n\
      from: {\n\
        node: outNode,\n\
        port: outPort\n\
      },\n\
      to: {\n\
        node: inNode,\n\
        port: inPort\n\
      },\n\
      metadata: metadata\n\
    };\n\
    this.edges.push(edge);\n\
    this.emit('addEdge', edge);\n\
    return edge;\n\
  };\n\
\n\
  Graph.prototype.removeEdge = function(node, port, node2, port2) {\n\
    var edge, index, _i, _len, _ref, _results;\n\
    _ref = this.edges;\n\
    _results = [];\n\
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {\n\
      edge = _ref[index];\n\
      if (!edge) {\n\
        continue;\n\
      }\n\
      if (edge.from.node === node && edge.from.port === port) {\n\
        if (node2 && port2) {\n\
          if (!(edge.to.node === node2 && edge.to.port === port2)) {\n\
            continue;\n\
          }\n\
        }\n\
        this.emit('removeEdge', edge);\n\
        this.edges.splice(index, 1);\n\
      }\n\
      if (edge.to.node === node && edge.to.port === port) {\n\
        if (node2 && port2) {\n\
          if (!(edge.from.node === node2 && edge.from.port === port2)) {\n\
            continue;\n\
          }\n\
        }\n\
        this.emit('removeEdge', edge);\n\
        _results.push(this.edges.splice(index, 1));\n\
      } else {\n\
        _results.push(void 0);\n\
      }\n\
    }\n\
    return _results;\n\
  };\n\
\n\
  Graph.prototype.addInitial = function(data, node, port, metadata) {\n\
    var initializer;\n\
    if (!this.getNode(node)) {\n\
      return;\n\
    }\n\
    initializer = {\n\
      from: {\n\
        data: data\n\
      },\n\
      to: {\n\
        node: node,\n\
        port: port\n\
      },\n\
      metadata: metadata\n\
    };\n\
    this.initializers.push(initializer);\n\
    this.emit('addInitial', initializer);\n\
    return initializer;\n\
  };\n\
\n\
  Graph.prototype.removeInitial = function(node, port) {\n\
    var edge, index, _i, _len, _ref, _results;\n\
    _ref = this.initializers;\n\
    _results = [];\n\
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {\n\
      edge = _ref[index];\n\
      if (!edge) {\n\
        continue;\n\
      }\n\
      if (edge.to.node === node && edge.to.port === port) {\n\
        this.emit('removeInitial', edge);\n\
        _results.push(this.initializers.splice(index, 1));\n\
      } else {\n\
        _results.push(void 0);\n\
      }\n\
    }\n\
    return _results;\n\
  };\n\
\n\
  Graph.prototype.toDOT = function() {\n\
    var cleanID, cleanPort, data, dot, edge, id, initializer, node, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;\n\
    cleanID = function(id) {\n\
      return id.replace(/\\s*/g, \"\");\n\
    };\n\
    cleanPort = function(port) {\n\
      return port.replace(/\\./g, \"\");\n\
    };\n\
    dot = \"digraph {\\n\
\";\n\
    _ref = this.nodes;\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      node = _ref[_i];\n\
      dot += \"    \" + (cleanID(node.id)) + \" [label=\" + node.id + \" shape=box]\\n\
\";\n\
    }\n\
    _ref1 = this.initializers;\n\
    for (id = _j = 0, _len1 = _ref1.length; _j < _len1; id = ++_j) {\n\
      initializer = _ref1[id];\n\
      if (typeof initializer.from.data === 'function') {\n\
        data = 'Function';\n\
      } else {\n\
        data = initializer.from.data;\n\
      }\n\
      dot += \"    data\" + id + \" [label=\\\"'\" + data + \"'\\\" shape=plaintext]\\n\
\";\n\
      dot += \"    data\" + id + \" -> \" + (cleanID(initializer.to.node)) + \"[headlabel=\" + (cleanPort(initializer.to.port)) + \" labelfontcolor=blue labelfontsize=8.0]\\n\
\";\n\
    }\n\
    _ref2 = this.edges;\n\
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {\n\
      edge = _ref2[_k];\n\
      dot += \"    \" + (cleanID(edge.from.node)) + \" -> \" + (cleanID(edge.to.node)) + \"[taillabel=\" + (cleanPort(edge.from.port)) + \" headlabel=\" + (cleanPort(edge.to.port)) + \" labelfontcolor=blue labelfontsize=8.0]\\n\
\";\n\
    }\n\
    dot += \"}\";\n\
    return dot;\n\
  };\n\
\n\
  Graph.prototype.toYUML = function() {\n\
    var edge, initializer, yuml, _i, _j, _len, _len1, _ref, _ref1;\n\
    yuml = [];\n\
    _ref = this.initializers;\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      initializer = _ref[_i];\n\
      yuml.push(\"(start)[\" + initializer.to.port + \"]->(\" + initializer.to.node + \")\");\n\
    }\n\
    _ref1 = this.edges;\n\
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {\n\
      edge = _ref1[_j];\n\
      yuml.push(\"(\" + edge.from.node + \")[\" + edge.from.port + \"]->(\" + edge.to.node + \")\");\n\
    }\n\
    return yuml.join(\",\");\n\
  };\n\
\n\
  Graph.prototype.toJSON = function() {\n\
    var connection, edge, exported, exportedData, group, groupData, initializer, json, node, property, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;\n\
    json = {\n\
      properties: {},\n\
      exports: [],\n\
      groups: [],\n\
      processes: {},\n\
      connections: []\n\
    };\n\
    if (this.name) {\n\
      json.properties.name = this.name;\n\
    }\n\
    _ref = this.properties;\n\
    for (property in _ref) {\n\
      value = _ref[property];\n\
      json.properties[property] = value;\n\
    }\n\
    _ref1 = this.exports;\n\
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {\n\
      exported = _ref1[_i];\n\
      exportedData = {\n\
        \"public\": exported[\"public\"],\n\
        \"private\": exported[\"private\"]\n\
      };\n\
      if (exported.metadata) {\n\
        exportedData.metadata = exported.metadata;\n\
      }\n\
      json.exports.push(exportedData);\n\
    }\n\
    _ref2 = this.groups;\n\
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {\n\
      group = _ref2[_j];\n\
      groupData = {\n\
        name: group.name,\n\
        nodes: group.nodes\n\
      };\n\
      if (group.metadata) {\n\
        groupData.metadata = group.metadata;\n\
      }\n\
      json.groups.push(groupData);\n\
    }\n\
    _ref3 = this.nodes;\n\
    for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {\n\
      node = _ref3[_k];\n\
      json.processes[node.id] = {\n\
        component: node.component\n\
      };\n\
      if (node.metadata) {\n\
        json.processes[node.id].metadata = node.metadata;\n\
      }\n\
    }\n\
    _ref4 = this.edges;\n\
    for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {\n\
      edge = _ref4[_l];\n\
      connection = {\n\
        src: {\n\
          process: edge.from.node,\n\
          port: edge.from.port\n\
        },\n\
        tgt: {\n\
          process: edge.to.node,\n\
          port: edge.to.port\n\
        }\n\
      };\n\
      if (Object.keys(edge.metadata).length) {\n\
        connection.metadata = edge.metadata;\n\
      }\n\
      json.connections.push(connection);\n\
    }\n\
    _ref5 = this.initializers;\n\
    for (_m = 0, _len4 = _ref5.length; _m < _len4; _m++) {\n\
      initializer = _ref5[_m];\n\
      json.connections.push({\n\
        data: initializer.from.data,\n\
        tgt: {\n\
          process: initializer.to.node,\n\
          port: initializer.to.port\n\
        }\n\
      });\n\
    }\n\
    return json;\n\
  };\n\
\n\
  Graph.prototype.save = function(file, success) {\n\
    var json;\n\
    json = JSON.stringify(this.toJSON(), null, 4);\n\
    return require('fs').writeFile(\"\" + file + \".json\", json, \"utf-8\", function(err, data) {\n\
      if (err) {\n\
        throw err;\n\
      }\n\
      return success(file);\n\
    });\n\
  };\n\
\n\
  return Graph;\n\
\n\
})(EventEmitter);\n\
\n\
exports.Graph = Graph;\n\
\n\
exports.createGraph = function(name) {\n\
  return new Graph(name);\n\
};\n\
\n\
exports.loadJSON = function(definition, success) {\n\
  var conn, def, exported, graph, group, id, metadata, property, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4;\n\
  if (!definition.properties) {\n\
    definition.properties = {};\n\
  }\n\
  if (!definition.processes) {\n\
    definition.processes = {};\n\
  }\n\
  if (!definition.connections) {\n\
    definition.connections = [];\n\
  }\n\
  graph = new Graph(definition.properties.name);\n\
  _ref = definition.properties;\n\
  for (property in _ref) {\n\
    value = _ref[property];\n\
    if (property === 'name') {\n\
      continue;\n\
    }\n\
    graph.properties[property] = value;\n\
  }\n\
  _ref1 = definition.processes;\n\
  for (id in _ref1) {\n\
    def = _ref1[id];\n\
    if (!def.metadata) {\n\
      def.metadata = {};\n\
    }\n\
    graph.addNode(id, def.component, def.metadata);\n\
  }\n\
  _ref2 = definition.connections;\n\
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {\n\
    conn = _ref2[_i];\n\
    if (conn.data !== void 0) {\n\
      graph.addInitial(conn.data, conn.tgt.process, conn.tgt.port.toLowerCase());\n\
      continue;\n\
    }\n\
    metadata = conn.metadata ? conn.metadata : {};\n\
    graph.addEdge(conn.src.process, conn.src.port.toLowerCase(), conn.tgt.process, conn.tgt.port.toLowerCase(), metadata);\n\
  }\n\
  if (definition.exports) {\n\
    _ref3 = definition.exports;\n\
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {\n\
      exported = _ref3[_j];\n\
      graph.addExport(exported[\"private\"], exported[\"public\"], exported.metadata);\n\
    }\n\
  }\n\
  if (definition.groups) {\n\
    _ref4 = definition.groups;\n\
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {\n\
      group = _ref4[_k];\n\
      graph.addGroup(group.name, group.nodes, group.metadata);\n\
    }\n\
  }\n\
  return success(graph);\n\
};\n\
\n\
exports.loadFBP = function(fbpData, success) {\n\
  var definition;\n\
  definition = require('fbp').parse(fbpData);\n\
  return exports.loadJSON(definition, success);\n\
};\n\
\n\
exports.loadFile = function(file, success) {\n\
  var definition, e;\n\
  if (!(typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1)) {\n\
    try {\n\
      definition = require(file);\n\
      exports.loadJSON(definition, success);\n\
    } catch (_error) {\n\
      e = _error;\n\
      throw new Error(\"Failed to load graph \" + file + \": \" + e.message);\n\
    }\n\
    return;\n\
  }\n\
  return require('fs').readFile(file, \"utf-8\", function(err, data) {\n\
    if (err) {\n\
      throw err;\n\
    }\n\
    if (file.split('.').pop() === 'fbp') {\n\
      return exports.loadFBP(data, success);\n\
    }\n\
    definition = JSON.parse(data);\n\
    return exports.loadJSON(definition, success);\n\
  });\n\
};\n\
//@ sourceURL=noflo-noflo/src/lib/Graph.js"
));
require.register("noflo-noflo/src/lib/InternalSocket.js", Function("exports, require, module",
"var EventEmitter, InternalSocket,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
  EventEmitter = require('events').EventEmitter;\n\
} else {\n\
  EventEmitter = require('emitter');\n\
}\n\
\n\
InternalSocket = (function(_super) {\n\
  __extends(InternalSocket, _super);\n\
\n\
  function InternalSocket() {\n\
    this.connected = false;\n\
    this.groups = [];\n\
  }\n\
\n\
  InternalSocket.prototype.connect = function() {\n\
    if (this.connected) {\n\
      return;\n\
    }\n\
    this.connected = true;\n\
    return this.emit('connect', this);\n\
  };\n\
\n\
  InternalSocket.prototype.disconnect = function() {\n\
    if (!this.connected) {\n\
      return;\n\
    }\n\
    this.connected = false;\n\
    return this.emit('disconnect', this);\n\
  };\n\
\n\
  InternalSocket.prototype.isConnected = function() {\n\
    return this.connected;\n\
  };\n\
\n\
  InternalSocket.prototype.send = function(data) {\n\
    if (!this.connected) {\n\
      this.connect();\n\
    }\n\
    return this.emit('data', data);\n\
  };\n\
\n\
  InternalSocket.prototype.beginGroup = function(group) {\n\
    this.groups.push(group);\n\
    return this.emit('begingroup', group);\n\
  };\n\
\n\
  InternalSocket.prototype.endGroup = function() {\n\
    return this.emit('endgroup', this.groups.pop());\n\
  };\n\
\n\
  InternalSocket.prototype.getId = function() {\n\
    var fromStr, toStr;\n\
    fromStr = function(from) {\n\
      return \"\" + from.process.id + \"() \" + (from.port.toUpperCase());\n\
    };\n\
    toStr = function(to) {\n\
      return \"\" + (to.port.toUpperCase()) + \" \" + to.process.id + \"()\";\n\
    };\n\
    if (!(this.from || this.to)) {\n\
      return \"UNDEFINED\";\n\
    }\n\
    if (this.from && !this.to) {\n\
      return \"\" + (fromStr(this.from)) + \" -> ANON\";\n\
    }\n\
    if (!this.from) {\n\
      return \"DATA -> \" + (toStr(this.to));\n\
    }\n\
    return \"\" + (fromStr(this.from)) + \" -> \" + (toStr(this.to));\n\
  };\n\
\n\
  return InternalSocket;\n\
\n\
})(EventEmitter);\n\
\n\
exports.InternalSocket = InternalSocket;\n\
\n\
exports.createSocket = function() {\n\
  return new InternalSocket;\n\
};\n\
//@ sourceURL=noflo-noflo/src/lib/InternalSocket.js"
));
require.register("noflo-noflo/src/lib/Port.js", Function("exports, require, module",
"var EventEmitter, Port,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
  EventEmitter = require('events').EventEmitter;\n\
} else {\n\
  EventEmitter = require('emitter');\n\
}\n\
\n\
Port = (function(_super) {\n\
  __extends(Port, _super);\n\
\n\
  function Port(type) {\n\
    this.type = type;\n\
    if (!this.type) {\n\
      this.type = 'all';\n\
    }\n\
    this.socket = null;\n\
    this.from = null;\n\
    this.node = null;\n\
    this.name = null;\n\
  }\n\
\n\
  Port.prototype.getId = function() {\n\
    if (!(this.node && this.name)) {\n\
      return 'Port';\n\
    }\n\
    return \"\" + this.node + \" \" + (this.name.toUpperCase());\n\
  };\n\
\n\
  Port.prototype.attach = function(socket) {\n\
    if (this.isAttached()) {\n\
      throw new Error(\"\" + (this.getId()) + \": Socket already attached \" + (this.socket.getId()) + \" - \" + (socket.getId()));\n\
    }\n\
    this.socket = socket;\n\
    return this.attachSocket(socket);\n\
  };\n\
\n\
  Port.prototype.attachSocket = function(socket, localId) {\n\
    var _this = this;\n\
    if (localId == null) {\n\
      localId = null;\n\
    }\n\
    this.emit(\"attach\", socket);\n\
    this.from = socket.from;\n\
    if (socket.setMaxListeners) {\n\
      socket.setMaxListeners(0);\n\
    }\n\
    socket.on(\"connect\", function() {\n\
      return _this.emit(\"connect\", socket, localId);\n\
    });\n\
    socket.on(\"begingroup\", function(group) {\n\
      return _this.emit(\"begingroup\", group, localId);\n\
    });\n\
    socket.on(\"data\", function(data) {\n\
      return _this.emit(\"data\", data, localId);\n\
    });\n\
    socket.on(\"endgroup\", function(group) {\n\
      return _this.emit(\"endgroup\", group, localId);\n\
    });\n\
    return socket.on(\"disconnect\", function() {\n\
      return _this.emit(\"disconnect\", socket, localId);\n\
    });\n\
  };\n\
\n\
  Port.prototype.connect = function() {\n\
    if (!this.socket) {\n\
      throw new Error(\"\" + (this.getId()) + \": No connection available\");\n\
    }\n\
    return this.socket.connect();\n\
  };\n\
\n\
  Port.prototype.beginGroup = function(group) {\n\
    var _this = this;\n\
    if (!this.socket) {\n\
      throw new Error(\"\" + (this.getId()) + \": No connection available\");\n\
    }\n\
    if (this.isConnected()) {\n\
      return this.socket.beginGroup(group);\n\
    }\n\
    this.socket.once(\"connect\", function() {\n\
      return _this.socket.beginGroup(group);\n\
    });\n\
    return this.socket.connect();\n\
  };\n\
\n\
  Port.prototype.send = function(data) {\n\
    var _this = this;\n\
    if (!this.socket) {\n\
      throw new Error(\"\" + (this.getId()) + \": No connection available\");\n\
    }\n\
    if (this.isConnected()) {\n\
      return this.socket.send(data);\n\
    }\n\
    this.socket.once(\"connect\", function() {\n\
      return _this.socket.send(data);\n\
    });\n\
    return this.socket.connect();\n\
  };\n\
\n\
  Port.prototype.endGroup = function() {\n\
    if (!this.socket) {\n\
      throw new Error(\"\" + (this.getId()) + \": No connection available\");\n\
    }\n\
    return this.socket.endGroup();\n\
  };\n\
\n\
  Port.prototype.disconnect = function() {\n\
    if (!this.socket) {\n\
      throw new Error(\"\" + (this.getId()) + \": No connection available\");\n\
    }\n\
    return this.socket.disconnect();\n\
  };\n\
\n\
  Port.prototype.detach = function(socket) {\n\
    if (!this.isAttached(socket)) {\n\
      return;\n\
    }\n\
    this.emit(\"detach\", this.socket);\n\
    this.from = null;\n\
    return this.socket = null;\n\
  };\n\
\n\
  Port.prototype.isConnected = function() {\n\
    if (!this.socket) {\n\
      return false;\n\
    }\n\
    return this.socket.isConnected();\n\
  };\n\
\n\
  Port.prototype.isAttached = function() {\n\
    return this.socket !== null;\n\
  };\n\
\n\
  Port.prototype.canAttach = function() {\n\
    if (this.isAttached()) {\n\
      return false;\n\
    }\n\
    return true;\n\
  };\n\
\n\
  return Port;\n\
\n\
})(EventEmitter);\n\
\n\
exports.Port = Port;\n\
//@ sourceURL=noflo-noflo/src/lib/Port.js"
));
require.register("noflo-noflo/src/lib/ArrayPort.js", Function("exports, require, module",
"var ArrayPort, port,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
port = require(\"./Port\");\n\
\n\
ArrayPort = (function(_super) {\n\
  __extends(ArrayPort, _super);\n\
\n\
  function ArrayPort(type) {\n\
    this.type = type;\n\
    if (!this.type) {\n\
      this.type = 'all';\n\
    }\n\
    this.sockets = [];\n\
  }\n\
\n\
  ArrayPort.prototype.attach = function(socket) {\n\
    this.sockets.push(socket);\n\
    return this.attachSocket(socket, this.sockets.length - 1);\n\
  };\n\
\n\
  ArrayPort.prototype.connect = function(socketId) {\n\
    if (socketId == null) {\n\
      socketId = null;\n\
    }\n\
    if (socketId === null) {\n\
      if (!this.sockets.length) {\n\
        throw new Error(\"\" + (this.getId()) + \": No connections available\");\n\
      }\n\
      this.sockets.forEach(function(socket) {\n\
        return socket.connect();\n\
      });\n\
      return;\n\
    }\n\
    if (!this.sockets[socketId]) {\n\
      throw new Error(\"\" + (this.getId()) + \": No connection '\" + socketId + \"' available\");\n\
    }\n\
    return this.sockets[socketId].connect();\n\
  };\n\
\n\
  ArrayPort.prototype.beginGroup = function(group, socketId) {\n\
    var _this = this;\n\
    if (socketId == null) {\n\
      socketId = null;\n\
    }\n\
    if (socketId === null) {\n\
      if (!this.sockets.length) {\n\
        throw new Error(\"\" + (this.getId()) + \": No connections available\");\n\
      }\n\
      this.sockets.forEach(function(socket, index) {\n\
        return _this.beginGroup(group, index);\n\
      });\n\
      return;\n\
    }\n\
    if (!this.sockets[socketId]) {\n\
      throw new Error(\"\" + (this.getId()) + \": No connection '\" + socketId + \"' available\");\n\
    }\n\
    if (this.isConnected(socketId)) {\n\
      return this.sockets[socketId].beginGroup(group);\n\
    }\n\
    this.sockets[socketId].once(\"connect\", function() {\n\
      return _this.sockets[socketId].beginGroup(group);\n\
    });\n\
    return this.sockets[socketId].connect();\n\
  };\n\
\n\
  ArrayPort.prototype.send = function(data, socketId) {\n\
    var _this = this;\n\
    if (socketId == null) {\n\
      socketId = null;\n\
    }\n\
    if (socketId === null) {\n\
      if (!this.sockets.length) {\n\
        throw new Error(\"\" + (this.getId()) + \": No connections available\");\n\
      }\n\
      this.sockets.forEach(function(socket, index) {\n\
        return _this.send(data, index);\n\
      });\n\
      return;\n\
    }\n\
    if (!this.sockets[socketId]) {\n\
      throw new Error(\"\" + (this.getId()) + \": No connection '\" + socketId + \"' available\");\n\
    }\n\
    if (this.isConnected(socketId)) {\n\
      return this.sockets[socketId].send(data);\n\
    }\n\
    this.sockets[socketId].once(\"connect\", function() {\n\
      return _this.sockets[socketId].send(data);\n\
    });\n\
    return this.sockets[socketId].connect();\n\
  };\n\
\n\
  ArrayPort.prototype.endGroup = function(socketId) {\n\
    var _this = this;\n\
    if (socketId == null) {\n\
      socketId = null;\n\
    }\n\
    if (socketId === null) {\n\
      if (!this.sockets.length) {\n\
        throw new Error(\"\" + (this.getId()) + \": No connections available\");\n\
      }\n\
      this.sockets.forEach(function(socket, index) {\n\
        return _this.endGroup(index);\n\
      });\n\
      return;\n\
    }\n\
    if (!this.sockets[socketId]) {\n\
      throw new Error(\"\" + (this.getId()) + \": No connection '\" + socketId + \"' available\");\n\
    }\n\
    return this.sockets[socketId].endGroup();\n\
  };\n\
\n\
  ArrayPort.prototype.disconnect = function(socketId) {\n\
    var socket, _i, _len, _ref;\n\
    if (socketId == null) {\n\
      socketId = null;\n\
    }\n\
    if (socketId === null) {\n\
      if (!this.sockets.length) {\n\
        throw new Error(\"\" + (this.getId()) + \": No connections available\");\n\
      }\n\
      _ref = this.sockets;\n\
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
        socket = _ref[_i];\n\
        socket.disconnect();\n\
      }\n\
      return;\n\
    }\n\
    if (!this.sockets[socketId]) {\n\
      return;\n\
    }\n\
    return this.sockets[socketId].disconnect();\n\
  };\n\
\n\
  ArrayPort.prototype.detach = function(socket) {\n\
    if (this.sockets.indexOf(socket) === -1) {\n\
      return;\n\
    }\n\
    this.sockets.splice(this.sockets.indexOf(socket), 1);\n\
    return this.emit(\"detach\", socket);\n\
  };\n\
\n\
  ArrayPort.prototype.isConnected = function(socketId) {\n\
    var connected,\n\
      _this = this;\n\
    if (socketId == null) {\n\
      socketId = null;\n\
    }\n\
    if (socketId === null) {\n\
      connected = false;\n\
      this.sockets.forEach(function(socket) {\n\
        if (socket.isConnected()) {\n\
          return connected = true;\n\
        }\n\
      });\n\
      return connected;\n\
    }\n\
    if (!this.sockets[socketId]) {\n\
      return false;\n\
    }\n\
    return this.sockets[socketId].isConnected();\n\
  };\n\
\n\
  ArrayPort.prototype.isAttached = function(socketId) {\n\
    if (socketId === void 0) {\n\
      if (this.sockets.length > 0) {\n\
        return true;\n\
      }\n\
      return false;\n\
    }\n\
    if (this.sockets[socketId]) {\n\
      return true;\n\
    }\n\
    return false;\n\
  };\n\
\n\
  ArrayPort.prototype.canAttach = function() {\n\
    return true;\n\
  };\n\
\n\
  return ArrayPort;\n\
\n\
})(port.Port);\n\
\n\
exports.ArrayPort = ArrayPort;\n\
//@ sourceURL=noflo-noflo/src/lib/ArrayPort.js"
));
require.register("noflo-noflo/src/lib/Component.js", Function("exports, require, module",
"var Component, EventEmitter, _ref,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
  EventEmitter = require('events').EventEmitter;\n\
} else {\n\
  EventEmitter = require('emitter');\n\
}\n\
\n\
Component = (function(_super) {\n\
  __extends(Component, _super);\n\
\n\
  function Component() {\n\
    _ref = Component.__super__.constructor.apply(this, arguments);\n\
    return _ref;\n\
  }\n\
\n\
  Component.prototype.description = '';\n\
\n\
  Component.prototype.icon = null;\n\
\n\
  Component.prototype.getDescription = function() {\n\
    return this.description;\n\
  };\n\
\n\
  Component.prototype.isReady = function() {\n\
    return true;\n\
  };\n\
\n\
  Component.prototype.isSubgraph = function() {\n\
    return false;\n\
  };\n\
\n\
  Component.prototype.setIcon = function(icon) {\n\
    this.icon = icon;\n\
    return this.emit('icon', this.icon);\n\
  };\n\
\n\
  Component.prototype.getIcon = function() {\n\
    return this.icon;\n\
  };\n\
\n\
  Component.prototype.shutdown = function() {};\n\
\n\
  return Component;\n\
\n\
})(EventEmitter);\n\
\n\
exports.Component = Component;\n\
//@ sourceURL=noflo-noflo/src/lib/Component.js"
));
require.register("noflo-noflo/src/lib/AsyncComponent.js", Function("exports, require, module",
"var AsyncComponent, component, port,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
port = require(\"./Port\");\n\
\n\
component = require(\"./Component\");\n\
\n\
AsyncComponent = (function(_super) {\n\
  __extends(AsyncComponent, _super);\n\
\n\
  function AsyncComponent(inPortName, outPortName, errPortName) {\n\
    var _this = this;\n\
    this.inPortName = inPortName != null ? inPortName : \"in\";\n\
    this.outPortName = outPortName != null ? outPortName : \"out\";\n\
    this.errPortName = errPortName != null ? errPortName : \"error\";\n\
    if (!this.inPorts[this.inPortName]) {\n\
      throw new Error(\"no inPort named '\" + this.inPortName + \"'\");\n\
    }\n\
    if (!this.outPorts[this.outPortName]) {\n\
      throw new Error(\"no outPort named '\" + this.outPortName + \"'\");\n\
    }\n\
    this.load = 0;\n\
    this.q = [];\n\
    this.outPorts.load = new port.Port();\n\
    this.inPorts[this.inPortName].on(\"begingroup\", function(group) {\n\
      if (_this.load > 0) {\n\
        return _this.q.push({\n\
          name: \"begingroup\",\n\
          data: group\n\
        });\n\
      }\n\
      return _this.outPorts[_this.outPortName].beginGroup(group);\n\
    });\n\
    this.inPorts[this.inPortName].on(\"endgroup\", function() {\n\
      if (_this.load > 0) {\n\
        return _this.q.push({\n\
          name: \"endgroup\"\n\
        });\n\
      }\n\
      return _this.outPorts[_this.outPortName].endGroup();\n\
    });\n\
    this.inPorts[this.inPortName].on(\"disconnect\", function() {\n\
      if (_this.load > 0) {\n\
        return _this.q.push({\n\
          name: \"disconnect\"\n\
        });\n\
      }\n\
      _this.outPorts[_this.outPortName].disconnect();\n\
      if (_this.outPorts.load.isAttached()) {\n\
        return _this.outPorts.load.disconnect();\n\
      }\n\
    });\n\
    this.inPorts[this.inPortName].on(\"data\", function(data) {\n\
      if (_this.q.length > 0) {\n\
        return _this.q.push({\n\
          name: \"data\",\n\
          data: data\n\
        });\n\
      }\n\
      return _this.processData(data);\n\
    });\n\
  }\n\
\n\
  AsyncComponent.prototype.processData = function(data) {\n\
    var _this = this;\n\
    this.incrementLoad();\n\
    return this.doAsync(data, function(err) {\n\
      if (err) {\n\
        if (_this.outPorts[_this.errPortName] && _this.outPorts[_this.errPortName].isAttached()) {\n\
          _this.outPorts[_this.errPortName].send(err);\n\
          _this.outPorts[_this.errPortName].disconnect();\n\
        } else {\n\
          throw err;\n\
        }\n\
      }\n\
      return _this.decrementLoad();\n\
    });\n\
  };\n\
\n\
  AsyncComponent.prototype.incrementLoad = function() {\n\
    this.load++;\n\
    if (this.outPorts.load.isAttached()) {\n\
      this.outPorts.load.send(this.load);\n\
    }\n\
    if (this.outPorts.load.isAttached()) {\n\
      return this.outPorts.load.disconnect();\n\
    }\n\
  };\n\
\n\
  AsyncComponent.prototype.doAsync = function(data, callback) {\n\
    return callback(new Error(\"AsyncComponents must implement doAsync\"));\n\
  };\n\
\n\
  AsyncComponent.prototype.decrementLoad = function() {\n\
    var _this = this;\n\
    if (this.load === 0) {\n\
      throw new Error(\"load cannot be negative\");\n\
    }\n\
    this.load--;\n\
    if (this.outPorts.load.isAttached()) {\n\
      this.outPorts.load.send(this.load);\n\
    }\n\
    if (this.outPorts.load.isAttached()) {\n\
      this.outPorts.load.disconnect();\n\
    }\n\
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
      return process.nextTick(function() {\n\
        return _this.processQueue();\n\
      });\n\
    } else {\n\
      return setTimeout(function() {\n\
        return _this.processQueue();\n\
      }, 0);\n\
    }\n\
  };\n\
\n\
  AsyncComponent.prototype.processQueue = function() {\n\
    var event, processedData;\n\
    if (this.load > 0) {\n\
      return;\n\
    }\n\
    processedData = false;\n\
    while (this.q.length > 0) {\n\
      event = this.q[0];\n\
      switch (event.name) {\n\
        case \"begingroup\":\n\
          if (processedData) {\n\
            return;\n\
          }\n\
          this.outPorts[this.outPortName].beginGroup(event.data);\n\
          this.q.shift();\n\
          break;\n\
        case \"endgroup\":\n\
          if (processedData) {\n\
            return;\n\
          }\n\
          this.outPorts[this.outPortName].endGroup();\n\
          this.q.shift();\n\
          break;\n\
        case \"disconnect\":\n\
          if (processedData) {\n\
            return;\n\
          }\n\
          this.outPorts[this.outPortName].disconnect();\n\
          if (this.outPorts.load.isAttached()) {\n\
            this.outPorts.load.disconnect();\n\
          }\n\
          this.q.shift();\n\
          break;\n\
        case \"data\":\n\
          this.processData(event.data);\n\
          this.q.shift();\n\
          processedData = true;\n\
      }\n\
    }\n\
  };\n\
\n\
  return AsyncComponent;\n\
\n\
})(component.Component);\n\
\n\
exports.AsyncComponent = AsyncComponent;\n\
//@ sourceURL=noflo-noflo/src/lib/AsyncComponent.js"
));
require.register("noflo-noflo/src/lib/LoggingComponent.js", Function("exports, require, module",
"var Component, Port, util,\n\
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
Component = require(\"./Component\").Component;\n\
\n\
Port = require(\"./Port\").Port;\n\
\n\
if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
  util = require(\"util\");\n\
} else {\n\
  util = {\n\
    inspect: function(data) {\n\
      return data;\n\
    }\n\
  };\n\
}\n\
\n\
exports.LoggingComponent = (function(_super) {\n\
  __extends(LoggingComponent, _super);\n\
\n\
  function LoggingComponent() {\n\
    this.sendLog = __bind(this.sendLog, this);\n\
    this.outPorts = {\n\
      log: new Port()\n\
    };\n\
  }\n\
\n\
  LoggingComponent.prototype.sendLog = function(message) {\n\
    if (typeof message === \"object\") {\n\
      message.when = new Date;\n\
      message.source = this.constructor.name;\n\
      if (this.nodeId != null) {\n\
        message.nodeID = this.nodeId;\n\
      }\n\
    }\n\
    if ((this.outPorts.log != null) && this.outPorts.log.isAttached()) {\n\
      return this.outPorts.log.send(message);\n\
    } else {\n\
      return console.log(util.inspect(message, 4, true, true));\n\
    }\n\
  };\n\
\n\
  return LoggingComponent;\n\
\n\
})(Component);\n\
//@ sourceURL=noflo-noflo/src/lib/LoggingComponent.js"
));
require.register("noflo-noflo/src/lib/ComponentLoader.js", Function("exports, require, module",
"var ComponentLoader, graph, internalSocket;\n\
\n\
internalSocket = require('./InternalSocket');\n\
\n\
graph = require('./Graph');\n\
\n\
ComponentLoader = (function() {\n\
  function ComponentLoader(baseDir) {\n\
    this.baseDir = baseDir;\n\
    this.components = null;\n\
    this.checked = [];\n\
    this.revalidate = false;\n\
    this.libraryIcons = {};\n\
  }\n\
\n\
  ComponentLoader.prototype.getModulePrefix = function(name) {\n\
    if (!name) {\n\
      return '';\n\
    }\n\
    if (name === 'noflo') {\n\
      return '';\n\
    }\n\
    return name.replace('noflo-', '');\n\
  };\n\
\n\
  ComponentLoader.prototype.getModuleComponents = function(moduleName) {\n\
    var cPath, definition, dependency, e, loader, name, prefix, _ref, _ref1, _results;\n\
    if (this.checked.indexOf(moduleName) !== -1) {\n\
      return;\n\
    }\n\
    this.checked.push(moduleName);\n\
    try {\n\
      definition = require(\"/\" + moduleName + \"/component.json\");\n\
    } catch (_error) {\n\
      e = _error;\n\
      if (moduleName.substr(0, 1) === '/') {\n\
        return this.getModuleComponents(\"noflo-\" + (moduleName.substr(1)));\n\
      }\n\
      return;\n\
    }\n\
    for (dependency in definition.dependencies) {\n\
      this.getModuleComponents(dependency.replace('/', '-'));\n\
    }\n\
    if (!definition.noflo) {\n\
      return;\n\
    }\n\
    prefix = this.getModulePrefix(definition.name);\n\
    if (definition.noflo.icon) {\n\
      this.libraryIcons[prefix] = definition.noflo.icon;\n\
    }\n\
    if (moduleName[0] === '/') {\n\
      moduleName = moduleName.substr(1);\n\
    }\n\
    if (definition.noflo.loader) {\n\
      loader = require(\"/\" + moduleName + \"/\" + definition.noflo.loader);\n\
      loader(this);\n\
    }\n\
    if (definition.noflo.components) {\n\
      _ref = definition.noflo.components;\n\
      for (name in _ref) {\n\
        cPath = _ref[name];\n\
        if (cPath.indexOf('.coffee') !== -1) {\n\
          cPath = cPath.replace('.coffee', '.js');\n\
        }\n\
        this.registerComponent(prefix, name, \"/\" + moduleName + \"/\" + cPath);\n\
      }\n\
    }\n\
    if (definition.noflo.graphs) {\n\
      _ref1 = definition.noflo.graphs;\n\
      _results = [];\n\
      for (name in _ref1) {\n\
        cPath = _ref1[name];\n\
        _results.push(this.registerComponent(prefix, name, \"/\" + moduleName + \"/\" + cPath));\n\
      }\n\
      return _results;\n\
    }\n\
  };\n\
\n\
  ComponentLoader.prototype.listComponents = function(callback) {\n\
    if (this.components !== null) {\n\
      return callback(this.components);\n\
    }\n\
    this.components = {};\n\
    this.getModuleComponents(this.baseDir);\n\
    return callback(this.components);\n\
  };\n\
\n\
  ComponentLoader.prototype.load = function(name, callback) {\n\
    var component, componentName, implementation, instance,\n\
      _this = this;\n\
    if (!this.components) {\n\
      this.listComponents(function(components) {\n\
        return _this.load(name, callback);\n\
      });\n\
      return;\n\
    }\n\
    component = this.components[name];\n\
    if (!component) {\n\
      for (componentName in this.components) {\n\
        if (componentName.split('/')[1] === name) {\n\
          component = this.components[componentName];\n\
          break;\n\
        }\n\
      }\n\
      if (!component) {\n\
        throw new Error(\"Component \" + name + \" not available with base \" + this.baseDir);\n\
        return;\n\
      }\n\
    }\n\
    if (this.isGraph(component)) {\n\
      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
        process.nextTick(function() {\n\
          return _this.loadGraph(name, component, callback);\n\
        });\n\
      } else {\n\
        setTimeout(function() {\n\
          return _this.loadGraph(name, component, callback);\n\
        }, 0);\n\
      }\n\
      return;\n\
    }\n\
    if (typeof component === 'function') {\n\
      implementation = component;\n\
      instance = new component;\n\
    } else {\n\
      implementation = require(component);\n\
      instance = implementation.getComponent();\n\
    }\n\
    if (name === 'Graph') {\n\
      instance.baseDir = this.baseDir;\n\
    }\n\
    this.setIcon(name, instance);\n\
    return callback(instance);\n\
  };\n\
\n\
  ComponentLoader.prototype.isGraph = function(cPath) {\n\
    if (typeof cPath === 'object' && cPath instanceof graph.Graph) {\n\
      return true;\n\
    }\n\
    if (typeof cPath !== 'string') {\n\
      return false;\n\
    }\n\
    return cPath.indexOf('.fbp') !== -1 || cPath.indexOf('.json') !== -1;\n\
  };\n\
\n\
  ComponentLoader.prototype.loadGraph = function(name, component, callback) {\n\
    var graphImplementation, graphSocket;\n\
    graphImplementation = require(this.components['Graph']);\n\
    graphSocket = internalSocket.createSocket();\n\
    graph = graphImplementation.getComponent();\n\
    graph.baseDir = this.baseDir;\n\
    graph.inPorts.graph.attach(graphSocket);\n\
    graphSocket.send(component);\n\
    graphSocket.disconnect();\n\
    delete graph.inPorts.graph;\n\
    delete graph.inPorts.start;\n\
    this.setIcon(name, graph);\n\
    return callback(graph);\n\
  };\n\
\n\
  ComponentLoader.prototype.setIcon = function(name, instance) {\n\
    var componentName, library, _ref;\n\
    if (instance.getIcon()) {\n\
      return;\n\
    }\n\
    _ref = name.split('/'), library = _ref[0], componentName = _ref[1];\n\
    if (componentName && this.getLibraryIcon(library)) {\n\
      instance.setIcon(this.getLibraryIcon(library));\n\
      return;\n\
    }\n\
    if (instance.isSubgraph()) {\n\
      instance.setIcon('sitemap');\n\
      return;\n\
    }\n\
    instance.setIcon('blank');\n\
  };\n\
\n\
  ComponentLoader.prototype.getLibraryIcon = function(prefix) {\n\
    if (this.libraryIcons[prefix]) {\n\
      return this.libraryIcons[prefix];\n\
    }\n\
    return null;\n\
  };\n\
\n\
  ComponentLoader.prototype.registerComponent = function(packageId, name, cPath, callback) {\n\
    var fullName, prefix;\n\
    prefix = this.getModulePrefix(packageId);\n\
    fullName = \"\" + prefix + \"/\" + name;\n\
    if (!packageId) {\n\
      fullName = name;\n\
    }\n\
    this.components[fullName] = cPath;\n\
    if (callback) {\n\
      return callback();\n\
    }\n\
  };\n\
\n\
  ComponentLoader.prototype.registerGraph = function(packageId, name, gPath, callback) {\n\
    return this.registerComponent(packageId, name, gPath, callback);\n\
  };\n\
\n\
  ComponentLoader.prototype.clear = function() {\n\
    this.components = null;\n\
    this.checked = [];\n\
    return this.revalidate = true;\n\
  };\n\
\n\
  return ComponentLoader;\n\
\n\
})();\n\
\n\
exports.ComponentLoader = ComponentLoader;\n\
//@ sourceURL=noflo-noflo/src/lib/ComponentLoader.js"
));
require.register("noflo-noflo/src/lib/NoFlo.js", Function("exports, require, module",
"exports.graph = require('./Graph');\n\
\n\
exports.Graph = exports.graph.Graph;\n\
\n\
exports.Network = require('./Network').Network;\n\
\n\
exports.isBrowser = function() {\n\
  if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
    return false;\n\
  }\n\
  return true;\n\
};\n\
\n\
if (!exports.isBrowser()) {\n\
  exports.ComponentLoader = require('./nodejs/ComponentLoader').ComponentLoader;\n\
} else {\n\
  exports.ComponentLoader = require('./ComponentLoader').ComponentLoader;\n\
}\n\
\n\
exports.Component = require('./Component').Component;\n\
\n\
exports.AsyncComponent = require('./AsyncComponent').AsyncComponent;\n\
\n\
exports.LoggingComponent = require('./LoggingComponent').LoggingComponent;\n\
\n\
exports.Port = require('./Port').Port;\n\
\n\
exports.ArrayPort = require('./ArrayPort').ArrayPort;\n\
\n\
exports.internalSocket = require('./InternalSocket');\n\
\n\
exports.createNetwork = function(graph, callback, delay) {\n\
  var network, networkReady;\n\
  network = new exports.Network(graph);\n\
  networkReady = function(network) {\n\
    if (callback != null) {\n\
      callback(network);\n\
    }\n\
    return network.start();\n\
  };\n\
  if (graph.nodes.length === 0) {\n\
    setTimeout(function() {\n\
      return networkReady(network);\n\
    }, 0);\n\
    return network;\n\
  }\n\
  network.loader.listComponents(function() {\n\
    if (delay) {\n\
      if (callback != null) {\n\
        callback(network);\n\
      }\n\
      return;\n\
    }\n\
    return network.connect(function() {\n\
      return networkReady(network);\n\
    });\n\
  });\n\
  return network;\n\
};\n\
\n\
exports.loadFile = function(file, callback) {\n\
  return exports.graph.loadFile(file, function(net) {\n\
    return exports.createNetwork(net, callback);\n\
  });\n\
};\n\
\n\
exports.saveFile = function(graph, file, callback) {\n\
  return exports.graph.save(file, function() {\n\
    return callback(file);\n\
  });\n\
};\n\
//@ sourceURL=noflo-noflo/src/lib/NoFlo.js"
));
require.register("noflo-noflo/src/lib/Network.js", Function("exports, require, module",
"var EventEmitter, Network, componentLoader, graph, internalSocket, _,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
_ = require(\"underscore\");\n\
\n\
internalSocket = require(\"./InternalSocket\");\n\
\n\
graph = require(\"./Graph\");\n\
\n\
if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
  componentLoader = require(\"./nodejs/ComponentLoader\");\n\
  EventEmitter = require('events').EventEmitter;\n\
} else {\n\
  componentLoader = require('./ComponentLoader');\n\
  EventEmitter = require('emitter');\n\
}\n\
\n\
Network = (function(_super) {\n\
  __extends(Network, _super);\n\
\n\
  Network.prototype.processes = {};\n\
\n\
  Network.prototype.connections = [];\n\
\n\
  Network.prototype.initials = [];\n\
\n\
  Network.prototype.graph = null;\n\
\n\
  Network.prototype.startupDate = null;\n\
\n\
  Network.prototype.portBuffer = {};\n\
\n\
  function Network(graph) {\n\
    var _this = this;\n\
    this.processes = {};\n\
    this.connections = [];\n\
    this.initials = [];\n\
    this.graph = graph;\n\
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
      this.baseDir = graph.baseDir || process.cwd();\n\
    } else {\n\
      this.baseDir = graph.baseDir || '/';\n\
    }\n\
    this.startupDate = new Date();\n\
    this.graph.on('addNode', function(node) {\n\
      return _this.addNode(node);\n\
    });\n\
    this.graph.on('removeNode', function(node) {\n\
      return _this.removeNode(node);\n\
    });\n\
    this.graph.on('renameNode', function(oldId, newId) {\n\
      return _this.renameNode(oldId, newId);\n\
    });\n\
    this.graph.on('addEdge', function(edge) {\n\
      return _this.addEdge(edge);\n\
    });\n\
    this.graph.on('removeEdge', function(edge) {\n\
      return _this.removeEdge(edge);\n\
    });\n\
    this.graph.on('addInitial', function(iip) {\n\
      return _this.addInitial(iip);\n\
    });\n\
    this.graph.on('removeInitial', function(iip) {\n\
      return _this.removeInitial(iip);\n\
    });\n\
    this.loader = new componentLoader.ComponentLoader(this.baseDir);\n\
  }\n\
\n\
  Network.prototype.uptime = function() {\n\
    return new Date() - this.startupDate;\n\
  };\n\
\n\
  Network.prototype.connectionCount = 0;\n\
\n\
  Network.prototype.increaseConnections = function() {\n\
    if (this.connectionCount === 0) {\n\
      this.emit('start', {\n\
        start: this.startupDate\n\
      });\n\
    }\n\
    return this.connectionCount++;\n\
  };\n\
\n\
  Network.prototype.decreaseConnections = function() {\n\
    var ender,\n\
      _this = this;\n\
    this.connectionCount--;\n\
    if (this.connectionCount === 0) {\n\
      ender = _.debounce(function() {\n\
        if (_this.connectionCount) {\n\
          return;\n\
        }\n\
        return _this.emit('end', {\n\
          start: _this.startupDate,\n\
          end: new Date,\n\
          uptime: _this.uptime()\n\
        });\n\
      }, 10);\n\
      return ender();\n\
    }\n\
  };\n\
\n\
  Network.prototype.load = function(component, callback) {\n\
    if (typeof component === 'object') {\n\
      return callback(component);\n\
    }\n\
    return this.loader.load(component, callback);\n\
  };\n\
\n\
  Network.prototype.addNode = function(node, callback) {\n\
    var process,\n\
      _this = this;\n\
    if (this.processes[node.id]) {\n\
      if (callback) {\n\
        callback(this.processes[node.id]);\n\
      }\n\
      return;\n\
    }\n\
    process = {\n\
      id: node.id\n\
    };\n\
    if (!node.component) {\n\
      this.processes[process.id] = process;\n\
      if (callback) {\n\
        callback(process);\n\
      }\n\
      return;\n\
    }\n\
    return this.load(node.component, function(instance) {\n\
      var name, port, _ref, _ref1;\n\
      instance.nodeId = node.id;\n\
      process.component = instance;\n\
      _ref = process.component.inPorts;\n\
      for (name in _ref) {\n\
        port = _ref[name];\n\
        port.node = node.id;\n\
        port.name = name;\n\
      }\n\
      _ref1 = process.component.outPorts;\n\
      for (name in _ref1) {\n\
        port = _ref1[name];\n\
        port.node = node.id;\n\
        port.name = name;\n\
      }\n\
      if (instance.isSubgraph()) {\n\
        _this.subscribeSubgraph(node.id, instance);\n\
      }\n\
      _this.processes[process.id] = process;\n\
      if (callback) {\n\
        return callback(process);\n\
      }\n\
    });\n\
  };\n\
\n\
  Network.prototype.removeNode = function(node) {\n\
    if (!this.processes[node.id]) {\n\
      return;\n\
    }\n\
    this.processes[node.id].component.shutdown();\n\
    return delete this.processes[node.id];\n\
  };\n\
\n\
  Network.prototype.renameNode = function(oldId, newId) {\n\
    var name, port, process, _ref, _ref1;\n\
    process = this.getNode(oldId);\n\
    if (!process) {\n\
      return;\n\
    }\n\
    process.id = newId;\n\
    _ref = process.component.inPorts;\n\
    for (name in _ref) {\n\
      port = _ref[name];\n\
      port.node = newId;\n\
    }\n\
    _ref1 = process.component.outPorts;\n\
    for (name in _ref1) {\n\
      port = _ref1[name];\n\
      port.node = newId;\n\
    }\n\
    this.processes[newId] = process;\n\
    return delete this.processes[oldId];\n\
  };\n\
\n\
  Network.prototype.getNode = function(id) {\n\
    return this.processes[id];\n\
  };\n\
\n\
  Network.prototype.connect = function(done) {\n\
    var edges, initializers, nodes, serialize,\n\
      _this = this;\n\
    if (done == null) {\n\
      done = function() {};\n\
    }\n\
    serialize = function(next, add) {\n\
      return function(type) {\n\
        return _this[\"add\" + type](add, function() {\n\
          return next(type);\n\
        });\n\
      };\n\
    };\n\
    initializers = _.reduceRight(this.graph.initializers, serialize, done);\n\
    edges = _.reduceRight(this.graph.edges, serialize, function() {\n\
      return initializers(\"Initial\");\n\
    });\n\
    nodes = _.reduceRight(this.graph.nodes, serialize, function() {\n\
      return edges(\"Edge\");\n\
    });\n\
    return nodes(\"Node\");\n\
  };\n\
\n\
  Network.prototype.connectPort = function(socket, process, port, inbound) {\n\
    if (inbound) {\n\
      socket.to = {\n\
        process: process,\n\
        port: port\n\
      };\n\
      if (!(process.component.inPorts && process.component.inPorts[port])) {\n\
        throw new Error(\"No inport '\" + port + \"' defined in process \" + process.id + \" (\" + (socket.getId()) + \")\");\n\
        return;\n\
      }\n\
      return process.component.inPorts[port].attach(socket);\n\
    }\n\
    socket.from = {\n\
      process: process,\n\
      port: port\n\
    };\n\
    if (!(process.component.outPorts && process.component.outPorts[port])) {\n\
      throw new Error(\"No outport '\" + port + \"' defined in process \" + process.id + \" (\" + (socket.getId()) + \")\");\n\
      return;\n\
    }\n\
    return process.component.outPorts[port].attach(socket);\n\
  };\n\
\n\
  Network.prototype.subscribeSubgraph = function(nodeName, process) {\n\
    var emitSub,\n\
      _this = this;\n\
    if (!process.isReady()) {\n\
      process.once('ready', function() {\n\
        _this.subscribeSubgraph(nodeName, process);\n\
      });\n\
    }\n\
    if (!process.network) {\n\
      return;\n\
    }\n\
    emitSub = function(type, data) {\n\
      if (type === 'connect') {\n\
        _this.increaseConnections();\n\
      }\n\
      if (type === 'disconnect') {\n\
        _this.decreaseConnections();\n\
      }\n\
      if (!data) {\n\
        data = {};\n\
      }\n\
      if (data.subgraph) {\n\
        data.subgraph = \"\" + nodeName + \":\" + data.subgraph;\n\
      } else {\n\
        data.subgraph = nodeName;\n\
      }\n\
      return _this.emit(type, data);\n\
    };\n\
    process.network.on('connect', function(data) {\n\
      return emitSub('connect', data);\n\
    });\n\
    process.network.on('begingroup', function(data) {\n\
      return emitSub('begingroup', data);\n\
    });\n\
    process.network.on('data', function(data) {\n\
      return emitSub('data', data);\n\
    });\n\
    process.network.on('endgroup', function(data) {\n\
      return emitSub('endgroup', data);\n\
    });\n\
    return process.network.on('disconnect', function(data) {\n\
      return emitSub('disconnect', data);\n\
    });\n\
  };\n\
\n\
  Network.prototype.subscribeSocket = function(socket) {\n\
    var _this = this;\n\
    socket.on('connect', function() {\n\
      _this.increaseConnections();\n\
      return _this.emit('connect', {\n\
        id: socket.getId(),\n\
        socket: socket\n\
      });\n\
    });\n\
    socket.on('begingroup', function(group) {\n\
      return _this.emit('begingroup', {\n\
        id: socket.getId(),\n\
        socket: socket,\n\
        group: group\n\
      });\n\
    });\n\
    socket.on('data', function(data) {\n\
      return _this.emit('data', {\n\
        id: socket.getId(),\n\
        socket: socket,\n\
        data: data\n\
      });\n\
    });\n\
    socket.on('endgroup', function(group) {\n\
      return _this.emit('endgroup', {\n\
        id: socket.getId(),\n\
        socket: socket,\n\
        group: group\n\
      });\n\
    });\n\
    return socket.on('disconnect', function() {\n\
      _this.decreaseConnections();\n\
      return _this.emit('disconnect', {\n\
        id: socket.getId(),\n\
        socket: socket\n\
      });\n\
    });\n\
  };\n\
\n\
  Network.prototype.addEdge = function(edge, callback) {\n\
    var from, socket, to,\n\
      _this = this;\n\
    socket = internalSocket.createSocket();\n\
    from = this.getNode(edge.from.node);\n\
    if (!from) {\n\
      throw new Error(\"No process defined for outbound node \" + edge.from.node);\n\
    }\n\
    if (!from.component) {\n\
      throw new Error(\"No component defined for outbound node \" + edge.from.node);\n\
    }\n\
    if (!from.component.isReady()) {\n\
      from.component.once(\"ready\", function() {\n\
        return _this.addEdge(edge, callback);\n\
      });\n\
      return;\n\
    }\n\
    to = this.getNode(edge.to.node);\n\
    if (!to) {\n\
      throw new Error(\"No process defined for inbound node \" + edge.to.node);\n\
    }\n\
    if (!to.component) {\n\
      throw new Error(\"No component defined for inbound node \" + edge.to.node);\n\
    }\n\
    if (!to.component.isReady()) {\n\
      to.component.once(\"ready\", function() {\n\
        return _this.addEdge(edge, callback);\n\
      });\n\
      return;\n\
    }\n\
    this.connectPort(socket, to, edge.to.port, true);\n\
    this.connectPort(socket, from, edge.from.port, false);\n\
    this.subscribeSocket(socket);\n\
    this.connections.push(socket);\n\
    if (callback) {\n\
      return callback();\n\
    }\n\
  };\n\
\n\
  Network.prototype.removeEdge = function(edge) {\n\
    var connection, _i, _len, _ref, _results;\n\
    _ref = this.connections;\n\
    _results = [];\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      connection = _ref[_i];\n\
      if (!connection) {\n\
        continue;\n\
      }\n\
      if (!(edge.to.node === connection.to.process.id && edge.to.port === connection.to.port)) {\n\
        continue;\n\
      }\n\
      connection.to.process.component.inPorts[connection.to.port].detach(connection);\n\
      if (edge.from.node) {\n\
        if (connection.from && edge.from.node === connection.from.process.id && edge.from.port === connection.from.port) {\n\
          connection.from.process.component.outPorts[connection.from.port].detach(connection);\n\
        }\n\
      }\n\
      _results.push(this.connections.splice(this.connections.indexOf(connection), 1));\n\
    }\n\
    return _results;\n\
  };\n\
\n\
  Network.prototype.addInitial = function(initializer, callback) {\n\
    var socket, to,\n\
      _this = this;\n\
    socket = internalSocket.createSocket();\n\
    this.subscribeSocket(socket);\n\
    to = this.getNode(initializer.to.node);\n\
    if (!to) {\n\
      throw new Error(\"No process defined for inbound node \" + initializer.to.node);\n\
    }\n\
    if (!(to.component.isReady() || to.component.inPorts[initializer.to.port])) {\n\
      to.component.setMaxListeners(0);\n\
      to.component.once(\"ready\", function() {\n\
        return _this.addInitial(initializer, callback);\n\
      });\n\
      return;\n\
    }\n\
    this.connectPort(socket, to, initializer.to.port, true);\n\
    this.connections.push(socket);\n\
    this.initials.push({\n\
      socket: socket,\n\
      data: initializer.from.data\n\
    });\n\
    if (callback) {\n\
      return callback();\n\
    }\n\
  };\n\
\n\
  Network.prototype.removeInitial = function(initializer) {\n\
    var connection, _i, _len, _ref, _results;\n\
    _ref = this.connections;\n\
    _results = [];\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      connection = _ref[_i];\n\
      if (!connection) {\n\
        continue;\n\
      }\n\
      if (!(initializer.to.node === connection.to.process.id && initializer.to.port === connection.to.port)) {\n\
        continue;\n\
      }\n\
      connection.to.process.component.inPorts[connection.to.port].detach(connection);\n\
      _results.push(this.connections.splice(this.connections.indexOf(connection), 1));\n\
    }\n\
    return _results;\n\
  };\n\
\n\
  Network.prototype.sendInitial = function(initial) {\n\
    initial.socket.connect();\n\
    initial.socket.send(initial.data);\n\
    return initial.socket.disconnect();\n\
  };\n\
\n\
  Network.prototype.sendInitials = function() {\n\
    var send,\n\
      _this = this;\n\
    send = function() {\n\
      var initial, _i, _len, _ref;\n\
      _ref = _this.initials;\n\
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
        initial = _ref[_i];\n\
        _this.sendInitial(initial);\n\
      }\n\
      return _this.initials = [];\n\
    };\n\
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
      return process.nextTick(send);\n\
    } else {\n\
      return setTimeout(send, 0);\n\
    }\n\
  };\n\
\n\
  Network.prototype.start = function() {\n\
    return this.sendInitials();\n\
  };\n\
\n\
  Network.prototype.stop = function() {\n\
    var connection, id, process, _i, _len, _ref, _ref1, _results;\n\
    _ref = this.connections;\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      connection = _ref[_i];\n\
      if (!connection.isConnected()) {\n\
        continue;\n\
      }\n\
      connection.disconnect();\n\
    }\n\
    _ref1 = this.processes;\n\
    _results = [];\n\
    for (id in _ref1) {\n\
      process = _ref1[id];\n\
      _results.push(process.component.shutdown());\n\
    }\n\
    return _results;\n\
  };\n\
\n\
  return Network;\n\
\n\
})(EventEmitter);\n\
\n\
exports.Network = Network;\n\
//@ sourceURL=noflo-noflo/src/lib/Network.js"
));
require.register("noflo-noflo/src/components/Graph.js", Function("exports, require, module",
"var Graph, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
  noflo = require(\"../../lib/NoFlo\");\n\
} else {\n\
  noflo = require('../lib/NoFlo');\n\
}\n\
\n\
Graph = (function(_super) {\n\
  __extends(Graph, _super);\n\
\n\
  function Graph() {\n\
    var _this = this;\n\
    this.network = null;\n\
    this.ready = true;\n\
    this.started = false;\n\
    this.baseDir = null;\n\
    this.inPorts = {\n\
      graph: new noflo.Port('all'),\n\
      start: new noflo.Port('bang')\n\
    };\n\
    this.outPorts = {};\n\
    this.inPorts.graph.on(\"data\", function(data) {\n\
      return _this.setGraph(data);\n\
    });\n\
    this.inPorts.start.on(\"data\", function() {\n\
      _this.started = true;\n\
      if (!_this.network) {\n\
        return;\n\
      }\n\
      return _this.network.connect(function() {\n\
        var name, notReady, process, _ref;\n\
        _this.network.sendInitials();\n\
        notReady = false;\n\
        _ref = _this.network.processes;\n\
        for (name in _ref) {\n\
          process = _ref[name];\n\
          if (!_this.checkComponent(name, process)) {\n\
            notReady = true;\n\
          }\n\
        }\n\
        if (!notReady) {\n\
          return _this.setToReady();\n\
        }\n\
      });\n\
    });\n\
  }\n\
\n\
  Graph.prototype.setGraph = function(graph) {\n\
    var _this = this;\n\
    this.ready = false;\n\
    if (typeof graph === 'object') {\n\
      if (typeof graph.addNode === 'function') {\n\
        return this.createNetwork(graph);\n\
      }\n\
      noflo.graph.loadJSON(graph, function(instance) {\n\
        instance.baseDir = _this.baseDir;\n\
        return _this.createNetwork(instance);\n\
      });\n\
      return;\n\
    }\n\
    if (graph.substr(0, 1) !== \"/\") {\n\
      graph = \"\" + (process.cwd()) + \"/\" + graph;\n\
    }\n\
    return graph = noflo.graph.loadFile(graph, function(instance) {\n\
      instance.baseDir = _this.baseDir;\n\
      return _this.createNetwork(instance);\n\
    });\n\
  };\n\
\n\
  Graph.prototype.createNetwork = function(graph) {\n\
    var _ref,\n\
      _this = this;\n\
    if (((_ref = this.inPorts.start) != null ? _ref.isAttached() : void 0) && !this.started) {\n\
      noflo.createNetwork(graph, function(network) {\n\
        _this.network = network;\n\
        return _this.emit('network', _this.network);\n\
      }, true);\n\
      return;\n\
    }\n\
    return noflo.createNetwork(graph, function(network) {\n\
      var name, notReady, process, _ref1;\n\
      _this.network = network;\n\
      _this.emit('network', _this.network);\n\
      notReady = false;\n\
      _ref1 = _this.network.processes;\n\
      for (name in _ref1) {\n\
        process = _ref1[name];\n\
        if (!_this.checkComponent(name, process)) {\n\
          notReady = true;\n\
        }\n\
      }\n\
      if (!notReady) {\n\
        return _this.setToReady();\n\
      }\n\
    });\n\
  };\n\
\n\
  Graph.prototype.checkComponent = function(name, process) {\n\
    var _this = this;\n\
    if (!process.component.isReady()) {\n\
      process.component.once(\"ready\", function() {\n\
        _this.checkComponent(name, process);\n\
        return _this.setToReady();\n\
      });\n\
      return false;\n\
    }\n\
    this.findEdgePorts(name, process);\n\
    return true;\n\
  };\n\
\n\
  Graph.prototype.portName = function(nodeName, portName) {\n\
    return \"\" + (nodeName.toLowerCase()) + \".\" + portName;\n\
  };\n\
\n\
  Graph.prototype.isExported = function(port, nodeName, portName) {\n\
    var exported, newPort, _i, _len, _ref;\n\
    newPort = this.portName(nodeName, portName);\n\
    if (!port.canAttach()) {\n\
      return false;\n\
    }\n\
    if (this.network.graph.exports.length === 0) {\n\
      return newPort;\n\
    }\n\
    _ref = this.network.graph.exports;\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      exported = _ref[_i];\n\
      if (exported[\"private\"] === newPort) {\n\
        return exported[\"public\"];\n\
      }\n\
    }\n\
    return false;\n\
  };\n\
\n\
  Graph.prototype.setToReady = function() {\n\
    var _this = this;\n\
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {\n\
      return process.nextTick(function() {\n\
        _this.ready = true;\n\
        return _this.emit('ready');\n\
      });\n\
    } else {\n\
      return setTimeout(function() {\n\
        _this.ready = true;\n\
        return _this.emit('ready');\n\
      }, 0);\n\
    }\n\
  };\n\
\n\
  Graph.prototype.findEdgePorts = function(name, process) {\n\
    var port, portName, targetPortName, _ref, _ref1;\n\
    _ref = process.component.inPorts;\n\
    for (portName in _ref) {\n\
      port = _ref[portName];\n\
      targetPortName = this.isExported(port, name, portName);\n\
      if (targetPortName === false) {\n\
        continue;\n\
      }\n\
      this.inPorts[targetPortName] = port;\n\
    }\n\
    _ref1 = process.component.outPorts;\n\
    for (portName in _ref1) {\n\
      port = _ref1[portName];\n\
      targetPortName = this.isExported(port, name, portName);\n\
      if (targetPortName === false) {\n\
        continue;\n\
      }\n\
      this.outPorts[targetPortName] = port;\n\
    }\n\
    return true;\n\
  };\n\
\n\
  Graph.prototype.isReady = function() {\n\
    return this.ready;\n\
  };\n\
\n\
  Graph.prototype.isSubgraph = function() {\n\
    return true;\n\
  };\n\
\n\
  Graph.prototype.shutdown = function() {\n\
    if (!this.network) {\n\
      return;\n\
    }\n\
    return this.network.stop();\n\
  };\n\
\n\
  return Graph;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new Graph;\n\
};\n\
//@ sourceURL=noflo-noflo/src/components/Graph.js"
));
require.register("noflo-noflo-runtime-base/src/Base.js", Function("exports, require, module",
"var BaseTransport, protocols;\n\
\n\
protocols = {\n\
  Graph: require('./protocol/Graph'),\n\
  Network: require('./protocol/Network'),\n\
  Component: require('./protocol/Component')\n\
};\n\
\n\
BaseTransport = (function() {\n\
  function BaseTransport(options) {\n\
    this.options = options;\n\
    if (!this.options) {\n\
      this.options = {};\n\
    }\n\
    this.graph = new protocols.Graph(this);\n\
    this.network = new protocols.Network(this);\n\
    this.component = new protocols.Component(this);\n\
  }\n\
\n\
  BaseTransport.prototype.send = function(protocol, topic, payload, context) {};\n\
\n\
  BaseTransport.prototype.receive = function(protocol, topic, payload, context) {\n\
    switch (protocol) {\n\
      case 'graph':\n\
        return this.graph.receive(topic, payload, context);\n\
      case 'network':\n\
        return this.network.receive(topic, payload, context);\n\
      case 'component':\n\
        return this.component.receive(topic, payload, context);\n\
    }\n\
  };\n\
\n\
  return BaseTransport;\n\
\n\
})();\n\
\n\
module.exports = BaseTransport;\n\
//@ sourceURL=noflo-noflo-runtime-base/src/Base.js"
));
require.register("noflo-noflo-runtime-base/src/protocol/Graph.js", Function("exports, require, module",
"var GraphProtocol, noflo;\n\
\n\
noflo = require('noflo');\n\
\n\
GraphProtocol = (function() {\n\
  function GraphProtocol(transport) {\n\
    this.transport = transport;\n\
    this.graph = null;\n\
  }\n\
\n\
  GraphProtocol.prototype.send = function(topic, payload, context) {\n\
    return this.transport.send('graph', topic, payload, context);\n\
  };\n\
\n\
  GraphProtocol.prototype.receive = function(topic, payload, context) {\n\
    switch (topic) {\n\
      case 'clear':\n\
        return this.graph = this.initGraph(payload, context);\n\
      case 'addnode':\n\
        return this.addNode(this.graph, payload, context);\n\
      case 'removenode':\n\
        return this.removeNode(this.graph, payload, context);\n\
      case 'renamenode':\n\
        return this.renameNode(this.graph, payload, context);\n\
      case 'addedge':\n\
        return this.addEdge(this.graph, payload, context);\n\
      case 'removeedge':\n\
        return this.removeEdge(this.graph, payload, context);\n\
      case 'addinitial':\n\
        return this.addInitial(this.graph, payload, context);\n\
      case 'removeinitial':\n\
        return this.removeInitial(this.graph, payload, context);\n\
    }\n\
  };\n\
\n\
  GraphProtocol.prototype.initGraph = function(payload, context) {\n\
    var graph;\n\
    if (!payload.baseDir) {\n\
      this.send('error', new Error('No graph baseDir provided'), context);\n\
      return;\n\
    }\n\
    if (!payload.name) {\n\
      payload.name = 'NoFlo runtime';\n\
    }\n\
    graph = new noflo.Graph(payload.name);\n\
    graph.baseDir = payload.baseDir;\n\
    if (this.transport.options.baseDir) {\n\
      graph.baseDir = this.transport.options.baseDir;\n\
    }\n\
    this.subscribeGraph(graph, context);\n\
    return graph;\n\
  };\n\
\n\
  GraphProtocol.prototype.subscribeGraph = function(graph, context) {\n\
    var _this = this;\n\
    graph.on('addNode', function(node) {\n\
      return _this.send('addnode', node, context);\n\
    });\n\
    graph.on('removeNode', function(node) {\n\
      return _this.send('removenode', node, context);\n\
    });\n\
    graph.on('renameNode', function(oldId, newId) {\n\
      return _this.send('renamenode', {\n\
        from: oldId,\n\
        to: newId\n\
      }, context);\n\
    });\n\
    graph.on('addEdge', function(edge) {\n\
      return _this.send('addedge', edge, context);\n\
    });\n\
    graph.on('removeEdge', function(edge) {\n\
      return _this.send('removeedge', edge, context);\n\
    });\n\
    graph.on('addInitial', function(iip) {\n\
      return _this.send('addinitial', iip, context);\n\
    });\n\
    return graph.on('removeInitial', function(iip) {\n\
      return _this.send('removeinitial', iip, context);\n\
    });\n\
  };\n\
\n\
  GraphProtocol.prototype.addNode = function(graph, node, context) {\n\
    if (!(node.id || node.component)) {\n\
      this.send('error', new Error('No ID or component supplied'), context);\n\
    }\n\
    return graph.addNode(node.id, node.component, node.metadata);\n\
  };\n\
\n\
  GraphProtocol.prototype.removeNode = function(graph, payload) {\n\
    if (!payload.id) {\n\
      this.send('error', new Error('No ID supplied'), context);\n\
    }\n\
    return graph.removeNode(payload.id);\n\
  };\n\
\n\
  GraphProtocol.prototype.renameNode = function(graph, payload, context) {\n\
    if (!(payload.from || payload.to)) {\n\
      this.send('error', new Error('No from or to supplied'), context);\n\
    }\n\
    return graph.renameNode(payload.from, payload.to);\n\
  };\n\
\n\
  GraphProtocol.prototype.addEdge = function(graph, edge, context) {\n\
    if (!(edge.from || edge.to)) {\n\
      this.send('error', new Error('No from or to supplied'), context);\n\
    }\n\
    return graph.addEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port, edge.metadata);\n\
  };\n\
\n\
  GraphProtocol.prototype.removeEdge = function(graph, edge, context) {\n\
    if (!(edge.from || edge.to)) {\n\
      this.send('error', new Error('No from or to supplied'), context);\n\
    }\n\
    return graph.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);\n\
  };\n\
\n\
  GraphProtocol.prototype.addInitial = function(graph, payload, context) {\n\
    if (!(payload.from || payload.to)) {\n\
      this.send('error', new Error('No from or to supplied'), context);\n\
    }\n\
    return graph.addInitial(payload.from.data, payload.to.node, payload.to.port, payload.metadata);\n\
  };\n\
\n\
  GraphProtocol.prototype.removeInitial = function(graph, payload, context) {\n\
    if (!payload.to) {\n\
      this.send('error', new Error('No to supplied'), context);\n\
    }\n\
    return graph.removeInitial(payload.to.node, payload.to.port);\n\
  };\n\
\n\
  return GraphProtocol;\n\
\n\
})();\n\
\n\
module.exports = GraphProtocol;\n\
//@ sourceURL=noflo-noflo-runtime-base/src/protocol/Graph.js"
));
require.register("noflo-noflo-runtime-base/src/protocol/Network.js", Function("exports, require, module",
"var NetworkProtocol, noflo, prepareSocketEvent;\n\
\n\
noflo = require('noflo');\n\
\n\
prepareSocketEvent = function(event) {\n\
  var payload;\n\
  payload = {\n\
    id: event.id\n\
  };\n\
  if (event.socket.from) {\n\
    payload.from = {\n\
      node: event.socket.from.process.id,\n\
      port: event.socket.from.port\n\
    };\n\
  }\n\
  if (event.socket.to) {\n\
    payload.to = {\n\
      node: event.socket.to.process.id,\n\
      port: event.socket.to.port\n\
    };\n\
  }\n\
  if (event.group) {\n\
    payload.group = event.group;\n\
  }\n\
  if (event.data) {\n\
    if (event.data.toJSON) {\n\
      payload.data = event.data.toJSON();\n\
    }\n\
    if (event.data.toString) {\n\
      payload.data = event.data.toString();\n\
    } else {\n\
      payload.data = event.data;\n\
    }\n\
  }\n\
  if (event.subgraph) {\n\
    payload.subgraph = event.subgraph;\n\
  }\n\
  return payload;\n\
};\n\
\n\
NetworkProtocol = (function() {\n\
  function NetworkProtocol(transport) {\n\
    this.transport = transport;\n\
    this.network = null;\n\
  }\n\
\n\
  NetworkProtocol.prototype.send = function(topic, payload, context) {\n\
    return this.transport.send('network', topic, payload, context);\n\
  };\n\
\n\
  NetworkProtocol.prototype.receive = function(topic, payload, context) {\n\
    switch (topic) {\n\
      case 'start':\n\
        return this.initNetwork(this.transport.graph.graph, context);\n\
      case 'stop':\n\
        return this.stopNetwork(this.network, context);\n\
    }\n\
  };\n\
\n\
  NetworkProtocol.prototype.initNetwork = function(graph, context) {\n\
    var _this = this;\n\
    if (!graph) {\n\
      this.send('error', new Error('No graph defined'), context);\n\
      return;\n\
    }\n\
    return noflo.createNetwork(graph, function(network) {\n\
      _this.subscribeNetwork(network, context);\n\
      _this.network = network;\n\
      return network.connect(function() {\n\
        network.sendInitials();\n\
        return graph.on('addInitial', function() {\n\
          return network.sendInitials();\n\
        });\n\
      });\n\
    }, true);\n\
  };\n\
\n\
  NetworkProtocol.prototype.subscribeNetwork = function(network, context) {\n\
    var _this = this;\n\
    network.on('start', function(event) {\n\
      return _this.send('started', event.start, context);\n\
    });\n\
    network.on('connect', function(event) {\n\
      return _this.send('connect', prepareSocketEvent(event), context);\n\
    });\n\
    network.on('begingroup', function(event) {\n\
      return _this.send('begingroup', prepareSocketEvent(event), context);\n\
    });\n\
    network.on('data', function(event) {\n\
      return _this.send('data', prepareSocketEvent(event), context);\n\
    });\n\
    network.on('endgroup', function(event) {\n\
      return _this.send('endgroup', prepareSocketEvent(event), context);\n\
    });\n\
    network.on('disconnect', function(event) {\n\
      return _this.send('disconnect', prepareSocketEvent(event), context);\n\
    });\n\
    return network.on('end', function(event) {\n\
      return _this.send('stopped', event.uptime, context);\n\
    });\n\
  };\n\
\n\
  NetworkProtocol.prototype.stopNetwork = function(network, context) {\n\
    if (!network) {\n\
      return;\n\
    }\n\
    return network.stop();\n\
  };\n\
\n\
  return NetworkProtocol;\n\
\n\
})();\n\
\n\
module.exports = NetworkProtocol;\n\
//@ sourceURL=noflo-noflo-runtime-base/src/protocol/Network.js"
));
require.register("noflo-noflo-runtime-base/src/protocol/Component.js", Function("exports, require, module",
"var ComponentProtocol, noflo;\n\
\n\
noflo = require('noflo');\n\
\n\
ComponentProtocol = (function() {\n\
  function ComponentProtocol(transport) {\n\
    this.transport = transport;\n\
  }\n\
\n\
  ComponentProtocol.prototype.send = function(topic, payload, context) {\n\
    return this.transport.send('component', topic, payload, context);\n\
  };\n\
\n\
  ComponentProtocol.prototype.receive = function(topic, payload, context) {\n\
    switch (topic) {\n\
      case 'list':\n\
        return this.listComponents(payload, context);\n\
    }\n\
  };\n\
\n\
  ComponentProtocol.prototype.listComponents = function(baseDir, context) {\n\
    var loader,\n\
      _this = this;\n\
    if (this.transport.options.baseDir) {\n\
      baseDir = this.transport.options.baseDir;\n\
    }\n\
    loader = new noflo.ComponentLoader(baseDir);\n\
    return loader.listComponents(function(components) {\n\
      return Object.keys(components).forEach(function(component) {\n\
        return loader.load(component, function(instance) {\n\
          if (!instance.isReady()) {\n\
            instance.once('ready', function() {\n\
              return _this.sendComponent(component, instance, context);\n\
            });\n\
            return;\n\
          }\n\
          return _this.sendComponent(component, instance, context);\n\
        });\n\
      });\n\
    });\n\
  };\n\
\n\
  ComponentProtocol.prototype.sendComponent = function(component, instance, context) {\n\
    var icon, inPorts, outPorts, port, portName, _ref, _ref1;\n\
    inPorts = [];\n\
    outPorts = [];\n\
    _ref = instance.inPorts;\n\
    for (portName in _ref) {\n\
      port = _ref[portName];\n\
      inPorts.push({\n\
        id: portName,\n\
        type: port.type,\n\
        array: port instanceof noflo.ArrayPort\n\
      });\n\
    }\n\
    _ref1 = instance.outPorts;\n\
    for (portName in _ref1) {\n\
      port = _ref1[portName];\n\
      outPorts.push({\n\
        id: portName,\n\
        type: port.type,\n\
        array: port instanceof noflo.ArrayPort\n\
      });\n\
    }\n\
    icon = instance.getIcon ? instance.getIcon() : 'blank';\n\
    return this.send('component', {\n\
      name: component,\n\
      description: instance.description,\n\
      icon: icon,\n\
      inPorts: inPorts,\n\
      outPorts: outPorts\n\
    }, context);\n\
  };\n\
\n\
  return ComponentProtocol;\n\
\n\
})();\n\
\n\
module.exports = ComponentProtocol;\n\
//@ sourceURL=noflo-noflo-runtime-base/src/protocol/Component.js"
));
require.register("noflo-noflo-core/index.js", Function("exports, require, module",
"/*\n\
 * This file can be used for general library features of core.\n\
 *\n\
 * The library features can be made available as CommonJS modules that the\n\
 * components in this project utilize.\n\
 */\n\
//@ sourceURL=noflo-noflo-core/index.js"
));
require.register("noflo-noflo-core/component.json", Function("exports, require, module",
"module.exports = JSON.parse('{\"name\":\"noflo-core\",\"description\":\"NoFlo Essentials\",\"repo\":\"noflo/noflo-core\",\"version\":\"0.1.0\",\"author\":{\"name\":\"Henri Bergius\",\"email\":\"henri.bergius@iki.fi\"},\"contributors\":[{\"name\":\"Kenneth Kan\",\"email\":\"kenhkan@gmail.com\"},{\"name\":\"Ryan Shaw\",\"email\":\"ryanshaw@unc.edu\"}],\"keywords\":[],\"dependencies\":{\"noflo/noflo\":\"*\",\"component/underscore\":\"*\"},\"scripts\":[\"components/Callback.coffee\",\"components/DisconnectAfterPacket.coffee\",\"components/Drop.coffee\",\"components/Group.coffee\",\"components/Kick.coffee\",\"components/Merge.coffee\",\"components/Output.coffee\",\"components/Repeat.coffee\",\"components/RepeatAsync.coffee\",\"components/Split.coffee\",\"components/RunInterval.coffee\",\"components/MakeFunction.coffee\",\"index.js\"],\"json\":[\"component.json\"],\"noflo\":{\"components\":{\"Callback\":\"components/Callback.coffee\",\"DisconnectAfterPacket\":\"components/DisconnectAfterPacket.coffee\",\"Drop\":\"components/Drop.coffee\",\"Group\":\"components/Group.coffee\",\"Kick\":\"components/Kick.coffee\",\"Merge\":\"components/Merge.coffee\",\"Output\":\"components/Output.coffee\",\"Repeat\":\"components/Repeat.coffee\",\"RepeatAsync\":\"components/RepeatAsync.coffee\",\"Split\":\"components/Split.coffee\",\"RunInterval\":\"components/RunInterval.coffee\",\"MakeFunction\":\"components/MakeFunction.coffee\"}}}');//@ sourceURL=noflo-noflo-core/component.json"
));
require.register("noflo-noflo-core/components/Callback.js", Function("exports, require, module",
"var Callback, noflo, _,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
_ = require('underscore')._;\n\
\n\
Callback = (function(_super) {\n\
  __extends(Callback, _super);\n\
\n\
  Callback.prototype.description = 'This component calls a given callback function for each\\\n\
  IP it receives.  The Callback component is typically used to connect\\\n\
  NoFlo with external Node.js code.';\n\
\n\
  Callback.prototype.icon = 'signout';\n\
\n\
  function Callback() {\n\
    var _this = this;\n\
    this.callback = null;\n\
    this.inPorts = {\n\
      \"in\": new noflo.Port('all'),\n\
      callback: new noflo.Port('function')\n\
    };\n\
    this.outPorts = {\n\
      error: new noflo.Port('object')\n\
    };\n\
    this.inPorts.callback.on('data', function(data) {\n\
      if (!_.isFunction(data)) {\n\
        _this.error('The provided callback must be a function');\n\
        return;\n\
      }\n\
      return _this.callback = data;\n\
    });\n\
    this.inPorts[\"in\"].on('data', function(data) {\n\
      if (!_this.callback) {\n\
        _this.error('No callback provided');\n\
        return;\n\
      }\n\
      return _this.callback(data);\n\
    });\n\
  }\n\
\n\
  Callback.prototype.error = function(msg) {\n\
    if (this.outPorts.error.isAttached()) {\n\
      this.outPorts.error.send(new Error(msg));\n\
      this.outPorts.error.disconnect();\n\
      return;\n\
    }\n\
    throw new Error(msg);\n\
  };\n\
\n\
  return Callback;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new Callback;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/Callback.js"
));
require.register("noflo-noflo-core/components/DisconnectAfterPacket.js", Function("exports, require, module",
"var DisconnectAfterPacket, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
DisconnectAfterPacket = (function(_super) {\n\
  __extends(DisconnectAfterPacket, _super);\n\
\n\
  DisconnectAfterPacket.prototype.description = 'Forwards any packets, but also sends a disconnect after each of them';\n\
\n\
  DisconnectAfterPacket.prototype.icon = 'pause';\n\
\n\
  function DisconnectAfterPacket() {\n\
    var _this = this;\n\
    this.inPorts = {\n\
      \"in\": new noflo.Port('all')\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.Port('all')\n\
    };\n\
    this.inPorts[\"in\"].on('begingroup', function(group) {\n\
      return _this.outPorts.out.beginGroup(group);\n\
    });\n\
    this.inPorts[\"in\"].on('data', function(data) {\n\
      _this.outPorts.out.send(data);\n\
      return _this.outPorts.out.disconnect();\n\
    });\n\
    this.inPorts[\"in\"].on('endgroup', function() {\n\
      return _this.outPorts.out.endGroup();\n\
    });\n\
  }\n\
\n\
  return DisconnectAfterPacket;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new DisconnectAfterPacket;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/DisconnectAfterPacket.js"
));
require.register("noflo-noflo-core/components/Drop.js", Function("exports, require, module",
"var Drop, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
Drop = (function(_super) {\n\
  __extends(Drop, _super);\n\
\n\
  Drop.prototype.description = 'This component drops every packet it receives with no\\\n\
  action';\n\
\n\
  Drop.prototype.icon = 'trash';\n\
\n\
  function Drop() {\n\
    this.inPorts = {\n\
      \"in\": new noflo.ArrayPort('all')\n\
    };\n\
    this.outPorts = {};\n\
  }\n\
\n\
  return Drop;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new Drop;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/Drop.js"
));
require.register("noflo-noflo-core/components/Group.js", Function("exports, require, module",
"var Group, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
Group = (function(_super) {\n\
  __extends(Group, _super);\n\
\n\
  Group.prototype.description = 'Adds a set of groups around the packets received at each connection';\n\
\n\
  Group.prototype.icon = 'tags';\n\
\n\
  function Group() {\n\
    var _this = this;\n\
    this.groups = [];\n\
    this.newGroups = [];\n\
    this.threshold = null;\n\
    this.inPorts = {\n\
      \"in\": new noflo.ArrayPort('all'),\n\
      group: new noflo.ArrayPort('string'),\n\
      threshold: new noflo.Port('integer')\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.Port('all')\n\
    };\n\
    this.inPorts[\"in\"].on('connect', function() {\n\
      var group, _i, _len, _ref, _results;\n\
      _ref = _this.newGroups;\n\
      _results = [];\n\
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
        group = _ref[_i];\n\
        _results.push(_this.outPorts.out.beginGroup(group));\n\
      }\n\
      return _results;\n\
    });\n\
    this.inPorts[\"in\"].on('begingroup', function(group) {\n\
      return _this.outPorts.out.beginGroup(group);\n\
    });\n\
    this.inPorts[\"in\"].on('data', function(data) {\n\
      return _this.outPorts.out.send(data);\n\
    });\n\
    this.inPorts[\"in\"].on('endgroup', function(group) {\n\
      return _this.outPorts.out.endGroup();\n\
    });\n\
    this.inPorts[\"in\"].on('disconnect', function() {\n\
      var group, _i, _len, _ref;\n\
      _ref = _this.newGroups;\n\
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
        group = _ref[_i];\n\
        _this.outPorts.out.endGroup();\n\
      }\n\
      _this.outPorts.out.disconnect();\n\
      return _this.groups = [];\n\
    });\n\
    this.inPorts.group.on('data', function(data) {\n\
      var diff;\n\
      if (_this.threshold) {\n\
        diff = _this.newGroups.length - _this.threshold + 1;\n\
        if (diff > 0) {\n\
          _this.newGroups = _this.newGroups.slice(diff);\n\
        }\n\
      }\n\
      return _this.newGroups.push(data);\n\
    });\n\
    this.inPorts.threshold.on('data', function(threshold) {\n\
      _this.threshold = threshold;\n\
    });\n\
  }\n\
\n\
  return Group;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new Group;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/Group.js"
));
require.register("noflo-noflo-core/components/Kick.js", Function("exports, require, module",
"var Kick, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
Kick = (function(_super) {\n\
  __extends(Kick, _super);\n\
\n\
  Kick.prototype.description = 'This component generates a single packet and sends it to\\\n\
  the output port. Mostly usable for debugging, but can also be useful\\\n\
  for starting up networks.';\n\
\n\
  Kick.prototype.icon = 'share';\n\
\n\
  function Kick() {\n\
    var _this = this;\n\
    this.data = {\n\
      packet: null,\n\
      group: []\n\
    };\n\
    this.groups = [];\n\
    this.inPorts = {\n\
      \"in\": new noflo.Port('bang'),\n\
      data: new noflo.Port('all')\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.ArrayPort('all')\n\
    };\n\
    this.inPorts[\"in\"].on('begingroup', function(group) {\n\
      return _this.groups.push(group);\n\
    });\n\
    this.inPorts[\"in\"].on('data', function() {\n\
      return _this.data.group = _this.groups.slice(0);\n\
    });\n\
    this.inPorts[\"in\"].on('endgroup', function(group) {\n\
      return _this.groups.pop();\n\
    });\n\
    this.inPorts[\"in\"].on('disconnect', function() {\n\
      _this.sendKick(_this.data);\n\
      return _this.groups = [];\n\
    });\n\
    this.inPorts.data.on('data', function(data) {\n\
      return _this.data.packet = data;\n\
    });\n\
  }\n\
\n\
  Kick.prototype.sendKick = function(kick) {\n\
    var group, _i, _j, _len, _len1, _ref, _ref1;\n\
    _ref = kick.group;\n\
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
      group = _ref[_i];\n\
      this.outPorts.out.beginGroup(group);\n\
    }\n\
    this.outPorts.out.send(kick.packet);\n\
    _ref1 = kick.group;\n\
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {\n\
      group = _ref1[_j];\n\
      this.outPorts.out.endGroup();\n\
    }\n\
    return this.outPorts.out.disconnect();\n\
  };\n\
\n\
  return Kick;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new Kick;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/Kick.js"
));
require.register("noflo-noflo-core/components/Merge.js", Function("exports, require, module",
"var Merge, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
Merge = (function(_super) {\n\
  __extends(Merge, _super);\n\
\n\
  Merge.prototype.description = 'This component receives data on multiple input ports and\\\n\
    sends the same data out to the connected output port';\n\
\n\
  Merge.prototype.icon = 'resize-small';\n\
\n\
  function Merge() {\n\
    var _this = this;\n\
    this.inPorts = {\n\
      \"in\": new noflo.ArrayPort('all')\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.Port('all')\n\
    };\n\
    this.inPorts[\"in\"].on('connect', function() {\n\
      return _this.outPorts.out.connect();\n\
    });\n\
    this.inPorts[\"in\"].on('begingroup', function(group) {\n\
      return _this.outPorts.out.beginGroup(group);\n\
    });\n\
    this.inPorts[\"in\"].on('data', function(data) {\n\
      return _this.outPorts.out.send(data);\n\
    });\n\
    this.inPorts[\"in\"].on('endgroup', function() {\n\
      return _this.outPorts.out.endGroup();\n\
    });\n\
    this.inPorts[\"in\"].on('disconnect', function() {\n\
      var socket, _i, _len, _ref;\n\
      _ref = _this.inPorts[\"in\"].sockets;\n\
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {\n\
        socket = _ref[_i];\n\
        if (socket.connected) {\n\
          return;\n\
        }\n\
      }\n\
      return _this.outPorts.out.disconnect();\n\
    });\n\
  }\n\
\n\
  return Merge;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new Merge;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/Merge.js"
));
require.register("noflo-noflo-core/components/Output.js", Function("exports, require, module",
"var Output, noflo, util,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
if (!noflo.isBrowser()) {\n\
  util = require('util');\n\
} else {\n\
  util = {\n\
    inspect: function(data) {\n\
      return data;\n\
    }\n\
  };\n\
}\n\
\n\
Output = (function(_super) {\n\
  __extends(Output, _super);\n\
\n\
  Output.prototype.description = 'This component receives input on a single inport, and\\\n\
    sends the data items directly to console.log';\n\
\n\
  Output.prototype.icon = 'bug';\n\
\n\
  function Output() {\n\
    var _this = this;\n\
    this.options = null;\n\
    this.inPorts = {\n\
      \"in\": new noflo.ArrayPort('all'),\n\
      options: new noflo.Port('object')\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.Port('all')\n\
    };\n\
    this.inPorts[\"in\"].on('data', function(data) {\n\
      _this.log(data);\n\
      if (_this.outPorts.out.isAttached()) {\n\
        return _this.outPorts.out.send(data);\n\
      }\n\
    });\n\
    this.inPorts[\"in\"].on('disconnect', function() {\n\
      if (_this.outPorts.out.isAttached()) {\n\
        return _this.outPorts.out.disconnect();\n\
      }\n\
    });\n\
    this.inPorts.options.on('data', function(data) {\n\
      return _this.setOptions(data);\n\
    });\n\
  }\n\
\n\
  Output.prototype.setOptions = function(options) {\n\
    var key, value, _results;\n\
    if (typeof options !== 'object') {\n\
      throw new Error('Options is not an object');\n\
    }\n\
    if (this.options == null) {\n\
      this.options = {};\n\
    }\n\
    _results = [];\n\
    for (key in options) {\n\
      if (!__hasProp.call(options, key)) continue;\n\
      value = options[key];\n\
      _results.push(this.options[key] = value);\n\
    }\n\
    return _results;\n\
  };\n\
\n\
  Output.prototype.log = function(data) {\n\
    if (this.options != null) {\n\
      return console.log(util.inspect(data, this.options.showHidden, this.options.depth, this.options.colors));\n\
    } else {\n\
      return console.log(data);\n\
    }\n\
  };\n\
\n\
  return Output;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new Output();\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/Output.js"
));
require.register("noflo-noflo-core/components/Repeat.js", Function("exports, require, module",
"var Repeat, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
Repeat = (function(_super) {\n\
  __extends(Repeat, _super);\n\
\n\
  Repeat.prototype.description = 'Forwards packets and metadata in the same way it receives them';\n\
\n\
  Repeat.prototype.icon = 'forward';\n\
\n\
  function Repeat() {\n\
    var _this = this;\n\
    this.inPorts = {\n\
      \"in\": new noflo.Port()\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.Port()\n\
    };\n\
    this.inPorts[\"in\"].on('connect', function() {\n\
      return _this.outPorts.out.connect();\n\
    });\n\
    this.inPorts[\"in\"].on('begingroup', function(group) {\n\
      return _this.outPorts.out.beginGroup(group);\n\
    });\n\
    this.inPorts[\"in\"].on('data', function(data) {\n\
      return _this.outPorts.out.send(data);\n\
    });\n\
    this.inPorts[\"in\"].on('endgroup', function() {\n\
      return _this.outPorts.out.endGroup();\n\
    });\n\
    this.inPorts[\"in\"].on('disconnect', function() {\n\
      return _this.outPorts.out.disconnect();\n\
    });\n\
  }\n\
\n\
  return Repeat;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new Repeat();\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/Repeat.js"
));
require.register("noflo-noflo-core/components/RepeatAsync.js", Function("exports, require, module",
"var RepeatAsync, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
RepeatAsync = (function(_super) {\n\
  __extends(RepeatAsync, _super);\n\
\n\
  RepeatAsync.prototype.description = \"Like 'Repeat', except repeat on next tick\";\n\
\n\
  RepeatAsync.prototype.icon = 'step-forward';\n\
\n\
  function RepeatAsync() {\n\
    var _this = this;\n\
    this.groups = [];\n\
    this.inPorts = {\n\
      \"in\": new noflo.Port('all')\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.Port('all')\n\
    };\n\
    this.inPorts[\"in\"].on('begingroup', function(group) {\n\
      return _this.groups.push(group);\n\
    });\n\
    this.inPorts[\"in\"].on('data', function(data) {\n\
      var groups, later;\n\
      groups = _this.groups;\n\
      later = function() {\n\
        var group, _i, _j, _len, _len1;\n\
        for (_i = 0, _len = groups.length; _i < _len; _i++) {\n\
          group = groups[_i];\n\
          _this.outPorts.out.beginGroup(group);\n\
        }\n\
        _this.outPorts.out.send(data);\n\
        for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {\n\
          group = groups[_j];\n\
          _this.outPorts.out.endGroup();\n\
        }\n\
        return _this.outPorts.out.disconnect();\n\
      };\n\
      return setTimeout(later, 0);\n\
    });\n\
    this.inPorts[\"in\"].on('disconnect', function() {\n\
      return _this.groups = [];\n\
    });\n\
  }\n\
\n\
  return RepeatAsync;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new RepeatAsync;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/RepeatAsync.js"
));
require.register("noflo-noflo-core/components/Split.js", Function("exports, require, module",
"var Split, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
Split = (function(_super) {\n\
  __extends(Split, _super);\n\
\n\
  Split.prototype.description = 'This component receives data on a single input port and\\\n\
    sends the same data out to all connected output ports';\n\
\n\
  Split.prototype.icon = 'resize-full';\n\
\n\
  function Split() {\n\
    var _this = this;\n\
    this.inPorts = {\n\
      \"in\": new noflo.Port('all')\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.ArrayPort('all')\n\
    };\n\
    this.inPorts[\"in\"].on('connect', function() {\n\
      return _this.outPorts.out.connect();\n\
    });\n\
    this.inPorts[\"in\"].on('begingroup', function(group) {\n\
      return _this.outPorts.out.beginGroup(group);\n\
    });\n\
    this.inPorts[\"in\"].on('data', function(data) {\n\
      return _this.outPorts.out.send(data);\n\
    });\n\
    this.inPorts[\"in\"].on('endgroup', function() {\n\
      return _this.outPorts.out.endGroup();\n\
    });\n\
    this.inPorts[\"in\"].on('disconnect', function() {\n\
      return _this.outPorts.out.disconnect();\n\
    });\n\
  }\n\
\n\
  return Split;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new Split;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/Split.js"
));
require.register("noflo-noflo-core/components/RunInterval.js", Function("exports, require, module",
"var RunInterval, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
RunInterval = (function(_super) {\n\
  __extends(RunInterval, _super);\n\
\n\
  RunInterval.prototype.description = 'Send a packet at the given interval';\n\
\n\
  RunInterval.prototype.icon = 'clock';\n\
\n\
  function RunInterval() {\n\
    var _this = this;\n\
    this.timer = null;\n\
    this.interval = null;\n\
    this.inPorts = {\n\
      interval: new noflo.Port('number'),\n\
      start: new noflo.Port('bang'),\n\
      stop: new noflo.Port('bang')\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.Port('bang')\n\
    };\n\
    this.inPorts.interval.on('data', function(interval) {\n\
      _this.interval = interval;\n\
      if (_this.timer != null) {\n\
        clearInterval(_this.timer);\n\
        return _this.timer = setInterval(function() {\n\
          return _this.outPorts.out.send(true);\n\
        }, _this.interval);\n\
      }\n\
    });\n\
    this.inPorts.start.on('data', function() {\n\
      if (_this.timer != null) {\n\
        clearInterval(_this.timer);\n\
      }\n\
      _this.outPorts.out.connect();\n\
      return _this.timer = setInterval(function() {\n\
        return _this.outPorts.out.send(true);\n\
      }, _this.interval);\n\
    });\n\
    this.inPorts.stop.on('data', function() {\n\
      if (!_this.timer) {\n\
        return;\n\
      }\n\
      clearInterval(_this.timer);\n\
      _this.timer = null;\n\
      return _this.outPorts.out.disconnect();\n\
    });\n\
  }\n\
\n\
  RunInterval.prototype.shutdown = function() {\n\
    if (this.timer != null) {\n\
      return clearInterval(this.timer);\n\
    }\n\
  };\n\
\n\
  return RunInterval;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new RunInterval;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/RunInterval.js"
));
require.register("noflo-noflo-core/components/MakeFunction.js", Function("exports, require, module",
"var MakeFunction, noflo,\n\
  __hasProp = {}.hasOwnProperty,\n\
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n\
\n\
noflo = require('noflo');\n\
\n\
MakeFunction = (function(_super) {\n\
  __extends(MakeFunction, _super);\n\
\n\
  MakeFunction.prototype.description = 'Evaluates a function each time data hits the \"in\" port\\\n\
  and sends the return value to \"out\". Within the function \"x\" will\\\n\
  be the variable from the in port. For example, to make a ^2 function\\\n\
  input \"return x*x;\" to the function port.';\n\
\n\
  MakeFunction.prototype.icon = 'code';\n\
\n\
  function MakeFunction() {\n\
    var _this = this;\n\
    this.f = null;\n\
    this.inPorts = {\n\
      \"in\": new noflo.Port('all'),\n\
      \"function\": new noflo.Port('string')\n\
    };\n\
    this.outPorts = {\n\
      out: new noflo.Port('all'),\n\
      \"function\": new noflo.Port('function'),\n\
      error: new noflo.Port('object')\n\
    };\n\
    this.inPorts[\"function\"].on('data', function(data) {\n\
      var error;\n\
      if (typeof data === \"function\") {\n\
        _this.f = data;\n\
      } else {\n\
        try {\n\
          _this.f = Function(\"x\", data);\n\
        } catch (_error) {\n\
          error = _error;\n\
          _this.error('Error creating function: ' + data);\n\
        }\n\
      }\n\
      if (_this.f) {\n\
        try {\n\
          _this.f(true);\n\
          if (_this.outPorts[\"function\"].isAttached()) {\n\
            return _this.outPorts[\"function\"].send(_this.f);\n\
          }\n\
        } catch (_error) {\n\
          error = _error;\n\
          return _this.error('Error evaluating function: ' + data);\n\
        }\n\
      }\n\
    });\n\
    this.inPorts[\"in\"].on('data', function(data) {\n\
      if (!_this.f) {\n\
        _this.error('No function defined');\n\
        return;\n\
      }\n\
      return _this.outPorts.out.send(_this.f(data));\n\
    });\n\
  }\n\
\n\
  MakeFunction.prototype.error = function(msg) {\n\
    if (this.outPorts.error.isAttached()) {\n\
      this.outPorts.error.send(new Error(msg));\n\
      this.outPorts.error.disconnect();\n\
      return;\n\
    }\n\
    throw new Error(msg);\n\
  };\n\
\n\
  return MakeFunction;\n\
\n\
})(noflo.Component);\n\
\n\
exports.getComponent = function() {\n\
  return new MakeFunction;\n\
};\n\
//@ sourceURL=noflo-noflo-core/components/MakeFunction.js"
));
require.register("hanaflo-runtime/index.js", Function("exports, require, module",
"/*\n\
 * This file can be used for general library features of hanaflo-runtime.\n\
 *\n\
 * The library features can be made available as CommonJS modules that the\n\
 * components in this project utilize.\n\
 */\n\
//@ sourceURL=hanaflo-runtime/index.js"
));
require.register("hanaflo-runtime/runtime/graphprovider.js", Function("exports, require, module",
"var noflo = require('noflo');\n\
\n\
var _runtime =null;\n\
\n\
function _handlelocal(options,callback,error){\n\
\tif(typeof options.path !=='string'){\n\
\t\tthrow new Error('Options must contain a property \"path\"')\n\
\t}\n\
\tif(typeof options.baseDir !=='string'){\n\
\t\tthrow new Error('Options must contain a property \"baseDir\"')\n\
\t}\n\
\t$.ajax({\n\
  \t\tdataType: \"json\",\n\
  \t\turl: options.path,  \t\t\n\
  \t\tsuccess: function(data,status,xhr){\n\
\t\t\tnoflo.graph.loadJSON(data, function (graph) {\n\
        \t\tgraph.baseDir = options.baseDir;\n\
        \t\tvar network = noflo.createNetwork(graph);\n\
        \t\tif(typeof callback === 'function'){\n\
        \t\t\tcallback(graph,network);\t\n\
        \t\t}        \t\t\n\
        \t});\n\
  \t\t},\n\
  \t\terror: function(xhr,textMessage,errorThrown){\n\
  \t\t\tif(typeof error !== 'function') return;\n\
\n\
  \t\t\tif(xhr.status ===404){//File Not Found\n\
  \t\t\t\terror({\n\
  \t\t\t\t\tstatus:404,\n\
  \t\t\t\t\ttype: 'http',\n\
  \t\t\t\t\ttext: \"File '\"+options.path+\"' not found\"\n\
  \t\t\t\t});\n\
  \t\t\t\treturn;\n\
  \t\t\t}\n\
  \t\t\terror({\n\
  \t\t\t\tstatus:xhr.status,\n\
  \t\t\t\ttype: 'http',\n\
  \t\t\t\ttext: textMessage\n\
  \t\t\t})\n\
\n\
  \t\t}\n\
\t});\n\
}\n\
\n\
function _handleremote(options,callback,error){\n\
\tvar calledBack =false;\n\
\t_runtime.addEventListener(function(protocol,topic,payload,context){\n\
\t\tconsole.log(\"received an event:(\"+protocol+\":\"+topic+\")\");\n\
\t\tif(!calledBack && _runtime.graph.graph!==null && _runtime.network.network !== null){\n\
\t\t\tcalledBack=true;\n\
\t\t\tcallback(_runtime.graph.graph,_runtime.network.network);\n\
\t\t}\n\
\t})\n\
}\n\
\n\
/**\n\
* This method is used by noflo - runtimes to register themself to the graph provider\n\
\n\
*/\n\
exports.registerEnvironment = function(runtime){\n\
\tconsole.log(\"Register environment\");\n\
\t_runtime = runtime;\n\
\t\n\
}\n\
\n\
\n\
/**\n\
 * Initializes a noflo graph and network. Based on the options the graph is either provided locally (from the server) or remotely \n\
 * from a controlling environment like the noflo-ui.\n\
 * @param {object} options - Options for initializing the noflo-execution. If no valid options are provided an exception is thrown.\n\
 * @param {function} callback - The callback to be called with the graph and the network for further handling\n\
 * @parem {function} error - The error callback to be called when \n\
 */\n\
exports.initializeHanaFlo = function(options,callback,error){\n\
\tif(typeof options !== 'object' || options ===null){\n\
\t\tthrow new Error('Options must be provided');\n\
\t}\n\
\tif( options.type !== 'local' && options.type !== 'remote'){\n\
\t\tthrow new Error('Options must contain a property \"type\" with values [\"local\"|\"remote\"]');\n\
\t}\n\
\tif(options.type==='local'){\n\
\t\t_handlelocal(options,callback,error);\n\
\t}\n\
\tif(options.type==='remote'){\n\
\t\t_handleremote(options,callback,error);\n\
\t}\n\
}//@ sourceURL=hanaflo-runtime/runtime/graphprovider.js"
));
require.register("hanaflo-runtime/runtime/network.js", Function("exports, require, module",
"  var context = window;\n\
  var noflo = context.require('noflo');\n\
  var provider = require('./graphprovider.js');\n\
  var Base = context.require('noflo-noflo-runtime-base');\n\
\n\
  var WindowRuntime = function (options) {\n\
    if (!options) {\n\
      options = {};\n\
    }\n\
\n\
    if (options.catchExceptions) {\n\
      var that = this;\n\
      context.onerror = function (err) {\n\
        that.send('network', 'error', {\n\
          message: err.toString()\n\
        }, {\n\
          href: context.parent.location.href\n\
        });\n\
        return true;\n\
      };\n\
  \n\
    }\n\
\n\
    this.prototype.constructor.apply(this, arguments);\n\
    this.receive = this.prototype.receive;\n\
    this.listeners = [];\n\
    provider.registerEnvironment(this);\n\
  };\n\
  WindowRuntime.prototype = Base;\n\
  WindowRuntime.prototype.send = function (protocol, topic, payload, ctx) {\n\
    if (payload instanceof Error) {\n\
      payload = {\n\
        message: payload.toString()\n\
      };\n\
    }\n\
    for(var i=0;i<this.listeners.length;i++){\n\
      this.listeners[i](protocol,topic,payload,ctx); \n\
    }\n\
    context.opener.postMessage({\n\
      protocol: protocol,\n\
      command: topic,\n\
      payload: payload\n\
    }, ctx.href);\n\
  };\n\
\n\
  WindowRuntime.prototype.getCurrentGraph =function(){\n\
    return this.graph.graph;\n\
  };\n\
\n\
  WindowRuntime.prototype.addEventListener = function(listener){\n\
    this.listeners.push(listener);\n\
  }\n\
\n\
  var runtime = new WindowRuntime({\n\
    catchExceptions: true\n\
  });\n\
\n\
  context.addEventListener('message', function (message) {\n\
\n\
    if (message.origin !== context.opener.location.origin) {\n\
      return;\n\
    }\n\
    //console.log(\"Received a Message-Level 1\");\n\
    if (!message.data.protocol) {\n\
      return;\n\
    }\n\
    if (!message.data.command) {\n\
      return;\n\
    }\n\
    runtime.receive(message.data.protocol, message.data.command, message.data.payload, {\n\
      href: context.parent.location.href\n\
    });\n\
  });\n\
\n\
  exports.runtime = runtime;\n\
\n\
//@ sourceURL=hanaflo-runtime/runtime/network.js"
));
require.register("hanaflo-runtime/component.json", Function("exports, require, module",
"module.exports = JSON.parse('{\"name\":\"hanaflo-runtime\",\"remotes\":[\"http://localhost:3000\"],\"version\":\"0.1.0\",\"keywords\":[],\"dependencies\":{\"noflo/noflo\":\"*\",\"noflo/noflo-runtime-base\":\"*\",\"noflo/noflo-core\":\"*\"},\"scripts\":[\"index.js\",\"runtime/graphprovider.js\",\"runtime/network.js\"],\"json\":[\"component.json\"],\"files\":[\"runtime/component.js\"]}');//@ sourceURL=hanaflo-runtime/component.json"
));





require.alias("noflo-noflo/component.json", "hanaflo-runtime/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "hanaflo-runtime/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "hanaflo-runtime/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "hanaflo-runtime/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "hanaflo-runtime/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "hanaflo-runtime/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "hanaflo-runtime/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "hanaflo-runtime/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "hanaflo-runtime/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "hanaflo-runtime/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "hanaflo-runtime/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "hanaflo-runtime/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "hanaflo-runtime/deps/noflo/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-runtime-base/src/Base.js", "hanaflo-runtime/deps/noflo-runtime-base/src/Base.js");
require.alias("noflo-noflo-runtime-base/src/protocol/Graph.js", "hanaflo-runtime/deps/noflo-runtime-base/src/protocol/Graph.js");
require.alias("noflo-noflo-runtime-base/src/protocol/Network.js", "hanaflo-runtime/deps/noflo-runtime-base/src/protocol/Network.js");
require.alias("noflo-noflo-runtime-base/src/protocol/Component.js", "hanaflo-runtime/deps/noflo-runtime-base/src/protocol/Component.js");
require.alias("noflo-noflo-runtime-base/src/Base.js", "hanaflo-runtime/deps/noflo-runtime-base/index.js");
require.alias("noflo-noflo-runtime-base/src/Base.js", "noflo-runtime-base/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-runtime-base/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-runtime-base/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-runtime-base/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-runtime-base/src/Base.js", "noflo-noflo-runtime-base/index.js");
require.alias("noflo-noflo-core/index.js", "hanaflo-runtime/deps/noflo-core/index.js");
require.alias("noflo-noflo-core/component.json", "hanaflo-runtime/deps/noflo-core/component.json");
require.alias("noflo-noflo-core/components/Callback.js", "hanaflo-runtime/deps/noflo-core/components/Callback.js");
require.alias("noflo-noflo-core/components/DisconnectAfterPacket.js", "hanaflo-runtime/deps/noflo-core/components/DisconnectAfterPacket.js");
require.alias("noflo-noflo-core/components/Drop.js", "hanaflo-runtime/deps/noflo-core/components/Drop.js");
require.alias("noflo-noflo-core/components/Group.js", "hanaflo-runtime/deps/noflo-core/components/Group.js");
require.alias("noflo-noflo-core/components/Kick.js", "hanaflo-runtime/deps/noflo-core/components/Kick.js");
require.alias("noflo-noflo-core/components/Merge.js", "hanaflo-runtime/deps/noflo-core/components/Merge.js");
require.alias("noflo-noflo-core/components/Output.js", "hanaflo-runtime/deps/noflo-core/components/Output.js");
require.alias("noflo-noflo-core/components/Repeat.js", "hanaflo-runtime/deps/noflo-core/components/Repeat.js");
require.alias("noflo-noflo-core/components/RepeatAsync.js", "hanaflo-runtime/deps/noflo-core/components/RepeatAsync.js");
require.alias("noflo-noflo-core/components/Split.js", "hanaflo-runtime/deps/noflo-core/components/Split.js");
require.alias("noflo-noflo-core/components/RunInterval.js", "hanaflo-runtime/deps/noflo-core/components/RunInterval.js");
require.alias("noflo-noflo-core/components/MakeFunction.js", "hanaflo-runtime/deps/noflo-core/components/MakeFunction.js");
require.alias("noflo-noflo-core/index.js", "noflo-core/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-core/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-core/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-core/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-core/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-core/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-core/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-core/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-core/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-core/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-core/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-core/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-core/deps/underscore/index.js");
