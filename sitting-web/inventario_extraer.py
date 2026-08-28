#!/usr/bin/env python3
"""Convierte INVENTARIO LES MOLES.xlsx en el INVENTARIO_DATA de sitting.html.

No reorganiza nada: respeta las hojas, el orden, los nombres de las categorías
y las líneas tal y como están. Las cabeceras de categoría se reconocen por su
formato (negrita + fondo de color), que es la única marca de jerarquía que
tiene el archivo.
"""
import json, sys, openpyxl

if len(sys.argv) < 2:
    print("uso: python3 inventario_extraer.py 'INVENTARIO LES MOLES.xlsx' > inventario.json",
          file=sys.stderr)
    sys.exit(1)
F = sys.argv[1]

# columna de la cantidad y de las medidas por hoja; None = esa hoja no la tiene.
# DECORACIÓN cambia a mitad de hoja, así que lleva una excepción por categoría.
COLS = {
    "MESAS ":              {"medidas": 3, "cantidad": 4, "nota": 5},
    "COCINA CATERING":     {"medidas": 4, "cantidad": 5, "nota": None},
    "VASOS Y CUBERTERIA":  {"medidas": None, "cantidad": 4, "nota": None},
    "DECORACIÓN ":         {"medidas": None, "cantidad": 3, "nota": None},
}
DECO_SITTINGS = {"medidas": None, "cantidad": 4, "nota": None}   # la categoría SITTINGS

def txt(ws, r, c):
    if not c: return None
    v = ws.cell(row=r, column=c).value
    if v is None: return None
    s = str(v).strip()
    return s or None

def num(s):
    """'18' -> 18 ; '++' -> '++' ; None -> None. Nunca inventa un número."""
    if s is None: return None
    t = s.replace(",", ".")
    try:
        f = float(t)
        return int(f) if f == int(f) else f
    except ValueError:
        return s

def es_cabecera(ws, r):
    c = ws.cell(row=r, column=1)
    return bool(c.fill and c.fill.fill_type == "solid") and bool(c.font.bold)

def fila_vacia(ws, r):
    return not any(ws.cell(row=r, column=c).value is not None
                   for c in range(1, ws.max_column + 1))

wb = openpyxl.load_workbook(F)
hojas = []

for ws in wb.worksheets:
    if ws.title == "Hoja1":
        continue
    titulo = txt(ws, 1, 1)
    fecha = None
    cats = []

    if ws.title == "SONIDO Y LUZ":
        # dos bloques con forma distinta, tal como está en el Excel
        cables = {"nombre": "CABLE DE LUZ", "columnas":
                  ["TIPO DE CABLE", "AMPERIOS", "MEDIDA", "COMENTARIOS"], "items": []}
        for r in range(7, 12):
            n = txt(ws, r, 1)
            if not n: continue
            cables["items"].append({
                "nombre": n, "codigo": txt(ws, r, 2), "tipo": txt(ws, r, 3),
                "amperios": num(txt(ws, r, 4)), "medidas": txt(ws, r, 5),
                "cantidad": 1, "nota": txt(ws, r, 6)})
        sueltos = {"nombre": None, "items": []}     # en el Excel no llevan cabecera
        for r in range(12, ws.max_row + 1):
            n = txt(ws, r, 1)
            if not n: continue
            sueltos["items"].append({"nombre": n, "medidas": None,
                                     "cantidad": num(txt(ws, r, 2)), "nota": None})
        cats = [cables, sueltos]
        hojas.append({"hoja": ws.title, "titulo": titulo, "fecha": None, "categorias": cats})
        continue

    cur = None
    for r in range(5, ws.max_row + 1):
        if fila_vacia(ws, r): continue
        a = txt(ws, r, 1)
        cfg = COLS[ws.title]
        if ws.title == "DECORACIÓN " and cur and cur["nombre"] == "SITTINGS":
            cfg = DECO_SITTINGS

        if a and es_cabecera(ws, r):
            cur = {"nombre": a, "items": []}
            cats.append(cur)
            continue
        if a == "REALIZADO EN FECHA":
            v = ws.cell(row=r, column=3).value
            fecha = v.strftime("%d/%m/%Y") if hasattr(v, "strftime") else (str(v) if v else None)
            continue
        if cur is None:
            cur = {"nombre": None, "items": []}
            cats.append(cur)

        med, cant, nota = txt(ws, r, cfg["medidas"]), txt(ws, r, cfg["cantidad"]), txt(ws, r, cfg["nota"])
        if a is None:
            # fila que continúa el nombre fusionado de arriba (TRONAS BEBÉ)
            if cur["items"] and (med or cant):
                cur["items"].append({"nombre": cur["items"][-1]["nombre"], "mismoNombre": True,
                                     "medidas": med, "cantidad": num(cant), "nota": nota})
            continue
        cur["items"].append({"nombre": a, "medidas": med, "cantidad": num(cant), "nota": nota})

    hojas.append({"hoja": ws.title, "titulo": titulo, "fecha": fecha, "categorias": cats})

data = {"fuente": "INVENTARIO LES MOLES.xlsx", "hojas": hojas}
print(json.dumps(data, ensure_ascii=False, indent=1))
