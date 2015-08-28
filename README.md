# Virtual DOM app running in a Web Worker

This is a proof-of-concept to show how a web app can run entirely in a
Web Worker, off the main thread. The app sends DOM patches to the main
thread, which applies them. Event handlers can be attached to the
Virtual DOM and are propagated back from the main thread to the Web
Worker.

Note that there are a number of hacks in place currently to make all
of this work in spite of existing shortcomings, particularly the
serialisation required between main thread and Web Worker.

A very slow operation is performed in the Web Worker to demonstrate
how that it does *not* impact the rendering of the main thread (the
animation is smooth).  Uncommenting the same expensive code in the
main thread visibly blocks the CSS animation.

## Install & Run

```
$ npm install
$ python -mSimpleHTTPServer
```

Open [http://localhost:8000/](http://localhost:8000/) in your browser.
