/*
 * 00 · Les Moles + manifiesto.
 * Al bajar, la foto de la cantera se contrae en una muela que gira despacio,
 * y el manifiesto se ilumina palabra a palabra a su lado.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$, MQ } from '../env.js';
import { createDisc } from '../disc.js';

export function initEntry(mm) {
  const stage = $('[data-entry-stage]');
  const disc = createDisc($('[data-entry-disc]', stage));
  const media = $('[data-entry-media]', stage);
  const inner = $('.media__inner', media);
  const text = $('[data-manifesto-text]', stage);
  const ring = $('[data-entry-ring]', stage);
  const cue = $('.entry__scroll', stage);
  // p: 0 = la cantera a pantalla completa, 1 = la muela. rot: giro del anillo.
  const state = { p: 0, rot: 0 };
  let target = { x: 50, y: 50 };
  let smallR = () => 200;
  let locked = false; // mientras el preloader abre la muela

  const measure = () => {
    disc.measure();
    const d = smallR() * 2 * 1.075;
    stage.style.setProperty('--ring-d', `${d.toFixed(1)}px`);
    stage.style.setProperty('--ring-sw', ((0.55 * 200) / d).toFixed(3));
  };

  const draw = () => {
    if (locked) return;
    const { w, h, full } = disc.g;
    const { p } = state;
    const r = full + (smallR() - full) * p;
    const { dx, dy } = disc.set(r, ((50 + (target.x - 50) * p) / 100) * w, ((50 + (target.y - 50) * p) / 100) * h);
    // El anillo de la muela aparece a medida que la foto se contrae.
    ring.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${state.rot}deg) scale(${r / smallR()})`;
    ring.style.opacity = (p * p).toFixed(3);
  };

  mm.add({ desk: MQ.desk, small: MQ.small }, (ctx) => {
    const { desk } = ctx.conditions;
    const split = SplitText.create(text, { type: 'words', wordsClass: 'word' });
    smallR = () => (desk ? Math.min(disc.g.w * 0.2, disc.g.h * 0.34) : disc.g.w * 0.34);
    target = desk ? { x: 25, y: 50 } : { x: 50, y: 27 };
    measure();

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: draw,
      scrollTrigger: {
        id: 'entry',
        trigger: stage,
        start: 'top top',
        end: () => '+=' + window.innerHeight * (desk ? 2.4 : 1.9),
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        // La animación de «Desliza para entrar» se para en cuanto se baja.
        onUpdate: (self) => cue.classList.toggle('is-off', self.progress > 0.02),
      },
    });
    tl.fromTo(state, { p: 0 }, { p: 1, duration: 0.42, ease: 'power2.inOut', immediateRender: false }, 0)
      .fromTo(state, { rot: 0 }, { rot: 70, duration: 1, immediateRender: false }, 0)
      .fromTo(inner, { rotate: 0, scale: 1 }, { rotate: -34, scale: 1.14, duration: 1 }, 0)
      // fromTo explícitos: no dependen de en qué punto de la entrada se midan.
      .fromTo('[data-hero-title]', { yPercent: 0, autoAlpha: 1 }, { yPercent: -28, autoAlpha: 0, duration: 0.24, ease: 'power1.in', immediateRender: false }, 0)
      .fromTo('[data-hero-fade]', { y: 0, autoAlpha: 1 }, { y: -40, autoAlpha: 0, duration: 0.18, stagger: 0.012, ease: 'power1.in', immediateRender: false }, 0)
      .fromTo('[data-entry-shade]', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, 0)
      .fromTo('[data-manifesto]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.3)
      .fromTo('.entry__mlabel', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.34)
      .fromTo(split.words, { opacity: 0.12 }, { opacity: 1, duration: 0.05, stagger: 0.011 }, 0.38)
      .fromTo('.entry__mcap', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.8);

    // Al redimensionar: medir de nuevo y redibujar donde esté la entrada.
    const onRefresh = () => (measure(), draw());
    ScrollTrigger.addEventListener('refresh', onRefresh);
    return () => {
      split.revert();
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      disc.reset();
      ring.style.transform = '';
      ring.style.opacity = '';
    };
  });

  // Profundidad con el ratón en la portada: cada capa a su velocidad.
  mm.add('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const layers = [
      ['.entry__title', 14],
      ['.entry__tag', 26],
      ['.entry__coords', 8],
      ['.entry__place', 6],
    ].map(([s, k]) => ({ k, x: gsap.quickTo(s, 'x', { duration: 1.4, ease: 'power3' }), y: gsap.quickTo(s, 'y', { duration: 1.4, ease: 'power3' }) }));
    const onMove = (ev) => {
      if (window.scrollY > window.innerHeight * 0.3) return;
      const nx = ev.clientX / window.innerWidth - 0.5;
      const ny = ev.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => (l.x(-nx * l.k), l.y(-ny * l.k)));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  });

  return {
    disc,
    draw,
    // El preloader toma el control de la muela mientras la abre.
    lock: (v) => (locked = v),
  };
}

// Cuando se abre la muela: el nombre sube letra a letra y lo demás aparece.
export function heroIntro() {
  const lines = $$('[data-hero-title] .entry__line');
  const split = SplitText.create(lines, { type: 'chars', mask: 'chars', charsClass: 'char' });
  const inner = $('[data-entry-media] .media__inner');
  const tl = gsap.timeline();
  tl.fromTo(inner, { scale: 1.32 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 0)
    .from(split.chars, { yPercent: 108, duration: 1.5, stagger: 0.055, ease: 'expo.out' }, 0.35)
    .from('[data-hero-fade]', { autoAlpha: 0, y: 24, duration: 1.2, stagger: 0.08, ease: 'expo.out' }, 0.8)
    .from('[data-nav] > *', { autoAlpha: 0, y: -12, duration: 1, stagger: 0.08, ease: 'expo.out' }, 0.9);
  return tl;
}
