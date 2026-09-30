/*
 * Reserva: una muela diminuta se abre hasta llenar la pantalla con los
 * jardines de noche. El relato se cierra por donde empezó: el círculo.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, MQ } from '../env.js';
import { createDisc } from '../disc.js';

export function initReserva(mm) {
  const stage = $('[data-reserva-stage]');
  const disc = createDisc($('[data-reserva-disc]', stage));
  const media = $('[data-reserva-media]', stage);
  const inner = $('.media__inner', media);
  // p: 0 = una muela diminuta en el centro, 1 = la foto a pantalla completa.
  const title = $('[data-reserva-title]', stage);
  const state = { p: 0 };
  let layered = false;
  const draw = (progress) => {
    const { w, h, full } = disc.g;
    const r0 = Math.min(w, h) * 0.06;
    disc.set(r0 + (full - r0) * state.p);
    // El título se escala en su propia capa mientras crece y sale de ella al
    // acabar, para que el navegador lo vuelva a pintar nítido a tamaño real.
    const on = progress > 0 && progress < 0.62;
    if (on !== layered) title.style.willChange = (layered = on) ? 'transform' : '';
  };

  mm.add(MQ.motion, () => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate() {
        draw(this.progress());
      },
      scrollTrigger: {
        id: 'reserva',
        trigger: stage,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 1.5,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(state, { p: 0 }, { p: 1, duration: 0.6, ease: 'power2.inOut' }, 0)
      .fromTo(inner, { scale: 1.4, rotate: 12 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'power2.out' }, 0)
      .fromTo('[data-reserva-shade]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0.25)
      .fromTo('[data-reserva-title]', { scale: 0.86 }, { scale: 1, duration: 0.6, ease: 'power2.out' }, 0)
      .fromTo('[data-reserva-after]', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out' }, 0.62)
      .to({}, { duration: 0.16 });
    draw(0);

    const onRefresh = () => (disc.measure(), draw(tl.progress()));
    ScrollTrigger.addEventListener('refresh', onRefresh);
    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      disc.reset();
    };
  });
}
