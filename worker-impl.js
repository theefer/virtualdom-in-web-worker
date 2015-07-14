"format es6";

import h     from 'virtual-dom/h';
import diff  from 'virtual-dom/diff';

const initial = h('span', ['hello']);

function counter(n) {
  return h('span', [`hello: ${n}`]);
}

let i = 0;
let last = initial;
setInterval(() => {
  const next = counter(i++);
  const d = diff(last, next);
  last = next;

  this.postMessage({
    type: 'patch',
    patch: d
  });
}, 1000);
