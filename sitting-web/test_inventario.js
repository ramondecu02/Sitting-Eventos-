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

/* todo lo que crea esta prueba empieza por PRUEBA, para poder barrer lo que
   dejó la vez anterior sin tocar nada de verdad */
const PREF = "PRUEBA ";
const token = PREF + Date.now().toString(36).slice(-5).toUpperCase();
let passed = 0, failed = 0;
async function step(name, fn) {
  try { await fn(); console.log("OK   " + name); passed++; }
  catch (err) { console.error("FAIL " + name); console.error("     " + (err.stack || err.message)); failed++; }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* buscar por texto con filter() en vez de :has-text("..."), que se atraganta
   con las comillas cuando el texto se compone en JavaScript */
const fila = (page, texto) => page.locator(".inv-row").filter({ hasText: texto });
const grupoCon = (page, texto) => page.locator(".mnu-station").filter({ hasText: texto });
const grupoDeHoja = (page, texto) => page.locator(".mnu-fam-section").filter({ hasText: texto });

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

  await step("se barre lo que dejaron ejecuciones anteriores", async () => {
    await irAlInventario(page);
    const barridos = await page.evaluate((pref) => {
      const st = window.SITTING_BRIDGE.store;
      if (!st.invExtra) return 0;
      let n = 0;
      (st.invExtra.items || []).forEach((x) => {
        if (!x.borrado && String(x.nombre || "").startsWith(pref)) { x.borrado = true; x.updated = Date.now(); n++; }
      });
      (st.invExtra.categorias || []).forEach((c) => {
        if (!c.borrada && String(c.nombre || "").startsWith(pref)) { c.borrada = true; c.updated = Date.now(); n++; }
      });
      (st.invExtra.hojas || []).forEach((h) => {
        if (!h.borrada && String(h.nombre || "").startsWith(pref)) { h.borrada = true; h.updated = Date.now(); n++; }
      });
      window.SITTING_BRIDGE.save();
      return n;
    }, PREF);
    console.log("     (barridos " + barridos + " restos de pruebas anteriores)");
    await page.reload();
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await wait(1200);
  });

  await step("el inventario es una sección más de la barra", async () => {
    const secciones = await page.locator("#ab-sec option").allInnerTexts();
    assert.ok(secciones.includes("Todo el material"), "sale en el desplegable de secciones");
    const grupos = await page.locator("#ab-sec optgroup").evaluateAll((g) => g.map((x) => x.label));
    assert.deepEqual(grupos, ["Plano de mesas", "Menú del evento", "Inventario", "Camareros"],
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
    assert.match(await page.locator("#inv-stats").innerText(), /1\s*\n?\s*CORREGIDAS? AQUÍ/i);
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

  await step("AÑADIR UN ARTÍCULO A UN GRUPO EXISTENTE", async () => {
    // lo que se compra después del Excel se apunta en su grupo, con el nombre
    // obligatorio y las medidas y el comentario solo si vienen a cuento
    await page.locator('#inv-hojas button[data-h="MESAS"]').click(); await wait(400);
    const grupo = page.locator('.mnu-station:has-text("MANTELERIA")').first();
    await grupo.locator("button.inv-add").click(); await wait(300);
    await page.locator(".inv-form .f-nombre").fill(token + " MANTELES BLANCOS");
    await page.locator(".inv-form .f-medidas").fill("3 X 2 M");
    await page.locator(".inv-form .f-cant").fill("24");
    await page.locator(".inv-form .f-nota").fill("comprados hoy");
    await page.locator(".inv-form .f-ok").click(); await wait(600);

    const f = fila(page, token + " MANTELES BLANCOS").first();
    assert.equal(await f.count(), 1, "sale en su grupo");
    assert.match(await f.innerText(), /3 X 2 M/, "con sus medidas");
    assert.match(await f.innerText(), /comprados hoy/, "y su comentario");
    assert.equal(await f.locator("input.inv-cant").inputValue(), "24");
    assert.match(await f.innerText(), /añadido/i,
      "marcado como añadido, para distinguir de un vistazo lo que viene del Excel");
    await page.locator(".inv-form .f-no").click(); await wait(300);
  });

  await step("un artículo sin nombre no se añade", async () => {
    const antes = await page.locator(".inv-row").count();
    const grupo = page.locator('.mnu-station:has-text("MANTELERIA")').first();
    await grupo.locator("button.inv-add").click(); await wait(300);
    await page.locator(".inv-form .f-cant").fill("9");
    await page.locator(".inv-form .f-ok").click(); await wait(400);
    assert.equal(await page.locator(".inv-row").count(), antes, "no se ha añadido nada");
    assert.equal(await page.locator(".inv-form").count(), 1, "el formulario sigue abierto");
    await page.locator(".inv-form .f-no").click(); await wait(300);
  });

  await step("CREAR UN GRUPO NUEVO Y METERLE ALGO", async () => {
    const nombreGrupo = token + " BARRAS";
    await page.locator('.mnu-fam-section:has-text("MESAS") button.inv-add-g').first().click();
    await wait(300);
    await page.locator(".inv-form.grupo .g-nombre").fill(nombreGrupo);
    await page.locator(".inv-form.grupo .g-ok").click(); await wait(600);

    const grupo = grupoCon(page, nombreGrupo).first();
    assert.equal(await grupo.count(), 1, "el grupo nuevo sale en su hoja");
    assert.match(await grupo.innerText(), /grupo añadido/i);
    assert.match(await grupo.innerText(), /todavía no tiene nada/i,
      "un grupo vacío se ve, no desaparece hasta tener algo dentro");

    await grupo.locator("button.inv-add").click(); await wait(300);
    await page.locator(".inv-form .f-nombre").fill(token + " BARRA PLEGABLE");
    await page.locator(".inv-form .f-cant").fill("3");
    await page.locator(".inv-form .f-ok").click(); await wait(600);
    assert.equal(await fila(page, token + " BARRA PLEGABLE").count(), 1);
    await page.locator(".inv-form .f-no").click(); await wait(300);
  });

  await step("lo añadido cuenta en las cifras y se puede buscar", async () => {
    const stats = await page.locator("#inv-stats").innerText();
    const m = /(\d+)\s*\n?\s*AÑADIDAS? AQUÍ/i.exec(stats);
    assert.ok(m && +m[1] >= 2, "las añadidas cuentan en las cifras: " + stats.replace(/\n/g, " "));
    await page.locator('#inv-hojas button[data-h=""]').click(); await wait(300);
    await page.locator("#inv-q").fill(token + " BARRA PLEGABLE"); await wait(500);
    assert.equal(await page.locator(".inv-row").count(), 1, "se encuentra buscando");
    await page.locator("#inv-q").fill(""); await wait(400);
  });

  await step("lo añadido le llega a un compañero", async () => {
    await wait(2500);
    const otro = await login(browser);
    await wait(1500);
    await irAlInventario(otro);
    assert.equal(await fila(otro, token + " MANTELES BLANCOS").count(), 1);
    assert.equal(await grupoCon(otro, token + " BARRAS").count(), 1);
    await otro.context().close();
  });

  await step("se puede corregir y quitar lo añadido, sin tocar el Excel", async () => {
    const f = fila(page, token + " MANTELES BLANCOS").first();
    await f.locator("button.inv-ed").click(); await wait(400);
    const panel = page.locator(".inv-panel").first();
    await panel.locator(".p-nota").fill("faltan 2 por recoger");
    await panel.locator(".p-nota").press("Enter"); await wait(600);
    assert.match(await fila(page, token + " MANTELES BLANCOS").first().innerText(),
      /faltan 2 por recoger/);

    // quitarlo: el diálogo de confirmación se acepta solo
    await fila(page, token + " BARRA PLEGABLE").first()
      .locator("button.inv-ed").click(); await wait(400);
    page.once("dialog", (d) => d.accept());
    await page.locator(".inv-panel .p-quitar").first().click(); await wait(600);
    assert.equal(await fila(page, token + " BARRA PLEGABLE").count(), 0,
      "ya no está");
    // y las 123 líneas del Excel siguen intactas
    const d = await datos(page);
    const n = d.hojas.reduce((a, h) => a + h.categorias.reduce((b, c) => b + c.items.length, 0), 0);
    assert.equal(n, 123, "el Excel no se ha tocado en ningún momento");
  });

  await step("un grupo con artículos dentro no se puede quitar por error", async () => {
    // el de BARRAS ya está vacío (se acaba de quitar su artículo), así que se
    // comprueba con uno que sí tiene algo
    const nombreGrupo = token + " CON COSAS";
    await page.locator('#inv-hojas button[data-h="MESAS"]').click(); await wait(400);
    await page.locator('.mnu-fam-section:has-text("MESAS") button.inv-add-g').first().click(); await wait(300);
    await page.locator(".inv-form.grupo .g-nombre").fill(nombreGrupo);
    await page.locator(".inv-form.grupo .g-ok").click(); await wait(500);
    const grupo = grupoCon(page, nombreGrupo).first();
    await grupo.locator("button.inv-add").click(); await wait(300);
    await page.locator(".inv-form .f-nombre").fill(token + " ALGO");
    await page.locator(".inv-form .f-ok").click(); await wait(500);
    await page.locator(".inv-form .f-no").click(); await wait(300);

    let aviso = null;
    page.once("dialog", (d) => { aviso = d.message(); d.accept(); });
    await grupoCon(page, nombreGrupo).locator("button.inv-quitar-g").first().click();
    await wait(500);
    assert.match(aviso || "", /todavía tiene 1 artículo/i, "avisa en vez de llevárselo todo por delante");
    assert.equal(await grupoCon(page, nombreGrupo).count(), 1,
      "el grupo sigue ahí");
  });

  await step("CREAR UNA SECCIÓN NUEVA, ADEMÁS DE UN GRUPO", async () => {
    // «+ Sección» vive en la barra de arriba, al lado de los demás controles
    // (Evento, + Evento, Sección) — solo visible estando en Inventario — y
    // pide el nombre con un prompt(), no con un formulario en la página
    const seccion = token + " CARPAS";
    await page.locator('#inv-hojas button[data-h=""]').click(); await wait(400);
    let tipo = null;
    page.once("dialog", (d) => { tipo = d.type(); d.accept(seccion); });
    await page.locator("#ab-inv-new").click(); await wait(700);
    assert.equal(tipo, "prompt", "«+ Sección» pide el nombre con un prompt()");

    // sale como un botón más de filtro, detrás de las cinco hojas del Excel
    const botones = await page.locator("#inv-hojas button").allInnerTexts();
    assert.deepEqual(botones.slice(0, 6), ["Todo"].concat(HOJAS),
      "las del Excel no se mueven de sitio");
    assert.ok(botones.includes(seccion), "y la nueva va detrás");

    const h = grupoDeHoja(page, seccion);
    assert.match(await h.innerText(), /sección añadida/i);
    assert.match(await h.innerText(), /todavía no tiene ningún grupo/i);

    // y admite grupos y artículos como cualquier otra
    await page.locator('#inv-hojas button[data-h="' + seccion + '"]').click().catch(async () => {
      await page.locator("#inv-hojas button").filter({ hasText: seccion }).click();
    });
    await wait(400);
    await page.locator("button.inv-add-g").first().click(); await wait(300);
    await page.locator(".inv-form.grupo .g-nombre").fill(token + " BEDUINAS");
    await page.locator(".inv-form.grupo .g-ok").click(); await wait(600);
    await page.locator("button.inv-add").first().click(); await wait(300);
    await page.locator(".inv-form .f-nombre").fill(token + " CARPA 6X6");
    await page.locator(".inv-form .f-cant").fill("2");
    await page.locator(".inv-form .f-ok").click(); await wait(600);
    await page.locator(".inv-form .f-no").click(); await wait(300);
    assert.equal(await fila(page, token + " CARPA 6X6").count(), 1);
  });

  await step("dos secciones no se pueden llamar igual", async () => {
    // dos diálogos seguidos en el mismo click (el prompt del nombre y, si es
    // un nombre repetido, el alert de aviso): un handler que se queda puesto
    // durante todo el paso, en vez de dos "once" que podrían pisarse
    let aviso = null;
    const handler = (d) => { if (d.type() === "prompt") d.accept("MESAS"); else { aviso = d.message(); d.accept(); } };
    page.on("dialog", handler);
    await page.locator('#inv-hojas button[data-h=""]').click(); await wait(400);
    await page.locator("#ab-inv-new").click(); await wait(500);
    page.off("dialog", handler);
    assert.match(aviso || "", /ya hay una sección/i, "avisa en vez de crear una segunda MESAS");
  });

  await step("LO AÑADIDO SE PUEDE CAMBIAR DE SECCIÓN", async () => {
    await page.locator('#inv-hojas button[data-h=""]').click(); await wait(400);
    await fila(page, token + " CARPA 6X6").first().locator("button.inv-ed").click(); await wait(400);
    const sel = page.locator(".inv-panel .p-mover");
    assert.equal(await sel.count(), 1, "lo añadido lleva un «dónde va»");
    const destinos = await sel.locator("option").allInnerTexts();
    assert.ok(destinos.some((d) => d.startsWith("MESAS ›")), "se puede mandar a una hoja del Excel");
    const aMantel = destinos.find((d) => d.indexOf("MANTELERIA") > -1);
    await sel.selectOption({ label: aMantel }); await wait(700);

    const enMesas = grupoCon(page, "MANTELERIA").filter({ hasText: token + " CARPA 6X6" });
    assert.equal(await enMesas.count(), 1, "ha aterrizado en el grupo elegido");
  });

  await step("una sección con cosas dentro no se puede quitar por error", async () => {
    const seccion = token + " CON COSAS SECCION";
    page.once("dialog", (d) => d.accept(seccion));
    await page.locator("#ab-inv-new").click(); await wait(700);
    const h = grupoDeHoja(page, seccion);
    await h.locator("button.inv-add-g").click(); await wait(300);
    await page.locator(".inv-form.grupo .g-nombre").fill(token + " ALGO");
    await page.locator(".inv-form.grupo .g-ok").click(); await wait(600);

    let aviso = null;
    page.once("dialog", (d) => { aviso = d.message(); d.accept(); });
    await grupoDeHoja(page, seccion).locator("button.inv-quitar-h").click(); await wait(500);
    assert.match(aviso || "", /todavía tiene cosas dentro/i);
    assert.equal(await grupoDeHoja(page, seccion).count(), 1, "la sección sigue ahí");
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
