importScripts('jspm_packages/system.js', 'config.js');


console.log("worker: HI");

this.addEventListener('message', function(event) {
  var data = event.data;
  if (data.action === 'import') {
    System.import(data.module);
  }
  console.log("worker: message", event);
  console.log("data", event.data);
});
