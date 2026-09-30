/*
 * Barra de navegación que cambia de tinta según el capítulo que tiene debajo,
 * e indicador «III — La cocina» con la línea de progreso de toda la página.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, env } from './env.js';

export function initNav() {
  const nav = $('[data-nav]');
  const num = $('[data-ci-num]');
  const name = $('[data-ci-name]');
  const bar = $('[data-ci-bar]');
  const probe = () => nav.offsetHeight / 2;

  // Tinta de la barra
  $$('main > [data-theme], footer[data-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: () => `top ${probe()}`,
      end: () => `bottom ${probe()}`,
      onToggle: (self) => self.isActive && nav.setAttribute('data-theme', sec.dataset.theme),
    });
  });

  // Capítulo actual
  let current = '';
  const setChapter = (n, label) => {
    if (label === current) return;
    current = label;
    if (env.reduce) {
      num.textContent = n;
      name.textContent = label;
      return;
    }
    gsap.to([num, name], {
      yPercent: -60, autoAlpha: 0, duration: 0.25, ease: 'power2.in', overwrite: true,
      onComplete: () => {
        num.textContent = n;
        name.textContent = label;
        gsap.fromTo([num, name], { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
      },
    });
  };
  $$('[data-chapter]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && setChapter(sec.dataset.chapter, sec.dataset.chapterName),
    });
  });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
  });
}
