/*
 * Muela: un círculo que se abre o se cierra sobre una escena.
 *
 * En lugar de recortar con clip-path (que obliga a volver a pintar la foto
 * entera en cada fotograma), el disco es un elemento redondo con
 * overflow: hidden que se escala y se desplaza con transform, y la vista de
 * dentro hace exactamente la transformación contraria. La escena queda
 * quieta, el borde del círculo se mueve y la tarjeta gráfica solo compone.
 *
 *   <div class="disc"><div class="disc__view">…escena…</div></div>
 */
export function createDisc(disc, box = disc.parentElement) {
  const view = disc.firstElementChild;
  const g = { w: 1, h: 1, full: 1 };

  // Mide la caja (el escenario o la pantalla) y dimensiona disco y vista.
  const measure = () => {
    g.w = box.clientWidth || window.innerWidth;
    g.h = box.clientHeight || window.innerHeight;
    // Radio que cubre la caja entera desde su centro.
    g.full = Math.hypot(g.w, g.h) / 2 + 4;
    disc.style.setProperty('--disc-d', `${(g.full * 2).toFixed(1)}px`);
    disc.style.setProperty('--disc-w', `${g.w}px`);
    disc.style.setProperty('--disc-h', `${g.h}px`);
    return g;
  };

  // Círculo de radio r (px) con centro en (x, y), en px desde la esquina de la caja.
  const set = (r, x = g.w / 2, y = g.h / 2) => {
    const s = Math.max(r, 0.5) / g.full;
    const dx = x - g.w / 2;
    const dy = y - g.h / 2;
    // Sin redondear la escala: disco y vista tienen que anularse exactamente.
    disc.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${s})`;
    view.style.transform = `scale(${1 / s}) translate3d(${-dx}px, ${-dy}px, 0)`;
    return { dx, dy, s };
  };

  const reset = () => {
    disc.style.transform = '';
    view.style.transform = '';
  };

  measure();
  return { g, measure, set, reset };
}
