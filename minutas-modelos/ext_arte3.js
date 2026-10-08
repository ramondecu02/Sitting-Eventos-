/* ══ TINTA Y LAVADO ══════════════════════════════════════════════════════
   Ilustraciones «dibujadas a mano»: trazo de pluma con presión variable (grueso al bajar, fino al subir),
   manchas de acuarela algo desplazadas del contorno (como cuando se pinta sin cuadrar), borde oscuro donde se
   acumula el agua, rayado de sombra y grano de papel. Todo lleva semilla: el mismo número da el mismo dibujo.
   Cada dibujo se define en una caja de diseño (DW×DH) y se estira a la forma que tenga en la hoja. */
function tCam(d){ var tk=String(d).match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g)||[], i=0, subs=[], cur=null, x=0, y=0, sx=0, sy=0, cmd="", lcx=0, lcy=0, lc=false, lq=false, lqx=0, lqy=0;
  function n(){ return parseFloat(tk[i++]); }
  function bez(x0,y0,x1,y1,x2,y2,x3,y3){ var N=Math.max(5,Math.ceil((Math.hypot(x1-x0,y1-y0)+Math.hypot(x2-x1,y2-y1)+Math.hypot(x3-x2,y3-y2))/2)); for(var k=1;k<=N;k++){ var t=k/N, u=1-t; cur.p.push([u*u*u*x0+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3,u*u*u*y0+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3]); } }
  function nuevo(){ if(!cur||cur.z){ cur={p:[[x,y]],z:false}; subs.push(cur); } }
  while(i<tk.length){ if(/[a-zA-Z]/.test(tk[i])){ cmd=tk[i++]; } var rel=cmd===cmd.toLowerCase(), C=cmd.toUpperCase(), a,b,c,e,f,g;
    if(C==="M"){ a=n(); b=n(); if(rel){ a+=x; b+=y; } x=a; y=b; sx=x; sy=y; cur={p:[[x,y]],z:false}; subs.push(cur); cmd=rel?"l":"L"; lc=lq=false; }
    else if(C==="L"){ nuevo(); a=n(); b=n(); if(rel){ a+=x; b+=y; } x=a; y=b; cur.p.push([x,y]); lc=lq=false; }
    else if(C==="H"){ nuevo(); a=n(); x=rel?x+a:a; cur.p.push([x,y]); lc=lq=false; }
    else if(C==="V"){ nuevo(); a=n(); y=rel?y+a:a; cur.p.push([x,y]); lc=lq=false; }
    else if(C==="C"){ nuevo(); a=n(); b=n(); c=n(); e=n(); f=n(); g=n(); if(rel){ a+=x; b+=y; c+=x; e+=y; f+=x; g+=y; } bez(x,y,a,b,c,e,f,g); lcx=c; lcy=e; x=f; y=g; lc=true; lq=false; }
    else if(C==="S"){ nuevo(); var c1x=lc?2*x-lcx:x, c1y=lc?2*y-lcy:y; a=n(); b=n(); c=n(); e=n(); if(rel){ a+=x; b+=y; c+=x; e+=y; } bez(x,y,c1x,c1y,a,b,c,e); lcx=a; lcy=b; x=c; y=e; lc=true; lq=false; }
    else if(C==="Q"){ nuevo(); a=n(); b=n(); c=n(); e=n(); if(rel){ a+=x; b+=y; c+=x; e+=y; } bez(x,y,x+2/3*(a-x),y+2/3*(b-y),c+2/3*(a-c),e+2/3*(b-e),c,e); lqx=a; lqy=b; x=c; y=e; lq=true; lc=false; }
    else if(C==="T"){ nuevo(); var qx=lq?2*x-lqx:x, qy=lq?2*y-lqy:y; c=n(); e=n(); if(rel){ c+=x; e+=y; } bez(x,y,x+2/3*(qx-x),y+2/3*(qy-y),c+2/3*(qx-c),e+2/3*(qy-e),c,e); lqx=qx; lqy=qy; x=c; y=e; lq=true; lc=false; }
    else if(C==="Z"){ if(cur){ cur.z=true; cur.p.push([sx,sy]); } x=sx; y=sy; lc=lq=false; }
    else { i++; } }
  return subs; }
function tElipse(cx,cy,rx,ry,rot,a0,a1){ var N=Math.max(28,Math.ceil((rx+ry)*1.6)), p=[], A0=a0==null?0:a0, A1=a1==null?Math.PI*2:a1, cs=Math.cos(rot||0), sn=Math.sin(rot||0); for(var k=0;k<=N;k++){ var t=A0+(A1-A0)*k/N, ex=Math.cos(t)*rx, ey=Math.sin(t)*ry; p.push([cx+ex*cs-ey*sn,cy+ex*sn+ey*cs]); } return [{p:p,z:(a1==null)}]; }
function tRemuestra(p,sp){ var o=[p[0]], acc=0; for(var i=1;i<p.length;i++){ var a=p[i-1], b=p[i], d=Math.hypot(b[0]-a[0],b[1]-a[1]); if(d<1e-6) continue; var t=sp-acc; while(t<=d){ o.push([a[0]+(b[0]-a[0])*t/d,a[1]+(b[1]-a[1])*t/d]); t+=sp; } acc=d-(t-sp); } var u=p[p.length-1], l=o[o.length-1]; if(Math.hypot(u[0]-l[0],u[1]-l[1])>0.2) o.push(u); return o; }
/* trazo de pluma: polígono con ancho que varía por el recorrido y un temblor suave de la mano */
function tLong(p){ var l=0; for(var i=1;i<p.length;i++) l+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]); return l; }
function tTinta(ctx,sub,o,R){ var lg=tLong(sub.p), p=tRemuestra(sub.p,Math.max(0.12,Math.min(1.1,lg/22))); if(p.length<3) return; var n=p.length, w=o.w||0.9, jit=o.jit==null?0.32:o.jit, ph1=R()*6.28, ph2=R()*6.28, ph3=R()*6.28, f1=0.11+R()*0.05, f2=0.37+R()*0.15, L=[], Rr=[], q=[];
  for(var i=0;i<n;i++){ var a=p[Math.max(0,i-1)], b=p[Math.min(n-1,i+1)], dx=b[0]-a[0], dy=b[1]-a[1], dl=Math.hypot(dx,dy)||1, nx=-dy/dl, ny=dx/dl, d=jit*(Math.sin(i*f1+ph1)*0.65+Math.sin(i*f2+ph2)*0.35); q.push([p[i][0]+nx*d,p[i][1]+ny*d,nx,ny]); }
  for(var k=0;k<n;k++){ var t=k/(n-1), pr=0.7+0.45*Math.sin(k*0.045+ph3)*0.5+0.18*Math.sin(k*0.19+ph1), ext=sub.z?1:Math.min(1,0.35+Math.min(k,n-1-k)/9), ww=w*pr*ext*0.5; L.push([q[k][0]+q[k][2]*ww,q[k][1]+q[k][3]*ww]); Rr.push([q[k][0]-q[k][2]*ww,q[k][1]-q[k][3]*ww]); }
  ctx.beginPath(); ctx.moveTo(L[0][0],L[0][1]); for(var j=1;j<n;j++) ctx.lineTo(L[j][0],L[j][1]); for(var m=n-1;m>=0;m--) ctx.lineTo(Rr[m][0],Rr[m][1]); ctx.closePath(); ctx.fillStyle=o.col||"#2B2B33"; ctx.globalAlpha=o.al==null?0.94:o.al; ctx.fill(); ctx.globalAlpha=1;
  if(!sub.z){ ctx.fillStyle=o.col||"#2B2B33"; var e=q[n-1]; ctx.beginPath(); ctx.arc(q[0][0],q[0][1],w*0.2,0,6.283); ctx.arc(e[0],e[1],w*0.2,0,6.283); ctx.fill(); } }
function tTrazaSuave(ctx,p){ var n=p.length; if(n<3) return; ctx.moveTo((p[0][0]+p[n-1][0])/2,(p[0][1]+p[n-1][1])/2); for(var i=0;i<n;i++){ var a=p[i], b=p[(i+1)%n]; ctx.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2); } ctx.closePath(); }
function tCaja(subs){ var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; subs.forEach(function(s){ s.p.forEach(function(q){ if(q[0]<x0) x0=q[0]; if(q[0]>x1) x1=q[0]; if(q[1]<y0) y0=q[1]; if(q[1]>y1) y1=q[1]; }); }); return {x:x0,y:y0,w:x1-x0,h:y1-y0}; }
/* mancha de acuarela: se pinta algo corrida respecto al contorno, con el agua acumulada en el borde y grano */
function tLavado(ctx,subs,col,o,R){ var dx=o.dx==null?1.1:o.dx, dy=o.dy==null?0.8:o.dy, al=o.al==null?0.55:o.al, bb=tCaja(subs); if(!(bb.w>0)) return;
  ctx.save(); ctx.translate(dx,dy); ctx.beginPath(); subs.forEach(function(s){ var p=tRemuestra(s.p,1.8); if(p.length<4) return; var ph=R()*6.28, f=0.25+R()*0.2; p=p.map(function(q,i){ return [q[0]+Math.sin(i*f+ph)*0.45,q[1]+Math.cos(i*f*0.8+ph)*0.45]; }); tTrazaSuave(ctx,p); });
  var vert=R()<0.6, g=ctx.createLinearGradient(bb.x,bb.y,vert?bb.x+bb.w*0.3:bb.x+bb.w,bb.y+bb.h*(vert?1:0.4)); g.addColorStop(0,rgba(mezcla(col,"#FFFFFF",0.22),al*0.8)); g.addColorStop(1,rgba(col,al*1.12)); ctx.fillStyle=g; ctx.fill(o.eo?"evenodd":"nonzero");
  ctx.save(); ctx.clip(o.eo?"evenodd":"nonzero"); ctx.lineJoin="round"; ctx.strokeStyle=rgba(mezcla(col,"#000000",0.3),o.borde==null?0.38:o.borde); ctx.lineWidth=o.bw||2.4; ctx.stroke();
  var area=bb.w*bb.h, nG=Math.min(900,Math.round(area*(o.grano==null?0.07:o.grano))); for(var i=0;i<nG;i++){ ctx.fillStyle=R()<0.5?"rgba(255,255,255,0.22)":rgba(mezcla(col,"#000000",0.25),0.1); ctx.fillRect(bb.x+R()*bb.w,bb.y+R()*bb.h,0.3+R()*0.7,0.3+R()*0.7); }
  ctx.restore(); ctx.restore(); }
/* rayado de sombra con la pluma */
function tRayado(ctx,subs,col,o,R){ var bb=tCaja(subs); if(!(bb.w>0)) return; var ang=o.ang==null?0.8:o.ang, sp=o.sp||2.2, cx=bb.x+bb.w/2, cy=bb.y+bb.h/2, rad=Math.hypot(bb.w,bb.h)/2, lado=o.lado||[0.7,0.7], umbral=o.umbral==null?0.1:o.umbral, ca=Math.cos(ang), sa=Math.sin(ang);
  ctx.save(); ctx.beginPath(); subs.forEach(function(s){ var p=s.p; if(p.length<3) return; ctx.moveTo(p[0][0],p[0][1]); for(var i=1;i<p.length;i++) ctx.lineTo(p[i][0],p[i][1]); ctx.closePath(); }); ctx.clip("evenodd");
  ctx.strokeStyle=rgba(col,o.al==null?0.55:o.al); ctx.lineWidth=o.w||0.38; ctx.lineCap="round";
  for(var t=-rad;t<=rad;t+=sp){ var bx=cx-sa*t, by=cy+ca*t, y0=-rad; var seg=0; while(seg<2*rad){ var len=3+R()*9, a0=seg, a1=Math.min(2*rad,seg+len); seg=a1+(R()<0.35?3+R()*5:0.2); var x0=bx+ca*(a0-rad)+(R()-0.5)*0.4, yy0=by+sa*(a0-rad), x1=bx+ca*(a1-rad), yy1=by+sa*(a1-rad)+(R()-0.5)*0.4, mx=(x0+x1)/2, my=(yy0+yy1)/2, d=((mx-cx)*lado[0]+(my-cy)*lado[1])/rad; if(d<umbral) continue; ctx.beginPath(); ctx.moveTo(x0,yy0); ctx.lineTo(x1,yy1); ctx.stroke(); } }
  ctx.restore(); }
/* dibuja un objeto: lavado + rayado + tinta. d = trazado SVG (o lista de ellos); o = {lav,al,ink,w,jit,ray,...} */
function tDib(ctx,R,d,o){ o=o||{}; var subs=[]; (Array.isArray(d)?d:[d]).forEach(function(x){ subs=subs.concat(typeof x==="string"?tCam(x):x); });
  if(o.lav) tLavado(ctx,subs.filter(function(s){ return o.abierto?true:true; }),o.lav,o,R); if(o.ray) tRayado(ctx,subs,o.ray,o.rayo||{},R);
  if(o.ink!==false) subs.forEach(function(s){ tTinta(ctx,s,{w:o.w||0.9,col:o.ink||"#2A2A33",jit:o.jit,al:o.tal},R); }); }
function tCap(ctx,it,DW,DH){ ctx.save(); ctx.translate(it.x,it.y); ctx.scale(it.w/DW,it.h/DH); ctx.lineJoin="round"; ctx.lineCap="round"; }
function tCol(it,i,def){ return (it.colors&&it.colors[i])||def; }

/* tubo de ancho variable siguiendo una línea (tentáculos, cuellos, tallos gruesos): devuelve un contorno cerrado */
function tTubo(d,w0,w1,pta){ var sub=(typeof d==="string"?tCam(d):d)[0], p=tRemuestra(sub.p,0.9), n=p.length, L=[], Rr=[]; if(n<2) return [];
  for(var i=0;i<n;i++){ var a=p[Math.max(0,i-1)], b=p[Math.min(n-1,i+1)], dx=b[0]-a[0], dy=b[1]-a[1], dl=Math.hypot(dx,dy)||1, t=i/(n-1), w=(w0+(w1-w0)*t)*0.5; L.push([p[i][0]-dy/dl*w,p[i][1]+dx/dl*w]); Rr.push([p[i][0]+dy/dl*w,p[i][1]-dx/dl*w]); }
  var o=L.concat(pta===false?[]:[[p[n-1][0]+(p[n-1][0]-p[n-2][0])*0.9,p[n-1][1]+(p[n-1][1]-p[n-2][1])*0.9]]).concat(Rr.reverse()); o.push(o[0]); return [{p:o,z:true}]; }
/* hoja o pétalo en forma de lente con curvatura: devuelve contorno cerrado */
function tHoja(x,y,ang,len,wid,curv){ var p=[], N=14, ca=Math.cos(ang), sa=Math.sin(ang), c=curv||0; for(var k=0;k<=N;k++){ var t=k/N, u=t*len, v=Math.sin(Math.PI*Math.pow(t,0.85))*wid/2; var off=c*len*t*t; p.push([x+ca*u-sa*(v+off),y+sa*u+ca*(v+off)]); } for(var j=N;j>=0;j--){ var t2=j/N, u2=t2*len, v2=-Math.sin(Math.PI*Math.pow(t2,0.85))*wid/2; var off2=c*len*t2*t2; p.push([x+ca*u2-sa*(v2+off2),y+sa*u2+ca*(v2+off2)]); } return [{p:p,z:true}]; }
/* contorno exterior de una nube de círculos (nubes, lana, espuma, arbustos): lista de [cx,cy,r] */
function tNube(cs){ var o=[]; cs.forEach(function(c,ci){ var N=Math.max(18,Math.round(c[2]*4)), run=null; for(var k=0;k<=N;k++){ var a=Math.PI*2*k/N, px=c[0]+Math.cos(a)*c[2], py=c[1]+Math.sin(a)*c[2], dentro=cs.some(function(d,di){ return di!==ci&&Math.hypot(px-d[0],py-d[1])<d[2]-0.25; });
      if(!dentro){ if(!run){ run={p:[],z:false}; o.push(run); } run.p.push([px,py]); } else run=null; } });
  return o.filter(function(s){ return s.p.length>2; }); }
/* relleno de una nube de círculos como una sola mancha (para el lavado) */
function tNubeRell(cs){ return cs.map(function(c){ return tElipse(c[0],c[1],c[2],c[2])[0]; }); }
/* sombra suave en el suelo */
function tSombra(ctx,R,cx,cy,rx,ry,col){ tDib(ctx,R,tElipse(cx,cy,rx,ry),{lav:col||"#8A8A96",al:0.28,ink:false,bw:0.8,grano:0.02}); }
