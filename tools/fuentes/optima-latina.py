# Optima (edición cirílica «AG Baltia») → Optima con letras acentuadas latinas, construidas con las piezas de la propia fuente
import sys
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent, GlyphCoordinates
from fontTools.ttLib.tables._c_m_a_p import cmap_format_4
SRC='fonts_in/optima/optima.ttf'; OUT=sys.argv[1] if len(sys.argv)>1 else 'fonts_out/optima_fix.ttf'
f=TTFont(SRC); glyf=f['glyf']; hmtx=f['hmtx']; cm=dict(f['cmap'].getBestCmap()); order=list(f.getGlyphOrder())
def N(c): return cm[ord(c) if isinstance(c,str) else c]
def bb(n):
    g=glyf[n]; g.recalcBounds(glyf); return g.xMin,g.yMin,g.xMax,g.yMax
def adv(n): return hmtx[n][0]
XH=481; CAP=690
# ── i sin punto
gi=glyf[N('i')]; gi.recalcBounds(glyf)
pts=list(gi.coordinates); flags=list(gi.flags); ends=list(gi.endPtsOfContours)
cont=[]; s=0
for e in ends: cont.append((s,e)); s=e+1
def cb(c): ys=[pts[k][1] for k in range(c[0],c[1]+1)]; return min(ys),max(ys)
punto=max(cont,key=lambda c:cb(c)[0])   # el contorno más alto = el punto
nuevo=[c for c in cont if c!=punto]
g=Glyph(); g.numberOfContours=len(nuevo); co=[]; fl=[]; en=[]
for c in nuevo:
    for k in range(c[0],c[1]+1): co.append(pts[k]); fl.append(flags[k])
    en.append(len(co)-1)
g.coordinates=GlyphCoordinates(co); g.flags=fl; g.endPtsOfContours=en; g.program=__import__('fontTools.ttLib.tables.ttProgram',fromlist=['Program']).Program(); g.program.fromBytecode(b'')
glyf.glyphs['lm.dotlessi']=g; order.append('lm.dotlessi'); hmtx.metrics['lm.dotlessi']=(adv(N('i')),gi.xMin); g.recalcBounds(glyf)
base_ok={}
def add(name,comps,adv_,):
    g=Glyph(); g.numberOfContours=-1; g.components=[]
    for (gn,dx,dy,sc) in comps:
        c=GlyphComponent(); c.glyphName=gn; c.x=int(round(dx)); c.y=int(round(dy)); c.flags=0x0004|0x0002
        if sc!=1: c.transform=[[sc[0] if isinstance(sc,tuple) else sc,0],[0,sc[1] if isinstance(sc,tuple) else sc]]; c.flags|=0x0008 if not isinstance(sc,tuple) else 0x0040
        g.components.append(c)
    glyf.glyphs[name]=g; order.append(name)
    f.setGlyphOrder(order)
    g.recalcBounds(glyf); hmtx.metrics[name]=(adv_,g.xMin)
    return name
ACU,GRA,TIL,CIR,PER,COM=N(0xB4),N('`'),N('~'),N('^'),N('.'),N(',')
print('acute',bb(ACU),'grave',bb(GRA),'tilde',bb(TIL),'circ',bb(CIR),'period',bb(PER),'comma',bb(COM))
def cx(n): b=bb(n); return (b[0]+b[2])/2
def centrado(base, acc, ytop, sc=1.0, gap=48, extra_dx=0):
    """posición del acento acc sobre la base: centrado, y su parte baja a «gap» por encima de ytop"""
    ab=bb(acc); dx=cx(base)-sc*(ab[0]+ab[2])/2+extra_dx; dy=ytop+gap-sc*ab[1]; return dx,dy
nuevos={}
def comp_acc(cp, base, acc, esmay, sc=1.0, gap=None, extra_dx=0):
    top=CAP if esmay else XH
    gp=gap if gap is not None else (36 if esmay else 48)
    dx,dy=centrado(base,acc,top,sc,gp,extra_dx)
    nm='lm.u%04X'%cp
    add(nm,[(base,0,0,1),(acc,dx,dy,sc)],adv(base)); nuevos[cp]=nm
def dieresis(cp, base, esmay):
    top=CAP if esmay else XH; gp=36 if esmay else 48; pb=bb(PER); sc=0.85
    c=cx(base); sep=215; y=top+gp-sc*pb[1]
    comps=[(base,0,0,1)]
    for sgn in (-1,1):
        comps.append((PER,c+sgn*sep/2-sc*(pb[0]+pb[2])/2,y,sc))
    nm='lm.u%04X'%cp; add(nm,comps,adv(base)); nuevos[cp]=nm
def cedilla(cp, base):
    cb_=bb(COM); sc=0.85; dx=cx(base)+10-sc*(cb_[0]+cb_[2])/2; dy=18-sc*cb_[3]
    nm='lm.u%04X'%cp; add(nm,[(base,0,0,1),(COM,dx,dy,sc)],adv(base)); nuevos[cp]=nm
DL=lambda ch: 'lm.dotlessi' if ch=='i' else N(ch)
vocales=dict(a=['á','à','â','ä'],e=['é','è','ê','ë'],i=['í','ì','î','ï'],o=['ó','ò','ô','ö'],u=['ú','ù','û','ü'])
for v,lst in vocales.items():
    for ch,acc in zip(lst,[ACU,GRA,CIR,None]):
        if acc: comp_acc(ord(ch),DL(v),acc,False,sc=(0.5 if acc==CIR else 1.0), gap=(30 if acc==CIR else None))
        else: dieresis(ord(ch),DL(v),False)
    U=v.upper(); lstU=[c.upper() for c in lst]
    for ch,acc in zip(lstU,[ACU,GRA,CIR,None]):
        if acc: comp_acc(ord(ch),N(U),acc,True,sc=(0.5 if acc==CIR else 1.0), gap=(20 if acc==CIR else None))
        else: dieresis(ord(ch),N(U),True)
comp_acc(ord('ñ'),N('n'),TIL,False,sc=0.50,gap=40); comp_acc(ord('Ñ'),N('N'),TIL,True,sc=0.50,gap=30)
cedilla(ord('ç'),N('c')); cedilla(ord('Ç'),N('C'))
comp_acc(ord('ý'),N('y'),ACU,False); comp_acc(ord('Ý'),N('Y'),ACU,True); dieresis(ord('ÿ'),N('y'),False)
# ¿ ¡ : giradas 180°
for cp,ch in ((0xBF,'?'),(0xA1,'!')):
    b0=bb(N(ch)); cy=240; dx=b0[0]+b0[2]; dy=2*cy
    nm='lm.u%04X'%cp; g=Glyph(); g.numberOfContours=-1; c=GlyphComponent(); c.glyphName=N(ch); c.x=int(dx); c.y=int(dy); c.flags=0x0004|0x0002|0x0040; c.transform=[[-1,0],[0,-1]]; g.components=[c]
    glyf.glyphs[nm]=g; order.append(nm); f.setGlyphOrder(order); g.recalcBounds(glyf); hmtx.metrics[nm]=(adv(N(ch)),g.xMin); nuevos[cp]=nm
# ── cmap: se quita lo cirílico que estaba en las posiciones latinas y se añaden las letras nuevas
buenos={0xA0,0xA4,0xA5,0xA6,0xA7,0xA9,0xAB,0xAC,0xAE,0xB0,0xB1,0xB4,0xB5,0xB6,0xB7,0xBA,0xBB}
for c in list(cm):
    if 0x80<=c<=0xFF and c not in buenos: del cm[c]
    elif c in (0x152,0x153,0x160,0x161,0x178,0x192,0x2C6,0x2DC): del cm[c]
    elif 0x400<=c<=0x45F or 0x490<=c<=0x491: pass
cm.update(nuevos)
t=cmap_format_4(4); t.platformID=3; t.platEncID=1; t.language=0; t.cmap=cm; f['cmap'].tables=[t]
for tb in ['hdmx','cvt ','fpgm','prep']:
    if tb in f: del f[tb]
f['post'].formatType=3.0
f['head'].flags|=0
f.setGlyphOrder(order)
f.save(OUT); print('guardado',OUT,len(nuevos),'letras nuevas')
