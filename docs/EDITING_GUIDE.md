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

- `chart-enhancements.css` aligns captions, rules, controls, full SVG canvases and notes with the shared HTML chart-column edge. `js/chart-enhancements.js` clears legacy offsets; it no longer moves captions according to each chart’s axes. Internal axis spacing remains inside each SVG.
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

## Larger typography — 23 October 2026

`typography.css` is loaded last in index.html so your commented style.css remains intact. Desktop body paragraphs are 20px, prose subheadings up to 32px, chart titles 27px, subtitles 18px and chart notes 16px. Mobile body text is 19px. The variables at the start of typography.css control reading sizes; the media queries scale other headings. Chart axis/legend text is modestly larger in the individual JSON specifications.

The duplicate state label, dropdown and Reset are visually hidden by the final CSS file. Their HTML remains because the existing state buttons use the select internally. All states clears highlighting.

## Title hierarchy and paragraph accents — 23 October 2026

The final block in `typography.css` controls the main title (up to 120px), section titles (up to 64px), and responsive mobile sizes (54px main title, 40px sections at the checked narrow width). Main heading and section titles stay sans-serif; paragraphs remain Times New Roman.

Plum highlights numerical findings (`strong`, with optional `key-stat` soft shading). Teal marks reading concepts (`key-term`). Amber marks interpretation cautions (`reading-caution`). `diagnosis-known` and `diagnosis-new` correspond to the waffle's purple/gold categories, using a darker gold for readable paragraph text. Edit the named CSS classes on the relevant phrases in index.html. Highlights preserve the page wording and every chart's data/colour encodings.

## Shared chart edges and section accents — 23 October 2026

Every figure now starts its caption, rule, controls and notes at its chart-column edge. The old per-plot offset measurement caused headings to stagger between charts with different axes and has been removed. The waffle also has zero outer Vega padding, bringing its first square to the caption edge apart from its small stroke/corner treatment. Other charts reserve the internal room needed for their axes.

The final block of typography.css sets section accents: National teal; Age & sex slate blue; Disparities plum; Maps olive; Measurement bronze. These decorate section badges, eyebrow labels, chart identifiers, divider lines and the active navigation tab. Text and chart marks retain their existing colour meanings. Change each section’s `--chapter-accent`, `--chapter-line` and `--chapter-wash` variables to adjust the theme.

## Waffle first-entry autoplay fix — 23 October 2026

Only js/story-interactions.js changes at runtime. The earlier IntersectionObserver thresholds could fire before the 85%-of-viewport start gate and miss the gate during slow scrolling. A passive scroll listener now schedules a visibility check using requestAnimationFrame. The code also waits for non-empty square marks with positive layout bounds, checks page visibility, and marks the first reveal complete only when it finishes. A replaced SVG can therefore retry if a resize interrupts the first reveal. Replay is retained; reduced-motion preferences show the full chart without animation.

To update an existing copy, replace js/story-interactions.js from this ZIP and hard-refresh the browser. Use a local HTTP server or VS Code Live Server for interactive behaviour; file:// uses static previews.

## Historical line reveal — 23 October 2026

Chart 02 now draws from left to right on first visible entry. `playTrend()` in js/story-interactions.js temporarily clips only the line mark groups, expanding the horizontal reveal across the year axis over a nominal 2400ms. Axes and legends remain visible. All three series share the same progress. Replay trend restarts it; switching between rate and count waits for the new Vega SVG, then reveals that measure. Sex filtering and existing tooltips are preserved. Completed clips are removed. Reduced-motion preferences show the full chart immediately.

To apply this update to your current folder, replace only js/story-interactions.js from the new ZIP and hard-refresh. All earlier layout, colour and waffle autoplay fixes are included.

## Connected story and section takeaways

For this final narrative update, replace `index.html` and `typography.css` from the new ZIP if you already have the preceding version. No additional runtime files are required.

In `index.html`, `.standfirst` introduces the central question. Each `.chapter-intro` frames a section. Each `.section-takeaway` contains its insight in `.takeaway-text`; the first four also contain a `.takeaway-next` transition. The `.closing` block before Sources brings the findings together. Edit the words inside these elements, keeping the surrounding tags. The last block of `typography.css` controls their spacing, colour and responsive sizes.

`docs/STORYLINE.md` records the intended sequence. Keep registrations separate from survey estimates, distinguish counts from prevalence, and retain uncertainty and coverage notes when editing. All earlier HTML comments and the original commented `style.css` are preserved.
