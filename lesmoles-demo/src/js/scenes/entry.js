/*
 * 00 · Les Moles + manifiesto.
 * Al bajar, la foto de la cantera se contrae en una muela que gira despacio,
 * y el manifiesto se ilumina palabra a palabra a su lado.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { $, $$, MQ } from '../env.js';

export function initEntry(mm) {
  const stage = $('[data-entry-stage]');
  const media = $('[data-entry-media]', stage);
  const inner = $('.media__inner', media);
  const text = $('[data-manifesto-text]', stage);
  const ring = $('[data-entry-ring]', stage);
  const circ = { r: 0, x: 50, y: 50 };
  const full = () => Math.hypot(window.innerWidth, window.innerHeight) / 2 + 4;
  let smallR = () => 200;
  // withRing: el anillo de la muela aparece a medida que la foto se contrae.
  const apply = (withRing) => {
    media.style.clipPath = `circle(${circ.r.toFixed(1)}px at ${circ.x}% ${circ.y}%)`;
    if (withRing !== true) return void (ring.style.opacity = 0);
    const d = circ.r * 2 * 1.075;
    const cx = (circ.x / 100) * window.innerWidth;
    const cy = (circ.y / 100) * window.innerHeight;
    const t = gsap.utils.clamp(0, 1, (full() - circ.r) / (full() - smallR()));
    ring.style.width = `${d}px`;
    ring.style.left = `${cx - d / 2}px`;
    ring.style.top = `${cy - d / 2}px`;
    ring.style.opacity = (t * t).toFixed(3);
  };

  mm.add({ desk: MQ.desk, small: MQ.small }, (ctx) => {
    const { desk } = ctx.conditions;
    const split = SplitText.create(text, { type: 'words', wordsClass: 'word' });
    smallR = () => (desk ? Math.min(window.innerWidth * 0.2, window.innerHeight * 0.34) : window.innerWidth * 0.34);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'entry',
        trigger: stage,
        start: 'top top',
        end: () => '+=' + window.innerHeight * (desk ? 2.4 : 1.9),
        pin: true,
        scrub: 0.9,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(
      circ,
      { r: full, x: 50, y: 50 },
      { r: () => smallR(), x: desk ? 25 : 50, y: desk ? 50 : 27, duration: 0.42, ease: 'power2.inOut', immediateRender: false, onUpdate: () => apply(true) },
      0
    )
      .fromTo(inner, { rotate: 0, scale: 1 }, { rotate: -34, scale: 1.14, duration: 1 }, 0)
      // fromTo explícitos: no dependen de en qué punto de la entrada se midan.
      .fromTo('[data-hero-title]', { yPercent: 0, autoAlpha: 1 }, { yPercent: -28, autoAlpha: 0, duration: 0.24, ease: 'power1.in', immediateRender: false }, 0)
      .fromTo('[data-hero-fade]', { y: 0, autoAlpha: 1 }, { y: -40, autoAlpha: 0, duration: 0.18, stagger: 0.012, ease: 'power1.in', immediateRender: false }, 0)
      .fromTo('[data-entry-shade]', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, 0)
      .fromTo('[data-manifesto]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.3)
      .fromTo('.entry__mlabel', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.34)
      .fromTo(split.words, { opacity: 0.12 }, { opacity: 1, duration: 0.05, stagger: 0.011 }, 0.38)
      .fromTo('.entry__mcap', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.8)
      .fromTo(ring, { rotation: 0 }, { rotation: 70, duration: 1, immediateRender: false }, 0);

    return () => split.revert();
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

  return { circ, apply, full, media };
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
