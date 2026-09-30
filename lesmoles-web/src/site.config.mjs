/*
 * Datos de Les Moles que no dependen del idioma: contacto, horarios, menús,
 * cifras de los espacios, redes y fotos. Es el ÚNICO sitio donde se cambian.
 * Cada página y el marcado para Google (JSON-LD) salen de aquí, así la web
 * nunca dice dos horarios o dos teléfonos distintos.
 *
 * Todo lo marcado con «VERIFICAR» sale de fuentes públicas (la web actual
 * tal como la indexa Google, TheFork, Guía Michelin, Guía Repsol...) y puede
 * estar desfasado. Ver «Datos a confirmar» en AUDITORIA.md.
 */

export default {
  // Dominio definitivo, sin barra final. Se usa en canonical, hreflang,
  // sitemap y Open Graph.
  baseUrl: 'https://lesmoles.com',

  // Idioma por defecto: el que se sirve en "/" (igual que la web actual).
  defaultLang: 'ca',
  langs: ['ca', 'es', 'en'],

  // true mientras falten fotos: los huecos llevan una etiqueta que dice qué
  // foto va ahí. Ponerlo a false antes de publicar.
  draft: true,

  contact: {
    phone: '+34977573224',
    phoneDisplay: '977 57 32 24',
    email: 'lesmoles@lesmoles.com',
    street: 'Ctra. de la Sénia, km 2',
    postalCode: '43550',
    city: 'Ulldecona',
    region: 'Tarragona',
    country: 'ES',
    mapsQuery: 'Restaurant Les Moles, Ctra. de la Sénia km 2, 43550 Ulldecona',
  },

  // Enlaces a lo que de momento sigue viviendo fuera de esta web.
  links: {
    // La tienda (WooCommerce) de la web actual. Si se mueve a un subdominio
    // (p. ej. botiga.lesmoles.com), cambiar solo esta línea.
    shop: 'https://lesmoles.com/tenda/',
    instagram: 'https://www.instagram.com/lesmoles_restaurant/',
    instagramEvents: 'https://www.instagram.com/lesmoles_events/',
    facebook: 'https://www.facebook.com/LesMolesUlldecona/',
  },

  // Motor de reservas. Pegar aquí el código (iframe/script) que da el
  // proveedor (CoverManager, TheFork Manager...). Vacío = la página de
  // reserva ofrece llamar o escribir.
  bookingEmbed: '',

  // Dónde se envía el formulario de eventos (Formspree, Getform, un
  // endpoint propio...). Vacío = se abre el correo del visitante con la
  // petición ya escrita, dirigida a contact.email.
  eventsFormEndpoint: '',

  // VERIFICAR — horario de apertura. Formato 24 h. day: 1 = lunes … 7 = domingo.
  hours: [
    { days: [2, 3, 4, 5, 6, 7], service: 'lunch', open: '13:00', close: '15:30' },
    { days: [5, 6], service: 'dinner', open: '20:30', close: '22:30' },
  ],
  closedDays: [1],

  // VERIFICAR — menús. Los nombres y textos van en cada idioma (i18n/*.mjs,
  // clave `menus`). Aquí: precio por persona (null = no se muestra) y horas de
  // entrada según la propia web ("Horaris de reserva").
  menus: [
    {
      id: 'cami',
      tasting: true,
      price: null,
      lunch: ['13:00', '13:45'],
      dinner: ['20:30', '21:15'],
    },
    {
      id: 'terra',
      tasting: true,
      price: null,
      lunch: ['13:00', '13:45', '14:30'],
      dinner: ['20:30', '21:15'],
    },
    {
      id: 'tradicio',
      tasting: false,
      price: { lunch: 49.9, dinner: 56.9 },
      lunch: ['13:00', '15:30'],
      dinner: ['20:30', '22:00'],
      range: true,
    },
    {
      id: 'carta',
      tasting: false,
      price: null,
      lunch: ['13:00', '15:30'],
      dinner: ['20:30', '22:00'],
      range: true,
    },
  ],

  // Distinciones. `since` es el año de la guía (null = no se muestra).
  awards: [
    { id: 'michelin', icon: 'star', since: 2014 },
    { id: 'green', icon: 'leaf', since: null },
    { id: 'repsol', icon: 'sun', since: 2020 },
    { id: 'repsolSostenible', icon: 'sprout', since: null },
  ],

  // Cifras de Les Moles Events (web actual, apartado Espais).
  venue: {
    gardensM2: 6000,
    gardenZones: 5,
    banquetHalls: 2,
    banquetCapacity: 350,
    ceremonyCapacity: 200,
    stageM2: 60,
    stageWatts: 4000,
  },

  /*
   * Huecos de foto. Para poner una foto basta con dejar el archivo en
   * src/assets/img/ con el nombre del hueco (pedrera.jpg, plat.webp...) y
   * volver a construir: la web la usa sola. Mientras no esté, se pinta un
   * fondo de piedra con la descripción de la foto que falta.
   *   tone: color del fondo provisional (night | stone | olive | sand)
   *   pos:  encuadre de la foto (object-position)
   */
  photos: {
    pedrera: { tone: 'night' },
    plat: { tone: 'stone' },
    sala: { tone: 'sand' },
    familia: { tone: 'stone' },
    hort: { tone: 'olive' },
    vi: { tone: 'night' },
    oli: { tone: 'olive' },
    casament: { tone: 'night', pos: 'center 42%' },
    cerimonia: { tone: 'stone' },
    jardins: { tone: 'olive' },
    salo: { tone: 'sand' },
    escenari: { tone: 'night' },
    empresa: { tone: 'sand' },
    celebracio: { tone: 'stone' },
  },
};
