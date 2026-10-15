#!/usr/bin/env node
// Genera ROADMAP_checklist.pdf (y roadmap/checklist.html) a partir de roadmap/data.mjs.
//
//   node roadmap/build.mjs
//
// - La versión sale de cloudflare/public/sw.js (const V = "01.NN"), así que el PDF
//   siempre lleva la versión que está publicada.
// - Necesita playwright (o playwright-core) y un Chromium. En este entorno basta con
//   ejecutarlo tal cual; en otro sitio:  npm i --no-save playwright-core  y
//   CHROME_PATH=/ruta/a/chrome node roadmap/build.mjs
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { hecho, decisiones, calendario, fases, calidad, falta, opcionales } from './data.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = dirname(aqui);
const salidaPdf = join(raiz, 'ROADMAP_checklist.pdf');
const salidaHtml = join(aqui, 'checklist.html');

// ---------- versión y fecha ----------
const sw = readFileSync(join(raiz, 'cloudflare/public/sw.js'), 'utf8');
const version = (sw.match(/const V\s*=\s*"([^"]+)"/) || [])[1];
if (!version) throw new Error('No encuentro la versión en cloudflare/public/sw.js');
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const hoy = new Date();
const fecha = `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;

// ---------- HTML ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cb = (on, cls = '') => `<span class="cb ${on ? 'on' : ''} ${cls}" role="img" aria-label="${on ? 'hecho' : 'pendiente'}"></span>`;
// «· v01.54» no se parte de la línea: la versión no queda sola en la siguiente
const txt = t => esc(t).replace(/ · (v\d\d\.\d\d(?:–\d\d\.\d\d)?)/, ' <span class="nw">·\u00a0$1</span>');
const li = ([t, on]) => `<li>${cb(on)}<span>${esc(t)}</span></li>`;

let casillasTotal = 0, casillasHechas = 0;
const tarjetas = fases.map(f => {
  let tot = 0, ok = 0;
  const cards = f.tareas.map(t => {
    const items = [...t.que, ...t.hecho];
    const done = items.every(x => x[1]);
    tot += items.length + 1; ok += items.filter(x => x[1]).length + (done ? 1 : 0);
    return `<section class="card ${done ? 'done' : 'open'}">
  <header>${cb(done, 'big')}<div class="ttl"><div class="num">${esc(t.id)}</div><h3>${esc(t.titulo)}</h3></div>
    <div class="meta"><b>${esc(t.esfuerzo)}</b><span>${esc(t.v)}</span></div></header>
  <div class="cols">
    <div><h4>Qué se hace</h4><ul>${t.que.map(li).join('')}</ul></div>
    <div><h4>Hecho cuando…</h4><ul class="hc">${t.hecho.map(li).join('')}</ul></div>
  </div>
  <footer><span>Responsable <i></i></span><span>Fecha <i></i></span></footer>
</section>`;
  }).join('\n');
  casillasTotal += tot; casillasHechas += ok;
  return `<div class="fase f${f.n}"><div class="banner"><span class="fn">Fase ${f.n}</span><h2>${esc(f.titulo)}</h2><span class="sub">${esc(f.sub)}</span><em>${ok} de ${tot} casillas hechas</em></div>
${cards}</div>`;
}).join('\n');

const fontFace = (fam, file, w, st) => `@font-face{font-family:'${fam}';src:url('fonts/${file}') format('woff2');font-weight:${w};font-style:${st}}`;
const css = `
${fontFace('Instrument Sans', 'instrument-sans-latin-400-normal.woff2', 400, 'normal')}
${fontFace('Instrument Sans', 'instrument-sans-latin-400-italic.woff2', 400, 'italic')}
${fontFace('Instrument Sans', 'instrument-sans-latin-700-normal.woff2', 700, 'normal')}
${fontFace('Instrument Serif', 'instrument-serif-latin-400-normal.woff2', 400, 'normal')}
:root{--ink:#1a1a1a;--ink2:#2a2a27;--mut:#56554e;--mut2:#8d8c80;--ol:#6e7d50;--ol2:#b9c29e;--line:#cfcbb6;--cream:#f1efe4;--cardok:#f8faf3}
@page{size:A4;margin:13mm 14mm 17mm}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font:9.1pt/1.32 'Instrument Sans','Liberation Sans',Arial,sans-serif;color:var(--ink)}
h1,h2,h3{font-family:'Instrument Serif','Liberation Serif',Georgia,serif;font-weight:400;margin:0}
ul{list-style:none;margin:0;padding:0}
.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid var(--ink);padding-bottom:6pt}
.top .k{font-weight:700;font-size:7.3pt;letter-spacing:.3em;text-transform:uppercase;color:var(--ol)}
.top h1{font-size:23pt;line-height:1.05;margin-top:3pt}
.top .r{text-align:right;font-size:7.8pt;color:var(--mut);line-height:1.45}
.top .r b{color:var(--ink)}
.leyenda{display:flex;gap:16pt;align-items:center;background:var(--cream);border-radius:3pt;padding:5pt 9pt;margin:9pt 0 12pt;font-size:7.6pt;color:var(--mut)}
.leyenda span{display:inline-flex;gap:5pt;align-items:center}
h2.sec{font-size:15pt;margin:14pt 0 6pt;break-after:avoid}
h2.sec small{font:400 8.4pt 'Instrument Sans',sans-serif;color:var(--mut);margin-left:6pt}
.lista li{display:flex;gap:7pt;align-items:flex-start;padding:2.2pt 0;break-inside:avoid}
.lista li .cb{margin-top:1.4pt}
.nw{white-space:nowrap}
.lista .sub{display:block;font-style:italic;font-size:7.6pt;color:var(--mut)}
.cb{flex:none;display:inline-block;width:8.6pt;height:8.6pt;border:.75pt solid var(--ink);border-radius:2pt;background:#fff}
.cb.on{background:var(--ol) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M2 5.2 4.2 7.4 8 2.8' fill='none' stroke='%23fff' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/100% 100% no-repeat;border-color:var(--ol)}
.cb.big{width:12pt;height:12pt;border-width:1.5pt;border-radius:3pt}
.cb.on.big{border-color:var(--ol)}
table{width:100%;border-collapse:collapse;font-size:8.6pt}
th{font-weight:700;font-size:7pt;letter-spacing:.22em;text-transform:uppercase;color:var(--ol);text-align:left;padding:3pt 4pt;border-bottom:1.2pt solid var(--ink)}
td{padding:5pt 4pt;border-bottom:.6pt solid var(--line);vertical-align:top}
tr{break-inside:avoid}
td.d,td.v{white-space:nowrap}
td.d{width:58pt}td.v{width:44pt;text-align:right;color:var(--mut)}
td.d .cb{margin-right:7pt;vertical-align:-1.5pt}
.fase{break-before:page}
.fase.f1{break-before:auto}
.banner{display:flex;align-items:baseline;gap:9pt;background:var(--cream);border-bottom:2pt solid var(--ink);padding:7pt 9pt 6pt;margin:12pt 0 10pt;break-after:avoid}
.banner .fn{font-weight:700;font-size:8pt;letter-spacing:.3em;text-transform:uppercase;color:var(--ol)}
.banner h2{font-size:17pt}
.banner .sub{font-size:8.8pt;color:var(--mut)}
.banner em{margin-left:auto;font-size:8pt;color:var(--mut)}
.card{border:1px solid var(--line);border-left:3pt solid var(--ol);border-radius:4pt;background:#fff;padding:8pt 11pt 6pt;margin:0 0 9pt;break-inside:avoid}
.card.done{background:var(--cardok);border-left-color:var(--ol2)}
.card header{display:flex;gap:9pt;align-items:flex-start}
.card header .ttl{flex:1;min-width:0}
.num{font-weight:700;font-size:7.8pt;letter-spacing:.14em;color:var(--ol)}
.card h3{font-size:13.2pt;line-height:1.15;margin-top:1pt}
.meta{text-align:right;white-space:nowrap;line-height:1.35}
.meta b{display:block;font-size:8.6pt}
.meta span{font-size:7.8pt;color:var(--mut)}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:0 18pt;margin-top:5pt}
.cols h4{margin:0 0 4pt;font-weight:700;font-size:7.3pt;letter-spacing:.24em;text-transform:uppercase;color:var(--ol)}
.cols li{display:flex;gap:7pt;align-items:flex-start;padding:1.6pt 0;line-height:1.3}
.cols li .cb{margin-top:1.5pt;width:8pt;height:8pt}
.cols ul.hc li{font-style:italic;color:var(--ink2)}
.card footer{display:flex;justify-content:flex-end;gap:16pt;margin-top:7pt;padding-top:4pt;border-top:.7pt dashed var(--line);font-size:7.3pt;color:var(--mut2)}
.card footer i{display:inline-block;width:70pt;border-bottom:.7pt solid var(--mut2);margin-left:4pt}
.fin{break-before:auto;padding-top:6pt}
`;

const ya = hecho.map(t => `<li>${cb(true)}<span>${txt(t)}</span></li>`).join('');
const cal = calendario.map(([d, e, v]) => `<tr><td class="d">${cb(true)}${esc(d)}</td><td>${esc(e)}</td><td class="v">${esc(v)}</td></tr>`).join('');

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Les Moles Events · Roadmap (checklist)</title><style>${css}</style></head><body>
<div class="top"><div><div class="k">Les Moles Events</div><h1>Roadmap · checklist</h1></div>
<div class="r"><b>Versión ${esc(version)}</b> · ${esc(fecha)}<br>Objetivo: usar el programa al 100 % en todos los eventos<br>Esfuerzos estimados en días de desarrollo y pruebas</div></div>
<div class="leyenda"><span>${cb(false)} casilla vacía = pendiente</span><span>${cb(true)} hecho</span><span>«Hecho cuando…» = prueba que confirma que el punto está terminado</span></div>

<h2 class="sec" style="margin-top:0">Ya hecho</h2><ul class="lista">${ya}</ul>

<h2 class="sec">Decisiones previas <small>antes de empezar</small></h2>
<ul class="lista">${decisiones.map(t => `<li>${cb(false)}<span>${esc(t)}</span></li>`).join('')}</ul>

<h2 class="sec">Calendario propuesto</h2>
<table><thead><tr><th>Días</th><th>Entrega</th><th style="text-align:right">Versión</th></tr></thead><tbody>${cal}</tbody></table>

${tarjetas}

<div class="fin"><h2 class="sec">Calidad continua <small>en paralelo</small></h2>
<ul class="lista">${calidad.map(([t, on]) => `<li>${cb(on)}<span>${esc(t)}</span></li>`).join('')}</ul>

<h2 class="sec">Lo que falta y depende de ti <small>de lo más a lo menos urgente</small></h2>
<ul class="lista">${falta.map(([t, d]) => `<li>${cb(false)}<span>${esc(t)}<span class="sub">${esc(d)}</span></span></li>`).join('')}</ul>

<h2 class="sec">Opcionales <small>si los quieres, se hacen</small></h2>
<ul class="lista">${opcionales.map(t => `<li>${cb(false)}<span>${esc(t)}</span></li>`).join('')}</ul></div>
</body></html>`;
writeFileSync(salidaHtml, html);

// ---------- PDF ----------
function cargarPlaywright() {
  const req = createRequire(import.meta.url);
  const sitios = [undefined, process.env.PW_DIR, process.cwd(), join(raiz, 'cloudflare')];
  try { sitios.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()); } catch { /* sin npm */ }
  for (const nombre of ['playwright-core', 'playwright']) {
    for (const base of sitios) {
      try { return req(base ? req.resolve(nombre, { paths: [base] }) : nombre); } catch { /* siguiente */ }
    }
  }
  throw new Error('Falta playwright-core: npm i --no-save playwright-core (o PW_DIR=/carpeta/con/node_modules)');
}
function buscarChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (existsSync(base)) {
    for (const d of readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().reverse()) {
      const p = join(base, d, 'chrome-linux/chrome');
      if (existsSync(p)) return p;
    }
    if (existsSync(join(base, 'chromium/chrome-linux/chrome'))) return join(base, 'chromium/chrome-linux/chrome');
  }
  return undefined; // el que tenga instalado playwright
}

const pw = cargarPlaywright();
const navegador = await pw.chromium.launch({ executablePath: buscarChrome() });
try {
  const pagina = await navegador.newPage();
  await pagina.goto(pathToFileURL(salidaHtml).href);
  await pagina.evaluate(() => document.fonts.ready);
  const pie = `<div style="font:7pt 'Liberation Sans',Arial,sans-serif;color:#56554e;width:100%;padding:0 14mm;display:flex;justify-content:space-between"><span>Les Moles Events · Roadmap · checklist</span><span>pág. <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`;
  await pagina.pdf({ path: salidaPdf, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: pie, preferCSSPageSize: true });
} finally {
  await navegador.close();
}
console.log(`OK · versión ${version} · ${fecha} · ${casillasHechas} de ${casillasTotal} casillas de las fases · ${salidaPdf}`);
