import { createRequire } from 'module'; const require=createRequire(import.meta.url); const pw=require('playwright-core'); import fs from 'fs';
const D='/tmp/claude-0/-home-user-Sitting-Eventos-/8661d775-c6f9-5d55-b638-3d3adb218f71/scratchpad/diseno/v5/';
const only=(process.argv[2]||'').split(',').filter(Boolean); const out=process.argv[3]||D+'trans.json';
const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:1440,height:900},locale:'es-ES'}); const p=await ctx.newPage(); p.on('dialog',d=>d.accept()); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto((process.env.BASE||'http://localhost:8790')+'/'); await p.waitForTimeout(1500);
await p.evaluate(async()=>{ await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@lesmoles.test',password:'secreto123'})}); }); await p.reload(); await p.waitForTimeout(3000);
await p.evaluate(x=>{ window.__NOSW=!!x; },process.env.NOSWITCH);
await p.evaluate(()=>{ const Br=window.SITTING_BRIDGE; const ev=Br.store.events.filter(e=>/Marta i Jordi/.test(e.name||''))[0]; if(ev&&Br.current().id!==ev.id&&!window.__NOSW){ Br.switchActiveEvent(ev.id); } }); await p.waitForTimeout(900);

await p.evaluate(()=>{ const Br=window.SITTING_BRIDGE; const e=Br.current(); const fam=k=>MENU_DATA.filter(f=>f.key===k)[0].dishes; e.menu=e.menu||{}; if(!e.menu.dishes||!Object.keys(e.menu.dishes).length){ e.menu.dishes={}; [['APERITIVOS',0],['APERITIVOS',1],['ENTRANTES',0],['ENTRANTES',1],['PESCADOS',0],['CARNES',0],['POSTRES',0],['POSTRES',1]].forEach(([k,i])=>{ const d=fam(k)[i]; if(d) e.menu.dishes[d._uid]=true; }); Br.save(); } });
await p.waitForTimeout(500);
await p.evaluate(x=>{ window.__PFX=x; },process.argv[4]||'');
await p.addScriptTag({content:fs.readFileSync(D+'_trans_page.js','utf8')});
let keys=['home','resumen'].concat(await p.evaluate(()=>(window.LM_SECCIONES||[]).map(s=>s.k))).concat(['team']); if(only.length) keys=keys.filter(k=>only.includes(k));
const res={}; for(const k of keys){ await p.evaluate(k=>{ try{ if(k==='home') window.showHome(); else if(k==='team') document.getElementById('side-users').click(); else window.irASeccion(k); }catch(e){} },k); await p.waitForTimeout(k==='team'?1800:1200);
  if(k==='team'){ res.team=await p.evaluate(()=>window.__T.screen()); res.team.v={}; const tabs=['Roles y permisos','Registro de actividad']; for(let i=0;i<tabs.length;i++){ await p.evaluate(tx=>{ const e=Array.from(document.querySelectorAll('.users-card button')).filter(x=>x.innerText.trim()===tx)[0]; if(e) e.click(); },tabs[i]); await p.waitForTimeout(1400); const sc=await p.evaluate(()=>window.__T.screen()); if(sc&&sc.html.length<=90000) res.team.v['t:'+(i+1)]=sc.html; } console.log('team',res.team.html.length,Object.keys(res.team.v).length+' vistas'); await p.evaluate(()=>{ const x=document.querySelector('.users-card .login-x'); if(x) x.click(); }); continue; }
  res[k]=await p.evaluate(()=>window.__T.screen());
  const VAR=['home','avisos','montaje','m-aler','m-serv','cam-rep','cam-horas','p-platos','p-alg','r-precios','prev','consultas'];
  if(res[k]&&VAR.includes(k)){ res[k].v={}; const info=await p.evaluate(()=>window.__GRPS.map(g=>g.map(b=>({on:b.getAttribute('aria-pressed')==='true'||/(^|\s)(on|active|act|sel|selected)(\s|$)/.test(b.className)||b.getAttribute('aria-selected')==='true',t:(b.textContent||'').trim().slice(0,18)}))));
    for(let gi=0;gi<Math.min(info.length,3);gi++){ const g=info[gi]; if(g.length<2||g.length>5) continue; const on0=g.findIndex(x=>x.on);
      for(let bi=0;bi<g.length;bi++){ if(bi===on0) continue; const clicked=await p.evaluate(([gi,bi])=>{ const b=window.__GRPS[gi]&&window.__GRPS[gi][bi]; if(!b) return false; b.click(); return true; },[gi,bi]); if(!clicked) continue; await p.waitForTimeout(900);
        const sc=await p.evaluate(()=>window.__T.screen()); if(sc&&sc.html.length<=60000) res[k].v[gi+':'+bi]=sc.html; }
      if(on0>=0){ await p.evaluate(([gi,on0])=>{ const gs=window.__T.grps?window.__T.grps():null; },[gi,on0]).catch(()=>{}); await p.evaluate(k=>{ try{ if(k==='home') window.showHome(); else window.irASeccion(k); }catch(e){} },k); await p.waitForTimeout(900); await p.evaluate(()=>window.__T.screen()); } } }
  console.log(k,res[k]?res[k].html.length:'—',res[k]&&res[k].v?Object.keys(res[k].v).length+' vistas':''); }
const css=await p.evaluate(()=>window.__T.layCss()); fs.writeFileSync(out,JSON.stringify({screens:res,css})); console.log('css reglas',css.split('\n').length,'errores',errs.slice(0,3)); await b.close();
