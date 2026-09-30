#!/usr/bin/env node
/*
 * Revisión estática de dist/ (sin navegador). Falla si encuentra:
 *   - enlaces internos o anclas (#...) que no llevan a ningún sitio
 *   - páginas sin <title>, sin descripción, sin canonical o con más de un <h1>
 *   - hreflang incompletos o que no se corresponden entre idiomas
 *   - imágenes sin alt, ids repetidos, JSON-LD que no se puede leer
 *   - restos de plantilla ("undefined", "[object Object]", "NaN")
 * Uso: npm run build && npm run check
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cfg from '../src/site.config.mjs';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const BASE = (process.env.SITE_URL || cfg.baseUrl).replace(/\/$/, '');
if (!fs.existsSync(DIST)) {
  console.error('No hay dist/. Lanzar antes: npm run build');
  process.exit(1);
}

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
}
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const rel = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/');
const urlToFile = (u) => {
  const p = u.split(/[?#]/)[0];
  const f = path.join(DIST, decodeURIComponent(p));
  if (p.endsWith('/')) return path.join(f, 'index.html');
  return f;
};

const pages = new Map();
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  pages.set(f, { html, ids: new Set(ids), idList: ids });
}

for (const [f, { html, ids, idList }] of pages) {
  const name = rel(f);
  const is404 = name.endsWith('404.html');

  if (!/<html lang="(ca|es|en)"/.test(html)) err(name, 'falta <html lang>');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || '';
  if (!title.trim()) err(name, 'sin <title>');
  else if (title.length > 70) warn(name, `título largo (${title.length} caracteres): Google lo cortará`);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  if (!desc.trim()) err(name, 'sin meta description');
  else if (desc.length > 160) warn(name, `descripción larga (${desc.length} caracteres)`);

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(name, `${h1} <h1> (debe haber exactamente uno)`);

  const dup = idList.filter((id, i) => idList.indexOf(id) !== i);
  if (dup.length) err(name, `ids repetidos: ${[...new Set(dup)].join(', ')}`);

  for (const bad of ['undefined', '[object Object]', 'NaN']) {
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
    if (text.includes(bad)) err(name, `aparece "${bad}" en el HTML`);
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) err(name, `imagen sin alt: ${m[0].slice(0, 80)}`);
  }

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      err(name, `JSON-LD no válido: ${e.message}`);
    }
  }

  // Canonical y hreflang
  if (!is404) {
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (!canonical) err(name, 'sin canonical');
    else {
      const expected = BASE + name.replace(/index\.html$/, '');
      if (canonical !== expected) err(name, `canonical ${canonical} ≠ ${expected}`);
    }
    const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    const langs = alts.map((a) => a[1]);
    for (const l of [...cfg.langs, 'x-default']) if (!langs.includes(l)) err(name, `falta hreflang ${l}`);
    for (const [, l, href] of alts) {
      if (!href.startsWith(BASE)) {
        err(name, `hreflang ${l} fuera del dominio: ${href}`);
        continue;
      }
      const target = urlToFile(href.slice(BASE.length));
      const other = pages.get(target);
      if (!other) err(name, `hreflang ${l} apunta a una página que no existe: ${href}`);
      else if (!other.html.includes(`href="${canonical}"`)) err(name, `hreflang ${l} no es recíproco (${href} no enlaza de vuelta)`);
    }
  }

  // Enlaces internos y anclas
  for (const m of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    const url = m[2];
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    if (url.startsWith('#')) {
      const id = url.slice(1);
      if (id && !ids.has(id)) err(name, `ancla #${id} no existe en la página`);
      continue;
    }
    if (!url.startsWith('/')) {
      err(name, `enlace relativo (usar rutas absolutas): ${url}`);
      continue;
    }
    const target = urlToFile(url);
    if (!fs.existsSync(target)) {
      err(name, `enlace roto: ${url}`);
      continue;
    }
    const hash = url.split('#')[1];
    if (hash && target.endsWith('.html')) {
      const other = pages.get(target);
      if (other && !other.ids.has(hash)) err(name, `ancla rota: ${url}`);
    }
  }
}

// Recursos que carga el CSS
for (const f of files.filter((x) => x.endsWith('.css'))) {
  const css = fs.readFileSync(f, 'utf8');
  for (const m of css.matchAll(/url\((?!["']?data:)["']?([^"')]+)["']?\)/g)) {
    if (/^(%23|#)/.test(m[1])) continue; // referencia interna de un SVG en línea
    const target = path.resolve(path.dirname(f), m[1]);
    if (!fs.existsSync(target)) err(rel(f), `recurso roto en CSS: ${m[1]}`);
  }
}

// El sitemap solo lista páginas que existen
const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  if (!fs.existsSync(urlToFile(m[1].slice(BASE.length)))) err('/sitemap.xml', `URL sin página: ${m[1]}`);
}

// Las redirecciones llevan a páginas que existen
const redirects = fs.readFileSync(path.join(DIST, '_redirects'), 'utf8');
for (const line of redirects.split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  const [, to] = line.trim().split(/\s+/);
  if (to.startsWith('/')) {
    const target = urlToFile(to);
    if (!fs.existsSync(target)) err('/_redirects', `destino inexistente: ${to}`);
    const hash = to.split('#')[1];
    if (hash && pages.get(target) && !pages.get(target).ids.has(hash)) err('/_redirects', `ancla inexistente: ${to}`);
  }
}

for (const w of warnings) console.warn('⚠', w);
for (const e of errors) console.error('✗', e);
if (errors.length) {
  console.error(`\n${errors.length} errores en ${htmlFiles.length} páginas.`);
  process.exit(1);
}
console.log(`✓ ${htmlFiles.length} páginas revisadas: enlaces, anclas, SEO, idiomas y datos estructurados en orden.`);
