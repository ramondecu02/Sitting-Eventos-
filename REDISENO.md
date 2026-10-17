# Rediseño visual · Les Moles Events

Estado: **prototipo hecho, esperando el OK de Ramon** (paso C). Nada portado a la app todavía.
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
Acceso, panel, plano (vista), elegir platos, alergias (con estado único «por decidir / decidido / confirmado por cocina»), check list (tres pestañas), previsión (calendario, lista, por local) y montaje. Claro/oscuro, escritorio/móvil, movimiento (CSS puro, ease-out, ≤ 300 ms, View Transitions con respaldo, escalonado de 8 elementos, `prefers-reduced-motion`), buscador Ctrl K, selector temporal de letra: Actual, A (Newsreader + IBM Plex Sans), B (Source Serif 4 + Source Sans 3), C (Fraunces + Hanken Grotesk). Fotos: marcadores neutros salvo la del acceso.

## Pendiente de Ramon
1. Elegir letra (A, B, C o quedarse con la actual) y decir qué cambiaría del prototipo.
2. Mandar las fotos (exterior, salones, mesas y montajes, estaciones, platos, equipo).
3. Vetar textos de la tabla antes/después (está al final del prototipo; al portar se entregará la completa).

## D) Al portar (solo tras el OK)
Solo capa visual; fuentes autoalojadas en `fonts/` (woff2); fotos en `img/` (WebP ≤ 200 KB, sin EXIF); variables CSS para todo; subir mínimo 44 px en móvil; no tocar editor de plano, motor de PDF ni la lógica. Comprobar PDF idénticos y pasar los tests.
