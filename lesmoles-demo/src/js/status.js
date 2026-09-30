/*
 * Estado en vivo con la hora de Ulldecona y el horario real:
 * «Abierto ahora · hasta las 15:30», «Hoy abrimos a las 20:30»…
 */
import { $ } from './env.js';

// día: 0 = domingo … 6 = sábado (como Date#getDay)
export const HOURS = [
  { days: [2, 3, 4, 5, 6, 0], open: '13:00', close: '15:30' },
  { days: [5, 6], open: '20:30', close: '22:30' },
];
const DAY = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export function madridNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const hh = get('hour');
  const mm = get('minute');
  return { day, min: Number(hh) * 60 + Number(mm), time: `${hh}:${mm}` };
}

export function statusText(now = madridNow()) {
  const today = HOURS.filter((h) => h.days.includes(now.day)).sort((a, b) => toMin(a.open) - toMin(b.open));
  const current = today.find((h) => now.min >= toMin(h.open) && now.min < toMin(h.close));
  if (current) return { open: true, text: `Abierto ahora · hasta las ${current.close}` };
  const later = today.find((h) => now.min < toMin(h.open));
  if (later) return { open: false, text: `Hoy abrimos a las ${later.open}` };
  for (let i = 1; i <= 7; i++) {
    const d = (now.day + i) % 7;
    const next = HOURS.filter((h) => h.days.includes(d)).sort((a, b) => toMin(a.open) - toMin(b.open))[0];
    if (next) return { open: false, text: i === 1 ? `Mañana abrimos a las ${next.open}` : `Abrimos el ${DAY[d]} a las ${next.open}` };
  }
  return { open: false, text: 'Consulta el horario' };
}

export function initStatus() {
  const wrap = $('[data-status]');
  const text = $('[data-status-text]');
  if (!wrap) return;
  const tick = () => {
    const now = madridNow();
    const s = statusText(now);
    text.textContent = `Ulldecona ${now.time} · ${s.text}`;
    wrap.classList.toggle('is-open', s.open);
  };
  tick();
  setInterval(tick, 30000);
}
