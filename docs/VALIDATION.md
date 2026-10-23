# Validation record — updated 23 October 2026

## Completed checks

- All **12** Vega/Vega-Lite specifications parse, compile where applicable, execute and render to SVG with **no Vega warnings**.
- Default chart widths, a 430px column and a 290px narrow column were rendered. Representative charts were visually inspected; an offshore-geometry winding issue was corrected, slope labels were separated, and narrow parallel-axis labels and legends were improved.
- Sex filter signals were exercised at Males/Females/All in the three linked charts. State highlight signals were exercised at ACT/NT/All across all three maps, including the native Vega cartogram.
- Both historical chart measures were compiled and rendered: age-adjusted prevalence and registered-person counts.
- Every local HTML asset link and every local data URL in the JSON specifications resolves to an included file.
- The chart layer contains exactly 12 JSON specifications. Three are maps: choropleth, proportional symbols and non-contiguous cartogram.
- Age/sex table: 10 rows; five source caution flags restored. Registered trend: 66 rows (22 years × three population categories). Supporting self-report trend: six observed periods, with no invented intervening years.
- The eight health-data state codes match the eight boundary features. Cartogram display area uses the same area/count coefficient for every state.
- The diagnostic cross-classification sums to the source's reported 97.8%; the omitted normal/normal cell and displayed 12.8% subset are explicitly documented.
- All **11 original data files** match their uploaded bytes, with SHA-256 checksums recorded separately.
- Page runtime assets total approximately **1.07 MB** before transfer compression, conservatively including every processed CSV. Original workbooks and static SVG previews are not requested by the interactive page on load.
- `js/app.js` passes Node's JavaScript syntax check. The Python preparation scripts run successfully.

Machine-readable chart results are in `chart-validation-results.json`. This records the headless chart runs, not a browser test.

## Integrated browser checks - 23 October 2026

The integrated version was checked in a browser with all 12 SVG charts present and no chart-error elements. Checks covered sticky navigation and active-section updates, anchor jumps, the 1,000-square waffle reveal and Replay, linked state buttons, map selections, enlarged-map tooltips, zoom/Fit map, dialog closing with Escape and restored chart placement. A 375px viewport was checked for page overflow and dialog fit. Caption/plot alignment was checked after restoring enlarged maps.

The delivered bundle was checked again headlessly after packaging preparation; the machine-readable results accompany this file. The original source files retain their recorded SHA-256 values. These checks do not substitute for checking the final public GitHub Pages URL on the submission device.

## Content retained

Headings remain sans-serif and body paragraphs Times New Roman. The user's HTML/CSS comments and visible AI declaration are retained. CSV/JSON download links and numerical tables remain removed from the visible dashboard; the underlying files remain available to the charts. The waffle retains 1,000 squares, each representing 0.1 percentage point, with 56 known, 9 newly diagnosed and 935 other squares.

## Remaining submission actions

GitHub Pages has not been published or verified. The required original hand-drawn sketch is not included; see `sketch/README.md`. Submission URLs in the draft description remain placeholders. Review the AI acknowledgement for accuracy and complete the submission materials.

## Alluvial update — 23 October 2026

All 12 charts rendered again at the default width and at 430px/290px without Vega warnings. Browser checks confirmed the two agreement colours, category-label clicks, dropdown selection on both sides, band hover and joint-percentage tooltip, endpoint highlighting, Reset, and the 220ms opacity transition. A 375px content viewport had no horizontal page overflow and the fasting-glucose selection correctly isolated two connected bands. The underlying link/node values, health data and original commented style.css were compared with the preceding ZIP and remain unchanged.
