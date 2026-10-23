# Letra de títulos (Optima) — cómo se ha preparado

El archivo `optima.ttf` que facilitó el restaurante es la **edición cirílica** («AG Baltia»): las posiciones de las letras acentuadas latinas
(á é í ó ú ü ñ ç ¿ ¡ À-ÿ…) llevan letras cirílicas, así que con el archivo tal cual «Previsión» salía «Previsiyn».

`optima-latina.py` lo arregla: quita lo cirílico de esas posiciones y **construye las letras acentuadas** con las piezas de la propia letra
(la letra base + el acento ´ ` ^ ~, los puntos de la diéresis, la cedilla y ¿ ¡ girados 180°), y deja el resultado en WOFF2.

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools brotli
.venv/bin/python tools/fuentes/optima-latina.py optima_fix.ttf     # y después, guardarlo como WOFF2 en cloudflare/public/fonts/optima.woff2
```

Es una solución provisional: lo ideal es una Optima completa con licencia web (el archivo original marca «uso restringido» en su cabecera).
Cuando haya una, basta con sustituir `cloudflare/public/fonts/optima.woff2` (y, si cambia el nombre, el «@font-face» de `index.html`).
