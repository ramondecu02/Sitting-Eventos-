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

`test_exterior_orient.js` comprueba, con el mismo servidor, que el plano
exterior ("Sala 17 mesas") gira correctamente entre vertical y apaisado sin
deformar su forma real (chaflán incluido), y que vuelve a colocar las mesas
en modo vertical al usar "Diseño del salón". Se lanza igual:
`node test_exterior_orient.js`.

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
```
