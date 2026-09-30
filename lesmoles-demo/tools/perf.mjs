#!/usr/bin/env node
/*
 * Mide la fluidez real: recorre la Home con la rueda (como un usuario, con
 * Lenis y todas las escenas) y registra con el perfilador de Chrome:
 *   - fotogramas: mediana, p95 y % por encima de 20 ms (jank)
 *   - trabajo del hilo principal por tipo: script, estilo, maquetación,
 *     pintado y composición
 * Uso: npm run build && node tools/perf.mjs [etiqueta]
 * Guarda el resultado en capturas/perf-<etiqueta>.json para comparar.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.env.SHOTS_DIR || path.join(ROOT, 'capturas'));
const label = process.argv[2] || 'actual';
const W = Number(process.env.W || 1440);
const H = Number(process.env.H || 900);

const server = await preview({ root: ROOT, preview: { port: 0 }, logLevel: 'error' });
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(5500); // preloader + entrada

// Contador de fotogramas en la página
await page.evaluate(() => {
  window.__frames = [];
  window.__pos = [];
  let last = performance.now();
  const loop = (t) => {
    window.__frames.push(t - last);
    window.__pos.push([t, scrollY]);
    last = t;
    if (window.__rec) requestAnimationFrame(loop);
  };
  window.__rec = true;
  requestAnimationFrame(loop);
});

await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'] });
await page.evaluate(() => {
  console.timeStamp('lm-sync');
  window.__sync = performance.now();
});
const t0 = Date.now();
await page.mouse.move(W / 2, H / 2);
for (;;) {
  const done = await page.evaluate(() => scrollY >= document.documentElement.scrollHeight - innerHeight - 4);
  if (done) break;
  await page.mouse.wheel(0, 90);
  await page.waitForTimeout(16);
  if (Date.now() - t0 > 120000) break;
}
await page.waitForTimeout(1200);
const trace = JSON.parse((await browser.stopTracing()).toString());
const frames = await page.evaluate(() => ((window.__rec = false), window.__frames.slice(2)));
// Pintado por capítulo: se alinea el reloj de la traza con performance.now()
const { pos, sync, bounds } = await page.evaluate(() => ({
  pos: window.__pos,
  sync: window.__sync,
  bounds: [...document.querySelectorAll('main > section, footer')].map((s) => {
    const r = s.getBoundingClientRect();
    return [s.dataset.chapterName || s.className.split(' ')[0], r.top + scrollY, r.bottom + scrollY];
  }),
}));
const mark = trace.traceEvents.find((e) => e.name === 'TimeStamp' && e.args?.data?.message === 'lm-sync');
const perSection = {};
if (mark) {
  const toPage = (ts) => sync + (ts - mark.ts) / 1000;
  const yAt = (t) => {
    let lo = 0, hi = pos.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (pos[m][0] <= t) lo = m; else hi = m - 1; }
    return pos[lo]?.[1] ?? 0;
  };
  for (const e of trace.traceEvents) {
    if (e.ph !== 'X' || !e.dur || !['Paint', 'RasterTask', 'Layout', 'UpdateLayoutTree'].includes(e.name)) continue;
    const y = yAt(toPage(e.ts)) + H / 2;
    const sec = bounds.find(([, a, b]) => y >= a && y < b)?.[0] || '?';
    perSection[sec] = perSection[sec] || {};
    perSection[sec][e.name] = +(((perSection[sec][e.name] || 0) + e.dur / 1000)).toFixed(1);
  }
}

// Trabajo del hilo principal agrupado (ms)
const groups = {
  script: ['FunctionCall', 'EvaluateScript', 'TimerFire', 'FireAnimationFrame', 'EventDispatch'],
  estilo: ['UpdateLayoutTree', 'RecalculateStyles'],
  maquetacion: ['Layout'],
  pintado: ['Paint', 'PaintImage', 'Rasterize', 'RasterTask'],
  composicion: ['UpdateLayer', 'UpdateLayerTree', 'CompositeLayers', 'Commit', 'PrePaint', 'Layerize'],
};
const byName = {};
for (const e of trace.traceEvents) {
  if (e.ph !== 'X' || !e.dur) continue;
  byName[e.name] = (byName[e.name] || 0) + e.dur / 1000;
}
const count = (n) => trace.traceEvents.filter((e) => e.name === n && (e.ph === 'X' || e.ph === 'B')).length;
const sum = (names) => +names.reduce((a, n) => a + (byName[n] || 0), 0).toFixed(1);
const sorted = [...frames].sort((a, b) => a - b);
const q = (p) => +sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))].toFixed(1);
const result = {
  etiqueta: label,
  viewport: `${W}x${H}`,
  segundos: +((Date.now() - t0) / 1000).toFixed(1),
  fotogramas: frames.length,
  mediana_ms: q(0.5),
  p95_ms: q(0.95),
  lentos_pct: +((frames.filter((f) => f > 20).length / frames.length) * 100).toFixed(1),
  muy_lentos_pct: +((frames.filter((f) => f > 34).length / frames.length) * 100).toFixed(1),
  hilo_principal_ms: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, sum(v)])),
  pintados: count('Paint'),
  maquetaciones: count('Layout'),
  por_capitulo_ms: perSection,
};
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, `perf-${label}.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
server.httpServer.close();
