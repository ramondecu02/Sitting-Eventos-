#!/usr/bin/env node
/**
 * test_plano.js — subir el plano de una sala (catering) y que «cuadre».
 *
 * Lo que pidió Ramon (proceso independiente): cuando vamos a un catering y nos
 * pasan el plano de la sala, poder subirlo, IDENTIFICAR EL ESPACIO (que la zona
 * de trabajo tome la forma del plano) y darle una ESCALA REAL en metros para que
 * las mesas —a su tamaño legible— ocupen lo que de verdad ocupan y se vea si
 * caben. Y que ese plano sea DE ESE EVENTO (catering), sin colarse en los demás.
 *
 * Se prueba con el plano del SALÓN DEL DOMO (13,13 × 26,5 m, vertical):
 *  · al subirlo, la sala toma la forma del plano (queda vertical);
 *  · al poner 13,13 × 26,5 m y pulsar «Escala», la sala pasa a su tamaño real
 *    (13,13·65 ≈ 853 × 26,5·65 ≈ 1723 px, la referencia de 65 px/m) y aparece
 *    la barra de escala y las medidas sobre el plano;
 *  · marcado «solo de este evento», el plano NO aparece en un evento nuevo;
 *  · sin marcar, el plano es común a la ubicación (comportamiento de siempre).
 *
 * Arranque: igual que los otros tests, ver la cabecera de test_smoke.js.
 */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const path = require("node:path");

const BASE_URL = process.env.SITTING_TEST_URL || "http://localhost:3200";
const TEAM_PASSWORD = process.env.TEAM_PASSWORD;
if (!TEAM_PASSWORD) { console.error("Falta TEAM_PASSWORD en el entorno."); process.exit(1); }

// el plano de ejemplo (SALÓN DEL DOMO). Se puede pasar otro con PLANO_IMG.
const PLANO = process.env.PLANO_IMG ||
  "/root/.claude/uploads/420746e8-5c0c-5951-8bfe-d3c0ba69a82a/b93f5764-image.png";

let passed = 0, failed = 0;
async function step(name, fn) {
  try { await fn(); console.log("OK   " + name); passed++; }
  catch (err) { console.error("FAIL " + name); console.error("     " + (err.stack || err.message)); failed++; }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* medidas de la sala (viewBox del SVG del plano) */
async function sala(page) {
  const vb = await page.locator("#room").getAttribute("viewBox");
  const p = vb.split(/\s+/).map(Number);
  return { w: p[2], h: p[3] };
}
/* espera a que el plano de fondo aparezca dibujado */
async function esperarPlano(page, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < (ms || 5000)) {
    if (await page.locator("#room image").count() > 0) return true;
    await wait(150);
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1200 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  await step("login y evento nuevo", async () => {
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await page.locator("#ab-new").click(); await wait(400);
  });

  await step("marcar «plano solo de este evento» (catering) y subir el plano del DOMO", async () => {
    await page.locator("#planoEv").check(); await wait(150);
    await page.locator("#bgFile").setInputFiles(PLANO);
    assert.ok(await esperarPlano(page), "el plano se dibuja en la sala");
    // la etiqueta dice que es de este evento, no común
    assert.match(await page.locator("#bglbl").innerText(), /de este evento/i);
  });

  await step("el plano de catering NO toca el plano común de la ubicación", async () => {
    const compartido = await page.evaluate(() => {
      try { const r = localStorage.getItem("cv_sitting_planos"); const o = r ? JSON.parse(r) : {}; return !!(o && o.interior); }
      catch (e) { return false; }
    });
    assert.equal(compartido, false, "no se ha guardado en el plano común");
    const propio = await page.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) if ((localStorage.key(i) || "").indexOf("cv_sitting_plano_ev__") === 0) return true;
      return false;
    });
    assert.equal(propio, true, "se ha guardado como plano propio del evento");
  });

  await step("al subirlo, la SALA TOMA LA FORMA DEL PLANO (queda vertical)", async () => {
    const s = await sala(page);
    assert.ok(s.h > s.w, "el DOMO es vertical: alto > ancho (" + s.w + "×" + s.h + ")");
    const ar = s.w / s.h;
    assert.ok(ar > 0.4 && ar < 0.66, "la proporción se parece a la del plano (" + ar.toFixed(2) + ")");
  });

  await step("ESCALA REAL: 13,13 × 26,5 m ajusta la sala a su tamaño real (65 px/m)", async () => {
    await page.locator("#roomW").fill("13,13");
    await page.locator("#roomH").fill("26,5");
    await page.locator("#roomApply").click(); await wait(400);
    const s = await sala(page);
    // 13,13·65 ≈ 853 ; 26,5·65 ≈ 1723 (referencia REF_PXM=65, sin tocar el tope)
    assert.ok(Math.abs(s.w - 853) <= 45, "ancho ≈ 853 px (sale " + s.w + ")");
    assert.ok(Math.abs(s.h - 1723) <= 60, "largo ≈ 1723 px (sale " + s.h + ")");
    const ar = s.w / s.h, arReal = 13.13 / 26.5;
    assert.ok(Math.abs(ar - arReal) < 0.03, "la sala tiene la proporción real (" + ar.toFixed(3) + " vs " + arReal.toFixed(3) + ")");
  });

  await step("aparecen la barra de escala y las medidas sobre el plano", async () => {
    const html = await page.locator("#room").evaluate((el) => el.outerHTML);
    assert.match(html, /13,1\s*×\s*26,5\s*m/, "se ven las medidas de la sala");
    // la barra de escala y el rótulo de medidas llevan cada uno su fondo claro
    const fondos = (html.match(/rgba\(255,253,248,0\.82\)/g) || []).length;
    assert.ok(fondos >= 2, "se dibujan la barra de escala y el rótulo (fondos: " + fondos + ")");
    assert.match(html, /\d+ m<\/text>/, "la barra lleva su medida en metros");
  });

  await step("todo (plano propio + escala) sobrevive a recargar", async () => {
    await page.reload();
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await wait(800);
    assert.ok(await esperarPlano(page), "el plano propio sigue tras recargar");
    assert.equal(await page.locator("#roomW").inputValue(), "13,13", "las medidas siguen puestas");
    const s = await sala(page);
    assert.ok(Math.abs(s.w - 853) <= 45 && Math.abs(s.h - 1723) <= 60, "la sala sigue a escala (" + s.w + "×" + s.h + ")");
  });

  await step("ISOLAMIENTO: un evento nuevo NO arrastra el plano de catering", async () => {
    await page.locator("#ab-new").click(); await wait(500);
    assert.equal(await page.locator("#room image").count(), 0, "el evento nuevo no tiene plano");
    assert.equal(await page.locator("#roomW").inputValue(), "", "ni medidas");
    assert.equal(await page.locator("#planoEv").isChecked(), false, "ni la casilla de catering marcada");
  });

  await step("plano COMÚN (sin catering): funciona como siempre y sí se comparte", async () => {
    // sin marcar catering, el plano va al almacén común de la ubicación
    await page.locator("#bgFile").setInputFiles(PLANO);
    assert.ok(await esperarPlano(page), "el plano común se dibuja");
    const compartido = await page.evaluate(() => {
      try { const r = localStorage.getItem("cv_sitting_planos"); const o = r ? JSON.parse(r) : {}; return !!(o && o.interior); }
      catch (e) { return false; }
    });
    assert.equal(compartido, true, "el plano común sí queda guardado para la ubicación");
    // y por eso un evento nuevo (misma ubicación) sí lo ve
    await page.locator("#ab-new").click(); await wait(500);
    assert.ok(await esperarPlano(page), "un evento nuevo ve el plano común de la ubicación");
  });

  await step("«Ajustar sala al plano» da a la zona de trabajo la forma del plano", async () => {
    // este evento nuevo tiene sala por defecto; con el plano común puesto,
    // el botón la reajusta a la forma del plano (vertical)
    await page.locator("#bgFit").click(); await wait(400);
    const s = await sala(page);
    assert.ok(s.h > s.w, "queda vertical como el plano (" + s.w + "×" + s.h + ")");
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
