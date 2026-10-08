# Modelos de minuta (M01–M60)

Fuentes de los modelos creativos del diseñador de minutas. Ya están integrados en `cloudflare/public/index.html`
(versión 01.49); esta carpeta guarda el código de origen por si hay que tocarlos.

- `ext_arte.js`, `ext_arte2.js`: texturas e ilustraciones dibujadas con código (acuarela, mármol, azulejo, peonías, almendros, flamencos…).
- `ext_arte3*.js`: serie «tinta y lavado»: trazo de pluma con presión variable, acuarela desplazada del contorno, rayado y grano
  (brindis, bodegón, masía, tapas, pulpo, conchas, cigüeña, animales, cordero, paloma, bici, tarta, doce uvas, ramo, Sant Jordi, herbario).
- `modelos.js`, `modelos2.js`, `modelos3.js`: las plantillas `tpl({...})` M01–M60 y las tipografías extra.
- `models.json`: ficha de cada modelo (nombre, eventos, estilos, paleta). `galeria.html`: página de la galería (datos en `/*@@DATA@@*/`).

En `lienzo.js` el marcador `/*@@ARTE@@*/` se sustituye por el contenido de estos archivos, en este orden:
`ext_arte, ext_arte2, ext_arte3, ext_arte3b…3f, modelos, modelos2, modelos3`.
