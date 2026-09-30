import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS = path.join(ROOT, 'src/photos');
const EXTS = ['avif', 'webp', 'jpg', 'jpeg', 'png'];

/*
 * <x-photo slot="hero" tone="night" ratio="16/9" alt="…"></x-photo>
 *
 * Si existe src/photos/<slot>.(avif|webp|jpg|png), se pinta la foto real.
 * Si no, un hueco con el tono del ambiente y una ficha que dice qué foto va,
 * su proporción y su tamaño mínimo. Se resuelve al construir: cero JavaScript
 * y sin saltos de maquetación.
 */
function photos() {
  const attrsOf = (s) => Object.fromEntries([...s.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2] ?? '']));
  const render = (a) => {
    const fill = a.ratio === 'fill';
    const style = fill ? '' : ` style="--ratio:${a.ratio}"`;
    const cls = ['media', fill && 'media--fill', a.class].filter(Boolean).join(' ');
    const data = [a.reveal !== undefined && 'data-reveal-media', a.speed && `data-speed="${a.speed}"`].filter(Boolean).join(' ');
    const file = EXTS.map((e) => `${a.slot}.${e}`).find((f) => fs.existsSync(path.join(PHOTOS, f)));
    if (file) {
      const load = a.eager !== undefined ? 'fetchpriority="high"' : 'loading="lazy"';
      return `<span class="${cls} media--photo"${style} ${data}><span class="media__inner"><img src="/src/photos/${file}" alt="${a.alt}" ${load} decoding="async"${a.pos ? ` style="object-position:${a.pos}"` : ''}></span></span>`;
    }
    const spec = fill ? 'Pantalla completa · ≥ 2400 px' : `${a.ratio.replace('/', ':')} · ≥ ${a.min || 1600} px`;
    return `<span class="${cls} ph ph--${a.tone || 'stone'}"${style} ${data} role="img" aria-label="Fotografía pendiente: ${a.alt}"><span class="media__inner"><span class="ph__art"></span></span><span class="ph__brief" aria-hidden="true"><span class="ph__tag">Fotografía pendiente${a.n ? ` · ${a.n}` : ''}</span><span class="ph__desc">${a.alt}</span><span class="ph__spec">${spec}</span></span></span>`;
  };
  return {
    name: 'lesmoles-photos',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace(/<x-photo\b([^>]*)><\/x-photo>/g, (_, attrs) => render(attrsOf(attrs))),
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [photos()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    reportCompressedSize: true,
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
