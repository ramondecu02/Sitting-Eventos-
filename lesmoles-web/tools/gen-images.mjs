#!/usr/bin/env node
/*
 * Genera las imágenes fijas de src/static/ con Chromium (Playwright):
 *   og.jpg (1200×630, la que sale al compartir un enlace), apple-touch-icon.png,
 *   icon-192.png, icon-512.png y favicon.ico.
 * Solo hace falta volver a lanzarlo si cambia la marca:  npm run images
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATIC = path.join(ROOT, 'src/static');
const FONTS = path.join(ROOT, 'src/assets/fonts');
// En línea (data:) porque una página de setContent no puede leer file://.
const fontUrl = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(FONTS, f)).toString('base64')}`;

const base = `
@font-face{font-family:K;font-weight:200 800;src:url(${fontUrl('karla-latin-wght-normal.woff2')})}
@font-face{font-family:C;font-weight:300 700;font-style:italic;src:url(${fontUrl('cormorant-garamond-latin-wght-italic.woff2')})}
*{margin:0;box-sizing:border-box}
body{width:100vw;height:100vh;overflow:hidden}
.stone{position:relative;width:100%;height:100%;
  background:radial-gradient(70% 70% at 25% 20%,rgba(214,170,98,.38),transparent 70%),
             radial-gradient(50% 50% at 85% 85%,rgba(150,105,55,.28),transparent 70%),
             linear-gradient(160deg,#2e261d,#1a1611 55%,#120f0b)}
.stone::before{content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(174deg,rgba(255,255,255,.05) 0 1px,transparent 1px 19px),
             repeating-linear-gradient(177deg,rgba(0,0,0,.08) 0 2px,transparent 2px 53px)}
`;

const og = `<style>${base}
.c{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 96px;color:#fff}
.w{font:300 104px/1 K;letter-spacing:.14em;text-transform:uppercase}
.w b{font-weight:700}
.s{margin-top:28px;font:italic 400 44px/1.2 C;color:#e9e1d3}
.l{margin-top:48px;display:flex;align-items:center;gap:18px;font:600 20px/1 K;letter-spacing:.24em;text-transform:uppercase;color:#d6b77f}
.l i{display:block;width:48px;height:1px;background:#d6b77f}
</style><div class="stone"><div class="c">
<div class="w">Les <b>Moles</b></div>
<div class="s">Restaurant · Events</div>
<div class="l"><i></i>Ulldecona · Terres de l’Ebre</div>
</div></div>`;

const icon = `<style>${base}
.stone{border-radius:0;display:grid;place-items:center}
svg{width:58%;height:58%;position:relative}
</style><div class="stone"><svg viewBox="0 0 32 32"><path d="M8.6 23V9.8l7.4 8.6 7.4-8.6V23" fill="none" stroke="#f8f5ef" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;

// ICO que envuelve un PNG (válido en todos los navegadores actuales).
function pngToIco(png, size) {
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(1, 4);
  head.writeUInt8(size >= 256 ? 0 : size, 6);
  head.writeUInt8(size >= 256 ? 0 : size, 7);
  head.writeUInt8(0, 8);
  head.writeUInt8(0, 9);
  head.writeUInt16LE(1, 10);
  head.writeUInt16LE(32, 12);
  head.writeUInt32LE(png.length, 14);
  head.writeUInt32LE(22, 18);
  return Buffer.concat([head, png]);
}

const browser = await launch();
const shot = async (html, w, h, type = 'png') => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot(type === 'jpeg' ? { type, quality: 86 } : { type });
  await page.close();
  return buf;
};

fs.mkdirSync(STATIC, { recursive: true });
fs.writeFileSync(path.join(STATIC, 'og.jpg'), await shot(og, 1200, 630, 'jpeg'));
fs.writeFileSync(path.join(STATIC, 'apple-touch-icon.png'), await shot(icon, 180, 180));
fs.writeFileSync(path.join(STATIC, 'icon-192.png'), await shot(icon, 192, 192));
fs.writeFileSync(path.join(STATIC, 'icon-512.png'), await shot(icon, 512, 512));
fs.writeFileSync(path.join(STATIC, 'favicon.ico'), pngToIco(await shot(icon, 32, 32), 32));
await browser.close();
console.log('✓ imágenes en src/static/');
