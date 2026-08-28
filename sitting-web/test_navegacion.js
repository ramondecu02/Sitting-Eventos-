#!/usr/bin/env node
/**
 * test_navegacion.js — la barra de arriba: un sitio para elegir el evento y
 * un desplegable con las 8 pantallas del evento.
 *
 * Antes había tres sitios distintos para lo mismo: un selector "Sitting/Menú"
 * flotante, las pestañas del plano, las pestañas del menú y dos selectores de
 * evento (uno en cada vista). Esto comprueba que ahora hay UNO de cada cosa y
 * que las dos vistas van siempre por el mismo evento:
 *
 *  · las 8 secciones llevan a la pantalla correcta, saltando entre Sitting y
 *    Menú sin que haga falta saber que son dos cosas;
 *  · el desplegable dice siempre dónde estás, aunque hayas llegado por otro
 *    camino;
 *  · el evento es uno solo: se elige arriba y vale para el plano y el menú;
 *  · "+ Evento" crea un evento en blanco esté uno donde esté — incluido
 *    estando en el Menú, que es donde antes se quedaba con las cifras del
 *    evento anterior;
 *  · en móvil la barra sigue completa (los dos desplegables y Salir).
 *
 * Arranque: igual que los otros tests, ver la cabecera de test_smoke.js.
 */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE_URL = process.env.SITTING_TEST_URL || "http://localhost:3200";
const TEAM_PASSWORD = process.env.TEAM_PASSWORD;
if (!TEAM_PASSWORD) { console.error("Falta TEAM_PASSWORD en el entorno."); process.exit(1); }

let passed = 0, failed = 0;
async function step(name, fn) {
  try { await fn(); console.log("OK   " + name); passed++; }
  catch (err) { console.error("FAIL " + name); console.error("     " + (err.stack || err.message)); failed++; }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* qué vista está a la vista de verdad */
async function vistaVisible(page) {
  const vistas = { sitting: "#appSitting", menu: "#appMenu", inv: "#appInv" };
  const abiertas = [];
  for (const [nombre, sel] of Object.entries(vistas)) {
    if (await page.locator(sel).isVisible()) abiertas.push(nombre);
  }
  assert.deepEqual(abiertas.length, 1, "tiene que verse una vista y solo una, y se ven: " + abiertas);
  return abiertas[0];
}

const PLANO = `# Boda de prueba
@ 12/09/2026 · Les Moles Events

M1 | Presidencial | Los novios
Ana
Bruno

M2 | Redonda 10 | Familia
Carla
Diego
Elena
`;

/* las 8 secciones, con la vista a la que pertenece cada una */
const SECCIONES = [
  ["plan",     "sitting", "Plano de sala"],
  ["list",     "sitting", "Listado por mesas"],
  ["card",     "sitting", "Marcasitios"],
  ["m-sel",    "menu",    "Elegir platos"],
  ["m-prod",   "menu",    "Producción"],
  ["m-compra", "menu",    "Lista de la compra"],
  ["m-aler",   "menu",    "Alergias y sustituciones"],
  ["m-serv",   "menu",    "Check list de servicio"],
  ["m-card",   "menu",    "Menú para imprimir"],
  ["inv",      "inv",     "Todo el material"],
];

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  await step("login y un evento con plano", async () => {
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await page.locator("#ab-new").click(); await wait(300);
    await page.locator("#src").fill(PLANO);
    await page.locator("#src").dispatchEvent("input");
    await wait(600);
  });

  await step("la barra trae todas las secciones, agrupadas y con sus nombres", async () => {
    await page.locator("#appbar").waitFor({ state: "visible" });
    const textos = await page.locator("#ab-sec option").allInnerTexts();
    assert.deepEqual(textos, SECCIONES.map((s) => s[2]));
    // y agrupadas, para que se vea qué es del plano y qué del menú
    const grupos = await page.locator("#ab-sec optgroup").evaluateAll((g) => g.map((x) => x.label));
    assert.deepEqual(grupos, ["Plano de mesas", "Menú del evento", "Inventario"]);
  });

  await step("CADA SECCIÓN LLEVA A SU PANTALLA, saltando entre plano y menú", async () => {
    // en desorden a propósito: los saltos son lo que antes obligaba a pasar
    // por el selector "Sitting/Menú"
    for (const clave of ["m-serv", "list", "inv", "m-aler", "m-sel", "card", "inv", "m-card", "plan"]) {
      const esperada = SECCIONES.find((s) => s[0] === clave)[1];
      await page.locator("#ab-sec").selectOption(clave);
      await wait(450);
      assert.equal(await vistaVisible(page), esperada, `"${clave}" debería abrir ${esperada}`);
      assert.equal(await page.locator("#ab-sec").inputValue(), clave,
        `el desplegable tiene que seguir diciendo "${clave}"`);
    }
  });

  await step("el evento se elige una sola vez y vale para el plano y el menú", async () => {
    const nombre = await page.locator("#ab-ev option:checked").innerText();
    assert.match(nombre, /Boda de prueba/, "el desplegable de eventos dice el nombre y sus cifras");
    assert.match(nombre, /2 mesas/);
    await page.locator("#ab-sec").selectOption("m-sel");
    await wait(500);
    const mismo = await page.locator("#ab-ev option:checked").innerText();
    assert.equal(mismo, nombre, "en el Menú es el mismo evento, no otro selector aparte");
    assert.match(await page.locator("#mnu-stats").innerText(), /5\s*\n?\s*COMENSALES/i,
      "las cifras del Menú salen de ese plano");
  });

  await step("«+ Evento» crea uno en blanco también desde el Menú", async () => {
    assert.equal(await vistaVisible(page), "menu", "seguimos en el Menú");
    await page.locator("#ab-new").click();
    await wait(600);
    assert.match(await page.locator("#mnu-stats").innerText(), /^0/,
      "el evento nuevo arranca sin comensales, sin arrastrar los del anterior");
    const opciones = await page.locator("#ab-ev option").count();
    assert.ok(opciones >= 2, "los dos eventos están en la lista");
  });

  await step("volver al evento anterior lo devuelve entero, plano incluido", async () => {
    const idBoda = await page.locator("#ab-ev option").filter({ hasText: "Boda de prueba" })
      .first().getAttribute("value");
    await page.locator("#ab-ev").selectOption(idBoda);
    await wait(600);
    assert.match(await page.locator("#mnu-stats").innerText(), /5\s*\n?\s*COMENSALES/i);
    await page.locator("#ab-sec").selectOption("plan");
    await wait(400);
    assert.ok((await page.locator("#src").inputValue()).includes("Los novios"),
      "y el plano de ese evento sigue ahí");
  });

  await step("en móvil la barra sigue entera", async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p2 = await ctx.newPage();
    await p2.goto(BASE_URL + "/login");
    await p2.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      p2.waitForURL((u) => u.pathname === "/"),
      p2.locator('button[type="submit"]').click(),
    ]);
    await p2.locator("#appSitting").waitFor({ state: "visible" });
    for (const sel of ["#ab-ev", "#ab-sec", "#ab-new", ".ab-out button"]) {
      assert.equal(await p2.locator(sel).isVisible(), true, sel + " se ve en móvil");
    }
    // y la barra no se come la pantalla ni tapa el contenido
    const barra = await p2.locator("#appbar").boundingBox();
    assert.ok(barra.height <= 120, `la barra ocupa ${barra.height}px, demasiado`);
    const app = await p2.locator("#appSitting").boundingBox();
    assert.ok(app.y >= barra.y + barra.height - 1,
      "el contenido empieza por debajo de la barra, no debajo de ella");
    await ctx.close();
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
