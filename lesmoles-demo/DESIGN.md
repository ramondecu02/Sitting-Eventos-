# LES MOLES — Territorio, familia, cocina y evolución

**Demo de la Home · documento de diseño**

Este documento fija el estándar visual y técnico que seguirá el resto de la web.
La Home de esta carpeta es su primera aplicación.

---

## 0. De dónde partimos

### Lo que se ha podido analizar

La política de red del entorno de trabajo **bloquea `lesmoles.com` y `awwwards.com`**.
El análisis de la web actual sale de su índice en Google (estructura de páginas, títulos y
fragmentos) y de las fichas públicas: Guía Michelin, Guía Repsol, TheFork, Tripadvisor,
bodas.net y prensa. El detalle está en `../lesmoles-web/AUDITORIA.md`. Las referencias de
Awwwards (Hotel/Restaurant, Food & Drink, Luxury, Storytelling…) se han trabajado a partir
del conocimiento de esos proyectos, **sin copiar ninguno**.

### La web actual, en una frase

Tiene todo el contenido (la cantera, la familia, el huerto, el vino, los menús, los
espacios), pero lo presenta como una **lista de páginas**: Restaurant, Menús, Celler,
L'espai, Events, Tenda y Contacte. Se consulta, pero no se vive.

| Tema | Hoy | Qué hace la demo |
|---|---|---|
| Estructura | Páginas sueltas, en WordPress | Un relato continuo en capítulos (I–VII) |
| Historia | Enterrada en «L'espai» | Es el hilo conductor: la *mola* |
| Equipo | Casi invisible | Jeroni, Pau, Carmen y Roger, con nombre y papel |
| Gastronomía | Lista de menús | «Los caminos»: cuatro formas de sentarse a la mesa |
| Bodega | Una página | Carmen, el vino propio y la Terra Alta |
| Espacios | Separados en Events | La experiencia completa: sala, jardines, cantera |
| Reserva | Una página con horarios | Siempre a mano, y un cierre narrativo |
| Distinciones | Solo en el título | Un capítulo propio, con las verdes delante |

---

## 1. Dirección artística

### Concepto: la *mola*

*Les Moles* son las muelas de molino que se tallaban en la cantera donde hoy está el
restaurante. **La muela es una piedra circular que gira y transforma el grano en
alimento.** Ese es el concepto: el tiempo, el territorio y la familia, molidos
lentamente hasta convertirse en cocina.

La idea da un sistema visual propio, en lugar de un repertorio de efectos:

- **El círculo** es el único elemento gráfico recurrente. Aparece en el preloader (una
  muela que se dibuja), en la entrada (la foto de la cantera se contrae en una muela que
  gira), en la apertura del menú, en la bodega (el texto que gira alrededor de la
  botella), en el cursor y en el cierre (la muela se abre y deja entrar al visitante).
- **Los estratos de la cantera** dan las líneas horizontales finas que separan, miden y
  guían la lectura.
- **El giro**: casi nada rota, pero lo que rota lo hace despacio, como una piedra.

### Estética

Editorial, contemporánea, mediterránea y sobria. Una revista gastronómica impresa en
papel grueso, maquetada como un libro de arquitectura y colgada como una exposición.

- **Composición asimétrica sobre 12 columnas.** Las fotos se salen de la retícula,
  se superponen y alternan proporciones (21:9, 3:4, 4:5, 1:1, 2:5).
- **El espacio vacío es material de diseño.** Cada capítulo respira.
- **Ritmo de color por capítulos**: noche → papel → carbón → papel → noche. El cambio de
  fondo marca el paso de capítulo sin necesidad de títulos grandes.

### Color

| Token | Valor | Uso |
|---|---|---|
| `--black` | `#000000` | Noche: entrada, menús, reserva y pie |
| `--char` | `#1A1A1A` | Capítulos oscuros: cocina y bodega |
| `--paper` | `#F1ECE3` | Blanco cálido: producto, familia y reconocimientos |
| `--stone` | `#CFC6B5` | Piedra: líneas, textos secundarios y fondos de foto |
| `--earth` | `#6E5440` | Tierra: detalles cálidos de la bodega |
| `--olive` | `#8A9A6B` | **Acento** sobre fondo oscuro |
| `--olive-2` | `#A2AD7C` | Acento claro: estados activos y cursor |
| `--olive-deep` | `#5B6743` | Acento sobre papel, en texto pequeño (contraste AA) |

El verde es un acento, nunca un fondo. Ocupa siempre menos del 5 % de la pantalla.

### Tipografía

- **Newsreader** (serif variable, eje óptico 6–72): titulares gigantes en peso 300 con
  tamaño óptico de display, e itálicas para las palabras que importan (*territorio*,
  *memoria*). Es cálida y editorial, y menos habitual que Instrument Serif o Playfair.
- **Archivo** (sans variable, eje de ancho 62–125): el texto en ancho normal, y las
  etiquetas, índices y pies de foto en **ancho expandido 125 %**, mayúsculas y
  espaciado amplio. Esa etiqueta ancha es la firma de «editorial de arquitectura».
- **Números** en Newsreader, con cifras de estilo antiguo para los años y cifras
  alineadas para los datos.
- **Texto vertical** para coordenadas y marcas de capítulo.

| Nivel | Tamaño | Uso |
|---|---|---|
| Mega | `clamp(5rem, 19vw, 21rem)` | «Les Moles» en la entrada y en el pie |
| H1 | `clamp(3.4rem, 9vw, 9.5rem)` | Títulos de capítulo |
| H2 | `clamp(2.4rem, 5vw, 5.4rem)` | Citas y titulares secundarios |
| Lead | `clamp(1.3rem, 2vw, 1.9rem)` | Entradillas en serif |
| Texto | 16–17 px | Cuerpo en Archivo |
| Etiqueta | 10,5–11 px | Archivo expandido, espaciado 0,28 em |

### Fotografía

Las fotos son las protagonistas. Todavía no hay fotos reales en alta resolución, así que
cada hueco es un **estudio tonal claramente identificado**: color del ambiente,
grano, marcas de encuadre y una ficha con qué foto va, su proporción y su tamaño
mínimo. **No se usa ninguna foto de archivo como si fuera de Les Moles.** La única foto
real disponible (una boda de noche) aparece en la experiencia.

La dirección fotográfica para la sesión: luz natural lateral, sombras profundas, piedra
y producto en primer plano, gente de espaldas o en movimiento, nunca bodegones de
catálogo. En cada capítulo hay al menos una foto vertical y una panorámica.

### Lista de fotos

Cada foto va en `src/photos/<hueco>.jpg`.

| Hueco | Qué foto | Proporción | |
|---|---|---|---|
| `territorio-olivo` | Tronco de un olivo milenario del Montsià | 4:5 |  |
| `producto-aceite` | Aceite de oliva de farga | 4:5 |  |
| `cocina-jeroni` | Jeroni Castell en la cocina | 4:5 |  |
| `familia` | La familia Castell Sauch | 4:5 |  |
| `menu-camino` | Un plato de El camino recorrido | 4:5 |  |
| `bodega-botella` | Botella de Les Moles Crianza | 4:5 |  |
| `experiencia-boda` | Invitados de una boda en los jardines de Les Moles, de noche | 4:5 | ✅ ya está |
| `hero-cantera` | La pared de la antigua cantera de Les Moles, iluminada de noche | Pantalla completa |  |
| `territorio-delta` | Arrozales del Delta del Ebro al amanecer | 21:9 |  |
| `territorio-ports` | Las crestas de Els Ports entre la niebla | 3:4 |  |
| `territorio-huerto` | El huerto biodinámico a la entrada del restaurante | 4:5 |  |
| `producto-aceite-detalle` | Aceite de oliva sobre piedra | Pantalla completa |  |
| `producto-plato` | Un plato de temporada visto desde arriba | 3:2 |  |
| `cocina-pau` | Retrato de Pau Castell emplatando | 4:5 |  |
| `menu-terra` | Un plato de Terra Incógnita | 4:5 |  |
| `menu-tradicion` | Un plato del menú Tradición | 4:5 |  |
| `menu-carta` | La sala preparada para el servicio a la carta | 4:5 |  |
| `bodega-carmen` | Carmen Sauch en la sala | 1:1 |  |
| `experiencia-sala` | La sala, con paredes de piedra | 4:5 |  |
| `experiencia-cantera` | La cantera iluminada de noche desde los jardines | 16:9 |  |
| `experiencia-ceremonia` | Las gradas de piedra de la ceremonia frente a la cantera | 3:4 |  |
| `experiencia-escenario` | El escenario de los jardines durante una fiesta | 1:1 |  |
| `reserva-cantera` | Los jardines de Les Moles al anochecer, con la cantera iluminada | Pantalla completa |  |

---

## 2. La Home: un relato en capítulos

| # | Escena | Fondo | Qué ocurre |
|---|---|---|---|
| — | **Entrada** (preloader) | Negro | Se dibuja la muela. Por su centro se entra en la cantera. |
| 00 | **Les Moles** (hero) | Foto | «Les Moles» gigante, *Gastronomía, territorio y memoria.* y las coordenadas en vertical. |
| 00 | **Manifiesto** | Negro | Al bajar, la foto se contrae en una muela que gira. El manifiesto se ilumina palabra a palabra. |
| I | **El territorio** | Negro | Recorrido horizontal: el mar, la montaña, el olivo y la huerta. |
| II | **El producto** | Papel | «Mi producto fetiche es el aceite de oliva», con la foto encajándose dentro de la frase. |
| III | **La cocina** | Carbón | Jeroni y Pau: dos retratos a distinta velocidad y la filosofía de la casa. |
| IV | **La familia** | Papel | La historia con un año gigante fijo que cambia: origen → 2012 → 2014 → 2020 → 2021 → hoy. |
| V | **Los caminos** | Negro | Los menús como lista editorial; la foto de cada uno sigue al cursor. |
| VI | **La bodega** | Carbón | Carmen, los tres vinos propios y una muela de texto que gira alrededor de la botella. |
| VII | **La experiencia** | Negro | Galería horizontal de sala, jardines, cantera y boda, con las cifras intercaladas. |
| — | **Reconocimientos** | Papel | Las cuatro distinciones, con las líneas dibujándose. |
| — | **Reserva** | Negro | Una muela diminuta se abre hasta llenar la pantalla: *Ven a Les Moles*. |
| — | **Pie** | Negro | «Les Moles» a todo el ancho, con contacto, horario y estado «abierto ahora». |

### Navegación

- **Barra mínima**, siempre visible: marca a la izquierda y, a la derecha, «Menú» y
  «Reservar». Es transparente sobre la foto y cambia de tinta (clara u oscura) según el
  capítulo que tiene debajo.
- **Reservar** está siempre a un clic, pero con el tamaño de una etiqueta, no de un
  banner. Un punto verde lo distingue.
- **Menú a pantalla completa**: se abre como un círculo que crece desde el botón (la
  muela), con los capítulos numerados en serif gigante, una vista previa de foto al
  pasar el ratón y la información práctica al lado. Es un diálogo accesible: Esc cierra,
  el foco queda dentro y se devuelve al botón al cerrar.
- **Indicador de capítulo** fijo abajo a la izquierda («III — La cocina»), con una línea
  de progreso. El visitante siempre sabe dónde está.
- **Saltos con cortina**: al ir a un capítulo lejano desde el menú, una cortina negra con
  la muela cubre la pantalla, se salta al destino y se descubre. Así no se cruzan las
  secciones fijas a toda velocidad.
- **Estado en vivo**: hora de Ulldecona y si el restaurante está abierto ahora, calculado
  con el horario real.

---

## 3. Movimiento

Principio: **cada animación tiene una razón narrativa, jerárquica o de orientación**. Si
no la tiene, no está.

| Animación | Técnica | Por qué |
|---|---|---|
| Muela que se dibuja (preloader) | Trazo SVG | Presenta el símbolo antes que nada. Completa solo en la primera visita de la sesión. |
| Entrada por la muela | `clip-path: circle()` que se abre y escala 1,25 → 1 | La sensación de entrar en Les Moles. |
| Letras del título | SplitText por caracteres con máscara | Da peso a la marca. |
| Foto → muela giratoria | ScrollTrigger con pin y scrub: círculo que se contrae y gira | Traduce el nombre en imagen. |
| Manifiesto palabra a palabra | Scrub de opacidad por palabra | Obliga a leer despacio lo más importante. |
| Territorio horizontal | Pin y desplazamiento del carril con `containerAnimation` | Un viaje de la costa a la montaña. |
| Revelado de fotos | `clip-path: inset()` y la foto de dentro de 1,25 → 1 | Cada foto se «revela», como en el cuarto oscuro. |
| Parallax | Velocidades distintas por capa (`data-speed`) | Profundidad, sin marear: máximo ±12 %. |
| Foto dentro de la frase | Anchura de 0 → 2,4 em con scrub | La foto entra literalmente en la cita. |
| Año gigante fijo | Sticky y cambio de texto | Hace sentir el paso del tiempo. |
| Foto que sigue al cursor (menús) | `quickTo` con inercia | Vista previa sin ocupar espacio. |
| Texto circular (bodega) | Rotación ligada al scroll | La muela otra vez, ahora de vino. |
| Galería horizontal | Pin y desplazamiento | Recorrer los espacios como un paseo. |
| Cierre: la muela se abre | `clip-path: circle()` de 6 % → 150 % | Cierra el círculo del relato. |
| Líneas | `scaleX` de 0 → 1 | Estratos que se dibujan. |
| Microinteracciones | Texto que rueda en los botones, subrayados que se dibujan y cursor con etiqueta | La calidad está en los detalles. |

**Tiempos.** Entradas de 0,9–1,4 s con `expo.out` o `power3.out`. Scrubs con 0,6–1 s de
suavizado. Escalonado de 0,04–0,08 s. Nada rebota.

**Cursor personalizado** (solo con ratón): un punto y un anillo que aparece con una
etiqueta cuando hay una acción real: *Explorar* en enlaces, *Descubrir* en menús y
*Reservar* en reservas. Nunca «Ver» donde no se puede ver nada más.

### Móvil, tableta y movimiento reducido

- **Escritorio (≥ 1024 px)**: todo. Scroll suave con Lenis, secciones fijas y carriles
  horizontales.
- **Tableta (768–1023 px)**: sin scroll suave (el nativo es mejor al tacto). Los carriles
  horizontales pasan a carruseles deslizables con snap, y los retratos se reordenan.
- **Móvil (< 768 px)**: composición propia, no una versión encogida. Entrada vertical,
  título partido, carruseles al dedo, menús en acordeón, sin cursor y parallax a la
  mitad.
- **`prefers-reduced-motion`**: sin preloader, sin scroll suave, sin fijados ni
  parallax. Todo el contenido aparece directamente y los carriles pasan a vertical.

---

## 4. Arquitectura técnica

| Decisión | Por qué |
|---|---|
| **Vite + HTML y JavaScript sin framework** | El contenido es estático: HTML primero, que carga al instante y lo indexa Google. React solo añadiría peso. |
| **GSAP 3.15** (ScrollTrigger y SplitText) | Estándar de la industria para scroll y tipografía. Desde 2025, gratis con todos los plugins. |
| **Lenis** | Scroll suave sincronizado con el ticker de GSAP, solo en escritorio. |
| **Tipografías alojadas en la web** (Fontsource) | Sin Google Fonts: rápido y conforme con el RGPD. Dos archivos variables precargados. |
| **CSS con capas y tokens** | Un solo archivo por componente. Sin Tailwind, para que la composición sea deliberada. |
| **Cloudflare Pages** | Estático en el borde. `wrangler.toml` más GitHub Action. |

```
lesmoles-demo/
  index.html                 la Home: todo el contenido está en el HTML
  src/main.js                arranque: registra plugins y monta los módulos
  src/js/                    smooth, loader, nav, menu, cursor, scenes/*, photos, clock
  src/styles/                tokens, base, type, layout, components y una hoja por capítulo
  src/photos/                aquí van las fotos reales (se sustituyen solas)
  public/                    _headers, robots.txt, favicon, imagen para redes
  wrangler.toml              configuración de Cloudflare Pages
```

### Rendimiento: objetivos y medidas

- **Objetivos**: LCP < 2,0 s (4G), CLS < 0,05, JS < 90 KB gzip y 60 fps en el scroll.
- **Técnicas**:
  - Solo se animan `transform`, `opacity` y `clip-path`.
  - `will-change` únicamente durante la animación.
  - Fotos diferidas con `loading="lazy"` y `decoding="async"`, reservando su espacio con
    `aspect-ratio`.
  - Fuentes precargadas con `font-display: swap`.
  - Los módulos de escritorio (Lenis y cursor) no se ejecutan en táctil.
  - GSAP `matchMedia` revierte las animaciones al cambiar de tamaño.
- **Fotos reales**: se dejan en `src/photos/<hueco>.jpg` y sustituyen solas al hueco. Para
  producción, se procesan a AVIF y WebP en tres anchos (640, 1280 y 2400 px); el comando
  está en `README.md`.

### Accesibilidad

- Contraste AA en todo el texto.
- Estructura semántica, enlace para saltar al contenido y foco visible.
- El menú es un diálogo con el foco dentro.
- El texto partido con SplitText se lee entero (`aria-label` en el original).
- Se respeta `prefers-reduced-motion`.
- Nada depende solo del cursor ni del hover.

---

## 5. Lo que queda para las siguientes fases

- Las páginas interiores (Restaurante, Menús, Bodega, Eventos, Historia y Reserva), que
  seguirán este documento.
- Las transiciones entre páginas: ya existe la cortina con la muela, que se reutilizará
  al cambiar de página.
- Catalán como idioma principal e inglés (la demo está en castellano).
- La sesión de fotos y vídeo.
- La conexión del motor de reservas.
