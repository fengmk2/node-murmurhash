/*!
 * node-murmurhash - test/benchmark.js
 *
 * Copyright(c) fengmk2 <fengmk2@gmail.com> (http://fengmk2.com)
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var Benchmark = require('benchmark');
var benchmarks = require('beautify-benchmark');
var murmurhash = require('../');

var MURMURHASH_M = 0x5bd1e995;

// @zhangzifa: 大于127的数, 在c里面的负数, 表示成0xffffffxx才成
var NEGTIVE_MAP = [
  0x0,  0x1,  0x2,  0x3,  0x4,  0x5,  0x6,  0x7,  0x8,  0x9,  0xa,  0xb,
  0xc,  0xd,  0xe,  0xf,  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
  0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23,
  0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
  0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b,
  0x3c, 0x3d, 0x3e, 0x3f, 0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47,
  0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f, 0x50, 0x51, 0x52, 0x53,
  0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x5f,
  0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b,
  0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77,
  0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f,
  0xffffff80, 0xffffff81, 0xffffff82, 0xffffff83, 0xffffff84, 0xffffff85,
  0xffffff86, 0xffffff87, 0xffffff88, 0xffffff89, 0xffffff8a, 0xffffff8b,
  0xffffff8c, 0xffffff8d, 0xffffff8e, 0xffffff8f, 0xffffff90, 0xffffff91,
  0xffffff92, 0xffffff93, 0xffffff94, 0xffffff95, 0xffffff96, 0xffffff97,
  0xffffff98, 0xffffff99, 0xffffff9a, 0xffffff9b, 0xffffff9c, 0xffffff9d,
  0xffffff9e, 0xffffff9f, 0xffffffa0, 0xffffffa1, 0xffffffa2, 0xffffffa3,
  0xffffffa4, 0xffffffa5, 0xffffffa6, 0xffffffa7, 0xffffffa8, 0xffffffa9,
  0xffffffaa, 0xffffffab, 0xffffffac, 0xffffffad, 0xffffffae, 0xffffffaf,
  0xffffffb0, 0xffffffb1, 0xffffffb2, 0xffffffb3, 0xffffffb4, 0xffffffb5,
  0xffffffb6, 0xffffffb7, 0xffffffb8, 0xffffffb9, 0xffffffba, 0xffffffbb,
  0xffffffbc, 0xffffffbd, 0xffffffbe, 0xffffffbf, 0xffffffc0, 0xffffffc1,
  0xffffffc2, 0xffffffc3, 0xffffffc4, 0xffffffc5, 0xffffffc6, 0xffffffc7,
  0xffffffc8, 0xffffffc9, 0xffffffca, 0xffffffcb, 0xffffffcc, 0xffffffcd,
  0xffffffce, 0xffffffcf, 0xffffffd0, 0xffffffd1, 0xffffffd2, 0xffffffd3,
  0xffffffd4, 0xffffffd5, 0xffffffd6, 0xffffffd7, 0xffffffd8, 0xffffffd9,
  0xffffffda, 0xffffffdb, 0xffffffdc, 0xffffffdd, 0xffffffde, 0xffffffdf,
  0xffffffe0, 0xffffffe1, 0xffffffe2, 0xffffffe3, 0xffffffe4, 0xffffffe5,
  0xffffffe6, 0xffffffe7, 0xffffffe8, 0xffffffe9, 0xffffffea, 0xffffffeb,
  0xffffffec, 0xffffffed, 0xffffffee, 0xffffffef, 0xfffffff0, 0xfffffff1,
  0xfffffff2, 0xfffffff3, 0xfffffff4, 0xfffffff5, 0xfffffff6, 0xfffffff7,
  0xfffffff8, 0xfffffff9, 0xfffffffa, 0xfffffffb, 0xfffffffc, 0xfffffffd,
  0xfffffffe, 0xffffffff
];


function murmurhash2js(key, seed) {
  if (typeof seed !== 'number') {
    seed = 97;
  }
  var l = key.length;
  var h = seed ^ l;
  var i = 0;
  var k = null;

  while (l >= 4) {
    k = ((key[i] & 0xff)) |
      ((key[++i] & 0xff) << 8) |
      ((key[++i] & 0xff) << 16) |
      ((key[++i] & 0xff) << 24);

    k = (((k & 0xffff) * MURMURHASH_M) + ((((k >>> 16) * MURMURHASH_M) & 0xffff) << 16));
    k ^= k >>> 24;
    k = (((k & 0xffff) * MURMURHASH_M) + ((((k >>> 16) * MURMURHASH_M) & 0xffff) << 16));

    h = (((h & 0xffff) * MURMURHASH_M) + ((((h >>> 16) * MURMURHASH_M) & 0xffff) << 16)) ^ k;

    l -= 4;
    ++i;
  }

  switch (l) {
    case 3:
      h ^= NEGTIVE_MAP[key[i + 2]] << 16;
    case 2:
      h ^= NEGTIVE_MAP[key[i + 1]] << 8;
    case 1:
      h ^= NEGTIVE_MAP[key[i]];
      h = (((h & 0xffff) * MURMURHASH_M) + ((((h >>> 16) * MURMURHASH_M) & 0xffff) << 16));
  }

  h ^= h >>> 13;
  h = (((h & 0xffff) * MURMURHASH_M) + ((((h >>> 16) * MURMURHASH_M) & 0xffff) << 16));
  h ^= h >>> 15;

  return h >>> 0;
}

var ascii = new Buffer('haha, this is a key');
var utf8 = new Buffer([
  0, 4, 111, 108, 95, 99, 51, 95, 117, 95, 105, 112, 95, -27, -116, -105, -26,
  -98, -127, -25, -69, -110, -25, -122, -108, -24, -98, -115, -28, -72, -109,
  -27, -115, -106, -27, -70, -105, 95, 112
]);

console.log('murmurhash2js', murmurhash2js(ascii));
console.log('murmurhash', murmurhash(ascii));

console.log('murmurhash2js', murmurhash2js(utf8, 12333));
console.log('murmurhash', murmurhash(utf8, 12333));
console.log('murmurhash2js utf8', murmurhash2js(utf8));
console.log('murmurhash utf8', murmurhash(utf8));

// 1248731102
console.log("murmurhash('hello 中国'): %s", murmurhash(new Buffer('hello 中国')));
console.log("murmurhash2js('hello 中国'): %s", murmurhash2js(new Buffer('hello 中国')));

var suite = new Benchmark.Suite();

suite
.add('murmurhash(ascii)', function () {
  murmurhash(ascii);
})
.add('murmurhash2js(ascii)', function () {
  murmurhash2js(ascii);
})
.add('murmurhash(utf8)', function () {
  murmurhash(utf8);
})
.add('murmurhash2js(utf8)', function () {
  murmurhash2js(utf8);
})

.on('cycle', function(event) {
  benchmarks.add(event.target);
})
.on('start', function(event) {
  console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date());
})
.on('complete', function done() {
  benchmarks.log();
})
.run({ 'async': false });

// node version: v1.7.1, date: Mon Apr 20 2015 17:49:27 GMT+0800 (CST)
// Starting...
// 4 tests completed.
//
// murmurhash(ascii)    x 8,273,613 ops/sec ±2.88% (90 runs sampled)
// murmurhash2js(ascii) x 7,850,609 ops/sec ±1.86% (93 runs sampled)
// murmurhash(utf8)     x 7,195,741 ops/sec ±3.21% (90 runs sampled)
// murmurhash2js(utf8)  x 4,168,687 ops/sec ±4.18% (90 runs sampled)
