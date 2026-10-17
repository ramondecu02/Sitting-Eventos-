import json,os,re,sys
D=os.path.dirname(os.path.abspath(__file__))+'/..'
def load(n):
    p=D+'/'+n
    return json.load(open(p,encoding='utf8')) if os.path.exists(p) else None
vac=load('trans_vac.json'); norm=load('trans_norm.json'); ext=load('trans_ext.json')
HAND={'plan','list','card'}  # a mano: editores e interacciones propias
def esc(s): return s.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
def pack(d):
    out=[]
    for k,v in d['screens'].items():
        if k in HAND or not v: continue
        h=dict(v['head']); html=re.sub(r'>\s+<','><',v['html']); html=re.sub(r'\s{2,}',' ',html).strip()
        vv=v.get('v') or {}
        vs=','.join('%s:`%s`'%(json.dumps(kk),esc(re.sub(r'\s{2,}',' ',re.sub(r'>\s+<','><',x)).strip())) for kk,x in vv.items())
        out.append('%s:{h:%s,b:`%s`%s}'%(json.dumps(k),json.dumps(h,ensure_ascii=False),esc(html),(',v:{'+vs+'}') if vs else ''))
    return '{'+',\n'.join(out)+'}'
js='/* generado por gen_real.py · NO editar a mano */\nconst RS={vac:%s,norm:%s,ext:%s};\n'%(pack(vac) if vac else 'null',pack(norm) if norm else 'null',pack(ext) if ext else 'null')
open(D+'/src/d9_data.js','w',encoding='utf8').write(js)
css=''.join((d['css']+'\n') for d in (vac,norm,ext) if d)
open(D+'/src/a5_lay.html','w',encoding='utf8').write('<style>\n'+css+'</style>\n')
print('d9_data.js',len(js),'bytes · a5_lay.html',len(css),'bytes')
