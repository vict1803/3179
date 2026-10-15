# Methods, provenance and limitations

## Source register

1. **AIHW (2026), Diabetes: Australian facts**, data tables dated 27 May 2026. Uploaded file: `AIHW-CVD-96-Diabetes-facts-data-tables-27052026.xlsx`. [Report and downloads](https://www.aihw.gov.au/reports/diabetes/diabetes/data). Uses ABS NHMS microdata for contemporary adult prevalence and linked NDSS/APEG registers for historical registered prevalence.
2. **ABS (2025), National Health Measures Survey, 2022–24**, Tables 4 and 26 and the FPG/HbA1c joint classification table. [Release and downloads](https://www.abs.gov.au/statistics/health/health-conditions-and-risks/national-health-measures-survey/latest-release). Uploaded source workbooks are retained in `data/original/`.
3. **ABS, ASGS Edition 3 (2021), States and Territories GDA2020**. [Boundary downloads](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/access-and-downloads/digital-boundary-files). © Commonwealth of Australia, CC BY 4.0. Boundary vintage matches the period's geography; it is not a claim that 2021 is the newest boundary release.

Public source webpages were consulted 15 October 2026. Source years, rather than report publication years, are shown beside charts. The historical register series ends in 2021 because that is the latest supplied published comparable series. It is not extrapolated to 2026.

These are two publishing organisations and multiple underlying collections: ABS biomedical surveys and NDSS/APEG registration data. AIHW NHMS analysis is not an independent second survey. Its reuse of ABS is acknowledged rather than treated as independent confirmation.

## File-level and cell-level provenance

`data/processed/inventory.json` lists every processed dataset, its population, period, definition, measure and fields. Substantive chart CSVs include `source_ref` with workbook, worksheet and row/column references. `docs/ORIGINAL_FILE_CHECKSUMS.json` records SHA-256 checksums for the supplied files preserved byte-for-byte in `data/original/`.

Figure 1 CSV values are kept at their published chart precision. Confidence intervals, RSE values, estimated counts and caution flags were recovered from the accompanying AIHW workbook; the additional columns were blank in the supplied CSV. AIHW's Persons estimates supply the age-only plot; male and female percentages are never averaged.

Figure 4's workbook supplies more precision and source uncertainty than its chart CSVs; the page displays one decimal. The two supplied Figure 4 CSVs are retained unchanged. The separate self-reported Figure 3 CSV is cleaned and retained as a supporting dataset, but not plotted: the full workbook supplies the annual register series, so both sources are not merged or duplicated on the page.

## Definitions

- **Prevalence:** people living with diabetes in a defined population at a given period. It is not incidence.
- **Known diabetes:** according to the survey definition, self-reported diagnosis with medication use or a relevant elevated blood test.
- **Survey-detected / newly diagnosed diabetes:** no self-reported diagnosis but an elevated test result. This is not annual incidence.
- **FPG:** fasting plasma glucose, available for the eligible fasting-sample population.
- **HbA1c:** glycated haemoglobin, reflecting blood sugar over a longer period; population denominators can differ from FPG.
- **Age-standardised (age-adjusted):** reported rates adjusted to the 2001 Australian Standard Population. These rates are for comparison, not observed shares to multiply by population.

All contemporary AIHW age/sex and population-group charts use the HbA1c-based survey definition. The ABS historical slope graph uses FPG **for both periods** and age-adjusted columns D/E in Table 26.3. Maps use ABS HbA1c counts and rates from Table 4. No survey and registration series has been stitched together.

ABS publication tables and AIHW later microdata analysis can differ slightly because they are separately published estimates with different processing, denominators or rounding. These differences have not been forced to reconcile. Every chart identifies its particular source.

## Processing and calculations

1. Preserve all supplied health files unchanged.
2. Select published rows/columns; reshape to long format where needed.
3. Read numeric values separately from `*`/`#` flags, preserving the flags as caution fields. Retain RSE/CI values when available. `np` remains unavailable, never zero.
4. Remove wholly blank placeholder rows from the supporting self-report CSV without inventing intermediate observations. Annual registered values come directly from the workbook.
5. Convert ABS Table 4.1's thousands to people by multiplying by 1,000. No count is derived from an age-standardised rate.
6. For the waffle, represent rounded national 5.6% known and 0.9% newly diagnosed as 56 and 9 of 1,000 cells, respectively. The remaining 935 cells are the complement, including high-risk and other adults not classified with diabetes. This is approximate display rounding, not synthetic participants.
7. Ratios and narrative values use the appropriate published estimates: 10.25 / 2.91 ≈ 3.5 for the most/least disadvantaged age-adjusted comparison. 1,308,091 / 460,180 ≈ 2.84 for growth in registered counts. Narratives distinguish point estimates from significance claims.

## Geography and maps

- Join the eight state codes 1–8. Omit Other Territories because no corresponding state estimate is supplied. No region with a missing estimate is assigned zero.
- Conventional maps use a spherical **Albers equal-area conic projection**, standard parallels 18°S and 36°S, central longitude 134°E. This suits Australia's mid-latitude east–west extent and preserves area relationships.
- State boundaries are simplified with Douglas–Peucker tolerance 0.025 degrees and four-decimal coordinates. Only the largest polygon for each state is retained (mainland or Tasmania main island); offshore outlines are omitted and the ACT hole is retained. These are generalised display boundaries, not legal boundaries. Published counts still cover the source's full state survey coverage.
- The proportional symbols use **area**, not radius, for published affected-person counts. Positions are manually selected representative interior locations; they are not case or clinic coordinates.
- The non-contiguous cartogram first projects shapes to Albers equal-area coordinates, then scales each state uniformly so final polygon area is exactly proportional to its affected-person count (common target area/count coefficient 0.07 in the display coordinate system). Shapes are moved into schematic geographic positions to prevent overlap and improve legibility. Distances and adjacency are not preserved. Small ACT and NT labels are explicit.
- Cartogram **area = count**, **colour = age-adjusted prevalence**. These are different attributes, not redundant quantitative encoding. The colour scale is identical to the choropleth (3–9%).

## Classification diagram

The alluvial diagram uses the actual joint FPG/HbA1c cells, not inferred transitions from separate margins. The 85.0% cell classified as “no diabetes” by both methods is deliberately omitted to reveal the smaller groups, leaving bands totalling 12.8% of eligible adults. It is a cross-classification, not change over time.

All reported pairs sum to 97.8%, so **2.2% is not represented by a reported pair**. The source states that total persons includes unavailable test results, and privacy adjustment can also cause non-additivity. No missing flows are fabricated or assigned to specific categories. Node heights represent the displayed subset, not the whole population. The 0.1% cell retains its high-margin-of-error caution.

## Reliability and scope

- AIHW `*` marks RSE of 25–50%; the source workbook restores flags missing from the chart CSVs. The page includes the affected age/sex groups explicitly.
- For population groups, caution fields also use the supplied underlying RSE values where at least 25%. This is an indicator of underlying sample precision; it is not a recalculation of uncertainty for an age-standardised estimate.
- NT HbA1c RSE and margin of error are not published in Table 4.2/4.4 (`np`); the point estimate is shown with this limitation, not treated as precise.
- Very remote areas and discrete Aboriginal and Torres Strait Islander communities are excluded from general NHMS coverage. The maps do not represent a census of those communities. Outer regional and remote are combined in the AIHW comparison.
- The dashboard does not make First Nations comparisons; it avoids conflating the general NHMS with the distinct NATSIHMS coverage.
- Socioeconomic quintiles describe areas and should not be interpreted as an individual's income. Associations are not causal effects.
- Registration is voluntary and incompletely captures diagnosed and undiagnosed diabetes. Demographic growth and changing coverage can affect counts.
- Risk-factor denominators differ with eligibility and sample availability. No inference of co-occurrence among individual people is made. High blood pressure's with/without-diabetes difference is not statistically significant in AIHW's analysis.
- Sex follows source sex-at-birth reporting, with confidentiality-related exclusions. Values are rounded for display, not altered to create a desired story.

## Accessibility, design and performance

All content is on one scrolling page. There are no controls that replace major story sections. Key controls are keyboard accessible, figures have descriptive labels, source CSVs are retained in the repository, and the static SVG preview works from a local file. Consistent colour meanings, limited direct labels, narrow paragraphs and shared alignment edges reflect the user's prior feedback.

Sans-serif headings and Times New Roman body text avoid remote font requests, with local fallback fonts if needed. Dashboard download links and numerical tables have been removed at the user's request; the underlying CSV and readable JSON files remain in the repository. Pinned local Vega 5.33.0, Vega-Lite 5.23.0 and Vega-Embed 6.29.0 provide reproducible, CDN-independent rendering. Their BSD licences are in `vendor/`. Charts and alluvial/cartogram SVG paths are newly created from source data; no third-party chart graphics, icons or photographs are embedded.

## AI acknowledgement

OpenAI ChatGPT/Codex assisted with source inspection, data extraction scripts, chart specifications, layout, narrative drafting and verification. The public datasets remain the evidence for numerical claims. Victoria should review the final content, adapt it to his submitted sketch and tutor feedback, and explain the implementation and choices independently in the interview.
