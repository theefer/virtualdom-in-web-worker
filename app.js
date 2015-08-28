import patch from 'virtual-dom/patch';
import Delegator from 'dom-delegator';
import virtualize from 'vdom-virtualize';

import {primeFactorization} from './spin-loader';


const worker = new Worker('worker.js');
worker.postMessage({
  action: 'import',
  module: 'worker-impl'
});

const delegator = Delegator();
// console.log(Delegator, delegator);
// delegator.addGlobalEventListener('click', function() {
//   console.log("LISTENER", arguments);
// });


const out = document.getElementById('out');

worker.addEventListener('message', function(event) {
  const data = event.data;
  if (data.type === 'patch') {
    const d = data.patch;

    // Transform plain Object tree back into tree of Virtual* instances
    hydrate(d);

    patch(out, d);
  }


  // Really slow operation that blocks execution

  // TEST - uncomment the following to show the effect of really slow JavaScript in the main UI thread (should block the animation) vs doing it in the Web Worker as it is currently done.

  // primeFactorization(5000000000425343804321);

  console.log("main: message", data);
});


import VirtualNode  from 'virtual-dom/vnode/vnode';
import VirtualText  from 'virtual-dom/vnode/vtext';
import VirtualPatch from 'virtual-dom/vnode/vpatch';
import EvHook       from 'virtual-dom/virtual-hyperscript/hooks/ev-hook';

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

      // TODO: receive list of nodes (id as data-attr?) and dispatch
      // respective events -- read some DOM properties..?

      // starts with ev-
      if (key.slice(0, 3) === 'ev-') {
        const def = obj[key].value;
        obj[key] = new EvHook(function(event) {
          console.log("node", event, def);

          // Virtualize Nodes to make them serializable
          // FIXME: might be expensive, virtualize whole DOM, esp currentTarget?
          event.target = virtualize(event.target);
          event.currentTarget = virtualize(event.currentTarget);
          event.toElement = virtualize(event.toElement);

          // FIXME: won't serialize ;_;
          delete event.target.properties.dataset;
          delete event.currentTarget.properties.dataset;
          delete event.toElement.properties.dataset;
          delete event._rawEvent;
          delete event.view;

          worker.postMessage({
            action: 'event',
            id: def.emit,
            event: event
          });
        });
      }
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
  } else if ('value' in obj) {
    return EvHook.prototype;
  }
}
