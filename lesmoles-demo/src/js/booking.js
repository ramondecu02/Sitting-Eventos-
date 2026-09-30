/*
 * Solicitud de reserva: día, personas y servicio. Conoce el horario (los
 * lunes se cierra; la noche es solo viernes y sábado). Mientras no haya un
 * motor de reservas conectado, prepara el correo con la solicitud.
 */
import { $ } from './env.js';
import { HOURS } from './status.js';

const EMAIL = 'lesmoles@lesmoles.com';

export function initBooking() {
  const form = $('[data-booking]');
  if (!form) return;
  const date = form.elements.date;
  const service = form.elements.service;
  const people = form.elements.people;
  const msg = $('[data-booking-msg]');
  const night = [...service.options].find((o) => o.value === 'Noche');

  const iso = (d) => d.toISOString().slice(0, 10);
  date.min = iso(new Date());

  const dayOf = () => (date.value ? new Date(date.value + 'T12:00:00').getDay() : null);
  const check = () => {
    const d = dayOf();
    msg.textContent = '';
    if (d == null) return true;
    const services = HOURS.filter((h) => h.days.includes(d));
    if (!services.length) {
      msg.textContent = 'Los lunes descansamos. Elige otro día.';
      return false;
    }
    const hasNight = services.some((h) => h.open >= '20:00');
    night.disabled = !hasNight;
    if (!hasNight && service.value === 'Noche') service.value = 'Mediodía';
    return true;
  };
  date.addEventListener('change', check);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!date.value) {
      msg.textContent = 'Elige el día de tu visita.';
      date.focus();
      return;
    }
    if (!check()) return;
    const when = new Date(date.value + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const group = people.value === 'grupo';
    const body = [
      'Hola, me gustaría reservar mesa en Les Moles.',
      '',
      `Día: ${when}`,
      `Servicio: ${service.value}`,
      `Personas: ${group ? 'más de 8' : people.value}`,
      '',
      'Nombre:',
      'Teléfono:',
    ].join('\n');
    const a = document.createElement('a');
    a.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Solicitud de reserva · ${when}`)}&body=${encodeURIComponent(body)}`;
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // No se puede saber si el correo se ha abierto: se ofrece la alternativa.
    msg.textContent = `${group ? 'Solicitud de grupo preparada' : 'Solicitud preparada'} en tu programa de correo. ¿No se ha abierto? Escríbenos a ${EMAIL} o llama al 977 57 32 24.`;
  });
}
