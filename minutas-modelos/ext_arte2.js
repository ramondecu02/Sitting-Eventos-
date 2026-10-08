/* ══ ARTE PROCEDURAL (2.ª tanda) ═════════════════════════════════════════
   Almendros en flor, flamencos del Delta, montañas del Montsià, osito, globos aerostáticos, barquito de papel,
   flores silvestres, pizarra de tiza, acebo y copos de nieve. Todo dibujado con código. */
function flor5(ctx,cx,cy,r,col,cen,R,rot){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(rot||0);
  for(var p=0;p<5;p++){ ctx.save(); ctx.rotate(p*1.2566+(R?(R()-0.5)*0.12:0)); var g=ctx.createRadialGradient(r*0.12,0,0,r*0.5,0,r*0.62); g.addColorStop(0,rgba(mezcla(col,"#D96A8E",0.45),0.95)); g.addColorStop(0.45,rgba(mezcla(col,"#FFFFFF",0.55),0.97)); g.addColorStop(1,rgba(mezcla(col,"#FFFFFF",0.8),0.96));
    ctx.fillStyle=g; ctx.strokeStyle=rgba(mezcla(col,"#B05A78",0.35),0.45); ctx.lineWidth=0.35; ctx.beginPath(); ctx.ellipse(r*0.5,0,r*0.5,r*0.4,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.strokeStyle=rgba("#B24A6C",0.8); ctx.lineWidth=0.35; ctx.fillStyle=cen||"#C0476E"; for(var s=0;s<9;s++){ var a=s*0.7+0.2, l=r*(0.3+(s%3)*0.07); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*l,Math.sin(a)*l); ctx.stroke(); ctx.beginPath(); ctx.arc(Math.cos(a)*l,Math.sin(a)*l,r*0.06,0,Math.PI*2); ctx.fill(); }
  ctx.fillStyle=rgba("#E8B84A",0.95); ctx.beginPath(); ctx.arc(0,0,r*0.1,0,Math.PI*2); ctx.fill(); ctx.restore(); }
/* rama de almendro en flor */
ARTE.almendro=function(ctx,it){ var R=rng(it.seed||3), x=it.x, y=it.y, w=it.w, h=it.h, petalo=it.fill||"#F7D9E2", cen=it.fill2||"#C0476E", ram=it.stroke||"#5B4638", flip=it.flip?-1:1;
  ctx.save(); ctx.translate(x+(flip<0?w:0),y); ctx.scale(flip,1); ctx.lineCap="round"; ctx.lineJoin="round";
  var P=function(px,py){ return [px*w,py*h]; }, tronco=[P(0,0.1),P(0.12,0.16+R()*0.04),P(0.26,0.2+R()*0.06),P(0.4,0.32+R()*0.05),P(0.56,0.42+R()*0.06),P(0.74,0.62+R()*0.06),P(0.88,0.74+R()*0.05),P(1,0.86)];
  function rama(pts,w0,w1){ for(var i=0;i<pts.length-1;i++){ ctx.strokeStyle=ram; ctx.lineWidth=w0+(w1-w0)*i/(pts.length-1); ctx.beginPath(); ctx.moveTo(pts[i][0],pts[i][1]); ctx.lineTo(pts[i+1][0],pts[i+1][1]); ctx.stroke(); } }
  var flores=[], yemas=[];
  function ramita(px,py,ang,lar,nivel){ var pts=[[px,py]], a=ang, qx=px, qy=py, seg=4+Math.floor(R()*2); for(var i=0;i<seg;i++){ a+=(R()-0.5)*0.7; qx+=Math.cos(a)*lar/seg; qy+=Math.sin(a)*lar/seg; pts.push([qx,qy]);
      if(i>0&&R()<0.8) flores.push([qx,qy,w*(0.05+R()*0.025)]); else if(R()<0.6) yemas.push([qx,qy]); }
    rama(pts,nivel>0?1.5:1.0,0.45); flores.push([qx,qy,w*0.062]); if(nivel>0&&R()<0.7) ramita(pts[2][0],pts[2][1],a+(R()<0.5?0.9:-0.9),lar*0.5,nivel-1); }
  rama(tronco,3.6,1.4);
  for(var k=1;k<tronco.length-1;k++){ var q=tronco[k], dir=Math.atan2(tronco[k+1][1]-tronco[k-1][1],tronco[k+1][0]-tronco[k-1][0]); ramita(q[0],q[1],dir-0.75-R()*0.35,h*(0.2+R()*0.1),1); ramita(q[0],q[1],dir+0.7+R()*0.35,h*(0.18+R()*0.1),1); }
  ramita(tronco[tronco.length-1][0],tronco[tronco.length-1][1],-0.3,h*0.22,0);
  yemas.forEach(function(q){ var g=ctx.createRadialGradient(q[0]-0.5,q[1]-0.5,0.2,q[0],q[1],2.6); g.addColorStop(0,"#FBE7EE"); g.addColorStop(1,"#D98AA6"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(q[0],q[1],2,0,Math.PI*2); ctx.fill(); });
  flores.forEach(function(q){ flor5(ctx,q[0],q[1],q[2],petalo,cen,R,R()*6.28); });
  ctx.restore(); };
/* flamenco del Delta del Ebro */
ARTE.flamenco=function(ctx,it){ var x=it.x, y=it.y, w=it.w, h=it.h, col=it.fill||"#F08A9B", osc=it.stroke||"#D9667F", flip=it.flip?-1:1; ctx.save(); ctx.translate(x+(flip<0?w:0),y); ctx.scale(flip,1); ctx.lineCap="round"; ctx.lineJoin="round";
  var X=function(v){ return v*w; }, Y=function(v){ return v*h; };
  ctx.strokeStyle=rgba(osc,0.9); ctx.lineWidth=Math.max(0.8,w*0.022); ctx.beginPath(); ctx.moveTo(X(0.5),Y(0.7)); ctx.lineTo(X(0.5),Y(0.86)); ctx.lineTo(X(0.52),Y(0.99)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X(0.52),Y(0.99)); ctx.lineTo(X(0.6),Y(1)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(0.42),Y(0.7)); ctx.lineTo(X(0.34),Y(0.82)); ctx.lineTo(X(0.46),Y(0.88)); ctx.stroke();
  var g=ctx.createLinearGradient(0,Y(0.4),0,Y(0.72)); g.addColorStop(0,mezcla(col,"#FFFFFF",0.25)); g.addColorStop(1,col); ctx.fillStyle=g;
  ctx.beginPath(); ctx.moveTo(X(0.06),Y(0.6)); ctx.bezierCurveTo(X(0.18),Y(0.5),X(0.32),Y(0.42),X(0.5),Y(0.43)); ctx.bezierCurveTo(X(0.7),Y(0.42),X(0.82),Y(0.52),X(0.76),Y(0.64)); ctx.bezierCurveTo(X(0.7),Y(0.74),X(0.5),Y(0.76),X(0.34),Y(0.7)); ctx.bezierCurveTo(X(0.22),Y(0.67),X(0.12),Y(0.66),X(0.06),Y(0.6)); ctx.fill();
  ctx.strokeStyle=rgba(osc,0.55); ctx.lineWidth=Math.max(0.5,w*0.01); [[0.2,0.58,0.52,0.52],[0.26,0.62,0.56,0.58],[0.34,0.67,0.6,0.63]].forEach(function(l){ ctx.beginPath(); ctx.moveTo(X(l[0]),Y(l[1])); ctx.quadraticCurveTo(X((l[0]+l[2])/2),Y(l[1]-0.045),X(l[2]),Y(l[3])); ctx.stroke(); });
  ctx.strokeStyle=col; ctx.lineWidth=Math.max(1.6,w*0.07); ctx.beginPath(); ctx.moveTo(X(0.7),Y(0.52)); ctx.bezierCurveTo(X(0.98),Y(0.44),X(0.4),Y(0.28),X(0.7),Y(0.09)); ctx.stroke();
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(X(0.7),Y(0.085),w*0.052,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#FBF1EE"; ctx.beginPath(); ctx.moveTo(X(0.74),Y(0.07)); ctx.bezierCurveTo(X(0.86),Y(0.07),X(0.92),Y(0.11),X(0.9),Y(0.15)); ctx.bezierCurveTo(X(0.84),Y(0.12),X(0.78),Y(0.12),X(0.74),Y(0.12)); ctx.closePath(); ctx.fill();
  ctx.fillStyle="#2B2B33"; ctx.beginPath(); ctx.moveTo(X(0.84),Y(0.075)); ctx.bezierCurveTo(X(0.9),Y(0.085),X(0.93),Y(0.12),X(0.9),Y(0.15)); ctx.bezierCurveTo(X(0.88),Y(0.13),X(0.86),Y(0.12),X(0.82),Y(0.115)); ctx.closePath(); ctx.fill();
  ctx.fillStyle="#2B2B33"; ctx.beginPath(); ctx.arc(X(0.7),Y(0.075),w*0.009,0,Math.PI*2); ctx.fill(); ctx.restore(); };
/* cordilleras en capas (la sierra del Montsià y els Ports) */
ARTE.montes=function(ctx,it){ var R=rng(it.seed||4), x=it.x, y=it.y, w=it.w, h=it.h, cols=it.colors||["#C9D6D8","#A9BDC2","#7F9AA3","#5A7782","#3E5B66"], bg=it.bg||"#F6F1E6", n=cols.length;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  if(it.sol){ var s=it.sol; ctx.fillStyle=s[3]||"#F6C97B"; ctx.beginPath(); ctx.arc(x+s[0]*w,y+s[1]*h,s[2],0,Math.PI*2); ctx.fill(); }
  for(var L=0;L<n;L++){ var base=y+h*(0.3+0.62*L/n), amp=h*(0.2-0.12*L/n), N=64, pts=[], vals=[0,0]; var m=[R(),R()]; var puntos=[{x:0,v:R()},{x:1,v:R()}];
    (function disp(a,b,amp2,d){ if(d<=0) return; var mid=(a.v+b.v)/2+(R()-0.5)*amp2, p={x:(a.x+b.x)/2,v:mid}; puntos.push(p); disp(a,p,amp2*0.55,d-1); disp(p,b,amp2*0.55,d-1); })(puntos[0],puntos[1],1,6);
    puntos.sort(function(p,q){ return p.x-q.x; });
    ctx.beginPath(); ctx.moveTo(x,y+h); puntos.forEach(function(p){ ctx.lineTo(x+p.x*w,base-p.v*amp); }); ctx.lineTo(x+w,y+h); ctx.closePath();
    var g=ctx.createLinearGradient(0,base-amp,0,y+h); g.addColorStop(0,cols[L]); g.addColorStop(0.5,mezcla(cols[L],bg,0.18)); g.addColorStop(1,bg); ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle=rgba(mezcla(cols[L],"#FFFFFF",0.5),0.55); ctx.lineWidth=0.5; ctx.beginPath(); puntos.forEach(function(p,i){ if(i) ctx.lineTo(x+p.x*w,base-p.v*amp); else ctx.moveTo(x+p.x*w,base-p.v*amp); }); ctx.stroke(); }
  ctx.restore(); };
/* osito de peluche con globo */
ARTE.osito=function(ctx,it){ var x=it.x, y=it.y, w=it.w, h=it.h, piel=it.fill||"#D9B08C", clara=it.fill2||"#F2DEC8", linea=it.stroke||"#8A6A4F", u=w, cx=x+w/2; ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round"; ctx.strokeStyle=linea; ctx.lineWidth=Math.max(0.6,u*0.012);
  var bodyY=y+h*0.8, headY=y+h*0.58;
  if(it.globo){ var gx=cx+u*0.3, gy=y+h*0.17; ctx.strokeStyle=rgba(linea,0.8); ctx.beginPath(); ctx.moveTo(gx,gy+u*0.2); ctx.quadraticCurveTo(gx-u*0.04,y+h*0.45,cx+u*0.27,y+h*0.69); ctx.stroke();
    var gg=ctx.createRadialGradient(gx-u*0.06,gy-u*0.08,u*0.02,gx,gy,u*0.22); gg.addColorStop(0,mezcla(it.globo,"#FFFFFF",0.55)); gg.addColorStop(1,it.globo); ctx.fillStyle=gg; ctx.strokeStyle=rgba(mezcla(it.globo,"#000000",0.25),0.6); ctx.beginPath(); ctx.ellipse(gx,gy,u*0.17,u*0.21,0.15,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.fillStyle=it.globo; ctx.beginPath(); ctx.moveTo(gx-2,gy+u*0.2); ctx.lineTo(gx+2,gy+u*0.2); ctx.lineTo(gx,gy+u*0.235); ctx.fill(); }
  ctx.strokeStyle=linea; ctx.lineWidth=Math.max(0.6,u*0.012);
  function el(px,py,rx,ry,f,rot){ ctx.fillStyle=f; ctx.beginPath(); ctx.ellipse(px,py,rx,ry,rot||0,0,Math.PI*2); ctx.fill(); ctx.stroke(); }
  el(cx-u*0.2,bodyY+u*0.25,u*0.11,u*0.075,piel,0.2); el(cx+u*0.2,bodyY+u*0.25,u*0.11,u*0.075,piel,-0.2);
  el(cx,bodyY,u*0.3,u*0.28,piel); el(cx,bodyY+u*0.04,u*0.18,u*0.19,clara);
  el(cx-u*0.2,bodyY+u*0.27,u*0.065,u*0.045,clara,0.2); el(cx+u*0.2,bodyY+u*0.27,u*0.065,u*0.045,clara,-0.2);
  el(cx-u*0.28,bodyY-u*0.04,u*0.08,u*0.15,piel,0.5); el(cx+u*0.3,bodyY-u*0.1,u*0.08,u*0.15,piel,-0.6);
  el(cx-u*0.2,headY-u*0.2,u*0.09,u*0.09,piel); el(cx+u*0.2,headY-u*0.2,u*0.09,u*0.09,piel); el(cx-u*0.2,headY-u*0.2,u*0.05,u*0.05,clara); el(cx+u*0.2,headY-u*0.2,u*0.05,u*0.05,clara);
  el(cx,headY,u*0.25,u*0.22,piel); el(cx,headY+u*0.07,u*0.1,u*0.075,clara);
  ctx.fillStyle="#4A3A2E"; ctx.beginPath(); ctx.ellipse(cx,headY+u*0.045,u*0.035,u*0.025,0,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx-u*0.09,headY-u*0.03,u*0.017,0,Math.PI*2); ctx.arc(cx+u*0.09,headY-u*0.03,u*0.017,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle="#4A3A2E"; ctx.lineWidth=Math.max(0.5,u*0.01); ctx.beginPath(); ctx.moveTo(cx,headY+u*0.07); ctx.lineTo(cx,headY+u*0.095); ctx.moveTo(cx-u*0.04,headY+u*0.105); ctx.quadraticCurveTo(cx,headY+u*0.12,cx+u*0.04,headY+u*0.105); ctx.stroke();
  ctx.fillStyle=rgba("#F29AA8",0.5); ctx.beginPath(); ctx.ellipse(cx-u*0.15,headY+u*0.05,u*0.04,u*0.025,0,0,Math.PI*2); ctx.ellipse(cx+u*0.15,headY+u*0.05,u*0.04,u*0.025,0,0,Math.PI*2); ctx.fill();
  if(it.lazo){ ctx.fillStyle=it.lazo; ctx.strokeStyle=rgba(mezcla(it.lazo,"#000000",0.3),0.7); ctx.beginPath(); ctx.moveTo(cx,headY+u*0.22); ctx.lineTo(cx-u*0.1,headY+u*0.17); ctx.lineTo(cx-u*0.1,headY+u*0.27); ctx.closePath(); ctx.moveTo(cx,headY+u*0.22); ctx.lineTo(cx+u*0.1,headY+u*0.17); ctx.lineTo(cx+u*0.1,headY+u*0.27); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(cx,headY+u*0.22,u*0.024,0,Math.PI*2); ctx.fill(); }
  ctx.restore(); };
/* globo aerostático */
ARTE.globoaire=function(ctx,it){ var x=it.x, y=it.y, w=it.w, h=it.h, cols=it.colors||["#F2A99C","#F7D08A","#9FD0C7","#8EB8E0"], cx=x+w/2, H=h*0.76, ng=it.gajos||8, N=26; ctx.save(); ctx.lineJoin="round";
  function hw(t){ return (w/2)*Math.pow(Math.sin(Math.PI*Math.min(1,0.04+t*0.86)),0.62); }
  var baseT=1, cesto=cx; ctx.strokeStyle=rgba(it.stroke||"#7A5A45",0.8); ctx.lineWidth=0.6;
  var bx0=cx-hw(1)*0.9, bx1=cx+hw(1)*0.9, by=y+H, cw=w*0.2, cy1=y+h*0.9; ctx.beginPath(); ctx.moveTo(bx0,by); ctx.lineTo(cx-cw/2,cy1); ctx.moveTo(bx1,by); ctx.lineTo(cx+cw/2,cy1); ctx.moveTo(cx-hw(1)*0.3,by); ctx.lineTo(cx-cw*0.15,cy1); ctx.moveTo(cx+hw(1)*0.3,by); ctx.lineTo(cx+cw*0.15,cy1); ctx.stroke();
  ctx.fillStyle="#C99B6D"; ctx.strokeStyle="#8A6A4F"; ctx.beginPath(); ctx.rect(cx-cw/2,cy1,cw,h*0.08); ctx.fill(); ctx.stroke(); ctx.strokeStyle=rgba("#8A6A4F",0.6); ctx.beginPath(); ctx.moveTo(cx-cw/2,cy1+h*0.03); ctx.lineTo(cx+cw/2,cy1+h*0.03); ctx.stroke();
  for(var k=0;k<ng;k++){ var s0=-1+2*k/ng, s1=-1+2*(k+1)/ng; ctx.beginPath(); for(var i=0;i<=N;i++){ var t=i/N; ctx.lineTo(cx+s0*hw(t),y+t*H); } for(var j=N;j>=0;j--){ var t2=j/N; ctx.lineTo(cx+s1*hw(t2),y+t2*H); } ctx.closePath(); ctx.fillStyle=cols[k%cols.length]; ctx.fill(); }
  var g=ctx.createLinearGradient(x,0,x+w,0); g.addColorStop(0,"rgba(255,255,255,0.35)"); g.addColorStop(0.45,"rgba(255,255,255,0)"); g.addColorStop(1,"rgba(0,0,0,0.12)"); ctx.fillStyle=g; ctx.beginPath(); for(var i2=0;i2<=N;i2++){ var t3=i2/N; ctx.lineTo(cx-hw(t3),y+t3*H); } for(var j2=N;j2>=0;j2--){ var t4=j2/N; ctx.lineTo(cx+hw(t4),y+t4*H); } ctx.closePath(); ctx.fill();
  ctx.strokeStyle=rgba(it.stroke||"#7A5A45",0.55); ctx.lineWidth=0.5; for(var k2=1;k2<ng;k2++){ var s=-1+2*k2/ng; ctx.beginPath(); for(var i3=0;i3<=N;i3++){ var t5=i3/N; ctx.lineTo(cx+s*hw(t5),y+t5*H); } ctx.stroke(); }
  ctx.beginPath(); for(var i4=0;i4<=N;i4++){ var t6=i4/N; ctx.lineTo(cx-hw(t6),y+t6*H); } for(var j3=N;j3>=0;j3--){ var t7=j3/N; ctx.lineTo(cx+hw(t7),y+t7*H); } ctx.closePath(); ctx.stroke(); ctx.restore(); };
/* barquito de papel sobre las olas */
ARTE.barquito=function(ctx,it){ var x=it.x, y=it.y, w=it.w, h=it.h, c=it.fill||"#F4B183", c2=it.fill2||"#3E6E9C", X=function(v){ return x+v*w; }, Y=function(v){ return y+v*h; }; ctx.save(); ctx.lineJoin="round";
  function poly(p,f,s){ ctx.beginPath(); p.forEach(function(q,i){ if(i) ctx.lineTo(X(q[0]),Y(q[1])); else ctx.moveTo(X(q[0]),Y(q[1])); }); ctx.closePath(); ctx.fillStyle=f; ctx.fill(); if(s){ ctx.strokeStyle=s; ctx.lineWidth=0.5; ctx.stroke(); } }
  var sombra=rgba(mezcla(c,"#000000",0.35),0.5);
  poly([[0.5,0.02],[0.14,0.6],[0.5,0.6]],mezcla(c,"#FFFFFF",0.3),sombra); poly([[0.5,0.02],[0.86,0.6],[0.5,0.6]],mezcla(c,"#000000",0.08),sombra);
  poly([[0.04,0.62],[0.96,0.62],[0.76,0.86],[0.24,0.86]],c,sombra); poly([[0.04,0.62],[0.5,0.62],[0.4,0.86],[0.24,0.86]],mezcla(c,"#FFFFFF",0.2),null); poly([[0.5,0.62],[0.96,0.62],[0.76,0.86],[0.4,0.86]],mezcla(c,"#000000",0.14),sombra);
  ctx.strokeStyle=rgba(c2,0.85); ctx.lineWidth=0.9; ctx.lineCap="round"; for(var r=0;r<4;r++){ var yy=Y(0.84+r*0.05), amp=h*0.014; ctx.beginPath(); for(var i=0;i<=40;i++){ var px=x+w*(-0.12+1.24*i/40), py=yy+Math.sin(i/40*Math.PI*(7+r)+r)*amp; if(i) ctx.lineTo(px,py); else ctx.moveTo(px,py); } ctx.globalAlpha=0.95-r*0.18; ctx.stroke(); } ctx.restore(); };
/* pradera de flores silvestres */
ARTE.silvestres=function(ctx,it){ var R=rng(it.seed||5), x=it.x, y=it.y, w=it.w, h=it.h, n=it.n||26, verde=it.stroke||"#6E8F5A", cols=it.colors||["#FFFFFF","#E9544A","#6B8FD6","#F2C94C","#F7B7C6"]; ctx.save(); ctx.beginPath(); ctx.rect(x-30,y-30,w+60,h+60); ctx.clip(); ctx.lineCap="round";
  for(var b=0;b<n*2;b++){ var bx=x+R()*w, hh=h*(0.25+R()*0.5), sw=(R()-0.5)*14; ctx.strokeStyle=rgba(mezcla(verde,"#FFFFFF",R()*0.3),0.75); ctx.lineWidth=0.7+R()*0.6; ctx.beginPath(); ctx.moveTo(bx,y+h); ctx.quadraticCurveTo(bx+sw*0.2,y+h-hh*0.6,bx+sw,y+h-hh); ctx.stroke(); }
  for(var i=0;i<n;i++){ var px=x+(i+0.2+R()*0.6)/n*w, hh2=h*(0.35+R()*0.62), sw2=(R()-0.5)*18, tx=px+sw2, ty=y+h-hh2, tipo=Math.floor(R()*4), col=cols[Math.floor(R()*cols.length)];
    ctx.strokeStyle=verde; ctx.lineWidth=0.9; ctx.beginPath(); ctx.moveTo(px,y+h); ctx.quadraticCurveTo(px+sw2*0.15,y+h-hh2*0.55,tx,ty); ctx.stroke(); dibujaFronda(ctx,px+sw2*0.1,y+h-hh2*0.3,-1.1+(R()-0.5)*0.4,hh2*0.22,hh2*0.05,rgba(verde,0.85),null,0);
    var r=4+R()*3.4;
    if(tipo===0){ ctx.fillStyle="#FFFFFF"; ctx.strokeStyle=rgba("#B8B8B8",0.6); ctx.lineWidth=0.35; for(var p=0;p<11;p++){ ctx.save(); ctx.translate(tx,ty); ctx.rotate(p*0.5712); ctx.beginPath(); ctx.ellipse(r*0.72,0,r*0.72,r*0.22,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); } ctx.fillStyle="#F2C14E"; ctx.beginPath(); ctx.arc(tx,ty,r*0.34,0,Math.PI*2); ctx.fill(); }
    else if(tipo===1){ var rojo=it.rojo||"#E4483D"; ctx.fillStyle=rgba(rojo,0.95); ctx.strokeStyle=rgba("#9A2A22",0.5); ctx.lineWidth=0.35; for(var q=0;q<4;q++){ ctx.save(); ctx.translate(tx,ty); ctx.rotate(q*1.5708+0.4); ctx.beginPath(); ctx.ellipse(r*0.55,0,r*0.7,r*0.62,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); } ctx.fillStyle="#3A2A2A"; ctx.beginPath(); ctx.arc(tx,ty,r*0.2,0,Math.PI*2); ctx.fill(); }
    else if(tipo===2){ ctx.fillStyle=rgba(it.azul||"#6B8FD6",0.95); for(var s2=0;s2<8;s2++){ ctx.save(); ctx.translate(tx,ty); ctx.rotate(s2*0.7854); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(r*1.05,-r*0.2); ctx.lineTo(r*1.05,r*0.2); ctx.closePath(); ctx.fill(); ctx.restore(); } ctx.fillStyle="#3E4A8A"; ctx.beginPath(); ctx.arc(tx,ty,r*0.2,0,Math.PI*2); ctx.fill(); }
    else { for(var k=0;k<6;k++){ var kk=ty+k*r*0.5-r*1.4; ctx.fillStyle=rgba(col,0.9); ctx.beginPath(); ctx.arc(tx+(k%2?r*0.28:-r*0.28),kk+r*0.9,r*0.34,0,Math.PI*2); ctx.fill(); } } }
  ctx.restore(); };
/* pizarra de tiza */
ARTE.tiza=function(ctx,it){ var R=rng(it.seed||6), x=it.x, y=it.y, w=it.w, h=it.h, base=it.fill||"#26322E", tiza=it.stroke||"#F2EEE4"; ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); var g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,mezcla(base,"#FFFFFF",0.05)); g.addColorStop(1,mezcla(base,"#000000",0.12)); ctx.fillStyle=g; ctx.fillRect(x,y,w,h);
  for(var s=0;s<7;s++){ var cx=x+R()*w, cy=y+R()*h, r=Math.min(w,h)*(0.25+R()*0.5), gg=ctx.createRadialGradient(cx,cy,0,cx,cy,r); gg.addColorStop(0,"rgba(255,255,255,0.05)"); gg.addColorStop(1,"rgba(255,255,255,0)"); ctx.fillStyle=gg; ctx.fillRect(x,y,w,h); }
  for(var i=0;i<(it.n||900);i++){ ctx.fillStyle="rgba(255,255,255,"+(0.015+R()*0.05)+")"; ctx.fillRect(x+R()*w,y+R()*h,0.5+R()*1.6,0.4+R()*0.8); }
  ctx.restore();
  if(it.marco!==0){ ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round"; [[14,1.1,0.85],[19,0.6,0.55]].forEach(function(m){ var d=m[0]; ctx.strokeStyle=rgba(tiza,m[2]); ctx.lineWidth=m[1]; ctx.beginPath(); var pts=[[x+d,y+d],[x+w-d,y+d],[x+w-d,y+h-d],[x+d,y+h-d],[x+d,y+d]]; for(var q=0;q<4;q++){ var a=pts[q], b=pts[q+1], len=Math.hypot(b[0]-a[0],b[1]-a[1]), st=Math.ceil(len/10); for(var k=0;k<=st;k++){ var t=k/st, px=a[0]+(b[0]-a[0])*t+(R()-0.5)*0.9, py=a[1]+(b[1]-a[1])*t+(R()-0.5)*0.9; if(q===0&&k===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); } } ctx.stroke(); }); ctx.restore(); } };
/* acebo navideño */
function hojaAcebo(ctx,cx,cy,ang,lar,fill,borde){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(ang); var K=10; ctx.beginPath(); ctx.moveTo(0,0); for(var i=1;i<=K;i++){ var t=i/K, ww=lar*0.2*Math.sin(Math.PI*Math.pow(t,0.8)); var rad=(i%2?1:0.62); ctx.lineTo(lar*t,-ww*rad*(i===K?0:1)); } for(var j=K;j>=1;j--){ var t2=j/K, w2=lar*0.2*Math.sin(Math.PI*Math.pow(t2,0.8)); var rad2=(j%2?1:0.62); ctx.lineTo(lar*t2,w2*rad2*(j===K?0:1)); } ctx.closePath();
  var g=ctx.createLinearGradient(0,-lar*0.2,0,lar*0.2); g.addColorStop(0,mezcla(fill,"#FFFFFF",0.2)); g.addColorStop(0.5,fill); g.addColorStop(1,mezcla(fill,"#000000",0.25)); ctx.fillStyle=g; ctx.fill(); ctx.strokeStyle=borde; ctx.lineWidth=0.5; ctx.stroke();
  ctx.strokeStyle=rgba("#FFFFFF",0.35); ctx.lineWidth=0.45; ctx.beginPath(); ctx.moveTo(lar*0.04,0); ctx.lineTo(lar*0.92,0); ctx.stroke(); ctx.restore(); }
ARTE.acebo=function(ctx,it){ var R=rng(it.seed||7), x=it.x, y=it.y, w=it.w, h=it.h, hoja=it.fill||"#2F6B4A", baya=it.fill2||"#C93A35", cx=x+w*0.5, cy=y+h*0.55, r=Math.min(w,h); ctx.save();
  var n=it.n||5; for(var i=0;i<n;i++){ var a=-Math.PI/2+(i-(n-1)/2)*(1.5/(n-1||1))+(R()-0.5)*0.25+(it.rot||0); hojaAcebo(ctx,cx,cy,a,r*(0.5+R()*0.12),hoja,rgba(mezcla(hoja,"#000000",0.4),0.9)); }
  for(var b=0;b<4;b++){ var bx=cx+(R()-0.5)*r*0.26, by=cy+(R()-0.5)*r*0.16-r*0.02, br=r*0.065; var gg=ctx.createRadialGradient(bx-br*0.3,by-br*0.3,br*0.1,bx,by,br); gg.addColorStop(0,mezcla(baya,"#FFFFFF",0.5)); gg.addColorStop(0.4,baya); gg.addColorStop(1,mezcla(baya,"#000000",0.3)); ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2); ctx.fill(); }
  ctx.restore(); };
/* copos de nieve */
ARTE.nieve=function(ctx,it){ var R=rng(it.seed||8), x=it.x, y=it.y, w=it.w, h=it.h, n=it.n||60, c=it.stroke||"#FFFFFF"; ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.strokeStyle=c; ctx.fillStyle=c; ctx.lineCap="round";
  for(var i=0;i<n;i++){ var px=x+R()*w, py=y+R()*h; if(enHueco(it,px,py)) continue; var r=1+R()*R()*(it.tam||6); ctx.globalAlpha=0.35+R()*0.6;
    if(R()<0.55){ ctx.beginPath(); ctx.arc(px,py,r*0.45,0,Math.PI*2); ctx.fill(); } else { ctx.lineWidth=Math.max(0.35,r*0.1); ctx.save(); ctx.translate(px,py); ctx.rotate(R()*1.05); for(var a=0;a<6;a++){ ctx.rotate(Math.PI/3); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(r,0); ctx.moveTo(r*0.55,0); ctx.lineTo(r*0.8,r*0.28); ctx.moveTo(r*0.55,0); ctx.lineTo(r*0.8,-r*0.28); ctx.stroke(); } ctx.restore(); } }
  ctx.restore(); };
