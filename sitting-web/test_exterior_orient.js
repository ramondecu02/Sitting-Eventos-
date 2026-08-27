#!/usr/bin/env node
/**
 * test_exterior_orient.js — verificación puntual del cambio del 27/08/2026:
 * el plano exterior ("Sala 17 mesas", con su chaflán real) ahora puede
 * ponerse en vertical y en apaisado igual que el interior, girando la forma
 * real 90° en vez de solo encogerla dentro de una caja ancha.
 *
 * No es parte de la suite permanente (no cubre login/sincronización, eso ya
 * lo hacen test_smoke.js/test_web.js) — es la prueba dirigida de este cambio
 * concreto. Arranque: igual que los otros dos, ver la cabecera de
 * test_smoke.js.
 */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE_URL = process.env.SITTING_TEST_URL || "http://localhost:3200";
const TEAM_PASSWORD = process.env.TEAM_PASSWORD;
if (!TEAM_PASSWORD) {
  console.error("Falta TEAM_PASSWORD en el entorno.");
  process.exit(1);
}

let passed = 0, failed = 0;
async function step(name, fn) {
  try { await fn(); console.log("OK   " + name); passed++; }
  catch (err) { console.error("FAIL " + name); console.error("     " + (err.stack || err.message)); failed++; }
}
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
function segLen(l) { return Math.hypot(l.x2 - l.x1, l.y2 - l.y1); }
async function getWallLines(page) {
  // "#8C8C8C" es el color de pared (variable W dentro de wallPrims()) — hay
  // otras líneas decorativas en el plano (p.ej. el filete bajo el título)
  // que no son pared y hay que descartar.
  return page.$$eval('#room line[stroke="#8C8C8C"]', (els) => els.map((el) => ({
    x1: parseFloat(el.getAttribute("x1")), y1: parseFloat(el.getAttribute("y1")),
    x2: parseFloat(el.getAttribute("x2")), y2: parseFloat(el.getAttribute("y2")),
  })));
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  await step("login", async () => {
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
  });

  await step("crear evento nuevo (exterior en blanco, sin mesas)", async () => {
    await page.locator("#new").click();
    await wait(150);
  });

  await step("exterior por defecto usa la plantilla 'Sala 17 mesas'", async () => {
    await page.locator('[data-loc="exterior"]').click();
    await wait(150);
    assert.equal(await page.locator("#tpl").inputValue(), "s17");
  });

  let portraitLines, landscapeLines;

  await step("vertical: sala 960×1400, 5 segmentos de pared", async () => {
    assert.equal(await page.locator("#room").getAttribute("viewBox"), "0 0 960 1400");
    portraitLines = await getWallLines(page);
    assert.equal(portraitLines.length, 5);
  });

  await step("Apaisado gira la sala a 1400×960", async () => {
    await page.locator('[data-o="l"]').click();
    await wait(150);
    assert.equal(await page.locator("#room").getAttribute("viewBox"), "0 0 1400 960");
    landscapeLines = await getWallLines(page);
    assert.equal(landscapeLines.length, 5);
  });

  await step("el contorno girado conserva la forma real (no la deforma)", async () => {
    const pLens = portraitLines.map(segLen), lLens = landscapeLines.map(segLen);
    const pMax = Math.max(...pLens), lMax = Math.max(...lLens);
    pLens.forEach((v, i) => {
      const rp = v / pMax, rl = lLens[i] / lMax;
      assert.ok(Math.abs(rp - rl) < 0.01,
        `segmento ${i}: proporción vertical ${rp.toFixed(4)} vs horizontal ${rl.toFixed(4)}`);
    });
    const diagP = portraitLines[2], diagL = landscapeLines[2];
    assert.notEqual(diagP.x1, diagP.x2); assert.notEqual(diagP.y1, diagP.y2);
    assert.notEqual(diagL.x1, diagL.x2); assert.notEqual(diagL.y1, diagL.y2);
  });

  await step("volver a Vertical devuelve exactamente la forma original", async () => {
    await page.locator('[data-o="p"]').click();
    await wait(150);
    assert.equal(await page.locator("#room").getAttribute("viewBox"), "0 0 960 1400");
    const backLines = await getWallLines(page);
    backLines.forEach((l, i) => {
      const o = portraitLines[i];
      assert.ok(Math.abs(l.x1 - o.x1) < 0.5 && Math.abs(l.y1 - o.y1) < 0.5 &&
                Math.abs(l.x2 - o.x2) < 0.5 && Math.abs(l.y2 - o.y2) < 0.5,
        `segmento ${i} no vuelve a su posición original`);
    });
  });

  await step("Diseño del salón sigue forzando vertical (regresión)", async () => {
    await page.locator('[data-o="l"]').click();
    await wait(150);
    for (let i = 0; i < 3; i++) await page.locator("#addT").click();
    await page.locator("#salon").click();
    await wait(150);
    assert.equal(await page.locator('[data-o="p"]').getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("#room").getAttribute("viewBox"), "0 0 960 1400");
  });

  await step("interior sigue funcionando igual (regresión rápida)", async () => {
    await page.locator('[data-loc="interior"]').click();
    await wait(150);
    await page.locator('[data-o="l"]').click();
    await wait(150);
    assert.equal(await page.locator("#room").getAttribute("viewBox"), "0 0 1400 960");
    await page.locator('[data-o="p"]').click();
    await wait(150);
    assert.equal(await page.locator("#room").getAttribute("viewBox"), "0 0 960 1400");
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
