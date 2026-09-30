/*
 * Cursor propio, solo con ratón: un punto oliva (sin modos de fusión, que
 * obligan a recomponer la pantalla en cada movimiento) y, cuando hay una
 * acción real, una etiqueta al lado que la nombra (Explorar, Descubrir,
 * Reservar…). Nunca tapa el texto sobre el que está.
 */
import { gsap } from 'gsap';
import { $, env } from './env.js';

export function initCursor() {
  if (!env.fine || env.reduce) return;
  const el = $('[data-cursor-el]');
  const dot = $('.cursor__dot', el);
  const ring = $('.cursor__ring', el);
  const label = $('[data-cursor-label]', el);
  document.documentElement.classList.add('has-cursor');

  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX + 18);
    ry(e.clientY + 18);
    el.classList.remove('is-hidden');
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.add('is-hidden'));

  const TARGET = '[data-cursor], a[href], button';
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest(TARGET);
    if (!t) return;
    label.textContent = t.dataset.cursor || 'Explorar';
    el.classList.add('is-active');
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest(TARGET);
    if (t && !t.contains(e.relatedTarget)) el.classList.remove('is-active');
  });
  document.addEventListener('pointerdown', () => gsap.to(dot, { scale: 2.4, duration: 0.2, yoyo: true, repeat: 1 }));
}
