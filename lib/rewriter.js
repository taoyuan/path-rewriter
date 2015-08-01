'use strict';

/**
 * Module dependencies.
 */
var debug = require('debug')('rewriter');
var assert = require('assert');
var pathToRegexp = require('path-to-regexp');

/**
 * Expose `expose`.
 */

module.exports = Rewriter;

var reParams = /\$(\d+)|(?::(\w+))/g;

function Rewriter() {
  if (!(this instanceof Rewriter)) return new Rewriter();
  this._rules = [];
}

/**
 * Add a rule.
 *
 * @param {String|Object} [type] The rule type or rule object.
 * @param {String} [from] The source path.
 * @param {String} [to] The destination path.
 * @returns {Rewriter}
 */
Rewriter.prototype.rule = function (type, from, to) {
  if (arguments.length === 2) {
    to = from;
    from = type;
    type = null;
  } else if (arguments.length === 1 && typeof type !== 'string') {
    to = type.to;
    from = type.from;
    type = type.type;
  }

  if (arguments.length === 0) return this;

  if (!type) type = '*';

  var keys = [];
  var re = pathToRegexp(from, keys);
  var map = to_map(keys);

  assert(validate_path(to, map), 'The destination path with parameters is not matched the source path: ' + from + ' -> ' + to);

  debug('added rule [%s] %s -> %s', type, from, to);
  this._rules.push({
    type: type,
    from: from,
    to: to,
    re: re,
    keys: keys,
    map: map
  });
  return this;
};

Rewriter.prototype.add = Rewriter.prototype.rule;

/**
 * Add a `in` type rule.
 *
 * @param {String} from The source path.
 * @param {String} to The destination path.
 * @returns {Rewriter}
 */
Rewriter.prototype.in = function (from, to) {
  this.add('in', from, to);
  return this;
};

/**
 * Add a `out` type rule.
 *
 * @param {String} from The source path.
 * @param {String} to The destination path.
 * @returns {Rewriter}
 */
Rewriter.prototype.out = function (from, to) {
  this.add('out', from, to);
  return this;
};

/**
 * Rewrite path according to the rules
 *
 * @param {String} [type] The rule type. Could be `in`, `out` or `*`. `*` is default
 * @param {String} path The origin path.
 * @returns {String} The rewrited path.
 */
Rewriter.prototype.rewrite = function (type, path) {
  assert(arguments.length >= 1 && arguments.length <= 2, 'arguments count must be 1 or 2');
  if (arguments.length === 1) {
    path = type;
    type = '*';
  }

  debug('rewrite [%s] %s', type, path);

  var rules = this._rules;
  var rule, values;

  for (var i = 0; i < rules.length; i++) {
    rule = rules[i];
    if (rule.type !== type && rule.type !== '*') continue;
    values = rule.re.exec(path);
    if (!values) continue;
    return values && values.length > 0 ? rule.to.replace(/\$(\d+)|(?::(\w+))/g, replace_handler(rule, values)) : rule.to;
  }

  return path;
};

/**
 * Replace handler for `$n` and `:key` in path
 * @param {Object} rule
 * @param {Array} values
 * @returns {Function}
 */
function replace_handler(rule, values) {
  return function (_, n, name) {
    return name ? values[rule.map[name].index + 1] : values[n];
  };
}

/**
 * Turn params array into a map for quick lookup.
 *
 * @param {Array} params
 * @return {Object}
 * @api private
 */

function to_map(params) {
  var map = {};

  params.forEach(function (param, i) {
    param.index = i;
    map[param.name] = param;
  });

  map.length = params.length;

  return map;
}

function validate_path(path, map) {
  var result, name, n;

  while ((result = reParams.exec(path)) !== null) {
    name = result[2];
    if (name && map[name]) continue;
    n = result[1];
    if (n <= map.length) continue;
    return false;
  }

  return true;
}

