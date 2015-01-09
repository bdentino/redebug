var predebug = require('debug');
var preenable = predebug.enable;

exports = module.exports = redebug;

/**
 * Expose all exports of debug to redebug
 *
 */
Object.keys(predebug).forEach(function(key) {
  exports[key] = predebug[key];
})
exports.enable = enable;
exports.namespaces = [];
exports.namespaceFns = {};
exports.reset = reset;

/**
 * Patch debug in require cache so subsequent debug channels will be
 * dynamically configurable
 *
 * (Ignore in the browser)
 *
 */
try {
  require.cache[require.resolve('debug')] = require.cache[require.resolve('redebug')];
  require('assert').equal(require('debug'), require('redebug'));
} catch (e) {
  console.log('could not update debug in require cache');
}


/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}


// TODO: can i patch this function without duplicating this much from 'debug'
function redebug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;
  disabled.namespace = namespace;

  // define the `enabled` version
  function enabled() {
    var self = this === dynamic ? dynamic : enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = self.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;
  enabled.namespace = namespace;

  function dynamic() {
    var self = dynamic;
    self.fn.apply(self, Array.prototype.slice.call(arguments));
  }
  dynamic.enabled = exports.enabled(namespace);
  dynamic.namespace = namespace;
  dynamic.fn = dynamic.enabled ? enabled : disabled;
  dynamic.enabledFn = enabled;
  dynamic.disabledFn = disabled;

  if (exports.namespaces.indexOf(namespace) < 0) {
    exports.namespaces.push(namespace);
    exports.namespaceFns[namespace] = dynamic;
  }

  return dynamic;
}

/**
 * Moneky-patch enable to update exposed namespace functions
 * when enabled names are updated
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  preenable.apply(preenable, Array.prototype.slice.call(arguments));

  exports.namespaces.forEach(function(namespace) {
    exports.namespaceFns[namespace].fn = exports.enabled(namespace)
      ? exports.namespaceFns[namespace].enabledFn
      : exports.namespaceFns[namespace].disabledFn
    exports.namespaceFns[namespace].enabled = exports.enabled(namespace)
  })
}

/**
 * Clears all enabled debugger rules
 *
 * @api public
 */

function reset() {
  if (exports.skips) exports.skips.length = 0;
  if (exports.names) exports.names.length = 0;
}
