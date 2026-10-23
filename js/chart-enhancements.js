/* Load after app.js. Chart layout uses one shared CSS column edge. */
'use strict';
(() => {
  function start() {
    // Earlier versions measured every plot's axes and moved its caption.
    // Clear those offsets so waffle, line, bar and map captions share an edge.
    // CSS handles resize, asynchronous charts and maps returning from a dialog.
    document.querySelectorAll('.chart-block').forEach(figure => {
      figure.style.removeProperty('--chart-plot-inset');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once: true});
  } else {
    start();
  }
})();
