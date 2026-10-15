# Draft submission description

Review and adapt this text to the official Moodle template. Insert the actual URLs after publishing.

**Visualisation URL:** [insert your own GitHub Pages URL]

**Hand-drawn sketch PDF URL:** [insert the public GitHub URL to your original sketch PDF]

## Domain, why and who

The domain is diabetes prevalence in Australia. The visualisation investigates historical change and differences by age, sex, socioeconomic disadvantage, remoteness and state/territory. Its purpose is to help a general audience distinguish national trends from inequalities between populations, and to understand why affected-person counts, crude prevalence and age-adjusted rates answer different questions.

The intended audience is a general Malaysian reader examining an Australian public-health case study. Terms such as prevalence, newly detected diabetes and age adjustment are explained in plain language. Australian regional categories are introduced beside the relevant charts; no statistical training is assumed.

## What: data and sources

The project combines Australian Institute of Health and Welfare analyses and Australian Bureau of Statistics published tables. AIHW's May 2026 Diabetes: Australian facts workbook supplies NHMS 2022–24 adult prevalence, population-group comparisons, health-characteristic profiles and linked NDSS/APEG registration trends for 2000–2021. ABS NHMS Tables 4 and 26 provide state counts/rates and a consistent FPG comparison between 2011–12 and 2022–24. The ABS FPG/HbA1c joint table supplies observed cross-classifications. ABS ASGS 2021 boundaries supply matching state geography.

Original files are preserved. Processing selects published cells, reshapes data, restores missing CSV reliability metadata from the workbook, and converts published thousands to people. Sources, periods, definitions, uncertainty and exclusions are recorded in the data inventory and methodology. No missing annual values are invented; no count is calculated from an age-adjusted rate. ABS and AIHW both use NHMS for some results, so they are not presented as independent surveys.

## How: design and rationale

The single scrolling webpage has five sections: national scale and change; age and sex; population differences; geography; and measurement. Twelve standalone charts use twelve idioms. The classification plan includes eight advanced idioms and four basic idioms, with the connected dot plot conservatively counted as basic. Three map idioms are a choropleth, proportional symbol map and non-contiguous area cartogram.

The waffle introduces the national scale. A historical line chart toggles between counts and adjusted rates without a dual axis. A slope graph compares diagnosis-status estimates across two survey periods. The age dot plot shows the overall age pattern; a heatmap adds the joint sex dimension. A connected dot plot reveals disadvantage-related sex gaps, a bar chart compares remoteness categories, and parallel coordinates compare four health characteristics on a shared percentage scale. The final alluvial diagram uses observed joint classifications to explain why two tests may disagree, rather than suggesting temporal patient movement.

The choropleth encodes normalised prevalence. Symbol area encodes published affected-person counts. The cartogram resizes state areas in proportion to counts and uses colour for the distinct prevalence measure. Conventional maps use an equal-area conic projection; the cartogram preserves individual shapes while changing scale and using schematic positions. Readers can highlight a state across all maps, filter sex across related charts, select a risk profile, and inspect source estimates and uncertainty.

Consistent semantic colours, short paragraphs, limited annotations, tooltips, clear hierarchy, white space and alignment respond to previous assignment feedback. Numerical data and readable Vega/Vega-Lite specifications are retained in the repository. Download links and numerical tables are omitted from the visible dashboard. All chart rendering uses Vega or Vega-Lite; no exception library is used for diagram rendering.

## AI acknowledgement

OpenAI ChatGPT/Codex assisted with data preparation, code, narrative drafting, design and validation. All figures use the supplied public data. I have reviewed [amend truthfully after review] the content, understand the code and visualisation choices, and created my own hand-drawn sketch.

## Final checks to perform yourself

- Replace both URL placeholders and use the official Moodle template.
- Confirm the page and every embedded element load publicly under your own GitHub account.
- Add your real hand-drawn sketch; do not submit a digital sketch as hand-drawn work.
- Ensure the final page follows your actual sketch and the feedback discussed with your tutor.
- Review each chart, source, limitation and interaction for the Week 12 interview.
