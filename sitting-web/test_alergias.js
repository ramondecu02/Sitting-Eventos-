#!/usr/bin/env node
/**
 * test_alergias.js — la hoja de Alergias del Menú.
 *
 * Lo que pidió Ramon: ver quién tiene alergia, con su nombre y su alergia,
 * poder escribirle a mano el plato sustitutivo, y que eso se refleje «tanto en
 * el sitting como en la lista de mesas».
 *
 * Las alergias no se vuelven a escribir en ningún sitio: ya están en el plano,
 * entre paréntesis detrás del nombre. Y el plato sustitutivo tampoco se guarda
 * en una lista aparte — se guarda DENTRO del plano, como una etiqueta más del
 * comensal. Por eso aparece solo en el plano de sala y en el listado por mesas:
 * es el mismo dato, no una copia que haya que mantener sincronizada. Esta
 * prueba comprueba justo eso, que es lo que evita que un día el plano y la
 * cocina digan cosas distintas.
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
const filaDe = (page, nombre) => page.locator(".aler-row").filter({ hasText: nombre });

const PLANO = `# Boda con alergias
@ 12/09/2026 · Les Moles Events

M1 | Presidencial | Los novios
Marta Vidal *
Jordi Ferré *
Carme Roig (alérgica: marisco)
Enric Roig

M2 | Redonda 10 | Familia
Rosa Fabra (al·lèrgia: marisc)
Montse Serra (intolerancia lactosa)
Ramón Gil
Laia Gil (niña)
Biel Gil (trona)
Pol Sans (alergia: frutos secos)
`;

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 950 } })).newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  await step("login y un plano con alergias", async () => {
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

  await step("«Alergias y sustituciones» es una sección del Menú", async () => {
    const secciones = await page.locator("#ab-sec option").allInnerTexts();
    assert.ok(secciones.includes("Alergias y sustituciones"));
    await page.locator("#ab-sec").selectOption("m-aler");
    await page.locator("#appMenu").waitFor({ state: "visible" });
    await wait(500);
  });

  await step("SALEN LOS COMENSALES CON ALERGIA, CON SU NOMBRE Y SU ALERGIA", async () => {
    assert.equal(await page.locator(".aler-row").count(), 4,
      "los cuatro del plano: dos de marisco, una de lactosa y uno de frutos secos");
    const texto = await page.locator("#mnu-body").innerText();
    ["Carme Roig", "Rosa Fabra", "Montse Serra", "Pol Sans"].forEach((n) => {
      assert.ok(texto.includes(n), "sale " + n);
    });
    assert.ok(!texto.includes("Enric Roig"), "quien no tiene alergia no sale");
    assert.match(await filaDe(page, "Carme Roig").innerText(), /MARISCO/i, "con su alergia al lado");
    assert.match(await filaDe(page, "Pol Sans").innerText(), /FRUTOS SECOS/i);
  });

  await step("van agrupados por mesa, con el número y el nombre de la mesa", async () => {
    const texto = await page.locator("#mnu-body").innerText();
    assert.match(texto, /Mesa 1 · Los novios/);
    assert.match(texto, /Mesa 2 · Familia/);
  });

  await step("dice cuántos faltan por decidir", async () => {
    // .mnu-origen sale dos veces en esta pantalla: la de arriba (por comensal)
    // y la del recuadro nuevo de aperitivos adaptados, más abajo — .first() coge
    // la de comensales
    assert.match(await page.locator("#mnu-body .mnu-origen").first().innerText(),
      /4 comensales con alergia o intolerancia.*0 con plato decidido.*4 por decidir/s);
  });

  await step("SE ESCRIBE EL PLATO SUSTITUTIVO A MANO", async () => {
    const inp = filaDe(page, "Carme Roig").locator("input");
    await inp.fill("Lubina a la plancha");
    await inp.press("Enter");
    await wait(600);
    assert.equal(await filaDe(page, "Carme Roig").locator("input").inputValue(), "Lubina a la plancha");
    assert.match(await page.locator("#mnu-body .mnu-origen").first().innerText(), /1 con plato decidido.*3 por decidir/s);
  });

  await step("EL PLATO SALE EN EL LISTADO POR MESAS", async () => {
    await page.locator("#ab-sec").selectOption("list");
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await wait(700);
    const listado = await page.locator("#sheets").innerText();
    assert.match(listado, /Lubina a la plancha/i, "junto a su nombre en la mesa");
    // y en el recuadro de alergias del pie, que es lo que se lleva al pase
    const aviso = await page.locator("#sheets .alerts").innerText();
    assert.match(aviso, /Carme Roig/);
    assert.match(aviso, /Lubina a la plancha/i,
      "el recuadro de alergias dice también qué se le sirve, no solo de qué es alérgica");
  });

  await step("y queda guardado dentro del plano, no en una lista aparte", async () => {
    await page.locator("#ab-sec").selectOption("plan");
    await wait(500);
    const txt = await page.locator("#src").inputValue();
    assert.match(txt, /Carme Roig \(alérgica: marisco, Menú: Lubina a la plancha\)/,
      "es una etiqueta más del comensal en el texto del plano");
  });

  await step("EL PLATO SALE TAMBIÉN EN EL PLANO DE SALA", async () => {
    await wait(500);
    // en el plano los textos van recortados para que quepan junto a la silla,
    // igual que ya se recortaban las alergias: el nombre entero está en el
    // listado y en la hoja de alergias
    const textos = await page.evaluate(() =>
      [].map.call(document.querySelectorAll("#room text"), (t) => t.textContent));
    assert.ok(textos.some((t) => /^LUBINA A LA/i.test(t)),
      "el plano dibujado lleva el plato junto al comensal: " + JSON.stringify(textos));
    assert.ok(textos.some((t) => /^ALÉRGICA: MARI/i.test(t)),
      "y sigue diciendo la alergia, no la sustituye");
  });

  await step("borrar el plato lo quita de todas partes", async () => {
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    const inp = filaDe(page, "Carme Roig").locator("input");
    await inp.fill("");
    await inp.press("Enter");
    await wait(600);
    assert.equal(await filaDe(page, "Carme Roig").locator("input").inputValue(), "");
    await page.locator("#ab-sec").selectOption("plan"); await wait(500);
    const txt = await page.locator("#src").inputValue();
    assert.match(txt, /Carme Roig \(alérgica: marisco\)/, "la alergia se queda, el plato se va");
    assert.ok(!/Lubina/i.test(txt), "y no queda rastro del plato");
  });

  await step("cambiar el plato de un comensal no toca a los demás", async () => {
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    for (const [quien, plato] of [["Rosa Fabra", "Cabrito con setas"], ["Pol Sans", "Arroz de pato"]]) {
      const inp = filaDe(page, quien).locator("input");
      await inp.fill(plato); await inp.press("Enter"); await wait(500);
    }
    assert.equal(await filaDe(page, "Rosa Fabra").locator("input").inputValue(), "Cabrito con setas");
    assert.equal(await filaDe(page, "Pol Sans").locator("input").inputValue(), "Arroz de pato");
    assert.equal(await filaDe(page, "Montse Serra").locator("input").inputValue(), "",
      "a quien no se le ha puesto nada sigue sin nada");
  });

  await step("hay un recuadro aparte para los aperitivos adaptados del evento, no por comensal", async () => {
    const caja = page.locator("#aler-aperis-ta");
    await caja.waitFor({ state: "visible" });
    assert.equal(await caja.inputValue(), "", "empieza vacío");
    // va debajo del recuadro de cada comensal, no mezclado con él
    const debajo = await page.evaluate(() => {
      const ta = document.querySelector("#aler-aperis-ta");
      const mesas = document.querySelector(".aler-mesa");
      return !!(ta && mesas) && !!(mesas.compareDocumentPosition(ta) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    assert.ok(debajo, "el recuadro de aperitivos va después del de los comensales, no mezclado");
  });

  await step("SE ESCRIBE A MANO Y SE GUARDA, sin tocar los platos por comensal", async () => {
    const caja = page.locator("#aler-aperis-ta");
    await caja.fill("Croquetas de jamón — versión sin gluten con base de maicena");
    await caja.blur();
    await wait(600);
    // se va a otra vista y se vuelve, para comprobar que quedó guardado de verdad
    await page.locator("#ab-sec").selectOption("m-serv"); await wait(500);
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(500);
    assert.equal(await page.locator("#aler-aperis-ta").inputValue(),
      "Croquetas de jamón — versión sin gluten con base de maicena", "sigue ahí al volver a la pantalla");
    assert.equal(await filaDe(page, "Rosa Fabra").locator("input").inputValue(), "Cabrito con setas",
      "y no ha tocado los platos sustitutivos por comensal");
  });

  await step("no hace falta tener alergias apuntadas para poder rellenarlo, y cada evento tiene el suyo", async () => {
    await page.locator("#ab-new").click(); await wait(700);
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    assert.match(await page.locator("#mnu-body").innerText(), /Ningún comensal del plano tiene alergias/i,
      "el aviso de comensales sigue saliendo cuando no hay ninguno");
    const caja = page.locator("#aler-aperis-ta");
    await caja.waitFor({ state: "visible" });
    assert.equal(await caja.inputValue(), "", "el evento nuevo no arrastra el texto del anterior");
    await caja.fill("Bombón de foie — sin frutos secos");
    await caja.blur(); await wait(600);
    await page.locator("#ab-sec").selectOption("plan"); await wait(500);
    const txt = await page.locator("#src").inputValue();
    assert.ok(!txt.includes("Bombón de foie"),
      "los aperitivos adaptados no se guardan en el texto del plano — en el Sitting no hace falta de momento");
  });

  await step("cada evento tiene sus alergias, sin mezclarse", async () => {
    await page.locator("#ab-new").click(); await wait(700);
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    assert.equal(await page.locator(".aler-row").count(), 0, "el evento nuevo no arrastra nada");
    assert.match(await page.locator("#mnu-body").innerText(), /Ningún comensal del plano tiene alergias/i,
      "y explica dónde se escriben");
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
