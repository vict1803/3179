/* Buildless, local-asset Vega/Vega-Lite embedding. No account or network dependency. */
'use strict';
/* the list of charts to create */
const charts = [
 ['01','01-waffle.vl.json','diagnosis_status.csv'],
 ['02','02-trend.vl.json','registered_trend.csv'],
 ['03','03-survey-change.vl.json','survey_change.csv'],
 ['04','04-age-profile.vl.json','age_overall.csv'],
 ['05','05-age-sex.vl.json','age_sex.csv'],
 ['06','06-disadvantage.vl.json','socioeconomic.csv'],
 ['07','07-remoteness.vl.json','remoteness.csv'],
 ['08','08-risk-profile.vl.json','risk_profiles.csv'],
 ['09','09-rate-map.vl.json','states.csv'],
 ['10','10-count-map.vl.json','states.csv'],
 ['11','11-area-cartogram.vg.json','states.csv'],
 ['12','12-test-classification.vg.json','test_classification.csv']
];
/*These will remember the dashboard's current setting, views store the rendered, interactive charts using their IDs*/
const views = new Map();
let sex = 'All', state = 'All', metric = 'prevalence_pct';
async function renderChart([id,file]) {
 const target=document.getElementById(`chart-${id}`);
 try {
  const response=await fetch(`js/${file}`); if(!response.ok) throw Error(`Specification HTTP ${response.status}`);
  const spec=await response.json();
  spec.width=Math.max(260,Math.floor(target.clientWidth));
  if(id==='11')spec.height=Math.round(spec.width*.71);
  if(spec.params)for(const p of spec.params){if(p.name==='sexPick')p.value=sex;if(p.name==='statePick')p.value=state;}
  if(spec.signals)for(const signal of spec.signals)if(signal.name==='statePick')signal.value=state;
  if(id==='02' && metric==='estimated_people'){
   spec.encoding.y={field:'estimated_people',type:'quantitative',title:'Registered people',scale:{zero:true},axis:{format:'~s'}};
  }
  const previous=views.get(id);
  /*This is where the active cleanup happens */
  if(previous)previous.finalize();
  const result=await vegaEmbed(target,spec,{actions:false,renderer:'svg',tooltip:true,loader:vega.loader({baseURL:new URL('./',location.href).href})});
  views.set(id,result.view);
 } catch(error) {
  target.replaceChildren();const p=document.createElement('p');p.className='chart-error';
  p.textContent='This chart could not load. Open the folder through the included local server or GitHub Pages, then refresh the page.';
  target.append(p); console.error(`Chart ${id}:`,error);
 }
}
async function updateSignals(ids,name,value)
{await Promise.all(ids.map(async id=>{const view=views.get(id);
    if(view)await view.signal(name,value).runAsync();}));}
/*It is to set up the dashboard */
async function main(){
 if(location.protocol==='file:'){
  document.getElementById('file-warning').hidden=false;
  for(const [id,file] of charts){
   const img=document.createElement('img');img.src='previews/'+file.replace(/\.v[lg]\.json$/,'.svg');
   img.alt=document.getElementById(`chart-${id}`).getAttribute('aria-label');img.style.width='100%';
   document.getElementById(`chart-${id}`).replaceChildren(img);
  }
  document.querySelectorAll('select,button').forEach(el=>el.disabled=true);
  return;
 }
 document.querySelectorAll('.chart').forEach(el=>{el.innerHTML='<p class="loading">Loading chart…</p>';});
 await Promise.all(charts.map(renderChart));
 const states=vega.read(await(await fetch('data/processed/states.csv')).text(),{type:'csv'});
 document.getElementById('sex-filter').addEventListener('change',async e=>{sex=e.target.value;await updateSignals(['02','05','06'],'sexPick',sex);});
 document.getElementById('trend-mode').addEventListener('change',async e=>{metric=e.target.value;await renderChart(charts[1]);});
 async function selectState(value){
  state=value;document.getElementById('state-filter').value=value;
  await updateSignals(['09','10','11'],'statePick',value);
  const row=states.find(r=>r.abbr===value);
  document.getElementById('state-summary').textContent=row?`${row.state}: ${Number(row.prevalence_pct).toFixed(1)}% age-adjusted prevalence; ${Number(row.estimated_people).toLocaleString('en-AU')} estimated adults with diabetes. ${row.caution||''}`:'Hover over a region for its estimate. The control highlights all three maps.';
 }
 document.getElementById('state-filter').addEventListener('change',e=>selectState(e.target.value));
 document.getElementById('reset-state').addEventListener('click',()=>selectState('All'));
 for(const id of ['09','10','11']){const v=views.get(id);if(v)v.addEventListener('click',(event,item)=>{if(item&&item.datum&&item.datum.abbr)selectState(item.datum.abbr);});}
 // Re-embed at the new container width, retaining the selected filters.
 let timer;let lastWidth=window.innerWidth;
 window.addEventListener('resize',()=>{if(window.innerWidth===lastWidth)return;lastWidth=window.innerWidth;clearTimeout(timer);timer=setTimeout(async()=>{
  await Promise.all(charts.map(renderChart));
  for(const id of ['09','10','11']){const v=views.get(id);if(v)v.addEventListener('click',(event,item)=>{if(item?.datum?.abbr)selectState(item.datum.abbr);});}
 },180);});
 window.diabetesStory={views,charts};
}
document.addEventListener('DOMContentLoaded',()=>main().catch(error=>console.error('Story startup:',error)));
