# Les Moles — demo de la Home

Primera fase de la nueva web: la Home completa, que fija el estándar visual de
todo el proyecto. La dirección artística, la estructura, el movimiento y la
arquitectura están en **[DESIGN.md](DESIGN.md)**.

- **Tecnología**: Vite, GSAP 3.15 (ScrollTrigger y SplitText) y Lenis. Sin framework.
- **Peso**: 60 KB de JavaScript y 10 KB de CSS (gzip), y 151 KB de tipografías (tres
  archivos variables recortados).
- **Idioma de la demo**: castellano. El catalán y el inglés llegan en la fase 2.

## Verla en local

```bash
cd lesmoles-demo
npm install
npm run dev        # http://localhost:5173
```

## Publicarla en Cloudflare Pages

### Opción A: conectar el repositorio (recomendada, unos 5 minutos)

Cada `git push` publica una versión nueva y cada rama tiene su propia URL de vista previa.

1. Entra en el panel de Cloudflare → **Workers & Pages** → **Create application** →
   pestaña **Pages** → **Import an existing Git repository**.
2. Autoriza GitHub y elige el repositorio `ramondecu02/Sitting-Eventos-`.
3. Configuración de la construcción:

   | Campo | Valor |
   |---|---|
   | Production branch | `main` (o la rama de la demo, `claude/bold-bardeen-6nvvc5`) |
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory (advanced) | `lesmoles-demo` |
   | Variable de entorno | `NODE_VERSION` = `20` |

4. **Save and Deploy**. La demo queda en `https://lesmoles-demo.pages.dev`, o en el
   nombre de proyecto que elijas.

### Opción B: desde la terminal, con Wrangler

```bash
cd lesmoles-demo
npm install
npx wrangler login                       # abre el navegador para autorizar
npm run build
npx wrangler pages deploy dist --project-name=lesmoles-demo
```

La primera vez, Wrangler pregunta si crea el proyecto. Al acabar, imprime la URL.

### Opción C: GitHub Actions

`.github/workflows/lesmoles-demo.yml` construye la demo en cada push y, si existen
los secretos `CLOUDFLARE_API_TOKEN` (permiso *Cloudflare Pages: Edit*) y
`CLOUDFLARE_ACCOUNT_ID` en *Settings → Secrets and variables → Actions*, además la
despliega y deja la URL en el resumen del job.

## Poner las fotos reales

Cada hueco de foto tiene un nombre (por ejemplo, `hero-cantera` o `cocina-jeroni`),
que aparece en `index.html` como `<x-photo slot="…">`. Para usar la foto real, se deja
el archivo en `src/photos/<nombre>.jpg` (también `.webp`, `.avif` o `.png`) y se vuelve
a construir. La ficha «Fotografía pendiente» desaparece sola.

Tamaños mínimos: 2400 px de ancho para las fotos a pantalla completa y 1600 px para el
resto. Antes de subirlas conviene comprimirlas, por ejemplo con
`npx @squoosh/cli --avif '{quality:55}' --resize '{width:2400}'`.

## Revisar la demo automáticamente

```bash
npm run build
npm run shots              # recorre la Home con scroll real → capturas/
node tools/interact.mjs    # menú, Esc y foco, cortina, acordeón y movimiento reducido
node tools/perf.mjs antes  # fluidez: fotogramas lentos y pintado por capítulo → capturas/perf-antes.json
```

### Verla como artefacto de Claude

El visor de artefactos bloquea, sin mostrar ningún error, el JS, el CSS y las fuentes
enlazados como archivos aparte: solo se vería el HTML sin estilos. `npm run artifact`
construye la demo y la empaqueta en un único HTML (CSS, JS, fuentes y fotos dentro) en
`capturas/artifact/index.html`, listo para publicar.

Para comparar la fluidez antes y después de un cambio, se ejecuta `perf.mjs` con una
etiqueta distinta en cada versión (con `W=390 H=844` mide el tamaño de móvil).

Si el Chromium de Playwright no está instalado: `npx playwright install chromium`, o
indicar uno ya instalado con `CHROMIUM_PATH=…`.

## Pendiente de confirmar

- **Precios**: el del menú Tradición (49,90 € / 56,90 €) sale de TheFork. Hay que confirmarlo.
- **Textos de los menús**: son una propuesta de redacción.
- **Fotos**: 22 huecos para la sesión fotográfica (lista en DESIGN.md → «Lista de fotos»).
- **Motor de reservas**: el formulario prepara hoy un correo, hasta que se conecte el
  proveedor definitivo.
