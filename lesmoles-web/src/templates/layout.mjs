// Esqueleto común: <head> (SEO, idiomas, Open Graph, datos para Google),
// cabecera, pie y scripts.
import { esc, icon, hoursList, contactList, awardsList } from './components.mjs';

const NAV = ['restaurant', 'events', 'casa'];

export function abs(cfg, p) {
  return cfg.baseUrl + p;
}

function alternates(ctx) {
  const { cfg, all, pageKey } = ctx;
  if (!pageKey) return '';
  const links = cfg.langs.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${abs(cfg, all[l].routes[pageKey])}">`
  );
  links.push(
    `<link rel="alternate" hreflang="x-default" href="${abs(cfg, all[cfg.defaultLang].routes[pageKey])}">`
  );
  return links.join('\n  ');
}

function langSwitch(ctx, cls) {
  const { t, cfg, all, pageKey } = ctx;
  return `<ul class="langs ${cls}" aria-label="${esc(t.ui.langLabel)}">${cfg.langs
    .map((l) => {
      const href = all[l].routes[pageKey || 'home'];
      const cur = l === t.lang ? ' aria-current="true"' : '';
      return `<li><a href="${href}" hreflang="${l}" lang="${l}"${cur}><abbr title="${esc(all[l].name)}">${all[l].label}</abbr></a></li>`;
    })
    .join('')}</ul>`;
}

function header(ctx) {
  const { t, cfg, pageKey, heroMode } = ctx;
  const navItems = NAV.map((k) => {
    const cur = k === pageKey ? ' aria-current="page"' : '';
    return `<li><a href="${t.routes[k]}"${cur}>${t.ui.nav[k]}</a></li>`;
  }).join('');
  return `<header class="site-header${heroMode === 'dark' ? ' site-header--overlay' : ''}" data-header>
  <div class="wrap header__inner">
    <a class="brand" href="${t.routes.home}" aria-label="Les Moles — ${esc(t.ui.home)}">
      <span class="brand__les">Les</span><span class="brand__moles">Moles</span>
    </a>
    <nav class="nav" id="site-nav" aria-label="${esc(t.ui.navLabel)}">
      <ul class="nav__list">
        ${navItems}
        <li><a href="${cfg.links.shop}" target="_blank" rel="noopener">${t.ui.nav.shop}<span class="sr-only"> ${t.ui.external}</span></a></li>
        <li class="nav__only-mobile"><a href="${t.routes.reserva}"${pageKey === 'reserva' ? ' aria-current="page"' : ''}>${t.ui.nav.reserva}</a></li>
      </ul>
      <div class="nav__extra">
        ${langSwitch(ctx, 'langs--panel')}
        <a class="btn btn--primary" href="${t.routes.reserva}">${t.ui.bookTable}</a>
        <a class="nav__phone" href="tel:${cfg.contact.phone}">${icon('phone')}${cfg.contact.phoneDisplay}</a>
      </div>
    </nav>
    <div class="header__actions">
      ${langSwitch(ctx, 'langs--header')}
      <a class="btn btn--primary btn--sm header__book" href="${t.routes.reserva}">${t.ui.book}</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"
        data-open-label="${esc(t.ui.openMenu)}" data-close-label="${esc(t.ui.closeMenu)}">
        <span class="sr-only">${t.ui.openMenu}</span><span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span>
      </button>
    </div>
  </div>
</header>`;
}

function footer(ctx) {
  const { t, cfg } = ctx;
  const f = t.footer;
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <a class="brand brand--footer" href="${t.routes.home}" aria-label="Les Moles — ${esc(t.ui.home)}">
        <span class="brand__les">Les</span><span class="brand__moles">Moles</span>
      </a>
      <p class="footer__tagline">${f.tagline}</p>
      ${awardsList(ctx, 'footer')}
    </div>
    <div class="footer__col">
      <h2 class="footer__title">${f.visit}</h2>
      ${contactList(ctx)}
    </div>
    <div class="footer__col">
      <h2 class="footer__title">${t.ui.hours}</h2>
      ${hoursList(ctx, 'hours--footer')}
    </div>
    <div class="footer__col">
      <h2 class="footer__title">${f.explore}</h2>
      <ul class="footer__links">
        ${NAV.map((k) => `<li><a href="${t.routes[k]}">${t.ui.nav[k]}</a></li>`).join('')}
        <li><a href="${t.routes.reserva}">${t.ui.nav.reserva}</a></li>
        <li><a href="${cfg.links.shop}" target="_blank" rel="noopener">${t.ui.nav.shop}<span class="sr-only"> ${t.ui.external}</span></a></li>
      </ul>
      <h2 class="footer__title footer__title--follow">${f.follow}</h2>
      <ul class="social">
        <li><a href="${cfg.links.instagram}" target="_blank" rel="noopener">${icon('instagram')}<span>@lesmoles_restaurant</span></a></li>
        <li><a href="${cfg.links.instagramEvents}" target="_blank" rel="noopener">${icon('instagram')}<span>@lesmoles_events</span></a></li>
        <li><a href="${cfg.links.facebook}" target="_blank" rel="noopener">${icon('facebook')}<span>Facebook</span></a></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer__bottom">
    <p>© ${year} Les Moles · Ulldecona. ${f.rights}</p>
    <ul class="footer__legal">
      <li><a href="${t.routes.legal}">${f.legal}</a></li>
      <li><a href="${t.routes.legal}#${t.anchors.privacitat}">${f.privacy}</a></li>
      <li><a href="${t.routes.legal}#${t.anchors.cookies}">${f.cookies}</a></li>
    </ul>
    ${langSwitch(ctx, 'langs--footer')}
  </div>
</footer>`;
}

const DAY_SCHEMA = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function restaurantLd(ctx) {
  const { t, cfg } = ctx;
  const c = cfg.contact;
  return {
    '@type': 'Restaurant',
    '@id': `${cfg.baseUrl}/#restaurant`,
    name: 'Les Moles',
    url: abs(cfg, t.routes.home),
    image: abs(cfg, '/og.jpg'),
    telephone: c.phone,
    email: c.email,
    priceRange: '€€€',
    servesCuisine: ['Catalan', 'Mediterranean', 'Creative'],
    acceptsReservations: abs(cfg, t.routes.reserva),
    hasMenu: `${abs(cfg, t.routes.restaurant)}#${t.anchors.menus}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.street,
      postalCode: c.postalCode,
      addressLocality: c.city,
      addressRegion: c.region,
      addressCountry: c.country,
    },
    openingHoursSpecification: cfg.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => DAY_SCHEMA[d - 1]),
      opens: h.open,
      closes: h.close,
    })),
    award: cfg.awards.map((a) => t.awards[a.id]),
    founder: [
      { '@type': 'Person', name: 'Jeroni Castell' },
      { '@type': 'Person', name: 'Carmen Sauch' },
    ],
    sameAs: [cfg.links.instagram, cfg.links.facebook],
  };
}

function jsonLd(ctx) {
  const { t, cfg, pageKey, page } = ctx;
  const graph = [];
  if (pageKey === 'home') {
    graph.push({
      '@type': 'WebSite',
      '@id': `${cfg.baseUrl}/#website`,
      name: 'Les Moles',
      url: abs(cfg, t.routes.home),
      inLanguage: t.lang,
    });
  }
  if (['home', 'restaurant', 'reserva', 'casa'].includes(pageKey)) graph.push(restaurantLd(ctx));
  if (pageKey === 'events') {
    graph.push({
      '@type': 'EventVenue',
      '@id': `${cfg.baseUrl}/#events`,
      name: 'Les Moles Events',
      url: abs(cfg, t.routes.events),
      telephone: cfg.contact.phone,
      email: cfg.contact.email,
      maximumAttendeeCapacity: cfg.venue.banquetCapacity,
      address: restaurantLd(ctx).address,
      sameAs: [cfg.links.instagramEvents],
    });
  }
  if (pageKey && pageKey !== 'home') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Les Moles', item: abs(cfg, t.routes.home) },
        { '@type': 'ListItem', position: 2, name: page.hero?.eyebrow || page.title, item: abs(cfg, t.routes[pageKey]) },
      ],
    });
  }
  if (!graph.length) return '';
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

export function layout(ctx, main) {
  const { t, cfg, all, page, pageKey, assets } = ctx;
  const url = pageKey ? abs(cfg, t.routes[pageKey]) : null;
  const ogLocales = cfg.langs
    .filter((l) => l !== t.lang)
    .map((l) => `<meta property="og:locale:alternate" content="${all[l].ogLocale}">`)
    .join('\n  ');
  return `<!doctype html>
<html lang="${t.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  ${url ? `<link rel="canonical" href="${url}">` : ''}
  ${cfg.draft ? '<meta name="robots" content="noindex, nofollow">' : url ? '' : '<meta name="robots" content="noindex">'}
  ${alternates(ctx)}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Les Moles">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  ${url ? `<meta property="og:url" content="${url}">` : ''}
  <meta property="og:image" content="${abs(cfg, '/og.jpg')}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${t.ogLocale}">
  ${ogLocales}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#17140f">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/assets/fonts/cormorant-garamond-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/karla-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${assets.css}">
  <script src="${assets.js}" defer></script>
  ${jsonLd(ctx)}
</head>
<body class="page-${pageKey || 'error'}">
<a class="skip-link" href="#main">${t.ui.skip}</a>
${header(ctx)}
<main id="main" tabindex="-1">
${main}
</main>
${footer(ctx)}
</body>
</html>
`;
}
