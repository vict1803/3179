/* Headless Vega renderer. Run: node scripts/validate_charts.cjs [output-directory]
   Uses bundled vendor runtimes; no npm dependencies required. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,dependencies={}){
 const context={exports:{},module:{exports:{}},console,setTimeout,clearTimeout,URL,TextDecoder,Buffer,structuredClone,
  require:name=>{if(dependencies[name])return dependencies[name];throw Error('Unexpected dependency '+name);}};
 context.exports=context.module.exports;context.globalThis=context;
 vm.runInNewContext(fs.readFileSync(path.join(root,'vendor',file),'utf8'),context,{filename:file});return context.module.exports;
}
const vega=load('vega.min.js'),vl=load('vega-lite.min.js',{'vega':vega});
const out=path.resolve(process.argv[2]||path.join(root,'validation'));
fs.mkdirSync(out,{recursive:true});
const warnings=[];const logger={level(){return this;},warn(...x){warnings.push(x.join(' '));return this;},info(){return this;},debug(){return this;},error(...x){throw Error(x.join(' '));}};
const loader=vega.loader();loader.load=async uri=>fs.readFileSync(path.join(root,uri),'utf8');
async function main(){
 const results=[];
 for(const f of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.json')).sort()){
  const spec=JSON.parse(fs.readFileSync(path.join(root,'js',f),'utf8'));
  try{
   const compiled=f.endsWith('.vl.json')?vl.compile(spec,{logger}).spec:spec;
   const view=new vega.View(vega.parse(compiled),{renderer:'none',loader,logger}).initialize();
   await view.runAsync();
   const svg=await view.toSVG();fs.writeFileSync(path.join(out,f.replace(/\.v[lg]\.json$/,'.svg')),svg);
   let count=0;
   function visit(x){if(x.items){for(const z of x.items){if(z.datum&&z.mark&&['rect','symbol','path','shape','line'].includes(z.mark.marktype))count++;visit(z);}}}
   visit(view.scenegraph().root);
   if(svg.includes('NaN')||svg.includes('Infinity'))throw Error('Non-finite SVG geometry');
   if(count===0)throw Error('No data marks rendered');
   if(spec.params?.some(p=>p.name==='sexPick')){
    for(const sex of ['Males','Females','All'])await view.signal('sexPick',sex).runAsync();
   }
   if(spec.params?.some(p=>p.name==='statePick')||spec.signals?.some(p=>p.name==='statePick')){
    for(const state of ['ACT','NT','All'])await view.signal('statePick',state).runAsync();
   }
   if(f==='02-trend.vl.json'){
    const c=structuredClone(spec);c.encoding.y={field:'estimated_people',type:'quantitative',title:'Registered people',scale:{zero:true}};
    const vv=new vega.View(vega.parse(vl.compile(c,{logger}).spec),{renderer:'none',loader,logger}).initialize();await vv.runAsync();await vv.toSVG();vv.finalize();
   }
   // Laptop-side column and narrow responsive column: recompile at both widths.
   for(const width of [430,290]){
    const c=structuredClone(spec);c.width=width;if(f==='11-area-cartogram.vg.json')c.height=Math.round(width*.71);
    const runtime=f.endsWith('.vl.json')?vl.compile(c,{logger}).spec:c;
    const small=new vega.View(vega.parse(runtime),{renderer:'none',loader,logger}).initialize();await small.runAsync();
    const svgSmall=await small.toSVG();
    if(svgSmall.includes('NaN'))throw Error('Narrow-width geometry failed');
    fs.writeFileSync(path.join(out,f.replace(/\.v[lg]\.json$/,`-${width}.svg`)),svgSmall);small.finalize();
   }
   view.finalize();results.push({file:f,status:'pass',data_marks:count,svg_bytes:svg.length});console.log('PASS',f,count,'marks');
  }catch(e){results.push({file:f,status:'fail',error:e.stack});console.log('FAIL',f,e.message);}
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,warnings},null,2));
 console.log('Warnings:',warnings);if(results.some(x=>x.status==='fail'))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
