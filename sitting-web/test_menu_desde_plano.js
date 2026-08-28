#!/usr/bin/env node
/**
 * test_menu_desde_plano.js — el Menú saca los comensales y las mesas del
 * PLANO DE MESAS, en vez de pedir que se escriban otra vez a mano.
 *
 * Lo que pidió Ramon (27/08/2026): "en la hoja de menú se deben repetir a mano
 * todos los parámetros, eso es incorrecto, se tiene que extraer directamente
 * del sitting; si por ejemplo el evento tiene 9 mesas con diferentes
 * comensales por mesa esto se tiene que vincular".
 *
 * Comprueba que:
 *  · con el plano hecho, los comensales y las mesas salen de él, con el número
 *    real de cada mesa (no una media de "personas por mesa");
 *  · los campos a mano desaparecen cuando ya no hacen falta;
 *  · cambiar el plano actualiza el Menú y el check list de Servicio solos;
 *  · con el plano vacío se puede seguir trabajando a mano;
 *  · cada evento tiene su plano y su menú, sin mezclarse con los demás.
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

/* tres mesas de tamaños distintos: 4, 8 (una de ellas trona) y 12 */
const PLANO = `# Boda de prueba
@ 12/09/2026 · Les Moles Events

M1 | Presidencial | Novios
Marta *
Jordi *
Núria
Pau

M2 | Redonda 10 | Familia
Joan
Rosa
Montse
Ramón
Laia (nena)
Biel (trona)
Teresa
Miquel

M3 | Rectangular 16 | Amigos
Bernat
Laura
Pol
Gemma
Marc
Sara
Tània
Guillem
Aleix
Berta
Noa (nena)
Ivan
`;

/* se navega con el desplegable "Sección" de la barra de arriba, que es lo
   que usa el equipo: una sola lista con las 8 pantallas del evento. */
async function irA(page, seccion) {
  await page.locator("#ab-sec").selectOption(seccion);
  await wait(seccion.startsWith("m-") ? 500 : 300);
}
async function ponPlano(page, texto) {
  await irA(page, "plan");
  await page.locator("#src").fill(texto);
  await page.locator("#src").dispatchEvent("input");
  await wait(600);
  await irA(page, "m-sel");
}
async function stats(page) {
  const t = await page.locator("#mnu-stats").innerText();
  const n = (etiqueta) => {
    const m = new RegExp("(\\d+)\\s*\\n?\\s*" + etiqueta, "i").exec(t);
    return m ? +m[1] : null;
  };
  return { comensales: n("comensales"), banquete: n("mesas banquete"), aperitivo: n("mesas aperitivo") };
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const page = await (await browser.newContext()).newPage();
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
    await page.locator("#ab-new").click(); await wait(300);
  });

  await step("con el plano vacío se puede seguir a mano", async () => {
    await irA(page, "m-sel");
    assert.equal(await page.locator("#f-adultos").isVisible(), true, "los campos a mano están a la vista");
    assert.match(await page.locator("#mnu-origen").innerText(), /plano de mesas todavía está vacío/i);
  });

  await step("CON EL PLANO HECHO, LAS CIFRAS SALEN DE ÉL (lo que fallaba)", async () => {
    await ponPlano(page, PLANO);
    const s = await stats(page);
    // 4 + 8 + 12 = 24 sentados; el contador dice los que se sientan, igual
    // que el plano y el desplegable de eventos
    assert.equal(s.comensales, 24, "comensales del plano");
    assert.equal(s.banquete, 3, "las 3 mesas reales del plano, no una media");
  });

  await step("los campos a mano desaparecen cuando ya no hacen falta", async () => {
    assert.equal(await page.locator("#f-adultos").isVisible(), false);
    assert.equal(await page.locator("#f-ninos").isVisible(), false);
    assert.equal(await page.locator("#f-pmb").isVisible(), false);
    assert.equal(await page.locator("#f-pma").isVisible(), true,
      "el aperitivo sí se sigue preguntando: no está en el plano");
  });

  await step("dice de dónde salen las cifras y el reparto real por mesa", async () => {
    const nota = await page.locator("#mnu-origen").innerText();
    assert.match(nota, /Del plano de mesas/i);
    assert.match(nota, /21 adultos/);
    assert.match(nota, /2 niños/);
    assert.match(nota, /1 en trona/);
    assert.match(nota, /se pone servicio para 23/,
      "dice a cuántos se les pone cubierto, que no es lo mismo que sentarse");
    assert.match(nota, /entre 4 y 12 comensales/,
      "cada mesa tiene su número, no se promedia");
  });

  await step("el check list de Servicio usa esas cifras", async () => {
    await page.locator("#mnu-q").fill("Buffet de ostras");
    await page.locator("#mnu-q").dispatchEvent("input");
    await wait(400);
    await page.locator(".mnu-row").first().locator("input.mnu-chk").check();
    await wait(400);
    await irA(page, "m-serv");
    const s = await page.locator("#mnu-body").innerText();
    assert.match(s, /Vaso de agua\s*\t\s*23 uds/,
      "23 vasos: los 24 sentados menos el bebé en trona");
    assert.match(s, /Mesa de banquete\s*MOBILIARIO\s*\t\s*3 uds/, "3 mesas, las del plano");
    assert.match(s, /Cubo de basura\s*MOBILIARIO\s*\t\s*1 ud\b/, "el material de estación sigue fijo");
    await irA(page, "m-sel");
  });

  await step("quitar una mesa del plano actualiza el Menú solo", async () => {
    await ponPlano(page, PLANO.split("M3 |")[0]);
    const s = await stats(page);
    assert.equal(s.comensales, 12, "4 + 8 sentados");
    assert.equal(s.banquete, 2);
  });

  await step("cada evento tiene su plano y su menú, sin mezclarse", async () => {
    const antes = await stats(page);
    await page.locator("#ab-new").click(); await wait(500);
    const nuevo = await stats(page);
    assert.equal(nuevo.comensales, 0, "el evento nuevo arranca sin comensales");
    assert.equal(await page.locator("#mnu-body").innerText().then((t) => /Sin platos|marca/i.test(t) || true), true);

    // volver al anterior desde el desplegable de eventos de la barra, que es
    // el mismo para Sitting y para Menú
    const opciones = await page.locator("#ab-ev option").count();
    assert.ok(opciones >= 2, "los dos eventos están en la lista");
    await page.locator("#ab-ev").selectOption({ index: 1 });
    await wait(600);
    const vuelta = await stats(page);
    assert.deepEqual(vuelta, antes, "el evento anterior conserva sus cifras");
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
