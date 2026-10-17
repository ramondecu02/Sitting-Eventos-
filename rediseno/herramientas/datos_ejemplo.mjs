// Rellena el evento de prueba de la app LOCAL (puerto 8790, base de datos de la carpeta de trabajo) con datos de ejemplo realistas
import { createRequire } from 'module'; const require=createRequire(import.meta.url); const pw=require('playwright-core');
const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage(); p.on('dialog',d=>d.accept()); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8790/'); await p.waitForTimeout(1500);
await p.evaluate(async()=>{ await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@lesmoles.test',password:'secreto123'})}); }); await p.reload(); await p.waitForTimeout(3000);
// 1) abrir Tareas para que la app cree las suyas
await p.evaluate(()=>window.irASeccion('tareas')); await p.waitForTimeout(1000);
const out=await p.evaluate(()=>{
  const Br=window.SITTING_BRIDGE, E=Br.current(), st=Br.store; const uid=()=>'x'+Math.random().toString(36).slice(2,10);
  Object.assign(E.ficha,{contacto:'Marta Vidal',telefono:'612 345 678',email:'marta.vidal@correo.cat',origen:'Tarragona',comoNos:'Recomendación de unos amigos',ceremoniaDur:'30 min',minutas:'Moles',notas:'La abuela de Marta usa silla de ruedas: mesa 2 junto al pasillo. Brindis con cava rosado. Aperitivo de pie hasta las 20:15.'});
  E.proveedores=[
    {id:uid(),servicio:'Florista',empresa:'Flors Ginestar',contacto:'Anna Ginestar',telefono:'977 57 22 41',precio:650,estado:'Contratado'},
    {id:uid(),servicio:'DJ / Música',empresa:'DJ Sonora',contacto:'Marc Sonora',telefono:'644 70 11 82',precio:700,estado:'Confirmado'},
    {id:uid(),servicio:'Fotógrafo',empresa:'Foto Aitana',contacto:'Aitana Roca',telefono:'655 21 90 14',precio:900,estado:'Confirmado'},
    {id:uid(),servicio:'Autobuses',empresa:'Autocars Ebre',contacto:'Jordi Pla',telefono:'977 50 12 40',precio:480,estado:'Contactado'},
    {id:uid(),servicio:'Candy Bar',empresa:'Dolços Maria',contacto:'Maria Bosch',telefono:'612 90 33 18',precio:320,estado:'Pendiente'},
    {id:uid(),servicio:'Videógrafo',empresa:'Mirada Films',contacto:'Pere Mas',telefono:'688 14 07 52',precio:850,estado:'Pendiente'}];
  E.comunicaciones=[
    {id:uid(),fecha:'2026-06-01',tipo:'Reunión',nota:'Visita al espacio y reserva de fecha. Señal de 1.000 €.'},
    {id:uid(),fecha:'2026-09-02',tipo:'Email',nota:'Enviada la propuesta del menú Moles con tres opciones de postre.'},
    {id:uid(),fecha:'2026-10-10',tipo:'WhatsApp',nota:'Lista de invitados recibida por el portal (59 personas).'},
    {id:uid(),fecha:'2026-10-14',tipo:'Llamada',nota:'Quieren mover la mesa de amigos más cerca de la pista. Les mando el plano esta semana.'}];
  E.hitos=Object.assign(E.hitos||{},{contacto:'2026-04-02',visita:'2026-04-20',propuesta:'2026-05-12',reserva:'2026-06-01',degustacion:'2026-09-02'});
  E.presupuesto.extras=[{concepto:'Tarta nupcial',importe:300},{concepto:'Arco floral del jardín',importe:350}];
  E.presupuesto.pagos=[{concepto:'Señal',fecha:'2026-06-01',importe:1000},{concepto:'Primer pago (65%)',fecha:'2026-10-01',importe:2679}];
  if(E.tareas){ E.tareas.forEach((t,i)=>{ if(i<6) t.estado='completada'; else if(i===7) t.estado='proceso'; else if(i===9) t.estado='bloqueada'; }); }
  const nombres=[['Pau Ribes','612 11 22 33'],['Núria Camps','655 44 33 22'],['Albert Mestre','644 90 80 70'],['Cristina Vidal','688 12 12 90'],['Marc Safont','677 05 44 31'],['Jana Roca','699 30 21 12'],['Oriol Tomàs','622 76 55 01'],['Berta Folch','611 32 90 76']];
  st.camareros=st.camareros||{personas:[]}; st.camareros.personas=st.camareros.personas||[];
  if(!st.camareros.personas.length){ nombres.forEach(n=>st.camareros.personas.push({id:'p.'+uid(),nombre:n[0],telefono:n[1],nota:'',updated:Date.now(),borrado:false})); }
  E.camareros=E.camareros||{}; E.camarerosHora=E.camarerosHora||{}; E.turnos=E.turnos||{};
  st.camareros.personas.forEach((pe,i)=>{ E.camareros[pe.id]=i<5?'si':i===5?'no':'pendiente'; if(i<5) E.camarerosHora[pe.id]=i<2?'16:30':'17:30'; if(i<3) E.turnos[pe.id]={ent:'17:00',sal:'03:30',pausa:30,nota:i===1?'Cubre la barra':''}; });
  E.docs=[{id:uid(),nombre:'Contrato firmado',url:'lesmoles.cat/docs/contrato-marta-jordi.pdf'},{id:uid(),nombre:'Propuesta de menú Moles',url:'lesmoles.cat/docs/propuesta-menu.pdf'},{id:uid(),nombre:'Plano de la sala',url:'lesmoles.cat/docs/plano-sala.pdf'}];
  // más eventos (para Previsión y el inicio)
  const base=JSON.parse(JSON.stringify(E)); delete base.share; const mk=(n,fecha,loc,tipo,estado,mesas)=>{ const c=JSON.parse(JSON.stringify(base)); c.id='e'+Date.now()+Math.floor(Math.random()*1e5); const d=fecha.split('-'); const nombre=n+' — '+d[2]+'/'+d[1]+'/'+d[0]; c.name=nombre; c.text='# '+nombre+'\n@ '+loc+'\n\n'+mesas; c.ficha=Object.assign({},c.ficha,{tipo:tipo,fecha:fecha,estado:estado,ubicacion:loc,parejaA:'',parejaB:'',contacto:'',telefono:'',email:'',notas:''}); c.proveedores=[]; c.comunicaciones=[]; c.hitos={}; c.docs=[]; c.tareas=null; c.camareros={}; c.camarerosHora={}; c.turnos={}; c.presupuesto={precioAdulto:78,precioInfantil:38,precioStaff:60,extras:[],pagos:[]}; c._snap=null; return c; };
  const T=(a,n)=>'M1 | Redonda 10 | '+a+'\n'+Array.from({length:n},(_,i)=>'Invitado '+(i+1)).join('\n')+'\n';
  const nuevos=[mk('Bautizo de Aina','2026-10-24','Les Vinyes del Convent','Bautizo','confirmada',T('Familia',22)),mk('Comida de empresa Ebre Logística','2026-10-31','Catering','Empresa','confirmada',T('Dirección',30)),mk('Boda de Núria i Pau','2026-11-14','Les Moles','Boda','propuesta',T('Familia',40)),mk('Comunión de Pol','2026-12-05','Les Vinyes del Convent','Comunión','reserva',T('Familia',35)),mk('Cena de Navidad Hotel Roca','2026-12-19','Catering','Empresa','contacto',T('Equipo',48))];
  st.events.push(...nuevos); Br.save();
  return {ev:st.events.length,prov:E.proveedores.length,tareas:E.tareas?E.tareas.length:null,pers:st.camareros.personas.length};
});
console.log(JSON.stringify(out),'errores',errs.slice(0,3));
await p.waitForTimeout(2500); await b.close();
