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

    // Reveal the waffle row by row, once on entry. A clip avoids 1,000 separate animations.
    const waffle = document.getElementById('chart-01');
    let wafflePlayed = false, waffleFrame = 0, cleanWaffle = () => {};
    if (waffle) {
      const tools = element('div', 'story-tools');
      const status = element('span', 'story-animation-status'); status.setAttribute('role', 'status');
      const replay = button('Replay waffle', playWaffle); replay.disabled = true;
      tools.append(replay, status); waffle.before(tools);
      function playWaffle() {
        cancelAnimationFrame(waffleFrame); cleanWaffle();
        const svg = waffle.querySelector('svg'), marks = svg && svg.querySelector('.mark-rect');
        if (!marks || reduced.matches) { status.textContent = reduced.matches ? 'Full chart shown; reduced motion enabled.' : ''; return; }
        const ns = 'http://www.w3.org/2000/svg', bounds = marks.getBBox();
        const defs = document.createElementNS(ns, 'defs'); defs.setAttribute('data-story-overlay', 'true');
        const clip = document.createElementNS(ns, 'clipPath');
        clip.id = 'story-waffle-clip'; clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', bounds.x); rect.setAttribute('y', bounds.y);
        rect.setAttribute('width', bounds.width); rect.setAttribute('height', '0');
        clip.append(rect); defs.append(clip); svg.prepend(defs);
        const previous = marks.getAttribute('clip-path'); marks.setAttribute('clip-path', 'url(#story-waffle-clip)');
        waffle.classList.add('waffle-revealing'); status.textContent = 'Revealing the full population…'; wafflePlayed = true;
        cleanWaffle = () => {
          if (previous === null) marks.removeAttribute('clip-path'); else marks.setAttribute('clip-path', previous);
          defs.remove(); waffle.classList.remove('waffle-revealing'); cleanWaffle = () => {};
        };
        let began;
        function step(time) {
          if (!svg.isConnected || reduced.matches) { cleanWaffle(); status.textContent = ''; return; }
          if (began === undefined) began = time;
          const progress = Math.min(1, (time - began) / 1800);
          rect.setAttribute('height', bounds.height * Math.floor(progress * 20) / 20);
          if (progress < 1) waffleFrame = requestAnimationFrame(step);
          else { cleanWaffle(); status.textContent = 'Full population shown.'; }
        }
        waffleFrame = requestAnimationFrame(step);
      }
      const observeWaffle = () => {
        replay.disabled = !waffle.querySelector('svg .mark-rect');
        if (!wafflePlayed && !replay.disabled && !reduced.matches) {
          const rect = waffle.getBoundingClientRect();
          if (rect.top < innerHeight * .85 && rect.bottom > nav.offsetHeight) playWaffle();
        }
      };
      new IntersectionObserver(observeWaffle, {threshold: [.1, .3]}).observe(waffle);
      new MutationObserver(records => {
        if (records.some(record => !record.target.closest?.('[data-story-overlay]'))) observeWaffle();
      }).observe(waffle, {childList: true, subtree: true});
      observeWaffle();
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
