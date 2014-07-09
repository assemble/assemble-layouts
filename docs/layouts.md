Default settings for body regex/delimiters:

```js
var options = {
  delims: ['{{', '}}'],     // start and end delimiters for body tag
  expression: '{{ body }}', // default body tag for empty layouts
  matter: '\\s*body\\s*',   // inner contents of body tag regex
};
```

Assuming parsedLayouts have been read in an parsed, add them to the `layouts` cache:

```js
parsedLayouts.forEach(function (layout) {
  // layout needs to have at least `data` and `content`
  layouts.set(layout.name, layout);
});
```

Render the entire layout stack for a specific page object. assuming
the `page` object has already been read in and parsed and contains a
`data` and `content` property

```js
var template = layouts.render(page);
```