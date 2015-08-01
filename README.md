# path-rewriter 
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A path rewriter for node.js

## Install

```sh
$ npm install --save path-rewriter
```

## Examples

Rewrite using a regular expression, rewriting `/i123` to `/items/123`.

```js
var Rewriter = require('path-rewriter'); 
var rewriter = new Rewriter();
rewriter.rule(/^\/i(\w+)/, '/items/$1');
console.log(rewriter.rewrite('/i123'));  // '/items/123'
```

Rewrite using rule parameters, references may be named
or numeric. For example rewrite `/foo..bar` to `/commits/foo/to/bar`:

```js
var Rewriter = require('path-rewriter');
var rewriter = new Rewriter();
rewriter.rule('/:src..:dst', '/commits/$1/to/$2');
console.log(rewriter.rewrite('/foo..bar'));  // '/commits/foo/to/bar'

var rewriter = new Rewriter();
rewriter.rule('/:src..:dst', '/commits/:src/to/:dst');
console.log(rewriter.rewrite('/foo..bar'));  // '/commits/foo/to/bar'
```

You may also use the wildcard `*` to soak up several segments,
for example `/js/vendor/jquery.js` would become
`/public/assets/js/vendor/jquery.js`:

```js
var Rewriter = require('path-rewriter');
var rewriter = new Rewriter();
rewriter.rule('/js/*', '/public/assets/js/$1');
console.log(rewriter.rewrite('/js/vendor/jquery.js'));  // '/public/assets/js/vendor/jquery.js'
```

In the above examples, the original query string (if any) is left untouched.
The regular expression is applied to the full url, so the query string
can be modified as well:

```js
var Rewriter = require('path-rewriter');
var rewriter = new Rewriter();
rewriter.rule('/file\\?param=:param', '/file/:param');
console.log(rewriter.rewrite('/file?param=foo'));  // '/file/foo'
```

The query string delimiter (?) must be escaped for the regular expression
to work.

## License

MIT © [Tao Yuan]()

[npm-image]: https://badge.fury.io/js/path-rewriter.svg
[npm-url]: https://npmjs.org/package/path-rewriter
[travis-image]: https://travis-ci.org/taoyuan/path-rewriter.svg?branch=master
[travis-url]: https://travis-ci.org/taoyuan/path-rewriter
[daviddm-image]: https://david-dm.org/taoyuan/path-rewriter.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/taoyuan/path-rewriter
[coveralls-image]: https://coveralls.io/repos/taoyuan/path-rewriter/badge.svg
[coveralls-url]: https://coveralls.io/r/taoyuan/path-rewriter
