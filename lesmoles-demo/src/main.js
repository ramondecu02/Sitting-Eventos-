/*
 * Les Moles — demo de la Home.
 * El HTML ya trae todo el contenido; esto solo añade el movimiento, la
 * navegación y los detalles vivos. Sin JavaScript la página se lee entera.
 */
import './styles/base.css';
import './styles/components.css';
import './styles/chapters.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { env } from './js/env.js';
import { initSmooth } from './js/smooth.js';
import { runLoader } from './js/loader.js';
import { initEntry, heroIntro } from './js/scenes/entry.js';
import { initHScroll } from './js/scenes/hscroll.js';
import { initReserva } from './js/scenes/reserva.js';
import { initScenes } from './js/scenes/misc.js';
import { initReveals } from './js/reveals.js';
import { initNav } from './js/nav.js';
import { initMenu } from './js/menu.js';
import { initJumps } from './js/jumps.js';
import { initCursor } from './js/cursor.js';
import { initStatus } from './js/status.js';
import { initBooking } from './js/booking.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });
gsap.defaults({ ease: 'expo.out' });

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

async function boot() {
  const root = document.documentElement;
  const lenis = initSmooth();
  if (lenis) lenis.stop();
  if (!env.reduce) window.scrollTo(0, 0);

  // Esperar a las tipografías (máximo 1,5 s) para partir bien las líneas.
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);

  const mm = gsap.matchMedia();

  // 1. Escenas fijadas, en el orden en que aparecen en la página.
  const entry = initEntry(mm);
  initHScroll(mm);
  initReserva(mm);

  // 2. Todo lo demás (se calcula ya con los espacios de los fijados).
  initScenes(mm);
  initReveals(mm);
  initNav();
  const menu = initMenu({ lenis });
  initJumps({ lenis, menu });
  initCursor();
  initStatus();
  initBooking();

  ScrollTrigger.refresh();

  const first = root.classList.contains('is-first');
  const reveal = () => {
    root.classList.remove('is-loading', 'is-first', 'is-returning');
    try { sessionStorage.setItem('lm-visited', '1'); } catch (e) {}
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(() => document.dispatchEvent(new CustomEvent('lm:jump', { detail: { hash: location.hash, instant: true } })), 50);
    }
  };

  if (env.reduce) {
    reveal();
    return;
  }
  runLoader({ first, entry, onOpen: () => heroIntro(), onDone: reveal });
}

boot();
