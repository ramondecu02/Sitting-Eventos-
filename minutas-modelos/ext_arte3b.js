/* ── Brindis: dos copas de cava chocando, con salpicaduras y chispas ── */
function tFlauta(ctx,R,liq,tinta,ancho){
  var cuerpo="M-5.6 0 C-6.2 12 -4.8 24 -1.5 31.5 L-0.8 52.5 L-0.8 52.5 M5.6 0 C6.2 12 4.8 24 1.5 31.5 L0.8 52.5";
  tDib(ctx,R,"M-5.2 8.5 C-5.5 18 -4.4 25.5 -1.5 31.2 L1.5 31.2 C4.4 25.5 5.5 18 5.2 8.5 C2.4 10.2 -2.2 7 -5.2 8.5 Z",{lav:liq,al:0.62,ink:false,bw:1.6});
  tDib(ctx,R,"M-5.6 0 C-6.2 12 -4.8 24 -1.5 31.5 C-1.1 38 -0.9 46 -0.8 52.6 M5.6 0 C6.2 12 4.8 24 1.5 31.5 C1.1 38 0.9 46 0.8 52.6 M-5.6 0 C-2 -0.9 2 -0.9 5.6 0 M-6.4 58.6 C-3.4 55.4 3.4 55.4 6.4 58.6 C2 60 -2 60 -6.4 58.6 M-0.8 52.6 C-3 54.5 -5 56.5 -6.4 58.6 M0.8 52.6 C3 54.5 5 56.5 6.4 58.6",{ink:tinta,w:ancho||0.85});
  tDib(ctx,R,"M-3.4 12 C-3.6 18 -2.8 22 -1.6 26",{ink:"#FFFFFF",w:0.7,tal:0.8});
  for(var b=0;b<5;b++){ var bx=(R()-0.5)*5.4, by=11+R()*17; tDib(ctx,R,tElipse(bx,by,0.55+R()*0.45,0.55+R()*0.45),{ink:tinta,w:0.3,jit:0.05}); } }
function tChispa(ctx,R,x,y,r,col){ tDib(ctx,R,"M"+x+" "+(y-r)+" C"+(x+r*0.1)+" "+(y-r*0.1)+" "+(x+r*0.1)+" "+(y-r*0.1)+" "+(x+r)+" "+y+" C"+(x+r*0.1)+" "+(y+r*0.1)+" "+(x+r*0.1)+" "+(y+r*0.1)+" "+x+" "+(y+r)+" C"+(x-r*0.1)+" "+(y+r*0.1)+" "+(x-r*0.1)+" "+(y+r*0.1)+" "+(x-r)+" "+y+" C"+(x-r*0.1)+" "+(y-r*0.1)+" "+(x-r*0.1)+" "+(y-r*0.1)+" "+x+" "+(y-r)+" Z",{lav:col,al:0.7,ink:col,w:0.45,jit:0.05,bw:0.8}); }
ARTE.brindis=function(ctx,it){ var R=rng(it.seed||5), tinta=it.stroke||"#2A2A33", oro=tCol(it,0,"#E9C46A"), rosa=tCol(it,1,"#EFA7A0"); tCap(ctx,it,100,100);
  ctx.save(); ctx.translate(43.5,22); ctx.rotate(0.3); tFlauta(ctx,R,oro,tinta); ctx.restore();
  ctx.save(); ctx.translate(56.5,22); ctx.rotate(-0.3); tFlauta(ctx,R,rosa,tinta); ctx.restore();
  [[-0.5,-1.1,5],[-1.2,-0.7,4],[0.4,-1.2,4.6],[-1.7,-0.1,3.4],[1.3,-0.9,3.6]].forEach(function(a,i){ var ang=Math.atan2(a[1],a[0]), r0=5+R()*2, r1=r0+a[2]; tDib(ctx,R,"M"+(50+Math.cos(ang)*r0*1.3)+" "+(21.5+Math.sin(ang)*r0)+" L"+(50+Math.cos(ang)*r1*1.3)+" "+(21.5+Math.sin(ang)*r1),{ink:tinta,w:0.65,jit:0.1}); });
  tChispa(ctx,R,34,11,3.2,oro); tChispa(ctx,R,67,8,2.6,rosa); tChispa(ctx,R,50,6,2,oro);
  [[39,5],[62,14],[45,2.5]].forEach(function(g){ tDib(ctx,R,tElipse(g[0],g[1],0.9,1.3,0.3),{lav:oro,al:0.7,ink:tinta,w:0.35,jit:0.05,bw:0.6}); });
  ctx.restore(); };
/* ── Bodegón de la casa: botella, dos copas, pan y uvas sobre el mantel ── */
function tCopa(ctx,R,x,y,esc,vino,tinta,alto){ ctx.save(); ctx.translate(x,y); ctx.scale(esc,esc*(alto||1));
  tDib(ctx,R,"M-6.4 0 C-6.6 11 -3.4 19.5 0 20 C3.4 19.5 6.6 11 6.4 0 Z",{lav:"#FFFFFF",al:0.35,ink:false});
  tDib(ctx,R,"M-6.2 8 C-5.6 15.5 -3 19.6 0 20 C3 19.6 5.6 15.5 6.2 8 C3 9.6 -3 6.4 -6.2 8 Z",{lav:vino,al:0.72,ink:false,bw:1.4});
  tDib(ctx,R,"M-6.4 0 C-6.6 11 -3.4 19.5 0 20 C3.4 19.5 6.6 11 6.4 0 M0 20 L0 33 M-5.4 34.4 C-2.6 32.6 2.6 32.6 5.4 34.4 C2 35.6 -2 35.6 -5.4 34.4",{ink:tinta,w:0.8});
  tDib(ctx,R,tElipse(0,0,6.4,1.3),{ink:tinta,w:0.6}); tDib(ctx,R,"M-4.4 3 C-4.8 8 -3.6 12 -2 15",{ink:"#FFFFFF",w:0.8,tal:0.85});
  ctx.restore(); }
function tUva(ctx,R,x,y,r,col,tinta){ tDib(ctx,R,tElipse(x,y,r,r*1.04),{lav:col,al:0.7,ink:tinta,w:0.5,jit:0.12,bw:1.2,grano:0.01}); tDib(ctx,R,"M"+(x-r*0.45)+" "+(y-r*0.4)+" C"+(x-r*0.2)+" "+(y-r*0.7)+" "+(x+r*0.1)+" "+(y-r*0.7)+" "+(x+r*0.2)+" "+(y-r*0.55),{ink:"#FFFFFF",w:0.5,tal:0.75,jit:0.05}); }
ARTE.bodegon=function(ctx,it){ var R=rng(it.seed||7), tinta=it.stroke||"#2A2A33", vino=tCol(it,0,"#8E2C48"), crema=tCol(it,1,"#EFE2C6"), pan=tCol(it,2,"#D6A15F"), verde=tCol(it,3,"#7F9A63"); tCap(ctx,it,100,78);
  [[35,71.5,9,1.6],[54,71.5,7,1.3],[68,71.5,6,1.2],[86,71.5,11,1.6],[15,71.5,11,1.8]].forEach(function(s){ tSombra(ctx,R,s[0],s[1],s[2],s[3]); });
  tDib(ctx,R,tElipse(16,64.4,11,7.2),{lav:pan,al:0.62,ink:tinta,w:0.9}); tDib(ctx,R,"M9.5 60 C11 62.4 12 64 12.4 66.4 M15 57.6 C17 60.4 18 62.8 18.6 66 M21 58.2 C22.6 60.6 23.6 62.8 24.2 65.4",{ink:tinta,w:0.65});
  tDib(ctx,R,"M30.5 71 L30.5 35 C30.5 29 33.4 27 33.4 18 L33.4 8 L36.6 8 L36.6 18 C36.6 27 39.5 29 39.5 35 L39.5 71 Z",{lav:vino,al:0.4,ink:tinta,w:0.95});
  tDib(ctx,R,"M33.4 8 L33.4 15 L36.6 15 L36.6 8 Z",{lav:vino,al:0.85,ink:tinta,w:0.7}); tDib(ctx,R,"M30.5 47 H39.5 V62 H30.5 Z",{lav:crema,al:0.9,ink:tinta,w:0.7,grano:0.02});
  tDib(ctx,R,"M32.2 51 H37.8 M32.6 54 H37.4 M33.2 57 H36.8",{ink:tinta,w:0.45}); tDib(ctx,R,"M32.4 36 V44",{ink:"#FFFFFF",w:0.9,tal:0.7}); tDib(ctx,R,tElipse(35,26,0.1,0.1),{ink:false});
  tCopa(ctx,R,54,36,0.98,vino,tinta,1.0); tCopa(ctx,R,68,39,0.9,"#EAC95A",tinta,0.95);
  var cx=86, r=3.5, filas=[4,4,3,2,1]; filas.forEach(function(n,i){ for(var k=0;k<n;k++){ var x=cx+(k-(n-1)/2)*r*1.95+(R()-0.5)*0.5, y=67.6-i*r*1.62+(R()-0.5)*0.4; tUva(ctx,R,x,y,r,(i+k)%2?"#6B3A6E":"#7B4A80",tinta); } });
  tDib(ctx,R,"M86 52 C86 49 87 47 89 45",{ink:tinta,w:0.9}); tDib(ctx,R,"M86 52 C81 49 79 44 81 39 C83 40 84 41 85 43 C85 38 88 35 92 35 C92 39 91 42 90 45 C93 42 97 42 99 45 C97 47 95 49 92 50 C95 51 97 53 97 56 C94 55 91 54 88 53 Z",{lav:verde,al:0.62,ink:tinta,w:0.6,eo:false});
  tDib(ctx,R,"M2 72 C25 70.8 48 73 70 71.6 C82 70.8 92 71.6 98 72",{ink:tinta,w:0.8}); tDib(ctx,R,"M6 75 H12 M22 75.6 H33 M44 75 H49 M60 75.6 H72 M82 75 H92",{ink:tinta,w:0.5,tal:0.6});
  ctx.restore(); };
/* ── La masía y los cipreses ── */
ARTE.masia=function(ctx,it){ var R=rng(it.seed||4), tinta=it.stroke||"#2A2A33", teja=tCol(it,0,"#C9694A"), muro=tCol(it,1,"#EBD9B3"), verde=tCol(it,2,"#7A9060"), sol=tCol(it,3,"#F2B66B"); tCap(ctx,it,100,72);
  tDib(ctx,R,tElipse(78,16,7.5,7.5),{lav:sol,al:0.7,ink:false,bw:1}); [[46,9],[56,6.4],[63,11]].forEach(function(a){ tDib(ctx,R,"M"+a[0]+" "+a[1]+" q2 -3 4 0 q2 -3 4 0",{ink:tinta,w:0.55}); });
  tDib(ctx,R,"M0 50 C14 41 30 44 46 48 C62 43 82 38 100 46 V62 H0 Z",{lav:verde,al:0.4,ink:tinta,w:0.6,ray:verde,rayo:{ang:1.2,sp:2.8,lado:[0,1],umbral:0.1,al:0.4}});
  tDib(ctx,R,"M21 61 V37 H62 V61 Z",{lav:muro,al:0.8,ink:tinta,w:0.95,grano:0.05}); tDib(ctx,R,"M17 38 L27.5 23 H55.5 L66 38 Z",{lav:teja,al:0.7,ink:tinta,w:0.95,ray:teja,rayo:{ang:0,sp:1.8,lado:[0,1],umbral:-0.2,al:0.45}});
  tDib(ctx,R,"M22 31 H60 M20 34.6 H64",{ink:tinta,w:0.4,tal:0.7}); tDib(ctx,R,"M47 24 V16 H53 V24",{lav:muro,al:0.8,ink:tinta,w:0.8}); tDib(ctx,R,"M46 16 H54",{ink:tinta,w:1});
  tDib(ctx,R,"M62 61 V43 H80 V61 Z",{lav:muro,al:0.8,ink:tinta,w:0.9,grano:0.05}); tDib(ctx,R,"M60 44 L66 35 H77 L83 44 Z",{lav:teja,al:0.7,ink:tinta,w:0.9});
  tDib(ctx,R,"M37.5 61 V51 C37.5 44.4 46.5 44.4 46.5 51 V61 Z",{lav:"#7A5A44",al:0.75,ink:tinta,w:0.85}); tDib(ctx,R,"M42 46 V61",{ink:tinta,w:0.4,tal:0.7});
  [[26,42],[52,42]].forEach(function(w){ tDib(ctx,R,"M"+w[0]+" "+w[1]+" h7 v9 h-7 Z",{lav:"#BFD4DC",al:0.6,ink:tinta,w:0.65}); tDib(ctx,R,"M"+(w[0]-2.2)+" "+(w[1]-0.4)+" v10 h2.2 M"+(w[0]+9.2)+" "+(w[1]-0.4)+" v10 h-2.2",{ink:tinta,w:0.55,lav:verde,al:0.5}); tDib(ctx,R,"M"+(w[0]+3.5)+" "+w[1]+" v9 M"+w[0]+" "+(w[1]+4.5)+" h7",{ink:tinta,w:0.3,tal:0.7}); });
  tDib(ctx,R,"M68 48 h5 v6 h-5 Z",{lav:"#BFD4DC",al:0.6,ink:tinta,w:0.6});
  [[91,62,15,5.2],[96,62,10.5,3.6],[7,62,12,4.2]].forEach(function(c,i){ tDib(ctx,R,"M"+c[0]+" "+c[1]+" C"+(c[0]-c[3]*0.9)+" "+(c[1]-c[2]*0.4)+" "+(c[0]-c[3]*0.9)+" "+(c[1]-c[2]*0.8)+" "+c[0]+" "+(c[1]-c[2]*1.35)+" C"+(c[0]+c[3]*0.9)+" "+(c[1]-c[2]*0.8)+" "+(c[0]+c[3]*0.9)+" "+(c[1]-c[2]*0.4)+" "+c[0]+" "+c[1]+" Z",{lav:"#4F6E4C",al:0.62,ink:tinta,w:0.7,ray:"#2F4A33",rayo:{ang:1.45,sp:1.7,lado:[1,0],umbral:-0.1,al:0.45}}); });
  tDib(ctx,R,"M0 61.5 C30 60.5 70 62.5 100 61.5",{ink:tinta,w:0.8}); for(var g=0;g<14;g++){ var gx=R()*98+1; tDib(ctx,R,"M"+gx+" 62 l-0.8 -2 M"+gx+" 62 l0.2 -2.4 M"+gx+" 62 l1.1 -1.9",{ink:tinta,w:0.35,jit:0.05}); }
  ctx.restore(); };
