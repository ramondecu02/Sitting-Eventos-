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
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { hecho, decisiones, calendario, fases, calidad, falta, opcionales } from './data.mjs';
import { css, cargarPlaywright, buscarChrome } from './comun.mjs';

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
