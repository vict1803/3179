"""Download ABS ASGS 2021 state shapes and simplify them for the webpage.
Uses only Python's standard library. Source is CC BY 4.0, Commonwealth of Australia.
"""
from pathlib import Path
import urllib.request, zipfile, io, struct, json, math
ROOT=Path(__file__).resolve().parents[1]
URL='https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/access-and-downloads/digital-boundary-files/STE_2021_AUST_SHP_GDA2020.zip'

def simplify(points,tol=.025):
    if len(points)<4:return points
    a,b=points[0],points[-1];dx=b[0]-a[0];dy=b[1]-a[1]
    def dist(p):
        t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
        return (p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2
    k=max(range(1,len(points)-1),key=lambda i:dist(points[i]))
    if dist(points[k])>tol*tol:return simplify(points[:k+1],tol)[:-1]+simplify(points[k:],tol)
    return [a,b]

def main():
    local=Path('/tmp/diabetes-boundaries')
    if local.exists(): files={x.suffix:x.read_bytes() for x in local.iterdir() if x.is_file()}
    else:
        z=zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(URL,timeout=60).read()))
        files={Path(n).suffix:z.read(n) for n in z.namelist()}
    db=files['.dbf'];n,header,recsize=struct.unpack_from('<IHH',db,4)
    fields=[];i=32
    while db[i]!=13:
        fields.append((db[i:i+11].split(b'\0')[0].decode(),db[i+16]));i+=32
    props=[]
    for k in range(n):
        rec=db[header+k*recsize:header+(k+1)*recsize];off=1;p={}
        for name,size in fields:p[name]=rec[off:off+size].decode('utf-8',errors='replace').strip();off+=size
        props.append(p)
    shp=files['.shp'];offset=100;features=[];k=0
    while offset<len(shp):
        _,length=struct.unpack_from('>ii',shp,offset);content=shp[offset+8:offset+8+length*2];offset+=8+length*2
        p=props[k];k+=1
        code=p.get('STE_CODE21');name=p.get('STE_NAME21')
        if code not in list('12345678'):continue
        parts,points=struct.unpack_from('<ii',content,36)
        starts=list(struct.unpack_from('<'+'i'*parts,content,44))+[points]
        pts=[list(struct.unpack_from('<dd',content,44+4*parts+16*j)) for j in range(points)]
        polygons=[]
        for a,b in zip(starts,starts[1:]):
            ring=pts[a:b]
            if not ring:continue
            area=sum(ring[i][0]*ring[i+1][1]-ring[i+1][0]*ring[i][1] for i in range(len(ring)-1))/2
            if abs(area)<.0009:continue
            if not any(110<x<155 and -45<y<-9 for x,y in ring):continue
            # Split closed rings before Douglas–Peucker to avoid a zero-length baseline.
            mid=len(ring)//2
            simp=simplify(ring[:mid+1])[:-1]+simplify(ring[mid:])
            if len(simp)<4:continue
            simp=[[round(x,4),round(y,4)] for x,y in simp]
            if simp[0]!=simp[-1]:simp.append(simp[0])
            if area<0 or not polygons:polygons.append([simp])
            else:polygons[-1].append(simp)
        # Retain the largest polygon per state. This avoids collapsed offshore slivers
        # causing spherical winding artefacts, and keeps a lightweight mainland map.
        def signed_area(r):
            return sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1))/2
        polygons=[max(polygons,key=lambda poly:abs(signed_area(poly[0])))]
        features.append(dict(type='Feature',properties=dict(state_code=code,state=name),
                             geometry=dict(type='MultiPolygon',coordinates=polygons)))
    assert len(features)==8
    out=ROOT/'data/geo/australia_states.geojson'
    out.write_text(json.dumps(dict(type='FeatureCollection',features=features),separators=(',',':')))
    (ROOT/'data/geo/SOURCE.md').write_text(f'''# Boundary provenance

Australian Bureau of Statistics, ASGS Edition 3, States and Territories, 2021, GDA2020.
Downloaded 15 October 2026. Source: {URL}
Copyright Commonwealth of Australia, CC BY 4.0.

Adaptation: retained codes 1–8 and only the largest polygon per state (mainland or Tasmania's main island), including its holes; offshore island outlines and Other Territories are omitted. Douglas–Peucker simplification at 0.025 degrees; coordinates rounded to 4 decimals. Generalised display boundaries, not legal boundaries. Shapefile winding is retained for D3/Vega geographic rendering. Published health estimates still represent the source's full state coverage; no health observations were altered by boundary simplification.
''')
    print('Prepared',len(features),'ABS state features;',out.stat().st_size,'bytes')
if __name__=='__main__':main()
