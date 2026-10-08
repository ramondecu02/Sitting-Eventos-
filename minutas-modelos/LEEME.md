# Modelos nuevos de minuta (pendientes de aprobación)

Fuentes de los 41 modelos creativos (M01–M41) que se enseñan en el Artifact «Modelos de minuta».
**No están en la app**: solo pasarán a `cloudflare/public/index.html` los que apruebe el cliente.

- `ext_arte.js`, `ext_arte2.js`: ilustraciones y texturas dibujadas con código (se registran en `ARTE`, la tabla que usa `dibujaForma` de `lienzo.js`).
- `modelos.js`, `modelos2.js`: las plantillas `tpl({...})` (M01–M41) y las tipografías extra.
- `models.json`: ficha de cada modelo (nombre, categorías, paleta, etiquetas) para la galería.
- `galeria.html`: la página de la galería (los datos van en `/*@@DATA@@*/`).

Para probarlos: en `lienzo.js` se sustituye el marcador `/*@@ARTE@@*/` por el contenido de `ext_arte.js` + `ext_arte2.js` + `modelos.js` + `modelos2.js`.
