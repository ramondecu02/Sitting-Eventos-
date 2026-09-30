// Català — idioma per defecte (es serveix a "/").
export default {
  lang: 'ca',
  ogLocale: 'ca_ES',
  label: 'CA',
  name: 'Català',

  routes: {
    home: '/',
    restaurant: '/restaurant/',
    events: '/events/',
    casa: '/la-casa/',
    reserva: '/reserva/',
    legal: '/avis-legal/',
  },
  anchors: {
    menus: 'menus',
    celler: 'celler',
    hort: 'hort',
    casaments: 'casaments',
    empreses: 'empreses',
    celebracions: 'celebracions',
    espais: 'espais',
    form: 'demanar-informacio',
    cookies: 'cookies',
    privacitat: 'privacitat',
  },

  ui: {
    skip: 'Salta al contingut',
    home: 'Inici',
    nav: {
      restaurant: 'Restaurant',
      events: 'Events',
      casa: 'La casa',
      shop: 'Botiga',
      reserva: 'Reserva',
    },
    navLabel: 'Menú principal',
    book: 'Reservar',
    bookTable: 'Reservar taula',
    openMenu: 'Obrir el menú',
    closeMenu: 'Tancar el menú',
    langLabel: 'Idioma',
    external: "(s'obre en una pestanya nova)",
    days: ['dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte', 'diumenge'],
    dayRange: (a, b) => `${a} a ${b}`,
    dayList: (items) => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} i ${items[items.length - 1]}`,
    lunch: 'Migdia',
    dinner: 'Nit',
    closed: 'Tancat',
    perPerson: 'per persona',
    from: 'des de',
    phone: 'Telèfon',
    email: 'Correu',
    address: 'Adreça',
    hours: 'Horari',
    directions: 'Com arribar',
    mapLoad: 'Veure el mapa',
    mapNote: 'El mapa es carrega des de Google Maps només si el demaneu.',
    mapTitle: 'Mapa de situació de Les Moles',
    photoPending: 'Foto pendent',
    readMore: 'Més informació',
  },

  awards: {
    michelin: 'Estrella Michelin',
    green: 'Estrella Verda Michelin',
    repsol: '2 Sols Repsol',
    repsolSostenible: 'Sol Sostenible Repsol',
    since: (y) => `des de ${y}`,
    label: 'Distincions',
  },

  menus: {
    cami: {
      name: 'El camí que hem fet',
      kind: 'Menú degustació',
      desc: 'Un recorregut pels plats que han marcat la història de la casa, explicats amb la mirada d’avui.',
    },
    terra: {
      name: 'Terra Incògnita',
      kind: 'Menú degustació',
      desc: 'Un menú per descobrir: productes i receptes de les Terres de l’Ebre que poca gent coneix.',
    },
    tradicio: {
      name: 'Tradició',
      kind: 'Menú',
      desc: 'La cuina tarragonina de sempre, a la nostra manera. Més curt, per a un àpat sense presses.',
    },
    carta: {
      name: 'Carta',
      kind: 'A la carta',
      desc: 'Els plats de temporada, també en mitges racions per poder-ne tastar més.',
    },
  },

  photos: {
    pedrera: 'La paret de l’antiga pedrera, il·luminada de nit',
    plat: 'Un plat de Jeroni Castell',
    sala: 'La sala del restaurant, amb parets de pedra',
    familia: 'Jeroni Castell, Carmen Sauch, Pau i Roger',
    hort: 'L’hort biodinàmic, a l’entrada del restaurant',
    vi: 'Les ampolles de vi propi de Les Moles',
    oli: 'Oliveres mil·lenàries del Montsià',
    casament: 'Convidats d’un casament als jardins de Les Moles, de nit',
    cerimonia: 'La zona de cerimònia, amb grades de pedra davant la pedrera',
    jardins: 'Els jardins preparats per a l’aperitiu',
    salo: 'Un saló de banquets parat per a un casament',
    escenari: 'L’escenari dels jardins durant una festa',
    empresa: 'Un esdeveniment d’empresa a Les Moles',
    celebracio: 'Una taula parada per a una celebració familiar',
  },

  footer: {
    tagline: 'Restaurant i espai d’esdeveniments a l’antiga pedrera d’Ulldecona, Terres de l’Ebre.',
    visit: 'Visita’ns',
    explore: 'Explora',
    follow: 'Segueix-nos',
    legal: 'Avís legal',
    privacy: 'Privacitat',
    cookies: 'Cookies',
    rights: 'Tots els drets reservats.',
  },

  pages: {
    home: {
      title: 'Les Moles · Restaurant amb estrella Michelin a Ulldecona',
      description:
        'Cuina de Jeroni Castell a l’antiga pedrera d’Ulldecona. Estrella Michelin, Estrella Verda i dos Sols Repsol. Menús degustació, vi propi i esdeveniments.',
      hero: {
        eyebrow: 'Ulldecona · Terres de l’Ebre',
        title: 'Cuinem la terra on es tallaven les moles',
        lead: 'Restaurant familiar de Jeroni Castell i Carmen Sauch, a l’antiga pedrera d’Ulldecona.',
        secondary: 'Casaments i esdeveniments',
      },
      intro: {
        eyebrow: 'La casa',
        title: 'Una família, una pedrera i tot un territori al plat',
        body: [
          'Les Moles ocupa la primera pedrera d’Ulldecona, d’on antigament sortien les moles de molí que donen nom a la casa. Avui, entre parets de pedra i jardins, hi cuinem el paisatge de les Terres de l’Ebre: el mar i el Delta, la muntanya dels Ports i les oliveres mil·lenàries del Montsià.',
          'Hi som tota la família. En Jeroni Castell i el seu fill Pau a la cuina, la Carmen Sauch a la sala i al celler, i en Roger, colze a colze amb tots ells.',
        ],
        link: 'La nostra història',
      },
      philosophy: {
        eyebrow: 'Com cuinem',
        statement: 'Proximitat i tècnica, sí. Però si no ens ho passem bé, no té cap sentit.',
        items: [
          { title: 'Proximitat', text: 'Verdures del nostre hort i producte de les Terres de l’Ebre, del Delta als Ports.' },
          { title: 'Tècnica', text: 'Una cuina contemporània que respecta la tradició tarragonina i la fa avançar.' },
          { title: 'Diversió', text: 'Volem que a taula us ho passeu tan bé com nosaltres a la cuina.' },
        ],
      },
      doors: {
        restaurant: {
          eyebrow: 'El restaurant',
          title: 'Menús, carta i vins de casa',
          text: 'Dos menús degustació, el menú Tradició i carta, amb l’harmonia dels vins que fem nosaltres mateixos.',
          link: 'Veure els menús',
        },
        events: {
          eyebrow: 'Les Moles Events',
          title: 'Casaments, empreses i celebracions',
          text: 'Més de 6.000 m² de jardins al peu de la pedrera, dos salons de banquets i la cuina de Jeroni Castell.',
          link: 'Descobrir els espais',
        },
      },
      menus: {
        eyebrow: 'Menús',
        title: 'Quatre maneres de seure a taula',
        link: 'Menús, preus i horaris',
      },
      origin: {
        hort: {
          eyebrow: 'Hort biodinàmic',
          title: 'L’hort, a l’entrada de casa',
          text: 'És el nostre rebost, el nostre banc de proves i la nostra font d’inspiració. Des del 2021 el conreem en biodinàmica.',
        },
        vi: {
          eyebrow: 'Vi propi',
          title: 'Els nostres vins, des del 2012',
          text: 'Elaborem a la Terra Alta un blanc i un negre joves i un criança que porten el nom de la casa.',
        },
        link: 'Coneix l’hort i el celler',
      },
      events: {
        eyebrow: 'Les Moles Events',
        title: 'Celebracions amb cuina d’estrella',
        text: 'Una pedrera il·luminada de nit, jardins, dos salons i un escenari per a casaments, empreses i celebracions.',
        cta: 'Demanar informació',
        more: 'Veure els espais',
      },
      gift: {
        eyebrow: 'Regals',
        title: 'Regala una experiència a Les Moles',
        text: 'Menús degustació per a dues persones, amb harmonia de vins o sense, i places per a les dates especials de la taula del xef.',
        cta: 'Anar a la botiga',
      },
      visit: {
        eyebrow: 'Visita’ns',
        title: 'On som',
        text: 'Al km 2 de la carretera de la Sénia, a Ulldecona (Montsià). Entre el Delta de l’Ebre i els Ports, a tocar de Castelló.',
      },
    },

    restaurant: {
      title: 'El restaurant · Menús, carta i vins · Les Moles',
      description:
        'Menús degustació, menú Tradició i carta de Jeroni Castell a Ulldecona. Hores d’entrada, preus i harmonia amb els vins propis de Les Moles.',
      hero: {
        eyebrow: 'El restaurant',
        title: 'La cuina de Jeroni Castell',
        lead: 'Producte de proximitat, tècnica i ganes de gaudir, amb el paisatge de les Terres de l’Ebre com a punt de partida.',
      },
      cuina: {
        eyebrow: 'La cuina',
        title: 'El paisatge de l’Ebre, al plat',
        body: [
          'Cuinem el que ens dona l’entorn: el peix i el marisc de la costa i del Delta, l’arròs, les verdures del nostre hort, la muntanya dels Ports i, per sobre de tot, l’oli d’oliva de les oliveres mil·lenàries del Montsià.',
          'En Jeroni Castell i el seu fill Pau fan una cuina que respecta la tradició tarragonina i la mira amb ulls d’avui. La tècnica hi és per fer lluir el producte, mai per amagar-lo.',
        ],
      },
      menus: {
        eyebrow: 'Menús i carta',
        title: 'Tria com ho vols viure',
        lead: 'Els menús degustació se serveixen a tota la taula i es poden acompanyar amb harmonia de vins. Si teniu alguna al·lèrgia o intolerància, digueu-nos-ho en reservar i hi adaptarem el menú.',
        entry: 'Hores d’entrada',
        continuous: (a, b) => `de ${a} a ${b}`,
        priceNote: 'Preus per persona, IVA inclòs.',
      },
      chef: {
        eyebrow: 'Taula del xef',
        title: 'Dates assenyalades',
        text: 'Algunes dates especials cuinem un menú únic per a poques places. Les dates i les entrades es publiquen a la botiga.',
        cta: 'Veure les dates',
      },
      celler: {
        eyebrow: 'El celler',
        title: 'Vins de casa i del territori',
        body: [
          'La Carmen Sauch porta la sala i el celler. Des del 2012 elaborem els nostres propis vins a la Terra Alta: un blanc i un negre joves i Les Moles Criança.',
          'La carta de vins fa un recorregut pels cellers de les Terres de l’Ebre i més enllà, pensada per acompanyar cada menú.',
        ],
      },
      hort: {
        eyebrow: 'L’hort',
        title: 'Cultivem el que cuinem',
        body: [
          'A l’entrada del restaurant hi ha l’hort i el jardí botànic. D’allà surten verdures, herbes i flors per a la cuina, i també moltes idees: és el nostre banc de proves.',
          'El 2021 vam fer el pas de l’agricultura ecològica a la biodinàmica.',
        ],
      },
      cta: {
        title: 'Us guardem taula?',
        text: 'Reserveu per telèfon o per correu. Us confirmarem la taula de seguida.',
      },
    },

    events: {
      title: 'Casaments i esdeveniments a Ulldecona · Les Moles Events',
      description:
        'Casaments, empreses i celebracions amb cuina d’estrella Michelin. 6.000 m² de jardins, cerimònia davant la pedrera i banquets fins a 350 convidats.',
      hero: {
        eyebrow: 'Les Moles Events',
        title: 'Casaments i esdeveniments',
        lead: 'Paisatge, professionalitat i alta cuina per crear moments irrepetibles.',
        cta: 'Demanar informació',
      },
      intro: {
        title: 'Una pedrera, uns jardins i la cuina de Jeroni Castell',
        text: 'Celebrar a Les Moles és fer-ho en un paisatge únic, amb un equip que fa anys que organitza grans esdeveniments i amb la cuina d’un restaurant amb estrella Michelin. Nosaltres ens ocupem de tot perquè vosaltres només hàgiu de gaudir.',
      },
      types: [
        {
          id: 'casaments',
          photo: 'cerimonia',
          title: 'Casaments',
          text: 'Cerimònia a l’aire lliure davant la pedrera, aperitiu als jardins i banquet amb cuina d’estrella. I la festa, a l’escenari, fins que el cos aguanti.',
        },
        {
          id: 'empreses',
          photo: 'empresa',
          title: 'Empreses',
          text: 'Dinars de treball, presentacions, jornades i celebracions d’equip, amb el rigor que necessiteu i espais que s’adapten a cada format.',
        },
        {
          id: 'celebracions',
          photo: 'celebracio',
          title: 'Celebracions',
          text: 'Aniversaris, comunions, retrobaments familiars o entre amics. Qualsevol excusa és bona per celebrar-ho a Les Moles.',
        },
      ],
      spaces: {
        eyebrow: 'Els espais',
        title: 'Interiors i exteriors per a cada moment del dia',
        items: [
          { photo: 'pedrera', title: 'La pedrera', text: 'La paret de pedra de l’antiga pedrera, il·luminada de nit, és el teló de fons de tot l’esdeveniment.' },
          { photo: 'cerimonia', title: 'Zona de cerimònia', text: 'Grades de pedra d’Ulldecona encarades a la pedrera, per a unes 200 persones.' },
          { photo: 'jardins', title: 'Jardins', text: 'Més de 6.000 m² repartits en cinc zones enjardinades i connectades entre elles, per a l’aperitiu, el còctel o la festa.' },
          { photo: 'salo', title: 'Salons de banquets', text: 'Dos salons, amb capacitat per a fins a 350 convidats asseguts.' },
          { photo: 'escenari', title: 'Escenari', text: '60 m² al cor dels jardins, amb 4.000 W de potència, per a música en directe i espectacles.' },
        ],
      },
      stats: {
        gardens: 'm² de jardins',
        banquet: 'convidats al banquet',
        ceremony: 'persones a la cerimònia',
        halls: 'salons de banquets',
        stage: 'm² d’escenari',
      },
      steps: {
        eyebrow: 'Com treballem',
        title: 'Del primer correu al gran dia',
        items: [
          { title: 'Expliqueu-nos la idea', text: 'Ompliu el formulari o truqueu-nos. Us responem en pocs dies.' },
          { title: 'Visiteu Les Moles', text: 'Us ensenyem els espais i en parlem amb calma, sense presses.' },
          { title: 'Proposta a mida', text: 'Menú, espais i horaris pensats per al vostre esdeveniment.' },
          { title: 'El gran dia', text: 'L’equip s’encarrega de tot. Vosaltres, només a gaudir.' },
        ],
      },
      form: {
        eyebrow: 'Demaneu informació',
        title: 'Parlem del vostre esdeveniment',
        lead: 'Deixeu-nos les dades i us enviarem disponibilitat i una proposta.',
        name: 'Nom i cognoms',
        email: 'Correu electrònic',
        phone: 'Telèfon',
        type: 'Tipus d’esdeveniment',
        typeOptions: ['Casament', 'Esdeveniment d’empresa', 'Celebració', 'Una altra cosa'],
        date: 'Data aproximada',
        guests: 'Nombre de convidats',
        message: 'Expliqueu-nos què teniu al cap',
        consent: 'He llegit la <a href="{privacy}">política de privacitat</a> i accepto que Les Moles faci servir aquestes dades per respondre’m.',
        submit: 'Enviar la petició',
        sending: 'Enviant…',
        sent: 'Gràcies! Hem rebut la vostra petició i us respondrem aviat.',
        mailSubject: 'Petició d’informació per a un esdeveniment',
        mailOpened: 'S’ha obert el vostre correu amb la petició escrita. Només cal enviar-lo.',
        error: 'No s’ha pogut enviar. Escriviu-nos a {email} o truqueu al {phone}.',
        required: 'obligatori',
      },
    },

    casa: {
      title: 'La casa · Història, família i territori · Les Moles',
      description:
        'Les Moles és a la primera pedrera d’Ulldecona. La història de la família Castell Sauch, l’hort biodinàmic, el vi propi i les distincions del restaurant.',
      hero: {
        eyebrow: 'La casa',
        title: 'Una pedrera, una família, un territori',
        lead: 'La història de Les Moles és la d’un lloc, la d’una família i la de les Terres de l’Ebre.',
      },
      pedrera: {
        eyebrow: 'La pedrera',
        title: 'On naixien les moles',
        body: [
          'Les Moles s’aixeca a la primera pedrera d’Ulldecona. D’aquí s’extreia la pedra per fer les moles, les grans rodes dels molins. Les parets de pedra que encara ens envolten en són el testimoni, i avui fan de teló de fons de la sala i dels jardins.',
        ],
      },
      familia: {
        eyebrow: 'La família',
        title: 'Jeroni, Carmen, Pau i Roger',
        body: [
          'Jeroni Castell i Carmen Sauch van fundar Les Moles. Ell és a la cuina; ella porta la sala i el celler. Avui els seus fills, Pau i Roger, treballen colze a colze amb ells.',
          'Volem créixer sense deixar de ser qui som: una casa familiar arrelada al seu territori.',
        ],
      },
      hort: {
        eyebrow: 'L’hort biodinàmic',
        title: 'La cuina comença a l’entrada',
        body: [
          'L’hort i el jardí botànic ens donen verdures, herbes i flors, i ens serveixen de laboratori. Després d’anys d’agricultura ecològica, el 2021 vam passar a la biodinàmica.',
        ],
      },
      vi: {
        eyebrow: 'El vi',
        title: 'Vi propi des del 2012',
        body: [
          'Des del 2012 fem els nostres vins a la Terra Alta: Les Moles blanc i negre joves i Les Moles Criança. Són a la carta i als menús amb harmonia.',
        ],
      },
      territori: {
        eyebrow: 'El territori',
        title: 'Entre el Delta i els Ports',
        body: [
          'Ulldecona és al Montsià, a tocar de Castelló. En poca distància hi ha el mar i el Delta de l’Ebre, la muntanya dels Ports i un dels conjunts d’oliveres mil·lenàries més grans del món. Tot això arriba al plat.',
        ],
      },
      awards: {
        eyebrow: 'Reconeixements',
        title: 'Distincions',
        text: {
          michelin: 'La Guia Michelin distingeix la cuina de Les Moles amb una estrella.',
          green: 'Per la nostra manera de treballar, lligada a l’hort, al producte local i al territori.',
          repsol: 'La Guia Repsol ens atorga dos Sols.',
          repsolSostenible: 'El reconeixement de la Guia Repsol a la sostenibilitat.',
        },
      },
    },

    reserva: {
      title: 'Reserva · Les Moles, Ulldecona',
      description:
        'Reserva taula a Les Moles, a Ulldecona. Horaris, hores d’entrada de cada menú, telèfon, adreça i com arribar.',
      hero: {
        eyebrow: 'Reserva',
        title: 'Us esperem a taula',
        lead: 'Reserveu per telèfon o per correu. Si teniu alguna al·lèrgia o intolerància, digueu-nos-ho en reservar.',
      },
      booking: {
        title: 'Feu la reserva',
        text: 'Truqueu-nos o escriviu-nos amb el dia, l’hora, el nombre de persones i el menú que us ve de gust.',
        call: 'Trucar al',
        write: 'Escriure un correu',
        mailSubject: 'Reserva de taula',
      },
      hoursTitle: 'Horari',
      entryTitle: 'Hores d’entrada per menú',
      location: {
        title: 'Com arribar',
        text: 'Al km 2 de la carretera de la Sénia, a Ulldecona (Montsià), entre el Delta de l’Ebre i els Ports.',
      },
      more: {
        events: { title: 'Grups i esdeveniments', text: 'Per a casaments, empreses i celebracions, feu servir el formulari d’Events.', link: 'Anar a Events' },
        gift: { title: 'Regals', text: 'Menús degustació per regalar i dates de la taula del xef.', link: 'Anar a la botiga' },
      },
    },

    legal: {
      title: 'Avís legal, privacitat i cookies · Les Moles',
      description: 'Avís legal, política de privacitat i política de cookies del web de Les Moles.',
      hero: { eyebrow: 'Informació legal', title: 'Avís legal, privacitat i cookies' },
      pending: 'Pendent: les dades del titular i la política de privacitat les ha de completar l’assessor legal de Les Moles abans de publicar el web.',
      sections: [
        {
          id: 'avis-legal',
          title: 'Avís legal',
          body: [
            'Titular del web: [raó social] · NIF [·] · Ctra. de la Sénia, km 2, 43550 Ulldecona (Tarragona) · lesmoles@lesmoles.com · 977 57 32 24.',
          ],
        },
        {
          id: 'privacitat',
          title: 'Privacitat',
          body: [
            'Les dades que ens envieu pel formulari d’esdeveniments o per correu només es fan servir per respondre la vostra petició i no es cedeixen a tercers. Podeu exercir els vostres drets d’accés, rectificació i supressió escrivint a lesmoles@lesmoles.com.',
          ],
        },
        {
          id: 'cookies',
          title: 'Cookies',
          body: [
            'Aquest web no fa servir cookies pròpies ni d’analítica. El mapa de Google Maps només es carrega si el demaneu; en aquest cas, Google pot instal·lar les seves pròpies cookies.',
          ],
        },
      ],
    },

    notFound: {
      title: 'Pàgina no trobada · Les Moles',
      description: 'Aquesta pàgina no existeix.',
      heading: 'Aquesta pàgina no existeix',
      text: 'Potser l’enllaç és antic: hem estrenat web. Comenceu per l’inici o reserveu directament.',
      home: 'Tornar a l’inici',
    },
  },
};
