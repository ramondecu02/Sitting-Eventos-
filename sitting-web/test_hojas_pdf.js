#!/usr/bin/env node
/**
 * test_hojas_pdf.js — las hojas del Menú se descargan en PDF.
 *
 * Antes tenían un botón «Imprimir» que dejaba la hoja en manos del diálogo del
 * navegador: tablas partidas por la mitad, márgenes distintos en cada
 * ordenador y nada que se pudiera mandar por WhatsApp. Ahora se descargan como
 * el plano y el listado, con el mismo generador de PDF.
 *
 * Lo que se comprueba: que las cuatro hojas descargan un PDF de verdad (no un
 * archivo vacío ni un HTML), que el nombre del archivo lleva el evento y la
 * hoja, que el contenido que se ve en pantalla está DENTRO del PDF, y que una
 * hoja larga se reparte en varias páginas en vez de cortarse.
 *
 * Arranque: igual que los otros tests, ver la cabecera de test_smoke.js.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
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

/* Un PDF es texto latin-1 con tramos comprimidos; aquí no hay compresión, así
   que el texto de la hoja se puede buscar tal cual dentro del archivo. Los
   acentos van codificados en WinAnsi, así que se busca por trozos sin ellos. */
function contiene(buf, txt) {
  return buf.toString("latin1").includes(txt);
}
function paginas(buf) {
  const m = buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g);
  return m ? m.length : 0;
}

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pdfs-"));
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  const page = await (await browser.newContext({ acceptDownloads: true })).newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  await step("login, un evento grande y unos cuantos platos marcados", async () => {
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await page.locator("#ab-new").click(); await wait(400);
    let txt = "# Boda de prueba PDF\n@ 12/09/2026\n";
    for (let m = 1; m <= 7; m++) {
      txt += `\nMESA ${m} | Redonda 10 | Mesa ${m}\n`;
      for (let i = 0; i < 10; i++) txt += `Invitado ${m}-${i}\n`;
    }
    await page.locator("#src").fill(txt);
    await page.locator("#src").dispatchEvent("input");
    await wait(800);
    await page.locator("#ab-sec").selectOption("m-sel"); await wait(600);
    for (const q of ["Croquetas", "Lubina", "Cabrito", "Ajoblanco", "Arroz"]) {
      await page.locator("#mnu-q").fill(q);
      await page.locator("#mnu-q").dispatchEvent("input");
      await wait(400);
      const n = Math.min(3, await page.locator(".mnu-row").count());
      for (let i = 0; i < n; i++) {
        await page.locator(".mnu-row").nth(i).locator("input.mnu-chk").check().catch(() => {});
      }
      await wait(250);
    }
    await page.locator("#mnu-q").fill("");
    await page.locator("#mnu-q").dispatchEvent("input");
    await wait(400);
  });

  const bajadas = {};

  await step("LAS CUATRO HOJAS DESCARGAN UN PDF DE VERDAD", async () => {
    for (const [vista, hoja] of [["m-prod", "producción"], ["m-compra", "lista de compra"],
                                 ["m-serv", "check list de servicio"], ["m-card", "menú"]]) {
      await page.locator("#ab-sec").selectOption(vista); await wait(800);
      const btn = page.locator("#mnu-print-btn");
      assert.match(await btn.innerText(), /^Descargar .* en PDF$/,
        "el botón dice que descarga, no que imprime");
      const espera = page.waitForEvent("download");
      await btn.click();
      const d = await espera;
      const destino = path.join(dir, vista + ".pdf");
      await d.saveAs(destino);
      const buf = fs.readFileSync(destino);
      assert.ok(buf.length > 2000, hoja + ": el PDF tiene contenido (" + buf.length + " bytes)");
      assert.equal(buf.slice(0, 5).toString(), "%PDF-", hoja + ": es un PDF de verdad");
      assert.ok(buf.toString("latin1").includes("%%EOF"), hoja + ": el PDF está entero");
      bajadas[vista] = buf;
    }
  });

  await step("el archivo se llama con el evento y la hoja", async () => {
    await page.locator("#ab-sec").selectOption("m-compra"); await wait(700);
    const espera = page.waitForEvent("download");
    await page.locator("#mnu-print-btn").click();
    const d = await espera;
    const n = d.suggestedFilename();
    // algunos navegadores no exponen el nombre sugerido; si lo hacen, tiene que llevarlo
    if (n && n !== "download") {
      assert.match(n, /Boda_de_prueba_PDF/, "lleva el nombre del evento: " + n);
      assert.match(n, /lista_de_compra\.pdf$/, "y el de la hoja: " + n);
    }
  });

  await step("EL CONTENIDO DE LA PANTALLA ESTÁ DENTRO DEL PDF", async () => {
    // producción: el nombre de un plato y una cantidad escalada a 70 comensales
    assert.ok(contiene(bajadas["m-prod"], "Producci"), "el título");
    assert.ok(contiene(bajadas["m-prod"], "70 RACIONES") || contiene(bajadas["m-prod"], "70 raciones"),
      "las raciones, escaladas a los comensales del plano");
    // servicio: las secciones y una cantidad
    assert.ok(contiene(bajadas["m-serv"], "Platos"), "la sección de platos");
    assert.ok(contiene(bajadas["m-serv"], "Cubiertos"), "la de cubiertos");
    assert.ok(contiene(bajadas["m-serv"], "MOBILIARIO Y UTENSILIOS"), "y la de mobiliario");
    // menú: el nombre del evento
    assert.ok(contiene(bajadas["m-card"], "Boda de prueba PDF"), "el menú lleva el nombre del evento");
  });

  await step("una hoja larga se reparte en varias páginas", async () => {
    assert.ok(paginas(bajadas["m-prod"]) >= 2,
      "la producción de 15 platos no cabe en una página: " + paginas(bajadas["m-prod"]));
    assert.equal(paginas(bajadas["m-card"]), 1, "el menú, en cambio, cabe en una");
  });

  await step("el pie sale en todas las páginas", async () => {
    const t = bajadas["m-prod"].toString("latin1");
    const veces = (t.match(/Les Moles Events/g) || []).length;
    assert.ok(veces >= paginas(bajadas["m-prod"]),
      "cada página lleva su pie (" + veces + " en " + paginas(bajadas["m-prod"]) + " páginas)");
  });

  await step("sin platos marcados no se ofrece descargar nada", async () => {
    await page.locator("#ab-new").click(); await wait(600);
    await page.locator("#ab-sec").selectOption("m-prod"); await wait(600);
    assert.equal(await page.locator("#mnu-print-btn").count(), 0,
      "en un evento sin platos no hay hoja que bajar");
    assert.match(await page.locator("#mnu-body").innerText(), /No has marcado ningún plato/i);
  });

  await step("sin errores de JS en toda la prueba", async () => {
    assert.deepEqual(jsErrors, []);
  });

  await browser.close();
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}
main().catch((err) => { console.error("Error inesperado:", err); process.exit(1); });
