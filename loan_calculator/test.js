const lod = 1;
const foo = 2;
const baz = {};
baz.lod += lod;
baz.foo += foo;
baz.bar = [lod, foo];

function qux() {
  baz.lod += baz.lod;
  baz.foo += baz.foo;
  baz.arr = [baz.lod, baz.bar, baz.foo];
  baz.qux = qux();
}

qux();
baz.qux();
baz.arr;