#!/usr/bin/env node
/**
 * test_alergias.js — la hoja de Alergias del Menú.
 *
 * Lo que pidió Ramon: ver quién tiene alergia, con su nombre y su alergia,
 * poder escribirle a mano el plato sustitutivo (más de uno si hace falta,
 * como un primero y un segundo sustitutivos distintos), y que eso se refleje
 * «tanto en el sitting como en la lista de mesas».
 *
 * Las alergias no se vuelven a escribir en ningún sitio: ya están en el plano,
 * entre paréntesis detrás del nombre. Y los platos sustitutivos tampoco se
 * guardan en una lista aparte — se guardan DENTRO del plano, como etiquetas más
 * del comensal (una «Menú: ...» por cada uno). Por eso aparecen solo en el
 * plano de sala y en el listado por mesas: es el mismo dato, no una copia que
 * haya que mantener sincronizada. Esta prueba comprueba justo eso, que es lo
 * que evita que un día el plano y la cocina digan cosas distintas.
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
  let primerEvento; // id del evento de este test, para volver a él más tarde

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
    primerEvento = await page.locator("#ab-ev").inputValue();
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
      /4 comensales con alergia, intolerancia o necesidad especial.*0 con plato decidido.*4 por decidir/s);
  });

  await step("SE ESCRIBE EL PLATO SUSTITUTIVO A MANO", async () => {
    const inp = filaDe(page, "Carme Roig").locator(".aler-plato-row input");
    await inp.fill("Lubina a la plancha");
    await inp.press("Enter");
    await wait(600);
    assert.equal(await filaDe(page, "Carme Roig").locator(".aler-plato-row input").inputValue(), "Lubina a la plancha");
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

  await step("EL PLATO YA NO SALE EN EL PLANO DE SALA (sí la alergia)", async () => {
    await wait(500);
    // los platos se han sacado del sitting (petición de Ramon): recargaban el
    // plano y lo que de verdad se consulta ahí es la alergia. El plato ya solo
    // va en el listado por mesas, con su color por tiempo. La alergia se queda.
    const textos = await page.evaluate(() =>
      [].map.call(document.querySelectorAll("#room text"), (t) => t.textContent));
    assert.ok(!textos.some((t) => /LUBINA/i.test(t)),
      "el plato ya NO se dibuja en el plano de sala: " + JSON.stringify(textos));
    assert.ok(textos.some((t) => /^MARISCO/i.test(t)),
      "y sigue diciendo la alergia, limpia, sin el «alérgica:» delante");
  });

  await step("MARCAR EL TIEMPO del plato (Segundo) lo colorea y viaja con el evento", async () => {
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    const sel = filaDe(page, "Carme Roig").locator(".aler-plato-row .aler-plato-curso").first();
    await sel.selectOption("segundo"); await wait(700);
    // el tiempo viaja en el texto del comensal como «Segundo: …»
    await page.locator("#ab-sec").selectOption("plan"); await wait(400);
    assert.match(await page.locator("#src").inputValue(),
      /Carme Roig \(alérgica: marisco, Segundo: Lubina a la plancha\)/,
      "el tiempo elegido se guarda en el texto del comensal");
    // en el listado sale la leyenda y la etiqueta del plato con el color del Segundo
    await page.locator("#ab-sec").selectOption("list");
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await wait(700);
    assert.equal(await page.locator(".curso-leg .curso-leg-it").filter({ hasText: "Segundo" }).count(), 1,
      "el listado lleva la leyenda de los tiempos");
    const bg = await page.locator(".g", { hasText: "Carme Roig" }).locator(".tag.m").first()
      .evaluate((el) => el.style.backgroundColor);
    assert.equal(bg.replace(/\s/g, ""), "rgb(176,99,42)",
      "la etiqueta del plato sale con el color del Segundo (#B0632A), sale: " + bg);
    // volver a dejarlo sin tiempo para el resto de la prueba (que comprueba «Menú:»)
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    await filaDe(page, "Carme Roig").locator(".aler-plato-row .aler-plato-curso").first().selectOption("");
    await wait(700);
  });

  await step("borrar el plato lo quita de todas partes", async () => {
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    const inp = filaDe(page, "Carme Roig").locator(".aler-plato-row input");
    await inp.fill("");
    await inp.press("Enter");
    await wait(600);
    assert.equal(await filaDe(page, "Carme Roig").locator(".aler-plato-row input").inputValue(), "");
    await page.locator("#ab-sec").selectOption("plan"); await wait(500);
    const txt = await page.locator("#src").inputValue();
    assert.match(txt, /Carme Roig \(alérgica: marisco\)/, "la alergia se queda, el plato se va");
    assert.ok(!/Lubina/i.test(txt), "y no queda rastro del plato");
  });

  await step("cambiar el plato de un comensal no toca a los demás", async () => {
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    for (const [quien, plato] of [["Rosa Fabra", "Cabrito con setas"], ["Pol Sans", "Arroz de pato"]]) {
      const inp = filaDe(page, quien).locator(".aler-plato-row input");
      await inp.fill(plato); await inp.press("Enter"); await wait(500);
    }
    assert.equal(await filaDe(page, "Rosa Fabra").locator(".aler-plato-row input").inputValue(), "Cabrito con setas");
    assert.equal(await filaDe(page, "Pol Sans").locator(".aler-plato-row input").inputValue(), "Arroz de pato");
    assert.equal(await filaDe(page, "Montse Serra").locator(".aler-plato-row input").inputValue(), "",
      "a quien no se le ha puesto nada sigue sin nada");
  });

  // Ramon, tras ver la primera versión (un solo campo por comensal): «en la opción
  // de elegir plato adaptado, poder también añadir plato por cada comensal, que no
  // sea uno solo el que se pueda añadir». Se mantiene el campo de texto libre de
  // siempre (con sus mismas sugerencias), pero ahora se puede añadir más de uno por
  // persona — un primero y un segundo sustitutivos, por ejemplo — con «+»/«−».
  await step("SE PUEDE AÑADIR MÁS DE UN PLATO AL MISMO COMENSAL", async () => {
    // por defecto hay un único campo vacío, listo para escribir sin tener que
    // darle antes a «+» — es el caso de siempre, el de la mayoría de alérgicos
    const fila = filaDe(page, "Carme Roig");
    assert.equal(await fila.locator(".aler-plato-row").count(), 1, "empieza con un solo campo, vacío");
    await fila.locator(".aler-plato-row input").first().fill("Croquetas de jamón sin gluten");
    // sin quitar el foco del campo, se pide un segundo plato con «+»: tiene que
    // añadirse sin perder lo que se acaba de escribir. (Con la primera versión de
    // esto, un clic en «+» justo después de escribir —sin un clic en medio que ya
    // hubiera guardado— competía con el guardado automático y el clic se perdía.)
    await fila.locator(".aler-plato-add").click();
    await wait(400);
    assert.equal(await fila.locator(".aler-plato-row").count(), 2, "se ha añadido un segundo campo");
    await fila.locator(".aler-plato-row").nth(1).locator("input").fill("Sorbete de limón");
    await fila.locator(".aler-plato-row").nth(1).locator("input").press("Enter");
    await wait(600);
    const filaTrasGuardar = filaDe(page, "Carme Roig");
    assert.equal(await filaTrasGuardar.locator(".aler-plato-row").count(), 2, "los dos platos siguen ahí tras guardar");
    assert.equal(await filaTrasGuardar.locator(".aler-plato-row").nth(0).locator("input").inputValue(),
      "Croquetas de jamón sin gluten");
    assert.equal(await filaTrasGuardar.locator(".aler-plato-row").nth(1).locator("input").inputValue(), "Sorbete de limón");
    // y no ha tocado los platos de los demás comensales, que se guardan cada uno
    // por su lado
    assert.equal(await filaDe(page, "Rosa Fabra").locator(".aler-plato-row input").inputValue(), "Cabrito con setas");
    assert.equal(await filaDe(page, "Pol Sans").locator(".aler-plato-row input").inputValue(), "Arroz de pato");
    assert.equal(await filaDe(page, "Montse Serra").locator(".aler-plato-row input").inputValue(), "");
  });

  await step("los dos platos de Carme se guardan en el plano y salen en el listado por mesas", async () => {
    await page.locator("#ab-sec").selectOption("plan"); await wait(500);
    const txt = await page.locator("#src").inputValue();
    assert.match(txt, /Carme Roig \(alérgica: marisco, Menú: Croquetas de jamón sin gluten, Menú: Sorbete de limón\)/,
      "una etiqueta «Menú:» por cada plato, las dos dentro del mismo paréntesis del comensal");

    // ya no se dibujan en el plano de sala (los platos se sacaron del sitting)
    const textos = await page.evaluate(() =>
      [].map.call(document.querySelectorAll("#room text"), (t) => t.textContent));
    assert.ok(!textos.some((t) => /CROQUETAS/i.test(t)),
      "los platos ya no están en el plano de sala: " + JSON.stringify(textos));

    await page.locator("#ab-sec").selectOption("list"); await wait(700);
    const tarjeta = page.locator(".lcard").filter({ hasText: "Carme Roig" });
    assert.equal(await tarjeta.locator(".g", { hasText: "Carme Roig" }).locator(".tag.m").count(), 2,
      "dos etiquetas de plato en su tarjeta de mesa, sin recortar");
    const cajaCarme = page.locator(".al").filter({ hasText: "Carme Roig" });
    assert.equal(await cajaCarme.locator(".sust").count(), 2,
      "y los dos apilados, uno debajo del otro, en el recuadro de alergias del pie");
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
  });

  await step("quitar uno de los dos platos deja el otro tal cual", async () => {
    const fila = filaDe(page, "Carme Roig");
    await fila.locator(".aler-plato-row").nth(1).locator(".aler-plato-rm").click();
    await wait(600);
    const filaTras = filaDe(page, "Carme Roig");
    assert.equal(await filaTras.locator(".aler-plato-row").count(), 1, "vuelve a quedar un único campo");
    assert.equal(await filaTras.locator(".aler-plato-row input").inputValue(), "Croquetas de jamón sin gluten",
      "el que queda es el primero, no se ha perdido ni cambiado");
  });

  await step("quitar el último plato no deja el hueco sin sitio donde escribir: lo vacía", async () => {
    const fila = filaDe(page, "Carme Roig");
    await fila.locator(".aler-plato-row").first().locator(".aler-plato-rm").click();
    await wait(600);
    const filaTras = filaDe(page, "Carme Roig");
    assert.equal(await filaTras.locator(".aler-plato-row").count(), 1, "sigue habiendo un campo, no desaparece del todo");
    assert.equal(await filaTras.locator(".aler-plato-row input").inputValue(), "", "y está vacío");
    assert.ok(!/hecho/.test(await filaTras.getAttribute("class")), "ya no cuenta como decidido");
    assert.match(await page.locator("#mnu-body .mnu-origen").first().innerText(), /2 con plato decidido.*2 por decidir/s,
      "Rosa y Pol siguen decididos; Carme (recién vaciada) y Montse, por decidir");
  });

  const filaAperis = (page, alergiaRe) =>
    page.locator(".aler-aperis-row").filter({ hasText: new RegExp(alergiaRe, "i") });

  await step("hay una fila de aperitivo adaptado por cada alergia DISTINTA del plano, no una caja libre", async () => {
    // el plano tiene 4 alérgicos, pero escritos de 4 formas distintas: «marisco»
    // y «marisc» (catalán) cuentan como dos alergias a propósito — la app no
    // adivina que son la misma, igual que no inventa nada más en ningún sitio
    assert.equal(await page.locator(".aler-aperis-row").count(), 4);
    for (const a of ["^marisco$", "^marisc$", "^lactosa$", "^frutos secos$"]) {
      const fila = filaAperis(page, a);
      assert.equal(await fila.count(), 1, "hay una fila para " + a);
      assert.equal(await fila.locator("input").inputValue(), "", a + " empieza vacía");
    }
    // va debajo del recuadro de cada comensal, no mezclado con él
    const debajo = await page.evaluate(() => {
      const caja = document.querySelector(".aler-aperis");
      const mesas = document.querySelector(".aler-mesa");
      return !!(caja && mesas) && !!(mesas.compareDocumentPosition(caja) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    assert.ok(debajo, "el recuadro de aperitivos va después del de los comensales, no mezclado");
  });

  await step("SE ESCRIBE A MANO POR ALERGIA, Y SE GUARDA, sin tocar los platos ni las otras alergias", async () => {
    await filaAperis(page, "^marisco$").locator("input")
      .fill("Croquetas de jamón — versión sin gluten con base de maicena");
    await filaAperis(page, "^marisco$").locator("input").blur();
    await wait(600);
    // se va a otra vista y se vuelve, para comprobar que quedó guardado de verdad
    await page.locator("#ab-sec").selectOption("m-serv"); await wait(500);
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(500);
    assert.equal(await filaAperis(page, "^marisco$").locator("input").inputValue(),
      "Croquetas de jamón — versión sin gluten con base de maicena", "sigue ahí al volver a la pantalla");
    assert.equal(await filaAperis(page, "^marisc$").locator("input").inputValue(), "",
      "la alergia parecida («marisc», catalán) no se ha tocado, son filas independientes");
    assert.equal(await filaAperis(page, "^frutos secos$").locator("input").inputValue(), "",
      "ni ninguna otra alergia");
    assert.equal(await filaDe(page, "Rosa Fabra").locator("input").inputValue(), "Cabrito con setas",
      "y no ha tocado los platos sustitutivos por comensal, que es una cosa distinta");
  });

  await step("la misma alergia en dos comensales es una sola fila, no dos", async () => {
    await page.locator("#ab-new").click(); await wait(700);
    // venimos de la vista de Alergias (Menú); #src vive en el plano, hay que
    // volver a esa sección antes de poder escribir en la caja
    await page.locator("#ab-sec").selectOption("plan"); await wait(500);
    await page.locator("#src").fill(
      "M1 | Redonda 10 | Prueba\nUno Prueba (alergia: marisco)\nDos Prueba (alergia: marisco)\nTres Prueba (alergia: gluten)\n"
    );
    await page.locator("#src").dispatchEvent("input");
    await wait(700);
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    assert.equal(await page.locator(".aler-row").count(), 3, "salen los tres comensales");
    assert.equal(await page.locator(".aler-aperis-row").count(), 2,
      "pero solo dos filas de aperitivo: marisco (de los dos primeros) y gluten");
    await filaAperis(page, "^marisco$").locator("input").fill("Bombón de foie sin marisco");
    await filaAperis(page, "^marisco$").locator("input").blur();
    await wait(600);
    assert.equal(await filaAperis(page, "^marisco$").locator("input").count(), 1,
      "sigue habiendo una sola fila después de escribir, no se duplica");
  });

  await step("sin alergias en el plano no hay nada que asignar, y lo explica", async () => {
    await page.locator("#ab-new").click(); await wait(700);
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    assert.match(await page.locator("#mnu-body").innerText(), /Ningún comensal del plano tiene alergia/i,
      "el aviso de comensales sigue saliendo cuando no hay ninguno");
    assert.equal(await page.locator(".aler-aperis-row").count(), 0, "no hay ninguna alergia que asignar todavía");
    assert.match(await page.locator(".aler-aperis").innerText(), /Todavía no hay ninguna alergia apuntada/i,
      "y lo explica, en vez de dejar una caja libre sin saber de qué alergia es");
  });

  await step("cada evento tiene sus alergias y sus aperitivos adaptados, sin mezclarse", async () => {
    // el evento en blanco de antes no arrastra nada (ya comprobado arriba); y
    // volviendo al primer evento, lo escrito sigue ahí — por evento, no global,
    // aunque por medio se hayan creado y visitado otros dos eventos más
    await page.locator("#ab-ev").selectOption(primerEvento);
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(600);
    assert.equal(await filaAperis(page, "^marisco$").locator("input").inputValue(),
      "Croquetas de jamón — versión sin gluten con base de maicena",
      "el primer evento conserva lo suyo aunque se hayan creado otros por medio");
  });

  await step("los aperitivos adaptados también salen en el listado por mesas, no solo en la pantalla de editarlos", async () => {
    // el listado (pantalla y PDF) es lo que el equipo se lleva el día del
    // evento — si el aperitivo adaptado solo vive en la pantalla de edición,
    // nadie en cocina lo ve el día del pase
    await page.locator("#ab-sec").selectOption("list"); await wait(700);
    const caja = page.locator(".alerts.aperis");
    await caja.waitFor({ state: "visible" });
    assert.equal(await caja.locator(".al").count(), 1,
      "solo la alergia que tiene algo escrito (marisco); marisc/lactosa/frutos secos siguen vacías");
    const texto = await caja.innerText();
    assert.match(texto, /MARISCO/);
    assert.match(texto, /Croquetas de jamón/);
    assert.ok(!/LACTOSA/.test(texto) && !/FRUTOS SECOS/i.test(texto),
      "una alergia sin aperitivo asignado no aporta nada en un papel para el pase, así que no sale");
    await page.locator("#ab-sec").selectOption("m-aler"); await wait(500);
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
