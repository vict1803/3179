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

## Larger typography verification — 23 October 2026

All 12 charts passed the headless renderer at the default size and 430px/290px widths with no Vega warnings. Desktop browser measurements confirmed body text 20px, prose subheadings 32px, chart titles 27px and notes 16px. SVG text bounds were checked for all 12 charts at desktop and a 375px content viewport with no text outside the SVG boundaries. The narrow page content width matched its 375px viewport; body text was 19px. The hidden state dropdown and reset controls no longer appear, and the VIC state button continued to update the map summary. Original style.css comments and source health data are retained.

## Title and paragraph emphasis verification — 23 October 2026

Desktop browser measurements confirmed the main title at 120px and chapter/source headings at 64px, with all 12 charts present and no chart-error elements. At a 375px content viewport, the main title was 54px and section titles 40px, with no overflowing headings or horizontal page overflow. The new inline accent colours have at least 4.5:1 contrast against their backgrounds. The page text was compared after removing markup and is unchanged; JavaScript, data, chart specifications, previews, vendor assets and original style.css are unchanged from the previous ZIP.

## Shared chart alignment and section accents — 23 October 2026

The earlier per-plot caption-offset approach caused desktop captions to start at different x positions (approximately 503–611px). All 12 captions, notes and SVG canvases now start at the same column position (503.109375px in the checked desktop viewport). Waffle outer padding was removed; its first square starts within approximately 1px of the shared edge due to the rounded/stroked mark. Internal axis-label space remains within other charts’ SVG canvases.

The map was enlarged and closed, confirming restoration to the shared edge. At 375px mobile and after resizing to an 805px content viewport, caption offset from each figure edge was zero; no horizontal page overflow occurred. Five section accents and matching active navigation styles were checked in the browser. All 12 charts passed default, 430px and 290px headless rendering with no Vega warnings after the waffle padding update.

## Waffle autoplay verification — 23 October 2026

The updated JavaScript passed Node’s syntax check. In a browser, a test positioned the waffle 20px before its first-entry boundary and then scrolled by 40px: the reveal started and completed on desktop and in a 375px mobile content viewport, retaining all 1,000 squares. Returning to the chart after completion did not replay automatically. Clicking Replay started a fresh reveal with a zero-height clip. The clip was removed after completion and the Full population shown status appeared. Existing data, chart specifications, alignment and styles are unchanged.

## Historical line reveal verification — 23 October 2026

The new script passed Node’s syntax check. Browser checks crossed the entry boundary with a 40px scroll on desktop and a 375px mobile content viewport. Each triggered one reveal and completed with no animation clips remaining. Replay attached three zero-width clips together. Axes and the legend remained present. Choosing Males and then Registered people produced one line, the correct Registered people axis title and a new reveal. Returning to the chart after completion did not replay it automatically. The mobile page had no horizontal overflow, with all 12 charts present. Data, JSON specifications, other runtime files and source comments are unchanged.

## Connected storyline verification

The final narrative update adds five chapter introductions, five section takeaways, four transition questions and a revised closing synthesis. Copy was checked against the existing chart values and methodological notes, preserving the distinction between adult survey estimates and all-age registrations, as well as uncertainty and non-causality cautions.

Browser checks found all 12 SVG charts present without chart-error elements. Desktop, 375px mobile and 805px tablet content widths had no page overflow or overflowing new headings/takeaways. All 12 figure captions and SVG canvases remained aligned to their figure edge on desktop and mobile. The active navigation state continued to identify Measurement at the conclusion. The mobile takeaway and desktop conclusion were visually reviewed.

Compared with the preceding ZIP, the only changed runtime files are `index.html` and `typography.css`. Documentation was updated separately. All previous HTML comments, original `style.css`, JavaScript, chart specifications, previews, processed data and vendor files remain unchanged. The 11 original data files retain their recorded SHA-256 checksums. Local HTML asset paths and unique IDs were checked. The final ZIP passes its archive integrity check. No new statistical calculations or chart rendering code were introduced by this narrative update.
