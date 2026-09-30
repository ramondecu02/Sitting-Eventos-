// Scroll suave con Lenis, solo con ratón: al tacto, el nativo es mejor.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { env } from './env.js';

export function initSmooth() {
  if (env.reduce || !env.fine) return null;
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
