# Sitting Castell Vidal — versión web en equipo

Es la misma herramienta de siempre (`sitting.html`), ahora servida como una web
con **una sola contraseña de equipo** y **los eventos guardados en un servidor
compartido** en vez de solo en el navegador de cada uno.

- Cada vez que alguien guarda un cambio, se sube al servidor (con una base de
  datos Postgres) unos segundos después, en silencio.
- Cada vez que alguien abre o recarga la página, se trae lo último que haya en
  el servidor y se combina con lo que ya tenía ese navegador (el mismo criterio
  que ya usaba la herramienta para no pisarse entre dos pestañas: gana el
  cambio más reciente).
- Si el servidor no responde (sin conexión, sesión caducada...), se sigue
  trabajando con normalidad: todo queda guardado en ese navegador y se
  reintenta solo. No se pierde nada.
- Sin la contraseña de equipo no se entra ni se ve nada.

## Qué hace falta para ponerla en marcha

1. **Un sitio donde alojarla** — cualquier hosting que ejecute Node.js:
   Render, Railway, Vercel... (es un proyecto Next.js estándar).
2. **Una base de datos Postgres** — casi todos esos mismos sitios ofrecen una
   gratis (Render, Railway, Supabase, Neon, Vercel Postgres...). Basta con la
   cadena de conexión.
3. **Tres variables de entorno**, configuradas en el panel del hosting (nunca
   en el código):
   - `TEAM_PASSWORD` — la contraseña que usará todo el equipo. Se puede
     cambiar cuando se quiera sin tocar nada más.
   - `SESSION_SECRET` — una cadena aleatoria larga, solo para firmar la
     sesión. Generar una:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `DATABASE_URL` — la cadena de conexión de la base de datos Postgres.

Ver `.env.example` para más detalle de cada una.

## Desplegar

### Opción sencilla: Render (una sola cuenta, hosting + base de datos)

1. Crear una cuenta en render.com (tiene plan gratuito).
2. "New +" → "Web Service" → conectar este proyecto (subiéndolo a GitHub
   primero, o con el CLI de Render).
3. "New +" → "PostgreSQL" para crear la base de datos; copiar su cadena de
   conexión ("Internal Database URL").
4. En el Web Service, pestaña "Environment": añadir `TEAM_PASSWORD`,
   `SESSION_SECRET` y `DATABASE_URL` (la del paso 3).
5. Build command: `npm install && npm run build` · Start command: `npm start`.
6. Desplegar. Render da una URL del tipo `https://sitting-castell-vidal.onrender.com`.

### Otras opciones

Cualquier plataforma que ejecute Node.js sirve igual (Railway, Vercel + una
Postgres externa como Supabase o Neon, un VPS propio...). Los pasos son los
mismos: variables de entorno + `npm run build` + `npm start` (o, si la
plataforma lo pide en modo "standalone", `node .next/standalone/server.js`
tras copiar `public/` y `.next/static/` dentro de `.next/standalone/`).

### Dominio propio

Una vez desplegada en la dirección gratuita, cualquiera de estos hostings
permite enganchar un dominio o subdominio propio (por ejemplo
`sitting.castellvidal.com`) desde su panel, sin volver a tocar el proyecto.

## Desarrollo / probar en local

```bash
npm install
cp .env.example .env.local   # y rellenar TEAM_PASSWORD y SESSION_SECRET
npm run dev
```

Sin `DATABASE_URL`, en local se usa automáticamente un archivo
(`.data/store.json`) en vez de Postgres — no hace falta instalar nada más
para probar. Ese archivo no debe usarse en producción (no sobrevive a un
redespliegue en la mayoría de hostings).

## Comprobaciones automáticas

`test_web.js` y `test_smoke.js` (Playwright) comprueban, contra un servidor
real corriendo en local, todo el flujo de dos personas de equipo compartiendo
un evento, sesión, y que la edición/exportación de siempre sigue funcionando
igual. Instrucciones dentro de cada archivo; se lanzan con
`node test_web.js` / `node test_smoke.js` con el servidor arrancado en el
puerto 3200.

`test_inventario.js` comprueba que el apartado **Inventario** es de verdad el
Excel `INVENTARIO LES MOLES.xlsx` y no una versión "mejorada" de él: las 5
hojas y las 17 categorías con sus nombres y en su orden, las 123 líneas, los
nombres repetidos que solo se distinguen por las medidas, `TRONAS BEBÉ` como un
nombre que vale para tres filas, las líneas que el Excel deja en blanco (que no
se rellenan solas), el `++` de CHICA-CHICA tal cual, las notas (y que solo se
pinten en rojo las que avisan de algo roto), la fecha de inventario de la hoja
de vasos, y las columnas propias de los cables. Además: buscar, filtrar por
hoja, corregir una cantidad sin perder la del Excel, que la corrección le
llegue a un compañero, y que el inventario sea el mismo para todos los eventos.
Se lanza igual: `node test_inventario.js`.

`test_alergias.js` comprueba la hoja de **Alergias y sustituciones**: que
saca del plano quién tiene alergia (con su nombre, su alergia y su mesa) sin
volver a pedirla, que el plato sustitutivo se escribe a mano, y que ese plato
aparece después en el **listado por mesas** (también en el recuadro de alergias
del pie) y en el **plano de sala**. Y que borrarlo lo quita de los tres sitios,
porque son el mismo dato. Se lanza igual: `node test_alergias.js`.

`test_navegacion.js` comprueba la barra de arriba: que las ocho secciones del
evento están en un solo desplegable y cada una abre su pantalla (saltando sola
entre el plano y el menú, sin tener que saber que por dentro son dos cosas);
que el desplegable dice siempre dónde estás; que el evento se elige una vez y
vale para las dos; que «+ Evento» crea uno en blanco también estando en el
Menú; y que en móvil la barra sigue entera y no tapa el contenido. Se lanza
igual: `node test_navegacion.js`.

`test_exterior_orient.js` comprueba, con el mismo servidor, el giro de los
planos entre vertical y apaisado: que la sala y **las mesas** giran juntas, en
los dos planos (interior y exterior); que el contorno del exterior conserva su
forma real al girar (chaflán incluido) en vez de deformarse; que girar y volver
deja el plano exactamente igual, y que girar muchas veces no va desplazando las
mesas poco a poco; que la entrada del interior gira con la sala; que "Diseño
del salón" sigue forzando vertical; que Deshacer revierte el giro; y que cambiar
el tamaño de la sala a mano no gira el plano de golpe. Se lanza igual:
`node test_exterior_orient.js`.

`test_servicio_mobiliario.js` comprueba el bloque de **mobiliario y utensilios
de estación** del check list de Servicio: que el material para montar una
estación es fijo (1 cubo, 2 boles… lo mismo para 30 que para 300 comensales)
mientras que la comida de esa misma estación sí se multiplica por comensal;
que la cubertería de los segundos cambia sola según haya carne y pescado o un
solo segundo plato; y que las estaciones aún sin datos se nombran una a una en
vez de callarse. Se lanza igual: `node test_servicio_mobiliario.js`.

`test_menu_desde_plano.js` comprueba que el Menú saca los comensales y las
mesas **del plano de mesas** en vez de pedirlos otra vez a mano: que sale el
número real de cada mesa (no una media de "personas por mesa"), que los campos
a mano desaparecen cuando ya no hacen falta y reaparecen si el plano está
vacío, que cambiar el plano actualiza el Menú y el check list solos, y que cada
evento conserva su plano y su menú sin mezclarse. Se lanza igual:
`node test_menu_desde_plano.js`.

## Qué se queda fuera, de momento

El **plano de fondo** (la imagen del restaurante que se sube desde "Subir
plano") sigue guardándose solo en el navegador de quien la sube, no en el
servidor compartido — cada persona que quiera verlo de fondo tiene que
subirlo una vez en su propio navegador. Todo lo demás (las mesas, los
comensales, las plantillas, los tamaños...) sí se comparte.

## Estructura del proyecto

```
sitting.html          la herramienta en sí (sin tocar su lógica de edición)
proxy.js              puerta de acceso: exige sesión antes de servir "/" y "/api/store"
app/route.js          sirve sitting.html en "/"
app/login/page.js      formulario de contraseña
app/api/login          comprueba la contraseña y crea la sesión
app/api/logout         cierra la sesión
app/api/store          GET/PUT del evento compartido (JSON)
lib/auth.js            firma y comprobación de la cookie de sesión
lib/storage.js         guardado en Postgres (o archivo local en desarrollo)
lib/url.js             construye URLs absolutas a partir de la petición real
inventario_extraer.py  Excel del inventario -> JSON
inventario_gen_js.py   ese JSON -> el bloque INVENTARIO_DATA de sitting.html
```

## De dónde salen los datos del check list de Servicio

Dentro de `sitting.html`, junto al catálogo de platos:

- `CATALOGO_DATA` — qué plato de servicio y qué cubierto lleva cada plato del
  menú, y con qué base se multiplica (COMENSAL / MESA APERITIVO / MESA
  BANQUETE / PLATO / EVENTO). Sale del Excel `CHECK_LIST_EVENTOS`.
- `MOBILIARIO_DATA` — qué hace falta para **montar** cada estación (el cubo,
  la tabla, el abreostras…), que es cosa distinta de la comida que se sirve en
  ella: la comida se escala por comensal, el material de la estación no. Sale
  del Excel `Parametros_Inventario_Mobiliario_LesMoles`. Cada regla dice
  cuándo aparece: con un plato concreto (`plato`), con cualquier plato de una
  estación (`estacion`), o siempre (`evento`).

Para añadir una estación nueva basta con añadir su regla a `MOBILIARIO_DATA`.
Las que no estén puestas no se inventan: la propia hoja de Servicio las nombra
para que se vea qué falta por rellenar.

## Cómo se mueve uno por la app

Arriba del todo hay una barra fija, la misma en todas las pantallas, con tres
cosas y nada más:

- **Evento** — el desplegable de eventos. Es uno solo: el evento que elijas ahí
  es el del plano y el del menú a la vez. Cada evento sale con sus mesas y sus
  comensales detrás del nombre (`eventLabel`), para poder distinguir dos que se
  llamen parecido.
- **+ Evento** — crea un evento nuevo, con su plano y su menú en blanco, estés
  en la pantalla que estés.
- **Sección** — las ocho pantallas del evento en una sola lista, agrupadas:
  *Plano de mesas* (Plano de sala · Listado por mesas · Marcasitios) y *Menú
  del evento* (Elegir platos · Producción · Lista de la compra · Check list de
  servicio · Menú para imprimir). Elegir una de menú salta sola al menú y al
  revés; no hace falta saber que por dentro son dos vistas.

En el código: `SECCIONES` (la lista), `irASeccion(clave)` (abre la pantalla) y
`syncAppbar()` (deja los dos desplegables diciendo dónde estás y qué evento
hay). `fillSelect()` avisa al Menú cuando cambia el evento activo o la lista,
para que crear o cambiar de evento desde la barra no deje el Menú con las
cifras del anterior.

## El apartado Inventario

Es la versión dentro de la app del Excel `INVENTARIO LES MOLES.xlsx`. **No se
reorganiza nada**: las hojas, su orden, los nombres de las categorías (con su
mezcla de catalán y castellano) y las líneas son las del Excel. Vive en
`INVENTARIO_DATA`, dentro del cuarto bloque `<script>` de `sitting.html`.

A diferencia del plano y del menú, **el inventario no es de un evento**: es el
material del negocio, el mismo para todos. Por eso va en su propio grupo del
desplegable de secciones.

Lo que el Excel tiene de particular y hay que mantener:

- El nombre no identifica una línea: hay nombres repetidos que solo se
  distinguen por las medidas (`MESA REDONDA BANQUETES` de 2 m y de 1,50).
- `TRONAS BEBÉ` es un nombre fusionado sobre tres filas con tres medidas: las
  dos de abajo llevan `mismoNombre:true` y se marcan como continuación.
- Hay líneas sin cantidad y una con `++` en vez de un número. No se rellenan ni
  se convierten: se cuentan aparte en las cifras de arriba.
- `SONIDO Y LUZ` tiene dos bloques con forma distinta: una tabla de cables con
  código, tipo, amperios y metros, y debajo una lista que en el Excel va sin
  cabecera (esa categoría lleva `nombre:null` y se pinta sin título).

**Añadir lo que se compra después del Excel**: cada grupo tiene al final
«+ Añadir artículo» (nombre obligatorio; medidas y comentario opcionales,
porque no todo tiene medidas) y cada hoja tiene «+ Grupo nuevo». Lo añadido
vive en `store.invExtra` — separado del Excel a propósito, para poder volver a
importar el Excel cuando cambie sin llevarse por delante lo comprado desde
entonces — y sale marcado como «añadido» para distinguir de un vistazo qué
viene de dónde. Se puede corregir y quitar; un grupo con artículos dentro no se
deja quitar, avisa primero.

**Las correcciones de cantidad, medidas y comentario** se guardan en
`store.inventario`, aparte de los eventos, y se comparten con el equipo por el mismo camino. Cada corrección
lleva su `updated`, y se combinan artículo a artículo — gana la más reciente —
para que dos personas puedan contar cosas distintas a la vez. Volver a la
cantidad del Excel se guarda **como una corrección más** con `cantidad:null`,
no borrando la entrada: si se borrara, la copia de otra pestaña o del servidor
la resucitaría en el siguiente guardado (es el mismo motivo por el que los
eventos borrados llevan su `deletedIds`).

**Cuando el Excel cambie**, no hay que teclear nada a mano:

```bash
python3 inventario_extraer.py "INVENTARIO LES MOLES.xlsx" > inventario.json
python3 inventario_gen_js.py inventario.json > INVENTARIO_DATA.js
```

El primero lee el Excel (reconoce las cabeceras de categoría por su formato:
negrita + fondo de color, que es la única marca de jerarquía que tiene el
archivo) y el segundo escribe el bloque de JavaScript. Después se sustituye a
mano el `var INVENTARIO_DATA = {...};` de `sitting.html` por el nuevo — a
propósito, para poder mirar el diff antes: un Excel con una hoja renombrada o
una categoría movida cambia lo que ve el equipo.

## Alergias y platos sustitutivos

Las alergias **ya están en el plano**: se escriben al teclear la lista de
invitados, entre paréntesis (`Rosa Fabra (al·lèrgia: marisc)`), y `parseGuest`
las deja en `g.aler`. La hoja de Alergias no las vuelve a pedir — las lee de
ahí por el puente (`SITTING_BRIDGE.alergias()`) y lo único que añade es el
plato que se le sirve a cada uno.

**Ese plato se guarda dentro del plano**, como una etiqueta más del comensal
(`Menú: Lubina a la plancha`), no en una lista aparte. Es la decisión que hace
que funcione: el plano de sala y el listado por mesas ya sabían dibujar
`g.menu`, así que el plato aparece solo en los dos sitios donde el equipo lo
mira el día del evento, sin nada que sincronizar y sin que puedan acabar
diciendo cosas distintas. `SITTING_BRIDGE.setSustituto(mesa, i, plato)` es
quien lo escribe, desde el lado de Sitting, que es el dueño del plano.

Dónde se ve: en el listado, como etiqueta dorada llena junto al nombre y en el
recuadro de alergias del pie; en el plano de sala, bajo la alergia y en dorado
(recortado, como ya se recortaban las alergias, para que quepa junto a la
silla); y en el PDF de las dos cosas.

## Cómo se enlazan Sitting y Menú

Las dos vistas viven en la misma página pero en bloques `<script>` distintos, y
se hablan por `window.SITTING_BRIDGE`. El puente expone:

- `store`, `current`, `save`, `switchActiveEvent` — el evento activo es un
  único concepto compartido: cambiarlo desde cualquiera de las dos vistas
  cambia la otra.
- `eventLabel(e)` — cómo se llama un evento en los desplegables (nombre + sus
  mesas y comensales, para poder distinguir eventos que se llamen parecido).
- `planTotals()` — **el plano de mesas real del evento activo**: comensales,
  adultos, niños, tronas, y el reparto por mesa. Vuelve a leer el texto del
  evento en cada llamada, así nunca devuelve una foto antigua.

`evTotals()` (lado Menú) se construye sobre `planTotals()`: los comensales y
las mesas de banquete **salen del plano**, no de escribirlos a mano. Solo se
pregunta lo que el plano no puede saber — cuánta gente va por mesa de
aperitivo, porque las mesas altas no se dibujan. Si el plano está vacío
(evento recién creado, presupuesto antes de sentar a nadie), se vuelve a los
campos a mano para no dejar el Menú inservible.

Cada evento de `store.events` lleva lo suyo: `text` (el plano en texto),
`plans.interior` / `plans.exterior` (las dos distribuciones) y `menu` (platos
marcados y parámetros). Crear un evento nuevo crea todo eso en blanco.
