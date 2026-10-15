"""Shape-preserving non-contiguous cartogram in schematic geographic positions.
Spherical Albers equal-area projection precedes uniform scaling of each state.
Final state polygon area is proportional to the published affected-person count.
Only display geometry changes; counts and rates remain unchanged.
"""
import json,csv,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def albers(lon,lat):
    p1,p2,p0=map(math.radians,[-18,-36,-27]);l0=math.radians(134)
    n=(math.sin(p1)+math.sin(p2))/2;c=math.cos(p1)**2+2*n*math.sin(p1)
    r=math.sqrt(c-2*n*math.sin(math.radians(lat)))/n
    r0=math.sqrt(c-2*n*math.sin(p0))/n;t=n*(math.radians(lon)-l0)
    return [r*math.sin(t),-(r0-r*math.cos(t))]
def area(r):return sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1))/2

def main():
    geo=json.loads((ROOT/'data/geo/australia_states.geojson').read_text())
    states={r['state_code']:r for r in csv.DictReader((ROOT/'data/processed/states.csv').open())}
    positions={'1':(600,300),'2':(600,480),'3':(600,105),'4':(350,300),'5':(120,300),'6':(600,620),'7':(350,105),'8':(845,480)}
    shapes=[]
    for f in geo['features']:
        r=states[f['properties']['state_code']];rings=[[albers(*p) for p in ring] for ring in f['geometry']['coordinates'][0]]
        a=abs(area(rings[0]))-sum(abs(area(x)) for x in rings[1:])
        count=float(r['estimated_people']);target=count*.07;factor=math.sqrt(target/a)
        pts=rings[0];cx=(min(p[0] for p in pts)+max(p[0] for p in pts))/2;cy=(min(p[1] for p in pts)+max(p[1] for p in pts))/2
        px,py=positions[r['state_code']]
        scaled=[[[px+(x-cx)*factor,py+(y-cy)*factor] for x,y in ring] for ring in rings]
        d=' '.join('M'+' L'.join(f'{x:.3f},{y:.3f}' for x,y in ring)+' Z' for ring in scaled)
        shapes.append(dict(state=r['state'],abbr=r['abbr'],path=d,x=px,y=py,estimated_people=count,prevalence_pct=float(r['prevalence_pct']),caution=r['caution'],display_area=target))
    (ROOT/'data/geo/cartogram_shapes.json').write_text(json.dumps(shapes,indent=2))
    spec={'$schema':'https://vega.github.io/schema/vega/v5.json','width':660,'height':470,'padding':{'top':0,'left':0,'right':0,'bottom':50},'background':'transparent',
      'signals':[{'name':'statePick','value':'All'}],
      'data':[{'name':'states','url':'data/geo/cartogram_shapes.json','format':{'type':'json'}}],
      'scales':[{'name':'rate','type':'linear','domain':[3,9],'range':['#e0e9ce','#17665a'],'zero':False}],
      'legends':[{'fill':'rate','title':'Age-adjusted (%)','orient':'bottom','gradientLength':220,'titleFontSize':11,'labelFontSize':11,'titleColor':'#45564e','labelColor':'#45564e','direction':'horizontal'}],
      'marks':[{'type':'path','from':{'data':'states'},'encode':{'update':{
       'path':{'field':'path'},'scaleX':{'signal':'width/1000'},'scaleY':{'signal':'width/1000'},
       'fill':{'scale':'rate','field':'prevalence_pct'},'stroke':{'value':'#f5f4ee'},'strokeWidth':{'value':1.5},
       'opacity':{'signal':"statePick == 'All' || datum.abbr == statePick ? 1 : 0.22"},
       'tooltip':{'signal':"{'State / territory':datum.state,'Estimated affected adults':format(datum.estimated_people, ',.0f'),'Age-adjusted prevalence (%)':format(datum.prevalence_pct,'.1f'),'Precision note':datum.caution}"}}}},
      {'type':'text','from':{'data':'states'},'encode':{'update':{'x':{'signal':'datum.x*width/1000'},'y':{'signal':'datum.y*width/1000'},'text':{'field':'abbr'},'align':{'value':'center'},'baseline':{'value':'middle'},'font':{'value':'Arial'},'fontSize':{'value':11},'fontWeight':{'value':'bold'},'fill':{'signal':"datum.abbr != 'NT' && datum.prevalence_pct > 6 ? '#fff' : '#243d37'"},'opacity':{'signal':"statePick == 'All' || datum.abbr == statePick ? 1 : 0.22"}}}}]}
    (ROOT/'js/11-area-cartogram.vg.json').write_text(json.dumps(spec,indent=2))
    print('Cartogram area/count coefficient:',.07,'for all eight states; positions are schematic.')
if __name__=='__main__':main()
