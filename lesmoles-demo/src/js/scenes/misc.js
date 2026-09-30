/*
 * Escenas de los capítulos que no se fijan: la foto que entra en la frase,
 * los retratos a distinta velocidad, el año que cambia, los caminos (menús),
 * la muela de texto de la bodega y el nombre gigante del pie.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$, MQ, env } from '../env.js';

export function initScenes(mm) {
  sheets(mm);
  producto(mm);
  cocina(mm);
  familia(mm);
  menus(mm);
  bodega(mm);
  footer(mm);
}

// Los capítulos de papel entran como una hoja: una cúpula de su color asoma
// sobre el capítulo anterior y se aplana al subir. Solo se escala en vertical.
function sheets(mm) {
  mm.add(MQ.motion, () => {
    const caps = $$('[data-sheet]').map((sec) => {
      const cap = document.createElement('span');
      cap.className = 'sheet-cap';
      cap.setAttribute('aria-hidden', 'true');
      sec.prepend(cap);
      gsap.fromTo(cap, { scaleY: 1 }, {
        scaleY: 0, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 30%', scrub: true },
      });
      return cap;
    });
    return () => caps.forEach((c) => c.remove());
  });
}

// II · La foto entra literalmente en la cita: la frase se abre para dejarle sitio.
function producto(mm) {
  const pill = $('[data-inline-photo]');
  if (!pill) return;
  mm.add(MQ.motion, () => {
    gsap.fromTo(pill, { width: 0, marginLeft: 0, marginRight: 0 }, {
      width: () => getComputedStyle(pill).getPropertyValue('--w').trim() || '2.3em',
      marginLeft: '0.04em',
      marginRight: '0.04em',
      ease: 'power2.inOut',
      scrollTrigger: { trigger: '.prod__quote', start: 'top 72%', end: 'bottom 45%', scrub: 1 },
    });
    gsap.fromTo($('.media__inner', pill), { scale: 1.6 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.prod__quote', start: 'top 72%', end: 'bottom 30%', scrub: 1 },
    });
  });
}

// III · Dos retratos a velocidades distintas: profundidad sin artificio.
function cocina(mm) {
  mm.add(MQ.motion, () => {
    gsap.fromTo('.chef--pau', { yPercent: 14 }, {
      yPercent: -14, ease: 'none',
      scrollTrigger: { trigger: '.cocina__stage', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.fromTo('.chef--jeroni', { yPercent: -4 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.cocina__stage', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

// IV · El año gigante cambia al pasar por cada momento de la historia.
function familia(mm) {
  const yearEl = $('[data-year]');
  if (!yearEl) return;
  let current = yearEl.textContent;
  const set = (value) => {
    if (value === current) return;
    current = value;
    gsap.killTweensOf(yearEl);
    if (env.reduce) return void (yearEl.textContent = value);
    gsap.to(yearEl, {
      yPercent: -105, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        yearEl.textContent = value;
        gsap.fromTo(yearEl, { yPercent: 105 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' });
      },
    });
  };
  $$('.timeline li').forEach((li) => {
    ScrollTrigger.create({
      trigger: li,
      start: 'top 60%',
      end: 'bottom 60%',
      onToggle: (self) => self.isActive && set(li.dataset.yearValue),
    });
  });
}

// V · Los caminos: acordeón accesible + foto que sigue al cursor.
function menus(mm) {
  const list = $('[data-mlist]');
  if (!list) return;
  const rows = $$('.mrow', list);

  rows.forEach((row) => {
    const btn = $('.mrow__head', row);
    const body = $('.mrow__body', row);
    btn.addEventListener('click', () => {
      const open = !row.classList.contains('is-open');
      rows.forEach((r) => {
        if (r !== row && r.classList.contains('is-open')) toggle(r, false);
      });
      toggle(row, open);
    });
    function toggle(r, open) {
      r.classList.toggle('is-open', open);
      $('.mrow__head', r).setAttribute('aria-expanded', String(open));
      $('.mrow__body', r).inert = !open;
      setTimeout(() => ScrollTrigger.refresh(), 850);
    }
    body.inert = true;
  });

  const prev = $('[data-mpreview]');
  const items = $$('.media', prev);
  mm.add('(min-width: 1024px) and (hover: hover) and (pointer: fine)', () => {
    const xTo = gsap.quickTo(prev, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(prev, 'y', { duration: 0.7, ease: 'power3' });
    const rTo = gsap.quickTo(prev, 'rotation', { duration: 0.9, ease: 'power3' });
    let lastX = 0;
    let shown = -1;
    const move = (e) => {
      const w = prev.offsetWidth;
      const h = prev.offsetHeight;
      xTo(Math.min(e.clientX + 36, window.innerWidth - w - 24));
      yTo(e.clientY - h / 2);
      rTo(gsap.utils.clamp(-7, 7, (e.clientX - lastX) * 0.4));
      lastX = e.clientX;
    };
    const show = (i) => {
      if (i === shown) return;
      shown = i;
      items.forEach((m, j) => m.classList.toggle('is-on', j === i));
      gsap.fromTo(items[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out' });
      gsap.to(prev, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
    };
    const hide = () => {
      shown = -1;
      gsap.to(prev, { autoAlpha: 0, scale: 0.92, duration: 0.4, ease: 'power2.out' });
    };
    gsap.set(prev, { scale: 0.92 });
    // Sobre una fila abierta la vista previa se aparta: no tapa el horario.
    const onMove = (e) => {
      move(e);
      const r = e.target.closest('.mrow');
      if (!r || r.classList.contains('is-open')) return shown !== -1 && hide();
      show(Number(r.dataset.preview));
    };
    list.addEventListener('pointermove', onMove);
    list.addEventListener('pointerleave', hide);
    list.addEventListener('click', () => requestAnimationFrame(() => hide()));
    return () => {
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', hide);
    };
  });
}

// VI · La muela de texto gira con el scroll alrededor de la botella.
function bodega(mm) {
  const ring = $('[data-bodega-ring]');
  if (!ring) return;
  mm.add(MQ.motion, () => {
    gsap.fromTo(ring, { rotation: -40 }, {
      rotation: 160, ease: 'none',
      scrollTrigger: { trigger: '.bodega', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

// Pie: «Les Moles» sube letra a letra, como en la entrada.
function footer(mm) {
  const word = $('[data-footer-word]');
  if (!word) return;
  mm.add(MQ.motion, () => {
    const split = SplitText.create(word, { type: 'chars', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 105, duration: 1.4, stagger: 0.05, ease: 'expo.out',
      scrollTrigger: { trigger: word, start: 'top 92%', once: true },
    });
    return () => split.revert();
  });
}
