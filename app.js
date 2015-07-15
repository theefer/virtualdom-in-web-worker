import VirtualNode  from 'virtual-dom/vnode/vnode';
import VirtualText  from 'virtual-dom/vnode/vtext';
import VirtualPatch from 'virtual-dom/vnode/vpatch';

import patch from 'virtual-dom/patch';

const worker = new Worker('worker.js');
worker.postMessage({
  action: 'import',
  module: 'worker-impl'
});

// import h     from 'virtual-dom/h';
// import diff  from 'virtual-dom/diff';
// const el1 = h('span', ['hello']);
// const el2 = h('span', ['hello', h('span', 'world')]);
// const diffed = diff(el1, el2)
// console.log("local", diffed, "from worker", data.patch);

const out = document.getElementById('out');

worker.addEventListener('message', function(event) {
  console.log("main: message", event);
  const data = event.data;
  if (data.type === 'patch') {
    const d = data.patch;

    // Transform plain Object tree back into tree of Virtual* instances
    hydrate(d);

    patch(out, d);
  }
});


// Note: mutates object in place for performance, bleh
function hydrate(obj) {
  if (obj === null) {
    /* noop */
  } else if (Array.isArray(obj)) {
    // recurse
    obj.forEach(hydrate);
  } else if (typeof obj === 'object') {
    const proto = guessProto(obj);
    if (proto) {
      obj.__proto__ = proto;
    }

    // recurse
    Object.keys(obj).forEach(key => {
      hydrate(obj[key]);
    });
  } else {
    /* scalar - noop */
  }
}

// Terribly hacky and brittle
function guessProto(obj) {
  if ('patch' in obj && 'type' in obj && 'vNode' in obj) {
    return VirtualPatch.prototype;
  } else if ('children' in obj && 'count' in obj && 'tagName' in obj /* etc */) {
    return VirtualNode.prototype;
  } else if ('text' in obj) {
    return VirtualText.prototype;
  }
}
