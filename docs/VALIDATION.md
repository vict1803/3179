# Validation record — 15 October 2026

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

## Verification limits and remaining user actions

The complete HTML/CSS page has **not been exercised in a browser in this environment**. Chart rendering and signal checks were performed with the actual Vega runtimes, with separate visual inspection of rendered charts. Before submission, open the interactive version locally and check the final page at your laptop's width, tooltips, legend interactions and native dropdown controls. The static preview is a fallback, not a substitute for the interactive GitHub Pages check.

GitHub Pages has not been published or verified. The required original hand-drawn sketch is not included; see `sketch/README.md`. Submission URLs in the draft description therefore remain placeholders. Tutor marking of idiom effectiveness and the final classification count cannot be guaranteed by automated checks.

## Typography and dashboard-cleanup update

- Headings use Arial/Helvetica/sans-serif; body paragraphs use Times New Roman/Times/serif. Chart labels and controls remain sans-serif.
- Body and supporting paragraph sizes were adjusted for the new typeface; short paragraph widths and shared grid edges are retained. The main heading scales down further on narrow screens.
- All 12 CSV/JSON download-link groups were removed from the dashboard HTML. Footer implementation-document links were removed. External data-source citations remain.
- The numerical-table creation function and invocation were removed from JavaScript; tables are not merely hidden.
- The AI declaration now has its own marked HTML block, `id="ai-declaration-text"`. See EDITING_GUIDE.md.
- Original health data files and all 12 chart specifications remain in the project.
- Full browser-page layout verification remains outstanding; alignment was checked at the CSS/grid-rule level, not certified by a browser screenshot.
