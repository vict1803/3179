# Editing fonts, spacing and the AI declaration

## Fonts

Open `style.css`. At the very top, edit:

```css
:root {
  --font-heading: Arial, Helvetica, sans-serif;
  --font-body: "Times New Roman", Times, serif;
}
```

Headings (`h1`, `h2`, `h3`, `h4`) use `--font-heading`. Paragraphs use `--font-body`. Times New Roman is the first choice; Times or a generic serif is used only when Times New Roman is unavailable on the viewing device.

Chart axes, legends, controls and small interface labels remain sans-serif for legibility. Those chart fonts are set in the individual Vega/Vega-Lite JSONs and the spec-building scripts. This is separate from the webpage's body text.

## Spacing and alignment

The next three variables in `style.css` are:

```css
--page-width: 1120px;
--column-gap: 55px;
--row-spacing: 68px;
```

- `--page-width`: maximum overall content width, centred with equal outer margins.
- `--column-gap`: space between the narrative column and chart column.
- `--row-spacing`: space below each text/chart row.

Search for `.story-row` to find the shared two-column layout:

```css
grid-template-columns: minmax(220px, .8fr) minmax(0, 1.75fr);
align-items: start;
```

All story rows use these same column edges. `.prose` starts 20px down; `.chart-block` has a 2px border plus 18px top padding, aligning their content starts. Headings, captions and chart notes use consistent margins rather than manual spaces or repeated `<br>` elements.

Search for `.prose p` for body size, line height and line length. `max-width: 38ch` keeps paragraphs narrow; it approximates a short line, but does not guarantee an exact word count on every device. Font metrics, viewport width and word lengths affect wrapping.

The `@media` rules near the end adjust the columns below 900px and stack them into a single column below 650px. Do not remove those rules when editing the desktop layout.

## Chart alignment and interactions (23 October 2026)

Your commented `index.html` and `style.css` are retained. The HTML loads two additional stylesheets and scripts after the existing project files. Keep that order:

- `chart-enhancements.css` and `js/chart-enhancements.js` align captions and notes with the rendered chart plot, including after resize or re-embedding.
- `story-interactions.css` and `js/story-interactions.js` provide the sticky section navigation, active-section tracking, waffle reveal/replay, state buttons and enlarged map dialog.

The waffle retains 1,000 squares in a 50-by-20 grid. Each square is 0.1 percentage point: 56 known diabetes, 9 newly diagnosed and 935 not classified with diabetes. Its data is in `data/processed/waffle.csv`; its specification is `js/01-waffle.vl.json`. `waffle_rows()` and `waffle_spec()` reproduce this version. No square-height override is needed in `app.js`.

The navigation and map controls are added automatically by the interaction script. Do not paste a second copy into the HTML. The waffle reveal runs once as it enters view; Replay runs it again. Reduced-motion preferences show the completed chart immediately. Map controls use the original chart and its existing linked state selection, so tooltips and clicks continue to work when enlarged.

## AI declaration

Open `index.html` and use Find (`Cmd+F` on Mac or `Ctrl+F` on Windows) for:

```html
id="ai-declaration-text"
```

You will find:

```html
<!-- EDIT AI DECLARATION: change only the wording inside the paragraph below. -->
<div class="ai-declaration" id="ai-declaration">
  <h3>AI declaration</h3>
  <p id="ai-declaration-text">OpenAI ChatGPT/Codex supported data preparation, code, wording and design. The supplied public datasets underpin the figures.</p>
</div>
```

Replace the words between the opening `<p ...>` and closing `</p>` tags with your own accurate declaration. Keep the tags and the surrounding div. Acknowledge the assistance actually used; do not claim that generated work was independently authored without assistance.

For your Moodle submission, also review the AI acknowledgement in `docs/SUBMISSION_DESCRIPTION.md`. The methodology has a fuller account of assistance in `docs/METHODOLOGY.md`; keep these consistent with the dashboard wording.

## Removed dashboard elements

The Data CSV links, Vega/Vega-Lite JSON links and expandable numerical tables have been removed from the visible webpage. The table-building function and its call were removed from `js/app.js`, rather than hidden with CSS.

The data files and chart specifications remain in their folders. Removing those files would break charts and reduce reproducibility. Readable JSON is still available through your GitHub repository, as required by the assignment.

## View your changes

Save the edited files, refresh the page, and inspect it at your laptop's width. For interactions, run `python3 serve.py`; double-clicking `index.html` shows the static preview. If an old version persists, perform a hard refresh.

The chart runtimes and code have been checked; the complete HTML/CSS page still needs visual checking in your own browser. Consistent fonts and alignment support the design, but do not alone guarantee a particular mark.

## Alluvial agreement and connection highlighting

Chart 12 uses indigo (#5261a6) for the same classification and pink (#c65c86) for different classifications. Hovering a band highlights it and its two endpoint categories. Clicking a category or choosing it in Highlight connections keeps its displayed bands highlighted; Reset clears the selection. The dropdown provides keyboard access. Selection survives chart re-embedding after resize. Opacity changes take 220ms and respect reduced-motion settings.

The chart's native Vega signals and mark encodings are in `js/12-test-classification.vg.json`; `connectAlluvialControls()` in `js/app.js` connects the HTML dropdown and Reset. The legend and controls are next to `chart-12` in `index.html`, with styling in `story-interactions.css`. `scripts/build_alluvial.py` adds the same behaviour during a specification rebuild. Source data, band geometry, percentages and the omitted 85.0% group are unchanged.
