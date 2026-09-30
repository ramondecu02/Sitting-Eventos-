# Web de Les Moles

La web pública del restaurante y de Les Moles Events en catalán, castellano e
inglés. Es una web estática: HTML, CSS y un poco de JavaScript, sin WordPress,
sin base de datos y sin nada que actualizar ni parchear. Se construye con Node
(sin dependencias) y se puede alojar en cualquier sitio.

El análisis de la web actual y la lista de lo que falta antes de publicar están
en **[AUDITORIA.md](AUDITORIA.md)**.

## Qué se toca para cambiar cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Teléfono, correo, dirección, horario | `src/site.config.mjs` → `contact`, `hours` |
| Menús: precio y horas de entrada | `src/site.config.mjs` → `menus` |
| Menús: nombre y descripción | `src/i18n/ca.mjs`, `es.mjs`, `en.mjs` → `menus` |
| Distinciones, cifras de los espacios | `src/site.config.mjs` → `awards`, `venue` |
| Cualquier texto de la web | `src/i18n/<idioma>.mjs` → `pages` |
| Una foto | dejarla en `src/assets/img/` con el nombre del hueco (ver abajo) |
| Motor de reservas | `src/site.config.mjs` → `bookingEmbed` (pegar el código del proveedor) |
| Dónde llega el formulario de eventos | `src/site.config.mjs` → `eventsFormEndpoint` |
| Enlace de la tienda o de las redes | `src/site.config.mjs` → `links` |
| Colores, tipografía, espaciados | `src/assets/css/site.css` (variables al principio) |

Los tres idiomas tienen que tener exactamente los mismos textos. Si se añade uno
en catalán y se olvida en inglés, `npm run build` avisa y no construye.

### Fotos

Cada hueco tiene un nombre (`pedrera`, `plat`, `sala`, `familia`, `hort`, `vi`,
`oli`, `casament`, `cerimonia`, `jardins`, `salo`, `escenari`, `empresa`,
`celebracio`). Para poner una foto, se deja en `src/assets/img/` con ese nombre
(`pedrera.jpg`, `plat.webp`…) y se vuelve a construir. Si no existe, la web pinta
un fondo de piedra con la descripción de la foto que falta. Tamaño recomendado:
2400 px de ancho para `pedrera` (la portada) y 1600 px para las demás, por debajo
de 400 KB. El encuadre se ajusta con `pos` en `photos`, dentro de `site.config.mjs`.

## Trabajar en local

Hace falta Node 18 o posterior.

```bash
cd lesmoles-web
npm run dev          # construye y abre en http://localhost:4321
```

Otras órdenes:

```bash
npm run build        # construye la web en dist/
npm run check        # revisa dist/: enlaces, anclas, SEO, hreflang, JSON-LD, redirecciones
npm install          # solo para lo siguiente (instala Playwright)
npm test             # build + check + pruebas en Chromium (móvil, menú, idiomas, formulario, 404)
npm run shots        # capturas de todas las páginas en escritorio y móvil → capturas/
npm run images       # regenera favicon, iconos y la imagen para redes (src/static/)
```

Si Playwright no encuentra su navegador, se le puede indicar uno con
`CHROMIUM_PATH=/ruta/a/chromium`.

## Publicar

Cualquier hosting de webs estáticas sirve. Los dos más cómodos leen solos los
archivos `_redirects` (las redirecciones 301 desde las direcciones de la web
actual) y `_headers` (seguridad y caché) que genera la construcción:

**Netlify** o **Cloudflare Pages**, conectando este repositorio:

- Directorio base: `lesmoles-web`
- Orden de construcción: `node build.mjs`
- Directorio publicado: `dist` (en Cloudflare, `lesmoles-web/dist`)

Para una vista previa en otra dirección antes de cambiar el dominio:
`SITE_URL=https://vista-previa.netlify.app node build.mjs` (así el canonical y el
sitemap apuntan a esa dirección).

La primera regla de `_redirects` (de `www.lesmoles.com` a `lesmoles.com`) es de
Netlify. En Cloudflare, esa redirección se hace desde el panel, con una regla de
*Redirect*.

Antes de publicar en `lesmoles.com`, repasar la lista de «Para publicarla» en
[AUDITORIA.md](AUDITORIA.md). Lo más importante: poner `draft: false` y
**sacar antes la tienda a un subdominio**, porque la web nueva ocupa el dominio entero.

## Cómo está hecha

```
build.mjs               src/ → dist/: páginas, sitemap, robots, _redirects, _headers
src/site.config.mjs     los datos (contacto, horario, menús, distinciones, fotos)
src/i18n/{ca,es,en}.mjs los textos y las direcciones de cada idioma
src/templates/
  layout.mjs            <head> (SEO, hreflang, Open Graph, JSON-LD), cabecera y pie
  pages.mjs             una función por página
  components.mjs        piezas comunes: fotos, menús, horario, mapa, cifras…
src/assets/             CSS, JS, tipografías (alojadas aquí, licencia OFL) e imágenes
src/static/             favicon, iconos, imagen para redes (se copian tal cual a la raíz)
tools/                  servidor local, revisión estática, pruebas en navegador,
                        capturas y generador de imágenes
```

Algunas decisiones:

- **Sin frameworks.** El contenido es casi fijo; HTML generado de antemano carga
  al momento, posiciona mejor y no tiene nada que mantener.
- **Tipografías en la propia web**, no en Google Fonts: evita enviar la IP de los
  visitantes a Google (RGPD) y el salto de letra al cargar.
- **El mapa de Google se carga solo si se pide**: hasta entonces, ninguna cookie de
  terceros. Por eso la web no necesita banner de cookies.
- **La web se puede usar sin JavaScript.** Solo añade la cabecera que cambia al
  bajar, el menú del móvil, las entradas suaves, el mapa y el envío del formulario.
- **`draft: true`** mientras falten fotos o datos: marca los huecos de foto y pide
  a los buscadores que no la indexen.
