#!/usr/bin/env node
/*
 * Empaqueta la demo en un solo HTML para verla como artefacto de Claude.
 *
 * El visor de artefactos solo admite scripts de unos pocos CDN y bloquea, sin
 * mostrar ningún error, el JS, el CSS y las fuentes enlazados como archivos.
 * Aquí todo va dentro de la página: el CSS en <style>, el JS en
 * <script type="module"> y las fuentes y las fotos como data: URIs.
 * Además quita el esqueleto (doctype, html, head, body): lo pone el visor.
 *
 * Uso: npm run build && node tools/artifact.mjs [salida.html]
 * Por defecto escribe capturas/artifact/index.html.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'capturas', 'artifact', 'index.html'));
const TITLE = 'Demo Les Moles';

const TYPES = { woff2: 'font/woff2', woff: 'font/woff', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml' };
const dataUri = (file) => {
  const type = TYPES[path.extname(file).slice(1).toLowerCase()];
  if (!type) throw new Error(`Tipo de archivo sin data: URI: ${file}`);
  return `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
};
const fromDist = (ref) => path.join(DIST, ref.replace(/^\.\//, ''));
const once = (html, re, fn, what) => {
  if (!re.test(html)) throw new Error(`No se encuentra ${what} en dist/index.html`);
  return html.replace(re, fn);
};

let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

// CSS dentro, con sus fuentes como data: URIs
html = once(html, /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/, (_, href) => {
  const file = fromDist(href);
  const css = fs.readFileSync(file, 'utf8').replace(/url\((['"]?)(\.\/[^'")]+)\1\)/g, (m, q, ref) => `url(${dataUri(path.join(path.dirname(file), ref))})`);
  if (css.includes('</style')) throw new Error('El CSS contiene </style');
  return `<style>${css}</style>`;
}, 'la hoja de estilos');

// JS dentro (un módulo en línea también espera a que se lea todo el HTML)
html = once(html, /<script type="module"[^>]*src="([^"]+)"><\/script>/, (_, src) => {
  const js = fs.readFileSync(fromDist(src), 'utf8');
  if (/<\/script|<!--/i.test(js)) throw new Error('El JS contiene una secuencia que cerraría el <script>');
  return `<script type="module">${js}</script>`;
}, 'el script');

// Fotos publicadas como archivo → data: URIs
html = html.replace(/src="(\.\/assets\/[^"]+)"/g, (_, src) => `src="${dataUri(fromDist(src))}"`);

// Lo que en el visor no sirve: precargas (ya van en el CSS), imagen para redes y favicon
html = html
  .replace(/\s*<link rel="preload"[^>]*>/g, '')
  .replace(/\s*<meta property="og:[^>]*>/g, '')
  .replace(/\s*<link rel="icon"[^>]*>/g, '');

// Sin esqueleto: el visor envuelve la página con el suyo (charset, viewport y título propios)
html = html
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<html[^>]*>\s*/i, '')
  .replace(/<\/html>\s*$/i, '')
  .replace(/<\/?head>\s*/gi, '')
  .replace(/<body[^>]*>\s*/i, '')
  .replace(/<\/body>\s*/i, '')
  .replace(/\s*<meta charset[^>]*>/i, '')
  .replace(/\s*<meta name="viewport"[^>]*>/i, '')
  .replace(/\s*<title>[^<]*<\/title>/i, '');
html = `<title>${TITLE}</title>\n${html.trim()}\n`;

const leftovers = html.match(/(?:src|href)="\.\/[^"]+"/g);
if (leftovers) throw new Error(`Quedan archivos enlazados: ${leftovers.join(', ')}`);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`${path.relative(process.cwd(), OUT)} · ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB, un solo archivo`);
