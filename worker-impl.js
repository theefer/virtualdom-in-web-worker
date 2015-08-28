"format es6";

import h     from 'virtual-dom/h';
import diff  from 'virtual-dom/diff';

import {primeFactorization} from './spin-loader';


// TODO: receive initial vdom from main thread
const initial = h('span', ['hello']);

this.addEventListener('message', function(event) {
  var data = event.data;
  if (data.action === 'event') {
    const id = data.id;
    if (registered[id]) {
      registered[id](data.event);
    } else {
      console.error("Received event for unregistered handler, id: " + id);
    }
  }
});

// TODO: free up once no longer used? WeakMap?
const registered = {};
let maxId = 1;
function register(func) {
  const id = `event-${maxId++}`;
  registered[id] = func;
  return {emit: id};
}

let i = 0;

function counter(n) {
  return h('span', [
    `hello: ${n} `,
    h('button', {
      'ev-click': register(ev => {
        console.log("clicked Inc", ev);
        i++;

        // Really slow operation that blocks execution
        primeFactorization(5000000000425343804321);

        render();
      })
    }, 'Inc'),
    h('button', {
      'ev-click': register(ev => {
        console.log("clicked Dec", ev);
        i--;
        render();
      })
    }, 'Dec')
  ]);
}

let last = initial;

function render() {
    const next = counter(i);
    const d = diff(last, next);
    last = next;

    self.postMessage({
        type: 'patch',
        patch: d
    });
}

render();
