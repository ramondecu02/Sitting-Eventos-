// Castellano — se sirve en "/es/".
export default {
  lang: 'es',
  ogLocale: 'es_ES',
  label: 'ES',
  name: 'Español',

  routes: {
    home: '/es/',
    restaurant: '/es/restaurante/',
    events: '/es/eventos/',
    casa: '/es/la-casa/',
    reserva: '/es/reserva/',
    legal: '/es/aviso-legal/',
  },
  anchors: {
    menus: 'menus',
    celler: 'bodega',
    hort: 'huerto',
    casaments: 'bodas',
    empreses: 'empresas',
    celebracions: 'celebraciones',
    espais: 'espacios',
    form: 'pedir-informacion',
    cookies: 'cookies',
    privacitat: 'privacidad',
  },

  ui: {
    skip: 'Saltar al contenido',
    home: 'Inicio',
    nav: {
      restaurant: 'Restaurante',
      events: 'Eventos',
      casa: 'La casa',
      shop: 'Tienda',
      reserva: 'Reserva',
    },
    navLabel: 'Menú principal',
    book: 'Reservar',
    bookTable: 'Reservar mesa',
    openMenu: 'Abrir el menú',
    closeMenu: 'Cerrar el menú',
    langLabel: 'Idioma',
    external: '(se abre en una pestaña nueva)',
    days: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
    dayRange: (a, b) => `${a} a ${b}`,
    dayList: (items) => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`,
    lunch: 'Mediodía',
    dinner: 'Noche',
    closed: 'Cerrado',
    perPerson: 'por persona',
    from: 'desde',
    phone: 'Teléfono',
    email: 'Correo',
    address: 'Dirección',
    hours: 'Horario',
    directions: 'Cómo llegar',
    mapLoad: 'Ver el mapa',
    mapNote: 'El mapa se carga desde Google Maps solo si lo pedís.',
    mapTitle: 'Mapa de situación de Les Moles',
    photoPending: 'Foto pendiente',
    readMore: 'Más información',
  },

  awards: {
    michelin: 'Estrella Michelin',
    green: 'Estrella Verde Michelin',
    repsol: '2 Soles Repsol',
    repsolSostenible: 'Sol Sostenible Repsol',
    since: (y) => `desde ${y}`,
    label: 'Distinciones',
  },

  menus: {
    cami: {
      name: 'El camino recorrido',
      kind: 'Menú degustación',
      desc: 'Un recorrido por los platos que han marcado la historia de la casa, contados con la mirada de hoy.',
    },
    terra: {
      name: 'Terra Incógnita',
      kind: 'Menú degustación',
      desc: 'Un menú para descubrir: productos y recetas de las Terres de l’Ebre que poca gente conoce.',
    },
    tradicio: {
      name: 'Tradición',
      kind: 'Menú',
      desc: 'La cocina tarraconense de siempre, a nuestra manera. Más corto, para comer sin prisas.',
    },
    carta: {
      name: 'Carta',
      kind: 'A la carta',
      desc: 'Los platos de temporada, también en medias raciones para poder probar más.',
    },
  },

  photos: {
    pedrera: 'La pared de la antigua cantera, iluminada de noche',
    plat: 'Un plato de Jeroni Castell',
    sala: 'La sala del restaurante, con paredes de piedra',
    familia: 'Jeroni Castell, Carmen Sauch, Pau y Roger',
    hort: 'El huerto biodinámico, a la entrada del restaurante',
    vi: 'Las botellas de vino propio de Les Moles',
    oli: 'Olivos milenarios del Montsià',
    casament: 'Invitados de una boda en los jardines de Les Moles, de noche',
    cerimonia: 'La zona de ceremonia, con gradas de piedra frente a la cantera',
    jardins: 'Los jardines preparados para el aperitivo',
    salo: 'Un salón de banquetes montado para una boda',
    escenari: 'El escenario de los jardines durante una fiesta',
    empresa: 'Un evento de empresa en Les Moles',
    celebracio: 'Una mesa montada para una celebración familiar',
  },

  footer: {
    tagline: 'Restaurante y espacio de eventos en la antigua cantera de Ulldecona, Terres de l’Ebre.',
    visit: 'Visítanos',
    explore: 'Explora',
    follow: 'Síguenos',
    legal: 'Aviso legal',
    privacy: 'Privacidad',
    cookies: 'Cookies',
    rights: 'Todos los derechos reservados.',
  },

  pages: {
    home: {
      title: 'Les Moles · Restaurante con estrella Michelin en Ulldecona',
      description:
        'Cocina de Jeroni Castell en la antigua cantera de Ulldecona. Estrella Michelin, Estrella Verde y dos Soles Repsol. Menús degustación, vino propio y eventos.',
      hero: {
        eyebrow: 'Ulldecona · Terres de l’Ebre',
        title: 'Cocinamos la tierra donde se tallaban las muelas',
        lead: 'Restaurante familiar de Jeroni Castell y Carmen Sauch, en la antigua cantera de Ulldecona.',
        secondary: 'Bodas y eventos',
      },
      intro: {
        eyebrow: 'La casa',
        title: 'Una familia, una cantera y todo un territorio en el plato',
        body: [
          'Les Moles ocupa la primera cantera de Ulldecona, de donde antiguamente salían las muelas de molino —«moles», en catalán— que dan nombre a la casa. Hoy, entre paredes de piedra y jardines, cocinamos el paisaje de las Terres de l’Ebre: el mar y el Delta, la montaña de Els Ports y los olivos milenarios del Montsià.',
          'Estamos toda la familia. Jeroni Castell y su hijo Pau en la cocina, Carmen Sauch en la sala y la bodega, y Roger, codo con codo con todos ellos.',
        ],
        link: 'Nuestra historia',
      },
      philosophy: {
        eyebrow: 'Cómo cocinamos',
        statement: 'Proximidad y técnica, sí. Pero si no nos lo pasamos bien, no tiene ningún sentido.',
        items: [
          { title: 'Proximidad', text: 'Verduras de nuestro huerto y producto de las Terres de l’Ebre, del Delta a Els Ports.' },
          { title: 'Técnica', text: 'Una cocina contemporánea que respeta la tradición tarraconense y la hace avanzar.' },
          { title: 'Diversión', text: 'Queremos que en la mesa lo paséis tan bien como nosotros en la cocina.' },
        ],
      },
      doors: {
        restaurant: {
          eyebrow: 'El restaurante',
          title: 'Menús, carta y vinos de casa',
          text: 'Dos menús degustación, el menú Tradición y carta, con la armonía de los vinos que elaboramos nosotros mismos.',
          link: 'Ver los menús',
        },
        events: {
          eyebrow: 'Les Moles Events',
          title: 'Bodas, empresas y celebraciones',
          text: 'Más de 6.000 m² de jardines al pie de la cantera, dos salones de banquetes y la cocina de Jeroni Castell.',
          link: 'Descubrir los espacios',
        },
      },
      menus: {
        eyebrow: 'Menús',
        title: 'Cuatro maneras de sentarse a la mesa',
        link: 'Menús, precios y horarios',
      },
      origin: {
        hort: {
          eyebrow: 'Huerto biodinámico',
          title: 'El huerto, a la entrada de casa',
          text: 'Es nuestra despensa, nuestro banco de pruebas y nuestra fuente de inspiración. Desde 2021 lo cultivamos en biodinámica.',
        },
        vi: {
          eyebrow: 'Vino propio',
          title: 'Nuestros vinos, desde 2012',
          text: 'Elaboramos en la Terra Alta un blanco y un tinto jóvenes y un crianza que llevan el nombre de la casa.',
        },
        link: 'Conoce el huerto y la bodega',
      },
      events: {
        eyebrow: 'Les Moles Events',
        title: 'Celebraciones con cocina de estrella',
        text: 'Una cantera iluminada de noche, jardines, dos salones y un escenario para bodas, empresas y celebraciones.',
        cta: 'Pedir información',
        more: 'Ver los espacios',
      },
      gift: {
        eyebrow: 'Regalos',
        title: 'Regala una experiencia en Les Moles',
        text: 'Menús degustación para dos personas, con o sin armonía de vinos, y plazas para las fechas especiales de la mesa del chef.',
        cta: 'Ir a la tienda',
      },
      visit: {
        eyebrow: 'Visítanos',
        title: 'Dónde estamos',
        text: 'En el km 2 de la carretera de La Sénia, en Ulldecona (Montsià). Entre el Delta del Ebro y Els Ports, a un paso de Castellón.',
      },
    },

    restaurant: {
      title: 'El restaurante · Menús, carta y vinos · Les Moles',
      description:
        'Menús degustación, menú Tradición y carta de Jeroni Castell en Ulldecona. Horas de entrada, precios y armonía con los vinos propios de Les Moles.',
      hero: {
        eyebrow: 'El restaurante',
        title: 'La cocina de Jeroni Castell',
        lead: 'Producto de proximidad, técnica y ganas de disfrutar, con el paisaje de las Terres de l’Ebre como punto de partida.',
      },
      cuina: {
        eyebrow: 'La cocina',
        title: 'El paisaje del Ebro, en el plato',
        body: [
          'Cocinamos lo que nos da el entorno: el pescado y el marisco de la costa y del Delta, el arroz, las verduras de nuestro huerto, la montaña de Els Ports y, por encima de todo, el aceite de oliva de los olivos milenarios del Montsià.',
          'Jeroni Castell y su hijo Pau hacen una cocina que respeta la tradición tarraconense y la mira con ojos de hoy. La técnica está para hacer brillar el producto, nunca para esconderlo.',
        ],
      },
      menus: {
        eyebrow: 'Menús y carta',
        title: 'Elige cómo quieres vivirlo',
        lead: 'Los menús degustación se sirven a toda la mesa y se pueden acompañar con armonía de vinos. Si tenéis alguna alergia o intolerancia, decídnoslo al reservar y adaptaremos el menú.',
        entry: 'Horas de entrada',
        continuous: (a, b) => `de ${a} a ${b}`,
        priceNote: 'Precios por persona, IVA incluido.',
      },
      chef: {
        eyebrow: 'Mesa del chef',
        title: 'Fechas señaladas',
        text: 'Algunas fechas especiales cocinamos un menú único para pocas plazas. Las fechas y las entradas se publican en la tienda.',
        cta: 'Ver las fechas',
      },
      celler: {
        eyebrow: 'La bodega',
        title: 'Vinos de casa y del territorio',
        body: [
          'Carmen Sauch dirige la sala y la bodega. Desde 2012 elaboramos nuestros propios vinos en la Terra Alta: un blanco y un tinto jóvenes y Les Moles Crianza.',
          'La carta de vinos recorre las bodegas de las Terres de l’Ebre y va más allá, pensada para acompañar cada menú.',
        ],
      },
      hort: {
        eyebrow: 'El huerto',
        title: 'Cultivamos lo que cocinamos',
        body: [
          'A la entrada del restaurante están el huerto y el jardín botánico. De allí salen verduras, hierbas y flores para la cocina, y también muchas ideas: es nuestro banco de pruebas.',
          'En 2021 dimos el paso de la agricultura ecológica a la biodinámica.',
        ],
      },
      cta: {
        title: '¿Os guardamos mesa?',
        text: 'Reservad por teléfono o por correo. Os confirmaremos la mesa enseguida.',
      },
    },

    events: {
      title: 'Bodas y eventos en Ulldecona · Les Moles Events',
      description:
        'Bodas, empresas y celebraciones con cocina de estrella Michelin. 6.000 m² de jardines, ceremonia frente a la cantera y banquetes de hasta 350 invitados.',
      hero: {
        eyebrow: 'Les Moles Events',
        title: 'Bodas y eventos',
        lead: 'Paisaje, profesionalidad y alta cocina para crear momentos irrepetibles.',
        cta: 'Pedir información',
      },
      intro: {
        title: 'Una cantera, unos jardines y la cocina de Jeroni Castell',
        text: 'Celebrar en Les Moles es hacerlo en un paisaje único, con un equipo que lleva años organizando grandes eventos y con la cocina de un restaurante con estrella Michelin. Nosotros nos ocupamos de todo para que vosotros solo tengáis que disfrutar.',
      },
      types: [
        {
          id: 'casaments',
          photo: 'cerimonia',
          title: 'Bodas',
          text: 'Ceremonia al aire libre frente a la cantera, aperitivo en los jardines y banquete con cocina de estrella. Y la fiesta, en el escenario, hasta que el cuerpo aguante.',
        },
        {
          id: 'empreses',
          photo: 'empresa',
          title: 'Empresas',
          text: 'Comidas de trabajo, presentaciones, jornadas y celebraciones de equipo, con el rigor que necesitáis y espacios que se adaptan a cada formato.',
        },
        {
          id: 'celebracions',
          photo: 'celebracio',
          title: 'Celebraciones',
          text: 'Cumpleaños, comuniones, reencuentros familiares o entre amigos. Cualquier excusa es buena para celebrarlo en Les Moles.',
        },
      ],
      spaces: {
        eyebrow: 'Los espacios',
        title: 'Interiores y exteriores para cada momento del día',
        items: [
          { photo: 'pedrera', title: 'La cantera', text: 'La pared de piedra de la antigua cantera, iluminada de noche, es el telón de fondo de todo el evento.' },
          { photo: 'cerimonia', title: 'Zona de ceremonia', text: 'Gradas de piedra de Ulldecona frente a la cantera, para unas 200 personas.' },
          { photo: 'jardins', title: 'Jardines', text: 'Más de 6.000 m² repartidos en cinco zonas ajardinadas y conectadas entre sí, para el aperitivo, el cóctel o la fiesta.' },
          { photo: 'salo', title: 'Salones de banquetes', text: 'Dos salones, con capacidad para hasta 350 invitados sentados.' },
          { photo: 'escenari', title: 'Escenario', text: '60 m² en el corazón de los jardines, con 4.000 W de potencia, para música en directo y espectáculos.' },
        ],
      },
      stats: {
        gardens: 'm² de jardines',
        banquet: 'invitados en el banquete',
        ceremony: 'personas en la ceremonia',
        halls: 'salones de banquetes',
        stage: 'm² de escenario',
      },
      steps: {
        eyebrow: 'Cómo trabajamos',
        title: 'Del primer correo al gran día',
        items: [
          { title: 'Contadnos la idea', text: 'Rellenad el formulario o llamadnos. Os respondemos en pocos días.' },
          { title: 'Visitad Les Moles', text: 'Os enseñamos los espacios y lo hablamos con calma, sin prisas.' },
          { title: 'Propuesta a medida', text: 'Menú, espacios y horarios pensados para vuestro evento.' },
          { title: 'El gran día', text: 'El equipo se encarga de todo. Vosotros, solo a disfrutar.' },
        ],
      },
      form: {
        eyebrow: 'Pedid información',
        title: 'Hablemos de vuestro evento',
        lead: 'Dejadnos vuestros datos y os enviaremos disponibilidad y una propuesta.',
        name: 'Nombre y apellidos',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        type: 'Tipo de evento',
        typeOptions: ['Boda', 'Evento de empresa', 'Celebración', 'Otra cosa'],
        date: 'Fecha aproximada',
        guests: 'Número de invitados',
        message: 'Contadnos qué tenéis en mente',
        consent: 'He leído la <a href="{privacy}">política de privacidad</a> y acepto que Les Moles use estos datos para responderme.',
        submit: 'Enviar la petición',
        sending: 'Enviando…',
        sent: '¡Gracias! Hemos recibido vuestra petición y os responderemos pronto.',
        mailSubject: 'Petición de información para un evento',
        mailOpened: 'Se ha abierto vuestro correo con la petición escrita. Solo falta enviarlo.',
        error: 'No se ha podido enviar. Escribidnos a {email} o llamad al {phone}.',
        required: 'obligatorio',
      },
    },

    casa: {
      title: 'La casa · Historia, familia y territorio · Les Moles',
      description:
        'Les Moles está en la primera cantera de Ulldecona. La historia de la familia Castell Sauch, el huerto biodinámico, el vino propio y las distinciones.',
      hero: {
        eyebrow: 'La casa',
        title: 'Una cantera, una familia, un territorio',
        lead: 'La historia de Les Moles es la de un lugar, la de una familia y la de las Terres de l’Ebre.',
      },
      pedrera: {
        eyebrow: 'La cantera',
        title: 'Donde nacían las muelas',
        body: [
          'Les Moles se levanta en la primera cantera de Ulldecona. De aquí se extraía la piedra para hacer las muelas, las grandes ruedas de los molinos. Las paredes de piedra que aún nos rodean son su testimonio, y hoy hacen de telón de fondo de la sala y de los jardines.',
        ],
      },
      familia: {
        eyebrow: 'La familia',
        title: 'Jeroni, Carmen, Pau y Roger',
        body: [
          'Jeroni Castell y Carmen Sauch fundaron Les Moles. Él está en la cocina; ella dirige la sala y la bodega. Hoy sus hijos, Pau y Roger, trabajan codo con codo con ellos.',
          'Queremos crecer sin dejar de ser quienes somos: una casa familiar arraigada a su territorio.',
        ],
      },
      hort: {
        eyebrow: 'El huerto biodinámico',
        title: 'La cocina empieza en la entrada',
        body: [
          'El huerto y el jardín botánico nos dan verduras, hierbas y flores, y nos sirven de laboratorio. Tras años de agricultura ecológica, en 2021 pasamos a la biodinámica.',
        ],
      },
      vi: {
        eyebrow: 'El vino',
        title: 'Vino propio desde 2012',
        body: [
          'Desde 2012 elaboramos nuestros vinos en la Terra Alta: Les Moles blanco y tinto jóvenes y Les Moles Crianza. Están en la carta y en los menús con armonía.',
        ],
      },
      territori: {
        eyebrow: 'El territorio',
        title: 'Entre el Delta y Els Ports',
        body: [
          'Ulldecona está en el Montsià, a un paso de Castellón. A poca distancia están el mar y el Delta del Ebro, la montaña de Els Ports y uno de los mayores conjuntos de olivos milenarios del mundo. Todo eso llega al plato.',
        ],
      },
      awards: {
        eyebrow: 'Reconocimientos',
        title: 'Distinciones',
        text: {
          michelin: 'La Guía Michelin distingue la cocina de Les Moles con una estrella.',
          green: 'Por nuestra manera de trabajar, ligada al huerto, al producto local y al territorio.',
          repsol: 'La Guía Repsol nos otorga dos Soles.',
          repsolSostenible: 'El reconocimiento de la Guía Repsol a la sostenibilidad.',
        },
      },
    },

    reserva: {
      title: 'Reserva · Les Moles, Ulldecona',
      description:
        'Reserva mesa en Les Moles, en Ulldecona. Horarios, horas de entrada de cada menú, teléfono, dirección y cómo llegar.',
      hero: {
        eyebrow: 'Reserva',
        title: 'Os esperamos a la mesa',
        lead: 'Reservad por teléfono o por correo. Si tenéis alguna alergia o intolerancia, decídnoslo al reservar.',
      },
      booking: {
        title: 'Haced la reserva',
        text: 'Llamadnos o escribidnos con el día, la hora, el número de personas y el menú que os apetece.',
        call: 'Llamar al',
        write: 'Escribir un correo',
        mailSubject: 'Reserva de mesa',
      },
      hoursTitle: 'Horario',
      entryTitle: 'Horas de entrada por menú',
      location: {
        title: 'Cómo llegar',
        text: 'En el km 2 de la carretera de La Sénia, en Ulldecona (Montsià), entre el Delta del Ebro y Els Ports.',
      },
      more: {
        events: { title: 'Grupos y eventos', text: 'Para bodas, empresas y celebraciones, usad el formulario de Eventos.', link: 'Ir a Eventos' },
        gift: { title: 'Regalos', text: 'Menús degustación para regalar y fechas de la mesa del chef.', link: 'Ir a la tienda' },
      },
    },

    legal: {
      title: 'Aviso legal, privacidad y cookies · Les Moles',
      description: 'Aviso legal, política de privacidad y política de cookies de la web de Les Moles.',
      hero: { eyebrow: 'Información legal', title: 'Aviso legal, privacidad y cookies' },
      pending: 'Pendiente: los datos del titular y la política de privacidad los debe completar el asesor legal de Les Moles antes de publicar la web.',
      sections: [
        {
          id: 'aviso-legal',
          title: 'Aviso legal',
          body: [
            'Titular de la web: [razón social] · NIF [·] · Ctra. de La Sénia, km 2, 43550 Ulldecona (Tarragona) · lesmoles@lesmoles.com · 977 57 32 24.',
          ],
        },
        {
          id: 'privacidad',
          title: 'Privacidad',
          body: [
            'Los datos que nos enviáis por el formulario de eventos o por correo solo se usan para responder a vuestra petición y no se ceden a terceros. Podéis ejercer vuestros derechos de acceso, rectificación y supresión escribiendo a lesmoles@lesmoles.com.',
          ],
        },
        {
          id: 'cookies',
          title: 'Cookies',
          body: [
            'Esta web no usa cookies propias ni de analítica. El mapa de Google Maps solo se carga si lo pedís; en ese caso, Google puede instalar sus propias cookies.',
          ],
        },
      ],
    },

    notFound: {
      title: 'Página no encontrada · Les Moles',
      description: 'Esta página no existe.',
      heading: 'Esta página no existe',
      text: 'Quizá el enlace es antiguo: hemos estrenado web. Empezad por el inicio o reservad directamente.',
      home: 'Volver al inicio',
    },
  },
};
