
var Layouts = require('../');
var file = require('fs-utils');
var matter = require('gray-matter');

function loadLayouts (layouts) {
  file.find('test/fixtures/layouts/*.hbs').forEach(function (filepath) {
    layouts.set(file.basename(filepath), matter(file.readFileSync(filepath)));
  });
}

function loadPages () {
  return file.find('test/fixtures/pages/*.hbs').map(function (filepath) {
    var page = matter(file.readFileSync(filepath));
    page.contents = page.content;
    delete page.content;
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
      console.log('template', template);
    });

  });

})