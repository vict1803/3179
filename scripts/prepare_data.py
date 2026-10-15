"""Rebuild chart data from the supplied public workbooks (requires openpyxl).
Original files are never edited. Row references are Excel's one-based coordinates.
"""
from pathlib import Path
import csv, json, re, shutil
import openpyxl

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'data/original'
OUT = ROOT / 'data/processed'
AIHW = 'AIHW-CVD-96-Diabetes-facts-data-tables-27052026.xlsx'
cache = {}
inventory = []

def sheet(filename, name):
    key = (filename, name)
    if key not in cache:
        wb = openpyxl.load_workbook(RAW / filename, read_only=True, data_only=True)
        cache[key] = list(wb[name].iter_rows(max_col=32, values_only=True))
        wb.close()
    return cache[key]

def cell(rows, row, col):
    return rows[row-1][col-1]

def number(v):
    if isinstance(v, (int, float)): return v
    if v is None or str(v).strip() in ['np', '. .', '—', '']: return None
    return float(re.search(r'-?\d+(?:\.\d+)?', str(v))[0])

def flag(v):
    return 'Use with caution' if '*' in str(v) or '#' in str(v) else ''

def ci(v):
    ns = re.findall(r'\d+(?:\.\d+)?', str(v))
    return [float(n) for n in ns[:2]] if len(ns) >= 2 else [None, None]

def save(name, rows, source, population, period, definition, measure):
    assert rows
    keys = list(dict.fromkeys(k for row in rows for k in row))
    with (OUT / name).open('w', newline='', encoding='utf-8') as f:
        wr = csv.DictWriter(f, keys); wr.writeheader(); wr.writerows(rows)
    inventory.append(dict(file=name, source=source, period=period,
        population=population, definition=definition, measure=measure,
        rows=len(rows), fields=keys))

def main():
    OUT.mkdir(exist_ok=True, parents=True)
    p = sheet(AIHW, 'Diabetes prevalence')
    rows=[]
    # Preserve the user's downloaded chart values; recover uncertainty from the workbook.
    with (RAW/'diabetes_age_sex.csv').open(encoding='utf-8-sig') as f:
        age_csv=list(csv.DictReader(f))
    for i, raw in enumerate(age_csv):
        r=6+i
        for sex, col, rsecol, ncol in [('Males',8,5,2),('Females',10,6,3)]:
            lo,hi=ci(cell(p,r,col+1))
            rows.append(dict(age_group=raw['Age group'], sex=sex,
                prevalence_pct=float(raw[sex]), ci_low=lo, ci_high=hi,
                rse_pct=cell(p,r,rsecol), caution=flag(cell(p,r,col)),
                estimated_people=cell(p,r,ncol), period='2022–24',
                source_ref=f'{AIHW} | Diabetes prevalence | row {r}; CSV Figure 1'))
    save('age_sex.csv',rows,'AIHW Diabetes prevalence Table 1 / supplied Figure 1 CSV',
         'Adults 18+', '2022–24', 'NHMS: HbA1c + self-reported diagnosis/medication','Age-specific prevalence (%)')
    rows=[]
    for r in range(6,11):
        lo,hi=ci(cell(p,r,13))
        rows.append(dict(age_group=cell(p,r,1),prevalence_pct=cell(p,r,12),
            estimated_people=cell(p,r,4),ci_low=lo,ci_high=hi,rse_pct=cell(p,r,7),
            source_ref=f'{AIHW} | Diabetes prevalence | L{r}:M{r}'))
    save('age_overall.csv',rows,'AIHW Diabetes prevalence Table 1','Adults 18+',
         '2022–24','NHMS: HbA1c + self-report','Age-specific prevalence (%)')
    rows=[]
    for r in range(62,84):
        for sex,ncol,vcol in [('Males',2,5),('Females',3,6),('Persons',4,7)]:
            rows.append(dict(year=cell(p,r,1),sex=sex,estimated_people=cell(p,r,ncol),
                prevalence_pct=cell(p,r,vcol),source_ref=f'{AIHW} | Diabetes prevalence | row {r}'))
    save('registered_trend.csv',rows,'AIHW Diabetes prevalence Table 4','Registered population; all ages',
         '2000–2021','Linked NDSS/APEG registered diabetes; excludes gestational diabetes',
         'Age-standardised prevalence (%) and published counts')
    # Self-report series: omit empty placeholder rows, without interpolation/imputation.
    rows=[]
    with (RAW/'Figure 3_ Prevalence of self-reported diabetes from the National.csv').open(encoding='utf-8-sig') as f:
        for r in csv.DictReader(f):
            if not r['Persons']: continue
            for sex in ['Males','Females','Persons']:
                rows.append(dict(period=r['Year'],sex=sex,prevalence_pct=float(r[sex])))
    save('self_reported_trend.csv',rows,'Supplied AIHW Figure 3 CSV (retained for comparison, not plotted)',
         'NHS survey population','2001–2022','Self-reported diagnosed diabetes',
         'Age-standardised prevalence (%)')
    for name,rr in [('remoteness',range(121,124)),('socioeconomic',range(125,130))]:
        rows=[]
        for i,r in enumerate(rr):
            for sex,col,rcol in [('Males',14,5),('Females',16,6),('Persons',18,7)]:
                lo,hi=ci(cell(p,r,col+1));rse=cell(p,r,rcol)
                rows.append(dict(group=cell(p,r,1),order=i+1,sex=sex,
                    prevalence_pct=number(cell(p,r,col)),ci_low=lo,ci_high=hi,
                    caution='Use with caution' if rse>=25 else '',rse_pct=rse,
                    source_ref=f'{AIHW} | Diabetes prevalence | row {r}, column {col}'))
        save(name+'.csv',rows,'AIHW Diabetes prevalence Table 6','Adults 18+; very remote excluded',
             '2022–24','NHMS: HbA1c + self-report','Age-standardised prevalence (%)')
    r=sheet('NHMSDC26.xlsx','Table 26.3_Proportions')
    rows=[]
    for status,row in [('Known diabetes',43),('Newly diagnosed diabetes',44)]:
        for period,col in [('2011–12',4),('2022–24',5)]:
            rows.append(dict(status=status,period=period,prevalence_pct=cell(r,row,col),
                source_ref=f'NHMSDC26.xlsx | Table 26.3_Proportions | row {row}, column {col}'))
    save('survey_change.csv',rows,'ABS NHMS Table 26.3','Adults 18+; fasting sample',
         '2011–12 and 2022–24','FPG + self-report; same measure in both periods',
         'Age-standardised prevalence (%)')
    rates=sheet('NHMSDC04.xlsx','Table 4.3_Proportions')
    estimates=sheet('NHMSDC04.xlsx','Table 4.1_Estimates')
    rses=sheet('NHMSDC04.xlsx','Table 4.2_RSEs')
    names=['New South Wales','Victoria','Queensland','South Australia','Western Australia','Tasmania','Northern Territory','Australian Capital Territory']
    abbr=['NSW','VIC','QLD','SA','WA','TAS','NT','ACT']
    lon=[146,-0,144,135,122,146.7,133,149.1];lon[1]=144.6
    lat=[-31.5,-37,-23,-30,-25,-42,-19,-35.4]
    tiles=[(2,1),(2,2),(2,0),(1,1),(0,1),(2,3),(1,0),(3,2)]
    rows=[]
    for i,name in enumerate(names):
        col=i+2;rse=cell(rses,38,col)
        rows.append(dict(state_code=str(i+1),state=name,abbr=abbr[i],
            prevalence_pct=number(cell(rates,39,col+9)),crude_pct=number(cell(rates,39,col)),
            estimated_people=round(cell(estimates,38,col)*1000),
            represented_adults=round(cell(estimates,39,col)*1000),
            rse_pct=number(rse),caution='Precision not published' if rse=='np' else '',
            lon=lon[i],lat=lat[i],tile_col=tiles[i][0],tile_row=tiles[i][1],
            source_ref=f'NHMSDC04.xlsx | 4.3 row 39; 4.1 row 38; 4.2 row 38 | state column {col}'))
    save('states.csv',rows,'ABS NHMS Tables 4.1, 4.2, 4.3','Adults 18+; survey coverage exclusions apply',
         '2022–24','HbA1c + self-reported diagnosis/medication',
         'Age-standardised rate (%); published estimates in thousands converted to people')
    q=sheet(AIHW,'Risk factors');rows=[]
    labels=['High blood pressure','Abnormal blood lipids','Overweight or obesity','Elevated waist circumference']
    for status,rr in [('With diabetes',[7,8,10,11]),('Without diabetes',[13,14,16,17])]:
        for i,row in enumerate(rr):
            lo,hi=ci(cell(q,row,19))
            rows.append(dict(group=status,factor=labels[i],order=i,
                prevalence_pct=number(cell(q,row,18)),ci_low=lo,ci_high=hi,
                source_ref=f'{AIHW} | Risk factors | R{row}:S{row}'))
    save('risk_profiles.csv',rows,'AIHW Risk factors Table 1','Adults 18+; measure-specific denominators',
         '2022–24','NHMS: HbA1c + self-report','Age-standardised risk-factor prevalence (%)')
    # Waffle uses rounded published national proportions; cells are approximate, not individuals.
    rows=[]
    for i in range(1000):
        status='Known diabetes' if i<56 else 'Newly diagnosed diabetes' if i<65 else 'Not classified with diabetes'
        rows.append(dict(cell=i,col=i%50,row=i//50,status=status,cell_pct=0.1))
    save('waffle.csv',rows,'AIHW Diabetes prevalence Tables 1–2; national rounded 5.6% and 0.9%',
         'Adults 18+','2022–24','NHMS: HbA1c + self-report','Approximate unit display; each square = 0.1 percentage point')
    # Keep a compact source table alongside the display grid.
    save('diagnosis_status.csv',[dict(status=cell(p,i,1),prevalence_pct=number(cell(p,i,12)),
         estimated_people=cell(p,i,4),source_ref=f'{AIHW} | Diabetes prevalence | row {i}') for i in range(27,31)],
         'AIHW Diabetes prevalence Table 2','Adults 18+','2022–24','NHMS: HbA1c + self-report','Crude prevalence (%)')
    comparison=next(x.name for x in RAW.glob('Comparison*.xlsx'))
    q=sheet(comparison,'Sheet1');rows=[]
    labels=['Diabetes','At high risk','No diabetes']
    for a in range(3):
        for b in range(3):
            raw=cell(q,a+4,b+3)
            rows.append(dict(hba1c=labels[a],fpg=labels[b],percent=number(raw),
                caution='Use with caution' if '(c)' in str(raw) else '',
                source_ref=f'{comparison} | Sheet1 | row {a+4}, column {b+3}'))
    save('test_classification.csv',rows,'ABS NHMS FPG/HbA1c comparison table',
         'Adults 18+ with a fasting sample','2022–24','Cross-classification by HbA1c and FPG',
         'Joint percentages of eligible population; reported pairs total 97.8%')
    (OUT/'inventory.json').write_text(json.dumps(inventory,indent=2,ensure_ascii=False))
    print('Prepared',len(inventory),'datasets; original workbooks unchanged.')

if __name__=='__main__': main()
