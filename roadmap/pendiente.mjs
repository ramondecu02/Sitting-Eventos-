#!/usr/bin/env node
// Genera ROADMAP_pendiente.pdf: solo lo que queda por hacer (y quién lo desbloquea), a partir de roadmap/data.mjs.
//
//   node roadmap/pendiente.mjs
//
// Comparte estilo y navegador con build.mjs (roadmap/comun.mjs). La versión sale de cloudflare/public/sw.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { pendienteTuyo, esperaOk, puedoHacer, casillasAbiertas, fases, calidad } from './data.mjs';
import { css, aqui, raiz, cargarPlaywright, buscarChrome } from './comun.mjs';

const sw = readFileSync(join(raiz, 'cloudflare/public/sw.js'), 'utf8');
const version = (sw.match(/const V\s*=\s*"([^"]+)"/) || [])[1];
if (!version) throw new Error('No encuentro la versión en cloudflare/public/sw.js');
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const hoy = new Date();
const fecha = `${hoy.getDate()} de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cb = (on = false) => `<span class="cb ${on ? 'on' : ''}" role="img" aria-label="${on ? 'hecho' : 'pendiente'}"></span>`;

// casillas de las fases: cuántas hechas y cuántas vacías
let tot = 0, ok = 0;
for (const f of fases) for (const t of f.tareas) { const it = [...t.que, ...t.hecho]; tot += it.length + 1; ok += it.filter(x => x[1]).length + (it.every(x => x[1]) ? 1 : 0); }
const nTuyo = pendienteTuyo.reduce((a, g) => a + g.items.length, 0);

const grupos = pendienteTuyo.map((g, gi) => `
<h3 class="gr"><span>${gi + 1}</span>${esc(g.grupo)}</h3>
<table class="pend"><thead><tr><th class="n">N.º</th><th>Qué hay que hacer</th><th class="q">Quién</th><th class="u">Qué desbloquea</th></tr></thead><tbody>
${g.items.map(([n, q, quien, des]) => `<tr><td class="n">${cb()}<b>${esc(n)}</b></td><td>${esc(q)}</td><td class="q">${esc(quien)}</td><td class="u">${esc(des)}</td></tr>`).join('\n')}
</tbody></table>`).join('\n');

const extra = `
.resumen{display:grid;grid-template-columns:repeat(4,1fr);gap:8pt;margin:9pt 0 4pt}
.resumen div{background:var(--cream);border-radius:3pt;padding:7pt 9pt;break-inside:avoid}
.resumen b{display:block;font:400 21pt/1 'Instrument Serif','Liberation Serif',Georgia,serif;color:var(--ink)}
.resumen span{display:block;margin-top:3pt;font-size:7.6pt;line-height:1.3;color:var(--mut)}
.lead{font-size:9.4pt;line-height:1.4;margin:9pt 0 0;color:var(--ink2)}
h3.gr{display:flex;gap:8pt;align-items:baseline;font-size:13.4pt;margin:12pt 0 4pt;break-after:avoid}
h3.gr span{font:700 7.8pt 'Instrument Sans','Liberation Sans',Arial,sans-serif;letter-spacing:.14em;color:var(--ol)}
table.pend{table-layout:fixed}
table.pend td{font-size:8.3pt;line-height:1.32}
table.pend th.n,table.pend td.n{width:36pt;white-space:nowrap}
table.pend td.n .cb{margin-right:4pt;vertical-align:-1.5pt}
table.pend td.n b{font-size:7.8pt;color:var(--ol);letter-spacing:.06em}
table.pend th.q,table.pend td.q{width:62pt;color:var(--mut)}
table.pend th.u,table.pend td.u{width:120pt;color:var(--mut)}
.ok-box{border:1px solid var(--line);border-left:3pt solid var(--ol);border-radius:4pt;padding:7pt 11pt;margin:0 0 7pt;break-inside:avoid;background:#fff}
.ok-box h4{margin:0 0 2pt;font:700 8.8pt 'Instrument Sans','Liberation Sans',Arial,sans-serif;display:flex;gap:7pt;align-items:center}
.ok-box p{margin:0 0 0 15pt;font-size:8.4pt;line-height:1.35;color:var(--ink2)}
table.yo td.e{width:62pt;white-space:nowrap;color:var(--mut)}
table.yo td.t{width:150pt;font-weight:700}
table.yo td{font-size:8.3pt}
table.yo td.t .cb{margin-right:6pt;vertical-align:-1.5pt}
table.ab td{font-size:8.1pt}
table.ab td.a{width:98pt;font-weight:700}
table.ab td.c{width:118pt;color:var(--mut)}
.pie-nota{margin-top:11pt;padding-top:5pt;border-top:.7pt dashed var(--line);font-size:7.6pt;color:var(--mut)}
`;

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Les Moles Events · Lo que queda por hacer</title><style>${css}${extra}</style></head><body>
<div class="top"><div><div class="k">Les Moles Events</div><h1>Lo que queda por hacer</h1></div>
<div class="r"><b>Versión ${esc(version)}</b> · ${esc(fecha)}<br>Qué falta, quién lo desbloquea y qué puedo hacer yo<br>Las fases de desarrollo están terminadas</div></div>

<p class="lead">El programa ya hace todo lo que el roadmap prometía. <b>Lo imprescindible que queda no es programar, es activar y decidir:</b> una cuenta de correo, un par de decisiones y la revisión del contrato por tu asesor. Con eso se pasa de «probado» a «en uso». Ordenado de lo más a lo menos urgente.</p>

<div class="resumen">
<div><b>${ok} de ${tot}</b><span>casillas de las fases hechas; las ${tot - ok} que quedan vacías dependen del correo, del contrato y de dos mejoras de calidad</span></div>
<div><b>${nTuyo}</b><span>cosas que dependen del restaurante (${pendienteTuyo[0].items.length} urgentes, ${pendienteTuyo[1].items.length} antes del primer evento real, ${pendienteTuyo[2].items.length} sin prisa)</span></div>
<div><b>${esperaOk.length}</b><span>decisiones que esperan tu OK: el rediseño visual y una fila de la escaleta</span></div>
<div><b>${puedoHacer.length}</b><span>mejoras que puedo hacer cuando me lo pidas, con su estimación</span></div>
</div>

<h2 class="sec">A · Lo que depende del restaurante <small>el número es el de la sección 8 de ROADMAP.md</small></h2>
${grupos}

<h2 class="sec">B · Lo que espera tu OK <small>no se toca nada hasta que lo digas</small></h2>
${esperaOk.map(([t, d]) => `<div class="ok-box"><h4>${cb()}${esc(t)}</h4><p>${esc(d)}</p></div>`).join('\n')}

<h2 class="sec">C · Lo que puedo hacer yo cuando me lo pidas <small>estimaciones de desarrollo y pruebas</small></h2>
<table class="yo"><thead><tr><th>Qué</th><th>Estimación</th><th>Para qué</th></tr></thead><tbody>
${puedoHacer.map(([q, e, d]) => `<tr><td class="t">${cb()}${esc(q)}</td><td class="e">${esc(e)}</td><td>${esc(d)}</td></tr>`).join('\n')}
</tbody></table>

<h2 class="sec">D · Las ${tot - ok} casillas que siguen vacías en las fases <small>y qué las cierra</small></h2>
<table class="ab"><thead><tr><th>Dónde</th><th>Casillas</th><th>Se cierra con</th></tr></thead><tbody>
${casillasAbiertas.map(([a, c, s]) => `<tr><td class="a">${esc(a)}</td><td>${esc(c)}</td><td class="c">${esc(s)}</td></tr>`).join('\n')}
</tbody></table>

<p class="pie-nota">Para marcar lo hecho, dímelo y actualizo este documento (<i>node roadmap/pendiente.mjs</i> lo regenera; el detalle completo de cada fase está en ROADMAP_checklist.pdf y en ROADMAP.md).</p>
</body></html>`;

const salidaHtml = join(aqui, 'pendiente.html');
const salidaPdf = join(raiz, 'ROADMAP_pendiente.pdf');
writeFileSync(salidaHtml, html);

const pw = cargarPlaywright();
const navegador = await pw.chromium.launch({ executablePath: buscarChrome() });
try {
  const pagina = await navegador.newPage();
  await pagina.goto(pathToFileURL(salidaHtml).href);
  await pagina.evaluate(() => document.fonts.ready);
  const pie = `<div style="font:7pt 'Liberation Sans',Arial,sans-serif;color:#56554e;width:100%;padding:0 14mm;display:flex;justify-content:space-between"><span>Les Moles Events · Lo que queda por hacer · versión ${esc(version)}</span><span>pág. <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`;
  await pagina.pdf({ path: salidaPdf, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: pie, preferCSSPageSize: true });
} finally {
  await navegador.close();
}
console.log(`OK · versión ${version} · ${nTuyo} cosas del restaurante · ${salidaPdf}`);
