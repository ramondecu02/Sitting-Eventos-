/* ══ ARTE PROCEDURAL ═════════════════════════════════════════════════════
   Ilustraciones y texturas que se dibujan con código (nada de imágenes): acuarelas, mármol, terrazo,
   azulejos, curvas de nivel, cielos de estrellas, arcoíris, banderines, hierba de la pampa, papel cortado,
   rosetones, peonías, vides, olivos, limones, confeti, pan de oro, sol retro, olas japonesas, lacre…
   Cada una es una «forma» más del lienzo: se mueve, se estira y se recolorea. Con semilla (seed) cambia
   el dibujo; con «hueco» el confeti, las estrellas, etc. dejan libre la zona donde va el texto. */
function rgba(hex,a){ var c=hex2rgb(hex); return "rgba("+c[0]+","+c[1]+","+c[2]+","+(a==null?1:a)+")"; }
function mezcla(h1,h2,t){ var a=hex2rgb(h1), b=hex2rgb(h2); function p(v){ v=Math.max(0,Math.min(255,Math.round(v))); return (v<16?"0":"")+v.toString(16); } return "#"+p(a[0]+(b[0]-a[0])*t)+p(a[1]+(b[1]-a[1])*t)+p(a[2]+(b[2]-a[2])*t); }
function suave(ctx,p,cerrado){ var n=p.length; if(n<3) return; var m=function(a,b){ return [(a[0]+b[0])/2,(a[1]+b[1])/2]; };
  if(cerrado){ var s=m(p[n-1],p[0]); ctx.moveTo(s[0],s[1]); for(var i=0;i<n;i++){ var q=p[i], e=m(p[i],p[(i+1)%n]); ctx.quadraticCurveTo(q[0],q[1],e[0],e[1]); } ctx.closePath(); }
  else { ctx.moveTo(p[0][0],p[0][1]); for(var j=1;j<n-1;j++){ var e2=m(p[j],p[j+1]); ctx.quadraticCurveTo(p[j][0],p[j][1],e2[0],e2[1]); } ctx.lineTo(p[n-1][0],p[n-1][1]); } }
function enHueco(it,px,py){ var h=it.hueco; if(!h) return false; if(typeof h[0]==="number") h=[h]; for(var i=0;i<h.length;i++){ var r=h[i]; if(px>r[0]&&px<r[2]&&py>r[1]&&py<r[3]) return true; } return false; }
function mancha(ctx,cx,cy,r,R,color,alpha){ var N=30, pts=[], ph=R()*6.28, a1=0.14+R()*0.14, a2=0.06+R()*0.08, sx=0.8+R()*0.5;
  for(var i=0;i<N;i++){ var t=i/N*Math.PI*2, rr=r*(1+a1*Math.sin(3*t+ph)+a2*Math.sin(5*t+ph*1.7)+(R()-0.5)*0.05); pts.push([cx+Math.cos(t)*rr*sx,cy+Math.sin(t)*rr]); }
  var g=ctx.createRadialGradient(cx,cy,r*0.1,cx,cy,r*1.1); g.addColorStop(0,rgba(color,alpha*0.55)); g.addColorStop(0.7,rgba(color,alpha*0.9)); g.addColorStop(1,rgba(color,alpha*1.5));
  ctx.fillStyle=g; ctx.beginPath(); suave(ctx,pts,true); ctx.fill(); ctx.strokeStyle=rgba(color,alpha*0.8); ctx.lineWidth=0.5; ctx.stroke(); }
/* acuarela: manchas de color que se funden entre sí */
ARTE.acuarela=function(ctx,it){ var R=rng(it.seed||1), cols=it.colors||["#F4C6B8","#E8B4C8","#BFD4E6"], n=it.n||7, x=it.x, y=it.y, w=it.w, h=it.h;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.globalCompositeOperation="multiply";
  for(var i=0;i<n;i++){ var c=cols[i%cols.length]; mancha(ctx,x+R()*w,y+R()*h,(0.22+R()*0.3)*Math.max(w,h)*(it.k||0.6),R,c,(it.alfa||0.3)+R()*0.14); }
  ctx.restore(); };
/* mármol: base clara, nubes y venas que serpentean (con vena dorada opcional) */
ARTE.marmol=function(ctx,it){ var R=rng(it.seed||2), x=it.x, y=it.y, w=it.w, h=it.h, base=it.fill||"#F7F5F1", vena=it.stroke||"#A9A296", oro=it.oro;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.fillStyle=base; ctx.fillRect(x,y,w,h);
  for(var i=0;i<7;i++){ var cx=x+R()*w, cy=y+R()*h, r=(0.2+R()*0.35)*Math.max(w,h), g=ctx.createRadialGradient(cx,cy,0,cx,cy,r); g.addColorStop(0,rgba(vena,0.1)); g.addColorStop(1,rgba(vena,0)); ctx.fillStyle=g; ctx.fillRect(x,y,w,h); }
  var nv=it.n||6; for(var v=0;v<nv;v++){ var px=x+R()*w, py=y+R()*h, ang=R()*6.283, pts=[], gold=oro&&v%3===0;
    for(var k=0;k<36;k++){ pts.push([px,py]); ang+=(R()-0.5)*0.9; var st=Math.max(w,h)*0.032*(0.6+R()*0.8); px+=Math.cos(ang)*st; py+=Math.sin(ang)*st; }
    ctx.strokeStyle=gold?rgba(oro,0.75):rgba(vena,0.3+R()*0.3); ctx.lineWidth=gold?0.9+R()*0.9:0.3+R()*1.2; ctx.lineCap="round"; ctx.beginPath(); suave(ctx,pts,false); ctx.stroke();
    if(!gold&&R()<0.7){ ctx.lineWidth=0.3; ctx.strokeStyle=rgba(vena,0.2); ctx.beginPath(); suave(ctx,pts.map(function(q,i2){ return [q[0]+3+Math.sin(i2)*2,q[1]+2]; }),false); ctx.stroke(); } }
  ctx.restore(); };
/* terrazo: lascas de colores sobre fondo claro */
ARTE.terrazo=function(ctx,it){ var R=rng(it.seed||3), cols=it.colors||["#E7B7A8","#B9C9B0","#D8CBB4","#8FA3A8","#C9A0A0"], x=it.x, y=it.y, w=it.w, h=it.h, n=it.n||160;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); if(it.fill){ ctx.fillStyle=it.fill; ctx.fillRect(x,y,w,h); }
  for(var i=0;i<n;i++){ var cx=x+R()*w, cy=y+R()*h; if(enHueco(it,cx,cy)) continue; var r=(it.tam||7)*(0.35+R()*R()*1.5), nn=5+Math.floor(R()*3), a0=R()*6.28, pts=[];
    for(var k=0;k<nn;k++){ var a=a0+k/nn*6.283, rr=r*(0.6+R()*0.6); pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]); }
    ctx.fillStyle=cols[Math.floor(R()*cols.length)]; ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(var j=1;j<nn;j++) ctx.lineTo(pts[j][0],pts[j][1]); ctx.closePath(); ctx.fill(); }
  ctx.restore(); };
/* azulejo hidráulico: baldosas con un motivo de cuatro pétalos */
ARTE.azulejo=function(ctx,it){ var s=it.tam||36, c1=it.stroke||"#2B5A9B", c2=it.fill||"#E6EEF8", x=it.x, y=it.y, w=it.w, h=it.h;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  for(var j=0;j<Math.ceil(h/s);j++) for(var i=0;i<Math.ceil(w/s);i++){ var tx=x+i*s, ty=y+j*s, cx=tx+s/2, cy=ty+s/2, inv=(i+j)%2;
    ctx.fillStyle=inv?c1:"#FFFFFF"; ctx.fillRect(tx,ty,s,s); ctx.fillStyle=inv?"#FFFFFF":c1;
    for(var q=0;q<4;q++){ var a=q*Math.PI/2+Math.PI/4; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*s*0.17,cy+Math.sin(a)*s*0.17,s*0.2,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle=inv?c1:"#FFFFFF"; ctx.beginPath(); ctx.arc(cx,cy,s*0.1,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=rgba(c1,0.55); ctx.lineWidth=0.5; ctx.strokeRect(tx+0.25,ty+0.25,s-0.5,s-0.5);
    ctx.fillStyle=c2; ctx.globalAlpha=0.25; ctx.fillRect(tx,ty,s,s); ctx.globalAlpha=1; }
  ctx.restore(); };
/* curvas de nivel: un paisaje dibujado con líneas */
ARTE.curvas=function(ctx,it){ var R=rng(it.seed||4), x=it.x, y=it.y, w=it.w, h=it.h, np=it.n||3, niv=it.niveles||14, col=it.stroke||"#6E8A72";
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.lineWidth=it.sw||0.6; ctx.lineJoin="round";
  for(var p=0;p<np;p++){ var cx=x+R()*w, cy=y+R()*h, ph1=R()*6.28, ph2=R()*6.28, ph3=R()*6.28, sx=0.7+R()*0.7, rm=Math.max(w,h)*(0.07+R()*0.06);
    for(var k=1;k<=niv;k++){ var r=rm*k*(1+0.05*k), pts=[], N=70; for(var i=0;i<N;i++){ var t=i/N*Math.PI*2, rr=r*(1+0.22*Math.sin(2*t+ph1+k*0.07)+0.12*Math.sin(3*t+ph2)+0.06*Math.sin(5*t+ph3-k*0.05)); pts.push([cx+Math.cos(t)*rr*sx,cy+Math.sin(t)*rr]); }
      ctx.strokeStyle=rgba(col,0.18+0.5*(1-k/niv)); ctx.beginPath(); suave(ctx,pts,true); ctx.stroke(); } }
  ctx.restore(); };
function chispa(ctx,x,y,r){ ctx.beginPath(); ctx.moveTo(x,y-r); ctx.quadraticCurveTo(x+r*0.12,y-r*0.12,x+r,y); ctx.quadraticCurveTo(x+r*0.12,y+r*0.12,x,y+r); ctx.quadraticCurveTo(x-r*0.12,y+r*0.12,x-r,y); ctx.quadraticCurveTo(x-r*0.12,y-r*0.12,x,y-r); ctx.fill(); }
/* cielo estrellado con constelaciones y una luna */
ARTE.cielo=function(ctx,it){ var R=rng(it.seed||5), x=it.x, y=it.y, w=it.w, h=it.h, col=it.stroke||"#F2E3B5", n=it.n||150;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.fillStyle=col;
  for(var i=0;i<n;i++){ var px=x+R()*w, py=y+R()*h; if(enHueco(it,px,py)) continue; ctx.globalAlpha=0.25+R()*0.7; ctx.beginPath(); ctx.arc(px,py,0.25+R()*R()*1.1,0,Math.PI*2); ctx.fill(); if(R()<0.05){ ctx.globalAlpha=0.9; chispa(ctx,px,py,2+R()*3); } }
  ctx.globalAlpha=0.55; ctx.strokeStyle=col; ctx.lineWidth=0.4; var nc=it.constelaciones==null?3:it.constelaciones;
  for(var c=0;c<nc;c++){ var bx=x+R()*w, by=y+R()*h, pts=[]; for(var k=0;k<5;k++){ pts.push([bx+(R()-0.5)*70,by+(R()-0.5)*60]); } if(pts.some(function(q){ return enHueco(it,q[0],q[1]); })) continue; ctx.beginPath(); pts.forEach(function(q,i2){ if(i2) ctx.lineTo(q[0],q[1]); else ctx.moveTo(q[0],q[1]); }); ctx.stroke(); ctx.globalAlpha=0.95; pts.forEach(function(q){ ctx.beginPath(); ctx.arc(q[0],q[1],0.9,0,Math.PI*2); ctx.fill(); }); ctx.globalAlpha=0.55; }
  if(it.luna){ var L=it.luna; ctx.globalAlpha=0.95; ctx.beginPath(); ctx.arc(L[0],L[1],L[2],0,Math.PI*2); ctx.arc(L[0]+L[2]*0.42,L[1]-L[2]*0.1,L[2]*0.86,0,Math.PI*2,true); ctx.fill("evenodd"); }
  ctx.restore(); };
function nubeFlat(ctx,cx,cy,s,col){ ctx.fillStyle=col; ctx.beginPath(); ctx.arc(cx-s*0.5,cy,s*0.32,0,Math.PI*2); ctx.arc(cx,cy-s*0.2,s*0.42,0,Math.PI*2); ctx.arc(cx+s*0.5,cy,s*0.32,0,Math.PI*2); ctx.rect(cx-s*0.5,cy-s*0.02,s,s*0.3); ctx.fill(); }
ARTE.nube=function(ctx,it){ ctx.save(); ctx.globalAlpha=it.op==null?1:it.op; nubeFlat(ctx,it.x+it.w/2,it.y+it.h*0.6,it.w*0.8,it.fill||"#FFFFFF"); ctx.restore(); };
/* arcoíris boho con nubes */
ARTE.arcoiris=function(ctx,it){ var cols=it.colors||["#F2B8A8","#F4D7A6","#CFE0C3","#B9D3E6"], r=it.w/2, band=it.band||r*0.15, cx=it.x+it.w/2, cy=it.y+it.h; ctx.save(); ctx.lineCap="butt";
  cols.forEach(function(c,i){ ctx.strokeStyle=c; ctx.lineWidth=band; ctx.beginPath(); ctx.arc(cx,cy,r-band/2-i*band,Math.PI,Math.PI*2); ctx.stroke(); });
  nubeFlat(ctx,it.x+band*0.9,cy,band*2.1,it.nube||"#FFFFFF"); nubeFlat(ctx,it.x+it.w-band*0.9,cy,band*2.1,it.nube||"#FFFFFF"); ctx.restore(); };
/* banderines colgados */
ARTE.banderines=function(ctx,it){ var cols=it.colors||["#F2B8A8","#F4D7A6","#CFE0C3","#B9D3E6","#D9C2E0"], n=it.n||10, x=it.x, y=it.y, w=it.w, sag=it.sag||it.h*0.45, fs=w/n*0.62;
  ctx.save(); ctx.strokeStyle=it.stroke||"#9A8F86"; ctx.lineWidth=0.7; ctx.beginPath(); for(var i=0;i<=40;i++){ var t=i/40, px=x+t*w, py=y+4*sag*t*(1-t); if(i) ctx.lineTo(px,py); else ctx.moveTo(px,py); } ctx.stroke();
  for(var k=0;k<n;k++){ var t2=(k+0.5)/n, px2=x+t2*w, py2=y+4*sag*t2*(1-t2), ang=Math.atan(4*sag*(1-2*t2)/w); ctx.save(); ctx.translate(px2,py2); ctx.rotate(ang); ctx.fillStyle=cols[k%cols.length]; ctx.beginPath(); ctx.moveTo(-fs/2,0); ctx.lineTo(fs/2,0); ctx.lineTo(0,fs*1.25); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.restore(); };
/* hierba de la pampa: plumas finas */
ARTE.pampa=function(ctx,it){ var R=rng(it.seed||6), cols=it.colors||["#D9C3A5","#C9AE8C","#EADBC6","#B89B7A"], x=it.x, y=it.y, w=it.w, h=it.h, n=it.n||5; ctx.save(); ctx.lineCap="round";
  for(var p=0;p<n;p++){ var bx=x+w*(0.15+0.7*(p+R()*0.5)/n), by=y+h, tx=bx+(R()-0.5)*w*0.5+((p-n/2)*w*0.04), ty=y+h*(0.05+R()*0.25), cx=bx+(tx-bx)*0.2+(R()-0.5)*w*0.2, cy=by-(by-ty)*0.5;
    ctx.strokeStyle=rgba(cols[2],0.9); ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(bx,by); ctx.quadraticCurveTo(cx,cy,tx,ty); ctx.stroke();
    var nb=it.cerdas||240; for(var k=0;k<nb;k++){ var t=0.28+R()*0.72, u=1-t, px=u*u*bx+2*u*t*cx+t*t*tx, py=u*u*by+2*u*t*cy+t*t*ty, dx=2*u*(cx-bx)+2*t*(tx-cx), dy=2*u*(cy-by)+2*t*(ty-cy), a=Math.atan2(dy,dx)+(R()-0.5)*1.4, len=(h*0.18)*(0.35+R()*0.9)*(1-0.55*t);
      ctx.strokeStyle=rgba(cols[Math.floor(R()*cols.length)],0.25+R()*0.4); ctx.lineWidth=0.35+R()*0.5; ctx.beginPath(); ctx.moveTo(px,py); ctx.quadraticCurveTo(px+Math.cos(a)*len*0.6,py+Math.sin(a)*len*0.6-len*0.15,px+Math.cos(a)*len,py+Math.sin(a)*len); ctx.stroke(); } }
  ctx.restore(); };
/* papel cortado en capas */
ARTE.capas=function(ctx,it){ var R=rng(it.seed||7), cols=it.colors||["#E9D3BE","#D6B9A0","#B9967F","#8E7061"], x=it.x, y=it.y, w=it.w, h=it.h;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  if(it.sol){ ctx.fillStyle=it.sol; ctx.beginPath(); ctx.arc(x+w*(it.solx==null?0.5:it.solx),y+h*0.34,w*0.2,0,Math.PI*2); ctx.fill(); }
  cols.forEach(function(c,i){ var base=y+h*(0.42+0.14*i), a1=h*0.045, a2=h*0.02, f1=(1.4+R()*1.6)/w*Math.PI*2, f2=(3+R()*3)/w*Math.PI*2, p1=R()*6.28, p2=R()*6.28;
    ctx.save(); ctx.shadowColor="rgba(40,25,10,0.28)"; ctx.shadowBlur=6; ctx.shadowOffsetY=-1.5; ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(x,y+h); for(var k=0;k<=60;k++){ var px=x+k/60*w; ctx.lineTo(px,base+a1*Math.sin(f1*(px-x)+p1)+a2*Math.sin(f2*(px-x)+p2)); } ctx.lineTo(x+w,y+h); ctx.closePath(); ctx.fill(); ctx.restore(); });
  ctx.restore(); };
/* rosetón de vidriera */
ARTE.roseton=function(ctx,it){ var cols=it.colors||["#C9A24B","#8FB3C9","#D98E8E","#9DBE9A","#B79AC9","#E5C98E"], cx=it.x+it.w/2, cy=it.y+it.h/2, r=Math.min(it.w,it.h)/2*0.98, lead=it.stroke||"#4A4338";
  ctx.save(); ctx.translate(cx,cy); ctx.lineJoin="round";
  function petalos(n,r0,r1,wd,off,alt){ for(var i=0;i<n;i++){ var a=off+i*Math.PI*2/n; ctx.save(); ctx.rotate(a); ctx.fillStyle=rgba(cols[(i+alt)%cols.length],0.78); ctx.strokeStyle=lead; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(r0,0); ctx.quadraticCurveTo((r0+r1)/2,-wd,r1,0); ctx.quadraticCurveTo((r0+r1)/2,wd,r0,0); ctx.fill(); ctx.stroke(); ctx.restore(); } }
  ctx.fillStyle=rgba(cols[5],0.35); ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=lead; ctx.lineWidth=1.6; ctx.stroke(); ctx.lineWidth=0.7; ctx.beginPath(); ctx.arc(0,0,r*0.92,0,Math.PI*2); ctx.stroke();
  petalos(12,r*0.52,r*0.9,r*0.12,Math.PI/12,0); petalos(12,r*0.3,r*0.6,r*0.085,0,2); petalos(6,r*0.1,r*0.38,r*0.09,Math.PI/6,1);
  for(var i=0;i<12;i++){ var a=i*Math.PI/6; ctx.beginPath(); ctx.moveTo(Math.cos(a)*r*0.5,Math.sin(a)*r*0.5); ctx.lineTo(Math.cos(a)*r*0.92,Math.sin(a)*r*0.92); ctx.stroke(); }
  ctx.fillStyle=rgba(cols[0],0.95); ctx.beginPath(); ctx.arc(0,0,r*0.12,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); };
/* peonía de acuarela */
ARTE.peonia=function(ctx,it){ var R=rng(it.seed||8), col=it.fill||"#E9A6B8", cx=it.x+it.w/2, cy=it.y+it.h/2, r=Math.min(it.w,it.h)/2, hoja=it.stroke||"#6E8F6A";
  ctx.save(); for(var l=0;l<5;l++){ var a=R()*6.283; ctx.save(); ctx.translate(cx,cy); ctx.rotate(a); dibujaFronda(ctx,0,0,0,r*(0.9+R()*0.5),r*0.2,rgba(hoja,0.78),rgba(hoja,0.9),0.5); ctx.restore(); }
  for(var ring=0;ring<4;ring++){ var n=8+ring*-1+1, rr=r*(0.9-ring*0.2), cnt=Math.max(5,9-ring*1); for(var i=0;i<cnt;i++){ var a2=i/cnt*6.283+R()*0.5+ring*0.4, pr=rr*(0.62+R()*0.2), px=cx+Math.cos(a2)*rr*0.42, py=cy+Math.sin(a2)*rr*0.42;
    ctx.save(); ctx.translate(px,py); ctx.rotate(a2); var g=ctx.createRadialGradient(pr*0.1,0,0,pr*0.45,0,pr*0.8); g.addColorStop(0,rgba(mezcla(col,"#FFFFFF",0.55+ring*0.05),0.9)); g.addColorStop(1,rgba(col,0.78-ring*0.08)); ctx.fillStyle=g; ctx.strokeStyle=rgba(col,0.55); ctx.lineWidth=0.5; ctx.beginPath(); ctx.ellipse(pr*0.4,0,pr*0.62,pr*0.5,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); } }
  ctx.fillStyle="#E9C46A"; for(var s=0;s<14;s++){ ctx.beginPath(); ctx.arc(cx+(R()-0.5)*r*0.22,cy+(R()-0.5)*r*0.22,0.7+R()*0.6,0,Math.PI*2); ctx.fill(); } ctx.restore(); };
function hojaVid(ctx,x,y,s,ang,col,vena){ ctx.save(); ctx.translate(x,y); ctx.rotate(ang); ctx.beginPath(); for(var i=0;i<=60;i++){ var t=i/60*Math.PI*2, rr=s*(0.52+0.48*Math.pow(Math.abs(Math.cos(2.5*t)),0.7)); var px=Math.cos(t)*rr, py=Math.sin(t)*rr*0.9; if(i) ctx.lineTo(px,py+s*0.3); else ctx.moveTo(px,py+s*0.3); } ctx.closePath(); ctx.fillStyle=col; ctx.fill(); ctx.strokeStyle=vena; ctx.lineWidth=0.5; ctx.stroke();
  for(var k=0;k<5;k++){ var a=-Math.PI/2+(k-2)*0.62; ctx.beginPath(); ctx.moveTo(0,s*0.3); ctx.lineTo(Math.cos(a)*s*0.8,Math.sin(a)*s*0.8+s*0.3); ctx.stroke(); } ctx.restore(); }
function racimo(ctx,cx,top,g,col,R){ var filas=[5,4,4,3,2,1]; for(var f=0;f<filas.length;f++){ var n=filas[f], y=top+f*g*1.7; for(var i=0;i<n;i++){ var x=cx+(i-(n-1)/2)*g*2.05+(R()-0.5)*0.4; var gr=ctx.createRadialGradient(x-g*0.3,y-g*0.3,g*0.1,x,y,g); gr.addColorStop(0,mezcla(col,"#FFFFFF",0.45)); gr.addColorStop(1,col); ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(x,y,g,0,Math.PI*2); ctx.fill(); ctx.strokeStyle="rgba(0,0,0,0.12)"; ctx.lineWidth=0.4; ctx.stroke(); } } }
/* vid con hojas y un racimo */
ARTE.vid=function(ctx,it){ var R=rng(it.seed||9), x=it.x, y=it.y, w=it.w, h=it.h, tallo=it.stroke||"#6B4A3A", hoja=it.fill||"#7F9B62", uva=it.fill2||"#5A2A4A"; ctx.save(); ctx.lineCap="round";
  var pts=[[x+w*0.78,y],[x+w*0.6,y+h*0.12],[x+w*0.42,y+h*0.2],[x+w*0.5,y+h*0.34]]; ctx.strokeStyle=tallo; ctx.lineWidth=1.4; ctx.beginPath(); suave(ctx,pts,false); ctx.stroke();
  hojaVid(ctx,x+w*0.3,y+h*0.16,w*0.2,-0.5,rgba(hoja,0.88),rgba(tallo,0.6)); hojaVid(ctx,x+w*0.72,y+h*0.2,w*0.17,0.55,rgba(mezcla(hoja,"#2F4A2A",0.25),0.88),rgba(tallo,0.6));
  ctx.strokeStyle=tallo; ctx.lineWidth=0.9; ctx.beginPath(); ctx.moveTo(x+w*0.5,y+h*0.34); ctx.lineTo(x+w*0.5,y+h*0.42); ctx.stroke(); racimo(ctx,x+w*0.5,y+h*0.46,w*0.055,uva,R);
  ctx.strokeStyle=tallo; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(x+w*0.42,y+h*0.2); ctx.bezierCurveTo(x+w*0.3,y+h*0.26,x+w*0.26,y+h*0.34,x+w*0.32,y+h*0.4); ctx.stroke(); ctx.restore(); };
/* rama de olivo con aceitunas */
ARTE.olivo=function(ctx,it){ var R=rng(it.seed||10), x=it.x, y=it.y, w=it.w, h=it.h, hoja=it.fill||"#7B8F6A", oliva=it.fill2||"#3E4A2E", tallo=it.stroke||"#6B5A45", n=it.nh||9; ctx.save(); ctx.lineCap="round";
  var pts=[]; for(var i=0;i<=n;i++){ var t=i/n; pts.push([x+w*(0.5+0.2*Math.sin(t*3.1+it.seed)),y+t*h]); } ctx.strokeStyle=tallo; ctx.lineWidth=1.2; ctx.beginPath(); suave(ctx,pts,false); ctx.stroke();
  for(var j=1;j<n;j++){ var p=pts[j], lado=j%2?1:-1, lar=w*(0.42+R()*0.2), ang=lado>0?-0.45+(R()-0.5)*0.2:-Math.PI+0.45+(R()-0.5)*0.2; dibujaFronda(ctx,p[0],p[1],ang,lar,lar*0.17,rgba(hoja,0.9),rgba(mezcla(hoja,"#000000",0.25),0.7),0.4);
    if(R()<0.5){ var ox=p[0]+Math.cos(ang+lado*0.6)*lar*0.35, oy=p[1]+lar*0.2+Math.abs(Math.sin(ang))*lar*0.2; ctx.strokeStyle=tallo; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(p[0],p[1]); ctx.lineTo(ox,oy); ctx.stroke(); var g=ctx.createRadialGradient(ox-1,oy+3,0.5,ox,oy+4,w*0.075); g.addColorStop(0,mezcla(oliva,"#FFFFFF",0.35)); g.addColorStop(1,oliva); ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(ox,oy+w*0.08,w*0.055,w*0.08,0.15*lado,0,Math.PI*2); ctx.fill(); } }
  var q=pts[pts.length-1]; dibujaFronda(ctx,q[0],q[1],Math.PI/2,w*0.34,w*0.06,rgba(hoja,0.9),rgba(mezcla(hoja,"#000000",0.25),0.7),0.4); ctx.restore(); };
/* rama de limonero */
ARTE.limones=function(ctx,it){ var R=rng(it.seed||11), x=it.x, y=it.y, w=it.w, h=it.h, hoja=it.fill||"#4F7A3F", lim=it.fill2||"#F2CC3C", tallo=it.stroke||"#6B5A45"; ctx.save(); ctx.lineCap="round";
  var pts=[[x+w*0.9,y],[x+w*0.62,y+h*0.1],[x+w*0.4,y+h*0.26],[x+w*0.2,y+h*0.5]]; ctx.strokeStyle=tallo; ctx.lineWidth=1.3; ctx.beginPath(); suave(ctx,pts,false); ctx.stroke();
  for(var i=0;i<9;i++){ var t=0.12+i/9*0.8, u=1-t, px=pts[0][0]*u*u*u+3*pts[1][0]*u*u*t+3*pts[2][0]*u*t*t+pts[3][0]*t*t*t, py=pts[0][1]*u*u*u+3*pts[1][1]*u*u*t+3*pts[2][1]*u*t*t+pts[3][1]*t*t*t, lado=i%2?1:-1; dibujaFronda(ctx,px,py,(lado>0?-0.3:-Math.PI+0.3)+(R()-0.5)*0.4+0.5,w*(0.3+R()*0.1),w*0.1,rgba(mezcla(hoja,"#FFFFFF",R()*0.2),0.95),rgba("#2E4A24",0.8),0.4); }
  [[0.5,0.2],[0.3,0.38],[0.7,0.14]].forEach(function(q,k){ var cx=x+w*q[0], cy=y+h*q[1]+w*0.08, a=0.5-k*0.3, rx=w*0.1, ry=w*0.075; ctx.strokeStyle=tallo; ctx.lineWidth=0.7; ctx.beginPath(); ctx.moveTo(cx,cy-ry*1.6); ctx.lineTo(cx,cy-ry*0.7); ctx.stroke(); ctx.save(); ctx.translate(cx,cy); ctx.rotate(a); var g=ctx.createRadialGradient(-rx*0.3,-ry*0.3,1,0,0,rx*1.2); g.addColorStop(0,mezcla(lim,"#FFFFFF",0.45)); g.addColorStop(1,mezcla(lim,"#B5891A",0.35)); ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(rx*1.02,0,ry*0.22,0,Math.PI*2); ctx.arc(-rx*1.02,0,ry*0.18,0,Math.PI*2); ctx.fill(); ctx.strokeStyle="rgba(120,90,10,.35)"; ctx.lineWidth=0.4; ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); ctx.stroke(); ctx.restore(); });
  ctx.restore(); };
/* confeti */
ARTE.confeti=function(ctx,it){ var R=rng(it.seed||12), cols=it.colors||["#F26B5B","#F2C14E","#4FB0AE","#8E7DBE","#F49AC2","#5B8DEF"], x=it.x, y=it.y, w=it.w, h=it.h, n=it.n||120; ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  for(var i=0;i<n;i++){ var px=x+R()*w, py=y+R()*h; if(enHueco(it,px,py)) continue; ctx.save(); ctx.translate(px,py); ctx.rotate(R()*6.28); ctx.fillStyle=cols[Math.floor(R()*cols.length)]; ctx.strokeStyle=ctx.fillStyle; var tp=R(), s=(it.tam||1)*(2+R()*4);
    if(tp<0.35) ctx.fillRect(-s,-s*0.3,s*2,s*0.6); else if(tp<0.6){ ctx.beginPath(); ctx.arc(0,0,s*0.5,0,Math.PI*2); ctx.fill(); } else if(tp<0.8){ ctx.beginPath(); ctx.moveTo(-s,s*0.6); ctx.lineTo(s,s*0.6); ctx.lineTo(0,-s*0.8); ctx.closePath(); ctx.fill(); } else { ctx.lineWidth=1; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(-s*1.2,0); ctx.quadraticCurveTo(-s*0.6,-s*0.9,0,0); ctx.quadraticCurveTo(s*0.6,s*0.9,s*1.2,0); ctx.stroke(); } ctx.restore(); }
  ctx.restore(); };
/* pan de oro: esquirlas doradas */
ARTE.foil=function(ctx,it){ var R=rng(it.seed||13), x=it.x, y=it.y, w=it.w, h=it.h, n=it.n||90, c1=it.fill||"#F4E3A1", c2=it.stroke||"#B8902B"; ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  for(var i=0;i<n;i++){ var cx=x+R()*w, cy=y+R()*h; if(enHueco(it,cx,cy)) continue; var r=(it.tam||6)*(0.3+R()*R()*2), nn=4+Math.floor(R()*3), a0=R()*6.28, pts=[]; for(var k=0;k<nn;k++){ var a=a0+k/nn*6.283, rr=r*(0.5+R()*0.7); pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*0.7]); }
    var g=ctx.createLinearGradient(cx-r,cy-r,cx+r,cy+r); g.addColorStop(0,c1); g.addColorStop(0.5,c2); g.addColorStop(1,mezcla(c1,c2,0.5)); ctx.fillStyle=g; ctx.globalAlpha=0.55+R()*0.45; ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(var j=1;j<nn;j++) ctx.lineTo(pts[j][0],pts[j][1]); ctx.closePath(); ctx.fill(); }
  ctx.restore(); };
/* sol de los 70 con franjas */
ARTE.retro=function(ctx,it){ var cols=it.colors||["#F7C65B","#F29E4C","#E0617A","#8E4B8E"], bg=it.bg||"#F6E7CF", cx=it.x+it.w/2, r=it.w*0.32, cy=it.y+r*1.1; ctx.save(); ctx.beginPath(); ctx.rect(it.x,it.y,it.w,it.h); ctx.clip();
  var g=ctx.createLinearGradient(0,cy-r,0,cy+r); g.addColorStop(0,cols[0]); g.addColorStop(0.45,cols[1]); g.addColorStop(0.8,cols[2]); g.addColorStop(1,cols[3]); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=bg; for(var i=0;i<7;i++){ var t=(i+1)/8, yy=cy+r*(0.05+t*0.9), hh=1+t*5; ctx.fillRect(cx-r-1,yy,r*2+2,hh); }
  var by=cy+r*1.12; for(var k=0;k<cols.length;k++){ ctx.fillStyle=cols[k]; ctx.fillRect(it.x,by+k*5.5,it.w,2.8); } ctx.restore(); };
/* olas japonesas */
ARTE.seigaiha=function(ctx,it){ var r=it.r||15, c=it.stroke||"#2E4A7D", f=it.fill||"#F4F1EA", x=it.x, y=it.y, w=it.w, h=it.h; ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.lineWidth=it.sw||0.7;
  for(var j=0;j*r*0.5<h+r;j++){ for(var i=-1;i*r*2<w+r*2;i++){ var cx=x+i*r*2+(j%2?r:0), cy=y+j*r*0.5; ctx.fillStyle=f; ctx.strokeStyle=c; for(var k=0;k<4;k++){ ctx.beginPath(); ctx.arc(cx,cy,r*(1-k*0.22),0,Math.PI*2); if(k===0) ctx.fill(); ctx.stroke(); } } }
  ctx.restore(); };
/* sello de lacre */
ARTE.lacre=function(ctx,it){ var R=rng(it.seed||14), cx=it.x+it.w/2, cy=it.y+it.h/2, r=Math.min(it.w,it.h)/2*0.9, col=it.fill||"#8E1B2B"; ctx.save(); ctx.shadowColor="rgba(0,0,0,.3)"; ctx.shadowBlur=5; ctx.shadowOffsetY=2;
  var pts=[]; for(var i=0;i<36;i++){ var t=i/36*Math.PI*2, rr=r*(1+(i%2?0.05:-0.02)+(R()-0.5)*0.07+0.05*Math.sin(3*t)); pts.push([cx+Math.cos(t)*rr,cy+Math.sin(t)*rr]); }
  var g=ctx.createRadialGradient(cx-r*0.3,cy-r*0.3,r*0.1,cx,cy,r*1.1); g.addColorStop(0,mezcla(col,"#FFFFFF",0.25)); g.addColorStop(0.6,col); g.addColorStop(1,mezcla(col,"#000000",0.35)); ctx.fillStyle=g; ctx.beginPath(); suave(ctx,pts,true); ctx.fill(); ctx.shadowColor="transparent";
  ctx.strokeStyle="rgba(255,255,255,.22)"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,r*0.72,0,Math.PI*2); ctx.stroke(); ctx.strokeStyle="rgba(0,0,0,.25)"; ctx.beginPath(); ctx.arc(cx,cy,r*0.7,0,Math.PI*2); ctx.stroke();
  if(it.txt){ ctx.font=(r*0.8)+'px "'+(it.fnt||"Pinyon Script")+'", serif'; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillStyle="rgba(255,255,255,.35)"; ctx.fillText(it.txt,cx-0.7,cy-0.5); ctx.fillStyle="rgba(0,0,0,.35)"; ctx.fillText(it.txt,cx+0.7,cy+0.7); ctx.fillStyle=mezcla(col,"#000000",0.12); ctx.fillText(it.txt,cx,cy); }
  ctx.restore(); };
/* rayos de luz */
ARTE.rayos=function(ctx,it){ var cx=it.x+it.w/2, cy=it.y+it.h, n=it.n||26, c=it.stroke||"#D9B866", r=Math.min(it.h,it.w*0.9); ctx.save(); ctx.lineCap="round";
  for(var i=0;i<n;i++){ var a=Math.PI+Math.PI*(i+0.5)/n, l=r*(i%2?0.82:1), r0=r*0.2; ctx.strokeStyle=rgba(c,i%2?0.5:0.85); ctx.lineWidth=(it.sw||1)*(i%2?0.6:1); ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0); ctx.lineTo(cx+Math.cos(a)*l,cy+Math.sin(a)*l); ctx.stroke(); } ctx.restore(); };
/* marco art nouveau con volutas */
ARTE.nouveau=function(ctx,it){ var x=it.x, y=it.y, w=it.w, h=it.h, c=it.stroke||"#2F5D44", c2=it.fill||"#C99A2E"; ctx.save(); ctx.lineCap="round"; ctx.lineWidth=it.sw||1.2; ctx.strokeStyle=c; ctx.strokeRect(x+4,y+4,w-8,h-8); ctx.lineWidth=0.5; ctx.strokeRect(x+9,y+9,w-18,h-18);
  function espiral(px,py,sx,sy){ ctx.save(); ctx.translate(px,py); ctx.scale(sx,sy); ctx.lineWidth=1.1; ctx.strokeStyle=c2; ctx.beginPath(); for(var i=0;i<=60;i++){ var t=i/60*Math.PI*3.6, rr=3+t*3.4; var qx=Math.cos(t)*rr, qy=Math.sin(t)*rr; if(i) ctx.lineTo(qx,qy); else ctx.moveTo(qx,qy); } ctx.stroke(); ctx.strokeStyle=c; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(30,-4,48,18,70,12); ctx.bezierCurveTo(80,9,86,4,92,6); ctx.stroke(); ctx.fillStyle=c; dibujaFronda(ctx,50,10,-0.5,14,4,rgba(c,0.85),c,0.3); ctx.restore(); }
  espiral(x+22,y+22,1,1); espiral(x+w-22,y+22,-1,1); espiral(x+22,y+h-22,1,-1); espiral(x+w-22,y+h-22,-1,-1);
  ctx.fillStyle=c2; ctx.beginPath(); ctx.arc(x+w/2,y+4,3.2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(x+w/2,y+h-4,3.2,0,Math.PI*2); ctx.fill(); ctx.restore(); };
/* ballenita sencilla */
ARTE.ballena=function(ctx,it){ var x=it.x, y=it.y, w=it.w, h=it.h, c=it.fill||"#9DB9D2"; ctx.save(); ctx.fillStyle=c; ctx.strokeStyle=rgba(mezcla(c,"#000000",0.3),0.5); ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(x+w*0.05,y+h*0.62); ctx.bezierCurveTo(x+w*0.1,y+h*0.15,x+w*0.62,y+h*0.1,x+w*0.74,y+h*0.52); ctx.bezierCurveTo(x+w*0.8,y+h*0.58,x+w*0.86,y+h*0.45,x+w*0.96,y+h*0.3); ctx.bezierCurveTo(x+w*0.95,y+h*0.52,x+w*0.92,y+h*0.62,x+w*0.86,y+h*0.72); ctx.bezierCurveTo(x+w*0.96,y+h*0.74,x+w*0.99,y+h*0.82,x+w*1.0,y+h*0.9); ctx.bezierCurveTo(x+w*0.86,y+h*0.86,x+w*0.8,y+h*0.82,x+w*0.72,y+h*0.76); ctx.bezierCurveTo(x+w*0.5,y+h*0.98,x+w*0.12,y+h*0.9,x+w*0.05,y+h*0.62); ctx.fill(); ctx.stroke();
  ctx.fillStyle=rgba("#FFFFFF",0.5); ctx.beginPath(); ctx.ellipse(x+w*0.4,y+h*0.74,w*0.3,h*0.1,-0.05,0,Math.PI*2); ctx.fill(); ctx.fillStyle="#34495E"; ctx.beginPath(); ctx.arc(x+w*0.22,y+h*0.5,w*0.016,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=c; ctx.lineWidth=1.2; ctx.lineCap="round"; [[0.4,-0.1],[0.34,-0.05],[0.46,-0.05]].forEach(function(q){ ctx.beginPath(); ctx.moveTo(x+w*0.38,y+h*0.1); ctx.quadraticCurveTo(x+w*q[0],y+h*q[1],x+w*(q[0]+(q[0]-0.4)*0.8),y+h*0.0); ctx.stroke(); }); ctx.restore(); };
/* guirnalda de hojas y flores pequeñas en una esquina */
ARTE.guirnalda=function(ctx,it){ var R=rng(it.seed||15), x=it.x, y=it.y, w=it.w, h=it.h, hoja=it.fill||"#8FB08A", flor=it.fill2||"#F2B8B8", n=it.n||14; ctx.save();
  for(var i=0;i<n;i++){ var t=i/(n-1), px=x+t*w, py=y+h*(0.5+0.3*Math.sin(t*5+R())), a=(R()-0.5)*1.4-0.2; dibujaFronda(ctx,px,py,a,w*0.08*(0.8+R()*0.6),w*0.02,rgba(hoja,0.85),rgba(mezcla(hoja,"#000000",0.3),0.6),0.3); if(R()<0.45){ ctx.fillStyle=rgba(flor,0.9); for(var p=0;p<5;p++){ var aa=p*1.2566; ctx.beginPath(); ctx.arc(px+Math.cos(aa)*2.2,py+Math.sin(aa)*2.2,1.6,0,Math.PI*2); ctx.fill(); } ctx.fillStyle="#F2D27A"; ctx.beginPath(); ctx.arc(px,py,1,0,Math.PI*2); ctx.fill(); } }
  ctx.restore(); };
