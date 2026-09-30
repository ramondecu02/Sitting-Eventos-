/*
 * Carriles horizontales (territorio y experiencia).
 * Escritorio: la sección se fija y el carril avanza con el scroll, las fotos
 * se revelan al entrar por la derecha y se desplazan dentro de su marco.
 * Tableta y móvil: carrusel nativo con snap (lo lleva el CSS).
 */
import { gsap } from 'gsap';
import { $, $$, MQ } from '../env.js';

export function initHScroll(mm) {
  $$('[data-hs]').forEach((hs, i) => {
    const track = $('[data-hs-track]', hs);
    const bar = $('[data-hs-bar]', hs);

    mm.add(MQ.desk, () => {
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const move = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          id: `hs-${i}`,
          trigger: hs,
          start: 'top top',
          end: () => '+=' + dist(),
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => bar && gsap.set(bar, { scaleX: self.progress }),
        },
      });

      // Cada foto: se revela al entrar y se desplaza dentro de su marco.
      // El borde avanza de derecha a izquierda: la capa de fuera entra desde
      // la derecha y la de dentro compensa, sin clip-path.
      $$('.media', track).forEach((m) => {
        const inner = $('.media__inner', m);
        gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: m, containerAnimation: move, start: 'left 96%', end: 'left 52%', scrub: true,
            onUpdate: (self) => m.classList.toggle('is-in', self.progress > 0.5),
          },
        })
          .fromTo($('.media__wipe', m), { xPercent: 100 }, { xPercent: 0 }, 0)
          .fromTo($('.media__wipe-in', m), { xPercent: -100 }, { xPercent: 0 }, 0);
        gsap.fromTo(inner, { xPercent: -8, scale: 1.18 }, {
          xPercent: 8,
          scale: 1.18,
          ease: 'none',
          scrollTrigger: { trigger: m, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
        });
      });

      // Los números grandes van a otra velocidad: profundidad.
      $$('.tp__num', track).forEach((n) => {
        gsap.fromTo(n, { xPercent: 60 }, {
          xPercent: -60,
          ease: 'none',
          scrollTrigger: { trigger: n.parentElement, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
        });
      });

      // Textos y cifras: entran con un pequeño retraso respecto a la foto.
      $$('.tp__text, .g--stat, .g--end, .tp__end, figcaption', track).forEach((t) => {
        gsap.from(t, {
          y: 40,
          autoAlpha: 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: t, containerAnimation: move, start: 'left 88%', end: 'left 60%', scrub: true },
        });
      });
    });
  });
}
