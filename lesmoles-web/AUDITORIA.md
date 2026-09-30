# lesmoles.com: auditoría y propuesta de web nueva

*Septiembre de 2026*

## Cómo se ha hecho este análisis y hasta dónde llega

El entorno donde se ha trabajado **no tenía permiso para abrir lesmoles.com**:
su política de red bloquea el dominio, y también Guía Michelin, bodas.net y
restaurantscat.cat. Por eso no se ha podido ver la web en pantalla ni medir su
diseño, su velocidad o cómo se ve en el móvil.

El análisis sale de dos fuentes:

1. **Lo que Google tiene indexado de lesmoles.com**: las direcciones, los títulos
   de las páginas y los fragmentos de texto que muestra el buscador.
2. **Las fichas públicas del restaurante**: Guía Michelin, Guía Repsol, TheFork,
   Tripadvisor, bodas.net y artículos de prensa.

Eso basta para detectar los problemas de estructura, idiomas, SEO y coherencia
de datos que se explican abajo. Para la parte visual y de rendimiento (Lighthouse,
móvil, peso de las imágenes, motor de reservas actual) hay que **añadir
`lesmoles.com` a los dominios permitidos** del entorno, en *Network access* dentro
de la configuración del entorno cloud, y repetir la revisión.

---

## Resumen

- La web actual tiene **mucho contenido bueno mal presentado**: una historia
  única (la cantera de las muelas, la familia, el huerto biodinámico, el vino
  propio) y unos espacios de eventos excepcionales, pero con direcciones y títulos
  que mezclan idiomas, páginas duplicadas, productos caducados indexados y datos
  que no coinciden con los de otras webs.
- Las distinciones que mejor explican la casa, **la Estrella Verde Michelin y el Sol
  Sostenible Repsol**, no aparecen en el título ni en primer plano.
- La web nueva que acompaña este documento (`lesmoles-web/`) resuelve todo eso:
  tres idiomas bien separados, dos puertas claras (restaurante y Les Moles Events),
  SEO técnico completo, redirecciones desde las direcciones antiguas, accesibilidad,
  cumplimiento de RGPD y un único archivo con todos los datos.

---

## Lo que hay que corregir

### 1. Idiomas mezclados en direcciones y títulos · prioridad alta

Lo que Google muestra de la versión inglesa:

| Dirección | Título |
|---|---|
| `/en/events/casaments/` | WEDDINGS - Les Moles |
| `/en/events/celebracions/` | CELEBRATIONS - Les Moles |
| `/en/restaurant/lespai/` | THE PLACE - Les Moles |
| `/en/restaurant/el-celler/` | The wine cellar - Les Moles |
| `/en/tienda/` | **Tienda** - Les Moles |
| `/en/` | Les Moles - **Restaurant amb una Estrella Michelin i dos Soles Repsol** |

- Las direcciones en inglés llevan palabras en catalán (`casaments`, `celler`) y
  la tienda en inglés se llama «Tienda», en castellano.
- La portada inglesa tiene el título en catalán, y en él dice «Soles», que es
  castellano: en catalán son «Sols».
- Unos títulos van en MAYÚSCULAS y otros no.

**Por qué importa:** Google posiciona peor una página cuyo idioma no está claro, y
un cliente extranjero que ve «Tienda» o «casaments» percibe descuido.

**Qué hace la web nueva:** cada idioma tiene sus propias direcciones
(`/en/events/#weddings`, `/es/eventos/#bodas`) y sus propios títulos, y todas las
páginas llevan `hreflang`, de modo que Google sabe cuál enseñar a cada persona.

### 2. Páginas duplicadas y restos de la web antigua · prioridad alta

- `/es/restaurant-2/…` y `/restaurant/menus/menu-tradicio-2/`: el «-2» lo añade
  WordPress cuando ya existe otra página con el mismo nombre. Son duplicados.
- `/tenda/` y `/tienda/` conviven.
- **`www.lesmoles.com/wine.asp` sigue indexada**: es una página de la web anterior
  a WordPress. Significa que nunca se hicieron redirecciones 301 y que el dominio
  responde con y sin `www`.

**Qué hace la web nueva:** un único dominio (sin `www`) y un mapa de redirecciones
301 (`_redirects`, casi 40 reglas) que lleva cada dirección antigua a su sitio
nuevo, para no perder el posicionamiento acumulado.

### 3. Menús y productos caducados o con nombre cambiado · prioridad media

- Hay productos de fechas pasadas que siguen indexados, como «Taula del xef · 21 abril».
- El producto «Experiència + menú **Terra incognita**» vive en la dirección
  `…/menu-degustacio-11-465-dies-99c…`.
- El «Menú degustación **ÀNIMAMENT**» vive en `…/menus-degustacio-introspectiva/`.
- Entre la web, TheFork y la tienda aparecen al menos ocho nombres de menú
  distintos: El camí que hem fet / The Journey, Terra Incògnita, Tradició,
  11.465 dies + 99 °C, Ànimament, Introspectiva, «4» y el menú vegetariano.

**Por qué importa:** el cliente no sabe qué menús existen hoy, y Google tampoco.

**Qué hace la web nueva:** los menús vigentes están en un solo sitio
(`src/site.config.mjs`), con nombre, descripción, precio y horas de entrada. Cambiar
un menú es cambiar una línea, y el cambio sale a la vez en los tres idiomas, en la
página de reserva y en los datos que lee Google.

### 4. Datos que no coinciden entre webs · prioridad media

| Dato | Web actual | Otras fuentes |
|---|---|---|
| Horario de mediodía | martes a domingo | Tripadvisor: martes a jueves y domingo |
| Menús | The Journey, Terra Incognita, Tradició, carta | TheFork: Camino recorrido, Tradición, vegetariano |
| Precio del menú Tradició | — | TheFork: 49,90 € al mediodía y 56,90 € por la noche |

**Recomendación:** que la web nueva sea la fuente de verdad y actualizar después, con
los mismos datos, la ficha de Google (Google Business Profile), TheFork, Tripadvisor
y bodas.net. Es lo primero que consulta quien busca «Les Moles».

### 5. Las distinciones de sostenibilidad pasan desapercibidas · prioridad media

La Guía Michelin concede a Les Moles **una estrella y la Estrella Verde**; la Guía
Repsol, **dos Soles y el Sol Sostenible**. El título de la web actual solo nombra
la estrella y los Soles. Sin embargo, la Estrella Verde es lo que mejor explica la
casa: el huerto biodinámico desde 2021, el vino propio desde 2012 y el producto
de las Terres de l'Ebre.

**Qué hace la web nueva:** las cuatro distinciones aparecen en la portada, en el
pie de todas las páginas y en los datos estructurados (`award`). El huerto y el vino
tienen bloque propio.

### 6. Dos marcas sin una arquitectura clara · prioridad media

El restaurante y **Les Moles Events** tienen públicos y cuentas de Instagram
distintos (@lesmoles_restaurant y @lesmoles_events), pero la web no los separa con
claridad.

**Qué hace la web nueva:** la portada tiene dos puertas grandes, «El restaurant» y
«Les Moles Events». La página de eventos funciona sola: tipos de evento, espacios
con sus cifras (6.000 m², 350 invitados, 200 en la ceremonia, escenario de 60 m² y
4.000 W), el proceso de trabajo y un formulario de solicitud.

### 7. Reservar debería ser inmediato · prioridad alta

Lo indexado muestra una página de reserva con las horas de entrada de cada menú.
No se ha podido comprobar si tiene un motor de reservas en línea. **Si hoy la
reserva es solo por teléfono o por correo, es el punto donde más clientes se
pierden**, sobre todo los de fuera y los que buscan de noche.

**Qué hace la web nueva:** el botón «Reservar» está siempre visible en la
cabecera, también en el móvil. La página de reserva está preparada para incrustar
el motor que se elija (CoverManager, TheFork Manager…) pegando su código en
`bookingEmbed`. Mientras no haya motor, ofrece llamar o escribir con un toque.

---

## La web nueva

### Páginas (en catalán, castellano e inglés)

| Página | Catalán | Castellano | Inglés |
|---|---|---|---|
| Inicio | `/` | `/es/` | `/en/` |
| Restaurante: cocina, menús, mesa del chef, bodega, huerto | `/restaurant/` | `/es/restaurante/` | `/en/restaurant/` |
| Eventos: bodas, empresas, celebraciones, espacios, formulario | `/events/` | `/es/eventos/` | `/en/events/` |
| La casa: cantera, familia, huerto, vino, territorio, distinciones | `/la-casa/` | `/es/la-casa/` | `/en/our-story/` |
| Reserva: reserva, horarios por menú, cómo llegar | `/reserva/` | `/es/reserva/` | `/en/book/` |
| Aviso legal, privacidad y cookies | `/avis-legal/` | `/es/aviso-legal/` | `/en/legal/` |

### Qué la hace más profesional

- **Diseño**: paleta de piedra y tierra con un dorado discreto, titulares en serif
  (Cormorant Garamond) y texto en sans (Karla, la misma familia que ya usa la
  herramienta interna de Les Moles Events). Fotografía a sangre, mucho aire y un
  único color de acción.
- **Móvil primero**: menú a pantalla completa, botones grandes y ningún
  desbordamiento lateral en ninguna página (lo comprueban las pruebas automáticas a
  360 px de ancho).
- **SEO técnico**: título y descripción propios en cada página e idioma,
  `canonical`, `hreflang` recíprocos, `sitemap.xml` con alternativas de idioma,
  datos estructurados de `Restaurant` (dirección, horario, distinciones, reservas)
  y de `EventVenue` (aforo), migas de pan e imagen para compartir en redes (1200×630).
- **Velocidad**: sin WordPress ni frameworks. La portada pesa 6,5 KB de HTML, el
  CSS 8,4 KB y el JavaScript 2 KB (comprimidos), más 109 KB de tipografías. Las
  fotos se cargan a medida que se baja por la página.
- **Accesibilidad**: contraste AA en todos los textos, navegación completa con
  teclado, enlace «Salta al contingut», textos alternativos en las fotos y respeto
  a quien tiene desactivadas las animaciones.
- **RGPD**: tipografías alojadas en la propia web (sin llamadas a Google Fonts),
  ninguna cookie, y el mapa de Google solo se carga si el visitante lo pide.
- **Mantenimiento**: todos los datos (teléfono, horarios, menús, precios,
  distinciones, cifras de eventos) están en `src/site.config.mjs`, y los textos, en
  `src/i18n/`. Las pruebas avisan si falta un texto en un idioma, si hay un enlace
  roto o si una redirección lleva a una página inexistente.

---

## Datos a confirmar antes de publicar

Todo lo que sigue sale de fuentes públicas y puede estar desactualizado. Está
marcado con `VERIFICAR` en `src/site.config.mjs`.

- [ ] **Horario**: mediodía de martes a domingo (13:00–15:30), noche viernes y
      sábado (20:30–22:30), lunes cerrado.
- [ ] **Menús vigentes**: nombres, horas de entrada y **precios**. Solo está puesto
      el de Tradició (49,90 € / 56,90 €, según TheFork). Los de los menús degustación
      están vacíos a propósito, y no se muestran hasta que se rellenen.
- [ ] **Descripciones de los menús**: están redactadas para esta propuesta y
      conviene que las revise la cocina.
- [ ] **Distinciones**: que la Estrella Verde y el Sol Sostenible siguen vigentes, y
      los años (Michelin desde la guía 2014; Repsol, dos Soles desde 2020).
- [ ] **La familia**: el papel de Roger (ahora el texto dice que trabaja «codo con
      codo» con todos).
- [ ] **Vino y huerto**: vino propio desde 2012 en la Terra Alta; huerto biodinámico
      desde 2021.
- [ ] **Eventos**: aforos y cifras (350 / 200 / 6.000 m² / 60 m² / 4.000 W).
- [ ] **Mesa del chef**: qué es exactamente y cómo se vende.
- [ ] **Aviso legal**: razón social, NIF y la política de privacidad del asesor.

## Fotos que faltan

La web tiene 14 huecos de foto con una descripción de lo que va en cada uno. En
el borrador se ven como un fondo de piedra con la etiqueta «Foto pendent». Solo
está puesta una foto real de una boda que ya había en el proyecto.

| Archivo | Qué foto |
|---|---|
| `pedrera.jpg` | La pared de la cantera iluminada de noche (portada, a pantalla completa) |
| `plat.jpg` | Un plato emblemático |
| `sala.jpg` | La sala con las paredes de piedra |
| `familia.jpg` | Jeroni, Carmen, Pau y Roger |
| `hort.jpg` | El huerto biodinámico |
| `vi.jpg` | Las botellas del vino propio |
| `oli.jpg` | Olivos milenarios del Montsià |
| `casament.jpg` | ✅ provisional: es la foto de la pantalla de acceso de la herramienta de eventos, reducida y desenfocada. Mejor sustituirla por el original a buena resolución |
| `cerimonia.jpg` | Las gradas de piedra frente a la cantera |
| `jardins.jpg` | Los jardines montados para el aperitivo |
| `salo.jpg` | Un salón de banquetes montado |
| `escenari.jpg` | El escenario durante una fiesta |
| `empresa.jpg` | Un evento de empresa |
| `celebracio.jpg` | Una mesa de celebración familiar |

Formato recomendado: JPG o WebP de **2400 px** de ancho para la portada y 1600 px
para el resto, **menos de 400 KB** cada una. Basta con dejarlas en
`src/assets/img/` con ese nombre y volver a construir la web.

## Para publicarla

1. Poner las fotos y confirmar los datos de la lista anterior.
2. Elegir el motor de reservas y pegar su código en `bookingEmbed`.
3. Dar un destino al formulario de eventos (`eventsFormEndpoint`: Formspree o
   similar). Mientras esté vacío, el formulario abre el correo del visitante con
   la petición ya escrita.
4. **Mover la tienda** (WooCommerce) a un subdominio, por ejemplo
   `botiga.lesmoles.com`, y cambiar `links.shop`. Si no, al publicar la web nueva
   en `lesmoles.com` la tienda dejaría de existir. Al cambiarlo, la construcción
   añade sola las redirecciones de los productos antiguos.
5. Poner `draft: false` en `site.config.mjs`. Así se quitan las etiquetas de fotos
   pendientes, se permite la indexación y el `robots.txt` pasa a publicar el
   sitemap.
6. Publicar en Netlify o Cloudflare Pages (ver `README.md`) y apuntar el dominio.
7. En Google Search Console, enviar `https://lesmoles.com/sitemap.xml` y vigilar
   durante unas semanas los errores 404 de direcciones antiguas.

## Fuera de la web, pero igual de importante

- **Ficha de Google (Google Business Profile)**: el mismo horario, fotos actuales,
  enlace directo a la reserva y respuesta a las reseñas. Pesa más que la propia web
  en «restaurante Ulldecona» o «estrella Michelin Terres de l'Ebre».
- **TheFork, Tripadvisor y bodas.net**: los mismos menús, precios y horarios que la web.
- **Sesión de fotos profesional** que cubra los 14 huecos. Es la mejora que más
  cambia la percepción de calidad.

## Fuentes consultadas

- Búsquedas en Google sobre `lesmoles.com`: títulos y direcciones indexadas de
  [la portada](https://lesmoles.com/en/), [Events](https://lesmoles.com/en/events/),
  [Weddings](https://lesmoles.com/en/events/casaments/), [Celebrations](https://lesmoles.com/en/events/celebracions/),
  [Espacios](https://lesmoles.com/es/events/espais/), [The wine cellar](https://lesmoles.com/en/restaurant/el-celler/),
  [The place](https://lesmoles.com/en/restaurant/lespai/), [Reserve](https://lesmoles.com/en/restaurant/reserva/),
  [Tienda](https://lesmoles.com/en/tienda/), [Tenda](https://lesmoles.com/tenda/),
  [Menú ÀNIMAMENT](https://lesmoles.com/es/restaurant-2/menus/menus-degustacio-introspectiva/),
  [Menú TRADICIÓ](https://lesmoles.com/restaurant/menus/menu-tradicio-2/) y
  [wine.asp](https://www.lesmoles.com/wine.asp)
- [Guía Michelin: Les Moles](https://guide.michelin.com/en/catalunya/ulldecona/restaurant/les-moles)
- [Guía Repsol: Les Moles](https://www.guiarepsol.com/es/fichas/restaurante/les-moles-8487/)
- [TheFork: Les Moles de Jeroni Castell](https://www.thefork.es/restaurante/les-moles-de-jeroni-castell-r416855)
- [Tripadvisor: Restaurant Les Moles](https://www.tripadvisor.com/Restaurant_Review-g1236734-d2299795-Reviews-Restaurant_Les_Moles-Ulldecona_Terres_de_l_Ebre_Province_of_Tarragona_Catalonia.html)
- [bodas.net: Restaurant Les Moles](https://www.bodas.net/restaurantes/restaurant-les-moles--e4006)
- [Surt de casa: Restaurant Les Moles](https://surtdecasa.cat/ebre/llocs-interes/ulldecona/restaurant-les-moles)
- [Diari de Tarragona: entrevista a Jeroni Castell](https://www.diaridetarragona.com/cultura/guia-gastronomica/jeroni-castell-chef-de-les-moles-mi-producto-fetiche-es-el-aceite-de-oliva-PB20568979)
