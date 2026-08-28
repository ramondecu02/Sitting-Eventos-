#!/usr/bin/env node
/**
 * test_exterior_orient.js — el giro de los planos (vertical ⇄ apaisado).
 *
 * Cubre lo que se arregló el 27/08/2026: al cambiar de vertical a apaisado, el
 * plano entero gira un cuarto de vuelta — el contorno de la sala Y las mesas a
 * la vez, como si giraras el plano en papel. Antes solo cambiaba la forma de la
 * hoja: las paredes del plano exterior sí giraban pero las mesas no (se
 * estiraban a lo ancho y se aplastaban a lo alto), así que quedaban
 * descolocadas respecto a las paredes; y en el interior la parrilla de mesas se
 * amontonaba dejando media hoja vacía.
 *
 * No es parte de la suite permanente (no cubre login/sincronización, eso ya lo
 * hacen test_smoke.js/test_web.js) — es la prueba dirigida de este cambio.
 * Arranque: igual que los otros dos, ver la cabecera de test_smoke.js.
 */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE_URL = process.env.SITTING_TEST_URL || "http://localhost:3200";
const TEAM_PASSWORD = process.env.TEAM_PASSWORD;
if (!TEAM_PASSWORD) {
  console.error("Falta TEAM_PASSWORD en el entorno.");
  process.exit(1);
}

let passed = 0, failed = 0;
async function step(name, fn) {
  try { await fn(); console.log("OK   " + name); passed++; }
  catch (err) { console.error("FAIL " + name); console.error("     " + (err.stack || err.message)); failed++; }
}
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
function segLen(l) { return Math.hypot(l.x2 - l.x1, l.y2 - l.y1); }

/* Lee de una vez la geometría que importa: las paredes (por su color, para no
   contar líneas decorativas) y el centro de cada mesa. */
async function readPlan(page) {
  return page.evaluate(() => {
    const room = document.getElementById("room");
    const walls = [...room.querySelectorAll('line[stroke="#8C8C8C"]')].map((el) => ({
      x1: parseFloat(el.getAttribute("x1")), y1: parseFloat(el.getAttribute("y1")),
      x2: parseFloat(el.getAttribute("x2")), y2: parseFloat(el.getAttribute("y2")),
    }));
    const xs = walls.flatMap((w) => [w.x1, w.x2]), ys = walls.flatMap((w) => [w.y1, w.y2]);
    const tables = {};
    room.querySelectorAll("g.tbl[data-t]").forEach((g) => {
      const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(g.getAttribute("transform") || "");
      if (m) tables[g.getAttribute("data-t")] = { x: parseFloat(m[1]), y: parseFloat(m[2]) };
    });
    return {
      viewBox: room.getAttribute("viewBox"), walls, tables,
      box: xs.length ? { x: Math.min(...xs), y: Math.min(...ys),
                         w: Math.max(...xs) - Math.min(...xs),
                         h: Math.max(...ys) - Math.min(...ys) } : null,
    };
  });
}
/* posición de cada mesa en tanto por uno dentro de la caja de las paredes:
   así se puede comparar entre dos orientaciones aunque cambie la escala */
function normTables(p) {
  const out = {};
  Object.keys(p.tables).forEach((n) => {
    out[n] = { a: (p.tables[n].x - p.box.x) / p.box.w, b: (p.tables[n].y - p.box.y) / p.box.h };
  });
  return out;
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  await step("login", async () => {
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
  });

  await step("crear evento nuevo (planos en blanco)", async () => {
    await page.locator("#ab-new").click();
    await wait(200);
  });

  /* ─────────────────────────── EXTERIOR ─────────────────────────── */
  let extP, extL;

  await step("exterior usa la plantilla 'Sala 17 mesas' y arranca en vertical", async () => {
    await page.locator('[data-loc="exterior"]').click();
    await wait(200);
    assert.equal(await page.locator("#tpl").inputValue(), "s17");
    assert.equal(await page.locator("#room").getAttribute("viewBox"), "0 0 960 1400");
  });

  await step("colocar mesas con 'Diseño del salón'", async () => {
    for (let i = 0; i < 8; i++) await page.locator("#addT").click();
    await wait(200);
    await page.locator("#salon").click();
    await wait(300);
    extP = await readPlan(page);
    assert.equal(extP.walls.length, 5, "la sala exterior tiene 5 tramos de pared");
    assert.ok(Object.keys(extP.tables).length >= 8, "hay mesas colocadas");
  });

  await step("Apaisado gira la hoja a 1400×960", async () => {
    await page.locator('[data-o="l"]').click();
    await wait(300);
    extL = await readPlan(page);
    assert.equal(extL.viewBox, "0 0 1400 960");
    assert.equal(extL.walls.length, 5);
  });

  await step("el contorno girado conserva la forma real (no la deforma)", async () => {
    const pL = extP.walls.map(segLen), lL = extL.walls.map(segLen);
    const pMax = Math.max(...pL), lMax = Math.max(...lL);
    // mismo repertorio de tramos, en proporción, aunque cambie el orden
    const pr = pL.map((v) => +(v / pMax).toFixed(3)).sort();
    const lr = lL.map((v) => +(v / lMax).toFixed(3)).sort();
    pr.forEach((v, i) => assert.ok(Math.abs(v - lr[i]) < 0.01,
      `proporción de tramos distinta: ${JSON.stringify(pr)} vs ${JSON.stringify(lr)}`));
  });

  await step("LAS MESAS GIRAN CON LA SALA (lo que fallaba)", async () => {
    const A = normTables(extP), B = normTables(extL);
    const nums = Object.keys(A);
    assert.ok(nums.length >= 8);
    nums.forEach((n) => {
      // giro en el sentido de las agujas del reloj: (a,b) → (1-b, a)
      const ea = 1 - A[n].b, eb = A[n].a;
      assert.ok(Math.abs(B[n].a - ea) < 0.02 && Math.abs(B[n].b - eb) < 0.02,
        `mesa ${n}: esperada en (${ea.toFixed(3)},${eb.toFixed(3)}) y está en (${B[n].a.toFixed(3)},${B[n].b.toFixed(3)})`);
    });
  });

  await step("ninguna mesa se queda fuera de las paredes al girar", async () => {
    const B = normTables(extL);
    Object.keys(B).forEach((n) => {
      assert.ok(B[n].a >= -0.02 && B[n].a <= 1.02 && B[n].b >= -0.02 && B[n].b <= 1.02,
        `mesa ${n} fuera del contorno: (${B[n].a.toFixed(3)},${B[n].b.toFixed(3)})`);
    });
  });

  await step("volver a Vertical deja el plano exactamente como estaba", async () => {
    await page.locator('[data-o="p"]').click();
    await wait(300);
    const back = await readPlan(page);
    assert.equal(back.viewBox, "0 0 960 1400");
    back.walls.forEach((l, i) => {
      const o = extP.walls[i];
      assert.ok(Math.abs(l.x1 - o.x1) < 0.5 && Math.abs(l.y1 - o.y1) < 0.5 &&
                Math.abs(l.x2 - o.x2) < 0.5 && Math.abs(l.y2 - o.y2) < 0.5,
        `el tramo de pared ${i} no vuelve a su sitio`);
    });
    Object.keys(extP.tables).forEach((n) => {
      const a = back.tables[n], o = extP.tables[n];
      assert.ok(a && Math.abs(a.x - o.x) < 1 && Math.abs(a.y - o.y) < 1,
        `la mesa ${n} no vuelve a su sitio: ${JSON.stringify(a)} vs ${JSON.stringify(o)}`);
    });
  });

  await step("'Diseño del salón' sigue forzando vertical (regresión)", async () => {
    await page.locator('[data-o="l"]').click();
    await wait(300);
    await page.locator("#salon").click();
    await wait(300);
    assert.equal(await page.locator('[data-o="p"]').getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("#room").getAttribute("viewBox"), "0 0 960 1400");
  });

  /* ─────────────────────────── INTERIOR ─────────────────────────── */
  let intP, intL;

  await step("interior: colocar mesas en vertical", async () => {
    await page.locator('[data-loc="interior"]').click();
    await wait(200);
    for (let i = 0; i < 6; i++) await page.locator("#addT").click();
    await wait(300);
    intP = await readPlan(page);
    assert.ok(Object.keys(intP.tables).length >= 6);
  });

  await step("interior: Apaisado intercambia ancho y alto de la hoja", async () => {
    const [w, h] = intP.viewBox.split(" ").slice(2).map(Number);
    await page.locator('[data-o="l"]').click();
    await wait(300);
    intL = await readPlan(page);
    assert.equal(intL.viewBox, `0 0 ${h} ${w}`, "la hoja gira, no se reinicia a una medida fija");
  });

  await step("interior: LAS MESAS TAMBIÉN GIRAN (lo que fallaba)", async () => {
    const A = normTables(intP), B = normTables(intL);
    Object.keys(A).forEach((n) => {
      const ea = 1 - A[n].b, eb = A[n].a;
      assert.ok(Math.abs(B[n].a - ea) < 0.02 && Math.abs(B[n].b - eb) < 0.02,
        `mesa ${n}: esperada en (${ea.toFixed(3)},${eb.toFixed(3)}) y está en (${B[n].a.toFixed(3)},${B[n].b.toFixed(3)})`);
    });
  });

  await step("interior: la entrada gira con la sala (pasa a la pared de arriba)", async () => {
    const mark = await page.evaluate(() => {
      const t = [...document.querySelectorAll("#room text")].find((e) => e.textContent.trim() === "ENTRADA");
      const vb = document.getElementById("room").getAttribute("viewBox").split(" ").map(Number);
      return t ? { x: +t.getAttribute("x"), y: +t.getAttribute("y"), W: vb[2], H: vb[3] } : null;
    });
    assert.ok(mark, "se sigue viendo la marca ENTRADA");
    assert.ok(mark.y < mark.H * 0.35, `la entrada debería estar arriba, y está en y=${Math.round(mark.y)} de ${mark.H}`);
  });

  let intBack;
  await step("interior: volver a Vertical deja las mesas donde estaban", async () => {
    await page.locator('[data-o="p"]').click();
    await wait(300);
    intBack = await readPlan(page);
    assert.equal(intBack.viewBox, intP.viewBox);
    Object.keys(intP.tables).forEach((n) => {
      const a = intBack.tables[n], o = intP.tables[n];
      // margen de unos pocos píxeles: en apaisado la hoja es baja, y una mesa
      // que queda pegada a la pared de arriba se separa lo justo para no salirse
      // de la hoja (el mismo tope que ya existía al arrastrarlas a mano)
      assert.ok(a && Math.abs(a.x - o.x) <= 10 && Math.abs(a.y - o.y) <= 10,
        `la mesa ${n} no vuelve a su sitio: ${JSON.stringify(a)} vs ${JSON.stringify(o)}`);
    });
    const entrada = await page.evaluate(() => {
      const t = [...document.querySelectorAll("#room text")].find((e) => e.textContent.trim() === "ENTRADA");
      const vb = document.getElementById("room").getAttribute("viewBox").split(" ").map(Number);
      return t ? { x: +t.getAttribute("x"), W: vb[2] } : null;
    });
    assert.ok(entrada && entrada.x < entrada.W * 0.35, "la entrada vuelve a la pared izquierda");
  });

  await step("girar muchas veces no va desplazando las mesas poco a poco", async () => {
    for (let i = 0; i < 4; i++) {
      await page.locator(i % 2 === 0 ? '[data-o="l"]' : '[data-o="p"]').click();
      await wait(220);
    }
    const again = await readPlan(page);
    assert.equal(again.viewBox, intBack.viewBox);
    Object.keys(intBack.tables).forEach((n) => {
      const a = again.tables[n], o = intBack.tables[n];
      assert.ok(a && Math.abs(a.x - o.x) < 1 && Math.abs(a.y - o.y) < 1,
        `la mesa ${n} se desplaza al girar repetidamente: ${JSON.stringify(a)} vs ${JSON.stringify(o)}`);
    });
  });

  await step("deshacer devuelve el plano a como estaba antes de girar", async () => {
    const before = await readPlan(page);
    await page.locator('[data-o="l"]').click();
    await wait(300);
    assert.notEqual((await readPlan(page)).viewBox, before.viewBox);
    await page.locator("#undo").click();
    await wait(350);
    const back = await readPlan(page);
    assert.equal(back.viewBox, before.viewBox);
    Object.keys(before.tables).forEach((n) => {
      const a = back.tables[n], o = before.tables[n];
      assert.ok(a && Math.abs(a.x - o.x) < 1 && Math.abs(a.y - o.y) < 1, `la mesa ${n} no vuelve con Deshacer`);
    });
  });

  await step("cambiar el tamaño de la sala a mano NO gira el plano", async () => {
    // se prueba en el exterior porque su contorno tiene forma propia: si al
    // ensanchar la hoja cambiara la orientación, la sala pegaría un giro de 90°
    // de golpe con las mesas quietas
    await page.locator('[data-loc="exterior"]').click();
    await wait(250);
    const tall = await readPlan(page);
    assert.ok(tall.box.h > tall.box.w, "la sala exterior parte de pie");
    await page.locator("#rsz-h").focus();
    for (let i = 0; i < 30; i++) await page.keyboard.press("Shift+ArrowRight");
    await wait(400);
    const wide = await readPlan(page);
    const [W, H] = wide.viewBox.split(" ").slice(2).map(Number);
    assert.ok(W > H, "la hoja se ha ensanchado de verdad");
    assert.equal(await page.locator('[data-o="p"]').getAttribute("aria-pressed"), "true",
      "el plano sigue siendo el vertical, solo que en una hoja más ancha");
    assert.ok(wide.box.h > wide.box.w, "el contorno de la sala no se ha tumbado solo");
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
