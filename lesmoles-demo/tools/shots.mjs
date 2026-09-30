#!/usr/bin/env node
/*
 * Recorre la Home como un usuario (scroll real, con las animaciones) y
 * guarda una captura por pantalla en escritorio, tableta y móvil.
 *   npm run build && npm run shots            → capturas/
 *   SHOTS_DIR=… VIEWPORTS=desktop,mobile npm run shots
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.env.SHOTS_DIR || path.join(ROOT, 'capturas'));
const ALL = {
  desktop: { width: 1440, height: 900, step: 0.7 },
  tablet: { width: 834, height: 1194, step: 0.75, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, step: 0.75, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};
const which = (process.env.VIEWPORTS || 'desktop,tablet,mobile').split(',');
const reduce = process.env.REDUCE === '1';

const server = await preview({ root: ROOT, preview: { port: 0, open: false }, logLevel: 'error' });
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
fs.mkdirSync(OUT, { recursive: true });

for (const name of which) {
  const vp = ALL[name];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1,
    reducedMotion: reduce ? 'reduce' : 'no-preference',
    timezoneId: 'Europe/Madrid', locale: 'es-ES',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(reduce ? 800 : 5200);
  let i = 0;
  const shot = async () => page.screenshot({ path: path.join(OUT, `${name}-${String(i++).padStart(2, '0')}.png`) });
  await shot();
  for (let guard = 0; guard < 90; guard++) {
    const { y, max } = await page.evaluate(() => ({ y: scrollY, max: document.documentElement.scrollHeight - innerHeight }));
    if (y >= max - 2) break;
    const d = Math.round(vp.height * vp.step);
    if (vp.hasTouch) await page.evaluate((d) => window.scrollBy(0, d), d);
    else await page.mouse.wheel(0, d);
    await page.waitForTimeout(1300);
    await shot();
  }
  console.log(`${name}: ${i} capturas${errors.length ? ` · ERRORES: ${[...new Set(errors)].join(' | ')}` : ' · sin errores'}`);
  await ctx.close();
}
await browser.close();
server.httpServer.close();
