#!/usr/bin/env node
/**
 * test_camareros.js — camareros necesarios para el evento, y la agenda de camareros.
 *
 * Dos cosas separadas que comparten la palabra "camareros" pero no la misma vida:
 *
 *  1) CUÁNTOS HACEN FALTA: se calcula solo a partir de los comensales del
 *     evento, uno cada 11, redondeando siempre hacia arriba. Se ve en las
 *     cifras del Menú y en el check list de Servicio — no hay que escribirlo
 *     a mano en ningún sitio.
 *
 *  2) LA AGENDA (nombre, teléfono): es del negocio, como el Inventario — la
 *     misma lista para todos los eventos — pero la disponibilidad de cada
 *     uno (viene / no viene / pendiente de confirmar) es de CADA evento, así
 *     que el mismo camarero puede estar "disponible" en una boda y
 *     "pendiente" en la siguiente sin que se pisen.
 *
 * Arranque: igual que los otros tests, ver la cabecera de test_smoke.js.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = process.env.SITTING_TEST_URL || "http://localhost:3200";
const TEAM_PASSWORD = process.env.TEAM_PASSWORD;
if (!TEAM_PASSWORD) { console.error("Falta TEAM_PASSWORD en el entorno."); process.exit(1); }

/* la agenda de camareros es del negocio y sobrevive entre ejecuciones (igual
   que el inventario): el nombre lleva un prefijo de esta ejecución, para no
   chocar con lo que dejó una prueba anterior que no llegó a limpiar (por
   ejemplo, si el navegador se cerró antes de que el guardado remoto,
   retrasado, terminara de subirlo) */
const PREF = "PRUEBA ";
const token = PREF + Date.now().toString(36).slice(-5).toUpperCase();
const NOMBRE = token + " Marta Puig";

let passed = 0, failed = 0;
async function step(name, fn) {
  try { await fn(); console.log("OK   " + name); passed++; }
  catch (err) { console.error("FAIL " + name); console.error("     " + (err.stack || err.message)); failed++; }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* buscar por texto con filter(), no con :has-text("...") — ver test_inventario.js */
const fila = (page, texto) => page.locator(".cam-row").filter({ hasText: texto });

/* un PDF sin comprimir es texto latin-1 buscable tal cual */
function contiene(buf, txt) { return buf.toString("latin1").includes(txt); }

/* 9 + 8 + 8 = 25 comensales -> 25 / 11 = 2,27 -> hacen falta 3, no 2:
   así queda claro que se redondea hacia arriba y no se trunca */
const PLANO = `# Camareros de prueba
@ 12/09/2026

M1 | Redonda 10 | Mesa 1
Ana
Bea
Carlos
Diana
Elena
Fran
Gema
Hugo
Ivan

M2 | Redonda 10 | Mesa 2
Julia
Kiko
Laura
Marc
Nuria
Oscar
Pau
Quim

M3 | Redonda 10 | Mesa 3
Rita
Sara
Tomas
Uxue
Vera
Wendy
Xavi
Yago
`;

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "camareros-"));
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const page = await (await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } })).newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  await step("login y un evento con 25 comensales en el plano", async () => {
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await page.locator("#ab-new").click(); await wait(400);
    await page.locator("#src").fill(PLANO);
    await page.locator("#src").dispatchEvent("input");
    await wait(700);
  });

  await step("se barre lo que dejaron ejecuciones anteriores", async () => {
    await page.locator("#ab-sec").selectOption("cam"); await wait(600);
    const barridos = await page.evaluate((pref) => {
      const st = window.SITTING_BRIDGE.store;
      if (!st.camareros || !st.camareros.personas) return 0;
      let n = 0;
      st.camareros.personas.forEach((p) => {
        if (!p.borrado && String(p.nombre || "").startsWith(pref)) { p.borrado = true; p.updated = Date.now(); n++; }
      });
      window.SITTING_BRIDGE.save();
      return n;
    }, PREF);
    console.log("     (barridos " + barridos + " restos de pruebas anteriores)");
    await page.reload();
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await wait(1000);
  });

  await step("CAMAREROS NECESARIOS: uno cada 11 comensales, redondeando hacia arriba", async () => {
    await page.locator("#ab-sec").selectOption("m-sel"); await wait(600);
    const stats = await page.locator("#mnu-stats").innerText();
    assert.match(stats, /25\s*\n?\s*COMENSALES/i);
    assert.match(stats, /3\s*\n?\s*CAMAREROS/i, "25 entre 11 es 2,27 -> se redondea a 3, no a 2");
  });

  await step("también sale en el check list de Servicio, con la explicación", async () => {
    await page.locator("#ab-sec").selectOption("m-serv"); await wait(700);
    const texto = await page.locator("#mnu-body").innerText();
    assert.match(texto, /Camareros necesarios: 3/);
    assert.match(texto, /uno cada 11 comensales/i);
  });

  await step("«Camareros» es su propio grupo en la barra, aparte de Inventario y Menú", async () => {
    const grupos = await page.locator("#ab-sec optgroup").evaluateAll((g) => g.map((x) => x.label));
    assert.deepEqual(grupos, ["Plano de mesas", "Menú del evento", "Inventario", "Camareros"]);
  });

  await step("la sección Camareros explica cómo funciona y cuenta lo que hace falta", async () => {
    await page.locator("#ab-sec").selectOption("cam"); await wait(600);
    await page.locator("#appCam").waitFor({ state: "visible" });
    const stats = await page.locator("#cam-stats").innerText();
    assert.match(stats, /3\s*\n?\s*NECESARIOS/i);
  });

  await step("AÑADIR UN CAMARERO A LA AGENDA", async () => {
    await page.locator("button.cam-add").click(); await wait(300);
    await page.locator(".inv-form .f-nombre").fill(NOMBRE);
    await page.locator(".inv-form .f-telefono").fill("600 111 222");
    await page.locator(".inv-form .f-ok").click(); await wait(500);
    assert.equal(await fila(page, NOMBRE).count(), 1);
    assert.match(await fila(page, NOMBRE).innerText(), /600 111 222/);
  });

  await step("un camarero sin nombre no se añade", async () => {
    const antes = await page.locator(".cam-row").count();
    await page.locator("button.cam-add").click(); await wait(300);
    await page.locator(".inv-form .f-telefono").fill("600 000 000");
    await page.locator(".inv-form .f-ok").click(); await wait(400);
    assert.equal(await page.locator(".cam-row").count(), antes, "no se añade nada sin nombre");
    await page.locator(".inv-form .f-no").click(); await wait(300);
  });

  await step("se puede buscar por nombre o teléfono", async () => {
    await page.locator("#cam-q").fill(token);
    await page.locator("#cam-q").dispatchEvent("input"); await wait(400);
    assert.equal(await fila(page, NOMBRE).count(), 1);
    await page.locator("#cam-q").fill("no-existe-nadie-así");
    await page.locator("#cam-q").dispatchEvent("input"); await wait(400);
    assert.equal(await page.locator(".cam-row").count(), 0);
    assert.match(await page.locator("#cam-body").innerText(), /Nadie coincide/i);
    await page.locator("#cam-q").fill("");
    await page.locator("#cam-q").dispatchEvent("input"); await wait(400);
  });

  await step("empieza PENDIENTE, y se puede marcar disponible", async () => {
    const f = fila(page, NOMBRE);
    assert.equal(await f.locator('.cam-disp button[aria-pressed="true"]').innerText(), "Pendiente");
    await f.locator('.cam-disp button[data-e="si"]').click(); await wait(400);
    assert.equal(await f.locator('.cam-disp button[aria-pressed="true"]').innerText(), "Disponible");
    const stats = await page.locator("#cam-stats").innerText();
    assert.match(stats, /1\s*\n?\s*DISPONIBLES/i);
  });

  await step("la disponibilidad sobrevive a salir de la pantalla y volver", async () => {
    await page.locator("#ab-sec").selectOption("m-sel"); await wait(500);
    await page.locator("#ab-sec").selectOption("cam"); await wait(500);
    const f = fila(page, NOMBRE);
    assert.equal(await f.locator('.cam-disp button[aria-pressed="true"]').innerText(), "Disponible");
  });

  await step("LA AGENDA ES DEL NEGOCIO: otro evento ve al mismo camarero", async () => {
    await page.locator("#ab-new").click(); await wait(700);
    await page.locator("#ab-sec").selectOption("cam"); await wait(600);
    assert.equal(await fila(page, NOMBRE).count(), 1, "la agenda no es del evento, es del negocio");
  });

  await step("PERO LA DISPONIBILIDAD SÍ ES DE CADA EVENTO: aquí está pendiente todavía", async () => {
    const f = fila(page, NOMBRE);
    assert.equal(await f.locator('.cam-disp button[aria-pressed="true"]').innerText(), "Pendiente",
      "en el evento nuevo todavía no se ha marcado nada para ella");
    await f.locator('.cam-disp button[data-e="no"]').click(); await wait(400);
    assert.equal(await f.locator('.cam-disp button[aria-pressed="true"]').innerText(), "No disponible");
  });

  await step("y el primer evento conserva la suya, sin mezclarse", async () => {
    const idAntes = await page.locator("#ab-ev option").nth(1).getAttribute("value");
    await page.locator("#ab-ev").selectOption(idAntes); await wait(600);
    await page.locator("#ab-sec").selectOption("cam"); await wait(500);
    const f = fila(page, NOMBRE);
    assert.equal(await f.locator('.cam-disp button[aria-pressed="true"]').innerText(), "Disponible",
      "sigue disponible en el evento donde se marcó; el otro evento no la ha tocado");
  });

  await step("EDITAR TELÉFONO Y COMENTARIO", async () => {
    const f = fila(page, NOMBRE);
    await f.locator("button.cam-ed").click(); await wait(300);
    await page.locator(".inv-panel .p-telefono").fill("600 999 888");
    await page.locator(".inv-panel .p-telefono").dispatchEvent("change");
    await page.locator(".inv-panel .p-nota").fill("turno de tarde");
    await page.locator(".inv-panel .p-nota").dispatchEvent("change");
    await wait(500);
    await page.locator(".inv-panel .p-cerrar").click(); await wait(300);
    const texto = await fila(page, NOMBRE).innerText();
    assert.match(texto, /600 999 888/);
    assert.match(texto, /turno de tarde/i);
  });

  await step("DESCARGAR LA AGENDA EN PDF, con la disponibilidad de este evento", async () => {
    const espera = page.waitForEvent("download");
    await page.locator("#cam-print-btn").click();
    const d = await espera;
    const destino = path.join(dir, "camareros.pdf");
    await d.saveAs(destino);
    const buf = fs.readFileSync(destino);
    assert.equal(buf.slice(0, 5).toString(), "%PDF-", "es un PDF de verdad");
    assert.ok(buf.toString("latin1").includes("%%EOF"), "el PDF está entero");
    assert.ok(contiene(buf, "Camareros"), "el título");
    assert.ok(contiene(buf, NOMBRE), "el nombre del camarero");
    assert.ok(contiene(buf, "Disponible"), "su disponibilidad para este evento");
  });

  await step("QUITAR UN CAMARERO DE LA AGENDA", async () => {
    page.once("dialog", (d) => d.accept());
    const f = fila(page, NOMBRE);
    await f.locator("button.cam-ed").click(); await wait(300);
    await page.locator(".inv-panel .p-quitar").click(); await wait(500);
    assert.equal(await fila(page, NOMBRE).count(), 0);
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
