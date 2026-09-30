/*
 * La entrada: se dibuja la muela y, por su centro, se entra en la cantera.
 * Completa solo la primera vez en la sesión; después, un gesto breve.
 */
import { gsap } from 'gsap';
import { $, $$ } from './env.js';

export function runLoader({ first, entry, onOpen, onDone }) {
  const el = $('[data-loader]');
  const svg = $('.loader__mola', el);
  const rings = $$('.loader__ring', el);
  const eye = $('.loader__eye', el);
  const count = $('[data-count]', el);
  const word = $('.loader__word', el);

  rings.forEach((c) => {
    const len = c.getTotalLength();
    gsap.set(c, { strokeDasharray: len, strokeDashoffset: len });
  });

  // Radio del anillo exterior en píxeles: la foto se abrirá desde ahí.
  const ringRadius = () => (svg.getBoundingClientRect().width / 2) * 0.98;
  const n = { v: 0 };
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

  if (first) {
    tl.to(rings[0], { strokeDashoffset: 0, duration: 1.6 }, 0)
      .to(rings[1], { strokeDashoffset: 0, duration: 1.25 }, 0.25)
      .from(eye, { scale: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(2.2)' }, 0.95)
      .to(n, { v: 100, duration: 1.6, onUpdate: () => (count.textContent = String(Math.round(n.v)).padStart(3, '0')) }, 0)
      .from(word, { autoAlpha: 0, y: 10, duration: 0.8, ease: 'expo.out' }, 0.2)
      .to(svg, { rotate: 90, duration: 1.9, ease: 'power3.inOut' }, 0);
  } else {
    tl.to(rings, { strokeDashoffset: 0, duration: 0.55, stagger: 0.05 }, 0).set(count, { textContent: '100' }, 0);
  }

  // La muela se abre: la foto de la cantera crece desde el anillo.
  const o = { r: 0 };
  const open = () => entry.disc.set(o.r);
  tl.add(() => {
    entry.lock(true);
    o.r = ringRadius();
    open();
    onOpen();
  }, '+=0.12')
    .to(o, { r: () => entry.disc.g.full, duration: 1.7, ease: 'expo.inOut', onUpdate: open }, '>')
    .to(el, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.01 }, '<')
    .to([count, word], { autoAlpha: 0, duration: 0.4 }, '<')
    .to(svg, { scale: 3.2, autoAlpha: 0, duration: 1.3, ease: 'expo.inOut' }, '<')
    .add(() => {
      entry.disc.reset();
      entry.lock(false);
      entry.draw();
      onDone();
    });
}
