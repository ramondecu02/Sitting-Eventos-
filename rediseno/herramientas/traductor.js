/* Traductor «app real → vocabulario del prototipo». Se inyecta en la página real (solo lectura).
   window.__T.screen() devuelve {head, html} de la sección visible. Las reglas de maquetación se
   deduplican en window.__LAY (clase Lnn). Todo lo visual se reescribe con clases del prototipo. */
(function(){
const LAY=window.__LAY||(window.__LAY={m:new Map(),css:[]}); window.__GRPS=window.__GRPS||[];
let RID=0;
const Q=(v,s)=>{ s=s||[0,2,4,6,8,10,12,14,16,20,24,28,32,40,48,64,80]; v=Math.round(v); let b=s[0],d=1e9; for(const x of s){ const e=Math.abs(x-v); if(e<d){ d=e; b=x; } } return b; };
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const SZ=[10,11,12,13,14,15,16,18,20,22,24,28,32,36,40,48,56,64];
/* ── color ── */
function rgb(c){ if(!c) return null; let m=c.match(/rgba?\(([^)]+)\)/); if(m){ const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; }
  m=c.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/); if(m) return {r:+m[1]*255,g:+m[2]*255,b:+m[3]*255,a:m[4]===undefined?1:+m[4]}; return null; }
function tone(c){ const x=rgb(c); if(!x||x.a<0.04) return null; const r=x.r/255,g=x.g/255,b=x.b/255, mx=Math.max(r,g,b), mn=Math.min(r,g,b), L=(mx+mn)/2, d=mx-mn;
  const S=d===0?0:d/(1-Math.abs(2*L-1)); let H=0; if(d){ if(mx===r) H=((g-b)/d)%6; else if(mx===g) H=(b-r)/d+2; else H=(r-g)/d+4; H=(H*60+360)%360; }
  let k; if(S<0.16||d<0.07){ k=L<0.2?'ink':L<0.42?'mut':L<0.6?'fnt':L<0.86?'line':L<0.93?'raise':L<0.985?'bg':'panel'; if(L>=0.998) k='white'; }
  else if(H>=65&&H<165) k='acc'; else if(H>=165&&H<260) k='inf'; else if(H>=15&&H<65) k='war'; else k='dan';
  return {k,L,S,H,a:x.a}; }
/* ── helpers ── */
const vis=(el,cs)=>{ if(cs.display==='none'||cs.visibility==='hidden') return false; const r=el.getBoundingClientRect(); if(r.width<1&&r.height<1) return false; if(+cs.opacity===0) return false; return true; };
const num=s=>parseFloat(s)||0;
function layoutKey(el,cs,par,pcs,rect,prect,opts){
  const o=[]; const d=cs.display; const inl=/^(SPAN|B|I|SMALL|STRONG|EM|A|LABEL|CODE|TIME|U|MARK|SUB|SUP|ABBR)$/.test(el.tagName); if(inl&&(d==='block'||d==='list-item')) o.push('display:block'); else if(!inl&&d==='inline'&&!/^(LI|TD|TH|TR|TABLE|TBODY|THEAD|TFOOT)$/.test(el.tagName)) o.push('display:inline');
  if(d==='flex'||d==='inline-flex'){ o.push('display:'+(d==='flex'?'flex':'inline-flex')); if(cs.flexDirection!=='row') o.push('flex-direction:'+cs.flexDirection); if(cs.flexWrap!=='nowrap') o.push('flex-wrap:'+cs.flexWrap); if(cs.justifyContent!=='normal'&&cs.justifyContent!=='flex-start'&&cs.justifyContent!=='start') o.push('justify-content:'+cs.justifyContent); if(cs.alignItems!=='normal'&&cs.alignItems!=='stretch') o.push('align-items:'+cs.alignItems); const rg=Q(num(cs.rowGap)), cg=Q(num(cs.columnGap)); if(rg||cg) o.push(rg===cg?'gap:'+rg+'px':'gap:'+rg+'px '+cg+'px'); }
  else if(d==='grid'||d==='inline-grid'){ o.push('display:grid'); const t=cs.gridTemplateColumns; if(t&&t!=='none'){ const w=t.split(' ').map(num).filter(x=>x>0); if(w.length){ const mx=Math.max(...w), mn=Math.min(...w), tot=w.reduce((a,b)=>a+b,0);
        let tpl; if(w.length===1) tpl='minmax(0,1fr)'; else if(mx-mn<=3) tpl='repeat('+w.length+',minmax(0,1fr))'; else { const rel=w.map(x=>Math.round(x/mn*2)/2); const fixed=w.map(x=>x<=300&&mx>=x*2.2); tpl=w.map((x,i)=>fixed[i]?Math.round(x)+'px':'minmax(0,'+rel[i]+'fr)').join(' '); }
        o.push('grid-template-columns:'+tpl); LAY.last=w.length; } } const rg=Q(num(cs.rowGap)), cg=Q(num(cs.columnGap)); if(rg||cg) o.push(rg===cg?'gap:'+rg+'px':'gap:'+rg+'px '+cg+'px'); if(cs.alignItems!=='normal'&&cs.alignItems!=='stretch') o.push('align-items:'+cs.alignItems); }
  else if(d==='inline'||d==='inline-block'||d==='contents') { if(d==='inline-block') o.push('display:inline-block'); }
  // item props
  const pd=pcs&&pcs.display; if(pd==='flex'||pd==='inline-flex'){ const g=+cs.flexGrow, s=+cs.flexShrink; const fb=cs.flexBasis; const bas=(!fb||fb==='auto'||fb==='content')?'auto':(/%$/.test(fb)?fb:(num(fb)===0?'0%':'auto')); if(g>0){ o.push('flex:'+Math.min(g,4)+' '+Math.min(s,1)+' '+bas); if(bas==='0%'&&(opts.txtLen||0)>18) o.push('min-width:min(100%,260px)'); } else if(s===0) o.push('flex:none'); if(cs.alignSelf!=='auto'&&cs.alignSelf!=='normal') o.push('align-self:'+cs.alignSelf); if(cs.marginLeft==='auto'||(num(cs.marginLeft)>40&&prect&&rect.right>prect.right-40)) o.push('margin-left:auto'); }
  if(pd==='grid'||pd==='inline-grid'){ const ge=cs.gridColumnEnd; const m=ge&&ge.match(/span (\d+)/); if(m) o.push('grid-column:span '+m[1]); else if(cs.gridColumnStart&&cs.gridColumnStart!=='auto'&&cs.gridColumnEnd==='-1') o.push('grid-column:1/-1'); }
  // spacing
  if(cs.marginLeft!=='auto'&&(inl||d==='inline-block'||d==='inline-flex'||(pd==='flex'||pd==='inline-flex')&&!/column/.test(pcs.flexDirection))){ const ml=Q(num(cs.marginLeft),[0,2,4,6,8,10,12,16,20,24]), mr=Q(num(cs.marginRight),[0,2,4,6,8,10,12,16,20,24]); if(ml) o.push('margin-left:'+ml+'px'); if(mr) o.push('margin-right:'+mr+'px'); }
  const mt=Q(num(cs.marginTop)), mb=Q(num(cs.marginBottom)); if(mt) o.push('margin-top:'+mt+'px'); if(mb) o.push('margin-bottom:'+mb+'px');
  if(!opts.noPad){ const pt=Q(num(cs.paddingTop)), pb=Q(num(cs.paddingBottom)), pl=Q(num(cs.paddingLeft)), pr=Q(num(cs.paddingRight)); if(pt||pb||pl||pr) o.push('padding:'+pt+'px '+pr+'px '+pb+'px '+pl+'px'); }
  // tamaños
  if(/px$/.test(cs.maxWidth)&&num(cs.maxWidth)>0&&num(cs.maxWidth)<(prect?prect.width:1e9)*0.98) o.push('max-width:'+Math.round(num(cs.maxWidth))+'px');
  if(!opts.noW&&opts.fixedW){ o.push('width:'+Math.round(rect.width)+'px'); o.push('max-width:100%'); }
  if(opts.fixedH) o.push('height:'+Math.round(rect.height)+'px');
  if(opts.bar) o.push('min-width:64px');
  if(cs.overflowX==='auto'||cs.overflowX==='scroll') o.push('overflow-x:auto'); else if(cs.overflow==='hidden'&&!opts.leafVisual) o.push('overflow:hidden');
  if(cs.textAlign==='center'||cs.textAlign==='right'||cs.textAlign==='end') o.push('text-align:'+(cs.textAlign==='end'?'right':cs.textAlign));
  if(cs.whiteSpace==='nowrap'&&(opts.txtLen===undefined||opts.txtLen<=28)) o.push('white-space:nowrap');
  if(cs.textOverflow==='ellipsis'&&cs.overflow!=='visible'){ o.push('overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0'); }
  // bordes (lados sueltos)
  const sides=['Top','Right','Bottom','Left'];
  if(!opts.card){ const bs=sides.map(s=>{ const w=num(cs['border'+s+'Width']); const t=cs['border'+s+'Style']!=='none'&&w>0?tone(cs['border'+s+'Color']):null; if(!t) return null; const c=t.k==='acc'?'var(--accent)':t.k==='dan'?'var(--danger)':t.k==='war'?'var(--warn)':t.k==='inf'?'var(--info)':t.k==='ink'?'var(--ink)':(t.k==='mut'||t.k==='fnt')?'var(--faint)':'var(--line)'; return (w>=3?3:w>=2?2:1)+'px '+(cs['border'+s+'Style']==='dashed'?'dashed':'solid')+' '+c; });
    if(bs.every(x=>x&&x===bs[0])) o.push('border:'+bs[0]); else sides.forEach((s,i)=>{ if(bs[i]) o.push('border-'+s.toLowerCase()+':'+bs[i]); }); }
  if(false){ sides.forEach(s=>{ const w=num(cs['border'+s+'Width']); const t=cs['border'+s+'Style']!=='none'&&w>0?tone(cs['border'+s+'Color']):null; if(t){ const c=t.k==='acc'?'var(--accent)':t.k==='dan'?'var(--danger)':t.k==='war'?'var(--warn)':t.k==='inf'?'var(--info)':t.k==='ink'?'var(--ink)':(t.k==='mut'||t.k==='fnt')?'var(--faint)':'var(--line)'; o.push('border-'+s.toLowerCase()+':'+(w>=3?3:w>=2?2:1)+'px '+(cs['border'+s+'Style']==='dashed'?'dashed':'solid')+' '+c); } }); }
  if(!opts.card&&!opts.leafVisual){ const rad=Math.max(num(cs.borderTopLeftRadius),num(cs.borderTopRightRadius)); if(rad>=2&&(tone(cs.backgroundColor)||sides.some(s=>num(cs['border'+s+'Width'])>0))) o.push('border-radius:'+(rad>=999||(rect.width===rect.height&&rad>=rect.width/2-1)?'999px':Q(rad,[2,4,6,8,10,12,16])+'px')); }
  if(cs.position==='relative'&&opts.rel) o.push('position:relative');
  return o.join(';');
}
function layClass(key){ if(!key) return ''; let id=LAY.m.get(key); if(!id){ id=(window.__PFX||'')+'L'+(LAY.m.size+1); LAY.m.set(key,id); LAY.css.push('.rl .'+id+'{'+key+'}'); } return id; }
function typoClasses(cs,pcs,txt){ const c=[]; const fs=num(cs.fontSize); const pfs=pcs?num(pcs.fontSize):0;
  const q=SZ.reduce((b,x)=>Math.abs(x-fs)<Math.abs(b-fs)?x:b,SZ[0]); const pq=pcs?SZ.reduce((b,x)=>Math.abs(x-pfs)<Math.abs(b-pfs)?x:b,SZ[0]):0; if(q!==pq) c.push('s'+q);
  const w=+cs.fontWeight, pw=pcs?+pcs.fontWeight:400; const wq=w>=600?6:w>=500?5:4, pwq=pw>=600?6:pw>=500?5:4; if(wq!==pwq) c.push('w'+wq);
  const fam=cs.fontFamily, pfam=pcs?pcs.fontFamily:''; const f=/Bodoni|Cormorant|Playfair|serif/i.test(fam)&&!/sans-serif|system-ui/i.test(fam.split(',')[0])?'d':/Barlow|Condensed/i.test(fam)?'c':/Mono|Menlo|Consolas/i.test(fam)?'m':'t'; const pf=pcs?(/Bodoni|Cormorant|Playfair|serif/i.test(pfam)&&!/sans-serif|system-ui/i.test(pfam.split(',')[0])?'d':/Barlow|Condensed/i.test(pfam)?'c':/Mono|Menlo|Consolas/i.test(pfam)?'m':'t'):'t'; if(f!==pf) c.push('f'+f);
  const up=cs.textTransform==='uppercase'||(cs.fontVariantCaps&&/small-caps|all-small-caps/.test(cs.fontVariantCaps)), pup=pcs&&pcs.textTransform==='uppercase'; if(up&&!pup) c.push('fu'); else if(!up&&pup) c.push('fn');
  if(cs.fontStyle==='italic'&&!(pcs&&pcs.fontStyle==='italic')) c.push('fi'); else if(cs.fontStyle!=='italic'&&pcs&&pcs.fontStyle==='italic') c.push('fr');
  if(cs.textDecorationLine&&cs.textDecorationLine.indexOf('line-through')>=0) c.push('fth'); else if(cs.textDecorationLine&&cs.textDecorationLine.indexOf('underline')>=0&&!(pcs&&pcs.textDecorationLine.indexOf('underline')>=0)) c.push('fl');
  const t=tone(cs.color), pt=pcs?tone(pcs.color):null; const tk=t?t.k:'ink', pk=pt?pt.k:'ink'; const eff=(x)=>x==='white'||x==='panel'||x==='bg'||x==='raise'?'inv':x==='line'?'fnt':x; if(eff(tk)!==eff(pk)) c.push('k-'+eff(tk));
  if(txt&&/^[\d\s.,:%€$+\-–—/hH×x·]+$/.test(txt.trim())&&txt.trim().length>0) c.push('tn');
  return c; }
/* ── fondos y tarjetas ── */
function bgTone(cs){ const t=tone(cs.backgroundColor); return t; }
function sideBorders(cs){ const sides=['Top','Right','Bottom','Left']; return sides.map(s=>{ const w=num(cs['border'+s+'Width']); return w>=1&&cs['border'+s+'Style']!=='none'&&tone(cs['border'+s+'Color'])?1:0; }); }
function toneName(t){ return t.k==='acc'?(t.L>0.8?'accs':'acc'):t.k==='dan'?(t.L>0.8?'dans':'dan'):t.k==='war'?(t.L>0.8?'wars':'war'):t.k==='inf'?(t.L>0.8?'infs':'inf'):t.k; }
const BTN_ON=/(^|[\s_-])(on|active|act|sel|selected|is-on|is-active|current|activo|activa|pressed|checked)($|[\s_-])/i;
function isOn(el){ if(el.getAttribute('aria-pressed')==='true'||el.getAttribute('aria-selected')==='true'||el.getAttribute('aria-current')) return true; if(el.hasAttribute('data-on')&&el.getAttribute('data-on')!=='0') return true; return BTN_ON.test(el.getAttribute('class')||''); }
function svgClean(el,rect){ const cl=el.cloneNode(true); const mapc=v=>{ if(!v||v==='none'||v==='currentColor'||/^url\(/.test(v)) return v; const t=tone(v.charAt(0)==='#'?hexToRgb(v):v); if(!t) return v; return 'var(--'+({ink:'ink',mut:'mut',fnt:'faint',line:'line',raise:'raise',bg:'bg',panel:'panel',white:'field',acc:'accent',dan:'danger',war:'warn',inf:'info'}[t.k])+')'; };
  const srcN=[el].concat(Array.from(el.querySelectorAll('*'))), dstN=[cl].concat(Array.from(cl.querySelectorAll('*')));
  srcN.forEach((o,i)=>{ const n=dstN[i]; if(!n) return; const cs=getComputedStyle(o); const tg=o.tagName.toLowerCase();
    n.removeAttribute('class'); n.removeAttribute('id'); n.removeAttribute('style');
    if(/^(circle|rect|path|line|polyline|polygon|ellipse|g|text|use)$/.test(tg)){
      const f=cs.fill, st=cs.stroke; if(tg!=='g'){ n.setAttribute('fill',f==='none'?'none':mapc(f)); n.setAttribute('stroke',st==='none'?'none':mapc(st)); if(st!=='none'){ n.setAttribute('stroke-width',cs.strokeWidth); if(cs.strokeLinecap!=='butt') n.setAttribute('stroke-linecap',cs.strokeLinecap); if(cs.strokeLinejoin!=='miter') n.setAttribute('stroke-linejoin',cs.strokeLinejoin); if(cs.strokeDasharray&&cs.strokeDasharray!=='none') n.setAttribute('stroke-dasharray',cs.strokeDasharray); if(cs.strokeDashoffset&&cs.strokeDashoffset!=='0px') n.setAttribute('stroke-dashoffset',cs.strokeDashoffset); } }
      if(+cs.opacity<1) n.setAttribute('opacity',cs.opacity);
      if(cs.transform&&cs.transform!=='none'&&tg!=='g') n.setAttribute('style','transform:'+cs.transform+';transform-origin:'+cs.transformOrigin+';transform-box:fill-box');
    }
    ['stop'].forEach(()=>{}); });
  const rc=getComputedStyle(el); cl.setAttribute('width',Math.round(rect.width)); cl.setAttribute('height',Math.round(rect.height)); cl.setAttribute('aria-hidden','true'); cl.setAttribute('focusable','false');
  let st='color:'+({}[0]||'inherit'); const ps=[]; if(rc.transform&&rc.transform!=='none') ps.push('transform:'+rc.transform); if(ps.length) cl.setAttribute('style',ps.join(';'));
  return cl.outerHTML.replace(/\s+xmlns="[^"]*"/,''); }
function hexToRgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(x=>x+x).join(''); const n=parseInt(h,16); return 'rgb('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+')'; }
/* ── texto ── */
const TEXTSUB=[[/http:\/\/localhost:\d+\/\?cliente=[A-Za-z0-9]+/g,'lesmoles.cat/p/marta-jordi-7k2x'],[/http:\/\/localhost:\d+/g,'https://lesmoles.cat'],[/admin@lesmoles\.test/g,'jeroni@lesmoles.cat'],[/eventos@lesmoles\.test/g,'eventos@lesmoles.cat'],[/@lesmoles\.test/g,'@lesmoles.cat']];
const TXT2=s=>{ TEXTSUB.forEach(([a,b])=>{ s=s.replace(a,b); }); return s; };
const cleanTxt=s=>{ s=s.replace(/\s+/g,' '); TEXTSUB.forEach(([a,b])=>{ s=s.replace(a,b); }); return s; };
/* ── conversión ── */
const BLOCKSKIP=/^(script|style|noscript|template|link|meta|head|iframe|canvas|audio|video|object|embed)$/i;
function ctl(el){ return el.matches&&el.matches('input,select,textarea,button'); }
function kids(el){ return Array.from(el.childNodes); }
function textOnly(el){ return Array.from(el.childNodes).every(n=>n.nodeType===3||(n.nodeType===1&&/^(span|b|i|em|strong|small|u|sub|sup|code|br|mark|a|abbr|time)$/i.test(n.tagName)&&!n.querySelector('button,input,select,textarea,table,div,ul')) ); }
function cap(arr,max,keep){ return arr.length>max?arr.slice(0,keep):arr; }
function linkLabels(){ /* asigna id a controles y for a etiquetas */ }
function list0(el,ctx){ return Array.from(el.childNodes).map(n=>conv(n,Object.assign({},ctx))).join(''); }
function conv(el,ctx){
  if(el.nodeType===3){ const t=cleanTxt(el.nodeValue); if(!t.trim()&&!/\S/.test(t)) return t.length?' ':''; return esc(t); }
  if(el.nodeType!==1) return ''; const tag=el.tagName.toLowerCase(); if(BLOCKSKIP.test(tag)) return '';
  if(el.hasAttribute('hidden')||el.getAttribute('aria-hidden')==='true'&&!/^svg$/.test(tag)&&!el.textContent.trim()) return '';
  const cs=getComputedStyle(el); if(!vis(el,cs)) { if(!(el.tagName==='INPUT'&&/checkbox|radio/.test(el.type)&&cs.display!=='none')) return ''; }
  if(cs.position==='fixed') return '';
  { const r0=el.getBoundingClientRect(); if(cs.position==='absolute'&&(tag==='svg'||(!(el.textContent||'').trim()&&!el.querySelector('input,select,textarea'))&&r0.width>0)) return '';
    if(r0.width<=2&&r0.height<=2&&(cs.overflow==='hidden'||cs.position==='absolute')&&!ctl(el)) return ''; }
  const rect=el.getBoundingClientRect(); const par=el.parentElement, pcs=par?getComputedStyle(par):null, prect=par?par.getBoundingClientRect():null;
  if(el.matches('.toast,#toasts,#palette,.sheet-back,.modal-back,[role=dialog]:not(details)')) return '';
  if(el.matches('.planv,.planv-scroll,.pv-inner,.app-menu,.mnu-body,.rsm-scroll,.resumen,.mnu-top,.rsm-wrap,.rsm-inner')) return list0(el,ctx);
  { let dpt=0, q=el; while(q&&q!==ctx.root&&dpt<6){ q=q.parentElement; dpt++; }
    if(dpt<=3&&!ctl(el)&&/^(div|section|main|article|header)$/.test(tag)&&num(cs.paddingLeft)>=24&&!tone(cs.backgroundColor)&&!sideBorders(cs).some(Boolean)&&!(cs.boxShadow&&cs.boxShadow!=='none')&&el.children.length>=1&&cs.position!=='absolute'){ return list0(el,ctx); } }
  /* ── controles ── */
  if(tag==='input'){ const ty=(el.type||'text').toLowerCase(); const id='rf'+(++RID); el.setAttribute('data-rid',id);
    if(ty==='hidden') return ''; const toggle=/toggle|switch|\bsw\b|slider/i.test(el.className+' '+(el.parentElement?el.parentElement.className:''));
    if(ty==='checkbox'||ty==='radio'){ return '<span class="rx'+(toggle?' sw2':'')+(ty==='radio'?' rd':'')+'"><input type="'+ty+'" id="'+id+'"'+(el.checked?' checked':'')+(el.disabled?' disabled':'')+(ty==='radio'&&el.name?' name="'+esc('n'+el.name)+'"':'')+'><i></i></span>'; }
    if(ty==='range'||ty==='color'||ty==='file'){ return '<input class="fld0" id="'+id+'" type="'+ty+'" value="'+esc(cleanTxt(el.value||''))+'"'+(ty==='range'?' min="'+el.min+'" max="'+el.max+'" step="'+el.step+'"':'')+'>'; }
    const ok=['text','number','date','time','email','tel','password','url','search','datetime-local','month'].indexOf(ty)>=0?ty:'text';
    const opts={noPad:true,noW:false}; const parGrid=pcs&&/grid/.test(pcs.display); const parFlex=pcs&&/flex/.test(pcs.display); const full=prect&&rect.width>=prect.width*0.9; const inTbl=!!el.closest('td,th');
    const k=layoutKey(el,cs,par,pcs,rect,prect,{noPad:true,fixedW:!inTbl&&!full&&!parGrid&&rect.width>0&&rect.width<(prect?prect.width*0.85:9999),noW:false}); const lc=layClass(k);
    return '<input class="field'+(lc?' '+lc:'')+'" id="'+id+'" type="'+ok+'" value="'+esc(cleanTxt(el.value||''))+'"'+(el.placeholder?' placeholder="'+esc(cleanTxt(el.placeholder))+'"':'')+(el.readOnly?' readonly':'')+(el.disabled?' disabled':'')+(el.getAttribute('aria-label')?' aria-label="'+esc(el.getAttribute('aria-label'))+'"':'')+(el.min?' min="'+esc(el.min)+'"':'')+(el.max?' max="'+esc(el.max)+'"':'')+(el.step?' step="'+esc(el.step)+'"':'')+'>'; }
  if(tag==='select'){ const id='rf'+(++RID); el.setAttribute('data-rid',id); const full=prect&&rect.width>=prect.width*0.9; const parGrid=pcs&&/grid/.test(pcs.display);
    const k=layoutKey(el,cs,par,pcs,rect,prect,{noPad:true,fixedW:!el.closest('td,th')&&!full&&!parGrid&&rect.width<(prect?prect.width*0.85:9999)}); const lc=layClass(k);
    const os=Array.from(el.options).slice(0,40); return '<select class="field'+(lc?' '+lc:'')+'" id="'+id+'"'+(el.disabled?' disabled':'')+(el.getAttribute('aria-label')?' aria-label="'+esc(el.getAttribute('aria-label'))+'"':'')+'>'+os.map(o=>'<option'+(o.selected?' selected':'')+' value="'+esc(o.value)+'">'+esc(cleanTxt(o.text))+'</option>').join('')+'</select>'; }
  if(tag==='textarea'){ const id='rf'+(++RID); el.setAttribute('data-rid',id); return '<textarea class="field" id="'+id+'" rows="'+Math.max(2,Math.min(8,Math.round(rect.height/22)))+'"'+(el.placeholder?' placeholder="'+esc(cleanTxt(el.placeholder))+'"':'')+(el.readOnly?' readonly':'')+(el.getAttribute('aria-label')?' aria-label="'+esc(el.getAttribute('aria-label'))+'"':'')+'>'+esc(cleanTxt(el.value||''))+'</textarea>'; }
  const bigBtn=(tag==='button'||tag==='a'||el.getAttribute('role')==='button')&&((rect.width>=180&&rect.height>=52)||(rect.width>=300&&rect.height>=30&&el.children.length>=2))&&(el.children.length>=2||!!el.querySelector('div,p,h2,h3,h4,b,strong,small'));
  if(!bigBtn&&(tag==='button'||(tag==='a'&&(/btn|button/.test(el.className)||(num(cs.paddingLeft)>=8&&tone(cs.backgroundColor)&&rect.height>=26)))||el.getAttribute('role')==='button')){
    const txt=cleanTxt(el.innerText||'').trim(); const bg=tone(cs.backgroundColor), fg=tone(cs.color); const hasBorder=sideBorders(cs).some(Boolean);
    let v=''; const label=txt||el.getAttribute('aria-label')||el.title||''; const iconOnly=!txt;
    const dark=bg&&(bg.k==='ink'||bg.k==='mut'); const red=(bg&&bg.k==='dan'&&bg.L<0.7)||(!bg&&fg&&fg.k==='dan'); const olive=bg&&bg.k==='acc'&&bg.L<0.7;
    if(dark||olive) v=' pri'; else if(red) v=' danger'; else if(!bg&&!hasBorder) v=' ghost';
    const small=rect.height<33||num(cs.fontSize)<12.6; if(small) v+=' sm';
    const round=rect.height<=44&&num(cs.borderTopLeftRadius)>=Math.min(rect.height,rect.width)/2-2&&(hasBorder||bg)&&!dark&&!red;
    const sibs=par?Array.from(par.children).filter(c=>c.tagName===el.tagName):[]; const grp=sibs.length>=2&&Array.from(par.children).every(c=>c.tagName==='BUTTON'||c.tagName==='A')&&sibs.some(c=>isOn(c));
    const on=isOn(el)||(dark&&grp);
    const pbord=par&&sideBorders(pcs).some(Boolean); const chip=grp&&hasBorder&&txt.length<=34&&!dark&&!red;
    const isDel=/^(×|✕|✖|x|X|✗|−|–)$/.test(txt)||/^(quitar|eliminar|borrar|eliminar fila)$/i.test(txt)||/^(quitar|eliminar|borrar)/i.test(el.getAttribute('aria-label')||el.title||'');
    const content=Array.from(el.childNodes).map(n=>conv(n,{inBtn:true})).join('').trim();
    if(grp&&pbord&&!red){ const content2=Array.from(el.childNodes).map(n=>conv(n,{inBtn:true})).join('').trim(); return '<button type="button" class="sg" aria-pressed="'+(on?'true':'false')+'"'+(el.disabled?' disabled':'')+(iconOnly&&label?' aria-label="'+esc(label)+'"':'')+'>'+(content2||esc(label))+'</button>'; }
    if((chip||grp)&&!dark&&!red){ return '<button type="button" class="chip" aria-pressed="'+(on?'true':'false')+'"'+(el.disabled?' disabled':'')+(iconOnly&&label?' aria-label="'+esc(label)+'"':'')+'>'+(content||esc(label))+'</button>'; }
    if((chip||grp)&&dark&&sibs.length>1) return '<button type="button" class="chip" aria-pressed="true">'+(content||esc(label))+'</button>';
    const k=layoutKey(el,cs,par,pcs,rect,prect,{noPad:true,txtLen:txt.length}); const lc=layClass(k);
    return '<button type="button" class="btn'+v+(round?' rnd':'')+(iconOnly?' icb':'')+(lc?' '+lc:'')+'"'+(el.disabled?' disabled':'')+(isDel?' data-del':'')+' data-toast="'+esc('Ejemplo: '+(label||'acción'))+'"'+(label&&iconOnly?' aria-label="'+esc(label)+'"':'')+'>'+(content||'')+'</button>'; }
  if(tag==='a'&&!bigBtn){ const txt=cleanTxt(el.innerText||'').trim(); const fs=pcs?'':''; const t=typoClasses(cs,pcs,txt); return '<a class="lnk'+(t.length?' '+t.join(' '):'')+'" href="#" data-toast="'+esc('Ejemplo: '+txt)+'">'+Array.from(el.childNodes).map(n=>conv(n,ctx)).join('')+'</a>'; }
  if(tag==='svg'){ const w=rect.width,h=rect.height; if(w<2||h<2) return ''; const outer=svgClean(el,rect); return outer; }
  if(tag==='img'){ const w=Math.round(rect.width),h=Math.round(rect.height); const src=el.currentSrc||el.src||''; if(src.startsWith('data:image/svg')&&src.length<4000) return '<img alt="" src="'+src+'" width="'+w+'" height="'+h+'">'; return '<span class="foto0" role="img" aria-label="'+esc(el.alt||'Imagen')+'" style="width:'+w+'px;height:'+h+'px;max-width:100%"></span>'; }
  if(tag==='br') return '<br>'; if(tag==='hr') return '<hr class="hr0">';
  /* ── tablas ── */
  if(tag==='table'){ const rowsAll=Array.from(el.querySelectorAll(':scope>thead>tr,:scope>tbody>tr,:scope>tfoot>tr,:scope>tr')); const head=Array.from(el.querySelectorAll(':scope>thead>tr')); const body=Array.from(el.querySelectorAll(':scope>tbody>tr,:scope>tr')); const foot=Array.from(el.querySelectorAll(':scope>tfoot>tr'));
    const row=(r,th)=>'<tr>'+Array.from(r.children).map(c=>{ const ccs=getComputedStyle(c); const al=ccs.textAlign==='right'||ccs.textAlign==='end'?' class="r"':ccs.textAlign==='center'?' class="c"':''; const t=c.tagName.toLowerCase()==='th'||th?'th':'td'; const inner=Array.from(c.childNodes).map(n=>conv(n,{inCell:true,par:c})).join(''); return '<'+t+al+(c.colSpan>1?' colspan="'+c.colSpan+'"':'')+(c.rowSpan>1?' rowspan="'+c.rowSpan+'"':'')+'>'+inner+'</'+t+'>'; }).join('')+'</tr>';
    const cut=body.length>16; const bb=cut?body.slice(0,12):body; let html='<div class="tw"><table class="tbl">'+(head.length?'<thead>'+head.map(r=>row(r,true)).join('')+'</thead>':'')+'<tbody>'+bb.map(r=>row(r)).join('')+(cut?'<tr class="mas"><td colspan="'+(body[0]?body[0].children.length:1)+'">… y '+(body.length-18)+' filas más</td></tr>':'')+'</tbody>'+(foot.length?'<tfoot>'+foot.map(r=>row(r)).join('')+'</tfoot>':'')+'</table></div>'; return html; }
  if(/^(thead|tbody|tfoot|tr|td|th)$/.test(tag)) return Array.from(el.childNodes).map(n=>conv(n,ctx)).join('');
  if(tag==='details'){ const sm=el.querySelector(':scope>summary'); const rest=Array.from(el.childNodes).filter(n=>n!==sm).map(n=>conv(n,ctx)).join(''); return '<details class="ajus"'+(el.open?' open':'')+'><summary>'+(sm?Array.from(sm.childNodes).map(n=>conv(n,ctx)).join(''):'Más')+'</summary><div class="in">'+rest+'</div></details>'; }
  if(tag==='summary') return Array.from(el.childNodes).map(n=>conv(n,ctx)).join('');
  if(tag==='label'){ const inner=Array.from(el.childNodes).map(n=>conv(n,ctx)).join(''); const t=typoClasses(cs,pcs,''); const lc=layClass(layoutKey(el,cs,par,pcs,rect,prect,{noPad:true})); const f=el.control&&el.control.getAttribute('data-rid'); return '<label class="'+t.join(' ')+(lc?' '+lc:'')+'"'+(f?' for="'+f+'"':'')+'>'+inner+'</label>'; }
  /* ── contenedores y texto ── */
  const bg=bgTone(cs); const sb=sideBorders(cs); const fullB=sb.every(Boolean); const sh=cs.boxShadow&&cs.boxShadow!=='none';
  const kidsEl=Array.from(el.children).filter(c=>{ const s=getComputedStyle(c); return s.display!=='none'; });
  const hasBtn=!!el.querySelector('button,input,select,textarea,table');
  const txtD=cleanTxt(el.innerText||'').trim();
  let cls=[], style='', outTag=({h1:'h1',h2:'h2',h3:'h3',h4:'h4',p:'p',ul:'ul',ol:'ol',li:'li',strong:'strong',em:'em',b:'b',i:'i',small:'small',span:'span',code:'code',time:'span',sub:'sub',sup:'sup'})[tag]||'div';
  const radius=Math.max(num(cs.borderTopLeftRadius),num(cs.borderTopRightRadius));
  const area=rect.width*rect.height;
  // barras / puntos: hoja sin texto con fondo
  if(!txtD&&!kidsEl.length&&bg&&rect.width>=2&&rect.height>=2){ const w=rect.width,h=rect.height; let wcss='width:'+Math.round(w)+'px'; if(prect&&prect.width>20&&h<=16&&w<prect.width-1&&pcs&&!/flex/.test(pcs.display)||(pcs&&/flex|grid/.test(pcs.display)&&false)) wcss='width:'+(Math.round(w/prect.width*1000)/10)+'%'; else if(prect&&h<=16&&w>=prect.width-1&&w>40) wcss='width:100%';
    const rr=num(cs.borderTopLeftRadius); const tn=toneName(bg); const colr={ink:'var(--ink)',mut:'var(--mut)',fnt:'var(--faint)',line:'var(--line)',raise:'var(--raise)',bg:'var(--bg)',panel:'var(--panel)',white:'var(--field)',acc:'var(--accent)',dan:'var(--danger)',war:'var(--warn)',inf:'var(--info)',accs:'var(--accent-soft)',dans:'var(--danger-soft)',wars:'var(--warn-soft)',infs:'var(--info-soft)'}[tn];
    return '<i class="vb" style="'+wcss+';height:'+Math.round(h)+'px;background:'+colr+';border-radius:'+(rr>=h/2-1?'999px':Math.min(Math.round(rr),8)+'px')+'"></i>'; }
  // tarjetas y bloques
  const segGroup=kidsEl.length>=2&&kidsEl.every(c=>c.tagName==='BUTTON')&&kidsEl.some(c=>isOn(c))&&sideBorders(cs).some(Boolean);
  let card=false, tint=false, box=false;
  if(bigBtn&&(fullB||sh||bg)){ card=true; }
  else if(el!==ctx.root&&area>=180*56&&rect.height>=56&&kidsEl.length&&!segGroup&&radius>=3&&(fullB||sh)&&(!bg||bg.k==='panel'||bg.k==='white'||bg.k==='bg'||bg.k==='raise')&&rect.width>=200&&!ctx.inBtn) { card=true; }
  else if(bg&&['accs','dans','wars','infs'].indexOf(toneName(bg))>=0&&area>=120*26&&!ctx.inBtn&&(kidsEl.length||txtD.length>14)&&rect.width>=160){ tint=toneName(bg); }
  else if(bg&&(bg.k==='raise'||bg.k==='bg'||bg.k==='white'||bg.k==='panel')&&area>=140*30&&radius>=3&&kidsEl.length&&!ctx.inBtn&&rect.width>=160&&bg.a>0.4) { box=true; }
  // píldoras
  const pill=!card&&!tint&&!ctx.inBtn&&txtD&&txtD.length<=34&&rect.height<=30&&radius>=7&&(bg||fullB)&&!hasBtn&&textOnly(el)&&rect.width<=260&&/^(span|div|b|i|small|li|a)$/.test(tag);
  if(pill){ const ft=tone(cs.color); let tn=bg?toneName(bg):''; const tk=ft?ft.k:'mut'; let tone2=(tk==='acc'||tn==='accs'||tn==='acc')?'ok':(tk==='dan'||tn==='dans'||tn==='dan')?'bad':(tk==='war'||tn==='wars'||tn==='war')?'warn':(tk==='inf'||tn==='infs')?'info':'nul'; if(bg&&(bg.k==='ink')) tone2='ink'; if(bg&&bg.k==='acc'&&bg.L<0.6) tone2='okf';
    const inner=Array.from(el.childNodes).map(n=>conv(n,{inBtn:true,pill:true})).join(''); return '<span class="st '+tone2+'">'+inner+'</span>'; }
  if(segGroup){ let inner0=list0(el,ctx); const gi=window.__GRPS.length; window.__GRPS.push(Array.from(el.children)); let bi=0; inner0=inner0.replace(/<button type="button" class="sg"/g,()=>'<button type="button" class="sg" data-bi="'+(bi++)+'"'); return '<div class="sgrp" data-rgrp data-gi="'+gi+'">'+inner0+'</div>'; }
  const optsL={card:card,rel:false,txtLen:txtD.length}; const inFlex=pcs&&/flex/.test(pcs.display); const fixedBox=!card&&!tint&&!box&&!txtD&&rect.width<80&&rect.height<80&&rect.width>4; if(fixedBox) { optsL.fixedW=true; optsL.fixedH=true; }
  // anchura fija solo para cajas de ancho propio dentro de filas flex
  if(inFlex&&pcs.flexDirection.indexOf('column')<0&&!(+cs.flexGrow>0)&&!card&&kidsEl.length&&rect.width<(prect?prect.width*0.7:0)&&(cs.display==='block'||cs.display==='flex'||cs.display==='grid')&&+cs.flexShrink!==0&&false) optsL.fixedW=true;
  if(!txtD&&!card&&!tint&&!box&&rect.height>0&&rect.height<=14&&rect.width>=24&&kidsEl.length<=2&&!kidsEl.some(c=>c.tagName==='SVG')){ optsL.fixedH=true; optsL.bar=true; }
  if(card||tint||box) optsL.noPad=true;
  let lk=layoutKey(el,cs,par,pcs,rect,prect,optsL);
  if(!card&&!tint&&!box&&rect.width>=22&&rect.width<=64&&Math.abs(rect.width-rect.height)<=2&&radius>=rect.width/2-2&&txtD&&txtD.length<=3&&(!bg||bg.k==='panel'||bg.k==='bg'||bg.k==='raise')){ lk=(lk?lk+';':'')+'background:var(--raise);border:1px solid var(--line);display:grid;place-items:center;border-radius:50%;flex:none;width:'+Math.round(rect.width)+'px;height:'+Math.round(rect.height)+'px'; }
  else if(bg&&!card&&!tint&&!box&&bg.a<=0.5&&bg.a>=0.04&&rect.height<=20){ const TV={ink:'--ink',mut:'--mut',fnt:'--faint',line:'--line',raise:'--raise',bg:'--panel',panel:'--panel',white:'--panel',acc:'--accent',dan:'--danger',war:'--warn',inf:'--info'}[bg.k]; if(TV) lk=(lk?lk+';':'')+'background:color-mix(in srgb,var('+TV+') '+Math.round(bg.a*100)+'%,transparent);border-radius:999px;overflow:hidden'; }
  else if(bg&&!card&&!tint&&!box&&bg.k!=='panel'&&bg.k!=='bg'&&bg.a>0.3){ const BV={ink:'var(--ink)',mut:'var(--mut)',fnt:'var(--faint)',line:'var(--line)',raise:'var(--raise)',white:'var(--field)',acc:'var(--accent)',dan:'var(--danger)',war:'var(--warn)',inf:'var(--info)',accs:'var(--accent-soft)',dans:'var(--danger-soft)',wars:'var(--warn-soft)',infs:'var(--info-soft)'}[toneName(bg)]; if(BV) lk=(lk?lk+';':'')+'background:'+BV; }
  if(card){ const pad=Math.max(num(cs.paddingTop),num(cs.paddingLeft)); cls.push('nc'); if(bg&&(bg.k==='ink'||(bg.k==='mut'&&bg.L<0.3))) cls.push('nd'); cls.push(pad<=12?'p1':pad<=20?'p2':'p3'); if(ctx.card) cls.push('n2'); ctx=Object.assign({},ctx,{card:true}); }
  else if(tint){ cls.push('nt','t-'+tint); const pad=Math.max(num(cs.paddingTop),num(cs.paddingLeft)); cls.push(pad<=10?'p1':pad<=16?'p2':'p3'); }
  else if(box){ cls.push('nb'); const pad=Math.max(num(cs.paddingTop),num(cs.paddingLeft)); cls.push(pad<=10?'p1':pad<=16?'p2':'p3'); if(bg.k==='white') cls.push('wh'); }
  if(el.matches('li')&&pcs&&/list-item/.test(cs.display)&&(cs.listStyleType||'none')==='none') cls.push('nol');
  if(tag==='ul'||tag==='ol'){ if((cs.listStyleType||'none')==='none') cls.push('nol'); }
  // tipografía en elementos con texto propio
  const own=Array.from(el.childNodes).filter(n=>n.nodeType===3&&n.nodeValue.trim()); if(own.length||/^h[1-6]$/.test(tag)){ const t=typoClasses(cs,pcs,own.map(n=>n.nodeValue).join(' ')); if(t.length) cls.push(...t); }
  else if(pcs&&!kidsEl.length&&false){}
  // clases de maquetación y flags para móvil
  if(/grid/.test(cs.display)&&LAY.last>=2&&cs.gridTemplateColumns!=='none') { cls.push('gr','g'+Math.min(LAY.last,6)); }
  if(/^(flex|inline-flex)$/.test(cs.display)&&cs.flexDirection.indexOf('column')<0) cls.push('fx');
  try{ const af=getComputedStyle(el,'::after'); if(af&&af.content&&af.content!=='none'&&af.content!=='normal'&&(num(af.height)<=3||num(af.borderTopWidth)>0)&&(+af.flexGrow>0||af.width==='auto'||num(af.width)>40)&&/flex/.test(cs.display)) cls.push('rsec'); }catch(x){}
  const lc=layClass(lk); if(lc) cls.push(lc);
  // hijos
  let inner='';
  let list=Array.from(el.childNodes);
  let cutN=0; { const sig=c=>c.tagName+'.'+(c.getAttribute('class')||''); const cnt={}; kidsEl.forEach(c=>{ const k=sig(c); cnt[k]=(cnt[k]||0)+1; }); const top=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
    const lightKids=top&&kidsEl.filter(c=>sig(c)===top).every(c=>c.tagName==='BUTTON'&&(c.innerText||'').length<48&&c.querySelectorAll('*').length<=6);
    if(top&&cnt[top]>(lightKids?90:14)){ let seen=0; const drop=new Set(); kidsEl.forEach(c=>{ if(sig(c)===top){ seen++; if(seen>10) drop.add(c); } }); cutN=drop.size; list=list.filter(n=>n.nodeType!==1||!drop.has(n)); } }
  // grupo de botones/chips con selección
  inner=list.map(n=>conv(n,Object.assign({},ctx,{root:ctx.root}))).join('');
  if(cutN>0) inner+='<div class="mas0">… y '+cutN+' más</div>';
  if(!inner.trim()&&!/^(div|span|i)$/.test(outTag)) { if(!/^(li|p)$/.test(outTag)) return ''; }
  if(!inner.trim()&&!lk&&!cls.length) return '';
  if(!inner.trim()&&(/^(div|span)$/.test(outTag))&&!card&&!tint&&!box&&!(optsL.fixedW)) return '';
  const grpAttr=(kidsEl.length>=2&&kidsEl.every(c=>/^(button|a)$/i.test(c.tagName))&&kidsEl.some(c=>isOn(c)))?' data-rgrp':'';
  if(bigBtn){ cls.push('clk'); }
  return '<'+outTag+(cls.length?' class="'+cls.join(' ')+'"':'')+(bigBtn?' role="button" tabindex="0" data-toast="'+esc('Ejemplo: abrir '+(txtD.split('\n')[0]||'').slice(0,40))+'"':'')+grpAttr+(/^h[1-6]$/.test(tag)&&el.id?'':'')+'>'+inner+'</'+outTag+'>';
}
function header(root){ const o={}; const q=(r,s)=>{ const e=r.querySelector(s); return e?cleanTxt(e.innerText||'').trim():''; };
  if(root.classList&&root.classList.contains('users-card')){ o.eyebrow=q(root,'.pv-eyebrow'); o.title=q(root,'.users-title'); o.guide=q(root,'.users-note'); o.actions=[]; return o; }
  const pv=root.querySelector('.pv-head'); if(pv&&pv.getBoundingClientRect().width>0){ o.eyebrow=q(pv,'.pv-eyebrow'); o.title=q(pv,'.pv-title'); o.meta=q(pv,'.pv-sub'); o.guide=q(pv,'.pv-guide'); o.actions=Array.from(pv.querySelectorAll('button')).filter(b=>b.getBoundingClientRect().width>0).map(b=>({t:cleanTxt(b.innerText).trim()})); }
  const ph=Array.from(root.querySelectorAll('.panel-head')).filter(e=>e.getBoundingClientRect().width>0&&getComputedStyle(e).display!=='none')[0]; if(ph){ o.eyebrow=q(ph,'.ph-eyebrow'); o.title=q(ph,'.ph-title'); o.meta=q(ph,'.ph-sub'); o.stats=Array.from(ph.querySelectorAll('.ph-stats>*')).map(s=>cleanTxt(s.innerText).trim()).filter(Boolean); o.help=q(ph,'.ph-help-body'); o.helpBtn=q(ph,'.ph-help'); o.actions=Array.from(ph.querySelectorAll('button')).filter(b=>b.getBoundingClientRect().width>0&&!b.classList.contains('ph-help')).map(b=>({t:cleanTxt(b.innerText).trim()})); }
  return o; }
function pickRoot(){ const uc=document.querySelector('.users-card'); if(uc&&uc.getBoundingClientRect().width>10) return uc; const pri=['appPlan','appResumen','appHome','appMenu','appInv','appCam','appSitting']; for(const id of pri){ const e=document.getElementById(id); if(!e) continue; const cs=getComputedStyle(e), r=e.getBoundingClientRect(); if(cs.display!=='none'&&r.width>10&&r.height>10) return e; } return null; }
window.__T={
  screen(){ const root=pickRoot(); if(!root) return null; const head=header(root); head.root=root.id;
    const hide=Array.from(root.querySelectorAll('.pv-head,.panel-head'+(root.classList.contains('users-card')?',.pv-eyebrow,.users-title,.users-note,.login-x':''))); hide.forEach(h=>{ h.setAttribute('data-hid',h.style.display||''); h.style.display='none'; });
    RID=0; window.__GRPS=[]; const html=Array.from(root.childNodes).map(n=>conv(n,{root:root})).join('');
    hide.forEach(h=>{ h.style.display=h.getAttribute('data-hid'); h.removeAttribute('data-hid'); });
    return {head,html}; },
  layCss(){ return LAY.css.join('\n'); }
};
})();
