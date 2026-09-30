/*
 * Revelados genéricos, declarados en el HTML:
 *   data-reveal="lines"      el texto sube línea a línea desde una máscara
 *   data-reveal="lines-soft" palabra a palabra (para frases que cambian de ancho)
 *   data-reveal="fade"       sube y aparece (en grupo, escalonado)
 *   data-reveal-media        la foto se revela de abajo arriba y se asienta
 *   data-speed="0.1"         la foto se desplaza dentro de su marco (parallax)
 *   data-rule                la línea se dibuja
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$, MQ } from './env.js';

export function initReveals(mm) {
  mm.add(MQ.motion, () => {
    // Líneas
    $$('[data-reveal="lines"]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 108,
            duration: 1.3,
            stagger: 0.09,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }),
      });
    });

    // Palabras (la cita del producto cambia de ancho mientras entra la foto)
    $$('[data-reveal="lines-soft"]').forEach((el) => {
      const split = SplitText.create(el, { type: 'words', mask: 'words', ignore: '.inline-photo' });
      gsap.from(split.words, {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.035,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    // Aparecer en grupo
    const fades = $$('[data-reveal="fade"]');
    gsap.set(fades, { autoAlpha: 0, y: 32 });
    ScrollTrigger.batch(fades, {
      start: 'top 92%',
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.09, ease: 'expo.out', overwrite: true }),
    });

    // Fotos que se revelan
    $$('[data-reveal-media]').forEach((m) => {
      const inner = $('.media__inner', m);
      const st = { trigger: m, start: 'top 86%', once: true };
      gsap.fromTo(m, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: st });
      gsap.fromTo(inner, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: st });
    });

    // Parallax dentro del marco (el marco no se mueve: la foto sí)
    $$('[data-speed]').forEach((m) => {
      const inner = $('.media__inner', m) || m;
      const s = parseFloat(m.dataset.speed) || 0.1;
      gsap.fromTo(inner, { yPercent: -s * 100 }, {
        yPercent: s * 100,
        ease: 'none',
        scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.set(inner, { scale: 1 + Math.abs(s) * 2.2 });
    });

    // Líneas que se dibujan
    $$('[data-rule]').forEach((r) => {
      gsap.fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: r, start: 'top 92%', once: true } });
    });
  });
}
