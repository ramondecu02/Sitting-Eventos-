// Una función por página. Reciben el contexto (idioma, configuración...) y
// devuelven el contenido de <main>.
import {
  esc,
  icon,
  photo,
  eyebrow,
  sectionHead,
  paras,
  btn,
  textLink,
  awardsList,
  hoursList,
  menuCard,
  menuTimes,
  contactList,
  mapBlock,
  mapsLink,
  stats,
} from './components.mjs';

function pageHero(ctx, { photoId, eb, title, lead, actions = '', size = 'page', after = '' }) {
  return `<section class="hero hero--${size}">
  ${photo(ctx, photoId, { cls: 'hero__media', eager: true })}
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="wrap hero__content">
    ${eyebrow(eb, 'eyebrow--light')}
    <h1 class="hero__title">${title}</h1>
    ${lead ? `<p class="hero__lead">${lead}</p>` : ''}
    ${actions ? `<div class="hero__actions">${actions}</div>` : ''}
  </div>
  ${after}
</section>`;
}

function split(ctx, { id, photoId, eb, title, body, reverse = false, extra = '', tone = '' }) {
  return `<section class="section split${reverse ? ' split--reverse' : ''}${tone ? ` section--${tone}` : ''}"${id ? ` id="${id}"` : ''}>
  <div class="wrap split__grid">
    <div class="split__media reveal">${photo(ctx, photoId, { cls: 'media--portrait' })}</div>
    <div class="split__text reveal">
      ${sectionHead({ eyebrow: eb, title })}
      <div class="prose">${paras(body)}</div>
      ${extra}
    </div>
  </div>
</section>`;
}

/* ───────────── Inici ───────────── */
export function home(ctx) {
  const { t, cfg } = ctx;
  const p = t.pages.home;
  const r = t.routes;
  const a = t.anchors;

  return `
${pageHero(ctx, {
  photoId: 'pedrera',
  eb: p.hero.eyebrow,
  title: p.hero.title,
  lead: p.hero.lead,
  size: 'full',
  actions: `${btn(r.reserva, t.ui.bookTable)}${btn(r.events, p.hero.secondary, { variant: 'light' })}`,
  after: `<div class="hero__awards"><div class="wrap">${awardsList(ctx, 'strip')}</div></div>`,
})}

<section class="section intro">
  <div class="wrap intro__grid">
    <div class="intro__text reveal">
      ${sectionHead({ eyebrow: p.intro.eyebrow, title: p.intro.title })}
      <div class="prose">${paras(p.intro.body)}</div>
      ${textLink(r.casa, p.intro.link)}
    </div>
    <div class="intro__media reveal">
      ${photo(ctx, 'sala', { cls: 'intro__photo-main media--portrait' })}
      ${photo(ctx, 'plat', { cls: 'intro__photo-accent media--square' })}
    </div>
  </div>
</section>

<section class="section section--paper2 philosophy">
  <div class="wrap">
    ${eyebrow(p.philosophy.eyebrow, 'reveal')}
    <h2 class="statement reveal">${p.philosophy.statement}</h2>
    <ol class="pillars">
      ${p.philosophy.items
        .map(
          (it, i) => `<li class="pillar reveal" style="--d:${i}">
        <span class="pillar__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="pillar__title">${it.title}</h3>
        <p>${it.text}</p>
      </li>`
        )
        .join('')}
    </ol>
  </div>
</section>

<section class="doors">
  ${['restaurant', 'events']
    .map((k) => {
      const d = p.doors[k];
      return `<a class="door reveal" href="${r[k]}">
    ${photo(ctx, k === 'restaurant' ? 'plat' : 'casament', { cls: 'door__media', decorative: true })}
    <span class="door__veil" aria-hidden="true"></span>
    <div class="door__body">
      <p class="eyebrow eyebrow--light">${d.eyebrow}</p>
      <h2 class="door__title">${d.title}</h2>
      <p class="door__text">${d.text}</p>
      <span class="door__link">${d.link}${icon('arrow')}</span>
    </div>
  </a>`;
    })
    .join('\n')}
</section>

<section class="section menus-teaser">
  <div class="wrap">
    <div class="section-head-row">
      ${sectionHead({ eyebrow: p.menus.eyebrow, title: p.menus.title })}
      ${textLink(`${r.restaurant}#${a.menus}`, p.menus.link)}
    </div>
    <div class="menus-grid">
      ${cfg.menus.map((m, i) => `<div class="reveal" style="--d:${i}">${menuCard(ctx, m, { index: i })}</div>`).join('')}
    </div>
  </div>
</section>

<section class="section section--paper2 origin">
  <div class="wrap origin__grid">
    ${['hort', 'vi']
      .map(
        (k) => `<article class="origin__item reveal">
      ${photo(ctx, k, { cls: 'media--landscape' })}
      ${eyebrow(p.origin[k].eyebrow)}
      <h3 class="origin__title">${p.origin[k].title}</h3>
      <p>${p.origin[k].text}</p>
    </article>`
      )
      .join('')}
  </div>
  <div class="wrap origin__more">${textLink(`${r.restaurant}#${a.hort}`, p.origin.link)}</div>
</section>

<section class="band band--events">
  ${photo(ctx, 'casament', { cls: 'band__media', decorative: true })}
  <div class="band__veil" aria-hidden="true"></div>
  <div class="wrap band__content">
    <div class="band__text reveal">
      ${eyebrow(p.events.eyebrow, 'eyebrow--light')}
      <h2 class="section-title">${p.events.title}</h2>
      <p class="lead">${p.events.text}</p>
      <div class="band__actions">
        ${btn(`${r.events}#${a.form}`, p.events.cta)}
        ${btn(`${r.events}#${a.espais}`, p.events.more, { variant: 'light' })}
      </div>
    </div>
    <div class="reveal">${stats(ctx)}</div>
  </div>
</section>

<section class="section gift">
  <div class="wrap gift__inner reveal">
    ${eyebrow(p.gift.eyebrow)}
    <h2 class="section-title">${p.gift.title}</h2>
    <p class="lead">${p.gift.text}</p>
    ${btn(cfg.links.shop, p.gift.cta, { variant: 'outline', ext: true, t })}
  </div>
</section>

<section class="section section--paper2 visit">
  <div class="wrap visit__grid">
    <div class="visit__info reveal">
      ${sectionHead({ eyebrow: p.visit.eyebrow, title: p.visit.title })}
      <p>${p.visit.text}</p>
      ${contactList(ctx)}
      <h3 class="visit__subtitle">${t.ui.hours}</h3>
      ${hoursList(ctx)}
      <div class="visit__actions">
        ${btn(r.reserva, t.ui.bookTable)}
        ${btn(mapsLink(cfg), t.ui.directions, { variant: 'outline', ext: true, t })}
      </div>
    </div>
    <div class="visit__map reveal">${mapBlock(ctx)}</div>
  </div>
</section>`;
}

/* ───────────── Restaurant ───────────── */
export function restaurant(ctx) {
  const { t, cfg } = ctx;
  const p = t.pages.restaurant;
  const r = t.routes;
  const a = t.anchors;
  const hasPrice = cfg.menus.some((m) => m.price);

  return `
${pageHero(ctx, { photoId: 'plat', eb: p.hero.eyebrow, title: p.hero.title, lead: p.hero.lead })}

${split(ctx, { photoId: 'oli', eb: p.cuina.eyebrow, title: p.cuina.title, body: p.cuina.body })}

<section class="section section--paper2" id="${a.menus}">
  <div class="wrap">
    ${sectionHead({ eyebrow: p.menus.eyebrow, title: p.menus.title, lead: p.menus.lead })}
    <div class="menus-grid menus-grid--detailed">
      ${cfg.menus.map((m, i) => `<div class="reveal" style="--d:${i}">${menuCard(ctx, m, { detailed: true, index: i })}</div>`).join('')}
    </div>
    ${hasPrice ? `<p class="fineprint">${p.menus.priceNote}</p>` : ''}
  </div>
</section>

<section class="section chef">
  <div class="wrap chef__inner reveal">
    <div>
      ${eyebrow(p.chef.eyebrow)}
      <h2 class="section-title">${p.chef.title}</h2>
    </div>
    <div>
      <p class="lead">${p.chef.text}</p>
      ${btn(cfg.links.shop, p.chef.cta, { variant: 'outline', ext: true, t })}
    </div>
  </div>
</section>

${split(ctx, { id: a.celler, photoId: 'vi', eb: p.celler.eyebrow, title: p.celler.title, body: p.celler.body, reverse: true, tone: 'paper2' })}

${split(ctx, { id: a.hort, photoId: 'hort', eb: p.hort.eyebrow, title: p.hort.title, body: p.hort.body })}

${ctaBand(ctx, p.cta.title, p.cta.text)}`;
}

function ctaBand(ctx, title, text) {
  const { t, cfg } = ctx;
  return `<section class="section cta-band">
  <div class="wrap cta-band__inner reveal">
    <div>
      <h2 class="section-title">${title}</h2>
      <p class="lead">${text}</p>
    </div>
    <div class="cta-band__side">
      ${hoursList(ctx, 'hours--light')}
      <div class="cta-band__actions">
        ${btn(t.routes.reserva, t.ui.bookTable)}
        ${btn(`tel:${cfg.contact.phone}`, cfg.contact.phoneDisplay, { variant: 'light', iconName: 'phone' })}
      </div>
    </div>
  </div>
</section>`;
}

/* ───────────── Events ───────────── */
export function events(ctx) {
  const { t, cfg } = ctx;
  const p = t.pages.events;
  const a = t.anchors;
  const f = p.form;
  const privacy = `${t.routes.legal}#${a.privacitat}`;
  const endpoint = cfg.eventsFormEndpoint;

  return `
${pageHero(ctx, {
  photoId: 'casament',
  eb: p.hero.eyebrow,
  title: p.hero.title,
  lead: p.hero.lead,
  actions: btn(`#${a.form}`, p.hero.cta),
})}

<section class="section events-intro">
  <div class="wrap events-intro__inner">
    <div class="reveal">
      <h2 class="section-title">${p.intro.title}</h2>
      <p class="lead">${p.intro.text}</p>
    </div>
    <div class="reveal">${stats(ctx)}</div>
  </div>
</section>

<section class="section section--paper2 types">
  <div class="wrap types__grid">
    ${p.types
      .map(
        (ty, i) => `<article class="type reveal" id="${a[ty.id]}" style="--d:${i}">
      ${photo(ctx, ty.photo, { cls: 'media--portrait' })}
      <h2 class="type__title">${ty.title}</h2>
      <p>${ty.text}</p>
      ${textLink(`#${a.form}`, f.eyebrow)}
    </article>`
      )
      .join('')}
  </div>
</section>

<section class="section spaces" id="${a.espais}">
  <div class="wrap">
    ${sectionHead({ eyebrow: p.spaces.eyebrow, title: p.spaces.title })}
    <div class="spaces__grid">
      ${p.spaces.items
        .map(
          (s, i) => `<article class="space${i === 0 ? ' space--wide' : ''} reveal" style="--d:${i % 3}">
        ${photo(ctx, s.photo, { cls: i === 0 ? 'media--wide' : 'media--landscape' })}
        <h3 class="space__title">${s.title}</h3>
        <p>${s.text}</p>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section section--dark steps">
  <div class="wrap">
    ${sectionHead({ eyebrow: p.steps.eyebrow, title: p.steps.title })}
    <ol class="steps__list">
      ${p.steps.items
        .map(
          (s, i) => `<li class="step reveal" style="--d:${i}">
        <span class="step__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="step__title">${s.title}</h3>
        <p>${s.text}</p>
      </li>`
        )
        .join('')}
    </ol>
  </div>
</section>

<section class="section enquiry" id="${a.form}">
  <div class="wrap enquiry__grid">
    <div class="enquiry__intro">
      ${sectionHead({ eyebrow: f.eyebrow, title: f.title, lead: f.lead })}
      ${contactList(ctx)}
      <p class="enquiry__social"><a href="${cfg.links.instagramEvents}" target="_blank" rel="noopener">${icon('instagram')}@lesmoles_events<span class="sr-only"> ${t.ui.external}</span></a></p>
    </div>
    <form class="form" method="post" action="${esc(endpoint || '#')}" data-events-form
      data-endpoint="${esc(endpoint)}" data-mailto="${esc(cfg.contact.email)}"
      data-subject="${esc(f.mailSubject)}" data-sending="${esc(f.sending)}" data-sent="${esc(f.sent)}"
      data-mail-opened="${esc(f.mailOpened)}"
      data-error="${esc(f.error.replace('{email}', cfg.contact.email).replace('{phone}', cfg.contact.phoneDisplay))}">
      <div class="form__row">
        <div class="field">
          <label for="f-name">${f.name} <span class="req" aria-hidden="true">*</span></label>
          <input id="f-name" name="name" type="text" autocomplete="name" required>
        </div>
        <div class="field">
          <label for="f-email">${f.email} <span class="req" aria-hidden="true">*</span></label>
          <input id="f-email" name="email" type="email" autocomplete="email" required>
        </div>
      </div>
      <div class="form__row">
        <div class="field">
          <label for="f-phone">${f.phone}</label>
          <input id="f-phone" name="phone" type="tel" autocomplete="tel">
        </div>
        <div class="field">
          <label for="f-type">${f.type} <span class="req" aria-hidden="true">*</span></label>
          <select id="f-type" name="type" required>
            <option value="" selected disabled hidden></option>
            ${f.typeOptions.map((o) => `<option>${o}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form__row">
        <div class="field">
          <label for="f-date">${f.date}</label>
          <input id="f-date" name="date" type="date">
        </div>
        <div class="field">
          <label for="f-guests">${f.guests}</label>
          <input id="f-guests" name="guests" type="number" min="1" max="2000" inputmode="numeric">
        </div>
      </div>
      <div class="field">
        <label for="f-message">${f.message}</label>
        <textarea id="f-message" name="message" rows="5"></textarea>
      </div>
      <div class="field field--hp" aria-hidden="true">
        <label for="f-website">Website</label>
        <input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off">
      </div>
      <div class="field field--check">
        <input id="f-consent" name="consent" type="checkbox" required>
        <label for="f-consent">${f.consent.replace('{privacy}', privacy)}</label>
      </div>
      <div class="form__foot">
        <button class="btn btn--primary" type="submit"><span>${f.submit}</span></button>
        <p class="form__status" role="status" aria-live="polite"></p>
      </div>
    </form>
  </div>
</section>`;
}

/* ───────────── La casa ───────────── */
export function casa(ctx) {
  const { t, cfg } = ctx;
  const p = t.pages.casa;
  return `
${pageHero(ctx, { photoId: 'pedrera', eb: p.hero.eyebrow, title: p.hero.title, lead: p.hero.lead })}

${split(ctx, { photoId: 'sala', eb: p.pedrera.eyebrow, title: p.pedrera.title, body: p.pedrera.body })}
${split(ctx, { photoId: 'familia', eb: p.familia.eyebrow, title: p.familia.title, body: p.familia.body, reverse: true, tone: 'paper2' })}
${split(ctx, { photoId: 'hort', eb: p.hort.eyebrow, title: p.hort.title, body: p.hort.body })}
${split(ctx, { photoId: 'vi', eb: p.vi.eyebrow, title: p.vi.title, body: p.vi.body, reverse: true, tone: 'paper2' })}
${split(ctx, { photoId: 'oli', eb: p.territori.eyebrow, title: p.territori.title, body: p.territori.body })}

<section class="section section--paper2 awards-section">
  <div class="wrap">
    ${sectionHead({ eyebrow: p.awards.eyebrow, title: p.awards.title })}
    <ul class="award-cards">
      ${cfg.awards
        .map(
          (aw, i) => `<li class="award-card reveal" style="--d:${i}">
        ${icon(aw.icon, 'icon award-card__icon')}
        <h3 class="award-card__name">${t.awards[aw.id]}</h3>
        ${aw.since ? `<p class="award-card__since">${t.awards.since(aw.since)}</p>` : ''}
        <p>${p.awards.text[aw.id]}</p>
      </li>`
        )
        .join('')}
    </ul>
  </div>
</section>`;
}

/* ───────────── Reserva ───────────── */
export function reserva(ctx) {
  const { t, cfg } = ctx;
  const p = t.pages.reserva;
  const c = cfg.contact;
  const mail = `mailto:${c.email}?subject=${encodeURIComponent(p.booking.mailSubject)}`;
  const booking = cfg.bookingEmbed
    ? `<div class="booking__embed">${cfg.bookingEmbed}</div>`
    : `<p>${p.booking.text}</p>
      <div class="booking__actions">
        ${btn(`tel:${c.phone}`, `${p.booking.call} ${c.phoneDisplay}`, { iconName: 'phone' })}
        ${btn(mail, p.booking.write, { variant: 'outline', iconName: 'mail' })}
      </div>`;

  return `
${pageHero(ctx, { photoId: 'sala', eb: p.hero.eyebrow, title: p.hero.title, lead: p.hero.lead })}

<section class="section booking">
  <div class="wrap booking__grid">
    <div class="booking__card reveal">
      <h2 class="section-title section-title--sm">${p.booking.title}</h2>
      ${booking}
      <h3 class="booking__subtitle">${p.hoursTitle}</h3>
      ${hoursList(ctx)}
    </div>
    <div class="booking__times reveal">
      <h2 class="section-title section-title--sm">${p.entryTitle}</h2>
      <ul class="entry-list">
        ${cfg.menus
          .map(
            (m) => `<li class="entry">
          <h3 class="entry__name">${t.menus[m.id].name} <span class="entry__kind">${t.menus[m.id].kind}</span></h3>
          ${menuTimes(ctx, m)}
        </li>`
          )
          .join('')}
      </ul>
      ${textLink(`${t.routes.restaurant}#${t.anchors.menus}`, t.pages.restaurant.menus.eyebrow)}
    </div>
  </div>
</section>

<section class="section section--paper2 visit">
  <div class="wrap visit__grid">
    <div class="visit__info reveal">
      ${sectionHead({ title: p.location.title })}
      <p>${p.location.text}</p>
      ${contactList(ctx)}
      <div class="visit__actions">
        ${btn(mapsLink(cfg), t.ui.directions, { variant: 'outline', ext: true, t })}
      </div>
    </div>
    <div class="visit__map reveal">${mapBlock(ctx)}</div>
  </div>
</section>

<section class="section more">
  <div class="wrap more__grid">
    <article class="more__card reveal">
      <h2 class="more__title">${p.more.events.title}</h2>
      <p>${p.more.events.text}</p>
      ${textLink(`${t.routes.events}#${t.anchors.form}`, p.more.events.link)}
    </article>
    <article class="more__card reveal">
      <h2 class="more__title">${p.more.gift.title}</h2>
      <p>${p.more.gift.text}</p>
      ${textLink(cfg.links.shop, p.more.gift.link, { ext: true, t })}
    </article>
  </div>
</section>`;
}

/* ───────────── Avís legal ───────────── */
export function legal(ctx) {
  const { t, cfg } = ctx;
  const p = t.pages.legal;
  return `
<section class="page-head">
  <div class="wrap">
    ${eyebrow(p.hero.eyebrow)}
    <h1 class="page-head__title">${p.hero.title}</h1>
  </div>
</section>
<section class="section section--tight legal">
  <div class="wrap legal__inner">
    ${cfg.draft ? `<p class="notice">${p.pending}</p>` : ''}
    ${p.sections
      .map(
        (s) => `<section class="legal__section" id="${s.id}">
      <h2>${s.title}</h2>
      ${paras(s.body)}
    </section>`
      )
      .join('')}
  </div>
</section>`;
}

/* ───────────── 404 ───────────── */
export function notFound(ctx) {
  const { t } = ctx;
  const p = t.pages.notFound;
  return `
<section class="page-head page-head--center">
  <div class="wrap">
    <p class="page-head__code" aria-hidden="true">404</p>
    <h1 class="page-head__title">${p.heading}</h1>
    <p class="lead">${p.text}</p>
    <div class="page-head__actions">
      ${btn(t.routes.home, p.home, { variant: 'outline' })}
      ${btn(t.routes.reserva, t.ui.bookTable)}
    </div>
  </div>
</section>`;
}
