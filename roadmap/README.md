# Checklist del roadmap en PDF

`ROADMAP_checklist.pdf` (raíz del repositorio) es la versión imprimible del roadmap: lo ya hecho, las decisiones previas, el calendario, las cuatro fases con su «Qué se hace» y su «Hecho cuando…», la calidad continua, lo que depende del restaurante y los opcionales.

## Regenerarla en cada entrega

```bash
node roadmap/build.mjs
```

- La **versión** de la cabecera sale de `cloudflare/public/sw.js` (`const V = "01.NN"`) y el mes de la fecha del día, así que no hay que tocarlos a mano.
- El **contenido** está en `roadmap/data.mjs`: cada casilla es `[texto, hecho]`. Una tarjeta cuenta como hecha cuando todas sus casillas lo están, y el «N de M casillas hechas» de cada fase se calcula solo. En cada entrega: añadir la línea nueva a `hecho` (con su versión al final, `· v01.NN`), actualizar la fila «Después» de `calendario` y las casillas que cambien.
- Genera también `roadmap/checklist.html`, que es lo que Chromium convierte en PDF (A4, letra Instrument Sans / Instrument Serif incrustada desde `roadmap/fonts/`, licencia SIL OFL 1.1).
- Necesita `playwright-core` (o `playwright`) y un Chromium. Si no los encuentra: `npm i --no-save playwright-core`, y `CHROME_PATH=/ruta/a/chrome` o `PW_DIR=/carpeta/con/node_modules` si hace falta.
