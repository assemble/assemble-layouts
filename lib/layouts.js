'use strict';

var _ = require('lodash');
var delims = require('delims');

/**
 * # Layouts
 *
 * Setup a new instance of `Layouts` to generate
 * rendered layout stacks.
 *
 * **Example**
 * ```js
 *
 * var options = {
 *  delims: ['<%', '%>'], // start and end delimiters for body tag - defaults to ['{{', '}}']
 *  default: '<% body %>', // default body tag for empty layouts - defaults to '{{ body }}'
 *  matter: '\\s*body\\s*', // inner contents of body tag regex - defaults to '\\s*body\\s*'
 * };
 *
 * // create a new instance with the above options
 * var layouts = new Layouts(options);
 *
 * // assuming parsedLayouts have been read in an parsed,
 * // add them to the `layouts` cache
 * parsedLayouts.forEach(function (layout) {
 *  // layout needs to have at least `data` and `content`
 *  layouts.set(layout.name, layout);
 * });
 *
 * // render the entire layout stack for a specific page object.
 * // assuming the `page` object has already been read in and parsed
 * // and contains a `data` and `content` property
 * var template = layouts.render(page);
 *
 * ```
 *
 * @param {Object} `options` global options for how to determine layouts.
 * @returns {Layouts} new `Layouts` instance
 * @constructor
 */

function Layouts (options) {
  if (!this instanceof Layouts) {
    return new Layouts(options);
  }

  var defaults = {
    delims: ['{{', '}}'],
    default: '{{ body }}',
    matter: '\\s*body\\s*',
    flags: 'gi',
    beginning: '',
    end: '',
    body: '',
    negatives: [false, 'false', 'none', 'nil', null, 'null']
  };

  this.options = _.extend(defaults, options);
  this._layouts = {};
  this._default = this.options.default;
  this._bodyRe = delims(this.options.delims, this.options).evaluate;
}


/**
 * ## .render
 *
 * Create the entire template based on the `file` and `options`
 * and how they define the `layout` stack
 *
 * @param {Object} `file` object containing `data` and `contents` properties.
 * @param {Object} `options` additional options to override `global` and/or `file` options
 * @returns {Object} `layout` an object containing `data`, `content` and `original` properties
 */

Layouts.prototype.render = function (file, options) {
  var opts = _.extend({}, this.options, file.data, options);
  var stack = this.createStack(opts);

  // create an object that will be returned
  var results = {
    data: {},
    content: this._default,
    original: file.contents
  };

  // loop over the layout stack building the context and content
  results = _.reduce(stack, function (acc, name) {
    var layout = this.get(name);
    acc.data = _.extend(acc.data, layout.data);
    acc.content = this._inject(acc.content, layout.content);
    return acc;
  }.bind(this), results);

  // add the file information to the results
  results.data = _.extend(results.data, file.data);
  results.content = this._inject(results.content, file.contents);
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
 * @private
 */

Layouts.prototype._inject = function (outer, inner) {
  return outer.replace(this._bodyRe, inner);
};


/**
 * ## .set
 *
 * Stores a layout.
 *
 * @param {String} `name` name of the layout to store.
 * @param {Object} `layout` object containing `data` and `content` properties.
 */

Layouts.prototype.set = function (name, layout) {
  this._layouts[name] = layout;
};


/**
 * ## .get
 *
 * Returns a stored layout.
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
 * Creates a layout stack based on options and layout data.
 * Returned stack is an array with the layouts to use going
 * from the top level parent to the lowest level child.
 *
 * @param {Object} `options` used to determine the layout to use.
 * @returns {Array} `stack` parent => child layouts.
 */

Layouts.prototype.createStack = function (options) {
  var stack = [];
  var name = this.useLayout(options.layout);
  while (name) {
    stack.unshift(name);
    var layout = this.get(name);
    name = this.useLayout(layout.data && layout.data.layout);
  }
  return stack;
};


/**
 * ## .useLayout
 *
 * Returns a valid layout name if one should be used, otherwise,
 * returns null to indicate a layout should not be used.
 *
 * @param {String} `layout` layout to use, or a negative value to not use a layout
 * @returns {*} either a valid layout name or null
 */

Layouts.prototype.useLayout = function (layout) {
  if (!layout || _.contains(this.options.negatives, layout)) {
    return null;
  }
  return layout;
};

module.exports = Layouts;