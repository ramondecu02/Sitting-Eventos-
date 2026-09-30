#!/usr/bin/env node
/*
 * Capturas de todas las páginas (escritorio y móvil) para revisar el diseño
 * sin abrir el navegador:  npm run shots  → capturas/ (o SHOTS_DIR=...)
 * Construir antes con  npm run build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './browser.mjs';
import { createServer } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.env.SHOTS_DIR || path.join(ROOT, 'capturas'));
const only = process.argv.slice(2); // p. ej.: npm run shots -- / /events/

const PAGES = only.length
  ? only
  : ['/', '/restaurant/', '/events/', '/la-casa/', '/reserva/', '/avis-legal/', '/es/', '/en/', '/no-existeix/'];
const VIEWPORTS = [
  { name: 'escritorio', width: 1440, height: 900 },
  { name: 'movil', width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
];

const server = createServer().listen(0);
const port = server.address().port;
const browser = await launch();
fs.mkdirSync(OUT, { recursive: true });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    deviceScaleFactor: vp.deviceScaleFactor || 1,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(`http://localhost:${port}${p}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Bajar hasta el final para que carguen las fotos diferidas (loading=lazy).
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    const name = (p.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'inici') + `.${vp.name}.png`;
    await page.screenshot({ path: path.join(OUT, name), fullPage: true });
    console.log('·', name);
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`✓ capturas en ${OUT}`);
