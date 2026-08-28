#!/usr/bin/env python3
"""JSON del inventario -> el bloque INVENTARIO_DATA de sitting.html.

    python3 inventario_extraer.py "INVENTARIO LES MOLES.xlsx" > inventario.json
    python3 inventario_gen_js.py inventario.json > INVENTARIO_DATA.js

Después se sustituye a mano el bloque `var INVENTARIO_DATA = {...};` dentro de
sitting.html por el nuevo. Se hace así, y no automáticamente, para poder mirar
antes el diff: un Excel con una hoja renombrada o una categoría movida cambia
lo que ve el equipo, y eso conviene verlo.
"""
import json, re, unicodedata, sys

ENTRADA = sys.argv[1] if len(sys.argv) > 1 else "inventario.json"
d = json.load(open(ENTRADA, encoding="utf-8"))

def slug(s):
    if s is None: return ""
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return s[:44]

def js(v):
    if v is None: return "null"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return repr(v)
    return json.dumps(str(v), ensure_ascii=False)

vistos = {}
out = ['var INVENTARIO_DATA = {',
       '  fuente:"INVENTARIO LES MOLES.xlsx",',
       '  hojas:[']
for h in d["hojas"]:
    out.append('  { hoja:%s, titulo:%s, fecha:%s, categorias:[' % (js(h["hoja"].strip()), js(h["titulo"]), js(h["fecha"])))
    for c in h["categorias"]:
        cab = ""
        if c.get("columnas"):
            cab = ", columnas:[%s]" % ",".join(js(x) for x in c["columnas"])
        out.append('    { nombre:%s%s, items:[' % (js(c["nombre"]), cab))
        for it in c["items"]:
            base = "%s.%s.%s" % (slug(h["hoja"]), slug(c["nombre"]) or "x", slug(it["nombre"]))
            if it.get("medidas"): base += "." + slug(it["medidas"])
            vistos[base] = vistos.get(base, 0) + 1
            iid = base if vistos[base] == 1 else "%s.%d" % (base, vistos[base])
            campos = ['id:%s' % js(iid), 'nombre:%s' % js(it["nombre"])]
            for k in ("codigo", "tipo", "amperios"):
                if it.get(k) is not None: campos.append("%s:%s" % (k, js(it[k])))
            campos.append('medidas:%s' % js(it.get("medidas")))
            campos.append('cantidad:%s' % js(it.get("cantidad")))
            if it.get("nota"): campos.append('nota:%s' % js(it["nota"]))
            if it.get("mismoNombre"): campos.append('mismoNombre:true')
            out.append('      {%s},' % ", ".join(campos))
        out[-1] = out[-1].rstrip(",")
        out.append('    ]},')
    out[-1] = out[-1].rstrip(",")
    out.append('  ]},')
out[-1] = out[-1].rstrip(",")
out.append('  ]')
out.append('};')
print("\n".join(out))
