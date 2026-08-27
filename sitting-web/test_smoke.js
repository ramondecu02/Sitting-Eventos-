#!/usr/bin/env node
/**
 * test_smoke.js — comprobación rápida antes/después de cada despliegue.
 *
 * Qué hace: contra un servidor YA EN MARCHA (este script no lo arranca),
 * comprueba lo mínimo imprescindible: que sin sesión todo queda bloqueado,
 * que la contraseña de equipo funciona (y que una incorrecta no), que la
 * herramienta se sirve de verdad en "/", y que Salir cierra la sesión.
 *
 * Cómo se lanza:
 *   1) en una terminal:
 *        TEAM_PASSWORD=clave-de-pruebas SESSION_SECRET=secreto-de-pruebas-bien-largo \
 *        npx next dev -p 3200
 *      (sin DATABASE_URL se usa un archivo local — no hace falta Postgres para esto)
 *   2) en otra terminal, con la MISMA TEAM_PASSWORD exportada:
 *        TEAM_PASSWORD=clave-de-pruebas node test_smoke.js
 *
 * Variables de entorno que lee este script:
 *   TEAM_PASSWORD             obligatoria — la misma con la que arrancaste el servidor
 *   SITTING_TEST_URL          opcional — por defecto http://localhost:3200
 *   PLAYWRIGHT_CHROMIUM_PATH  opcional — ruta a un Chromium ya instalado, para
 *                             cuando "npx playwright install chromium" no sea
 *                             una opción en esa máquina (por ejemplo, un
 *                             contenedor con el navegador cacheado en otra ruta)
 *
 * No usa @playwright/test como test runner: es un script normal de Node que
 * usa la librería "playwright" directamente (require("playwright"), ya
 * añadida a package.json). Termina con código de salida 0 si todo pasa, 1
 * si algo falla — para que un CI lo pueda usar tal cual.
 */

const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE_URL = process.env.SITTING_TEST_URL || "http://localhost:3200";
const TEAM_PASSWORD = process.env.TEAM_PASSWORD;
const WRONG_PASSWORD = "contraseña-incorrecta-de-prueba";

if (!TEAM_PASSWORD) {
  console.error("Falta TEAM_PASSWORD en el entorno — tiene que ser la misma con la que arrancaste el servidor.");
  process.exit(1);
}

let passed = 0;
let failed = 0;

async function step(name, fn) {
  try {
    await fn();
    console.log(`OK   ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

async function assertVisibleText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 5000 });
}

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });

  // preflight: falla rápido y con un mensaje claro si el servidor no está arrancado
  {
    const ctx = await browser.newContext();
    try {
      await ctx.request.get(BASE_URL + "/login", { timeout: 5000 });
    } catch (err) {
      console.error(`No se puede conectar a ${BASE_URL}. ¿Está el servidor arrancado? (npx next dev -p 3200)`);
      await browser.close();
      process.exit(1);
    }
    await ctx.close();
  }

  let sharedCtx;

  await step('"/" sin sesión redirige a /login', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL + "/");
    assert.equal(new URL(page.url()).pathname, "/login");
    await ctx.close();
  });

  await step("/api/store sin sesión responde 401, no redirige", async () => {
    const ctx = await browser.newContext();
    const res = await ctx.request.get(BASE_URL + "/api/store");
    assert.equal(res.status(), 401);
    const body = await res.json();
    assert.equal(typeof body.error, "string");
    await ctx.close();
  });

  await step("contraseña incorrecta no entra y avisa", async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(WRONG_PASSWORD);
    await Promise.all([
      page.waitForURL(/\/login\?error=1/),
      page.locator('button[type="submit"]').click(),
    ]);
    await assertVisibleText(page, "Contraseña incorrecta");
    await ctx.close();
  });

  await step("contraseña correcta entra y sirve la herramienta", async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL + "/login");
    await page.locator("#password").fill(TEAM_PASSWORD);
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.locator("#appSitting").waitFor({ state: "visible" });
    assert.equal(await page.title(), "Sitting Les Moles Events");
    await page.locator("#src").waitFor({ state: "visible" });
    sharedCtx = ctx; // se reutiliza en los dos pasos siguientes (misma sesión)
  });

  await step("/api/store con sesión responde 200", async () => {
    if (!sharedCtx) throw new Error("no hay sesión iniciada (falló el paso anterior)");
    const res = await sharedCtx.request.get(BASE_URL + "/api/store");
    assert.equal(res.status(), 200);
  });

  await step("Salir cierra la sesión de verdad", async () => {
    if (!sharedCtx) throw new Error("no hay sesión iniciada (falló un paso anterior)");
    const page = await sharedCtx.newPage();
    await page.goto(BASE_URL + "/");
    await page.locator("#appSitting").waitFor({ state: "visible" });
    await Promise.all([
      page.waitForURL(/\/login/),
      page.getByText("Salir", { exact: true }).click(),
    ]);
    await page.goto(BASE_URL + "/");
    assert.equal(new URL(page.url()).pathname, "/login");
    await sharedCtx.close();
  });

  await browser.close();

  console.log(`\n${passed} OK, ${failed} fallidos.`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
