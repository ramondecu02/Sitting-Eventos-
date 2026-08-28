#!/usr/bin/env node
/**
 * test_inventario.js — el apartado INVENTARIO dentro de la app.
 *
 * Lo que se comprueba no es que "salga una lista", sino que la lista es **la
 * del Excel de Ramon**: `INVENTARIO LES MOLES.xlsx`, con sus 5 hojas, sus 17
 * categorías y sus 123 líneas, en su orden y con sus nombres. Ramon lo pidió
 * así de claro: «no quiero que inventes ni crees una estructura de categorías
 * nueva». Si alguien reorganiza el inventario "para que quede mejor", estas
 * comprobaciones se ponen rojas.
 *
 * También comprueba lo que el Excel tiene de raro y hay que respetar: nombres
 * repetidos que solo se distinguen por las medidas, un nombre que vale para
 * tres filas (TRONAS BEBÉ), líneas que el Excel deja sin cantidad, y una que
 * pone «++» en vez de un número.
 *
 * Y que las correcciones de cantidad se guardan, se comparten con el equipo y
 * no borran lo que dice el Excel.
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

/* las hojas del Excel, en su orden y con su nombre */
const HOJAS = ["MESAS", "COCINA CATERING", "VASOS Y CUBERTERIA", "DECORACIÓN", "SONIDO Y LUZ"];

/* las categorías de cada hoja, en su orden. null = el bloque que en el Excel
   va sin cabecera (los altavoces y micrófonos de SONIDO Y LUZ) */
const CATEGORIAS = {
  "MESAS": ["MESAS Y SILLAS BANQUETES", "MANTELERIA", "MESAS Y SILLAS APERITIVO", "TABLEROS", "OTROS"],
  "COCINA CATERING": ["MOBILIARIO COCINA", "MATERIAL COCINA", "MATERIAL CATERING BEBIDA"],
  "VASOS Y CUBERTERIA": ["COPAS", "VASOS", "BANDEJAS", "RACKS"],
  "DECORACIÓN": ["MOBILIARI JARDÍN", "MOBILIARI EVENTS", "FIGURAS", "SITTINGS"],
  "SONIDO Y LUZ": ["CABLE DE LUZ", null],
};

async function login(browser) {
  const page = await (await browser.newContext()).newPage();
  await page.goto(BASE_URL + "/login");
  await page.locator("#password").fill(TEAM_PASSWORD);
  await Promise.all([
    page.waitForURL((u) => u.pathname === "/"),
    page.locator('button[type="submit"]').click(),
  ]);
  await page.locator("#appSitting").waitFor({ state: "visible" });
  return page;
}
async function irAlInventario(page) {
  await page.locator("#ab-sec").selectOption("inv");
  await page.locator("#appInv").waitFor({ state: "visible" });
  await wait(400);
}
/* los datos tal como los tiene la app, sin pasar por el DOM */
function datos(page) {
  return page.evaluate(() => window.INVENTARIO_DATA);
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const page = await login(browser);
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  await step("el inventario es una sección más de la barra", async () => {
    const secciones = await page.locator("#ab-sec option").allInnerTexts();
    assert.ok(secciones.includes("Todo el material"), "sale en el desplegable de secciones");
    const grupos = await page.locator("#ab-sec optgroup").evaluateAll((g) => g.map((x) => x.label));
    assert.deepEqual(grupos, ["Plano de mesas", "Menú del evento", "Inventario"],
      "el inventario va en su propio grupo: no es de un evento, es del negocio");
    await irAlInventario(page);
  });

  await step("LAS 5 HOJAS DEL EXCEL, EN SU ORDEN Y CON SU NOMBRE", async () => {
    const d = await datos(page);
    assert.deepEqual(d.hojas.map((h) => h.hoja), HOJAS);
    // y los mismos nombres en los botones de filtro
    const botones = await page.locator("#inv-hojas button").allInnerTexts();
    assert.deepEqual(botones, ["Todo"].concat(HOJAS));
  });

  await step("LAS CATEGORÍAS, EN SU ORDEN Y CON SU NOMBRE", async () => {
    const d = await datos(page);
    let total = 0;
    for (const h of d.hojas) {
      assert.deepEqual(h.categorias.map((c) => c.nombre), CATEGORIAS[h.hoja], "categorías de " + h.hoja);
      total += h.categorias.length;
    }
    // 17 cabeceras con nombre + el bloque de SONIDO Y LUZ que en el Excel va
    // sin cabecera (altavoces, walkies, micrófonos)
    assert.equal(total, 18);
    const conNombre = (await datos(page)).hojas
      .reduce((a, h) => a + h.categorias.filter((c) => c.nombre).length, 0);
    assert.equal(conNombre, 17);
  });

  await step("las 123 líneas del Excel están todas", async () => {
    const d = await datos(page);
    const n = d.hojas.reduce((a, h) => a + h.categorias.reduce((b, c) => b + c.items.length, 0), 0);
    assert.equal(n, 123);
    assert.equal(await page.locator(".inv-row").count(), 123, "y las 123 se pintan");
  });

  await step("un nombre repetido se distingue por sus medidas, no se funde en uno", async () => {
    const d = await datos(page);
    const mesas = d.hojas.find((h) => h.hoja === "MESAS").categorias[0].items;
    const redondas = mesas.filter((i) => i.nombre === "MESA REDONDA BANQUETES");
    assert.equal(redondas.length, 2, "hay dos líneas de mesa redonda de banquetes");
    assert.deepEqual(redondas.map((i) => [i.medidas, i.cantidad]),
      [["2M DE DIAMETRO", 18], ["1,50 DIAMETRO", 5]]);
    const plastico = mesas.filter((i) => i.nombre === "MESA PLASTICO RECTANGULARES");
    assert.equal(plastico.length, 4, "y cuatro de mesa de plástico rectangular");
  });

  await step("TRONAS BEBÉ: un nombre para tres filas, como en el Excel", async () => {
    const d = await datos(page);
    const otros = d.hojas.find((h) => h.hoja === "MESAS").categorias.find((c) => c.nombre === "OTROS").items;
    assert.deepEqual(otros.map((i) => [i.nombre, i.medidas, i.cantidad]), [
      ["TRONAS BEBÉ", "75CM", 2],
      ["TRONAS BEBÉ", "86CM", 2],
      ["TRONAS BEBÉ", "PLÁSTIC BLANC", 1],
    ]);
    assert.ok(otros[1].mismoNombre && otros[2].mismoNombre,
      "las dos de abajo se marcan como continuación, para que no parezcan tres artículos distintos");
  });

  await step("lo que el Excel deja en blanco no se inventa", async () => {
    const d = await datos(page);
    const sin = [];
    d.hojas.forEach((h) => h.categorias.forEach((c) => c.items.forEach((i) => {
      if (i.cantidad === null) sin.push(i.nombre);
    })));
    assert.deepEqual(sin, [
      "SERVILLETAS BLANCAS LES MOLES", "CHICO-CHICO", '"ABUELOS"',
      "WALKIE TALKIES", "MICROFONO INHALAMBRICO", "MICROFONO INHALAMBRICO", "MICROFONO INHALAMBRICO",
    ]);
    assert.match(await page.locator("#inv-stats").innerText(), /7\s*\n?\s*SIN CANTIDAD/i);
  });

  await step("«++» se guarda tal cual, no se convierte en un número", async () => {
    const d = await datos(page);
    const figuras = d.hojas.find((h) => h.hoja === "DECORACIÓN").categorias.find((c) => c.nombre === "FIGURAS").items;
    const chica = figuras.find((i) => i.nombre === "CHICA-CHICA");
    assert.equal(chica.cantidad, "++");
    assert.match(await page.locator("#inv-stats").innerText(), /1\s*\n?\s*SIN NÚMERO/i);
  });

  await step("las notas del Excel se conservan, y solo se avisa de las que son un problema", async () => {
    const d = await datos(page);
    const todas = [];
    d.hojas.forEach((h) => h.categorias.forEach((c) => c.items.forEach((i) => { if (i.nota) todas.push([i.nombre, i.nota]); })));
    const notas = Object.fromEntries(todas);
    assert.equal(notas["SILLAS NEGRAS BANQUETES"], "6 ROTAS");
    assert.equal(notas["MANTEL SACO MESAS APERITIVO"], "21 FACTURADOS");
    assert.equal(notas["CABLE VERDE TRIPLE ENCHUFE"], "S'HA DE REPARAR");
    // "6 ROTAS" se pinta como aviso; "CLAVIJA DE 32 AMP DE CETAC" solo describe
    const avisos = await page.locator(".inv-row .nt.aviso").allInnerTexts();
    assert.ok(avisos.includes("6 ROTAS"), "las sillas rotas se avisan");
    assert.ok(!avisos.some((t) => t.includes("CLAVIJA")), "la clavija de un cable no es un aviso");
  });

  await step("la hoja de vasos conserva su fecha de inventario", async () => {
    const d = await datos(page);
    const vasos = d.hojas.find((h) => h.hoja === "VASOS Y CUBERTERIA");
    assert.equal(vasos.fecha, "07/08/2026", "la fecha que pone el Excel, solo en esa hoja");
    assert.equal(d.hojas.find((h) => h.hoja === "MESAS").fecha, null, "las demás no la llevan");
  });

  await step("los cables traen sus columnas propias (código, amperios, metros)", async () => {
    const d = await datos(page);
    const cables = d.hojas.find((h) => h.hoja === "SONIDO Y LUZ").categorias.find((c) => c.nombre === "CABLE DE LUZ").items;
    assert.equal(cables.length, 5);
    assert.deepEqual(cables.map((c) => c.codigo), ["1-E", "2-E", "3-E", "4-E", "5-E"]);
    assert.equal(cables[2].amperios, 32);
    assert.equal(cables[2].medidas, "21.6");
  });

  await step("buscar mira el nombre, la medida y la categoría", async () => {
    await page.locator("#inv-q").fill("copa"); await wait(400);
    assert.equal(await page.locator(".inv-row").count(), 10, "7 copas + 3 racks de copa");
    await page.locator("#inv-q").fill("diametro"); await wait(400);
    assert.ok(await page.locator(".inv-row").count() >= 6, "también busca por medidas");
    await page.locator("#inv-q").fill("racks"); await wait(400);
    assert.equal(await page.locator(".inv-row").count(), 11, "y por categoría");
    await page.locator("#inv-q").fill(""); await wait(400);
  });

  await step("filtrar por hoja deja solo esa hoja", async () => {
    await page.locator('#inv-hojas button[data-h="VASOS Y CUBERTERIA"]').click(); await wait(400);
    assert.equal(await page.locator(".inv-row").count(), 26);
    await page.locator('#inv-hojas button[data-h=""]').click(); await wait(400);
    assert.equal(await page.locator(".inv-row").count(), 123);
  });

  await step("CORREGIR UNA CANTIDAD NO BORRA LA DEL EXCEL", async () => {
    // se parte de cero: si una prueba anterior dejó una corrección guardada en
    // el servidor, se quita primero — así el resultado no depende de la vez
    // anterior que se lanzara esto
    const inp0 = page.locator('.inv-row:has-text("SILLAS NEGRAS BANQUETES")').first().locator("input.inv-cant");
    await inp0.fill(""); await inp0.press("Enter"); await wait(500);
    const fila = page.locator('.inv-row:has-text("SILLAS NEGRAS BANQUETES")').first();
    const inp = fila.locator("input.inv-cant");
    assert.equal(await inp.inputValue(), "277", "de partida, la cantidad del Excel");
    await inp.fill("271");
    await inp.press("Enter");
    await wait(500);
    const fila2 = page.locator('.inv-row:has-text("SILLAS NEGRAS BANQUETES")').first();
    assert.equal(await fila2.locator("input.inv-cant").inputValue(), "271");
    assert.match(await fila2.locator(".orig").innerText(), /Excel:\s*277/,
      "al lado sigue viéndose lo que dice el Excel");
    assert.match(await page.locator("#inv-stats").innerText(), /1\s*\n?\s*CORREGIDAS/i);
  });

  await step("la corrección sobrevive a recargar y le llega a un compañero", async () => {
    await wait(2500);   // margen para que se empuje al servidor
    const otro = await login(browser);   // navegador limpio, sin datos locales
    await wait(1500);
    await irAlInventario(otro);
    const fila = otro.locator('.inv-row:has-text("SILLAS NEGRAS BANQUETES")').first();
    assert.equal(await fila.locator("input.inv-cant").inputValue(), "271",
      "el compañero ve la cantidad corregida");
    assert.match(await fila.locator(".orig").innerText(), /Excel:\s*277/);
    await otro.context().close();
  });

  await step("dejar la casilla vacía vuelve a lo que dice el Excel", async () => {
    const inp = page.locator('.inv-row:has-text("SILLAS NEGRAS BANQUETES")').first().locator("input.inv-cant");
    await inp.fill("");
    await inp.press("Enter");
    await wait(500);
    const fila = page.locator('.inv-row:has-text("SILLAS NEGRAS BANQUETES")').first();
    assert.equal(await fila.locator("input.inv-cant").inputValue(), "277");
    assert.equal(await fila.locator(".orig").count(), 0, "ya no hay nada que comparar");
  });

  await step("el inventario es el mismo para todos los eventos", async () => {
    const antes = await page.locator("#inv-stats").innerText();
    await page.locator("#ab-new").click(); await wait(600);
    await irAlInventario(page);
    assert.equal(await page.locator("#inv-stats").innerText(), antes,
      "cambiar de evento no cambia el inventario: es el material del negocio");
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
