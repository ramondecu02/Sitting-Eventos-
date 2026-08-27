#!/usr/bin/env node
/**
 * test_servicio_mobiliario.js — el check list de Servicio ahora también dice
 * qué hace falta para MONTAR cada estación, no solo qué vajilla lleva cada
 * plato.
 *
 * Comprueba justo la distinción que pidió Ramon (27/08/2026):
 *  · el material de la estación es FIJO — 1 cubo, 1 abreostras, 2 boles… es
 *    lo mismo se monte para 30 o para 300 comensales;
 *  · la comida de esa misma estación sí va por comensal (el plato y el
 *    cubierto del buffet de ostras salen ×70 con 70 comensales);
 *  · la cubertería de los segundos cambia sola según el menú: dos cuchillos
 *    y dos tenedores si hay carne Y pescado, uno de cada más cuchara grande
 *    si solo hay un segundo plato;
 *  · las estaciones que todavía no están rellenas en el Excel de parámetros
 *    se nombran una a una en vez de callarse.
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

/* busca un plato por su nombre y lo marca */
async function marcar(page, texto) {
  await page.locator("#mnu-q").fill(texto);
  await page.locator("#mnu-q").dispatchEvent("input");
  await wait(350);
  const n = await page.locator(".mnu-row").count();
  for (let i = 0; i < n; i++) {
    const t = await page.locator(".mnu-row").nth(i).innerText();
    if (t.toLowerCase().includes(texto.toLowerCase())) {
      await page.locator(".mnu-row").nth(i).locator("input.mnu-chk").check();
      await wait(250);
      return true;
    }
  }
  return false;
}
/* texto de la hoja de Servicio, volviendo después a Selección */
async function hojaServicio(page) {
  await page.locator('#mnu-tabs [data-v="serv"]').click();
  await wait(500);
  const t = await page.locator("#mnu-body").innerText();
  await page.locator('#mnu-tabs [data-v="sel"]').click();
  await wait(300);
  return t;
}
/* cantidad de una línea del check list ("Bayeta  1 ud" -> 1) */
function cantidad(hoja, articulo) {
  const re = new RegExp("^☐?" + articulo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
                        "(?:\\s+MOBILIARIO)?\\s*\\t\\s*([\\d.,]+)\\s*uds?\\s*$", "mi");
  const m = re.exec(hoja);
  return m ? parseFloat(m[1].replace(/\./g, "").replace(",", ".")) : null;
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const page = await (await browser.newContext()).newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  await step("login y evento nuevo de 70 comensales, 10 por mesa", async () => {
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await page.locator("#new").click(); await wait(300);
    await page.locator("#lnch-menu").click(); await wait(400);
    for (const [id, v] of [["ev-adultos", "70"], ["ev-ninos", "0"], ["ev-pmb", "10"]]) {
      await page.locator("#" + id).fill(v);
      await page.locator("#" + id).dispatchEvent("input");
    }
    await wait(300);
    assert.match(await page.locator("#mnu-stats").innerText(), /70/);
  });

  let hoja;

  await step("marcar el buffet de ostras", async () => {
    assert.ok(await marcar(page, "Buffet de ostras"), "se encuentra el plato");
    hoja = await hojaServicio(page);
    assert.match(hoja, /Mobiliario y utensilios de estación/);
    assert.match(hoja, /Buffet de ostras/);
  });

  await step("EL MATERIAL DE LA ESTACIÓN ES FIJO, no se multiplica por comensales", async () => {
    assert.equal(cantidad(hoja, "Cubo de basura"), 1, "1 cubo, no 70");
    assert.equal(cantidad(hoja, "Tabla azul pequeña"), 1);
    assert.equal(cantidad(hoja, "Abreostras"), 1);
    assert.equal(cantidad(hoja, "Bol inox con agua y sal"), 2, "2 boles, no 140");
    assert.equal(cantidad(hoja, "Bayeta"), 1);
    assert.equal(cantidad(hoja, "Trapo blanco"), 1);
    assert.match(hoja, /UNA VEZ POR EVENTO/i);
  });

  await step("el hielo picado, que no lleva cantidad en el Excel, no se inventa", async () => {
    assert.match(hoja, /Hielo picado\s*\ta ojo/i);
  });

  await step("la comida de esa misma estación SÍ va por comensal", async () => {
    assert.equal(cantidad(hoja, "PLATO RECTANGULAR ONDULADO"), 70);
    assert.equal(cantidad(hoja, "TENEDOR PEQUEÑO"), 70);
  });

  await step("el montaje de mesa va por mesa de banquete (70/10 = 7)", async () => {
    assert.equal(cantidad(hoja, "Mesa de banquete"), 7);
    assert.equal(cantidad(hoja, "Mantel azul"), 7);
    assert.equal(cantidad(hoja, "Cubremantel"), 7);
    assert.equal(cantidad(hoja, "Mantel blanco"), 7);
  });

  await step("el puesto de cada comensal va por comensal", async () => {
    ["Silla", "Copa de vino blanco", "Copa de cava", "Copa de vino tinto",
     "Vaso de agua", "Cucharilla pequeña"].forEach((a) => {
      assert.equal(cantidad(hoja, a), 70, a);
    });
  });

  await step("con un solo segundo plato: 1 cuchillo, 1 tenedor y 1 cuchara grande", async () => {
    assert.equal(cantidad(hoja, "Cuchillo"), 70);
    assert.equal(cantidad(hoja, "Tenedor"), 70);
    assert.equal(cantidad(hoja, "Cuchara grande"), 70);
    assert.match(hoja, /solo hay un segundo plato/i);
  });

  await step("con carne Y pescado: dos cuchillos y dos tenedores, y sin cuchara grande", async () => {
    assert.ok(await marcar(page, "Cabrito con setas"), "plato de carne");
    assert.ok(await marcar(page, "Lubina"), "plato de pescado");
    hoja = await hojaServicio(page);
    assert.equal(cantidad(hoja, "Cuchillo"), 140);
    assert.equal(cantidad(hoja, "Tenedor"), 140);
    assert.equal(cantidad(hoja, "Cuchara grande"), null, "la cuchara grande desaparece");
    assert.match(hoja, /hay carne y pescado/i);
  });

  await step("el material de la estación no cambia al crecer el menú", async () => {
    assert.equal(cantidad(hoja, "Cubo de basura"), 1);
    assert.equal(cantidad(hoja, "Bol inox con agua y sal"), 2);
  });

  await step("las estaciones sin datos se nombran, no se callan", async () => {
    assert.ok(!/Todavía sin datos/.test(hoja), "aún no falta ninguna");
    assert.ok(await marcar(page, "Croquetas de jamón"));
    hoja = await hojaServicio(page);
    assert.match(hoja, /Todavía sin datos de mobiliario propio:[^\n]*CROQUETAS/);
  });

  await step("cambiar los comensales recalcula solo lo que va por comensal", async () => {
    await page.locator("#ev-adultos").fill("300");
    await page.locator("#ev-adultos").dispatchEvent("input");
    await wait(400);
    hoja = await hojaServicio(page);
    assert.equal(cantidad(hoja, "Vaso de agua"), 300);
    assert.equal(cantidad(hoja, "Mesa de banquete"), 30);
    assert.equal(cantidad(hoja, "Cubo de basura"), 1, "la estación sigue siendo una");
    assert.equal(cantidad(hoja, "Bol inox con agua y sal"), 2);
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
