/* Add after js/app.js with defer.
   No changes to app.js or chart JSON needed. */

'use strict';

(() => {
  function start() {
    const charts = Array.from(document.querySelectorAll('.chart'));
    if (!charts.length) return;

    const pending = new Set();
    let frame = 0;

    function align(chart) {
      const figure = chart.closest('.chart-block');
      const svg = chart.querySelector('svg');

      if (!figure) return;

      /* app.js uses static images when index.html is opened as file://.
         Keep the ordinary caption alignment in that fallback mode. */
      if (!svg) {
        figure.style.removeProperty('--chart-plot-inset');
        return;
      }

      /* Vega's root plotting frame starts AFTER padding and axis labels.
         Its screen coordinate accounts for responsive SVG scaling too.
         Use the public SVG DOM, not private Vega runtime properties. */
      const plot = svg.querySelector('g.mark-group.role-frame.root');
      const matrix = plot && plot.getScreenCTM();

      if (!matrix) return;

      const bounds = figure.getBoundingClientRect();
      const inset = Math.max(0, matrix.e - bounds.left);

      if (!Number.isFinite(inset) || inset >= bounds.width) return;

      const value = `${Math.round(inset * 100) / 100}px`;

      if (figure.style.getPropertyValue('--chart-plot-inset') !== value) {
        figure.style.setProperty('--chart-plot-inset', value);
      }
    }

    function schedule(chart) {
      pending.add(chart);

      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;

        for (const item of pending) {
          align(item);
        }

        pending.clear();
      });
    }

    /* Charts load asynchronously and may be rebuilt by app.js.
       Observe only chart content, so caption changes cannot loop. */
    for (const chart of charts) {
      new MutationObserver(() => schedule(chart)).observe(chart, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          'transform',
          'width',
          'height',
          'viewBox'
        ]
      });

      schedule(chart);
    }

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          schedule(entry.target);
        }
      });

      charts.forEach(chart => observer.observe(chart));
    }

    window.addEventListener('resize', () => {
      charts.forEach(schedule);
    });

    window.addEventListener('beforeprint', () => {
      charts.forEach(align);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        charts.forEach(schedule);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {
      once: true
    });
  } else {
    start();
  }
})();