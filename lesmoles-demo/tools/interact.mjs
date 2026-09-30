#!/usr/bin/env node
// Capturas de las interacciones: menú abierto, vista previa de los menús,
// cursor, acordeón y salto con cortina. npm run build && node tools/interact.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.env.SHOTS_DIR || path.join(ROOT, 'capturas'));
fs.mkdirSync(OUT, { recursive: true });
const server = await preview({ root: ROOT, preview: { port: 0 }, logLevel: 'error' });
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const errors = [];

// Escritorio
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5200);
  await page.mouse.move(1200, 36);
  await page.click('[data-menu-open]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'i-menu-abriendo.png') });
  await page.waitForTimeout(1400);
  await page.hover('.menu__nav li:nth-child(3) a');
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'i-menu-abierto.png') });
  const focusedInMenu = await page.evaluate(() => !!document.activeElement.closest('[data-menu]'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1400);
  const closed = await page.evaluate(() => document.querySelector('[data-menu]').hidden && document.activeElement.matches('[data-menu-open]'));
  // Salto con cortina a Los caminos
  await page.click('[data-menu-open]');
  await page.waitForTimeout(1600);
  await page.click('.menu__nav a[href="#menus"]');
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'i-cortina.png') });
  await page.waitForTimeout(1800);
  const atMenus = await page.evaluate(() => Math.abs(document.querySelector('#menus').getBoundingClientRect().top) < 80);
  await page.screenshot({ path: path.join(OUT, 'i-tras-salto.png') });
  // Vista previa que sigue al cursor + acordeón
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(1500);
  const row = await page.$('.mrow:nth-child(2) .mrow__head');
  const b = await row.boundingBox();
  await page.mouse.move(b.x + 400, b.y + b.height / 2, { steps: 8 });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'i-menus-hover.png') });
  await row.click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(OUT, 'i-menus-abierto.png') });
  const expanded = await row.getAttribute('aria-expanded');
  console.log(JSON.stringify({ focusedInMenu, closed, atMenus, expanded }));
  await page.close();
}
// Móvil: menú
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5200);
  await page.screenshot({ path: path.join(OUT, 'i-movil-hero.png') });
  await page.tap('[data-menu-open]');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, 'i-movil-menu.png') });
  await ctx.close();
}
// Movimiento reducido
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'i-reduce-hero.png') });
  await page.evaluate(() => window.scrollTo(0, innerHeight * 1.1));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'i-reduce-manifiesto.png') });
  const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity === '0' || getComputedStyle(e).visibility === 'hidden').length);
  console.log(JSON.stringify({ reduceHidden: hidden }));
  await ctx.close();
}
console.log(errors.length ? 'ERRORES: ' + [...new Set(errors)].join(' | ') : 'sin errores');
await browser.close();
server.httpServer.close();
