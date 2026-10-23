/* Load with defer AFTER app.js and chart-enhancements.js. */
'use strict';
(() => {
  function start() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    const button = (text, action) => {
      const node = element('button', '', text);
      node.type = 'button'; node.addEventListener('click', action);
      return node;
    };

    // Sticky navigation: click to jump immediately; scrolling updates the active link.
    const sections = [
      ['overview', '.hero', 'Overview'], ['national', '#national', 'National'],
      ['people', '#people', 'Age & sex'], ['inequality', '#inequality', 'Disparities'],
      ['geography', '#geography', 'Maps'], ['measurement', '#measurement', 'Measurement'],
      ['sources', '#sources', 'Sources']
    ].map(([id, selector, label]) => ({id, node: document.querySelector(selector), label}))
      .filter(section => section.node);
    sections.forEach(section => { section.node.id = section.id; });
    const nav = element('nav', 'story-nav'); nav.setAttribute('aria-label', 'Page sections');
    const navInner = element('div', 'story-nav-inner wrap');
    navInner.append(element('span', 'story-nav-label', 'ON THIS PAGE'));
    const links = element('div', 'story-nav-links'); navInner.append(links); nav.append(navInner);
    const main = document.querySelector('main');
    if (main) main.before(nav);
    for (const section of sections) {
      section.link = element('a', '', section.label); section.link.href = `#${section.id}`;
      section.link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (location.hash !== `#${section.id}`) history.pushState(null, '', `#${section.id}`);
        section.node.scrollIntoView({behavior: 'instant', block: 'start'});
        updateNav();
      });
      links.append(section.link);
    }
    let navFrame = 0;
    function updateNav() {
      navFrame = 0;
      document.documentElement.style.setProperty('--story-nav-height', `${nav.offsetHeight}px`);
      let current = sections[0];
      const readingLine = nav.getBoundingClientRect().bottom + Math.min(160, innerHeight * .2);
      for (const section of sections) {
        if (section.node.getBoundingClientRect().top <= readingLine) current = section;
      }
      if (scrollY + innerHeight >= document.documentElement.scrollHeight - 3) current = sections.at(-1);
      for (const section of sections) {
        const active = section === current;
        if (active) section.link.setAttribute('aria-current', 'location');
        else section.link.removeAttribute('aria-current');
      }
      if (current && links.scrollWidth > links.clientWidth) {
        const link = current.link;
        if (link.offsetLeft < links.scrollLeft || link.offsetLeft + link.offsetWidth > links.scrollLeft + links.clientWidth) {
          links.scrollLeft = link.offsetLeft - 8;
        }
      }
    }
    const scheduleNav = () => { if (!navFrame) navFrame = requestAnimationFrame(updateNav); };
    window.addEventListener('scroll', scheduleNav, {passive: true});
    window.addEventListener('resize', scheduleNav); updateNav();

    // Reveal the waffle once on first visible entry; Replay can restart it.
    // Scroll checks use the same viewport boundary as the visibility test.
    const waffle = document.getElementById('chart-01');
    let wafflePlayed = false, waffleFrame = 0, cleanWaffle = () => {};
    if (waffle) {
      const tools = element('div', 'story-tools');
      const status = element('span', 'story-animation-status'); status.setAttribute('role', 'status');
      const replay = button('Replay waffle', playWaffle); replay.disabled = true;
      tools.append(replay, status); waffle.before(tools);
      let checkFrame = 0, playing = false;

      function readyWaffle() {
        const svg = waffle.querySelector('svg');
        const marks = svg && svg.querySelector('.mark-rect');
        if (!marks || !marks.querySelector('path, rect')) return null;
        const bounds = marks.getBBox();
        // Vega can create its SVG group before the squares have been laid out.
        if (bounds.width <= 0 || bounds.height <= 0) return null;
        return {svg, marks, bounds};
      }
      function scheduleWaffleCheck() {
        if (!checkFrame) checkFrame = requestAnimationFrame(observeWaffle);
      }
      function playWaffle() {
        cancelAnimationFrame(waffleFrame); cleanWaffle();
        const ready = readyWaffle();
        if (!ready || reduced.matches) {
          status.textContent = reduced.matches ? 'Full population shown; reduced motion enabled.' : '';
          return;
        }
        const {svg, marks, bounds} = ready;
        const ns = 'http://www.w3.org/2000/svg';
        const defs = document.createElementNS(ns, 'defs'); defs.setAttribute('data-story-overlay', 'true');
        const clip = document.createElementNS(ns, 'clipPath');
        clip.id = 'story-waffle-clip'; clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', bounds.x); rect.setAttribute('y', bounds.y);
        rect.setAttribute('width', bounds.width); rect.setAttribute('height', '0');
        clip.append(rect); defs.append(clip); svg.prepend(defs);
        const previous = marks.getAttribute('clip-path'); marks.setAttribute('clip-path', 'url(#story-waffle-clip)');
        playing = true;
        waffle.classList.add('waffle-revealing'); status.textContent = 'Revealing the full population…';
        cleanWaffle = () => {
          if (previous === null) marks.removeAttribute('clip-path'); else marks.setAttribute('clip-path', previous);
          defs.remove(); waffle.classList.remove('waffle-revealing'); playing = false; cleanWaffle = () => {};
        };
        let began;
        function step(time) {
          // A resize can replace Vega's SVG. Retry with the new chart if its
          // first reveal was interrupted, instead of consuming the autoplay.
          if (!svg.isConnected || reduced.matches) {
            cleanWaffle();
            status.textContent = reduced.matches ? 'Full population shown; reduced motion enabled.' : '';
            scheduleWaffleCheck();
            return;
          }
          if (began === undefined) began = time;
          const progress = Math.min(1, (time - began) / 1800);
          rect.setAttribute('height', bounds.height * Math.floor(progress * 20) / 20);
          if (progress < 1) waffleFrame = requestAnimationFrame(step);
          else { wafflePlayed = true; cleanWaffle(); status.textContent = 'Full population shown.'; }
        }
        waffleFrame = requestAnimationFrame(step);
      }
      function observeWaffle() {
        checkFrame = 0;
        const ready = readyWaffle();
        replay.disabled = !ready || reduced.matches;
        if (reduced.matches) {
          if (playing) { cancelAnimationFrame(waffleFrame); cleanWaffle(); }
          if (ready) status.textContent = 'Full population shown; reduced motion enabled.';
          return;
        }
        if (!wafflePlayed && !playing && ready && document.visibilityState === 'visible') {
          const rect = waffle.getBoundingClientRect();
          const viewportHeight = document.documentElement.clientHeight || innerHeight;
          if (rect.top < viewportHeight * .85 && rect.bottom > nav.getBoundingClientRect().bottom) playWaffle();
        }
      }
      // Earlier thresholds (.1/.3) fired before the 85%-of-viewport gate,
      // then never fired at that gate. Scroll + rAF catches the actual crossing.
      window.addEventListener('scroll', () => {
        if (!wafflePlayed && !playing) scheduleWaffleCheck();
      }, {passive: true});
      window.addEventListener('resize', scheduleWaffleCheck);
      document.addEventListener('visibilitychange', scheduleWaffleCheck);
      reduced.addEventListener('change', scheduleWaffleCheck);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(scheduleWaffleCheck, {threshold: [0, .25, .5, .75, 1]}).observe(waffle);
      }
      new MutationObserver(records => {
        if (records.some(record => !record.target.closest?.('[data-story-overlay]'))) scheduleWaffleCheck();
      }).observe(waffle, {childList: true, subtree: true});
      scheduleWaffleCheck();
    }

    // Historical trend: reveal the existing line marks from 2000 to 2021.
    // Axes and legends stay visible, and data coordinates are never changed.
    const trend = document.getElementById('chart-02');
    if (trend) {
      const tools = element('div', 'story-tools');
      const status = element('span', 'story-animation-status'); status.setAttribute('role', 'status');
      const replay = button('Replay trend', playTrend); replay.disabled = true;
      tools.append(replay, status); trend.before(tools);
      let played = false, playing = false, animationFrame = 0, checkFrame = 0;
      let cleanTrend = () => {}, activeSVG = null, activeGroups = [], waitingForSVG = null;

      function readyTrend() {
        const svg = trend.querySelector('svg');
        if (!svg || svg === waitingForSVG) return null;
        const groups = Array.from(svg.querySelectorAll('.mark-line'))
          .filter(group => group.querySelector('path'));
        if (!groups.length) return null;
        const boxes = groups.map(group => group.getBBox());
        if (boxes.some(box => box.width <= 0)) return null;
        waitingForSVG = null;
        return {svg, groups, boxes};
      }
      function scheduleTrendCheck() {
        if (!checkFrame) checkFrame = requestAnimationFrame(observeTrend);
      }
      function stopTrend() {
        cancelAnimationFrame(animationFrame); cleanTrend();
      }
      function playTrend() {
        stopTrend();
        const ready = readyTrend();
        if (!ready || reduced.matches) {
          status.textContent = reduced.matches ? 'Full trend shown; reduced motion enabled.' : '';
          return;
        }
        const {svg, groups, boxes} = ready;
        const ns = 'http://www.w3.org/2000/svg';
        const defs = document.createElementNS(ns, 'defs'); defs.setAttribute('data-story-overlay', 'true');
        const clips = groups.map((group, index) => {
          const box = boxes[index];
          const clip = document.createElementNS(ns, 'clipPath');
          clip.id = `story-trend-clip-${index}`; clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
          const rect = document.createElementNS(ns, 'rect');
          // Small margins retain the line stroke at its endpoints.
          rect.setAttribute('x', box.x - 4); rect.setAttribute('y', box.y - 8);
          rect.setAttribute('height', box.height + 16); rect.setAttribute('width', '0');
          clip.append(rect); defs.append(clip);
          const previous = group.getAttribute('clip-path');
          group.setAttribute('clip-path', `url(#${clip.id})`);
          return {group, previous, rect, width: box.width + 8};
        });
        svg.prepend(defs);
        activeSVG = svg; activeGroups = groups; playing = true;
        trend.classList.add('trend-revealing'); status.textContent = 'Drawing the historical trend, 2000–2021…';
        cleanTrend = () => {
          for (const {group, previous} of clips) {
            if (previous === null) group.removeAttribute('clip-path'); else group.setAttribute('clip-path', previous);
          }
          defs.remove(); trend.classList.remove('trend-revealing'); playing = false;
          activeSVG = null; activeGroups = []; cleanTrend = () => {};
        };
        let began;
        function step(time) {
          if (!svg.isConnected || groups.some(group => !group.isConnected) || reduced.matches) {
            cleanTrend(); scheduleTrendCheck(); return;
          }
          if (began === undefined) began = time;
          // Linear horizontal progress follows the chart's year axis.
          const progress = Math.min(1, (time - began) / 2400);
          for (const clip of clips) clip.rect.setAttribute('width', clip.width * progress);
          if (progress < 1) animationFrame = requestAnimationFrame(step);
          else { played = true; cleanTrend(); status.textContent = 'Full historical trend shown.'; }
        }
        animationFrame = requestAnimationFrame(step);
      }
      function observeTrend() {
        checkFrame = 0;
        const ready = readyTrend(); replay.disabled = !ready || reduced.matches;
        if (reduced.matches) {
          if (playing) stopTrend();
          if (ready) status.textContent = 'Full trend shown; reduced motion enabled.';
          return;
        }
        if (playing) {
          // A filter or resize can replace line groups during a reveal.
          if (!ready || ready.svg !== activeSVG || ready.groups.length !== activeGroups.length ||
              ready.groups.some((group, index) => group !== activeGroups[index])) {
            stopTrend(); scheduleTrendCheck();
          }
          return;
        }
        if (!played && ready && document.visibilityState === 'visible') {
          const box = trend.getBoundingClientRect();
          const viewportHeight = document.documentElement.clientHeight || innerHeight;
          if (box.top < viewportHeight * .85 && box.bottom > nav.getBoundingClientRect().bottom) playTrend();
        }
      }
      window.addEventListener('scroll', () => {
        if (!played && !playing) scheduleTrendCheck();
      }, {passive: true});
      window.addEventListener('resize', scheduleTrendCheck);
      document.addEventListener('visibilitychange', scheduleTrendCheck);
      reduced.addEventListener('change', scheduleTrendCheck);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(scheduleTrendCheck, {threshold: [0, .25, .5, .75, 1]}).observe(trend);
      }
      new MutationObserver(records => {
        if (records.some(record => !record.target.closest?.('[data-story-overlay]'))) scheduleTrendCheck();
      }).observe(trend, {childList: true, subtree: true});
      // A different measure creates a new SVG. Wait for it before replaying,
      // rather than briefly animating the outgoing rate/count chart.
      document.getElementById('trend-mode')?.addEventListener('change', () => {
        waitingForSVG = trend.querySelector('svg'); played = false; stopTrend();
        replay.disabled = true; status.textContent = 'Updating the historical trend…'; scheduleTrendCheck();
      });
      scheduleTrendCheck();
    }

    // State shortcuts reuse the existing dropdown and its linked-map handlers.
    const stateSelect = document.getElementById('state-filter');
    const summary = document.getElementById('state-summary');
    const maps = ['09', '10', '11'].map(id => document.getElementById(`chart-${id}`)).filter(Boolean);
    if (!stateSelect || !summary) return;
    const setState = value => {
      stateSelect.value = value;
      stateSelect.dispatchEvent(new Event('change', {bubbles: true}));
    };
    const shortcuts = element('div', 'map-shortcuts'); shortcuts.setAttribute('aria-label', 'State shortcuts');
    const stateButtons = [];
    for (const option of stateSelect.options) {
      const control = button(option.value === 'All' ? 'All states' : option.value, () => setState(option.value));
      control.setAttribute('aria-pressed', 'false'); shortcuts.append(control); stateButtons.push([option.value, control]);
    }
    summary.after(shortcuts);
    stateButtons.forEach(([, control]) => { control.disabled = true; });
    let readinessChecks = 0;
    function enableShortcuts() {
      if (window.diabetesStory?.views && maps.every(chart => window.diabetesStory.views.has(chart.id.slice(-2)))) {
        stateButtons.forEach(([, control]) => { control.disabled = false; });
      } else if (location.protocol !== 'file:' && readinessChecks++ < 120) {
        setTimeout(enableShortcuts, 100);
      }
    }
    enableShortcuts();
    const help = element('p', 'map-help', 'Click a state to link all three maps. Choose Explore map for a larger view with zoom controls.');
    shortcuts.after(help);

    // Move the ORIGINAL chart into the dialog, preserving Vega tooltips and clicks.
    const dialog = element('dialog', 'map-dialog'); dialog.setAttribute('aria-labelledby', 'map-dialog-title');
    const header = element('div', 'map-dialog-header');
    const title = element('h2', '', 'Explore map'); title.id = 'map-dialog-title';
    header.append(title, button('Close ×', () => dialog.close()));
    const dialogTools = element('div', 'map-dialog-tools');
    const zoomLabel = element('span', 'map-zoom-label', 'Fit');
    dialogTools.append(button('Zoom −', () => changeZoom(-.25)), zoomLabel,
      button('Zoom +', () => changeZoom(.25)), button('Fit map', () => { if (portal) { portal.zoom = 1; resizePortal(); stage.scrollTo(0, 0); } }),
      button('Reset highlight', () => setState('All')));
    const stage = element('div', 'map-stage'); stage.tabIndex = 0; stage.setAttribute('aria-label', 'Map viewport; scroll to explore after zooming');
    const canvas = element('div', 'map-canvas'); stage.append(canvas);
    const dialogSummary = element('p', 'map-dialog-summary'); dialogSummary.setAttribute('aria-live', 'polite');
    dialog.append(header, dialogTools, element('p', 'map-help', 'Click a state to highlight it. Zoom in, then use the scrollbars or touch scrolling to explore.'), stage, dialogSummary);
    document.body.append(dialog);
    let portal = null;
    // Native dialogs are above body content. Keep Vega's shared tooltip in that layer.
    function moveTooltipIntoDialog() {
      const tooltip = document.getElementById('vg-tooltip-element');
      if (portal && tooltip && tooltip.parentElement !== dialog) {
        portal.tooltip = tooltip; dialog.append(tooltip);
      }
    }
    new MutationObserver(moveTooltipIntoDialog).observe(document.body, {childList: true});
    function resizePortal() {
      if (!portal) return;
      const fit = Math.min((stage.clientWidth - 2) / portal.width,
        (stage.clientHeight - 2) / Math.max(1, portal.chart.offsetHeight));
      const scale = Math.max(.1, fit) * portal.zoom;
      canvas.style.width = `${portal.width * scale}px`;
      canvas.style.height = `${portal.chart.offsetHeight * scale}px`;
      portal.chart.style.transform = `scale(${scale})`;
      zoomLabel.textContent = portal.zoom === 1 ? 'Fit' : `${Math.round(portal.zoom * 100)}%`;
    }
    function changeZoom(amount) {
      if (!portal) return;
      portal.zoom = Math.max(1, Math.min(3, portal.zoom + amount)); resizePortal();
    }
    function openMap(chart, opener) {
      if (!chart.querySelector('svg') || portal) return;
      const placeholder = element('div', 'map-placeholder');
      placeholder.style.height = `${chart.offsetHeight}px`; chart.before(placeholder);
      portal = {chart, opener, placeholder, width: chart.clientWidth, oldStyle: chart.getAttribute('style'), zoom: 1};
      title.textContent = chart.closest('figure').querySelector('h4').textContent;
      chart.style.width = `${portal.width}px`; chart.style.maxWidth = 'none';
      chart.style.position = 'absolute'; chart.style.left = '0'; chart.style.top = '0';
      canvas.append(chart); dialog.showModal(); resizePortal(); stage.scrollTo(0, 0);
      moveTooltipIntoDialog();
      dialogSummary.textContent = summary.textContent;
    }
    dialog.addEventListener('close', () => {
      if (!portal) return;
      const previous = portal; portal = null;
      if (previous.tooltip) {
        previous.tooltip.classList.remove('visible'); document.body.append(previous.tooltip);
      }
      previous.placeholder.replaceWith(previous.chart);
      if (previous.oldStyle === null) previous.chart.removeAttribute('style');
      else previous.chart.setAttribute('style', previous.oldStyle);
      previous.opener.focus();
    });
    window.addEventListener('resize', resizePortal);
    for (const chart of maps) {
      const tools = element('div', 'story-tools');
      const explore = button('Explore map ↗', () => openMap(chart, explore));
      tools.append(explore); chart.before(tools);
      const refresh = () => { explore.disabled = !chart.querySelector('svg'); if (portal?.chart === chart) resizePortal(); };
      new MutationObserver(refresh).observe(chart, {childList: true, subtree: true}); refresh();
    }
    function updateState() {
      for (const [value, control] of stateButtons) control.setAttribute('aria-pressed', String(value === stateSelect.value));
      maps.forEach(chart => chart.classList.toggle('map-is-focused', stateSelect.value !== 'All'));
      dialogSummary.textContent = summary.textContent;
    }
    new MutationObserver(updateState).observe(summary, {childList: true, characterData: true, subtree: true});
    stateSelect.addEventListener('change', updateState); updateState();
    if (location.protocol === 'file:') stateButtons.forEach(([, control]) => { control.disabled = true; });
    reduced.addEventListener('change', () => { cancelAnimationFrame(waffleFrame); cleanWaffle(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
