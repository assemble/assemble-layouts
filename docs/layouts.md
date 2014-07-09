Default settings for body regex/delimiters:

```js
var options = {
  delims: ['{{', '}}'],     // start and end delimiters for body tag
  expression: '{{ body }}', // default body tag for empty layouts
  matter: '\\s*body\\s*',   // inner contents of body tag regex
};
```

Assuming `parsedLayouts` have been read from the file system and parsed, we can now add them to the `layouts` cache:

```js
var parsedLayouts = glob.sync('layouts/*.hbs');
parsedLayouts.forEach(function (layout) {
  // `layout` must have at `data` and `content` properties
  layouts.set(layout.name, layout);
});
```

## Render the stack

Render the entire layout stack for a specific page object:

```js
var page = {data: {a: 'b', layout: 'default'}, content: 'Howdy {{name}}!'};
var template = layouts.render(page);
```

### page object

The `page` object must have `data` and `content` properties!