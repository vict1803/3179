"""Build readable Vega-Lite/Vega JSON specifications. Standard-library only."""
from pathlib import Path
import json,csv,copy
ROOT=Path(__file__).resolve().parents[1]
TEAL='#17665a';INK='#243d37';MALE='#376da5';FEMALE='#bd5b49';KNOWN='#715496';NEW='#b88a22';PALE='#dfe5df'
AGES=['18–44','45–54','55–64','65–74','75+']
SEX=dict(field='sex',type='nominal',scale=dict(domain=['Males','Females','Persons'],range=[MALE,FEMALE,INK]),legend=dict(title=None,orient='top'))
CONFIG=dict(background='transparent',font='Arial',view=dict(stroke=None),
 axis=dict(labelFontSize=13,titleFontSize=13,titleFontWeight='normal',labelColor='#45564e',titleColor='#45564e',domain=False,tickColor='#c7d0c8',gridColor='#e1e6df',labelPadding=8,titlePadding=12),
 legend=dict(labelFontSize=13,titleFontSize=13,labelColor='#45564e',titleColor='#45564e',symbolStrokeWidth=3),
 title=dict(font='Arial',fontSize=19,fontWeight='normal',anchor='start',offset=18,color=INK))
def Q(field,title=None,**kw):return dict(field=field,type='quantitative',title=title,**kw)
def N(field,title=None,**kw):return dict(field=field,type='nominal',title=title,**kw)
def tip(field,title=None,typ='nominal',fmt=None):
 d=dict(field=field,type=typ,title=title or field)
 if fmt:d['format']=fmt
 return d
def base(file,height=300):
 return dict(**{'$schema':'https://vega.github.io/schema/vega-lite/v5.json'},width=660,height=height,
 autosize=dict(type='fit',contains='padding',resize=True),padding=12,
 data=dict(url='data/processed/'+file,format=dict(type='csv')),config=copy.deepcopy(CONFIG))
def save(name,s):
 (ROOT/'js'/name).write_text(json.dumps(s,indent=2,ensure_ascii=False)+'\n')
def sexparam(s):
 s['params']=[dict(name='sexPick',value='All')]
 s.setdefault('transform',[]).append(dict(filter="sexPick == 'All' || datum.sex == sexPick"))
def stateparams(s):s['params']=[dict(name='statePick',value='All')]
def state_opacity(field='abbr'):
 return dict(condition=dict(test=f"statePick == 'All' || datum.{field} == statePick",value=1),value=.22)

def waffle_spec():
 s=base('waffle.csv',220)
 s['transform']=[dict(calculate='toNumber(datum.col)+1',**{'as':'right'}),
                 dict(calculate='toNumber(datum.row)+1',**{'as':'bottom'})]
 s['mark']=dict(type='rect',stroke='#f5f4ee',strokeWidth=1,cornerRadius=1)
 s['encoding']=dict(
  x=Q('col',axis=None,scale=dict(domain=[0,50],nice=False)),x2=dict(field='right'),
  y=Q('row',axis=None,scale=dict(domain=[20,0],nice=False)),y2=dict(field='bottom'),
  color=dict(field='status',type='nominal',scale=dict(
   domain=['Known diabetes','Newly diagnosed diabetes','Not classified with diabetes'],
   range=[KNOWN,NEW,PALE]),legend=None),
  tooltip=[tip('status','Classification'),
           tip('cell_pct','Each square represents (%)','quantitative','.1f')])
 return s

def main():
 save('01-waffle.vl.json',waffle_spec())
 s=base('registered_trend.csv',340);sexparam(s)
 s['mark']=dict(type='line',strokeWidth=2.8)
 s['encoding']=dict(x=Q('year','Year',axis=dict(format='d',tickCount=6),scale=dict(nice=False)),
 y=Q('prevalence_pct','Age-adjusted prevalence (%)',scale=dict(zero=True)),color=copy.deepcopy(SEX),
 tooltip=[tip('year','Year','quantitative','d'),tip('sex','Population'),tip('prevalence_pct','Age-adjusted prevalence (%)','quantitative','.1f'),tip('estimated_people','Registered people','quantitative',',.0f')])
 save('02-trend.vl.json',s)
 s=base('survey_change.csv',280)
 s['transform']=[dict(calculate="(datum.status == 'Known diabetes' ? 'Known: ' : 'Newly detected: ') + format(toNumber(datum.prevalence_pct), '.1f') + '%'",**{'as':'label'})]
 s['encoding']=dict(x=dict(field='period',type='ordinal',sort=['2011–12','2022–24'],title=None,axis=dict(labelAngle=0),scale=dict(padding=.35)),
 y=Q('prevalence_pct','Age-adjusted prevalence (%)',scale=dict(domain=[0,6])),
 color=dict(field='status',scale=dict(domain=['Known diabetes','Newly diagnosed diabetes'],range=[KNOWN,NEW]),legend=None))
 s['layer']=[dict(mark=dict(type='line',strokeWidth=2.5)),dict(mark=dict(type='point',filled=True,size=65),encoding=dict(tooltip=[tip('period','Survey period'),tip('status','Diagnosis status'),tip('prevalence_pct','Age-adjusted prevalence (%)','quantitative','.1f')])),
 dict(transform=[dict(filter="datum.period == '2022–24'")],mark=dict(type='text',align='center',dy=-15,fontSize=12),encoding=dict(text=dict(field='label'))),
 dict(transform=[dict(filter="datum.period == '2011–12'")],mark=dict(type='text',dy=19,fontSize=12),encoding=dict(text=dict(field='prevalence_pct',format='.1f')))]
 save('03-survey-change.vl.json',s)
 s=base('age_overall.csv',290)
 s['mark']=dict(type='point',filled=True,size=115,color=TEAL)
 s['encoding']=dict(x=Q('prevalence_pct','Adults with diabetes (%)',scale=dict(domain=[0,20]),axis=dict(tickCount=5)),
 y=N('age_group',sort=AGES,axis=dict(labelLimit=100)),
 tooltip=[tip('age_group','Age'),tip('prevalence_pct','Prevalence (%)','quantitative','.1f'),tip('estimated_people','Estimated people','quantitative',',.0f'),tip('ci_low','95% interval: low','quantitative','.1f'),tip('ci_high','95% interval: high','quantitative','.1f')])
 save('04-age-profile.vl.json',s)
 s=base('age_sex.csv',300);sexparam(s)
 s['mark']=dict(type='rect',stroke='#f5f4ee',strokeWidth=5,cornerRadius=5)
 s['encoding']=dict(x=N('sex',sort=['Males','Females'],axis=dict(orient='top',labelAngle=0)),y=N('age_group',sort=AGES),
 color=dict(field='prevalence_pct',type='quantitative',scale=dict(domain=[0,20],range=['#e9efdf',TEAL]),legend=dict(title='Prevalence (%)',orient='bottom',gradientLength=200)),
 tooltip=[tip('age_group','Age'),tip('sex','Sex'),tip('prevalence_pct','Prevalence (%)','quantitative','.1f'),tip('caution','Reliability note'),tip('ci_low','95% interval: low','quantitative','.1f'),tip('ci_high','95% interval: high','quantitative','.1f')])
 save('05-age-sex.vl.json',s)
 s=base('socioeconomic.csv',310);sexparam(s)
 s['transform'].insert(0,dict(filter="datum.sex != 'Persons'"))
 s['transform'].append(dict(calculate="replace(replace(datum.group, ' (most disadvantaged)', ''), ' (least disadvantaged)', '')",**{'as':'short_group'}))
 s['encoding']=dict(x=Q('prevalence_pct','Age-adjusted prevalence (%)',scale=dict(domain=[0,15])),y=N('short_group',sort=['Group 1','Group 2','Group 3','Group 4','Group 5']))
 s['layer']=[dict(mark=dict(type='line',color='#c6cdc6',strokeWidth=3),encoding=dict(detail=dict(field='group'),order=dict(field='prevalence_pct',type='quantitative'))),
 dict(mark=dict(type='point',filled=True,size=100),encoding=dict(color=copy.deepcopy(SEX),tooltip=[tip('group','Socioeconomic area'),tip('sex','Sex'),tip('prevalence_pct','Age-adjusted prevalence (%)','quantitative','.1f'),tip('caution','Reliability note'),tip('ci_low','95% interval: low','quantitative','.1f'),tip('ci_high','95% interval: high','quantitative','.1f')]))]
 s['layer'][1]['encoding']['color']['scale']={'domain':['Males','Females'],'range':[MALE,FEMALE]}
 save('06-disadvantage.vl.json',s)
 s=base('remoteness.csv',245);s['transform']=[dict(filter="datum.sex == 'Persons'")]
 s['mark']=dict(type='bar',color=TEAL,cornerRadiusEnd=3,height=25)
 s['encoding']=dict(x=Q('prevalence_pct','Age-adjusted prevalence (%)',scale=dict(domain=[0,10])),
 y=N('group',sort=['Major cities','Inner regional','Outer regional and remote'],axis=dict(labelLimit=150,labelExpr="datum.label === 'Outer regional and remote' ? ['Outer regional', 'and remote'] : datum.label")),
 tooltip=[tip('group','Remoteness'),tip('prevalence_pct','Age-adjusted prevalence (%)','quantitative','.1f'),tip('ci_low','95% interval: low','quantitative','.1f'),tip('ci_high','95% interval: high','quantitative','.1f')])
 save('07-remoteness.vl.json',s)
 s=base('risk_profiles.csv',330)
 factors=['High blood pressure','Abnormal blood lipids','Overweight or obesity','Elevated waist circumference']
 s['params']=[dict(name='profile',select=dict(type='point',fields=['group']),bind='legend')]
 s['encoding']=dict(x=N('factor',sort=factors,axis=dict(labelAngle=0,labelExpr="width < 420 ? (datum.label == 'High blood pressure' ? ['Blood', 'pressure'] : datum.label == 'Abnormal blood lipids' ? ['Blood', 'lipids'] : datum.label == 'Overweight or obesity' ? ['Body', 'weight'] : ['Waist']) : split(datum.label, ' ')",labelLimit=140,grid=True,gridColor='#cbd6cb',ticks=False)),
 y=Q('prevalence_pct','Adults with this characteristic (%)',scale=dict(domain=[0,100]),axis=dict(grid=False)),
 color=dict(field='group',type='nominal',scale=dict(domain=['With diabetes','Without diabetes'],range=[INK,'#9aaba0']),legend=dict(title=None,orient='top',columns=1)),
 opacity=dict(condition=dict(param='profile',value=1),value=.15))
 s['layer']=[dict(mark=dict(type='line',strokeWidth=3)),dict(mark=dict(type='point',filled=True,size=65),encoding=dict(tooltip=[tip('factor','Characteristic'),tip('group','Population'),tip('prevalence_pct','Age-adjusted proportion (%)','quantitative','.1f'),tip('ci_low','95% interval: low','quantitative','.1f'),tip('ci_high','95% interval: high','quantitative','.1f')]))]
 s['layer'][0]['params']=s.pop('params')
 save('08-risk-profile.vl.json',s)
 # All three map specs use the same state codes and linked statePick signal.
 geo=dict(url='data/geo/australia_states.geojson',format=dict(type='json',property='features'))
 projection=dict(type='conicEqualArea',parallels=[-18,-36],rotate=[-134,0,0],center=[0,-27])
 s=base('states.csv',390);s['data']=geo;stateparams(s);s['projection']=projection
 s['transform']=[dict(lookup='properties.state_code',**{'from':dict(data=dict(url='data/processed/states.csv'),key='state_code',fields=['state','abbr','prevalence_pct','estimated_people','caution','crude_pct'])})]
 s['mark']=dict(type='geoshape',stroke='#f5f4ee',strokeWidth=1.3)
 s['encoding']=dict(color=dict(field='prevalence_pct',type='quantitative',scale=dict(domain=[3,9],range=['#e0e9ce',TEAL]),legend=dict(title='Age-adjusted prevalence (%)',orient='bottom',gradientLength=220)),opacity=state_opacity(),
 tooltip=[tip('state','State / territory'),tip('prevalence_pct','Age-adjusted prevalence (%)','quantitative','.1f'),tip('crude_pct','Unadjusted prevalence (%)','quantitative','.1f'),tip('caution','Precision note')])
 s['encoding']['color']['legend']['title']='Age-adjusted (%)'
 save('09-rate-map.vl.json',s)
 s=base('states.csv',390);stateparams(s);s['projection']=projection
 s['layer']=[dict(data=geo,mark=dict(type='geoshape',fill='#e1e5dd',stroke='#f5f4ee',strokeWidth=1)),
 dict(mark=dict(type='circle',color='#596a60',opacity=.72,stroke='#fff',strokeWidth=1),encoding=dict(longitude=Q('lon'),latitude=Q('lat'),
 size=dict(field='estimated_people',type='quantitative',scale=dict(domain=[0,400000],range=[0,4300]),legend=dict(title='Estimated adults',orient='bottom',values=[20000,100000,350000],format='~s')),
 opacity=state_opacity(),tooltip=[tip('state','State / territory'),tip('estimated_people','Estimated adults with diabetes','quantitative',',.0f'),tip('caution','Precision note')])),
 dict(mark=dict(type='text',dy=0,fontSize=10,fontWeight='bold'),encoding=dict(longitude=Q('lon'),latitude=Q('lat'),text=dict(field='abbr'),color=dict(condition=dict(test="datum.abbr == 'NT' || datum.abbr == 'ACT'",value=INK),value='#fff'),opacity=state_opacity()))]
 save('10-count-map.vl.json',s)
 # Native Vega alluvial: observed cross-classification, not a temporal patient flow.
 data=list(csv.DictReader((ROOT/'data/processed/test_classification.csv').open()))
 links=[dict(a=r['hba1c'],b=r['fpg'],percent=float(r['percent']),caution=r['caution']) for r in data if not(r['hba1c']=='No diabetes' and r['fpg']=='No diabetes')]
 cats=['Diabetes','At high risk','No diabetes'];scale=225/sum(r['percent'] for r in links)
 totalsA={c:sum(r['percent'] for r in links if r['a']==c) for c in cats}
 totalsB={c:sum(r['percent'] for r in links if r['b']==c) for c in cats}
 nodes=[];offsets={}
 for side,totals in [('left',totalsA),('right',totalsB)]:
  y=10
  for c in cats:
   offsets[(side,c)]=y
   nodes.append(dict(side=side,label=c,y=y,y2=y+totals[c]*scale));y+=totals[c]*scale+16
 usedA={c:0 for c in cats};usedB=usedA.copy()
 for r in links:
  r['sy']=offsets['left',r['a']]+usedA[r['a']]*scale;r['ty']=offsets['right',r['b']]+usedB[r['b']]*scale;r['h']=r['percent']*scale
  usedA[r['a']]+=r['percent'];usedB[r['b']]+=r['percent']
 s={'$schema':'https://vega.github.io/schema/vega/v5.json','width':660,'height':300,'padding':{'top':30,'left':0,'right':0,'bottom':5},'background':'transparent',
 'signals':[{'name':'lx','update':'width*0.18'},{'name':'rx','update':'width*0.82'}],
 'data':[{'name':'links','values':links},{'name':'nodes','values':nodes}],
 'marks':[{'type':'path','from':{'data':'links'},'encode':{'enter':{'fill':{'value':'#c7d5c8'}},'update':{
 'path':{'signal':"'M'+(lx+10)+','+datum.sy+' C'+(width*0.48)+','+datum.sy+' '+(width*0.52)+','+datum.ty+' '+rx+','+datum.ty+' L'+rx+','+(datum.ty+datum.h)+' C'+(width*0.52)+','+(datum.ty+datum.h)+' '+(width*0.48)+','+(datum.sy+datum.h)+' '+(lx+10)+','+(datum.sy+datum.h)+' Z'"},
 'tooltip':{'signal':"{'HbA1c classification':datum.a,'FPG classification':datum.b,'Eligible adults (%)':datum.percent,'Reliability':datum.caution}"}},'hover':{'fill':{'value':TEAL}}}},
 {'type':'rect','from':{'data':'nodes'},'encode':{'update':{'x':{'signal':"datum.side == 'left' ? lx : rx"},'width':{'value':10},'y':{'field':'y'},'y2':{'field':'y2'},'fill':{'value':INK}}}},
 {'type':'text','from':{'data':'nodes'},'encode':{'update':{'x':{'signal':"datum.side == 'left' ? lx-8 : rx+18"},'y':{'signal':'(datum.y+datum.y2)/2'},'text':{'field':'label'},'align':{'signal':"datum.side == 'left' ? 'right' : 'left'"},'baseline':{'value':'middle'},'font':{'value':'Arial'},'fontSize':{'value':12},'fill':{'value':INK}}}},
 {'type':'text','encode':{'update':{'x':{'signal':'lx'},'y':{'value':-12},'text':{'value':'HbA1c test'},'align':{'value':'center'},'font':{'value':'Arial'},'fontSize':{'value':13},'fontWeight':{'value':'bold'},'fill':{'value':INK}}}},
 {'type':'text','encode':{'update':{'x':{'signal':'rx'},'y':{'value':-12},'text':{'value':'Fasting glucose test'},'align':{'value':'center'},'font':{'value':'Arial'},'fontSize':{'value':13},'fontWeight':{'value':'bold'},'fill':{'value':INK}}}}]}
 from build_alluvial import enhance_alluvial
 save('12-test-classification.vg.json',enhance_alluvial(s))
 print('Built 11 specifications; run build_cartogram.py for chart 11 (12 charts total).')
if __name__=='__main__':main()
