'use strict';

var Layouts = require('../');
var file = require('fs-utils');
var matter = require('gray-matter');
var File = require('vinyl');

function loadLayouts (layouts) {
  file.find('test/fixtures/layouts/*.hbs').forEach(function (filepath) {
    var obj = matter.read(filepath);
    var layout = new File({contents: new Buffer(obj.content)});
    layout.locals = obj.data;
    layout.orig = new Buffer(obj.original);
    layouts.set(file.basename(filepath), layout);
  });
}

function loadPages () {
  return file.find('test/fixtures/pages/*.hbs').map(function (filepath) {
    var obj = matter(file.readFileSync(filepath));
    var page = new File({contents: new Buffer(obj.content)});
    page.locals = obj.data;
    page.orig = new Buffer(obj.original);
    return page;
  });
}

describe('Layouts', function () {
  it('should create a layout stack', function () {
    var layouts = new Layouts({layout: 'default'});
    loadLayouts(layouts);
    console.log(layouts);
    console.log();

    var stack = layouts.createStack({layout: 'default'});
    console.log('stack', stack);
    console.log();

    var pages = loadPages();
    console.log('pages', pages);
    console.log();

    pages.forEach(function (page) {
      var template = layouts.render(page);
      console.log('template', template.contents.toString());
    });

  });
});