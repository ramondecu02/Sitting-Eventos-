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
 * Los comensales y las mesas de banquete salen del PLANO de mesas (se escribe
 * en Sitting y el Menú lo lee), no de escribirlos otra vez a mano. Se navega
 * con el desplegable "Sección" de la barra de arriba, que es como se mueve
 * hoy por la app.
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

/* plano de mesas en texto: N mesas de M comensales cada una. Los comensales
   del check list salen de aquí, no de escribirlos a mano en el Menú. */
function plano(mesas, porMesa) {
  let t = "# Prueba de mobiliario\n@ Les Moles Events\n";   // el subtítulo va con @, si no cuenta como invitado
  let n = 0;
  for (let m = 1; m <= mesas; m++) {
    t += `\nMESA ${m} | Redonda ${porMesa} | Mesa ${m}\n`;
    for (let i = 0; i < porMesa; i++) t += `Invitado ${++n}\n`;
  }
  return t;
}
/* escribe el plano en Sitting y vuelve al Menú.
   El plano se pone con evaluate (value + evento input) en vez de .fill(): con
   planos muy grandes (300 comensales) la comprobación de "estabilidad" de
   Playwright sobre el textarea puede colgarse aunque el campo es perfectamente
   editable — así que se rellena como haría un pegado real, que es justo lo que
   la app espera. No cambia lo que se prueba (las cifras del Servicio). */
async function ponerPlano(page, mesas, porMesa) {
  await page.locator("#ab-sec").selectOption("plan");
  await page.locator("#appSitting").waitFor({ state: "visible" });
  await page.evaluate((txt) => {
    const s = document.getElementById("src");
    s.value = txt;
    s.dispatchEvent(new Event("input", { bubbles: true }));
  }, plano(mesas, porMesa));
  await wait(700);
  await page.locator("#ab-sec").selectOption("m-sel");
  await page.locator("#appMenu").waitFor({ state: "visible" });
  await wait(400);
}

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
  await page.locator("#ab-sec").selectOption("m-serv");
  await wait(500);
  const t = await page.locator("#mnu-body").innerText();
  await page.locator("#ab-sec").selectOption("m-sel");
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

  await step("login y evento nuevo con 7 mesas de 10 en el plano (70 comensales)", async () => {
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await page.locator("#ab-new").click(); await wait(300);
    await ponerPlano(page, 7, 10);
    // los comensales y las mesas de banquete salen del PLANO, no de escribirlos
    assert.match(await page.locator("#mnu-stats").innerText(), /70/);
    const manuales = await page.locator("#f-adultos").isVisible();
    assert.equal(manuales, false, "con plano hecho, los campos a mano sobran");
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

  await step("cambiar el PLANO recalcula solo lo que va por comensal", async () => {
    await ponerPlano(page, 30, 10);   // 30 mesas de 10 = 300 comensales
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
