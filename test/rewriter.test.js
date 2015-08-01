'use strict';
var t = require('chai').assert;
var Rewriter = require('..');

describe('rewriter', function () {
  it('should add rule with type', function () {
    var rewriter = new Rewriter();
    rewriter.rule('custom', '/foo', '/bar');
    t.lengthOf(rewriter._rules, 1);
    t.equal(rewriter._rules[0].type, 'custom');
    t.equal(rewriter._rules[0].from, '/foo');
    t.equal(rewriter._rules[0].to, '/bar');
  });

  it('should add rule without type', function () {
    var rewriter = new Rewriter();
    rewriter.rule('/foo', '/bar');
    t.lengthOf(rewriter._rules, 1);
    t.equal(rewriter._rules[0].type, '*');
    t.equal(rewriter._rules[0].from, '/foo');
    t.equal(rewriter._rules[0].to, '/bar');
  });

  it('should add rule using in type', function () {
    var rewriter = new Rewriter();
    rewriter.in('/foo', '/bar');
    t.lengthOf(rewriter._rules, 1);
    t.equal(rewriter._rules[0].type, 'in');
    t.equal(rewriter._rules[0].from, '/foo');
    t.equal(rewriter._rules[0].to, '/bar');
  });

  it('should add rule using out type', function () {
    var rewriter = new Rewriter();
    rewriter.out('/foo', '/bar');
    t.lengthOf(rewriter._rules, 1);
    t.equal(rewriter._rules[0].type, 'out');
    t.equal(rewriter._rules[0].from, '/foo');
    t.equal(rewriter._rules[0].to, '/bar');
  });

  it('should add rule using object rule', function () {
    var rewriter = new Rewriter();
    rewriter.rule({from: '/foo', to: '/bar'});
    t.lengthOf(rewriter._rules, 1);
    t.equal(rewriter._rules[0].type, '*');
    t.equal(rewriter._rules[0].from, '/foo');
    t.equal(rewriter._rules[0].to, '/bar');
  });

  it('should throw assertion error if the source and the destination is not match', function () {
    var rewriter = new Rewriter();
    t.throw(function () {
      rewriter.rule('/foo', '/bar/$1');
    });
  });

  it('should rewrite using wild type', function () {
    var rewriter = new Rewriter();
    rewriter.rule('/foo', '/bar');
    var p = rewriter.rewrite('/foo');
    t.equal(p, '/bar');
  });

  it('should rewrite with custom type', function () {
    var rewriter = new Rewriter();
    rewriter.rule('custom', '/foo', '/bar');
    var p = rewriter.rewrite('custom', '/foo');
    t.equal(p, '/bar');
  });

  it('should rewrite match wild route', function () {
    var rewriter = new Rewriter();
    rewriter.rule('/foo', '/bar');
    var p = rewriter.rewrite('custom', '/foo');
    t.equal(p, '/bar');
  });

  it('should not rewrite without matching rule', function () {
    var rewriter = new Rewriter();
    rewriter.rule('custom1', '/foo', '/bar');
    var p = rewriter.rewrite('custom2', '/foo');
    t.equal(p, '/foo');
  });

  it('should rewrite correctly with named parameter', function () {
    var rewriter = new Rewriter();
    rewriter.rule('in', '/foo/:name', '/bar/:name');
    var p = rewriter.rewrite('in', '/foo/hello');
    t.equal(p, '/bar/hello');
  });

  it('should rewrite correctly with wildcard * parameter ', function () {
    var rewriter = new Rewriter();
    rewriter.rule('in', '/foo/*', '/bar/$1');
    var p = rewriter.rewrite('in', '/foo/hello/world');
    t.equal(p, '/bar/hello/world');
  });

  it('should rewrite correctly for destination without parameter ', function () {
    var rewriter = new Rewriter();
    rewriter.rule('in', '/foo/*', '/bar');
    var p = rewriter.rewrite('in', '/foo/hello/world');
    t.equal(p, '/bar');
  });

  it('should rewrite using a regular expression', function () {
    var rewriter = new Rewriter();
    rewriter.rule(/^\/i(\w+)/, '/items/$1');
    var p = rewriter.rewrite('/i123');
    t.equal(p, '/items/123');
  });

  it('should rewrite using route named parameters', function () {
    var rewriter = new Rewriter();
    rewriter.rule('/:src..:dst', '/commits/:src/to/:dst');
    var p = rewriter.rewrite('/foo..bar');
    t.equal(p, '/commits/foo/to/bar');
  });

  it('should rewrite using route numeric parameters', function () {
    var rewriter = new Rewriter();
    rewriter.rule('/:src..:dst', '/commits/$1/to/$2');
    var p = rewriter.rewrite('/foo..bar');
    t.equal(p, '/commits/foo/to/bar');
  });
});
