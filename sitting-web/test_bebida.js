#!/usr/bin/env node
/**
 * test_bebida.js — la hoja de «Bebida del evento» del Menú.
 *
 * Lo que pidió Ramon: una sección dentro del Menú del evento donde la persona
 * que hace la previsión pueda dejar preparada, para el equipo de sala, la
 * bebida que hay que preparar: vino blanco, vino tinto, cava, cava rosado y
 * jamón. En esta primera versión es manual: se elige el producto de un
 * desplegable (con los listados que él pasó) y se escribe la cantidad a mano;
 * y se descarga una hoja en PDF para sala.
 *
 * Con una excepción importante que él mismo marcó: el JAMÓN no se escribe a
 * mano. La mayoría de bodas llevan jamón como aperitivo del menú, que ya se
 * calcula al marcarlo en «Elegir platos» — así que la cantidad de jamón se
 * coge directamente de ahí, para que no haya dos cifras distintas (la de aquí
 * y la de la escandalla). Esta prueba comprueba justo eso.
 *
 * Y queda preparado para la fase siguiente: que el vino y el cava se calculen
 * solos a partir de los comensales adultos del sitting. Eso todavía no se
 * hace (faltan parámetros), así que aquí no se prueba.
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

/* un plano con 4 adultos, para que el jamón del menú tenga a quién escalar */
const PLANO = `# Boda de bebida
@ 20/09/2026 · Les Moles Events

M1 | Redonda 10 | Los novios
Marta Vidal *
Jordi Ferré *
Núria Vidal
Pau Ferré
`;

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  const cat = (k) => page.locator('.beb-cat[data-cat="' + k + '"]');

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

  await step("«Bebida del evento» es una sección del Menú", async () => {
    const secciones = await page.locator("#ab-sec option").allInnerTexts();
    assert.ok(secciones.includes("Bebida del evento"), "sale en el desplegable de secciones");
    await page.locator("#ab-sec").selectOption("m-bebida");
    await page.locator("#appMenu").waitFor({ state: "visible" });
    await wait(400);
    assert.equal(await page.locator(".beb-edit").count(), 1, "abre el editor de bebidas");
  });

  await step("están las cinco categorías que pidió Ramon", async () => {
    for (const k of ["blanco", "tinto", "cava", "cavaRosado", "jamon"]) {
      assert.equal(await cat(k).count(), 1, "está la categoría " + k);
    }
  });

  await step("cada desplegable trae su listado de productos, no otro", async () => {
    const opc = async (k) => (await cat(k).locator(".beb-prod").first().locator("option").allInnerTexts())
      .filter((t) => t !== "Elegir…");
    assert.deepEqual(await opc("blanco"),
      ["Les Moles Blanc", "Carmen's 2022", "El perro verde", "Blanc de Marges", "Lusco Albariño", "El Fanio Albet i Noya"]);
    assert.deepEqual(await opc("cavaRosado"),
      ["Cava Oriol Rossell Brut rosado", "Raventós de Nit"]);
    const jam = await opc("jamon");
    assert.ok(jam.includes("Jamón Joselito 5J") && jam.length === 3, "los tres jamones");
  });

  await step("SE ELIGE EL PRODUCTO Y SE ESCRIBE LA CANTIDAD A MANO", async () => {
    await cat("blanco").locator(".beb-prod").first().selectOption({ label: "Lusco Albariño" });
    const q = cat("blanco").locator(".beb-qty").first();
    await q.fill("18"); await q.dispatchEvent("change");
    await wait(300);
    const hoja = await page.locator("#beb-sheet-wrap .frame").innerText();
    assert.match(hoja, /Vino blanco/i);
    assert.match(hoja, /Lusco Albariño[\s\S]{0,30}18 botellas/i, "sale en la hoja de sala con su cantidad");
  });

  await step("SE PUEDE AÑADIR MÁS DE UN PRODUCTO A LA MISMA CATEGORÍA", async () => {
    await cat("blanco").locator(".beb-add").click();
    await wait(200);
    assert.equal(await cat("blanco").locator(".beb-row").count(), 2, "hay una segunda fila de vino blanco");
    await cat("blanco").locator(".beb-prod").nth(1).selectOption({ label: "Les Moles Blanc" });
    const q2 = cat("blanco").locator(".beb-qty").nth(1);
    await q2.fill("6"); await q2.dispatchEvent("change");
    await wait(300);
    const hoja = await page.locator("#beb-sheet-wrap .frame").innerText();
    assert.match(hoja, /Lusco Albariño[\s\S]{0,30}18 botellas/i, "el primero sigue");
    assert.match(hoja, /Les Moles Blanc[\s\S]{0,30}6 botellas/i, "y el segundo también");
  });

  await step("quitar un producto lo saca de la hoja, sin tocar el otro", async () => {
    await cat("blanco").locator(".beb-row").nth(1).locator(".beb-rm").click();
    await wait(300);
    assert.equal(await cat("blanco").locator(".beb-row").count(), 1, "vuelve a haber una sola fila");
    const hoja = await page.locator("#beb-sheet-wrap .frame").innerText();
    assert.match(hoja, /Lusco Albariño/i, "queda el primero");
    assert.ok(!/Les Moles Blanc/i.test(hoja), "y se fue el segundo");
  });

  await step("EL JAMÓN NO SE ESCRIBE A MANO: mientras no se marque en el menú, avisa", async () => {
    // sin marcar jamón en «Elegir platos», la categoría no tiene cantidad
    const nota = await cat("jamon").locator(".mnu-origen").innerText();
    assert.match(nota, /Marca el jamón en/i, "explica que hay que marcarlo en el menú");
    assert.equal(await cat("jamon").locator(".beb-qty").count(), 0, "no hay ningún campo de cantidad de jamón a mano");
  });

  await step("AL MARCAR EL JAMÓN EN EL MENÚ, SU CANTIDAD SALE SOLA (de la escandalla)", async () => {
    await page.locator("#ab-sec").selectOption("m-sel");
    await page.locator("#appMenu").waitFor({ state: "visible" });
    await page.locator("#mnu-q").fill("Jamón Ibérico de Cebo");
    await wait(400);
    await page.locator(".mnu-row.sel", { hasText: "Jamón Ibérico de Cebo de Campo" }).first().locator(".mnu-chk").check();
    await wait(300);
    await page.locator("#ab-sec").selectOption("m-bebida");
    await wait(400);
    // 95 gr por comensal × 4 comensales = 380 gr = 0,38 kg
    const nota = await cat("jamon").locator(".mnu-origen").innerText();
    assert.match(nota, /Del menú del evento/i);
    assert.match(nota, /0,38 kg|380 gr/i, "la cantidad sale escalada a los comensales, del menú");
    // y elegir la marca no cambia esa cantidad
    await cat("jamon").locator(".beb-prod").first().selectOption({ label: "Jamón Joselito 5J" });
    await cat("jamon").locator(".beb-prod").first().dispatchEvent("change");
    await wait(300);
    const hoja = await page.locator("#beb-sheet-wrap .frame").innerText();
    assert.match(hoja, /Jamón Joselito 5J[\s\S]{0,40}(0,38 kg|380 gr|del menú)/i,
      "en la hoja sale el jamón elegido con la cantidad del menú, no una escrita a mano");
  });

  await step("cambiar los comensales del plano recalcula el jamón solo", async () => {
    await page.locator("#ab-sec").selectOption("plan");
    await wait(300);
    // añadir un quinto adulto al plano
    await page.locator("#src").fill(PLANO + "Eva Prats\n");
    await page.locator("#src").dispatchEvent("input");
    await wait(600);
    await page.locator("#ab-sec").selectOption("m-bebida");
    await wait(400);
    // 95 gr × 5 = 475 gr = 0,48 kg
    const nota = await cat("jamon").locator(".mnu-origen").innerText();
    assert.match(nota, /0,48 kg|475 gr/i, "al crecer el plano, el jamón crece solo — no hay que tocar nada aquí");
  });

  await step("todo esto se guarda dentro del evento y sobrevive a recargar", async () => {
    await page.reload();
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await wait(700);
    await page.locator("#ab-sec").selectOption("m-bebida");
    await wait(400);
    assert.equal(await cat("blanco").locator(".beb-prod").first().inputValue(), "Lusco Albariño");
    assert.equal(await cat("blanco").locator(".beb-qty").first().inputValue(), "18");
    assert.equal(await cat("jamon").locator(".beb-prod").first().inputValue(), "Jamón Joselito 5J");
  });

  await step("SE DESCARGA UNA HOJA DE BEBIDAS EN PDF DE VERDAD", async () => {
    const dl = page.waitForEvent("download", { timeout: 15000 });
    // click real desde el propio DOM (evita la carrera del repintado de la hoja)
    await page.locator("#mnu-print-btn").dispatchEvent("click");
    const d = await dl;
    const nombre = d.suggestedFilename();
    assert.ok(/\.pdf$/i.test(nombre), "el archivo es un PDF: " + nombre);
    assert.match(nombre, /bebida/i, "y se llama con la hoja: " + nombre);
  });

  await step("cada evento tiene su bebida, sin mezclarse", async () => {
    await page.locator("#ab-new").click(); await wait(600);
    await page.locator("#ab-sec").selectOption("m-bebida");
    await wait(400);
    assert.equal(await cat("blanco").locator(".beb-prod").first().inputValue(), "",
      "el evento nuevo arranca sin ninguna bebida, sin arrastrar la del anterior");
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
