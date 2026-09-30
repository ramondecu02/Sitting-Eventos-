/*
 * Reserva: una muela diminuta se abre hasta llenar la pantalla con los
 * jardines de noche. El relato se cierra por donde empezó: el círculo.
 */
import { gsap } from 'gsap';
import { $, MQ } from '../env.js';

export function initReserva(mm) {
  const stage = $('[data-reserva-stage]');
  const media = $('[data-reserva-media]', stage);
  const inner = $('.media__inner', media);
  const circ = { r: 0 };
  const apply = () => (media.style.clipPath = `circle(${circ.r.toFixed(1)}px at 50% 50%)`);
  const full = () => Math.hypot(window.innerWidth, window.innerHeight) / 2 + 4;

  mm.add(MQ.motion, () => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'reserva',
        trigger: stage,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 1.5,
        pin: true,
        scrub: 0.9,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(circ, { r: () => Math.min(window.innerWidth, window.innerHeight) * 0.06 }, { r: full, duration: 0.6, ease: 'power2.inOut', onUpdate: apply }, 0)
      .fromTo(inner, { scale: 1.4, rotate: 12 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'power2.out' }, 0)
      .fromTo('[data-reserva-shade]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0.25)
      .fromTo('[data-reserva-title]', { scale: 0.86 }, { scale: 1, duration: 0.6, ease: 'power2.out' }, 0)
      .fromTo('[data-reserva-after]', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out' }, 0.62)
      .to({}, { duration: 0.16 });
    return () => (media.style.clipPath = '');
  });
}
