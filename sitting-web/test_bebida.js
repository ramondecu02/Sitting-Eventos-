#!/usr/bin/env node
/**
 * test_bebida.js — la hoja de «Bebida del evento» del Menú.
 *
 * Lo que pidió Ramon: una sección dentro del Menú del evento donde la persona
 * que hace la previsión deje preparada, para el equipo de sala, la bebida que
 * hay que preparar. La PREVISIÓN ES AUTOMÁTICA: las cantidades salen de los
 * comensales del sitting con sus parámetros. Lo único que se elige a mano es
 * qué producto se sirve de cada uno.
 *
 * Los parámetros (de Ramon):
 *  - Agua: 1 botella cada 1,33 personas, contando a TODOS (adultos y niños),
 *    redondeando al alza.
 *  - Vino blanco: aperitivo (1 cada 6,667) + banquete (1 cada 4), sobre los
 *    ADULTOS, sumado y al alza.
 *  - Vino tinto: aperitivo (1 cada 10) + banquete (1 cada 6,667), sobre los
 *    adultos, sumado y A LA BAJA.
 *  - Cava: 1 cada 4 adultos (solo banquete), al alza.
 *  - Cava rosado: 1 cada 6,25 adultos (solo aperitivo), al alza.
 *  - Jamón: la cantidad NO se escribe, sale de lo marcado en el menú del
 *    evento (la escandalla), para no cruzar cifras.
 *
 * Con 65 adultos y 5 niños (70 comensales) las cuentas dan: agua 53, blanco
 * 26, tinto 16, cava 17, cava rosado 11. Esta prueba fija esos comensales a
 * mano (campos Adultos/Niños, sin plano) y comprueba justo esas cifras.
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

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1200 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  const cat = (k) => page.locator('.beb-cat[data-cat="' + k + '"]');
  const botellas = (k) => cat(k).locator(".beb-botellas").innerText();
  // el desglose de cada cálculo se quitó a propósito (Ramon: en la pantalla
  // solo el número, sin la fórmula). Que la cifra sea la correcta ya demuestra
  // que el parámetro y el redondeo son los suyos: p.ej. agua 53 solo sale si
  // cuenta a los 70 (con niños); blanco 26 solo si va sobre los 65 adultos.

  await step("login y un evento con 65 adultos y 5 niños (a mano, sin plano)", async () => {
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await page.locator("#ab-new").click(); await wait(400);
    await page.locator("#ab-sec").selectOption("m-sel");
    await page.locator("#appMenu").waitFor({ state: "visible" });
    await wait(300);
    await page.locator("#ev-adultos").fill("65"); await page.locator("#ev-adultos").dispatchEvent("input");
    await page.locator("#ev-ninos").fill("5"); await page.locator("#ev-ninos").dispatchEvent("input");
    await wait(300);
  });

  await step("«Bebida del evento» es una sección del Menú, con sus 6 categorías", async () => {
    const secciones = await page.locator("#ab-sec option").allInnerTexts();
    assert.ok(secciones.includes("Bebida del evento"));
    await page.locator("#ab-sec").selectOption("m-bebida");
    await wait(400);
    for (const k of ["agua", "blanco", "tinto", "cava", "cavaRosado", "jamon"]) {
      assert.equal(await cat(k).count(), 1, "está la categoría " + k);
    }
  });

  await step("AGUA: 1 cada 1,33 contando a TODOS (70) → 53, al alza", async () => {
    // 53 solo sale contando a los 70 (adultos + niños): con solo 65 daría 49
    assert.match(await botellas("agua"), /53 botellas/);
  });

  await step("VINO BLANCO: aperitivo (1/6,667) + banquete (1/4) sobre 65 adultos → 26, al alza", async () => {
    // 26 solo sale sobre 65 adultos: sobre los 70 comensales daría 28
    assert.match(await botellas("blanco"), /26 botellas/);
  });

  await step("VINO TINTO: aperitivo (1/10) + banquete (1/6,667) sobre 65 adultos → 16, A LA BAJA", async () => {
    // 16,25 hacia abajo = 16 (el tinto es el único a la baja: al alza daría 17)
    assert.match(await botellas("tinto"), /16 botellas/);
  });

  await step("CAVA: 1 cada 4 adultos (solo banquete) → 17, al alza", async () => {
    // 16,25 al alza = 17
    assert.match(await botellas("cava"), /17 botellas/);
  });

  await step("CAVA ROSADO: 1 cada 6,25 adultos (solo aperitivo) → 11, al alza", async () => {
    // 10,4 al alza = 11
    assert.match(await botellas("cavaRosado"), /11 botellas/);
  });

  await step("en la pantalla solo sale el número, no la fórmula de cada cálculo", async () => {
    assert.equal(await page.locator(".beb-qty").count(), 0, "las cantidades son automáticas, no hay inputs de número");
    // no se enseña el desglose del cálculo en las categorías con cifra
    assert.equal(await cat("agua").locator(".beb-desglose").count(), 0, "el agua, con su cifra, no lleva explicación");
    assert.equal(await cat("blanco").locator(".beb-desglose").count(), 0, "el vino blanco tampoco");
  });

  await step("cambiar los comensales recalcula solo (75 adultos → agua y vino suben)", async () => {
    await page.locator("#ev-adultos").fill("75"); await page.locator("#ev-adultos").dispatchEvent("input");
    await wait(400);
    // agua: (75+5)/1.33 = 60,15 -> 61 ; blanco: 75/6.667 + 75/4 = 11,25+18,75 = 30 -> 30
    assert.match(await botellas("agua"), /61 botellas/, "agua sube al subir los comensales");
    assert.match(await botellas("blanco"), /30 botellas/, "el vino blanco sube con los adultos");
    // volver a 65 para el resto de la prueba
    await page.locator("#ev-adultos").fill("65"); await page.locator("#ev-adultos").dispatchEvent("input");
    await wait(400);
    assert.match(await botellas("blanco"), /26 botellas/);
  });

  await step("SE ELIGE A MANO QUÉ PRODUCTO SE SIRVE, y sale en la hoja de sala", async () => {
    const setMarca = async (k, label) => {
      await cat(k).locator(".beb-prod").selectOption({ label });
      await cat(k).locator(".beb-prod").dispatchEvent("change");
      await wait(150);
    };
    await setMarca("blanco", "Lusco Albariño");
    await setMarca("cava", "Gramona Imperial");
    await wait(200);
    const hoja = await page.locator("#beb-sheet-wrap .frame").innerText();
    assert.match(hoja, /Vino blanco · Lusco Albariño[\s\S]{0,30}26 botellas/i);
    assert.match(hoja, /Cava · Gramona Imperial[\s\S]{0,30}17 botellas/i);
    assert.match(hoja, /Agua[\s\S]{0,20}53 botellas/i, "el agua sale aunque no tenga marca");
  });

  await step("EL JAMÓN sale del menú del evento, no de un parámetro por comensal", async () => {
    // sin jamón marcado, avisa (única categoría que muestra una nota, no una cifra)
    assert.match(await cat("jamon").locator(".beb-desglose").innerText(), /márcalo en «Elegir platos»/i);
    // marcarlo en el menú
    await page.locator("#ab-sec").selectOption("m-sel");
    await page.locator("#mnu-q").fill("Jamón Ibérico de Cebo");
    await wait(400);
    await page.locator(".mnu-row.sel", { hasText: "Jamón Ibérico de Cebo de Campo" }).first().locator(".mnu-chk").check();
    await wait(300);
    await page.locator("#ab-sec").selectOption("m-bebida");
    await wait(400);
    // 95 gr POR ADULTO (solo adultos, no los niños): 65 × 95 = 6175 gr = 6,17 kg
    // (truncado a 2 decimales, como cuenta Ramon a mano)
    assert.match(await botellas("jamon"), /6,17 kg/, "el jamón se escala solo por adultos, del menú");
    await cat("jamon").locator(".beb-prod").selectOption({ label: "Jamón Joselito 5J" });
    await cat("jamon").locator(".beb-prod").dispatchEvent("change");
    await wait(200);
    const hoja = await page.locator("#beb-sheet-wrap .frame").innerText();
    assert.match(hoja, /Jamón · Jamón Joselito 5J[\s\S]{0,30}(6,17 kg|del menú)/i);
  });

  await step("todo se guarda dentro del evento y sobrevive a recargar", async () => {
    await page.reload();
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await wait(700);
    await page.locator("#ab-sec").selectOption("m-bebida");
    await wait(400);
    assert.match(await botellas("blanco"), /26 botellas/, "la cantidad se recalcula igual");
    assert.equal(await cat("blanco").locator(".beb-prod").inputValue(), "Lusco Albariño", "la marca elegida sigue");
    assert.equal(await cat("jamon").locator(".beb-prod").inputValue(), "Jamón Joselito 5J");
  });

  await step("SE DESCARGA LA HOJA DE BEBIDAS EN PDF DE VERDAD", async () => {
    const dl = page.waitForEvent("download", { timeout: 15000 });
    await page.locator("#mnu-print-btn").dispatchEvent("click");
    const d = await dl;
    assert.match(d.suggestedFilename(), /\.pdf$/i, "es un PDF");
    assert.match(d.suggestedFilename(), /bebida/i, "y se llama con la hoja");
  });

  await step("cada evento tiene su bebida, sin mezclarse", async () => {
    await page.locator("#ab-new").click(); await wait(600);
    await page.locator("#ab-sec").selectOption("m-bebida");
    await wait(400);
    assert.equal(await cat("blanco").locator(".beb-prod").inputValue(), "",
      "el evento nuevo no arrastra la marca del anterior");
    // sin comensales todavía, no hay cifra: sale la nota, no un número
    assert.equal(await cat("blanco").locator(".beb-botellas").count(), 0);
    assert.match(await cat("blanco").locator(".beb-desglose").innerText(), /tenga comensales/i);
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
