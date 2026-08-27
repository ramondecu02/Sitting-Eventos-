#!/usr/bin/env node
/**
 * test_web.js — flujo completo contra un servidor real: dos personas del
 * equipo compartiendo un evento (sincronización), exportar a PDF de
 * principio a fin, y la regresión conocida del logo duplicado en móvil.
 *
 * Nota importante sobre lo que comprueba la parte de sincronización: el
 * servidor no fusiona campo a campo dos ediciones simultáneas — cada
 * guardado sustituye el EVENTO ENTERO, y gana el que tenga el "updated"
 * más reciente (mergeRemote() en sitting.html). Por eso el escenario de
 * abajo es el flujo real y seguro: Alicia edita y sincroniza → Bruno CARGA
 * la versión de Alicia (la ve en su desplegable) y edita encima de ella →
 * Alicia recarga y ve las dos ediciones juntas. Esto NO comprueba que dos
 * personas escribiendo a la vez sin recargar entre medio se fusionen solas
 * — eso no ocurre hoy: si los dos guardan casi al mismo tiempo sin que uno
 * haya cargado antes los cambios del otro, gana quien guarde el último y
 * el otro cambio se pierde en el servidor (se recupera solo si esa persona
 * no ha recargado, porque su copia local sigue intacta). Vale la pena que
 * el equipo lo sepa.
 *
 * Arranque: igual que test_smoke.js — ver la cabecera de ese archivo para
 * las variables de entorno y cómo arrancar el servidor en el puerto 3200.
 */

const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE_URL = process.env.SITTING_TEST_URL || "http://localhost:3200";
const TEAM_PASSWORD = process.env.TEAM_PASSWORD;

if (!TEAM_PASSWORD) {
  console.error("Falta TEAM_PASSWORD en el entorno — tiene que ser la misma con la que arrancaste el servidor.");
  process.exit(1);
}

// el guardado local tarda 400ms en dispararse tras la última tecla, y el
// empujón al servidor otros 900ms más (ver queueRemoteSave/pushRemote en
// sitting.html) — se espera de sobra para no perseguir el timing exacto
const SYNC_WAIT_MS = 2500;

let passed = 0;
let failed = 0;

async function step(name, fn) {
  try {
    await fn();
    console.log(`OK   ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL ${name}`);
    console.error(`     ${err.stack || err.message}`);
    failed++;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function login(browser, password) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE_URL + "/login");
  await page.locator("#password").fill(password);
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/"),
    page.locator('button[type="submit"]').click(),
  ]);
  await page.locator("#appSitting").waitFor({ state: "visible" });
  return { ctx, page };
}

async function assertSrcContains(page, text) {
  const value = await page.locator("#src").inputValue();
  assert.ok(value.includes(text), `esperaba encontrar "${text}" en la lista de invitados, y no estaba`);
}

async function assertVisibleText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 5000 });
}

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });

  const token = "E2E-" + Date.now();
  const eventTitle = "Sync test " + token;
  let aliciaCtx, aliciaPage, brunoCtx;

  await step("Alicia crea un evento nuevo y lo edita", async () => {
    const { ctx, page } = await login(browser, TEAM_PASSWORD);
    aliciaCtx = ctx;
    aliciaPage = page;
    await page.locator("#new").click();
    await page
      .locator("#src")
      .fill(`# ${eventTitle}\n@ ${token}\n\nM1 | Redonda 10 | Mesa de Alicia\nInvitada Alicia (${token})\n`);
    await wait(SYNC_WAIT_MS);
  });

  await step("Bruno entra, ve el evento de Alicia en su desplegable y edita encima", async () => {
    const { ctx, page } = await login(browser, TEAM_PASSWORD);
    brunoCtx = ctx;
    await wait(1500); // margen para que hydrateFromServer() termine su fetch
    await page.locator("#ev").selectOption({ label: eventTitle });
    await assertSrcContains(page, "Mesa de Alicia");
    const current = await page.locator("#src").inputValue();
    await page.locator("#src").fill(current + `\nM2 | Redonda 10 | Mesa de Bruno\nInvitado Bruno (${token})\n`);
    await wait(SYNC_WAIT_MS);
  });

  await step("Alicia recarga y ve también la mesa que añadió Bruno", async () => {
    await aliciaPage.goto(BASE_URL + "/");
    await aliciaPage.locator("#appSitting").waitFor({ state: "visible" });
    await wait(1500); // margen para hydrateFromServer() en esta recarga
    await assertSrcContains(aliciaPage, "Mesa de Alicia");
    await assertSrcContains(aliciaPage, "Mesa de Bruno");
  });

  await step("Exportar PDF descarga un archivo y cierra el panel en orden", async () => {
    await aliciaPage.locator("#pdfBtn").click();
    await aliciaPage.locator(".ovl").waitFor({ state: "visible" });
    const downloadPromise = aliciaPage.waitForEvent("download");
    await aliciaPage.locator("#ov-pdf").click();
    const download = await downloadPromise;
    assert.match(download.suggestedFilename(), /\.pdf$/);
    await assertVisibleText(aliciaPage, "Guardado");
    // orden correcto: esperar el éxito visible ANTES de cerrar (ver traspaso)
    await aliciaPage.locator("#ov-close").click();
    await aliciaPage.locator(".ovl").waitFor({ state: "detached" });
  });

  await step("Móvil: el logo no sale duplicado (regresión conocida)", async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await page.locator(".launcher-logo").first().waitFor({ state: "visible", timeout: 5000 });
    const brandLogoVisible = await page
      .locator(".brand .brand-logo")
      .first()
      .isVisible()
      .catch(() => false);
    assert.equal(
      brandLogoVisible,
      false,
      'el logo dentro de ".brand" no debería verse en móvil (ya se ve en el header fijo ".launcher")'
    );
    await ctx.close();
  });

  if (aliciaCtx) await aliciaCtx.close();
  if (brunoCtx) await brunoCtx.close();
  await browser.close();

  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
