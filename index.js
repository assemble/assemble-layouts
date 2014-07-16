'use strict';

var delims = require('delims');
var extend = require('xtend');
var isFalsey = require('falsey');
var File = require('vinyl');


/**
 * ## Layouts
 *
 * Create a new instance of `Layouts` to generate rendered layout stacks.
 *
 * **Example:**
 *
 * ```js
 * var layouts = new Layouts(options);
 * ```
 *
 * {%= docs("layouts") %}
 *
 * @class `Layouts`
 * @param {Object} `options` global options for how to determine layouts.
 * @returns {Layouts} new `Layouts` instance
 * @constructor
 */

function Layouts(options) {
  if (!this instanceof Layouts) {
    return new Layouts(options);
  }

  var defaults = {
    delims: ['{{', '}}'],
    bodyTag: '{{ body }}',
    matter: '\\s*body\\s*',
    flags: 'gi',
    beginning: '',
    end: '',
    body: ''
  };

  this.options = extend(defaults, options);
  this._layouts = {};
  this.bodyTag = this.options.bodyTag;
  this._bodyRe = delims(this.options.delims, this.options).evaluate;
}


/**
 * ## .render
 *
 * Flatten and render the entire layout stack based on the `file` and `options`
 * and how the layout stack is defined.
 *
 * @param {Object} `file` object containing `locals` and `contents` properties.
 * @param {Object} `options` additional options to override `global` and/or `file` options
 * @returns {String} rendered template
 */

Layouts.prototype.render = function (file, options) {
  var opts = extend({}, this.options, file.data, options);
  var stack = this.createStack(opts);

  // Setup the object to be returned, and store file.contents on `orig`
  var results = new File({contents: new Buffer(this.bodyTag)});
  results.locals = file.locals;
  results.orig = file.contents;

  // loop over the layout stack building the context and content
  results = stack.reduce(function (acc, name) {
    var layout = this.get(name);
    acc.locals = extend(acc.locals, layout.locals);
    acc.contents = this._inject(acc.contents, layout.contents);
    return acc;
  }.bind(this), results);

  // Pass the accumlated, final results
  results.locals = extend(results.locals, file.locals);
  results.contents = this._inject(results.contents, file.contents);
  return results;
};


/**
 * ## ._inject
 *
 * Injects the inner content into the outer content based on the body regex
 *
 * @param {String} `outer` content that wraps the inner content
 * @param {String} `inner` content to be injected into the outer content
 * @returns {String} resulting content
 * @api private
 */

Layouts.prototype._inject = function (outer, inner) {
  return new Buffer(outer.toString('utf8').replace(this._bodyRe, inner.toString('utf8')));
};


/**
 * ## .set
 *
 * Store a layout.
 *
 * @param {String} `name` name of the layout to store.
 * @param {Object} `layout` object containing `data` and `content` properties.
 */

Layouts.prototype.set = function (name, layout) {
  this._layouts[name] = layout;
  return this;
};


/**
 * ## .get
 *
 * Return a stored layout.
 *
 * @param {String} `name` name of the layout
 * @returns {Object} object containing `data` and `content` properties.
 */

Layouts.prototype.get = function (name) {
  return this._layouts[name];
};


/**
 * ## .createStack
 *
 * Create a layout stack based on options and layout data. Returned stack is
 * an array with the layouts to use going from the top level parent to the
 * lowest level child.
 *
 * @param {Object} `options` used to determine the layout to use.
 * @returns {Array} `stack` parent => child layouts.
 */

Layouts.prototype.createStack = function (options) {
  var stack = [];
  var name = this.useLayout(options.layout);
  var layout = null;
  while (name && (layout = this.get(name))) {
    stack.unshift(name);
    name = this.useLayout(layout.locals && layout.locals.layout);
  }
  return stack;
};


/**
 * ## .useLayout
 *
 * Return a valid layout name if one should be used, otherwise, returns `null`
 * to indicate a layout should not be used.
 *
 * @param {String} `layout` layout to use, or a negative value to not use a layout
 * @returns {*} either a valid layout name or null
 */

Layouts.prototype.useLayout = function (layout) {
  if (!layout || isFalsey(layout)) {
    return null;
  }
  return layout;
};

module.exports = Layouts;