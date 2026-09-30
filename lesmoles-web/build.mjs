#!/usr/bin/env node
/*
 * Construye la web estática en dist/ a partir de src/.
 *
 *   node build.mjs                 → dist/ con la URL de site.config.mjs
 *   SITE_URL=https://x.netlify.app node build.mjs   → para una vista previa
 *
 * Sin dependencias: solo Node 18+.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import baseCfg from './src/site.config.mjs';
import ca from './src/i18n/ca.mjs';
import es from './src/i18n/es.mjs';
import en from './src/i18n/en.mjs';
import { layout } from './src/templates/layout.mjs';
import * as pages from './src/templates/pages.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'dist');

const cfg = { ...baseCfg, baseUrl: (process.env.SITE_URL || baseCfg.baseUrl).replace(/\/$/, '') };
const all = { ca, es, en };

const PAGES = [
  { key: 'home', render: pages.home, hero: 'dark', priority: '1.0' },
  { key: 'restaurant', render: pages.restaurant, hero: 'dark', priority: '0.9' },
  { key: 'events', render: pages.events, hero: 'dark', priority: '0.9' },
  { key: 'reserva', render: pages.reserva, hero: 'dark', priority: '0.8' },
  { key: 'casa', render: pages.casa, hero: 'dark', priority: '0.7' },
  { key: 'legal', render: pages.legal, hero: 'none', priority: '0.2' },
];

/* ---------- Comprobación: los tres idiomas tienen los mismos textos ---------- */
function keysOf(obj, prefix = '') {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => keysOf(v, `${prefix}[${i}]`));
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}
const refKeys = new Set(keysOf(all[cfg.defaultLang]));
let missing = 0;
for (const l of cfg.langs) {
  const ks = new Set(keysOf(all[l]));
  for (const k of refKeys) if (!ks.has(k)) (missing++, console.error(`✗ [${l}] falta el texto ${k}`));
  for (const k of ks) if (!refKeys.has(k)) (missing++, console.error(`✗ [${l}] sobra el texto ${k} (no está en ${cfg.defaultLang})`));
}
if (missing) {
  console.error(`\n${missing} textos descuadrados entre idiomas. No se construye.`);
  process.exit(1);
}

/* ---------- Utilidades ---------- */
function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}
function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
const hashOf = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 10);
const routeFile = (route) => (route.endsWith('/') ? `${route}index.html` : route).replace(/^\//, '');

/* ---------- Construcción ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir(path.join(SRC, 'assets'), path.join(OUT, 'assets'));
copyDir(path.join(SRC, 'static'), OUT);

const assets = {
  css: `/assets/css/site.css?v=${hashOf(path.join(SRC, 'assets/css/site.css'))}`,
  js: `/assets/js/site.js?v=${hashOf(path.join(SRC, 'assets/js/site.js'))}`,
};

let count = 0;
for (const lang of cfg.langs) {
  const t = all[lang];
  for (const pg of PAGES) {
    const ctx = { t, cfg, all, pageKey: pg.key, page: t.pages[pg.key], heroMode: pg.hero, assets };
    write(routeFile(t.routes[pg.key]), layout(ctx, pg.render(ctx)));
    count++;
  }
  // 404 propio de cada idioma
  const ctx = { t, cfg, all, pageKey: null, page: t.pages.notFound, heroMode: 'none', assets };
  write(lang === cfg.defaultLang ? '404.html' : `${lang}/404.html`, layout(ctx, pages.notFound(ctx)));
  count++;
}

/* ---------- sitemap.xml ---------- */
const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const pg of PAGES) {
  for (const lang of cfg.langs) {
    const alts = cfg.langs
      .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${cfg.baseUrl}${all[l].routes[pg.key]}"/>`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${cfg.baseUrl}${all[cfg.defaultLang].routes[pg.key]}"/>`)
      .join('\n');
    urls.push(`  <url>
    <loc>${cfg.baseUrl}${all[lang].routes[pg.key]}</loc>
    <lastmod>${today}</lastmod>
    <priority>${pg.priority}</priority>
${alts}
  </url>`);
  }
}
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
);

/* ---------- robots.txt ---------- */
write(
  'robots.txt',
  cfg.draft
    ? '# Borrador: que no se indexe todavía (ver draft en site.config.mjs)\nUser-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${cfg.baseUrl}/sitemap.xml\n`
);

/* ---------- site.webmanifest ---------- */
write(
  'site.webmanifest',
  JSON.stringify(
    {
      name: 'Les Moles',
      short_name: 'Les Moles',
      start_url: '/',
      display: 'browser',
      background_color: '#f8f5ef',
      theme_color: '#16130f',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2
  )
);

/* ---------- _redirects (Netlify / Cloudflare Pages) ----------
   Las direcciones de la web actual que Google tiene indexadas, a su sitio
   nuevo, con 301 para no perder posicionamiento. */
const R = (l, k, anchor) => `${all[l].routes[k]}${anchor ? `#${all[l].anchors[anchor]}` : ''}`;
const redirects = [
  ['# Dominio único, sin www', ''],
  ['https://www.lesmoles.com/*', 'https://lesmoles.com/:splat', '301!'],
  ['', ''],
  ['# Web antigua (ASP)', ''],
  ['/wine.asp', R('ca', 'restaurant', 'celler')],
  ['/index.asp', R('ca', 'home')],
  ['/default.asp', R('ca', 'home')],
  ['', ''],
  ['# Reserva y contacto', ''],
  ['/contacte/', R('ca', 'reserva')],
  ['/es/contacte/', R('es', 'reserva')],
  ['/en/contacte/', R('en', 'reserva')],
  ['/restaurant/reserva/', R('ca', 'reserva')],
  ['/es/restaurant-2/reserva/', R('es', 'reserva')],
  ['/en/restaurant/reserva/', R('en', 'reserva')],
  ['', ''],
  ['# Restaurant', ''],
  ['/restaurant/el-celler/', R('ca', 'restaurant', 'celler')],
  ['/es/restaurant-2/el-celler/', R('es', 'restaurant', 'celler')],
  ['/en/restaurant/el-celler/', R('en', 'restaurant', 'celler')],
  ['/restaurant/lespai/', R('ca', 'casa')],
  ['/es/restaurant-2/lespai/', R('es', 'casa')],
  ['/en/restaurant/lespai/', R('en', 'casa')],
  ['/restaurant/menus/*', R('ca', 'restaurant', 'menus')],
  ['/es/restaurant-2/menus/*', R('es', 'restaurant', 'menus')],
  ['/en/restaurant/menus/*', R('en', 'restaurant', 'menus')],
  ['/es/restaurant-2/*', R('es', 'restaurant')],
  ['/es/restaurant/*', R('es', 'restaurant')],
  ['', ''],
  ['# Events', ''],
  ...[
    ['casaments', 'casaments'],
    ['celebracions', 'celebracions'],
    ['empreses', 'empreses'],
    ['espais', 'espais'],
  ].flatMap(([old, anchor]) => [
    [`/events/${old}/`, R('ca', 'events', anchor)],
    [`/es/events/${old}/`, R('es', 'events', anchor)],
    [`/en/events/${old}/`, R('en', 'events', anchor)],
  ]),
  ['/es/events/*', R('es', 'events')],
  ['', ''],
  ['# Noticias (la web nueva no tiene)', ''],
  ['/noticies/*', R('ca', 'home')],
  ['/es/noticies/*', R('es', 'home')],
  ['/en/noticies/*', R('en', 'home')],
];

// La tienda: si vive en otro dominio (p. ej. botiga.lesmoles.com), se
// redirigen allí las direcciones antiguas de productos.
const shop = new URL(cfg.links.shop);
const site = new URL(cfg.baseUrl);
if (shop.host !== site.host && shop.host !== `www.${site.host}`) {
  redirects.push(
    ['', ''],
    ['# Tienda (WooCommerce) → su dominio', ''],
    ['/tenda/*', cfg.links.shop],
    ['/es/tienda/*', cfg.links.shop],
    ['/en/tienda/*', cfg.links.shop],
    ['/tienda/*', cfg.links.shop],
    ['/producto/*', `${shop.origin}/producto/:splat`],
    ['/es/producto/*', `${shop.origin}/es/producto/:splat`],
    ['/en/producto/*', `${shop.origin}/en/producto/:splat`]
  );
} else {
  redirects.push(
    ['', ''],
    ['# ATENCIÓN: la tienda (links.shop) todavía apunta a este mismo dominio.', ''],
    ['# Antes de publicar hay que moverla (p. ej. a botiga.lesmoles.com) y cambiar links.shop.', '']
  );
}
redirects.push(['', ''], ['# 404 de cada idioma', ''], ['/es/*', '/es/404.html', '404'], ['/en/*', '/en/404.html', '404']);

write(
  '_redirects',
  redirects
    .map(([from, to, code]) => (from.startsWith('#') || !from ? from : `${from.padEnd(34)} ${to.padEnd(44)} ${code || '301'}`))
    .join('\n') + '\n'
);

/* ---------- _headers (Netlify / Cloudflare Pages) ---------- */
write(
  '_headers',
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/assets/css/*
  Cache-Control: public, max-age=31536000, immutable
/assets/js/*
  Cache-Control: public, max-age=31536000, immutable
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/assets/img/*
  Cache-Control: public, max-age=604800
`
);

console.log(`✓ ${count} páginas en ${path.relative(process.cwd(), OUT) || 'dist'}/ (${cfg.langs.join(', ')}) · ${cfg.baseUrl}${cfg.draft ? ' · BORRADOR' : ''}`);
