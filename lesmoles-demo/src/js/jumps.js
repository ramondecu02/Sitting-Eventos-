/*
 * Enlaces internos. Los saltos cortos se deslizan; los largos pasan por una
 * cortina negra con la muela: así no se cruzan a toda velocidad las secciones
 * fijadas. «Reserva» aterriza donde la muela ya se ha abierto.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, env } from './env.js';

export function initJumps({ lenis, menu }) {
  const curtain = $('[data-curtain]');
  const mola = $('.curtain__mola', curtain);

  const targetY = (hash) => {
    if (hash === '#top') return 0;
    if (hash === '#reserva') {
      const st = ScrollTrigger.getById('reserva');
      if (st) return st.end - 2;
    }
    if (hash === '#manifiesto') {
      const st = ScrollTrigger.getById('entry');
      if (st) return st.start + (st.end - st.start) * 0.72;
    }
    const el = $(hash);
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  };

  const scrollNow = (y, smooth) => {
    if (lenis) lenis.scrollTo(y, smooth ? { duration: 1.4 } : { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: smooth && !env.reduce ? 'smooth' : 'auto' });
  };

  const focusTarget = (hash) => {
    const el = hash === '#top' ? $('#main') : $(hash);
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };

  function jump(hash, { instant = false, fromMenu = false } = {}) {
    const y = targetY(hash);
    if (y == null) return;
    const far = Math.abs(y - window.scrollY) > window.innerHeight * 1.4;
    history.replaceState(null, '', hash === '#top' ? location.pathname : hash);

    if (env.reduce || instant) {
      if (fromMenu) menu.close({ instant: true });
      scrollNow(y, false);
      return focusTarget(hash);
    }
    if (!far && !fromMenu) {
      scrollNow(y, true);
      return focusTarget(hash);
    }
    gsap.timeline()
      .set(curtain, { clipPath: 'inset(100% 0% 0% 0%)' })
      .to(curtain, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'expo.inOut' })
      .fromTo(mola, { rotation: -90, scale: 0.6, autoAlpha: 0 }, { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: 'expo.out' }, 0.35)
      .add(() => {
        if (fromMenu) menu.close({ instant: true, then: () => {} });
        scrollNow(targetY(hash), false);
        ScrollTrigger.update();
      })
      .to(mola, { rotation: 90, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, '+=0.12')
      .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: 'expo.inOut' }, '<0.1')
      .add(() => focusTarget(hash));
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash.length < 2 || !$(hash)) return;
    e.preventDefault();
    jump(hash, { fromMenu: menu.isOpen() });
  });
  document.addEventListener('lm:jump', (e) => jump(e.detail.hash, { instant: e.detail.instant }));
}
