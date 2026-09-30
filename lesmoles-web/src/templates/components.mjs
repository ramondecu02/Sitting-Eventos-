// Piezas que se repiten entre páginas. Todas devuelven HTML en texto.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const ICONS = {
  star: '<path d="M12 2.8l2.7 6 6.5.6-4.9 4.3 1.5 6.4L12 16.8l-5.8 3.3 1.5-6.4-4.9-4.3 6.5-.6z"/>',
  leaf: '<path d="M20 4c-8.5 0-14 4.8-14 11.2 0 1.6.4 3 1 4.3C9 14 13 10.5 17 9c-4 2.4-7.1 6.1-8.8 11 1 .6 2.2 1 3.6 1C18.2 21 20 13 20 4z"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  sprout: '<path d="M12 21v-8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 13C12 8.6 9 6 4 6c0 4.4 3 7 8 7zM12 11c0-4 2.7-6.5 8-6.5 0 4-2.7 6.5-8 6.5z"/>',
  phone: '<path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3c0 1-.8 1.8-1.8 1.8A16.9 16.9 0 0 1 4.8 5.3c0-1 .8-1.8 1.8-1.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m3.5 6.5 8.5 7 8.5-7" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9.8" r="2.3" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  arrow: '<path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="1.1"/>',
  facebook: '<path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4V21z"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/>',
};

export const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

/* Fotos: si existe src/assets/img/<id>.(jpg|jpeg|webp|png|avif) se usa;
   si no, un fondo de piedra con la descripción de la foto que falta. */
const IMG_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/img');
const EXTS = ['avif', 'webp', 'jpg', 'jpeg', 'png'];
export function photoFile(id) {
  for (const ext of EXTS) {
    if (fs.existsSync(path.join(IMG_DIR, `${id}.${ext}`))) return `/assets/img/${id}.${ext}`;
  }
  return null;
}

export function photo(ctx, id, { cls = '', eager = false, decorative = false } = {}) {
  const { t, cfg } = ctx;
  const slot = cfg.photos[id] || { tone: 'stone' };
  const alt = t.photos[id] || '';
  const file = photoFile(id);
  if (file) {
    const pos = slot.pos ? ` style="object-position:${esc(slot.pos)}"` : '';
    return `<div class="media ${cls}"><img src="${file}" alt="${decorative ? '' : esc(alt)}"${pos} ${
      eager ? 'fetchpriority="high"' : 'loading="lazy"'
    } decoding="async"></div>`;
  }
  const label = cfg.draft
    ? `<span class="ph__label">${icon('camera')}<span><b>${esc(t.ui.photoPending)}</b> ${esc(alt)}</span></span>`
    : '';
  const aria = decorative ? 'aria-hidden="true"' : `role="img" aria-label="${esc(alt)}"`;
  return `<div class="media ph ph--${slot.tone} ${cls}" ${aria} data-photo="${id}">${label}</div>`;
}

export const eyebrow = (text, cls = '') => `<p class="eyebrow ${cls}">${text}</p>`;

export function sectionHead({ eyebrow: eb, title, lead, level = 2, cls = '' }) {
  return `<header class="section-head ${cls}">
    ${eb ? eyebrow(eb) : ''}
    <h${level} class="section-title">${title}</h${level}>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </header>`;
}

export const paras = (arr) => arr.map((p) => `<p>${p}</p>`).join('\n');

export function btn(href, label, { variant = 'primary', ext = false, t, iconName, cls = '' } = {}) {
  const extAttrs = ext ? ' target="_blank" rel="noopener"' : '';
  const sr = ext && t ? `<span class="sr-only"> ${t.ui.external}</span>` : '';
  const ic = iconName ? icon(iconName) : ext ? icon('external') : '';
  return `<a class="btn btn--${variant} ${cls}" href="${href}"${extAttrs}>${ic ? ic : ''}<span>${label}</span>${sr}</a>`;
}

export function textLink(href, label, { ext = false, t } = {}) {
  const extAttrs = ext ? ' target="_blank" rel="noopener"' : '';
  const sr = ext && t ? `<span class="sr-only"> ${t.ui.external}</span>` : '';
  return `<a class="link-arrow" href="${href}"${extAttrs}><span>${label}</span>${icon('arrow')}${sr}</a>`;
}

export function awardsList(ctx, variant = 'strip') {
  const { t, cfg } = ctx;
  return `<ul class="awards awards--${variant}" aria-label="${esc(t.awards.label)}">
    ${cfg.awards
      .map(
        (a) => `<li class="award">${icon(a.icon, 'icon award__icon')}<span class="award__name">${t.awards[a.id]}</span>${
          a.since && variant !== 'strip' ? `<span class="award__since">${t.awards.since(a.since)}</span>` : ''
        }</li>`
      )
      .join('')}
  </ul>`;
}

// «dimarts a diumenge», «divendres i dissabte»
function formatDays(t, days) {
  const names = days.map((d) => t.ui.days[d - 1]);
  const consecutive = days.every((d, i) => i === 0 || d === days[i - 1] + 1);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  if (days.length > 2 && consecutive) return cap(t.ui.dayRange(names[0], names[names.length - 1]));
  return cap(t.ui.dayList(names));
}

export function hoursList(ctx, cls = '') {
  const { t, cfg } = ctx;
  const rows = cfg.hours.map(
    (h) => `<div class="hours__row"><dt>${formatDays(t, h.days)} <span class="hours__svc">· ${
      h.service === 'lunch' ? t.ui.lunch : t.ui.dinner
    }</span></dt><dd>${h.open}–${h.close}</dd></div>`
  );
  if (cfg.closedDays.length) {
    rows.push(`<div class="hours__row hours__row--closed"><dt>${formatDays(t, cfg.closedDays)}</dt><dd>${t.ui.closed}</dd></div>`);
  }
  return `<dl class="hours ${cls}">${rows.join('')}</dl>`;
}

const money = (lang, n) =>
  new Intl.NumberFormat(lang === 'en' ? 'en-GB' : `${lang}-ES`, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: n % 1 ? 2 : 0,
  }).format(n);

export function menuPrice(ctx, m) {
  const { t } = ctx;
  if (!m.price) return '';
  if (typeof m.price === 'number') return `<p class="menu__price">${money(t.lang, m.price)} <small>${t.ui.perPerson}</small></p>`;
  const row = (label, n) => `<span class="menu__price-row"><span>${label}</span><span>${money(t.lang, n)}</span></span>`;
  const rows = [];
  if (m.price.lunch) rows.push(row(t.ui.lunch, m.price.lunch));
  if (m.price.dinner) rows.push(row(t.ui.dinner, m.price.dinner));
  return `<p class="menu__price">${rows.join('')}<small>${t.ui.perPerson}</small></p>`;
}

export function menuTimes(ctx, m) {
  const { t } = ctx;
  const page = t.pages.restaurant.menus;
  const fmt = (arr) => (m.range ? page.continuous(arr[0], arr[1]) : arr.join(' · '));
  const rows = [];
  if (m.lunch) rows.push(`<div><dt>${t.ui.lunch}</dt><dd>${fmt(m.lunch)}</dd></div>`);
  if (m.dinner) rows.push(`<div><dt>${t.ui.dinner}</dt><dd>${fmt(m.dinner)}</dd></div>`);
  return `<dl class="menu__times" aria-label="${esc(page.entry)}">${rows.join('')}</dl>`;
}

export function menuCard(ctx, m, { detailed = false, index } = {}) {
  const { t } = ctx;
  const txt = t.menus[m.id];
  return `<article class="menu${m.tasting ? ' menu--tasting' : ''}">
    ${index != null ? `<span class="menu__num" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>` : ''}
    <p class="menu__kind">${txt.kind}</p>
    <h3 class="menu__name">${txt.name}</h3>
    <p class="menu__desc">${txt.desc}</p>
    ${menuPrice(ctx, m)}
    ${detailed ? menuTimes(ctx, m) : ''}
  </article>`;
}

export function contactList(ctx, { cls = '' } = {}) {
  const { t, cfg } = ctx;
  const c = cfg.contact;
  return `<ul class="contact ${cls}">
    <li>${icon('pin')}<span><span class="sr-only">${t.ui.address}: </span>${c.street}<br>${c.postalCode} ${c.city} (${c.region})</span></li>
    <li>${icon('phone')}<a href="tel:${c.phone}"><span class="sr-only">${t.ui.phone}: </span>${c.phoneDisplay}</a></li>
    <li>${icon('mail')}<a href="mailto:${c.email}"><span class="sr-only">${t.ui.email}: </span>${c.email}</a></li>
  </ul>`;
}

export function mapsLink(cfg) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cfg.contact.mapsQuery)}`;
}

// Mapa que solo se carga al pedirlo: sin cookies de Google hasta entonces.
export function mapBlock(ctx) {
  const { t, cfg } = ctx;
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(cfg.contact.mapsQuery)}&output=embed`;
  return `<div class="map" data-map-src="${esc(embed)}" data-map-title="${esc(t.ui.mapTitle)}">
    <div class="map__placeholder">
      ${icon('pin', 'icon map__pin')}
      <p class="map__address">${cfg.contact.street} · ${cfg.contact.city}</p>
      <button type="button" class="btn btn--ghost map__load">${t.ui.mapLoad}</button>
      <p class="map__note">${t.ui.mapNote}</p>
    </div>
  </div>`;
}

export function stats(ctx) {
  const { t, cfg } = ctx;
  const s = t.pages.events.stats;
  const n = (v) => new Intl.NumberFormat(t.lang === 'en' ? 'en-GB' : `${t.lang}-ES`).format(v);
  const items = [
    [n(cfg.venue.gardensM2), s.gardens],
    [n(cfg.venue.banquetCapacity), s.banquet],
    [n(cfg.venue.ceremonyCapacity), s.ceremony],
    [n(cfg.venue.banquetHalls), s.halls],
  ];
  return `<dl class="stats">${items
    .map(([v, l]) => `<div class="stat"><dt class="stat__label">${l}</dt><dd class="stat__value">${v}</dd></div>`)
    .join('')}</dl>`;
}
