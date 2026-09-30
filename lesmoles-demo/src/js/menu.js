/*
 * Menú a pantalla completa: se abre como una muela que crece desde el botón.
 * Es un diálogo: el foco queda dentro, Esc cierra y devuelve el foco al botón.
 */
import { gsap } from 'gsap';
import { $, $$, env } from './env.js';

export function initMenu({ lenis }) {
  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  const titles = $$('.menu__t', menu);
  const links = $$('.menu__nav a', menu);
  const previews = $$('.menu__previews .media', menu);
  const extras = $$('.menu__idx, .menu__head, .menu__aside > *', menu);
  const mola = $('.menu__mola', menu);
  let isOpen = false;
  let origin = { x: 0, y: 0, r: 0 };
  let tl;

  const measure = () => {
    const b = openBtn.getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 10;
    origin = { x, y, r };
  };
  const circle = (r) => `circle(${r}px at ${origin.x}px ${origin.y}px)`;

  const preview = (i) => previews.forEach((m, j) => m.classList.toggle('is-on', j === i));
  links.forEach((a) => {
    a.addEventListener('pointerenter', () => preview(Number(a.dataset.preview)));
    a.addEventListener('focus', () => preview(Number(a.dataset.preview)));
  });

  function open() {
    if (isOpen) return;
    isOpen = true;
    measure();
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-open');
    lenis?.stop();
    preview(0);
    if (env.reduce) return void links[0].focus();
    tl?.kill();
    tl = gsap.timeline();
    tl.fromTo(menu, { clipPath: circle(0) }, { clipPath: circle(origin.r), duration: 1.1, ease: 'expo.inOut' })
      .fromTo(mola, { rotation: -60, scale: 0.7, autoAlpha: 0 }, { rotation: 0, scale: 1, autoAlpha: 0.12, duration: 1.6, ease: 'expo.out' }, 0.3)
      .fromTo(titles, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.055, ease: 'expo.out' }, 0.5)
      .fromTo(extras, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.03, ease: 'expo.out' }, 0.6)
      .add(() => links[0].focus({ preventScroll: true }), 0.7);
  }

  // `then` se ejecuta con el menú ya fuera (la cortina lo tapa si hace falta).
  function close({ instant = false, then } = {}) {
    if (!isOpen) return;
    isOpen = false;
    openBtn.setAttribute('aria-expanded', 'false');
    const done = () => {
      menu.hidden = true;
      gsap.set(menu, { clearProps: 'clipPath' });
      document.documentElement.classList.remove('menu-open');
      lenis?.start();
      if (then) then();
      else openBtn.focus({ preventScroll: true });
    };
    tl?.kill();
    if (instant || env.reduce) return done();
    measure();
    tl = gsap.timeline({ onComplete: done });
    tl.to(titles, { yPercent: -110, duration: 0.5, stagger: 0.02, ease: 'power3.in' }, 0)
      .to(extras, { autoAlpha: 0, duration: 0.35 }, 0)
      .to(menu, { clipPath: circle(0), duration: 0.9, ease: 'expo.inOut' }, 0.25);
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return close();
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled])', menu).filter((el) => el.offsetParent !== null);
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
    else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
  });

  return { isOpen: () => isOpen, close };
}
