#!/usr/bin/env node
/*
 * Pruebas en un navegador de verdad (Chromium), contra dist/:
 *   - ninguna página se sale de lado en el móvil ni da errores de JavaScript
 *   - el menú del móvil abre, cierra con Esc y deja el foco en su botón
 *   - la cabecera se vuelve sólida al bajar
 *   - el selector de idioma lleva a la misma página en el otro idioma
 *   - el mapa solo se carga al pedirlo
 *   - el formulario de eventos no se envía incompleto y, completo, prepara el correo
 *   - una dirección que no existe da 404 con su página propia
 * Uso: npm run build && node tools/test-browser.mjs
 */
import assert from 'node:assert/strict';
import { launch } from './browser.mjs';
import { createServer } from './serve.mjs';
import ca from '../src/i18n/ca.mjs';
import es from '../src/i18n/es.mjs';
import en from '../src/i18n/en.mjs';

const all = { ca, es, en };
const server = createServer().listen(0);
const base = `http://localhost:${server.address().port}`;
const browser = await launch();
let passed = 0;
const ok = (msg) => (passed++, console.log('✓', msg));

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', ...opts });
  const page = await ctx.newPage();
  // Nada de red externa en las pruebas (Google Maps).
  await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/net::ERR_FAILED/.test(m.text()) && errors.push(m.text()));
  return { ctx, page, errors };
}

try {
  /* 1. Todas las páginas, en móvil: sin scroll lateral y sin errores. */
  {
    const { ctx, page, errors } = await newPage({ viewport: { width: 360, height: 740 }, isMobile: true });
    const routes = Object.values(all).flatMap((t) => Object.values(t.routes));
    for (const r of routes) {
      const res = await page.goto(base + r);
      assert.equal(res.status(), 200, `${r} responde ${res.status()}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(overflow <= 0, `${r} se sale ${overflow}px por la derecha en el móvil`);
    }
    assert.deepEqual(errors, [], `errores de JavaScript: ${errors.join(' | ')}`);
    ok(`${routes.length} páginas en móvil (360 px): sin scroll lateral ni errores`);
    await ctx.close();
  }

  /* 2. Menú del móvil. */
  {
    const { ctx, page } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await page.goto(base + '/');
    const toggle = page.locator('.nav-toggle');
    const link = page.locator('#site-nav .nav__list a', { hasText: ca.ui.nav.restaurant });
    assert.equal(await link.isVisible(), false, 'el menú empieza cerrado');
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await link.waitFor({ state: 'visible' });
    assert.equal(await toggle.innerText(), ca.ui.closeMenu);
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await link.waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('nav-toggle')), true);
    await toggle.click();
    await link.click();
    await page.waitForURL(base + ca.routes.restaurant);
    ok('menú del móvil: abre, cierra con Esc, devuelve el foco y navega');
    await ctx.close();
  }

  /* 3. Cabecera, idiomas, mapa (escritorio). */
  {
    const { ctx, page } = await newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(base + '/');
    const header = page.locator('[data-header]');
    assert.equal(await header.evaluate((h) => h.classList.contains('is-scrolled')), false);
    await page.mouse.wheel(0, 900);
    await page.waitForFunction(() => document.querySelector('[data-header]').classList.contains('is-scrolled'));
    ok('cabecera transparente sobre la foto y sólida al bajar');

    await page.goto(base + ca.routes.restaurant);
    await page.locator('.langs--header a[hreflang="es"]').click();
    await page.waitForURL(base + es.routes.restaurant);
    assert.equal(await page.getAttribute('html', 'lang'), 'es');
    await page.locator('.langs--header a[hreflang="en"]').click();
    await page.waitForURL(base + en.routes.restaurant);
    ok('el selector de idioma mantiene la página (restaurant → restaurante → restaurant)');

    await page.goto(base + ca.routes.reserva);
    assert.equal(await page.locator('.map iframe').count(), 0, 'el mapa no se carga solo');
    await page.locator('.map__load').click();
    const src = await page.locator('.map iframe').getAttribute('src');
    assert.match(src, /^https:\/\/www\.google\.com\/maps\?q=.*Ulldecona.*output=embed$/);
    ok('el mapa de Google solo se carga al pulsar «Veure el mapa»');
    await ctx.close();
  }

  /* 4. Formulario de eventos (sin endpoint: prepara el correo). */
  {
    const { ctx, page } = await newPage({ viewport: { width: 1280, height: 900 } });
    // Capturar el mailto en vez de abrir el programa de correo.
    await page.addInitScript(() => {
      window.__mail = null;
      document.addEventListener(
        'click',
        (e) => {
          const a = e.target.closest && e.target.closest('a[href^="mailto:"]');
          if (a && a.hidden) (window.__mail = a.href), e.preventDefault();
        },
        true
      );
    });
    await page.goto(base + ca.routes.events);
    const status = page.locator('.form__status');
    await page.locator('.form [type=submit]').click();
    assert.equal(await status.innerText(), '', 'no se envía vacío');
    await page.fill('#f-name', 'Anna Prova');
    await page.fill('#f-email', 'anna@example.com');
    await page.selectOption('#f-type', { index: 1 });
    await page.fill('#f-guests', '120');
    await page.fill('#f-message', 'Casament al setembre');
    await page.locator('.form [type=submit]').click();
    assert.equal(await status.innerText(), '', 'no se envía sin aceptar la privacidad');
    await page.check('#f-consent');
    await page.locator('.form [type=submit]').click();
    await page.waitForFunction(() => document.querySelector('.form__status').textContent.length > 0);
    assert.equal(await status.innerText(), ca.pages.events.form.mailOpened);
    const mail = decodeURIComponent(await page.evaluate(() => window.__mail));
    assert.match(mail, /^mailto:lesmoles@lesmoles\.com\?subject=Petició d’informació/);
    assert.match(mail, /Nom i cognoms: Anna Prova/);
    assert.match(mail, /Tipus d’esdeveniment: Casament/);
    assert.match(mail, /Nombre de convidats: 120/);
    assert.doesNotMatch(mail, /Website|consent/i);
    ok('formulario de eventos: exige los obligatorios y la privacidad, y prepara el correo');
    await ctx.close();
  }

  /* 5. 404. */
  {
    const { ctx, page } = await newPage();
    let res = await page.goto(base + '/aixo-no-existeix/');
    assert.equal(res.status(), 404);
    assert.equal(await page.locator('h1').innerText(), ca.pages.notFound.heading);
    res = await page.goto(base + '/en/nope/');
    assert.equal(res.status(), 404);
    assert.equal(await page.locator('h1').innerText(), en.pages.notFound.heading);
    ok('las direcciones que no existen dan 404 en su idioma');
    await ctx.close();
  }

  console.log(`\n${passed} comprobaciones en el navegador, todas bien.`);
} catch (e) {
  console.error('✗', e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
