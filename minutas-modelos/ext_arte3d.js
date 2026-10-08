/* ── Animalitos del bosque ── */
ARTE.conejo=function(ctx,it){ var R=rng(it.seed||10), tinta=it.stroke||"#2A2A33", piel=tCol(it,0,"#E5D5C0"), rosa=tCol(it,1,"#F0B3B0"); tCap(ctx,it,100,100);
  tSombra(ctx,R,50,92,30,3.2);
  tDib(ctx,R,tNubeRell([[22,80,6],[27,77,5]]),{lav:"#FFFFFF",al:0.8,ink:false,borde:0}); tDib(ctx,R,tNube([[22,80,6],[27,77,5]]),{ink:tinta,w:0.7});
  tDib(ctx,R,"M30 92 C20 82 22 62 34 54 C44 47 58 50 64 62 C70 72 68 86 62 92 Z",{lav:piel,al:0.7,ink:tinta,w:1,ray:"#9A8468",rayo:{ang:1.0,sp:2.2,lado:[-0.4,0.9],umbral:0.25,al:0.4}});
  tDib(ctx,R,"M44 70 C42 62 50 58 56 62 C60 68 56 76 52 80 C48 78 45 74 44 70 Z",{lav:"#FFFFFF",al:0.5,ink:false});
  tDib(ctx,R,"M50 92 C50 86 56 83 62 85 C68 87 68 92 66 92",{lav:piel,al:0.7,ink:tinta,w:0.9});
  tDib(ctx,R,"M52 32 C47 20 48 8 54 5 C59 9 60 22 59 31 Z",{lav:piel,al:0.7,ink:tinta,w:0.95}); tDib(ctx,R,"M60 30 C62 19 68 9 75 9 C77 15 73 26 67 34 Z",{lav:piel,al:0.7,ink:tinta,w:0.95});
  tDib(ctx,R,"M53 28 C51 19 51 12 54 9 C56 14 56 22 56 28 Z",{lav:rosa,al:0.65,ink:false}); tDib(ctx,R,"M66 29 C67 21 70 14 73 13 C74 18 72 24 69 29 Z",{lav:rosa,al:0.6,ink:false});
  tDib(ctx,R,"M47 44 C44 34 52 28 61 30 C70 32 75 40 72 48 C68 55 56 56 50 52 C48 50 47 47 47 44 Z",{lav:piel,al:0.7,ink:tinta,w:1});
  tDib(ctx,R,tElipse(63,40,1.4,1.7),{lav:tinta,al:1,ink:tinta,w:0.4}); tDib(ctx,R,"M70 45 L74 46.5 L70.5 48.6 Z",{lav:rosa,al:0.9,ink:tinta,w:0.5}); tDib(ctx,R,"M72 47.4 C71 50 68.6 51 66.6 50.4 M72 47.4 C73 50 75 50.6 77 49.6",{ink:tinta,w:0.4});
  tDib(ctx,R,"M71 45 L80 42 M71 46.6 L81 47 M70 48 L79 52",{ink:tinta,w:0.28,tal:0.7}); tDib(ctx,R,tElipse(66.4,46.6,2.6,1.6),{lav:rosa,al:0.5,ink:false,bw:0.8});
  for(var g=0;g<8;g++){ var gx=10+g*11+R()*4; tDib(ctx,R,"M"+gx+" 93 l-1.2 -3.2 M"+gx+" 93 l0.4 -3.8 M"+gx+" 93 l1.6 -3",{ink:tinta,w:0.4,jit:0.04}); }
  ctx.restore(); };
ARTE.zorro=function(ctx,it){ var R=rng(it.seed||11), tinta=it.stroke||"#2A2A33", pelo=tCol(it,0,"#E0834A"), blanco=tCol(it,1,"#FBF4E6"); tCap(ctx,it,100,100);
  tDib(ctx,R,"M18 42 L24 12 L42 29 C46 28 54 28 58 29 L76 12 L82 42 C82 58 66 74 50 86 C34 74 18 58 18 42 Z",{lav:pelo,al:0.72,ink:tinta,w:1.05,ray:"#9A4A22",rayo:{ang:1.3,sp:2.4,lado:[0.1,-0.6],umbral:0.2,al:0.35}});
  tDib(ctx,R,"M18 46 C26 54 40 62 50 86 C36 76 24 64 18 46 Z",{lav:blanco,al:0.92,ink:tinta,w:0.7}); tDib(ctx,R,"M82 46 C74 54 60 62 50 86 C64 76 76 64 82 46 Z",{lav:blanco,al:0.92,ink:tinta,w:0.7});
  tDib(ctx,R,"M40 40 C44 52 56 52 60 40 C56 60 52 74 50 86 C48 74 44 60 40 40 Z",{lav:blanco,al:0.85,ink:false});
  tDib(ctx,R,"M27 16 L25 30 L36 27 Z",{lav:"#5A3A2E",al:0.7,ink:tinta,w:0.6}); tDib(ctx,R,"M73 16 L75 30 L64 27 Z",{lav:"#5A3A2E",al:0.7,ink:tinta,w:0.6});
  tDib(ctx,R,"M30 46 C34 42 40 43 43 47 M70 46 C66 42 60 43 57 47",{ink:tinta,w:0.8}); tDib(ctx,R,tElipse(37,46,1.6,1.6),{lav:tinta,al:1,ink:false}); tDib(ctx,R,tElipse(63,46,1.6,1.6),{lav:tinta,al:1,ink:false});
  tDib(ctx,R,"M45 82 C46 78 54 78 55 82 C55 86 52 88 50 88 C48 88 45 86 45 82 Z",{lav:tinta,al:0.9,ink:tinta,w:0.5}); tDib(ctx,R,"M50 88 L50 91 M50 91 C47 94 44 93 43 91 M50 91 C53 94 56 93 57 91",{ink:tinta,w:0.55});
  tDib(ctx,R,"M30 60 L18 58 M30 63 L19 65 M70 60 L82 58 M70 63 L81 65",{ink:tinta,w:0.3,tal:0.7});
  ctx.restore(); };
ARTE.buho=function(ctx,it){ var R=rng(it.seed||12), tinta=it.stroke||"#2A2A33", pluma=tCol(it,0,"#B58A5E"), claro=tCol(it,1,"#EAD7B7"), pico=tCol(it,2,"#E8A13A"); tCap(ctx,it,100,100);
  tDib(ctx,R,"M6 91 C28 88 66 92 94 86",{ink:"#7A5A44",w:1.4}); tSombra(ctx,R,50,92,22,2.4);
  tDib(ctx,R,"M24 48 C24 26 36 14 50 14 C64 14 76 26 76 48 C76 72 66 89 50 89 C34 89 24 72 24 48 Z",{lav:pluma,al:0.68,ink:tinta,w:1.05,ray:"#6B4A2E",rayo:{ang:1.2,sp:2.4,lado:[0.5,0.8],umbral:0.35,al:0.38}});
  tDib(ctx,R,"M30 24 L23 7 L41 16 Z M70 24 L77 7 L59 16 Z",{lav:pluma,al:0.7,ink:tinta,w:0.9});
  tDib(ctx,R,"M32 62 C36 52 64 52 68 62 C66 78 60 86 50 86 C40 86 34 78 32 62 Z",{lav:claro,al:0.85,ink:tinta,w:0.7});
  for(var r=0;r<4;r++) for(var k=0;k<4-(r>2?1:0);k++){ var px=50+(k-(3.5-(r>2?1:0))/2-0.25)*8.4+(r%2?4:0)*0.5, py=62+r*6.2; tDib(ctx,R,"M"+(px-3.2)+" "+(py-1.4)+" C"+(px-2.4)+" "+(py+2.6)+" "+(px+2.4)+" "+(py+2.6)+" "+(px+3.2)+" "+(py-1.4),{ink:tinta,w:0.5,tal:0.8}); }
  tDib(ctx,R,"M26 50 C14 58 15 76 28 84 C26 72 26 60 31 51 Z",{lav:pluma,al:0.75,ink:tinta,w:0.8}); tDib(ctx,R,"M74 50 C86 58 85 76 72 84 C74 72 74 60 69 51 Z",{lav:pluma,al:0.75,ink:tinta,w:0.8});
  tDib(ctx,R,tElipse(39,40,10.5,10.5),{lav:"#FFFFFF",al:0.9,ink:tinta,w:0.95}); tDib(ctx,R,tElipse(61,40,10.5,10.5),{lav:"#FFFFFF",al:0.9,ink:tinta,w:0.95});
  tDib(ctx,R,tElipse(40,41,4.6,4.6),{lav:tinta,al:1,ink:tinta,w:0.4}); tDib(ctx,R,tElipse(60,41,4.6,4.6),{lav:tinta,al:1,ink:tinta,w:0.4}); tDib(ctx,R,tElipse(41.6,39.4,1.1,1.1),{lav:"#FFFFFF",al:1,ink:false}); tDib(ctx,R,tElipse(61.6,39.4,1.1,1.1),{lav:"#FFFFFF",al:1,ink:false});
  tDib(ctx,R,"M50 46 L45.6 55 L50 61 L54.4 55 Z",{lav:pico,al:0.9,ink:tinta,w:0.6});
  tDib(ctx,R,"M38 90 l-1.6 -4 M42 90 l0 -4.4 M46 90 l1.6 -4 M54 90 l-1.6 -4 M58 90 l0 -4.4 M62 90 l1.6 -4",{ink:tinta,w:0.5});
  ctx.restore(); };
ARTE.erizo=function(ctx,it){ var R=rng(it.seed||13), tinta=it.stroke||"#2A2A33", pua=tCol(it,0,"#9A7452"), cara=tCol(it,1,"#E8CFAE"), manzana=tCol(it,2,"#D9453F"); tCap(ctx,it,100,100);
  tSombra(ctx,R,50,86,36,3);
  tDib(ctx,R,"M10 78 C6 52 26 30 50 30 C74 30 88 46 88 66 L96 72 C97 77 92 79 86 79 L46 79 C34 82 18 82 10 78 Z",{lav:pua,al:0.66,ink:false,bw:1.8});
  for(var i=0;i<46;i++){ var t=i/45, a=Math.PI*(1.0+t*0.92)+(R()-0.5)*0.12, cx=48+Math.cos(a)*38*(1+0.02*Math.sin(i)), cy=66+Math.sin(a)*38, l=7+R()*5, a2=a+(R()-0.5)*0.4; tDib(ctx,R,"M"+(cx-Math.cos(a)*10).toFixed(1)+" "+(cy-Math.sin(a)*10).toFixed(1)+" L"+(cx+Math.cos(a2)*l).toFixed(1)+" "+(cy+Math.sin(a2)*l).toFixed(1),{ink:tinta,w:0.55,jit:0.08}); }
  for(var j=0;j<34;j++){ var a3=Math.PI*(1.05+R()*0.85), r3=14+R()*18; tDib(ctx,R,"M"+(48+Math.cos(a3)*r3).toFixed(1)+" "+(66+Math.sin(a3)*r3).toFixed(1)+" l"+(Math.cos(a3)*6).toFixed(1)+" "+(Math.sin(a3)*6).toFixed(1),{ink:tinta,w:0.4,tal:0.7,jit:0.05}); }
  tDib(ctx,R,"M70 76 C74 62 84 58 92 66 C96 70 98 74 96 77 C92 80 80 80 70 78 Z",{lav:cara,al:0.85,ink:tinta,w:0.9});
  tDib(ctx,R,tElipse(97,72.4,2,1.7),{lav:tinta,al:1,ink:tinta,w:0.4}); tDib(ctx,R,tElipse(86,68,1.5,1.5),{lav:tinta,al:1,ink:false}); tDib(ctx,R,"M92 76 C94 77 96 77 97 76",{ink:tinta,w:0.4});
  tDib(ctx,R,"M30 82 L30 87 M40 83 L40 87 M70 80 L72 85 M78 80 L80 85",{ink:tinta,w:0.9});
  tDib(ctx,R,tElipse(40,28,5.6,5.2),{lav:manzana,al:0.8,ink:tinta,w:0.7}); tDib(ctx,R,"M40 23 C40 21 41 19.6 42.4 19","{ink:'#4F7A3F',w:0.6}"===0?"":"",{ink:"#4F7A3F",w:0.7}); tDib(ctx,R,"M42 22 C44 19 47 19 48 20.4 C46 22.4 44 22.6 42 22 Z",{lav:"#7FA04E",al:0.8,ink:tinta,w:0.4});
  ctx.restore(); };
/* ── La cigüeña que trae al bebé ── */
ARTE.ciguena=function(ctx,it){ var R=rng(it.seed||14), tinta=it.stroke||"#2A2A33", blanco=tCol(it,0,"#F5F3EE"), negro=tCol(it,1,"#4A4A55"), manta=tCol(it,2,"#BFE0D4"), pico=tCol(it,3,"#E0483E"); tCap(ctx,it,100,72);
  tDib(ctx,R,"M38 46 C34 54 28 60 18 62 C22 56 26 52 30 46 Z",{lav:negro,al:0.55,ink:tinta,w:0.7});
  tDib(ctx,R,"M24 42 C16 40 8 42 2 47 C8 48 16 50 26 48 Z",{lav:negro,al:0.5,ink:tinta,w:0.7});
  tDib(ctx,R,"M30 49 C20 53 10 58 2 63 M34 50 C26 55 18 61 10 67",{ink:"#C9523F",w:0.7}); tDib(ctx,R,"M2 63 l-2.6 0.2 M2 63 l-1.4 -1.8 M10 67 l-2.6 0 M10 67 l-1.4 -1.8",{ink:"#C9523F",w:0.5});
  tDib(ctx,R,"M22 40 C30 33 46 32 56 36 C62 38 65 42 63 45 C58 50 42 51 32 49 C25 47 20 44 22 40 Z",{lav:blanco,al:0.9,ink:tinta,w:0.95,ray:"#7A8A9A",rayo:{ang:0.5,sp:2.4,lado:[0,1],umbral:0.1,al:0.35}});
  tDib(ctx,R,"M40 37 C37 25 30 14 14 8 C17 16 18 22 24 28 C28 32 34 35 40 37 Z",{lav:blanco,al:0.92,ink:tinta,w:0.95,ray:"#7A8A9A",rayo:{ang:1.2,sp:2.6,lado:[0,1],umbral:0.0,al:0.3}});
  tDib(ctx,R,"M14 8 C16 14 18 20 22 26 C18 24 12 18 9 12 C11 10 12.6 9 14 8 Z",{lav:negro,al:0.8,ink:tinta,w:0.6}); tDib(ctx,R,"M22 22 C26 26 30 30 36 33 M18 16 C22 20 26 24 30 28",{ink:tinta,w:0.45,tal:0.8});
  tDib(ctx,R,tTubo("M60 38 C64 33 68 30 71 28",5.2,3),{lav:blanco,al:0.9,ink:tinta,w:0.8}); tDib(ctx,R,tElipse(73.6,27,3.2,2.9),{lav:blanco,al:0.95,ink:tinta,w:0.8}); tDib(ctx,R,tElipse(74.2,26.2,0.6,0.6),{lav:tinta,al:1,ink:false});
  tDib(ctx,R,tTubo("M76 27.6 C82 28.4 90 30.6 97 34",3.4,0.6),{lav:pico,al:0.85,ink:tinta,w:0.7});
  tDib(ctx,R,"M86 31 L84 38.6 M86 31 L88 38.6",{ink:tinta,w:0.6}); tDib(ctx,R,"M86 38.4 C82.6 36 81.6 40.6 86 41.6 C90.4 40.6 89.4 36 86 38.4 Z",{lav:manta,al:0.8,ink:tinta,w:0.6});
  tDib(ctx,R,"M78.6 47 C79 40.6 93 40.6 93.4 47 C95 56 87 63 86 63 C85 63 77 56 78.6 47 Z",{lav:manta,al:0.78,ink:tinta,w:0.9,ray:"#6FA591",rayo:{ang:0.9,sp:2.0,lado:[0.3,1],umbral:0.1,al:0.4}});
  tDib(ctx,R,tElipse(86,49.4,4.2,4.2),{lav:"#F6C9A8",al:0.9,ink:tinta,w:0.7}); tDib(ctx,R,"M83.6 49.2 C84.6 50.2 85.4 50.2 86.2 49.2 M86.8 49.2 C87.6 50.2 88.4 50.2 89 49.2 M85 52 C85.8 52.6 86.6 52.6 87.4 52",{ink:tinta,w:0.4}); tDib(ctx,R,"M85 45.4 C85 43.8 87 43.8 86.6 45.4",{ink:tinta,w:0.45});
  tDib(ctx,R,"M80.4 57 C84 60 88 60 92 57",{ink:tinta,w:0.45,tal:0.8});
  ctx.restore(); };
/* ── El cordero con la banderola de la cruz ── */
ARTE.cordero=function(ctx,it){ var R=rng(it.seed||15), tinta=it.stroke||"#2A2A33", lana=tCol(it,0,"#FBF6EA"), cara=tCol(it,1,"#46464F"), rojo=tCol(it,2,"#D9453F"); tCap(ctx,it,100,84);
  tSombra(ctx,R,46,80,34,2.8);
  var w=[[22,60,11],[33,52,13],[46,52,13],[58,56,12],[26,69,10],[38,68,12],[51,68,11],[62,66,9]];
  tDib(ctx,R,tNubeRell(w),{lav:lana,al:0.95,ink:false,borde:0,grano:0.02}); tDib(ctx,R,tNube(w),{ink:tinta,w:0.9,jit:0.5});
  [[27,56],[38,48],[50,50],[58,60],[32,66],[44,65],[54,69]].forEach(function(c){ tDib(ctx,R,"M"+c[0]+" "+c[1]+" c2 -3.6 6 -2.6 5 1 c-1 3 -5 2 -4.4 -1",{ink:tinta,w:0.4,tal:0.75}); });
  tDib(ctx,R,"M60 54 C60 44 72 40 80 46 C86 52 85 62 79 66 C73 70 62 66 60 54 Z",{lav:cara,al:0.78,ink:tinta,w:0.95});
  tDib(ctx,R,tElipse(60,48,3,6,-0.4),{lav:cara,al:0.9,ink:tinta,w:0.8}); tDib(ctx,R,tElipse(77,54,1.3,1.3),{lav:"#FFFFFF",al:1,ink:false}); tDib(ctx,R,"M82 61 C83.4 62.4 83.4 64.2 82 65",{ink:"#FFFFFF",w:0.5,tal:0.9});
  tDib(ctx,R,"M64 46 C66 42 70 42 72 44 C70 45 66 46 64 46 Z",{lav:lana,al:0.9,ink:tinta,w:0.5});
  tDib(ctx,R,"M30 78 L30 72 M40 79 L40 73 M54 79 L54 73 M63 77 L63 71",{ink:tinta,w:1.1}); [[30,78],[40,79],[54,79],[63,77]].forEach(function(p){ tDib(ctx,R,tElipse(p[0],p[1],2.4,1.1),{lav:cara,al:0.8,ink:tinta,w:0.5}); });
  tDib(ctx,R,"M44 46 L44 6",{ink:"#9A7B56",w:1.1}); tDib(ctx,R,"M44 7 C54 5 62 9 72 7 L72 22 C62 24 54 20 44 22 Z",{lav:"#FFFFFF",al:0.85,ink:tinta,w:0.8}); tDib(ctx,R,"M58 9.4 V19.6 M53 13.6 H63",{ink:rojo,w:1.8}); tDib(ctx,R,tElipse(44,5,1.6,1.6),{lav:"#E5B94A",al:0.9,ink:tinta,w:0.4});
  ctx.restore(); };
/* ── Paloma con la ramita ── */
ARTE.paloma2=function(ctx,it){ var R=rng(it.seed||16), tinta=it.stroke||"#2A2A33", blanco=tCol(it,0,"#FBFAF6"), sombra=tCol(it,1,"#A8B4C4"), verde=tCol(it,2,"#7F9A63"); tCap(ctx,it,100,70);
  tDib(ctx,R,"M30 46 C20 46 10 50 4 58 C10 56 14 56 18 58 C14 60 12 62 8 64 C18 64 26 58 32 52 Z",{lav:blanco,al:0.92,ink:tinta,w:0.9,ray:sombra,rayo:{ang:0.3,sp:2.2,lado:[0,1],umbral:0.1,al:0.4}});
  tDib(ctx,R,"M30 42 C40 36 54 38 62 44 C66 47 68 50 64 52 C54 57 40 55 32 50 C29 48 28 44 30 42 Z",{lav:blanco,al:0.92,ink:tinta,w:1,ray:sombra,rayo:{ang:0.5,sp:2.4,lado:[0,1],umbral:0.2,al:0.4}});
  tDib(ctx,R,"M46 41 C44 29 36 17 22 11 C24 19 24 23 28 27 C26 27 24 27 22 27 C26 33 30 35 34 37 C32 39 30 39 28 39 C34 43 40 43 46 41 Z",{lav:blanco,al:0.95,ink:tinta,w:1,ray:sombra,rayo:{ang:1.1,sp:2.5,lado:[0,1],umbral:0.0,al:0.4}});
  tDib(ctx,R,"M30 22 C32 28 36 32 42 36 M26 28 C29 32 33 35 38 38",{ink:tinta,w:0.45,tal:0.8});
  tDib(ctx,R,"M60 42 C62 36 66 33 70 34 C74 36 73 41 70 44 C66 46 62 46 60 42 Z",{lav:blanco,al:0.95,ink:tinta,w:0.9}); tDib(ctx,R,tElipse(69,38.4,0.9,0.9),{lav:tinta,al:1,ink:false}); tDib(ctx,R,"M73 39.6 L78.4 41 L73 42.6 Z",{lav:"#E8A13A",al:0.9,ink:tinta,w:0.5});
  tDib(ctx,R,"M77 41.4 C84 41 91 46 95 56",{ink:"#7A5A44",w:0.9}); [[81,42,-0.6],[85,44.6,0.5],[88,48,-0.5],[91,51.4,0.6],[93.4,55,-0.4]].forEach(function(l){ tDib(ctx,R,tHoja(l[0],l[1],l[2]-1.3,8,3.2),{lav:verde,al:0.7,ink:tinta,w:0.5}); });
  ctx.restore(); };
