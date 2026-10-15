# Chart plan and idiom count

The story: **How diabetes prevalence has changed, who is more affected, and how the picture differs across populations and places.** The measurement section explains why estimates from different methods must not be stitched together.

| # | Idiom | Classification | Source | Question and rationale |
| --- | --- | --- | --- | --- |
| 1 | Waffle | Advanced | AIHW Diabetes prevalence Tables 1–2, NHMS 2022–24 | How common is known or survey-detected diabetes? Repeated equal units give an accessible national overview. |
| 2 | Multi-line chart, with count/rate toggle | Basic | AIHW Diabetes prevalence Table 4, NDSS/APEG 2000–2021 | Did counts and age-adjusted prevalence change alike? A single axis at a time preserves interpretability. |
| 3 | Slope graph | Advanced | ABS NHMS Table 26.3, FPG 2011–12 vs 2022–24 | Which diagnosis-status estimates changed between the two surveys? Endpoint comparison, with status labels instead of a separate legend. |
| 4 | Dot plot | Basic | AIHW Diabetes prevalence Table 1, Persons | How does overall prevalence differ by age? Common-position encoding supports accurate comparisons. |
| 5 | Age × sex heatmap | Advanced | Supplied Figure 1 CSV plus AIHW Table 1 uncertainty | Where are the high-prevalence age/sex combinations? Ordered rows and separate sex columns expose the joint pattern. |
| 6 | Connected dot plot / dumbbell | Basic (conservative) | AIHW Diabetes prevalence Table 6 | How do male/female estimates differ across disadvantage groups? Connections expose within-group gaps. |
| 7 | Bar chart | Basic | AIHW Diabetes prevalence Table 6, remoteness | How do city and regional/remote categories compare? A zero baseline supports simple magnitude comparison. |
| 8 | Parallel coordinates | Advanced | AIHW Risk factors Table 1 | How do health-characteristic profiles differ between adults with and without diabetes? Four vertical quantitative axes share a 0–100% scale; legend focus and tooltips support reading. |
| 9 | Choropleth map | Advanced; map idiom 1 | ABS NHMS Table 4.3, ASGS 2021 state boundaries | Where are age-adjusted rates higher? Normalised rates, not counts, determine lightness. |
| 10 | Proportional symbol map | Advanced; map idiom 2 | ABS NHMS Table 4.1, state display locations | Where are larger affected-person populations? Symbol area represents published counts, not radius. |
| 11 | Non-contiguous area cartogram | Advanced; map idiom 3 | ABS Tables 4.1/4.3; derived ABS display shapes | How does a people-scaled Australia differ from the land-scaled map? Area represents counts; colour adds the distinct prevalence measure. |
| 12 | Alluvial / Sankey cross-classification | Advanced | Supplied ABS FPG/HbA1c comparison table | Do the two tests assign the same adults to the same categories? Joint observations support the links; no longitudinal flow is implied. |

**Totals: 12 charts; 8 advanced; 4 basic; 3 maps; 3 distinct map idioms.** Counts treat each standalone idiom once, not each layer, sex, time point, map region or filter setting. The dumbbell is deliberately counted as basic. The supplied study summary explicitly discusses slope graphs as advanced, alongside waffle, heatmap and network idioms. Final marking remains the tutor's judgement of effective and meaningful idiom use.

## Story structure

1. National scale: known/detected diabetes, long-run registered trend, and a separate two-period survey comparison.
2. Who: overall age differences, then the age/sex combinations.
3. Population characteristics: disadvantage, remoteness, and associated health profiles.
4. Geography: rates on conventional areas, counts as symbols, then areas resized around affected populations.
5. Measurement: a cross-classification explaining why diagnostic definitions affect reported results.

## Applying previous feedback

- No treemap: no hierarchical partition justifies one.
- Stable sex colours: males blue, females terracotta. Prevalence uses a sequential teal scale; diagnosis status uses purple/ochre consistently.
- Constant mark colour is used when position or size already carries the number. Cartogram colour and area encode **different** measures.
- White space, two main alignment edges, narrow paragraph columns and clear headings create a consistent visual hierarchy.
- Tooltips carry individual values. Narrative annotations describe patterns and limitations; not every mark is permanently labelled.
- The age dot plot answers the broad age question; the heatmap adds the joint sex dimension. Three maps explicitly teach different readings of geography rather than silently repeating a rate map.
- No fabricated individual-level distributions, artificial boxplots, causal claims, or imputed years are used to inflate idiom complexity.

## Design references

The user's supplied FIT3179 Study Summary sections on advanced table idioms, network idioms and cartograms informed selection. The supplied FAQ informed local/raw asset loading, relative URLs, figure–ground separation, small files, and responsive sizing. General principles are explained in the rationale; no existing chart graphics or example layouts were copied.
