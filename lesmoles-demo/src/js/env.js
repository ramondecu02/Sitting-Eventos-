// Lo que el navegador permite o prefiere.
const mq = (q) => window.matchMedia(q).matches;

export const env = {
  reduce: mq('(prefers-reduced-motion: reduce)'),
  fine: mq('(hover: hover) and (pointer: fine)'),
};

// Condiciones de gsap.matchMedia: cada animación declara dónde vive.
export const MQ = {
  desk: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  small: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
};

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
