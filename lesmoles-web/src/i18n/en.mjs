// English — served at "/en/".
export default {
  lang: 'en',
  ogLocale: 'en_GB',
  label: 'EN',
  name: 'English',

  routes: {
    home: '/en/',
    restaurant: '/en/restaurant/',
    events: '/en/events/',
    casa: '/en/our-story/',
    reserva: '/en/book/',
    legal: '/en/legal/',
  },
  anchors: {
    menus: 'menus',
    celler: 'cellar',
    hort: 'garden',
    casaments: 'weddings',
    empreses: 'corporate',
    celebracions: 'celebrations',
    espais: 'spaces',
    form: 'enquire',
    cookies: 'cookies',
    privacitat: 'privacy',
  },

  ui: {
    skip: 'Skip to content',
    home: 'Home',
    nav: {
      restaurant: 'Restaurant',
      events: 'Events',
      casa: 'Our story',
      shop: 'Shop',
      reserva: 'Book',
    },
    navLabel: 'Main menu',
    book: 'Book',
    bookTable: 'Book a table',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    langLabel: 'Language',
    external: '(opens in a new tab)',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    dayRange: (a, b) => `${a} to ${b}`,
    dayList: (items) => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`,
    lunch: 'Lunch',
    dinner: 'Dinner',
    closed: 'Closed',
    perPerson: 'per person',
    from: 'from',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    hours: 'Opening hours',
    directions: 'Directions',
    mapLoad: 'Show the map',
    mapNote: 'The map is only loaded from Google Maps if you ask for it.',
    mapTitle: 'Map showing Les Moles',
    photoPending: 'Photo to come',
    readMore: 'Find out more',
  },

  awards: {
    michelin: 'Michelin Star',
    green: 'Michelin Green Star',
    repsol: '2 Repsol Suns',
    repsolSostenible: 'Repsol Sustainable Sun',
    since: (y) => `since ${y}`,
    label: 'Awards',
  },

  menus: {
    cami: {
      name: 'The Journey',
      kind: 'Tasting menu',
      desc: 'A walk through the dishes that have shaped the story of the house, retold with today’s eyes.',
    },
    terra: {
      name: 'Terra Incognita',
      kind: 'Tasting menu',
      desc: 'A menu of discovery: little-known produce and recipes from the Terres de l’Ebre.',
    },
    tradicio: {
      name: 'Tradition',
      kind: 'Set menu',
      desc: 'Classic cooking from the Tarragona region, done our way. Shorter, for an unhurried meal.',
    },
    carta: {
      name: 'À la carte',
      kind: 'À la carte',
      desc: 'Seasonal dishes, also available as half portions so you can try more.',
    },
  },

  photos: {
    pedrera: 'The old quarry wall, lit up at night',
    plat: 'A dish by Jeroni Castell',
    sala: 'The stone-walled dining room',
    familia: 'Jeroni Castell, Carmen Sauch, Pau and Roger',
    hort: 'The biodynamic kitchen garden at the entrance',
    vi: 'Bottles of Les Moles’ own wine',
    oli: 'Ancient olive trees of the Montsià',
    casament: 'Wedding guests in the gardens of Les Moles at night',
    cerimonia: 'The ceremony area, with stone seating facing the quarry',
    jardins: 'The gardens set up for the drinks reception',
    salo: 'A banquet hall laid for a wedding',
    escenari: 'The garden stage during a party',
    empresa: 'A corporate event at Les Moles',
    celebracio: 'A table laid for a family celebration',
  },

  footer: {
    tagline: 'Restaurant and event venue in the old quarry of Ulldecona, Terres de l’Ebre, Catalonia.',
    visit: 'Visit us',
    explore: 'Explore',
    follow: 'Follow us',
    legal: 'Legal notice',
    privacy: 'Privacy',
    cookies: 'Cookies',
    rights: 'All rights reserved.',
  },

  pages: {
    home: {
      title: 'Les Moles · Michelin-starred restaurant in Ulldecona, Catalonia',
      description:
        'Jeroni Castell’s cooking in the old quarry of Ulldecona, Catalonia. Michelin Star, Michelin Green Star and two Repsol Suns. Tasting menus, own wine and events.',
      hero: {
        eyebrow: 'Ulldecona · Terres de l’Ebre',
        title: 'Cooking the land where millstones were once carved',
        lead: 'The family restaurant of Jeroni Castell and Carmen Sauch, in the old quarry of Ulldecona.',
        secondary: 'Weddings and events',
      },
      intro: {
        eyebrow: 'The house',
        title: 'A family, a quarry and a whole landscape on the plate',
        body: [
          'Les Moles stands in Ulldecona’s first quarry, where the millstones — “moles” in Catalan — that give the house its name were once cut. Today, among stone walls and gardens, we cook the landscape of the Terres de l’Ebre: the sea and the Ebro Delta, the mountains of Els Ports and the ancient olive trees of the Montsià.',
          'The whole family is here. Jeroni Castell and his son Pau in the kitchen, Carmen Sauch running the dining room and the cellar, and Roger working side by side with them all.',
        ],
        link: 'Our story',
      },
      philosophy: {
        eyebrow: 'How we cook',
        statement: 'Local produce and technique, yes. But if we aren’t having fun, there’s no point.',
        items: [
          { title: 'Local', text: 'Vegetables from our own garden and produce from the Terres de l’Ebre, from the Delta to the mountains.' },
          { title: 'Technique', text: 'Contemporary cooking that respects Tarragona’s traditions and moves them forward.' },
          { title: 'Fun', text: 'We want you to enjoy yourselves at the table as much as we do in the kitchen.' },
        ],
      },
      doors: {
        restaurant: {
          eyebrow: 'The restaurant',
          title: 'Menus, à la carte and our own wines',
          text: 'Two tasting menus, the Tradition menu and à la carte, paired with the wines we make ourselves.',
          link: 'See the menus',
        },
        events: {
          eyebrow: 'Les Moles Events',
          title: 'Weddings, corporate events and celebrations',
          text: 'Over 6,000 m² of gardens at the foot of the quarry, two banquet halls and Jeroni Castell’s cooking.',
          link: 'Discover the spaces',
        },
      },
      menus: {
        eyebrow: 'Menus',
        title: 'Four ways to sit at our table',
        link: 'Menus, prices and times',
      },
      origin: {
        hort: {
          eyebrow: 'Biodynamic garden',
          title: 'The garden at our front door',
          text: 'It is our larder, our test kitchen and our source of inspiration. Since 2021 we have farmed it biodynamically.',
        },
        vi: {
          eyebrow: 'Our own wine',
          title: 'Our wines, since 2012',
          text: 'In the Terra Alta we make a young white, a young red and an oak-aged crianza that carry the name of the house.',
        },
        link: 'Discover the garden and the cellar',
      },
      events: {
        eyebrow: 'Les Moles Events',
        title: 'Celebrations with Michelin-starred cooking',
        text: 'A quarry lit up at night, gardens, two banquet halls and a stage for weddings, corporate events and celebrations.',
        cta: 'Enquire',
        more: 'See the spaces',
      },
      gift: {
        eyebrow: 'Gifts',
        title: 'Give an experience at Les Moles',
        text: 'Tasting menus for two, with or without wine pairing, and seats at our special chef’s table dates.',
        cta: 'Visit the shop',
      },
      visit: {
        eyebrow: 'Visit us',
        title: 'Where to find us',
        text: 'At km 2 on the road to La Sénia, in Ulldecona (Montsià). Between the Ebro Delta and the mountains of Els Ports, on the border with Valencia’s Castellón province.',
      },
    },

    restaurant: {
      title: 'The restaurant · Menus, à la carte and wine · Les Moles',
      description:
        'Tasting menus, the Tradition menu and à la carte by Jeroni Castell in Ulldecona, Catalonia. Seating times, prices and pairings with Les Moles’ own wines.',
      hero: {
        eyebrow: 'The restaurant',
        title: 'Jeroni Castell’s cooking',
        lead: 'Local produce, technique and a real sense of enjoyment, with the landscape of the Terres de l’Ebre as the starting point.',
      },
      cuina: {
        eyebrow: 'The kitchen',
        title: 'The Ebro landscape, on the plate',
        body: [
          'We cook what our surroundings give us: fish and seafood from the coast and the Delta, rice, vegetables from our own garden, the mountains of Els Ports and, above all, olive oil from the ancient olive trees of the Montsià.',
          'Jeroni Castell and his son Pau cook with deep respect for Tarragona’s traditions, seen through today’s eyes. Technique is there to make the produce shine, never to hide it.',
        ],
      },
      menus: {
        eyebrow: 'Menus and à la carte',
        title: 'Choose how you want to experience it',
        lead: 'Tasting menus are served to the whole table and can be paired with wine. If you have any allergy or intolerance, let us know when you book and we will adapt the menu.',
        entry: 'Seating times',
        continuous: (a, b) => `${a} to ${b}`,
        priceNote: 'Prices per person, VAT included.',
      },
      chef: {
        eyebrow: 'Chef’s table',
        title: 'Special dates',
        text: 'On a few special dates we cook a one-off menu for a handful of guests. Dates and tickets are released in our online shop.',
        cta: 'See the dates',
      },
      celler: {
        eyebrow: 'The cellar',
        title: 'Our own wines and those of our region',
        body: [
          'Carmen Sauch runs the dining room and the cellar. Since 2012 we have made our own wines in the Terra Alta: a young white, a young red and Les Moles Crianza.',
          'The wine list travels through the wineries of the Terres de l’Ebre and beyond, chosen to match every menu.',
        ],
      },
      hort: {
        eyebrow: 'The garden',
        title: 'We grow what we cook',
        body: [
          'At the entrance to the restaurant are our kitchen garden and botanical garden. They supply vegetables, herbs and flowers for the kitchen — and plenty of ideas too: this is where we experiment.',
          'In 2021 we moved from organic to biodynamic farming.',
        ],
      },
      cta: {
        title: 'Shall we save you a table?',
        text: 'Book by phone or email and we will confirm your table straight away.',
      },
    },

    events: {
      title: 'Weddings and events in Catalonia · Les Moles Events',
      description:
        'Weddings, corporate events and celebrations with Michelin-starred cooking. 6,000 m² of gardens, a ceremony facing the quarry and banquets for up to 350 guests.',
      hero: {
        eyebrow: 'Les Moles Events',
        title: 'Weddings and events',
        lead: 'Landscape, professionalism and fine dining, coming together to create unforgettable moments.',
        cta: 'Enquire',
      },
      intro: {
        title: 'A quarry, gardens and Jeroni Castell’s cooking',
        text: 'Celebrating at Les Moles means a unique setting, a team with years of experience running large events, and the kitchen of a Michelin-starred restaurant. We take care of everything so you only have to enjoy the day.',
      },
      types: [
        {
          id: 'casaments',
          photo: 'cerimonia',
          title: 'Weddings',
          text: 'An open-air ceremony facing the quarry, drinks in the gardens and a banquet with Michelin-starred cooking. Then the party moves to the stage — for as long as you can keep going.',
        },
        {
          id: 'empreses',
          photo: 'empresa',
          title: 'Corporate',
          text: 'Business lunches, launches, away days and team celebrations, run with the rigour you need in spaces that adapt to every format.',
        },
        {
          id: 'celebracions',
          photo: 'celebracio',
          title: 'Celebrations',
          text: 'Birthdays, first communions, family reunions or get-togethers with friends. Any excuse is a good one to celebrate at Les Moles.',
        },
      ],
      spaces: {
        eyebrow: 'The spaces',
        title: 'Indoors and outdoors, for every moment of the day',
        items: [
          { photo: 'pedrera', title: 'The quarry', text: 'The stone face of the old quarry, lit up at night, is the backdrop to the whole event.' },
          { photo: 'cerimonia', title: 'Ceremony area', text: 'Tiered seating in Ulldecona stone facing the quarry, for around 200 guests.' },
          { photo: 'jardins', title: 'Gardens', text: 'Over 6,000 m² across five connected landscaped areas, for drinks, cocktails or the party.' },
          { photo: 'salo', title: 'Banquet halls', text: 'Two halls, seating up to 350 guests.' },
          { photo: 'escenari', title: 'Stage', text: '60 m² at the heart of the gardens, with 4,000 W of power, for live music and performances.' },
        ],
      },
      stats: {
        gardens: 'm² of gardens',
        banquet: 'guests at the banquet',
        ceremony: 'guests at the ceremony',
        halls: 'banquet halls',
        stage: 'm² stage',
      },
      steps: {
        eyebrow: 'How we work',
        title: 'From first email to the big day',
        items: [
          { title: 'Tell us your idea', text: 'Fill in the form or give us a call. We reply within a few days.' },
          { title: 'Visit Les Moles', text: 'We show you the spaces and talk it through, with no rush.' },
          { title: 'A tailored proposal', text: 'Menu, spaces and timings designed around your event.' },
          { title: 'The big day', text: 'Our team takes care of everything. You just enjoy it.' },
        ],
      },
      form: {
        eyebrow: 'Enquire',
        title: 'Let’s talk about your event',
        lead: 'Leave us your details and we will send you availability and a proposal.',
        name: 'Full name',
        email: 'Email',
        phone: 'Phone',
        type: 'Type of event',
        typeOptions: ['Wedding', 'Corporate event', 'Celebration', 'Something else'],
        date: 'Approximate date',
        guests: 'Number of guests',
        message: 'Tell us what you have in mind',
        consent: 'I have read the <a href="{privacy}">privacy policy</a> and agree that Les Moles may use these details to reply to me.',
        submit: 'Send enquiry',
        sending: 'Sending…',
        sent: 'Thank you! We have received your enquiry and will be in touch soon.',
        mailSubject: 'Event enquiry',
        mailOpened: 'Your email app has opened with the enquiry written out. Just press send.',
        error: 'We could not send your enquiry. Please email {email} or call {phone}.',
        required: 'required',
      },
    },

    casa: {
      title: 'Our story · History, family and region · Les Moles',
      description:
        'Les Moles stands in Ulldecona’s first quarry. The story of the Castell Sauch family, our biodynamic garden, our own wine and the restaurant’s awards.',
      hero: {
        eyebrow: 'Our story',
        title: 'A quarry, a family, a region',
        lead: 'The story of Les Moles is the story of a place, of a family and of the Terres de l’Ebre.',
      },
      pedrera: {
        eyebrow: 'The quarry',
        title: 'Where millstones were born',
        body: [
          'Les Moles stands in Ulldecona’s first quarry. This is where the stone was cut to make “moles”, the great wheels of the old mills. The stone walls that still surround us bear witness to it, and today they form the backdrop to our dining room and gardens.',
        ],
      },
      familia: {
        eyebrow: 'The family',
        title: 'Jeroni, Carmen, Pau and Roger',
        body: [
          'Jeroni Castell and Carmen Sauch founded Les Moles. He is in the kitchen; she runs the dining room and the cellar. Today their sons, Pau and Roger, work side by side with them.',
          'We want to keep growing without ever losing who we are: a family house rooted in its land.',
        ],
      },
      hort: {
        eyebrow: 'The biodynamic garden',
        title: 'The kitchen begins at the front door',
        body: [
          'Our kitchen garden and botanical garden give us vegetables, herbs and flowers, and serve as our laboratory. After years of organic farming, in 2021 we went biodynamic.',
        ],
      },
      vi: {
        eyebrow: 'Wine',
        title: 'Our own wine since 2012',
        body: [
          'Since 2012 we have made our own wines in the Terra Alta: Les Moles young white and red, and Les Moles Crianza. You will find them on the wine list and in our pairings.',
        ],
      },
      territori: {
        eyebrow: 'The region',
        title: 'Between the Delta and the mountains',
        body: [
          'Ulldecona lies in the Montsià, on the border with Valencia’s Castellón province. Close by are the sea and the Ebro Delta, the mountains of Els Ports and one of the largest groves of ancient olive trees in the world. All of it finds its way onto the plate.',
        ],
      },
      awards: {
        eyebrow: 'Recognition',
        title: 'Awards',
        text: {
          michelin: 'The Michelin Guide awards Les Moles one star.',
          green: 'For the way we work: tied to our garden, to local produce and to the land.',
          repsol: 'The Repsol Guide awards us two Suns.',
          repsolSostenible: 'The Repsol Guide’s recognition of sustainability.',
        },
      },
    },

    reserva: {
      title: 'Book a table · Les Moles, Ulldecona',
      description:
        'Book a table at Les Moles in Ulldecona, Catalonia. Opening hours, seating times for each menu, phone, address and directions.',
      hero: {
        eyebrow: 'Book',
        title: 'We look forward to welcoming you',
        lead: 'Book by phone or email. If you have any allergy or intolerance, please let us know when you book.',
      },
      booking: {
        title: 'Make a booking',
        text: 'Call or email us with the day, time, number of guests and the menu you would like.',
        call: 'Call',
        write: 'Send an email',
        mailSubject: 'Table booking',
      },
      hoursTitle: 'Opening hours',
      entryTitle: 'Seating times by menu',
      location: {
        title: 'Getting here',
        text: 'At km 2 on the road to La Sénia, in Ulldecona (Montsià), between the Ebro Delta and the mountains of Els Ports.',
      },
      more: {
        events: { title: 'Groups and events', text: 'For weddings, corporate events and celebrations, please use the Events enquiry form.', link: 'Go to Events' },
        gift: { title: 'Gifts', text: 'Tasting menus to give as gifts, and chef’s table dates.', link: 'Visit the shop' },
      },
    },

    legal: {
      title: 'Legal notice, privacy and cookies · Les Moles',
      description: 'Legal notice, privacy policy and cookie policy for the Les Moles website.',
      hero: { eyebrow: 'Legal information', title: 'Legal notice, privacy and cookies' },
      pending: 'Pending: the owner’s company details and the privacy policy must be completed by Les Moles’ legal adviser before the site goes live.',
      sections: [
        {
          id: 'legal-notice',
          title: 'Legal notice',
          body: [
            'Website owner: [company name] · Tax ID [·] · Ctra. de la Sénia, km 2, 43550 Ulldecona (Tarragona), Spain · lesmoles@lesmoles.com · +34 977 57 32 24.',
          ],
        },
        {
          id: 'privacy',
          title: 'Privacy',
          body: [
            'Any details you send us through the events form or by email are used only to reply to your request and are never passed on to third parties. You can exercise your rights of access, rectification and erasure by writing to lesmoles@lesmoles.com.',
          ],
        },
        {
          id: 'cookies',
          title: 'Cookies',
          body: [
            'This website does not use its own or analytics cookies. The Google Maps map is only loaded if you ask for it; in that case, Google may set its own cookies.',
          ],
        },
      ],
    },

    notFound: {
      title: 'Page not found · Les Moles',
      description: 'This page does not exist.',
      heading: 'This page does not exist',
      text: 'The link may be old: we have a new website. Start from the home page or book directly.',
      home: 'Back to home',
    },
  },
};
