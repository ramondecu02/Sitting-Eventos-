# Rediseño visual · Les Moles Events

Estado: **prototipo v2 hecho, esperando el OK de Ramon** (paso C). Nada portado a la app todavía.
Código del prototipo (referencia para portar): `rediseno/prototipo-v2.html` (un solo archivo, sin dependencias salvo Google Fonts).
Prototipo: https://claude.ai/artifact/PxPhJMLGyhNRo5RAejTwt5 (privado; se comparte desde su menú «Compartir»).

## A) Skills
- Instaladas (global, `~/.claude/skills`): paquete de Emil Kowalski (animate, animation-performance, animation-vocabulary, apple-design, break-ui, emil-design-eng, find-animation-opportunities, improve-animations, mobile-native, prototype, review-animations…) y paquete de Vercel (web-design-guidelines, writing-guidelines…).
- **No instaladas** (el sistema denegó la instalación suelta desde GitHub): `frontend-design`, `huashu-design`, `ui-ux-pro-max`, `agent-browser`, `find-skills`, `mcp-builder`. Las tres primeras eran las de diseño; el prototipo se ha hecho con los criterios del propio encargo y las skills instaladas. Para añadirlas hay que permitirlo en los permisos de Bash.

## B) Auditoría breve (app v02.02, `cloudflare/public/index.html`)
Diferencias con lo que describe el encargo (la copia que se inspeccionó era anterior):
- Letra de hoy: **Bodoni Moda** (títulos y cifras, 88 usos) + **Hanken Grotesk** (interfaz, 41) + Cormorant Garamond solo en hojas imprimibles (21) + Barlow Semi Condensed (1). No es Cormorant + Karla.
- Color: ya hay sistema de tokens en tres capas (piedra caliza + **olivo** como único acento, vino para peligro, ocre para aviso). El dorado ya no es el acento. Los colores de local de Previsión son #C9952B, #8C2F43 y #2F6DB0.
- La pantalla de acceso **ya lleva una foto real** del local (173 KB incrustada). Se ven rostros de invitados: conviene decidir si se queda en una página pública.
- Fuentes desde Google Fonts (sin autoalojar).

Medidas:
- **289 declaraciones de `font-size` por debajo de 12 px** (7,5 a 11,5 px); cuerpo de 13 a 13,5 px en lo más usado.
- **Texto explicativo:** unos 230 párrafos de ayuda (`pn-lead` 27, `mnu-note` 25, `pv-guide` 21, `pp-empty` 20, `esc-hint` 19, `empty` 19, `pp-note` 15, `es-peq` 11, `mj-sub` 9, `pay-hint` 7, `cn-nota` 7…).
- **Movimiento:** 65 transiciones, 10 `@keyframes`, 9 bloques `prefers-reduced-motion`; ningún `transition: all` ni `ease-in` (bien); **0 View Transitions, 0 feedback `:active`, 1 solo `@media (hover:hover)`**.
- Iconos: set SVG de línea + 88 símbolos de texto (✓ ☐ ✎ ★ ⚠ 📎 ♥ 💶…).
- Zonas táctiles: botón 34 px, pequeño 28 px, chip 28 px, campo 38 px (por debajo de 44 px en móvil).
- Contraste: la paleta del prototipo cumple AA en claro y oscuro (comprobado).

## C) Prototipo
**v1** (descartado por Ramon: «no me gusta ninguno, no veo animaciones, no veo movimiento, faltan cosas de la interfaz»).

**v2** (mismo enlace, versión 2):
- **Toda la navegación de la app**: Resumen + 9 grupos y 52 pantallas (Planificación 10, Servicio 2, Plano 5, Menú 9, Camareros 3, Recursos 2, Inventario 1, Parámetros 15, Rentabilidad 3, Previsión 2), con datos de ejemplo coherentes (la boda de Marta i Jordi, 59 invitados, 6 mesas, 9 personas con alergia o dieta).
- **Movimiento visible y con selector «Movimiento: Con / Sistema / Sin»** (por defecto «Con», porque el v1 se veía quieto si el sistema pedía reducir movimiento): pantallas que entran con dirección, listas escalonadas, cifras que cuentan, barras que se llenan, indicador que se desliza en barra lateral, pestañas y barra inferior móvil, grupos que se pliegan, casillas que se dibujan y tachan, mesas que aparecen, anillos en las alergias, hojas desde abajo en móvil, avisos con resorte, foto del acceso con zoom lento. Solo `transform` y `opacity`, ease-out, ≤ 300–460 ms (entradas), nada de `transition: all`, y «Sistema»/«Sin» lo suavizan o lo quitan.
- **10 pares de letras** para elegir con vista previa: La de hoy (Bodoni Moda + Hanken Grotesk), Moderna (Bricolage Grotesque + Instrument Sans), Clásica de restaurante (DM Serif Display + DM Sans), Libro (Libre Baskerville + Work Sans), Editorial sobria (Spectral + Public Sans), Una sola geométrica (Jost), Mayúsculas romanas (Marcellus + Mulish), Cálida (Young Serif + Figtree), Técnica (IBM Plex Serif + Sans), Una sola neutra (Albert Sans).
- Claro / oscuro / auto, escritorio / móvil (el móvil responde al ancho del contenedor), tamaño 100/112/125 %, buscador Ctrl K con sinónimos, tabla antes/después de textos al final.
- Fotos: recortes de la única foto de Ramon que hay (la del acceso) en los huecos previstos (cabecera del Resumen, tarjetas de evento, secciones del menú, montaje, galería). Las suyas irán en esos mismos huecos.
- Comprobado con navegador: las 53 pantallas en escritorio y móvil, claro y oscuro, sin errores de JavaScript ni desbordes; recorrido de interacciones (entrar, mesa → panel / hoja, nombres en el plano, estados de alergia con Deshacer, filtros, marcar platos, tareas, calendario, buscador, letras, movimiento, barra lateral).

## Pendiente de Ramon
1. Elegir letra entre las 10 (o decir qué le gusta de cada una) y qué cambiaría del prototipo.
2. Mandar las fotos (exterior, salones, mesas y montajes, estaciones, platos, equipo).
3. Vetar textos de la tabla antes/después (está al final del prototipo; al portar se entregará la completa).

## D) Al portar (solo tras el OK)
Solo capa visual; fuentes autoalojadas en `fonts/` (woff2); fotos en `img/` (WebP ≤ 200 KB, sin EXIF); variables CSS para todo; subir mínimo 44 px en móvil; no tocar editor de plano, motor de PDF ni la lógica. Comprobar PDF idénticos y pasar los tests.
