/*
 * Les Moles Events — Cloudflare Worker (backend real)
 * ---------------------------------------------------------------------------
 * Sirve la aplicación (public/index.html) y ofrece la API que ya usa el
 * frontend: autenticación con usuarios y roles, sesión firmada por cookie y
 * un almacén compartido (documento JSON) sobre D1.
 *
 * Endpoints:
 *   GET  /api/me                estado de sesión ({authed, user} | {authed:false, setup})
 *   POST /api/setup             crea el PRIMER administrador (solo si no hay usuarios)
 *   POST /api/login             {email,password} -> cookie de sesión
 *   POST /api/logout            cierra la sesión
 *   GET  /api/store             documento compartido (requiere sesión)
 *   PUT  /api/store             guarda el documento JUNTÁNDOLO con lo que ya hay (requiere sesión)
 *   GET  /api/sync?ev=&tab=     versión del documento y quién más está conectado (y en qué evento)
 *   GET  /api/users             fichas de usuario: rol, estado, último acceso… (solo admin)
 *   POST /api/users             {email,name,role,phone?,puesto?,password?}: con contraseña crea el usuario (deberá cambiarla);
 *                               sin contraseña lo INVITA y devuelve el enlace (solo admin)
 *   PATCH  /api/users           {id, name?, role?, phone?, puesto?, active?, password?, reinvitar?} (solo admin)
 *   DELETE /api/users?id=..     elimina usuario (solo admin)
 *   GET  /api/invitacion?t=..   datos de una invitación (público, con el enlace)
 *   POST /api/invitacion        {t,password}: la persona crea su contraseña y entra
 *   POST /api/me/password       {actual,nueva}: cambia la contraseña propia
 *   GET  /api/actividad         registro de actividad: accesos, usuarios, borrados, copias… (solo admin)
 *   PUT  /api/roles             {roles:{rol:[secciones]}|null} qué secciones ve cada rol (solo admin)
 *   PUT  /api/seguridad         {idleMin} cierre de sesión por inactividad (solo admin)
 *   GET  /api/share?t=..        portal del cliente: su evento, pagos, presupuesto (lectura) y su lista
 *   POST /api/share?t=..        el cliente guarda/envía SOLO sus nombres y su lista de invitados
 *   GET  /api/propuestas        listas enviadas por el cliente (administración y eventos)
 *   PATCH /api/propuestas       {token, estado:"aplicada"|"descartada"} (equipo con sesión)
 *   GET  /api/backups           copias de seguridad y papelera (solo admin)
 *   POST /api/backups           {nota?} hace una copia ahora (solo admin)
 *   GET  /api/backups/ver?id=   qué eventos cambian si se restaura esa copia (solo admin)
 *   GET  /api/backups/bajar     ?id=.. una copia, o ?actual=1 todo lo de ahora, como archivo .json (solo admin)
 *   POST /api/backups/restaurar {backup,evento} | {backup,todo} | {papelera} | {documento,todo} (solo admin)
 *   GET  /api/historial?ev=..   quién cambió qué y cuándo en un evento (admin y eventos)
 *   GET  /api/historial/ver?id= qué secciones cambiarían si se vuelve a esa versión (admin y eventos)
 *   POST /api/historial/restaurar {id}  vuelve el evento a como estaba antes de ese cambio (admin y eventos)
 *   GET  /api/planos            planos de fondo del salón (sin la imagen): clave, medidas, versión (con sesión)
 *   GET  /api/planos/ver?k=..   un plano de fondo con su imagen (con sesión)
 *   PUT  /api/planos            {k,w,h,src} sube o cambia un plano de fondo (admin, eventos y servicio)
 *   DELETE /api/planos?k=..     quita un plano de fondo (admin, eventos y servicio)
 *   GET  /api/servicio?ev=..&since=N   modo servicio: lo que ha cambiado en el evento desde la versión N (cualquier rol salvo compras)
 *   POST /api/servicio          {ev, since?, ops:[{k, v | del, nx?}]}: platos salidos, invitados llegados, incidencias; devuelve lo nuevo
 *   POST /api/share/accion?t=..  {tipo: aprobar|comentario|archivo|quitar} lo que el cliente hace en su portal (solo con enlace largo)
 *   GET  /api/share/img?t=..&id=..   una imagen de su portal (su logo, sus fotos, la minuta publicada)
 *   GET  /api/portal?ev=..       lo del portal de un evento (mensajes, archivos, aprobaciones); sin «ev»: lo que hay sin leer por evento (admin y eventos)
 *   POST /api/portal/msg {ev,texto} · POST /api/portal/leido {ev} · PUT /api/portal/minuta {ev,src} · DELETE /api/portal/arch?id=  · GET /api/portal/img?id=
 *   GET  /api/correo            estado del correo, ajustes y bandeja de salida (admin y eventos)
 *   PUT  /api/correo            {cfg?, plantillas?} ajustes y plantillas (solo admin)
 *   GET  /api/correo/plantillas plantillas y firma (cualquier rol: las usan los botones de WhatsApp)
 *   POST /api/correo/enviar     {kind, ev?, to, subject, text, ref?} envía (o guarda como «simulado» si no hay servicio de correo)
 *   POST /api/correo/enviar     también: adjuntos [{nombre,b64}] (hasta 3 · 3 MB) y programar (ISO, entre 5 min y 30 días)
 *   POST /api/correo/reintentar {id}      vuelve a intentar un envío con error
 *   POST /api/correo/vista      {kind?, subject?, text} el correo tal como llegará (HTML con la marca), para la vista previa
 *   POST /api/correo/estado     comprueba en el servicio de correo si lo enviado ha llegado (entregado, rebotado…)
 *   POST /api/correo/cancelar   {id}      cancela un envío programado que aún no ha salido
 *   POST /api/correo/resumen    {modo: vista|yo|equipo}  el resumen del equipo a mano
 *   POST /api/correo/cron       lo que se manda solo (resumen y recordatorios); con «Authorization: Bearer CRON_TOKEN» o el administrador
 *   GET  /api/health            ¿vivo? (público, sin datos; para un vigilante externo tipo UptimeRobot)
 *   POST /api/error             {msg,src?,v?} la app avisa de un error que le ha saltado (con sesión)
 *   GET  /api/estado            estado del sistema: último guardado, copias, tamaño del documento, errores (solo admin)
 *   DELETE /api/estado?errores=1 vacía el registro de errores (solo admin)
 *   GET  /api/docs?ev=          justificantes de pago y documentos de identidad del evento (sin contenido; según el rol); con &kind=comunicacion, los adjuntos de Comunicación
 *   POST /api/docs              {ev,kind:"justificante"|"dni"|"comunicacion",persona?,nombre,src,ref?,concepto?,importe?,fecha?} sube uno (admin, eventos; contabilidad solo justificantes;
 *                               «comunicacion» = chat de WhatsApp o correo en texto plano, captura o PDF, solo admin y eventos)
 *   GET  /api/docs/ver?id=      el archivo (los de identidad: cada apertura queda en el registro de actividad)
 *   POST /api/docs/editar       {id,ref?,concepto?,importe?,fecha?,estado?,nota?,persona?}
 *   POST /api/docs/borrar       {id}
 *   POST /api/docs/leido        {ev} lo que mandaron los clientes ya está visto
 *   GET  /api/privacidad        responsable, plazo de conservación y eventos que ya lo han pasado (solo admin)
 *   PUT  /api/privacidad        {responsable,nif,direccion,email,meses,auto} (solo admin)
 *   POST /api/privacidad/anonimizar {ids:[…],forzar?} quita nombres, contactos y alergias de eventos pasados (solo admin)
 *   POST /api/privacidad/persona    {q, borrar?} busca a una persona en todos los eventos / la quita (solo admin)
 *   GET  /api/consulta/form     el formulario público de consultas: ajustes, tipos, salones y un permiso firmado con la hora (público)
 *   GET  /api/consulta/disp?fecha=  ¿está libre esa fecha? por local (público; solo si el administrador lo activa)
 *   POST /api/consulta          {t, web, nombre, email, tel, tipo, fecha, fechaTxt, pax, salon, mensaje, consent, cf?} una consulta nueva (público, con antispam)
 *   GET  /api/consultas[?resumen=1]  las consultas recibidas (administración y eventos)
 *   POST /api/consultas/accion  {id, accion: leida|estado|nota|prev|ev|borrar, …} seguimiento de una consulta
 *   GET/PUT /api/consulta/cfg   ajustes del formulario (solo administración)
 *
 * Todo lo demás se sirve como asset estático (la app).
 */

const ROLES = ["admin", "eventos", "cocina", "compras", "contabilidad", "servicio"];
const COOKIE = "lm_sess";
const SESSION_DAYS = 14;
const enc = new TextEncoder();
const dec = new TextDecoder();

/* cabeceras de seguridad (v01.80): ninguna página ni respuesta se indexa, la app no se puede meter dentro de otra web
   (así nadie puede tapar un botón del portal con otra página) y el enlace privado del cliente no viaja a otras webs */
function conSeguridad(res, html) {
  const o = new Response(res.body, res);
  o.headers.set("X-Content-Type-Options", "nosniff");
  o.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  o.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (html) { o.headers.set("X-Frame-Options", "SAMEORIGIN"); o.headers.set("Content-Security-Policy", "frame-ancestors 'self'"); }
  return o;
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return conSeguridad(await api(request, env, url), false);
      } catch (err) {
        await logError(env, "servidor", url.pathname + " (" + request.method + ")", String(err && err.message || err), null);
        return conSeguridad(json({ error: "server", message: "Ha fallado algo en el servidor. Si se repite, avisa a quien lleva la herramienta." }, 500), false);
      }
    }
    // Resto: la aplicación (assets estáticos). SPA de un solo HTML.
    // El HTML no se guarda en caché: así ningún navegador (Firefox tiende a
    // quedarse con copias) sigue usando una versión vieja tras publicar.
    const res = await env.ASSETS.fetch(request);
    const ct = res.headers.get("Content-Type") || "";
    /* la app instalable: el service worker y el manifiesto se revisan siempre (si no, una versión vieja se queda pegada) */
    if (url.pathname === "/sw.js" || url.pathname === "/manifest.webmanifest") {
      const o = conSeguridad(res, false);
      o.headers.set("Cache-Control", "no-cache");
      if (url.pathname === "/sw.js") { o.headers.set("Content-Type", "application/javascript; charset=utf-8"); o.headers.set("Service-Worker-Allowed", "/"); }
      else o.headers.set("Content-Type", "application/manifest+json; charset=utf-8");
      return o;
    }
    if (ct.indexOf("text/html") === -1) return conSeguridad(res, false);
    const out = conSeguridad(res, true);
    out.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return out;
  },
};

/* v02.00 · quien entra con una contraseña temporal solo puede cambiarla (o salir): el resto del servidor le contesta «must-change» aunque
   se salte la pantalla de la app. Lo público (portal del cliente, formulario de consultas, invitaciones, vigilante) no pasa por aquí. */
const SIN_SESION = /^\/api\/((me|setup|login|logout|invitacion|health|share|error)(\/|$)|consulta$|consulta\/(form|disp)$)/;
async function api(request, env, url) {
  const p = url.pathname;
  const m = request.method.toUpperCase();
  if (!SIN_SESION.test(p) && p !== "/api/me/password") {
    const s0 = await session(request, env);
    if (s0 && s0.mustChange) return json({ error: "must-change", message: "Tu contraseña es temporal: cámbiala para poder seguir." }, 403);
  }
  if (p === "/api/me" && m === "GET") return meRoute(request, env);
  if (p === "/api/setup" && m === "POST") return setupRoute(request, env);
  if (p === "/api/login" && m === "POST") return loginRoute(request, env);
  if (p === "/api/logout" && m === "POST") return logoutRoute(request, env);
  if (p === "/api/invitacion" && m === "GET") return invGet(request, env, url);
  if (p === "/api/invitacion" && m === "POST") return invPost(request, env);
  if (p === "/api/me/password" && m === "POST") return mePassword(request, env);
  if (p === "/api/actividad" && m === "GET") return actList(request, env, url);
  if (p === "/api/roles" && m === "PUT") return rolesPut(request, env);
  if (p === "/api/seguridad" && m === "PUT") return seguridadPut(request, env);
  if (p === "/api/share" && m === "GET") return shareRoute(request, env, url);
  if (p === "/api/share" && m === "POST") return sharePost(request, env, url);
  if (p === "/api/share/accion" && m === "POST") return porAccion(request, env, url);
  if (p === "/api/share/img" && m === "GET") return porImgCliente(request, env, url);
  if (p === "/api/portal" && m === "GET") return portalGet(request, env, url);
  if (p === "/api/portal/img" && m === "GET") return portalImg(request, env, url);
  if (p === "/api/portal/msg" && m === "POST") return portalMsg(request, env);
  if (p === "/api/portal/leido" && m === "POST") return portalLeido(request, env);
  if (p === "/api/portal/minuta" && m === "PUT") return portalMinuta(request, env);
  if (p === "/api/portal/arch" && m === "DELETE") return portalQuitar(request, env, url);
  if (p === "/api/docs" && m === "GET") return docsGet(request, env, url);
  if (p === "/api/docs" && m === "POST") return docsSubir(request, env);
  if (p === "/api/docs/ver" && m === "GET") return docsVer(request, env, url);
  if (p === "/api/docs/editar" && m === "POST") return docsEditar(request, env);
  if (p === "/api/docs/borrar" && m === "POST") return docsBorrar(request, env);
  if (p === "/api/docs/leido" && m === "POST") return docsLeido(request, env);
  if (p === "/api/propuestas" && m === "GET") return propuestasList(request, env);
  if (p === "/api/propuestas" && m === "PATCH") return propuestasPatch(request, env);
  if (p === "/api/store" && m === "GET") return storeGet(request, env);
  if (p === "/api/store" && m === "PUT") return storePut(request, env);
  if (p === "/api/sync" && m === "GET") return syncRoute(request, env, url);
  if (p === "/api/backups" && m === "GET") return bkList(request, env);
  if (p === "/api/backups" && m === "POST") return bkCrear(request, env);
  if (p === "/api/backups/ver" && m === "GET") return bkVer(request, env, url);
  if (p === "/api/backups/bajar" && m === "GET") return bkBajar(request, env, url);
  if (p === "/api/backups/restaurar" && m === "POST") return bkRestaurar(request, env);
  if (p === "/api/historial" && m === "GET") return hiList(request, env, url);
  if (p === "/api/historial/ver" && m === "GET") return hiVer(request, env, url);
  if (p === "/api/historial/restaurar" && m === "POST") return hiRestaurar(request, env);
  if (p === "/api/health" && m === "GET") return healthRoute(env);
  if (p === "/api/error" && m === "POST") return errorPost(request, env);
  if (p === "/api/estado" && m === "GET") return estadoRoute(request, env);
  if (p === "/api/estado" && m === "DELETE") return estadoLimpiar(request, env);
  if (p === "/api/privacidad" && m === "GET") return privGet(request, env);
  if (p === "/api/privacidad" && m === "PUT") return privPut(request, env);
  if (p === "/api/privacidad/anonimizar" && m === "POST") return privAnonimizar(request, env);
  if (p === "/api/privacidad/persona" && m === "POST") return privPersona(request, env);
  if (p === "/api/planos" && m === "GET") return planosList(request, env);
  if (p === "/api/planos/ver" && m === "GET") return planosVer(request, env, url);
  if (p === "/api/planos" && m === "PUT") return planosPut(request, env);
  if (p === "/api/planos" && m === "DELETE") return planosDel(request, env, url);
  if (p === "/api/servicio" && m === "GET") return servicioGet(request, env, url);
  if (p === "/api/servicio" && m === "POST") return servicioPost(request, env);
  if (p === "/api/correo" && m === "GET") return correoGet(request, env, url);
  if (p === "/api/correo" && m === "PUT") return correoPut(request, env);
  if (p === "/api/correo/plantillas" && m === "GET") return correoPlantillas(request, env);
  if (p === "/api/correo/enviar" && m === "POST") return correoEnviarRoute(request, env);
  if (p === "/api/correo/reintentar" && m === "POST") return correoReintentar(request, env);
  if (p === "/api/correo/resumen" && m === "POST") return correoResumenRoute(request, env);
  if (p === "/api/correo/cron" && m === "POST") return correoCron(request, env);
  if (p === "/api/correo/vista" && m === "POST") return correoVista(request, env);
  if (p === "/api/correo/estado" && m === "POST") return correoEstadoRoute(request, env);
  if (p === "/api/correo/cancelar" && m === "POST") return correoCancelar(request, env);
  if (p === "/api/consulta/form" && m === "GET") return consForm(request, env);
  if (p === "/api/consulta/disp" && m === "GET") return consDispRoute(request, env, url);
  if (p === "/api/consulta" && m === "POST") return consNueva(request, env);
  if (p === "/api/consulta/cfg" && m === "GET") return consCfgGet(request, env);
  if (p === "/api/consulta/cfg" && m === "PUT") return consCfgPut(request, env);
  if (p === "/api/consultas" && m === "GET") return consLista(request, env, url);
  if (p === "/api/consultas/accion" && m === "POST") return consAccion(request, env);
  if (p === "/api/users" && m === "GET") return usersList(request, env);
  if (p === "/api/users" && m === "POST") return usersCreate(request, env);
  if (p === "/api/users" && m === "PATCH") return usersPatch(request, env);
  if (p === "/api/users" && m === "DELETE") return usersDelete(request, env, url);
  return json({ error: "not-found" }, 404);
}

/* ── sesión ─────────────────────────────────────────────────────────── */
/* clave para firmar la cookie de sesión: la variable SESSION_SECRET si está
   configurada; si no, una clave aleatoria que se genera UNA vez y se guarda en
   D1 (tabla meta). Antes se usaba una clave fija escrita en el código, con la
   que cualquiera que leyese el repositorio podía fabricar una sesión de admin. */
let SECRET_CACHE = null;
async function secret(env) {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  if (SECRET_CACHE) return SECRET_CACHE;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)").run();
  let row = await env.DB.prepare("SELECT v FROM meta WHERE k='session_secret'").first();
  if (!row) {
    await env.DB.prepare("INSERT OR IGNORE INTO meta (k, v) VALUES ('session_secret', ?)").bind(randomHex(32)).run();
    row = await env.DB.prepare("SELECT v FROM meta WHERE k='session_secret'").first();
  }
  SECRET_CACHE = row.v;
  return SECRET_CACHE;
}

async function meRoute(request, env) {
  const s = await session(request, env);
  if (s) {
    const u = await env.DB.prepare("SELECT phone, puesto, must_change FROM users WHERE id=?1").bind(s.uid).first();
    const aj = await ajustes(env);
    let portalDias = PRIV_DEF.portalDias; try { portalDias = (await privCfg(env)).portalDias; } catch (_) {}
    return json({ authed: true, user: Object.assign(pubUser(s), { phone: (u && u.phone) || "", puesto: (u && u.puesto) || "", mustChange: !!(u && u.must_change) }), roles: aj.roles, idleMin: aj.idleMin, portalDias });
  }
  const n = await countUsers(env);
  return json({ authed: false, setup: n === 0 });
}

async function setupRoute(request, env) {
  const n = await countUsers(env);
  if (n > 0) return json({ error: "already-setup" }, 403);
  const b = await body(request);
  const email = norm(b.email), name = String(b.name == null ? "" : b.name).trim(), pass = typeof b.password === "string" ? b.password : "";
  if (!validEmail(email) || !name || pass.length < 6) return json({ error: "invalid", message: "Email válido, nombre y contraseña de 6+ caracteres." }, 400);
  const user = await createUser(env, { email, name, role: "admin", password: pass });
  await logAct(env, { uid: user.id, name }, "login", "Primer acceso: se creó la cuenta de administrador");
  return withSession(json({ ok: true, user: pubUser(user) }), env, user);
}

/* v02.00 · el bloqueo por intentos fallidos ya no deja fuera al administrador por culpa de otra persona: se cuenta por
   correo + conexión (5 en 10 min), por conexión (20 con cualquier correo) y, mucho más alto, por correo desde cualquier sitio (40, contra quien
   reparte los intentos). Un correo que no existe, una invitación sin aceptar y una contraseña mala contestan EXACTAMENTE igual y tardan lo mismo. */
const LOGIN_VENTANA = 10 * 60e3, SAL_FALSA = "00112233445566778899aabbccddeeff";
async function loginRoute(request, env) {
  await ensureUsers(env);
  const b = await body(request);
  const email = norm(b.email), pass = typeof b.password === "string" ? b.password : "";
  if (!email || !pass || email.length > 160 || pass.length > 300) return json({ error: "invalid" }, 400);
  const ip = ipDe(request), ahora = Date.now();
  const c = await env.DB.prepare("SELECT SUM(CASE WHEN email=?1 AND ip=?2 THEN 1 ELSE 0 END) AS par, SUM(CASE WHEN ip=?2 THEN 1 ELSE 0 END) AS conex, SUM(CASE WHEN email=?1 THEN 1 ELSE 0 END) AS correo FROM login_fallos WHERE ts>?3").bind(email, ip, ahora - LOGIN_VENTANA).first();
  if (c && (+c.par >= 5 || +c.conex >= 20 || +c.correo >= 40)) return json({ error: "locked", message: "Demasiados intentos fallidos desde este equipo. Espera 10 minutos y vuelve a probar." }, 429);
  const row = await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first();
  const hash = await pbkdf2(pass, (row && row.pass_salt) || SAL_FALSA);
  if (!row || row.invite_token || !timingSafeEqual(hash, row.pass_hash)) {
    try {
      await env.DB.prepare("INSERT INTO login_fallos (ts, email, ip) VALUES (?1, ?2, ?3)").bind(ahora, email, ip).run();
      if (Math.random() < 0.05) await env.DB.prepare("DELETE FROM login_fallos WHERE ts<?1").bind(ahora - 3600e3).run();
    } catch (_) {}
    await logAct(env, row ? { uid: row.id, name: row.name } : null, "login_fallido", row ? email : "(correo no registrado)");
    return json({ error: "credentials" }, 401);
  }
  if (row.active === 0) { await logAct(env, { uid: row.id, name: row.name }, "login_fallido", email + " (acceso desactivado)"); return json({ error: "inactive", message: "Tu acceso está desactivado. Habla con un administrador." }, 403); }
  try { await env.DB.prepare("DELETE FROM login_fallos WHERE email=?1 AND ip=?2").bind(email, ip).run(); } catch (_) {}
  await env.DB.prepare("UPDATE users SET last_login=?1, login_count=COALESCE(login_count,0)+1, last_seen=?1, last_act=?1 WHERE id=?2").bind(ahora, row.id).run();
  await logAct(env, { uid: row.id, name: row.name }, "login", "");
  return withSession(json({ ok: true, user: Object.assign(pubUser(row), { mustChange: !!row.must_change }) }), env, row);
}

async function logoutRoute(request, env) {
  try {
    const s = await session(request, env);
    if (s) { await logAct(env, s, "logout", ""); await cierraSesion(env, request, s); }
  } catch (_) {}
  const r = json({ ok: true });
  r.headers.append("Set-Cookie", `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
  return r;
}


/* ── PORTAL DEL CLIENTE (sin sesión, con el enlace privado de su evento: boda, bautizo, comida de empresa…) ──
   LECTURA: lo celebrativo de siempre + la «foto» que la app del equipo deja en
   ev.share.portal (pasos, pagos, presupuesto, horarios, menú y la lista del
   plano). Esa foto la calcula la app con las mismas reglas que usa el equipo.
   ESCRITURA: el cliente SOLO puede guardar sus nombres y su lista de
   invitados, y eso va a una tabla aparte (novios_listas). Este endpoint no
   escribe NUNCA en el documento de la app: el presupuesto, los precios, los
   pagos y el resto del evento no se pueden tocar desde el enlace, ni siquiera
   manipulando la página. Lo que envían lo revisa el equipo y decide si lo
   pasa al plano. */
let NOVIOS_OK = false;
async function ensureNovios(env) {
  if (NOVIOS_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS novios_listas (token TEXT PRIMARY KEY, event_id TEXT NOT NULL, data TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'borrador', enviada INTEGER, updated INTEGER NOT NULL, revisada INTEGER, base TEXT)").run();
  /* «base» = la lista de la que partieron: así el equipo aplica al plano SOLO lo
     que el cliente ha cambiado, sin deshacer lo que el equipo haya tocado */
  try { await env.DB.prepare("ALTER TABLE novios_listas ADD COLUMN base TEXT").run(); } catch (_) {}
  NOVIOS_OK = true;
}
async function eventoCompartido(env, token) {
  if (!token || token.length > 80) return null;
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  let doc; try { doc = JSON.parse((row && row.data) || "{}"); } catch (_) { doc = {}; }
  const events = (doc && doc.events) || [];
  return events.find((e) => e && e.share && e.share.on && e.share.id === token) || null;
}
/* v01.80 · quien prueba enlaces al azar se queda sin poder probar más (60 fallos en 10 minutos por conexión: una red de salón o de oficina compartida no debe cortar a los clientes de verdad; cada servidor lleva su cuenta,
   así que es un freno, no una puerta cerrada: los enlaces nuevos son imposibles de adivinar) y el portal se cierra N días después
   del evento (Parámetros → Privacidad y datos; 0 = no se cierra hasta anonimizar). */
const MALOS = new Map();
function ipDe(request) { return request.headers.get("CF-Connecting-IP") || (request.headers.get("X-Forwarded-For") || "").split(",")[0].trim() || "?"; }
function demasiados(ip) { const r = MALOS.get(ip); return !!r && r.n >= 60 && Date.now() - r.t < 600e3; }
function fallo(ip) {
  const n = Date.now(); let r = MALOS.get(ip);
  if (!r || n - r.t >= 600e3) r = { n: 0, t: n };
  r.n++; MALOS.set(ip, r);
  if (MALOS.size > 2000) for (const [k, v] of MALOS) if (n - v.t >= 600e3) MALOS.delete(k);
}
function portalCerrado(ev, cfg) {
  const d = +(cfg && cfg.portalDias) || 0; if (d <= 0) return false;
  const f = ev && ev.ficha && ev.ficha.fecha; if (!/^\d{4}-\d{2}-\d{2}$/.test(f || "")) return false;
  return Math.floor((Date.parse(hoyISO() + "T00:00:00Z") - Date.parse(f + "T00:00:00Z")) / 864e5) > d;
}
async function eventoDeCliente(request, env, token, msg404) {
  const ip = ipDe(request);
  if (demasiados(ip)) return { res: json({ error: "limit", message: "Demasiados intentos con enlaces que no existen. Probad de nuevo en unos minutos." }, 429) };
  const ev = await eventoCompartido(env, token);
  if (!ev) { fallo(ip); return { res: json(msg404 ? { error: "not-found", message: msg404 } : { error: "not-found" }, 404) }; }
  let cfg = PRIV_DEF; try { cfg = await privCfg(env); } catch (_) {}
  if (portalCerrado(ev, cfg)) {
    let contacto = { tel: "", mail: "" };
    try { const pt = ((((await corDoc(env)).params || {}).sec || {}).portal || {}).data || {}; contacto = { tel: String(pt.tel || "").slice(0, 40), mail: String(pt.mail || "").slice(0, 120) }; } catch (_) {}
    return { res: json({ error: "caducado", message: "Este portal ya está cerrado: pasaron más de " + cfg.portalDias + " días desde el evento.", contacto }, 410) };
  }
  return { ev, cfg };
}
/* los enlaces antiguos (cortos) se pueden ver, pero para editar hace falta uno
   nuevo y largo, imposible de adivinar */
function tokenFuerte(t) { return typeof t === "string" && t.length >= 24; }
function hoyISO() { return new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10); }  /* hora de España (aprox.) */

async function shareRoute(request, env, url) {
  const token = (url.searchParams.get("t") || "").trim();
  if (!token) return json({ error: "not-found" }, 404);
  const ac = await eventoDeCliente(request, env, token); if (ac.res) return ac.res;
  const ev = ac.ev;
  const F = ev.ficha || {};
  const counts = countPlano(ev.text || "");
  const pub = {
    tipo: F.tipo || "Evento",
    title: ev.name || "",
    fecha: F.fecha || "",
    ubicacion: F.ubicacion || "",
    parejaA: F.parejaA || "",
    parejaB: F.parejaB || "",
    ceremoniaLugar: F.ceremoniaLugar || "",
    ceremoniaHora: F.ceremoniaHora || "",
    ceremoniaDur: F.ceremoniaDur || "",
    llegadaRest: F.llegadaRest || "",
    foto: F.foto || "",
    invitados: counts.invitados,
    mesas: counts.mesas,
    dishes: (ev.menu && ev.menu.dishes) || {},
    fotos: Array.isArray(ev.fotos) ? ev.fotos.slice(0, 30) : []
  };
  let lista = null;
  try {
    await ensureNovios(env);
    const r = await env.DB.prepare("SELECT data, estado, enviada, updated, revisada FROM novios_listas WHERE token=?").bind(token).first();
    if (r) { let d = null; try { d = JSON.parse(r.data); } catch (_) {} lista = { data: d, estado: r.estado, enviada: r.enviada, updated: r.updated, revisada: r.revisada }; }
  } catch (_) {}
  let priv = null;
  try { const c = ac.cfg; priv = { responsable: c.responsable, nif: c.nif, direccion: c.direccion, email: c.email, meses: c.meses, dniDias: c.dniDias, v: PRIV_V }; } catch (_) {}
  let ext = {}; try { ext = await porDatos(env, ev); } catch (_) {}
  return json({ event: pub, portal: (ev.share && ev.share.portal) || null, lista, editable: tokenFuerte(token), hoy: hoyISO(), priv, aprob: ext.estado || null, msgs: ext.msgs || [], arch: ext.arch || [], minuta: ext.minuta || null, docs: ext.docs || [] });
}

/* limpieza de lo que escriben: sin saltos de línea ni los signos que usa el
   plano para mesas, marcas y separar personas */
function limpio(v, n) { return String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/[()\[\]|#@*+&]/g, " ").replace(/\s+/g, " ").trim().slice(0, n); }
const TIPOS_G = ["adulto", "nino", "bebe", "staff"];
function listaLimpia(b) {
  if (!b || typeof b !== "object") return null;
  const mesasIn = Array.isArray(b.mesas) ? b.mesas.slice(0, 80) : [];
  let total = 0;
  const mesas = mesasIn.map((m) => {
    const g = (Array.isArray(m && m.g) ? m.g : []).slice(0, 40).map((x) => ({
      n: limpio(x && x.n, 70),
      t: TIPOS_G.indexOf(x && x.t) > -1 ? x.t : "adulto",
      a: limpio(x && x.a, 90)
    })).filter((x) => x.n || x.a);
    total += g.length;
    return { k: m && Number.isFinite(+m.k) && +m.k > 0 ? Math.floor(+m.k) : null, nombre: limpio(m && m.nombre, 50), staff: !!(m && m.staff), g };
  });
  if (total > 1200) return null;
  return { parejaA: limpio(b.parejaA, 60), parejaB: limpio(b.parejaB, 60), mesas };
}
async function sharePost(request, env, url) {
  const token = (url.searchParams.get("t") || "").trim();
  if (!tokenFuerte(token)) return json({ error: "old-link", message: "Este enlace es antiguo. Pedid a Les Moles uno nuevo para poder editar." }, 403);
  const ac = await eventoDeCliente(request, env, token, "Este enlace ya no está activo."); if (ac.res) return ac.res;
  const ev = ac.ev;
  const portal = (ev.share && ev.share.portal) || {};
  if (portal.cierre && hoyISO() >= portal.cierre) return json({ error: "cerrado", message: "Los cambios ya están cerrados. Para cualquier cambio, llamad a Les Moles." }, 423);
  const txt = await request.text();
  if (!txt || txt.length > 200000) return json({ error: "too-big", message: "La lista es demasiado grande." }, 413);
  let b; try { b = JSON.parse(txt); } catch (_) { return json({ error: "bad-json" }, 400); }
  /* SOLO se leen nombres y lista; cualquier otro campo (presupuesto, pagos, precios…) se ignora */
  const data = listaLimpia(b);
  if (!data) return json({ error: "too-big", message: "Demasiadas personas en la lista." }, 413);
  const enviar = !!(b && b.enviar), now = Date.now();
  await ensureNovios(env);
  const prev = await env.DB.prepare("SELECT estado, enviada, base, data FROM novios_listas WHERE token=?").bind(token).first();

  /* la base es de lo que partieron: mientras editan (borrador/enviada) se
     conserva; si el equipo ya la pasó al plano, es lo aplicado, salvo que
     acaben de abrir el portal (nuevo): entonces es lo que vieron al abrirlo */
  const sigue = prev && prev.base && (prev.estado === "borrador" || prev.estado === "enviada" || (prev.estado === "aplicada" && !(b && b.nuevo)));
  let base = sigue ? prev.base : null;
  if (!base) { const bb = listaLimpia(b && b.base); base = JSON.stringify(bb || data); }
  /* las alergias son datos de salud: las que escribe el cliente (las que no estaban ya en la lista de partida del equipo) solo se guardan si ha aceptado
     el tratamiento; queda apuntado cuándo y con qué versión del aviso */
  let consent = null;
  try { const pd = prev && prev.data ? JSON.parse(prev.data) : null; if (pd && pd.consent && pd.consent.v === PRIV_V) consent = pd.consent; } catch (_) {}
  if (b && b.consent === true && !consent) consent = { ts: now, v: PRIV_V };
  const alergiasDe = (l) => { const o = {}; ((l && l.mesas) || []).forEach((m) => (m.g || []).forEach((x) => { const a = normTxt(x.a || "").trim(); if (a) o[a] = 1; })); return o; };
  let baseL = null; try { baseL = JSON.parse(base); } catch (_) {}
  const baseA = alergiasDe(baseL), nuevasA = Object.keys(alergiasDe(data)).filter((a) => !baseA[a]);
  if (PRIV_EXIGIR && nuevasA.length && !consent) return json({ error: "consent", message: "Para guardar alergias o dietas hay que aceptar el tratamiento de esos datos (casilla de privacidad)." }, 400);
  if (consent) data.consent = consent;
  const estado = enviar ? "enviada" : (prev && prev.estado === "enviada" ? "enviada" : "borrador");
  const enviada = enviar ? now : (prev ? prev.enviada : null);
  await env.DB.prepare("INSERT INTO novios_listas (token, event_id, data, estado, enviada, updated, revisada, base) VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL, ?7) ON CONFLICT(token) DO UPDATE SET event_id=?2, data=?3, estado=?4, enviada=?5, updated=?6, base=?7")
    .bind(token, String(ev.id), JSON.stringify(data), estado, enviada, now, base).run();
  return json({ ok: true, estado, enviada, updated: now });
}

/* ── lo que ve el equipo: listas del cliente pendientes de revisar ── */
async function propuestasList(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  /* trae nombres, alergias y el enlace privado de cada cliente: solo quien puede aplicarlas (igual que el PATCH) */
  if (s.role !== "admin" && s.role !== "eventos") return json({ error: "forbidden" }, 403);
  await ensureNovios(env);
  const { results } = await env.DB.prepare("SELECT token, event_id, data, estado, enviada, updated, revisada, base FROM novios_listas ORDER BY updated DESC LIMIT 300").all();
  return json({ listas: (results || []).map((r) => { let d = null, bs = null; try { d = JSON.parse(r.data); } catch (_) {} try { bs = r.base ? JSON.parse(r.base) : null; } catch (_) {}
    return { token: r.token, event_id: r.event_id, data: d, base: bs, estado: r.estado, enviada: r.enviada, updated: r.updated, revisada: r.revisada }; }) });
}
async function propuestasPatch(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (s.role !== "admin" && s.role !== "eventos") return json({ error: "forbidden" }, 403);
  const b = await body(request);
  const token = String(b.token || ""), estado = String(b.estado || "");
  if (!token || ["aplicada", "descartada", "enviada"].indexOf(estado) < 0) return json({ error: "invalid" }, 400);
  await ensureNovios(env);
  /* «aplicada» con la versión que se ha leído: si los novios han vuelto a
     guardar entretanto, o otra pestaña del equipo ya la ha aplicado, no se
     marca (claimed:false) y esa lista se aplicará en la siguiente vuelta.
     Al aplicarla, su lista pasa a ser la base de los próximos cambios. */
  const now = Date.now();
  let r;
  if (estado === "aplicada") {
    if (b.updated != null) r = await env.DB.prepare("UPDATE novios_listas SET estado='aplicada', revisada=?, base=data WHERE token=? AND updated=? AND estado IN ('borrador','enviada')").bind(now, token, +b.updated).run();
    else r = await env.DB.prepare("UPDATE novios_listas SET estado='aplicada', revisada=?, base=data WHERE token=?").bind(now, token).run();
  } else r = await env.DB.prepare("UPDATE novios_listas SET estado=?, revisada=? WHERE token=?").bind(estado, now, token).run();
  const changes = (r && r.meta && r.meta.changes != null) ? r.meta.changes : 1;
  return json({ ok: true, claimed: changes > 0 });
}
/* Cuenta invitados y mesas del texto del plano SIN exponer los nombres, con
   las mismas reglas que el plano de la app: cabeceras «M1 |», «MESA 1»,
   «TAULA 3», «MESA PRESIDENCIAL», «[4]», «5 |»…; varias personas en una línea
   con «+» o «&»; y la mesa de STAFF / PERSONAL no cuenta como invitados. */
const SHAPE_RX = /(presidencial|presidencia|novios|nuvis|honor|rectangular|rectangle|rect|larga|llarga|imperial|alargad|cuadrad|quadra|square|ovalad|oval|eliptica|redond|rodon|rodo|round|circular|redona)/;
function normTxt(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function isHeader(s) {
  let m;
  if (/^\[(\d+)\]/.test(s)) return { rest: s.replace(/^\[\d+\]\s*/, "") };
  if ((m = s.match(/^(?:mesa|taula|table)\b\s*(?:n[º°o]?\.?\s*(?=\d))?(\d+)?\s*(.*)$/i))) return { rest: m[2] };
  if ((m = s.match(/^[mt]\s*\d+\s*(?:[|·:\-\/]\s*(.*))?$/i))) return { rest: m[1] || "" };
  if ((m = s.match(/^[mt]\s*\d+\s+(.+)$/i))) return { rest: m[1] };
  if ((m = s.match(/^\d+\s*[|·]\s*(.*)$/))) return { rest: m[1] };
  if ((m = s.match(/^\d+\s*[)\.:]\s*(.*)$/)) && (!m[1].trim() || SHAPE_RX.test(normTxt(m[1])) || /^\d+\s*$/.test(m[1].trim()))) return { rest: m[1] };
  return null;
}
function peopleIn(line) {
  let n = 1, d = 0;
  for (const ch of line) { if (ch === "(" || ch === "[") d++; else if (ch === ")" || ch === "]") d--; else if (d === 0 && (ch === "+" || ch === "&")) n++; }
  return n;
}
function countPlano(text) {
  let invitados = 0, mesas = 0, staff = false, implicit = false;
  (text || "").split(/\r?\n/).forEach((ln) => {
    const t = ln.trim();
    if (!t || /^[#@]/.test(t) || /^\/\//.test(t)) return;
    const h = isHeader(t);
    if (h) { mesas++; staff = /(\bstaff\b|personal)/.test(normTxt(h.rest)); return; }
    if (!mesas && !implicit) { mesas++; implicit = true; }
    if (!staff) invitados += peopleIn(t.replace(/^\s*[-–•]\s+/, ""));
  });
  return { invitados, mesas };
}

/* ── almacén compartido ─────────────────────────────────────────────────
   Varias personas trabajan a la vez: cada navegador sube SU copia entera, pero
   el servidor no la pega encima de lo que hay, sino que la JUNTA con lo guardado
   con las mismas reglas que ya usa la app entre pestañas:
   · eventos: uno a uno, gana el cambio más reciente («updated»);
   · borrados: se recuerdan (store.borrados = {id: cuándo}) para que una copia
     vieja no resucite un evento que otra persona ha borrado; si el evento se
     vuelve a tocar DESPUÉS del borrado (deshacer), vuelve;
   · inventario, extras, camareros y Previsión: artículo a artículo;
   · parámetros: sección a sección y solo los cambia un administrador.
   Se escribe con control de versión (la columna «updated»): si otra persona ha
   guardado entre la lectura y la escritura, se vuelve a juntar y a intentar. */
async function storeGet(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  const row = await env.DB.prepare("SELECT data, updated FROM store WHERE id=1").first();
  const data = row && row.data ? row.data : JSON.stringify({ events: [], active: null, prefs: {} });
  return new Response(data, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Store-Version": String((row && row.updated) || 0) } });
}

/* v02.00 · tope y orden del documento. D1 no guarda una fila de más de 2 MB: pasado ese punto TODOS los guardados fallarían. Por eso:
   · una petición de más de 6 MB ni se lee;
   · por encima de ~1,9 MB no se acepta un guardado que haga crecer el documento (los que lo reducen sí: así se puede limpiar) y se dice por qué;
   · a partir de 1,4 MB cada guardado avisa de que se acerca el límite;
   · solo entran las claves que la app usa (una clave inventada ya no se queda para siempre) y cada evento tiene que traer un identificador. */
const STORE_MAX = 1900000, STORE_AVISO = 1400000, STORE_PET_MAX = 6e6;
const DOC_CLAVES = ["events", "active", "prefs", "borrados", "inventario", "invExtra", "camareros", "compras", "prevision", "params", "fotos"];
const DOC_OBJETOS = ["prefs", "borrados", "inventario", "invExtra", "camareros", "compras", "prevision", "params", "fotos"];
const CLAVES_AVISADAS = new Set();
function saneaDoc(inc) {
  const quita = [];
  Object.keys(inc).forEach((k) => { if (DOC_CLAVES.indexOf(k) < 0) { quita.push(k); delete inc[k]; } });
  DOC_OBJETOS.forEach((k) => { if (inc[k] !== undefined && (!inc[k] || typeof inc[k] !== "object" || Array.isArray(inc[k]))) delete inc[k]; });
  if (inc.active !== undefined && inc.active !== null && typeof inc.active !== "string") delete inc.active;
  if (Array.isArray(inc.events)) inc.events = inc.events.filter((e) => e && typeof e === "object" && !Array.isArray(e) && ((typeof e.id === "string" && e.id.length > 0 && e.id.length <= 80) || (typeof e.id === "number" && isFinite(e.id))));
  if (inc.borrados) Object.keys(inc.borrados).forEach((k) => { if (!(+inc.borrados[k] > 0)) delete inc.borrados[k]; });
  return quita;
}
async function storePut(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (+(request.headers.get("Content-Length") || 0) > STORE_PET_MAX) return json({ error: "too-big", message: "Los cambios son demasiado grandes para guardarlos de una vez." }, 413);
  const txt = await request.text();
  if (!txt) return json({ error: "empty" }, 400);
  if (txt.length > STORE_PET_MAX) return json({ error: "too-big", message: "Los cambios son demasiado grandes para guardarlos de una vez." }, 413);
  let incoming;
  try { incoming = JSON.parse(txt); } catch (_) { return json({ error: "bad-json" }, 400); }
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) return json({ error: "bad-doc" }, 400);
  if (incoming.events !== undefined && !Array.isArray(incoming.events)) return json({ error: "bad-doc" }, 400);
  const raras = saneaDoc(incoming).filter((k) => !CLAVES_AVISADAS.has(k));
  if (raras.length) { raras.forEach((k) => CLAVES_AVISADAS.add(k)); await logError(env, "servidor", "guardado de documento", "Se han descartado claves que la app no usa: " + raras.slice(0, 8).join(", "), s); }
  const base = +(request.headers.get("X-Store-Base") || 0);
  /* borrar eventos: solo administración y eventos (cocina, compras y servicio no pueden borrar nada, ni por error) */
  if (s.role !== "admin" && s.role !== "eventos") incoming.borrados = {};
  /* _tb = el texto del plano que tenía quien envía antes de editarlo (sirve para juntar líneas; no se guarda) y sellos con hora razonable */
  const tbs = {}, ya = Date.now();
  (Array.isArray(incoming.events) ? incoming.events : []).forEach((e) => {
    if (!e || typeof e !== "object") return;
    if (typeof e._tb === "string") tbs[e.id] = e._tb;
    delete e._tb;
    /* la hora de «última modificación» no puede ser del futuro: con una falsa el historial deja de anotar y el evento no se podría borrar */
    if (!(+e.updated > 0)) delete e.updated; else if (+e.updated > ya + 600e3) e.updated = ya;
    if (e._k && typeof e._k === "object") Object.keys(e._k).forEach((k) => { const t = +e._k[k]; if (!(t > 0)) delete e._k[k]; else if (t > ya + 600e3) e._k[k] = ya; });
    else if (e._k !== undefined) delete e._k;
  });
  for (let intento = 0; intento < 6; intento++) {
    const row = await env.DB.prepare("SELECT data, updated FROM store WHERE id=1").first();
    let prev = {}; try { prev = JSON.parse((row && row.data) || "{}") || {}; } catch (_) { prev = {}; }
    const antes = row ? (+row.updated || 0) : 0;
    const merged = mergeDoc(prev, incoming, s.role === "admin", tbs);
    kPoda(merged, Date.now());
    const out = JSON.stringify(merged);
    const bytes = enc.encode(out).length;
    if (bytes > STORE_MAX && bytes >= enc.encode((row && row.data) || "").length) return json({ error: "too-big", bytes, limite: STORE_MAX, message: "El documento de eventos está lleno (" + (bytes / 1e6).toFixed(1).replace(".", ",") + " MB de " + (STORE_MAX / 1e6).toFixed(1).replace(".", ",") + "): no se pueden guardar más cambios que lo hagan crecer. Un administrador debe anonimizar o quitar eventos antiguos (Parámetros → Privacidad y datos)." }, 413);
    let v = Date.now(); if (v <= antes) v = antes + 1;
    let r;
    if (row) r = await env.DB.prepare("UPDATE store SET data=?1, updated=?2 WHERE id=1 AND updated=?3").bind(out, v, antes).run();
    else r = await env.DB.prepare("INSERT OR IGNORE INTO store (id, data, updated) VALUES (1, ?1, ?2)").bind(out, v).run();
    const ch = r && r.meta && r.meta.changes != null ? r.meta.changes : 1;
    /* otros = alguien había guardado algo que este navegador aún no tenía */
    if (ch > 0) {
      try { await hiTrasGuardar(env, s, prev, merged); } catch (e1) { await logError(env, "servidor", "historial al guardar", String(e1 && e1.message || e1), s); }
      try { await bkTrasGuardar(env, s, row, prev, merged); } catch (e2) { await logError(env, "servidor", "copia automática al guardar", String(e2 && e2.message || e2), s); }
      return json({ ok: true, v, otros: !!(antes && base && antes !== base) || (!base && !!antes), bytes, aviso: bytes > STORE_AVISO });
    }
  }
  return json({ error: "busy", message: "Muchos guardados a la vez; se reintentará." }, 409);
}

/* ── ERRORES Y SALUD DEL SISTEMA ────────────────────────────────────────────
   Todo error del servidor (y los que avisa la propia app) se apunta aquí para
   enterarse antes de que lo note un camarero. /api/health es para un vigilante
   externo; /api/estado, la pantalla del administrador. */
let ER_OK = false;
async function ensureErrores(env) {
  if (ER_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS errores (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, origen TEXT NOT NULL, donde TEXT, msg TEXT, uid TEXT, name TEXT)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS errores_ts ON errores (ts)").run();
  ER_OK = true;
}
/* nunca debe hacer fallar lo que se estaba haciendo */
async function logError(env, origen, donde, msg, s) {
  try {
    await ensureErrores(env);
    const ahora = Date.now();
    await env.DB.prepare("INSERT INTO errores (ts, origen, donde, msg, uid, name) VALUES (?1, ?2, ?3, ?4, ?5, ?6)")
      .bind(ahora, origen, String(donde || "").slice(0, 160), String(msg || "").slice(0, 400), (s && s.uid) || "", (s && (s.name || s.email)) || "").run();
    if (Math.random() < 0.02) await env.DB.prepare("DELETE FROM errores WHERE ts < ?1 OR id NOT IN (SELECT id FROM errores ORDER BY id DESC LIMIT 500)").bind(ahora - 60 * 864e5).run();
  } catch (_) {}
}
async function healthRoute(env) {
  let dbOk = false;
  try { const r = await env.DB.prepare("SELECT 1 AS x").first(); dbOk = !!(r && r.x === 1); } catch (_) {}
  return json({ ok: dbOk, ts: Date.now() }, dbOk ? 200 : 503, { "Cache-Control": "no-store" });
}
async function errorPost(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  await ensureErrores(env);
  const b = await body(request), msg = String(b.msg || "").slice(0, 400);
  if (!msg) return json({ error: "invalid" }, 400);
  /* como mucho 30 avisos por minuto en total: un fallo en bucle no llena la base de datos */
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM errores WHERE origen='app' AND ts>?1").bind(Date.now() - 60e3).first();
  if (r && r.n >= 30) return json({ ok: true, limitado: true });
  await logError(env, "app", String(b.src || "").slice(0, 80) + (b.v ? " · v" + String(b.v).slice(0, 10) : ""), msg, s);
  return json({ ok: true });
}
const DOC_LIMITE = 2000000;
async function estadoRoute(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  await ensureUsers(env); await ensureBackups(env); await ensureHistorial(env); await ensurePlanos(env); await ensureErrores(env); await ensureNovios(env);
  const ahora = Date.now(), q = async (sql, ...p) => { try { return await env.DB.prepare(sql).bind(...p).first(); } catch (_) { return null; } };
  const st = await q("SELECT updated, LENGTH(CAST(data AS BLOB)) AS bytes FROM store WHERE id=1");
  let eventos = 0, anon = 0;
  try { const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first(); const d = JSON.parse((row && row.data) || "{}"); (d.events || []).forEach((e) => { eventos++; if (e && e.anonimizado) anon++; }); } catch (_) {}
  const bk = await q("SELECT COUNT(*) AS n, MAX(ts) AS ult, COALESCE(SUM(bytes),0) AS b FROM backups");
  const bkAuto = await q("SELECT MAX(ts) AS ult FROM backups WHERE kind='auto'");
  const hi = await q("SELECT COUNT(*) AS n, COALESCE(SUM(LENGTH(gz)),0) AS b FROM historial");
  const pa = await q("SELECT COUNT(*) AS n FROM papelera");
  const pl = await q("SELECT COUNT(*) AS n, COALESCE(SUM(LENGTH(src)),0) AS b FROM planos WHERE del=0");
  const us = await q("SELECT COUNT(*) AS n, COALESCE(SUM(CASE WHEN COALESCE(active,1)=1 THEN 1 ELSE 0 END),0) AS act FROM users");
  const nv = await q("SELECT COUNT(*) AS n, COALESCE(SUM(CASE WHEN estado IN ('borrador','enviada') THEN 1 ELSE 0 END),0) AS pen FROM novios_listas");
  const eh = await q("SELECT COUNT(*) AS n FROM errores WHERE ts>?1", ahora - 3600e3);
  const ed = await q("SELECT COUNT(*) AS n FROM errores WHERE ts>?1", ahora - 864e5);
  const et = await q("SELECT COUNT(*) AS n FROM errores");
  await ensureCorreo(env);
  await ensurePortal(env);
  await ensureDocs(env);
  const po0 = await q("SELECT COUNT(*) AS n, COALESCE(SUM(bytes),0) AS b FROM portal_arch");
  const dc = await q("SELECT COUNT(*) AS n, COALESCE(SUM(bytes),0) AS b FROM evento_docs");
  const po = { n: ((po0 && po0.n) || 0) + ((dc && dc.n) || 0), b: ((po0 && po0.b) || 0) + ((dc && dc.b) || 0) };
  const co = await q("SELECT COALESCE(SUM(CASE WHEN (estado='error' AND ts>?1) OR (entrega IN ('bounced','complained','failed','suppressed') AND ts>?2) THEN 1 ELSE 0 END),0) AS err, COALESCE(SUM(CASE WHEN estado='enviado' AND ts>?2 THEN 1 ELSE 0 END),0) AS ok7, COALESCE(SUM(CASE WHEN estado='simulado' AND ts>?2 THEN 1 ELSE 0 END),0) AS sim7 FROM outbox", ahora - 864e5, ahora - 7 * 864e5);
  const { results } = await env.DB.prepare("SELECT ts, origen, donde, msg, name FROM errores ORDER BY id DESC LIMIT 25").all();
  const ult = st ? +st.updated : 0, bytes = st ? +st.bytes : 0, pct = Math.round(bytes / DOC_LIMITE * 100);
  const avisos = [];
  const add = (nivel, txt, ayuda) => avisos.push({ nivel, txt, ayuda: ayuda || "" });
  if (pct >= 90) add("mal", "El documento de eventos ocupa el " + pct + " % del límite de la base de datos.", "Hay que pasar a guardar cada evento por separado antes de que deje de guardar. Avisa a quien lleva la herramienta.");
  else if (pct >= 70) add("aviso", "El documento de eventos ocupa el " + pct + " % del límite de la base de datos (" + Math.round(bytes / 1024) + " KB de " + Math.round(DOC_LIMITE / 1024) + " KB).", "Aún hay margen. Conviene anonimizar eventos antiguos (Parámetros → Privacidad) y planificar guardar cada evento por separado.");
  if (!bkAuto || !bkAuto.ult) add("aviso", "Todavía no hay ninguna copia automática.", "Se hace sola al guardar cambios; si sigue sin salir, avisa.");
  else if (ult && ult - bkAuto.ult > 36 * 3600e3 && ahora - ult < 36 * 3600e3) add("aviso", "La última copia automática tiene más de un día y se ha trabajado desde entonces.", "Haz una copia ahora en Parámetros → Copias de seguridad.");
  if (eh && eh.n > 0) add("mal", eh.n + (eh.n === 1 ? " error en la última hora." : " errores en la última hora."), "Mira el detalle más abajo; si se repite, envíalo a quien lleva la herramienta.");
  else if (ed && ed.n > 0) add("aviso", ed.n + (ed.n === 1 ? " error en las últimas 24 horas." : " errores en las últimas 24 horas."), "");
  if (po && po.b > 250e6) add("aviso", "Las fotos y logos que mandan los clientes ocupan " + Math.round(po.b / 1e6) + " MB.", "La base de datos gratuita admite 500 MB en total. Anonimiza eventos antiguos (Parámetros → Privacidad) para liberar espacio.");
  if (co && co.err > 0) add("aviso", co.err + (co.err === 1 ? " correo no ha salido o no ha llegado" : " correos no han salido o no han llegado") + " (últimas 24 horas; rebotes, de la última semana).", "Míralo en la bandeja de «Avisos y correo»; se puede reintentar desde ahí.");
  if (!avisos.length) add("ok", "Todo en orden: sin errores recientes, con copias al día y espacio de sobra.", "");
  return json({
    ahora,
    doc: { bytes, limite: DOC_LIMITE, pct, eventos, anonimizados: anon, ultimoGuardado: ult },
    copias: { n: bk ? bk.n : 0, ultima: bk ? bk.ult : null, ultimaAuto: bkAuto ? bkAuto.ult : null, bytes: bk ? bk.b : 0 },
    historial: { filas: hi ? hi.n : 0, bytes: hi ? hi.b : 0 }, papelera: pa ? pa.n : 0,
    planos: { n: pl ? pl.n : 0, bytes: pl ? pl.b : 0 },
    usuarios: { total: us ? us.n : 0, activos: us ? us.act : 0 },
    listasCliente: { total: nv ? nv.n : 0, pendientes: nv ? nv.pen : 0 },
    portal: { archivos: po ? po.n : 0, bytes: po ? po.b : 0 },
    correo: { errores24h: co ? co.err : 0, enviados7d: co ? co.ok7 : 0, simulados7d: co ? co.sim7 : 0, listo: corProveedor(env).listo },
    errores: { ultimaHora: eh ? eh.n : 0, hoy: ed ? ed.n : 0, total: et ? et.n : 0, recientes: (results || []).map((r) => ({ ts: +r.ts, origen: r.origen, donde: r.donde || "", msg: r.msg || "", name: r.name || "" })) },
    avisos
  });
}
async function estadoLimpiar(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  await ensureErrores(env);
  await env.DB.prepare("DELETE FROM errores").run();
  await logAct(env, a.s, "errores_vaciados", "Se vació el registro de errores");
  return json({ ok: true });
}

/* ── PRIVACIDAD Y DATOS PERSONALES (RGPD) ────────────────────────────────────
   · Responsable del tratamiento y plazo de conservación (los pone el administrador).
   · Anonimizar eventos pasados el plazo: fuera nombres de invitados y del cliente,
     contactos, alergias y comunicaciones; quedan cifras (mesas, personas por tipo,
     importes) para estadísticas. También se borran su historial, papelera, listas
     del cliente y planos propios. Las copias de seguridad automáticas se renuevan
     solas (como mucho ~3 meses); las manuales las borra el administrador.
   · Derecho de acceso/supresión: buscar a una persona en todos los eventos y quitarla. */
const PRIV_V = 1;
/* se exige la casilla de consentimiento para guardar alergias en el portal del cliente (la app del portal ya la trae) */
const PRIV_EXIGIR = true;
const PRIV_DEF = { responsable: "", nif: "", direccion: "", email: "", meses: 12, auto: false, dniDias: 90, portalDias: 30, copiasDias: 365 };
const PRIV_COPIAS_DIAS = [0, 90, 180, 365];   /* días que se guardan las copias HECHAS A MANO (las automáticas, 84); 0 = no caducan */
const PRIV_PORTAL_DIAS = [0, 7, 15, 30, 60, 90, 180];   /* días después del evento en que se cierra el portal; 0 = no se cierra */
const PRIV_DNI_DIAS = [0, 30, 60, 90, 180];   /* 0 = solo al anonimizar el evento */
const PRIV_MESES = [6, 12, 18, 24, 36, 60];
async function privCfg(env) {
  await ensureUsers(env);
  const r = await env.DB.prepare("SELECT v FROM meta WHERE k='privacidad'").first();
  let c = {}; try { c = r ? JSON.parse(r.v) || {} : {}; } catch (_) {}
  const o = Object.assign({}, PRIV_DEF, c);
  if (PRIV_MESES.indexOf(+o.meses) < 0) o.meses = PRIV_DEF.meses;
  o.meses = +o.meses; o.auto = !!o.auto;
  if (PRIV_DNI_DIAS.indexOf(+o.dniDias) < 0) o.dniDias = PRIV_DEF.dniDias;
  o.dniDias = +o.dniDias;
  if (PRIV_PORTAL_DIAS.indexOf(+o.portalDias) < 0) o.portalDias = PRIV_DEF.portalDias;
  o.portalDias = +o.portalDias;
  if (PRIV_COPIAS_DIAS.indexOf(+o.copiasDias) < 0) o.copiasDias = PRIV_DEF.copiasDias;
  o.copiasDias = +o.copiasDias;
  return o;
}
function mesesDesde(fechaISO, ahora) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaISO || ""); if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])), n = new Date(ahora);
  return (n.getUTCFullYear() - d.getUTCFullYear()) * 12 + (n.getUTCMonth() - d.getUTCMonth()) - (n.getUTCDate() < d.getUTCDate() ? 1 : 0);
}
function elegibles(doc, meses, ahora) {
  return (doc.events || []).filter((e) => e && e.id && !e.anonimizado && e.ficha && e.ficha.fecha && mesesDesde(e.ficha.fecha, ahora) >= meses)
    .map((e) => ({ id: e.id, name: e.name || "", fecha: e.ficha.fecha, meses: mesesDesde(e.ficha.fecha, ahora) }))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
}
async function privGet(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  const cfg = await privCfg(env), ahora = Date.now();
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  let doc = {}; try { doc = JSON.parse((row && row.data) || "{}") || {}; } catch (_) {}
  const u = await env.DB.prepare("SELECT v FROM meta WHERE k='priv_ultima'").first(); let ultima = null; try { ultima = u ? JSON.parse(u.v) : null; } catch (_) {}
  /* los portales con enlace antiguo y corto (de antes de la v01.60): solo dejan mirar, pero son más fáciles de adivinar que los nuevos */
  const cortos = (doc.events || []).filter((e) => e && e.share && e.share.on && String(e.share.id || "").length < 24).map((e) => ({ id: e.id, name: e.name || "", fecha: (e.ficha && e.ficha.fecha) || "" }));
  return json({ cfg, v: PRIV_V, elegibles: elegibles(doc, cfg.meses, ahora), anonimizados: (doc.events || []).filter((e) => e && e.anonimizado).length, eventos: (doc.events || []).length, ultima, cortos });
}
async function privPut(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  await ensureUsers(env);
  const b = await body(request), t = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
  const meses = +b.meses;
  if (PRIV_MESES.indexOf(meses) < 0) return json({ error: "invalid", message: "Plazo no válido." }, 400);
  const email = t(b.email, 120);
  if (email && !validEmail(email.toLowerCase())) return json({ error: "invalid", message: "El correo de privacidad no es válido." }, 400);
  const dniDias = b.dniDias === undefined ? PRIV_DEF.dniDias : +b.dniDias;
  if (PRIV_DNI_DIAS.indexOf(dniDias) < 0) return json({ error: "invalid", message: "Plazo de los documentos de identidad no válido." }, 400);
  const portalDias = b.portalDias === undefined ? PRIV_DEF.portalDias : +b.portalDias;
  if (PRIV_PORTAL_DIAS.indexOf(portalDias) < 0) return json({ error: "invalid", message: "Plazo de cierre del portal no válido." }, 400);
  const copiasDias = b.copiasDias === undefined ? PRIV_DEF.copiasDias : +b.copiasDias;
  if (PRIV_COPIAS_DIAS.indexOf(copiasDias) < 0) return json({ error: "invalid", message: "Plazo de las copias de seguridad no válido." }, 400);
  const cfg = { responsable: t(b.responsable, 140), nif: t(b.nif, 30), direccion: t(b.direccion, 200), email, meses, auto: !!b.auto, dniDias, portalDias, copiasDias };
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('privacidad', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(cfg)).run();
  await logAct(env, a.s, "privacidad", "Plazo de conservación: " + meses + " meses" + (cfg.auto ? " · anonimizar sola" : "") + " · documentos de identidad: " + (dniDias ? dniDias + " días tras el evento" : "al anonimizar") + " · portal del cliente: " + (portalDias ? "se cierra a los " + portalDias + " días del evento" : "no se cierra"));
  return json({ ok: true, cfg });
}
/* fuera datos personales de un evento (el resto de cifras se queda) */
function anonTexto(text) {
  let mesas = 0, n = 0;
  return String(text || "").split(/\r?\n/).map((ln) => {
    const t = ln.trim();
    if (!t) return "";
    if (/^#/.test(t)) return "# EVENTO ANONIMIZADO";
    if (/^@/.test(t)) return ln;
    if (/^\/\//.test(t)) return "";
    const h = isHeader(t);
    if (h) {
      mesas++; const r = normTxt(h.rest || ""), f = r.match(SHAPE_RX);
      return "MESA " + mesas + (/(\bstaff\b|personal)/.test(r) ? " | Staff" : f ? " | " + f[1] : "");
    }
    const tags = [...t.matchAll(/[\(\[]([^\)\]]*)[\)\]]/g)].map((m) => normTxt(m[1])).join(" ");
    const kind = /(trona|bebe|baby)/.test(tags) ? "(trona)" : /(nin[oa]|nen[ao]?|child|kid|infantil)/.test(tags) ? "(niño)" : /(staff|personal)/.test(tags) ? "(staff)" : "";
    const k = peopleIn(t.replace(/^\s*[-–•]\s+/, "")), pers = [];
    for (let i = 0; i < k; i++) { n++; pers.push("Invitado " + n + (kind && (k === 1 || i === k - 1) ? " " + kind : "")); }
    return pers.join(" + ");
  }).join("\n");
}
/* v02.01 · LISTA BLANCA: de un evento anonimizado solo se conserva lo que sirve para las cifras (fecha, tipo, mesas y personas por tipo, menú elegido,
   importes, horas de servicio, geometría del salón). Todo lo demás (comunicaciones, documentos, contrato, logo, diseños de minuta y de seatings,
   tareas, notas…) se quita, también lo que se añada en versiones futuras. Después se barre lo que queda: cualquier texto que repita un nombre, un
   teléfono, un correo o un documento de identidad del evento se sustituye entero. */
const ANON_EV = ["id", "name", "text", "updated", "_k", "loc", "plans", "mesaGeo", "montaje", "numV2", "fitV1", "tplFixed", "tplFixed2", "userSize", "prevId", "alta", "ficha", "presupuesto", "menu",
  "camareros", "camarerosAlta", "camarerosAvisar", "camarerosBaja", "camarerosHora", "reparto", "agendaHecho", "pedidos", "recepcion", "cierre", "cierreServicio", "turnos", "aprobaciones", "share", "anonimizado"];
const ANON_FICHA = ["tipo", "estado", "ubicacion", "fecha", "ceremoniaLugar", "ceremoniaHora", "ceremoniaDur", "llegadaRest", "horaBriefing", "horaAperitivo", "horaBanquete", "horaBarra", "staff", "paxPrev"];
const ANON_MENU = ["adultos", "ninos", "pMesaAper", "pMesaBanq", "dishes", "bebidas", "propios", "escaleta", "bebidasExtra", "svOv"];
function necesidadesAnon(e) {
  const n = new Set(), add = (v) => { const t = normTxt(String(v == null ? "" : v)).replace(/\s+/g, " ").trim(); if (t.length >= 6 || (/\s/.test(t) && t.length >= 5)) n.add(t); };
  const F = e.ficha || {}; ["parejaA", "parejaB", "contacto", "telefono", "email", "origen", "comoNos"].forEach((k) => add(F[k]));
  const CO = e.contrato || {}; add(CO.num1); add(CO.num2); (Array.isArray(CO.nombres) ? CO.nombres : []).forEach(add);
  ["firmado", "firmado2"].forEach((k) => { const f = CO[k]; if (f) { add(f.nombre); add(f.nif); } });
  Object.keys(e.aprobaciones || {}).forEach((k) => add((e.aprobaciones[k] || {}).nombre));
  String(e.text || "").split(/\r?\n/).forEach((ln) => { const t = ln.trim(); if (!t || /^[#@]/.test(t) || /^\/\//.test(t) || isHeader(t)) return; lineaPersonas(t.replace(/^\s*[-–•]\s+/, "")).forEach((sg) => add(nombreDe(sg))); });
  return [...n];
}
/* sustituye cada texto que contenga alguno de los datos (sin tildes ni mayúsculas); «cuenta.n» dice cuántos ha cambiado */
function barreTextos(v, nd, cuenta) {
  if (typeof v === "string") { const n = normTxt(v); if (nd.some((x) => n.indexOf(x) >= 0)) { cuenta.n++; return "(anonimizado)"; } return v; }
  if (Array.isArray(v)) return v.map((x) => barreTextos(x, nd, cuenta));
  if (v && typeof v === "object") { const o = {}; Object.keys(v).forEach((k) => { o[k] = barreTextos(v[k], nd, cuenta); }); return o; }
  return v;
}
function anonEvento(e, ahora) {
  const src = JSON.parse(JSON.stringify(e)), nd = necesidadesAnon(src), c = {};
  ANON_EV.forEach((k) => { if (src[k] !== undefined) c[k] = src[k]; });
  const F0 = src.ficha || {}, F = c.ficha = {};
  ANON_FICHA.forEach((k) => { if (F0[k] !== undefined) F[k] = F0[k]; });
  const f = F.fecha ? F.fecha.split("-").reverse().join("/") : "";
  c.name = "Evento anonimizado" + (f ? " · " + f : "");
  c.text = anonTexto(src.text);
  F.estado = "cerrada";
  if (c.menu) { const M0 = c.menu; c.menu = {}; ANON_MENU.forEach((k) => { if (M0[k] !== undefined) c.menu[k] = M0[k]; }); }
  c.share = { on: false, id: "" };
  if (c.aprobaciones) Object.keys(c.aprobaciones).forEach((k) => { if (c.aprobaciones[k]) c.aprobaciones[k].nombre = ""; });
  /* el resumen del servicio conserva las horas, pero no los textos libres de las incidencias ni las notas */
  if (c.cierre) { delete c.cierre.nota; delete c.cierre.material; }
  if (c.turnos) Object.keys(c.turnos).forEach((id) => { if (c.turnos[id]) delete c.turnos[id].nota; });
  if (c.cierreServicio) { const cs = c.cierreServicio; cs.notas = ""; if (Array.isArray(cs.incidencias)) cs.incidencias = cs.incidencias.map((x) => ({ mesa: (x && x.mesa) || "", t: x && x.t, hecha: !!(x && x.hecha) })); }
  /* de cada pago solo queda la palabra genérica (Señal, Resto…): lo demás puede llevar un nombre */
  if (c.presupuesto && Array.isArray(c.presupuesto.pagos)) c.presupuesto.pagos.forEach((x) => { if (!x) return; const m = /^(señal|senal|resto|anticipo|reserva)/i.exec(String(x.concepto || "")); x.concepto = m ? m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase() : "Pago"; if (x.nota) x.nota = ""; });
  /* barrido final: nada de lo que se conserva puede repetir un nombre, un teléfono, un correo o un documento de identidad */
  if (nd.length) { const cuenta = { n: 0 }; ["menu", "presupuesto", "reparto", "pedidos", "recepcion", "cierre", "cierreServicio", "turnos", "camareros", "agendaHecho", "plans", "montaje"].forEach((k) => { if (c[k] !== undefined) c[k] = barreTextos(c[k], nd, cuenta); }); }
  c.anonimizado = { ts: ahora };
  c.updated = Math.max(ahora, (+e.updated || 0) + 1);
  kSellarTodo(c, c.updated);   /* sin «antes»: los sellos de lo que se quita llevarían nombres en sus claves; la copia vieja se descarta por «anonimizado» (ver mergeEv) */
  return c;
}
async function privLimpiarTablas(env, ids, nombres) {
  await ensureHistorial(env); await ensureBackups(env); await ensureNovios(env); await ensurePlanos(env); await ensureServicio(env); await ensureCorreo(env); await ensurePortal(env); await ensureConsultas(env); await ensureDocs(env);
  for (const id of ids) {
    await env.DB.prepare("DELETE FROM evento_docs WHERE ev=?1").bind(String(id)).run();
    { const cs = await env.DB.prepare("SELECT id FROM consultas WHERE ev_id=?1").bind(String(id)).all(); await consBorraRastro(env, (cs.results || []).map((r) => r.id)); }
    await env.DB.prepare("DELETE FROM consultas WHERE ev_id=?1").bind(String(id)).run();
    await env.DB.prepare("DELETE FROM portal_msg WHERE ev=?1").bind(String(id)).run();
    await env.DB.prepare("DELETE FROM portal_arch WHERE ev=?1").bind(String(id)).run();
    await env.DB.prepare("DELETE FROM outbox WHERE ev=?1").bind(String(id)).run();
    await env.DB.prepare("DELETE FROM servicio WHERE ev=?1").bind(String(id)).run();
    await env.DB.prepare("DELETE FROM historial WHERE event_id=?1").bind(String(id)).run();
    await env.DB.prepare("DELETE FROM papelera WHERE event_id=?1").bind(String(id)).run();
    await env.DB.prepare("DELETE FROM novios_listas WHERE event_id=?1").bind(String(id)).run();
    await env.DB.prepare("DELETE FROM planos WHERE k LIKE ?1").bind("ev:" + String(id).replace(/[%_]/g, "") + ":%").run();
  }
  await ensureUsers(env);
  for (const nm of nombres) { const n = String(nm || "").trim(); if (n.length >= 4) await env.DB.prepare("UPDATE actividad SET detalle='(evento anonimizado)' WHERE detalle LIKE ?1").bind("%" + n.replace(/[%_]/g, "") + "%").run(); }
}
/* el rastro de una consulta web en la bandeja de salida: el aviso al equipo (con su nombre, correo, teléfono y mensaje) y el acuse a quien escribió */
async function consBorraRastro(env, ids) {
  if (!ids || !ids.length) return;
  await ensureCorreo(env);
  for (const id of ids) await env.DB.prepare("DELETE FROM outbox WHERE ref=?1 OR ref LIKE ?2").bind("cons-resp:" + id, "cons-aviso:" + id + ":%").run();
}
/* qué sigue habiendo después de anonimizar o quitar a alguien: así no se promete más de lo que se ha hecho */
async function privQueda(env, ahora, cfg) {
  const out = [], dia = (ms) => new Date(ms).toISOString().slice(0, 10);
  await ensureBackups(env);
  const b = await env.DB.prepare("SELECT kind, COUNT(*) AS n, MAX(ts) AS rec FROM backups GROUP BY kind").all();
  let n = 0, hasta = 0, sin = false;
  (b.results || []).forEach((r) => { n += +r.n; const d = r.kind === "auto" ? 84 : (cfg.copiasDias || 0); if (!d) sin = true; else hasta = Math.max(hasta, +r.rec + d * 864e5); });
  if (n) out.push({ donde: "Copias de seguridad", n, hasta: sin ? null : dia(hasta), nota: "Las copias hechas antes guardan los datos tal como estaban y no se pueden retocar" + (sin ? ": las manuales no caducan (Parámetros → Privacidad → «Copias hechas a mano»); bórralas desde Copias de seguridad." : ": se borran solas y la última desaparece el " + dia(hasta) + ".") });
  const pa = await env.DB.prepare("SELECT COUNT(*) AS n, MAX(ts) AS rec FROM papelera").first();
  if (pa && +pa.n) out.push({ donde: "Papelera de eventos borrados", n: +pa.n, hasta: dia(+pa.rec + 30 * 864e5), nota: "Los eventos borrados a mano se guardan 30 días por si fue un error." });
  return out;
}
async function anonimizarIds(env, ids, ahora, forzar, cfg) {
  const out = { ids: [], nombres: [], prev: [] };
  const res = await storeEditar(env, (doc) => {
    out.ids = []; out.nombres = []; out.prev = [];
    const ok = {}; elegibles(doc, cfg.meses, ahora).forEach((x) => { ok[x.id] = 1; });
    const lista = Array.isArray(doc.events) ? doc.events : [];
    doc.events = lista.map((e) => {
      if (!e || !e.id || e.anonimizado || ids.indexOf(e.id) < 0 || !(ok[e.id] || forzar)) return e;
      out.ids.push(e.id); out.nombres.push(e.name || ""); out.prev.push(e.prevId || ""); return anonEvento(e, ahora);
    });
    /* su fila en la Previsión de banquetes también lleva el nombre de la celebración y un teléfono */
    if (doc.prevision && Array.isArray(doc.prevision.filas)) doc.prevision.filas.forEach((f) => {
      if (!f || !(out.ids.indexOf(f.evento) >= 0 || out.prev.indexOf(f.id) >= 0 || out.ids.some((id) => f.id === "pv-ev-" + id))) return;
      f.nombre = "Evento anonimizado"; f.telefono = ""; f.localidad = ""; f.origen = ""; f.updated = Math.max(ahora, (+f.updated || 0) + 1);
    });
    return { cambios: out.ids.length };
  });
  if (!res.ok) return { error: res.error || "busy" };
  if (out.ids.length) await privLimpiarTablas(env, out.ids, out.nombres);
  return out;
}
async function privAnonimizar(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  const b = await body(request), cfg = await privCfg(env), ahora = Date.now();
  let ids = Array.isArray(b.ids) ? b.ids.map(String).slice(0, 500) : [];
  if (b.todos) { const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first(); let doc = {}; try { doc = JSON.parse((row && row.data) || "{}") || {}; } catch (_) {} ids = elegibles(doc, cfg.meses, ahora).map((x) => x.id); }
  if (!ids.length) return json({ error: "invalid", message: "No hay eventos que anonimizar." }, 400);
  const r = await anonimizarIds(env, ids, ahora, !!b.forzar, cfg);
  if (r.error) return json({ error: r.error, message: "Había muchos guardados a la vez; vuelve a intentarlo." }, 409);
  if (r.ids.length) {
    await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('priv_ultima', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify({ ts: ahora, n: r.ids.length, auto: false })).run();
    await logAct(env, a.s, "anonimizacion", r.ids.length + (r.ids.length === 1 ? " evento anonimizado" : " eventos anonimizados"));
  }
  return json({ ok: true, n: r.ids.length, ids: r.ids, queda: r.ids.length ? await privQueda(env, ahora, cfg) : [] });
}
/* anonimización automática: como mucho una vez al día, solo si el administrador la ha activado */
let PRIV_AUTO_T = 0;
async function privAuto(env) {
  const ahora = Date.now();
  if (ahora - PRIV_AUTO_T < 3600e3) return; PRIV_AUTO_T = ahora;
  const cfg = await privCfg(env); if (!cfg.auto) return;
  const u = await env.DB.prepare("SELECT v FROM meta WHERE k='priv_ultima'").first(); let ult = null; try { ult = u ? JSON.parse(u.v) : null; } catch (_) {}
  if (ult && ahora - ult.ts < 864e5) return;
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first(); let doc = {}; try { doc = JSON.parse((row && row.data) || "{}") || {}; } catch (_) { return; }
  const ids = elegibles(doc, cfg.meses, ahora).map((x) => x.id);
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('priv_ultima', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify({ ts: ahora, n: 0, auto: true })).run();
  if (!ids.length) return;
  const r = await anonimizarIds(env, ids, ahora, false, cfg);
  if (r.ids && r.ids.length) {
    await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('priv_ultima', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify({ ts: ahora, n: r.ids.length, auto: true })).run();
    await logAct(env, { uid: "", name: "Automático" }, "anonimizacion", r.ids.length + " eventos anonimizados (plazo de " + cfg.meses + " meses)");
  }
}
/* v02.01 · limpieza diaria: lo que ya ha cumplido su plazo se borra solo (como mucho una vez al día, al primer latido de la app) */
let PURGA_T = 0;
async function privPurgas(env) {
  const ahora = Date.now();
  if (ahora - PURGA_T < 3600e3) return; PURGA_T = ahora;
  const u = await env.DB.prepare("SELECT v FROM meta WHERE k='priv_purga'").first();
  if (u && ahora - (+u.v || 0) < 864e5) return;
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('priv_purga', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(String(ahora)).run();
  const cfg = await privCfg(env);
  await ensureCorreo(env); await ensureBackups(env); await ensureHistorial(env); await ensureUsers(env);
  const q = async (sql, ...p) => { try { const r = await env.DB.prepare(sql).bind(...p).run(); return (r && r.meta && +r.meta.changes) || 0; } catch (_) { return 0; } };
  await q("DELETE FROM outbox WHERE ts<?1", ahora - COR_PURGA_DIAS * 864e5);
  await q("DELETE FROM outbox WHERE ref LIKE 'cons-%' AND ts<?1", ahora - 30 * 864e5);
  await q("DELETE FROM actividad WHERE tipo='login_fallido' AND ts<?1", ahora - 30 * 864e5);
  await q("DELETE FROM actividad WHERE ts<?1", ahora - 400 * 864e5);
  await q("DELETE FROM login_fallos WHERE ts<?1", ahora - 3600e3);
  await q("DELETE FROM sesiones_cerradas WHERE exp<?1", ahora);
  await q("DELETE FROM papelera WHERE ts<?1", ahora - 30 * 864e5);
  await q("DELETE FROM historial WHERE ts_fin<?1", ahora - 180 * 864e5);
  await q("DELETE FROM presencia WHERE ts<?1", ahora - 3600e3);
  const bk = cfg.copiasDias ? await q("DELETE FROM backups WHERE kind<>'auto' AND ts<?1", ahora - cfg.copiasDias * 864e5) : 0;
  try { await consPurga(env); } catch (_) {}
  try { await docsLimpiar(env); } catch (_) {}
  if (bk) await logAct(env, { uid: "", name: "Automático" }, "purga", bk + (bk === 1 ? " copia hecha a mano caducada" : " copias hechas a mano caducadas") + " (más de " + cfg.copiasDias + " días)");
}
/* editar el documento con control de versión (como storePut, pero para cambios que hace el servidor) */
async function storeEditar(env, fn) {
  for (let i = 0; i < 6; i++) {
    const row = await env.DB.prepare("SELECT data, updated FROM store WHERE id=1").first();
    if (!row) return { ok: true, r: null };
    let doc = {}; try { doc = JSON.parse(row.data) || {}; } catch (_) { return { ok: false, error: "bad-doc" }; }
    const antes = +row.updated || 0, r = fn(doc);
    if (!r || !r.cambios) return { ok: true, r };
    let v = Date.now(); if (v <= antes) v = antes + 1;
    const ch = await env.DB.prepare("UPDATE store SET data=?1, updated=?2 WHERE id=1 AND updated=?3").bind(JSON.stringify(doc), v, antes).run();
    const n = ch && ch.meta && ch.meta.changes != null ? ch.meta.changes : 1;
    if (n > 0) return { ok: true, r, v };
  }
  return { ok: false, error: "busy" };
}
/* ── buscar y quitar a una persona (derechos de acceso y supresión) ── */
function lineaPersonas(t) {
  const out = []; let d = 0, cur = "";
  for (const ch of t) { if (ch === "(" || ch === "[") d++; else if (ch === ")" || ch === "]") d--; if (d === 0 && (ch === "+" || ch === "&")) { out.push(cur); cur = ""; } else cur += ch; }
  out.push(cur); return out;
}
function nombreDe(seg) { return seg.replace(/[\(\[][^\)\]]*[\)\]]/g, " ").replace(/^\s*[-–•]\s+/, "").replace(/\s+/g, " ").trim(); }
const FICHA_PERS = ["parejaA", "parejaB", "contacto", "telefono", "email"];
const BARRER_EV = ["seating", "tareas", "hitos", "proveedores", "pedidos", "recepcion", "logoPareja", "marcasLM"];
function buscarEnEvento(e, qn, borrar) {
  const hit = { plano: 0, ficha: 0, otros: 0 };
  const F = e.ficha || {};
  const fechaTxt = F.fecha ? F.fecha.split("-").reverse().join("/") : "";
  const lines = String(e.text || "").split(/\r?\n/).map((ln) => {
    const t = ln.trim();
    if (/^#/.test(t) && normTxt(t).indexOf(qn) >= 0) { hit.otros++; return borrar ? "# Evento" + (fechaTxt ? " — " + fechaTxt : "") : ln; }
    if (!t || /^[#@]/.test(t) || /^\/\//.test(t) || isHeader(t)) return ln;
    const segs = lineaPersonas(t); let tocado = false;
    const nuevo = segs.map((sg) => { if (normTxt(nombreDe(sg)).indexOf(qn) >= 0) { hit.plano++; tocado = true; return " Persona anonimizada "; } return sg; });
    return borrar && tocado ? nuevo.join("+").replace(/\s*\+\s*/g, " + ").trim() : ln;
  });
  const cliente = FICHA_PERS.some((k) => F[k] && normTxt(F[k]).indexOf(qn) >= 0);
  /* si es el cliente, en los textos libres también se barren su nombre de pila y su apellido sueltos («Boda de Pere y Laia») */
  const nd = [qn];
  if (cliente) FICHA_PERS.forEach((k) => { if (F[k] && normTxt(F[k]).indexOf(qn) >= 0) normTxt(F[k]).split(/\s+/).forEach((w) => { if (w.length >= 4 && !/^(del|los|las|para|amb)$/.test(w) && nd.indexOf(w) < 0) nd.push(w); }); });
  FICHA_PERS.forEach((k) => { if (F[k] && normTxt(F[k]).indexOf(qn) >= 0) { hit.ficha++; if (borrar) F[k] = ""; } });
  /* si es el cliente (o su contacto): el teléfono, el correo, cómo nos conoció, las notas y la foto de la ficha, el logo, el enlace del portal y lo que se vio en él dejan de tener sentido */
  if (cliente) {
    ["telefono", "email", "origen", "comoNos", "notas", "foto"].forEach((k) => { if (F[k]) { hit.ficha++; if (borrar) F[k] = ""; } });
    if (e.logoPareja) { hit.otros++; if (borrar) delete e.logoPareja; }
    if (e.share && (e.share.on || e.share.portal)) { hit.otros++; if (borrar) e.share = { on: false, id: "" }; }
    if (Array.isArray(e.docs) && e.docs.length) { hit.otros++; if (borrar) e.docs = []; }
  }
  if (e.name && normTxt(e.name).indexOf(qn) >= 0) { hit.otros++; if (borrar) e.name = "Evento (persona suprimida)" + (fechaTxt ? " · " + fechaTxt : ""); }
  (e.comunicaciones || []).forEach((c) => { if (c && normTxt(JSON.stringify(c)).indexOf(qn) >= 0) { hit.otros++; if (borrar) { c.nota = "(borrado)"; c.texto = "(borrado)"; if (c.asunto) c.asunto = "(borrado)"; c.adj = []; } } });
  /* quién aprobó o aceptó algo en el portal, y el contrato aceptado (nombre, NIF y el texto, que lleva el nombre del cliente) */
  Object.keys(e.aprobaciones || {}).forEach((k) => { const a = e.aprobaciones[k]; if (a && a.nombre && normTxt(a.nombre).indexOf(qn) >= 0) { hit.otros++; if (borrar) a.nombre = "(borrado)"; } });
  const CO = e.contrato;
  if (CO) {
    ["firmado", "firmado2"].forEach((k) => { const fi = CO[k];
      if (fi && normTxt((fi.nombre || "") + " " + (fi.nif || "") + " " + (fi.texto || "")).indexOf(qn) >= 0) { hit.otros++; if (borrar) { fi.nombre = "(borrado)"; fi.nif = ""; fi.texto = "(borrado)"; } } });
    /* el documento de identidad de cada persona (num1/num2) y los nombres de quienes firman con la versión publicada */
    [1, 2].forEach((i) => { if (CO["num" + i] && normTxt(CO["num" + i]).indexOf(qn) >= 0) { hit.otros++; if (borrar) CO["num" + i] = ""; } });
    if (Array.isArray(CO.nombres) && CO.nombres.some((n) => n && normTxt(n).indexOf(qn) >= 0)) { hit.otros++; if (borrar) CO.nombres = []; }
    if ((CO.tpl && normTxt(CO.tpl).indexOf(qn) >= 0) || (Array.isArray(CO.extras) && normTxt(JSON.stringify(CO.extras)).indexOf(qn) >= 0)) { hit.otros++; if (borrar) { CO.tpl = ""; CO.extras = []; } }
    if (CO.texto && normTxt(CO.texto).indexOf(qn) >= 0) { hit.otros++; if (borrar) { CO.texto = ""; if (e.share && e.share.portal) e.share.portal = null; } }
  }
  /* lo que se escribe a mano después del evento: nota y material del cierre, notas de turnos, avisos y notas del servicio */
  const CS = e.cierre; if (CS) ["nota", "material"].forEach((k) => { if (CS[k] && normTxt(CS[k]).indexOf(qn) >= 0) { hit.otros++; if (borrar) CS[k] = "(borrado)"; } });
  Object.keys(e.turnos || {}).forEach((id) => { const t = e.turnos[id]; if (t && t.nota && normTxt(t.nota).indexOf(qn) >= 0) { hit.otros++; if (borrar) t.nota = "(borrado)"; } });
  const SV = e.cierreServicio; if (SV) { (SV.incidencias || []).forEach((x) => { if (x && x.txt && normTxt(x.txt).indexOf(qn) >= 0) { hit.otros++; if (borrar) x.txt = "(borrado)"; } }); if (SV.notas && normTxt(SV.notas).indexOf(qn) >= 0) { hit.otros++; if (borrar) SV.notas = "(borrado)"; } }
  /* textos libres de otras partes del evento (diseño de los seatings, tareas, proveedores, escaleta, minuta…) */
  const cuenta = { n: 0 };
  BARRER_EV.forEach((k) => { if (e[k] && typeof e[k] === "object") { const nv = barreTextos(e[k], nd, cuenta); if (borrar) e[k] = nv; } });
  if (e.menu && typeof e.menu === "object") ["minuta", "escaleta", "propios", "svOv"].forEach((k) => { if (e.menu[k] && typeof e.menu[k] === "object") { const nv = barreTextos(e.menu[k], nd, cuenta); if (borrar) e.menu[k] = nv; } });
  if (cuenta.n) hit.otros += cuenta.n;
  if (borrar && (hit.plano || hit.ficha || hit.otros)) { e.text = lines.join("\n"); if (hit.plano && e.menu) { delete e.menu.aperAdapt; delete e.menu.alerOk; delete e.menu.alerSin; } }
  return hit;
}
async function privPersona(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  const b = await body(request), q = String(b.q || "").trim(), qn = normTxt(q).replace(/\s+/g, " ");
  if (qn.length < 3) return json({ error: "invalid", message: "Escribe al menos 3 letras del nombre." }, 400);
  await ensureNovios(env);
  const borrar = !!b.borrar, ahora = Date.now(), cuentas = [];
  /* listas que han enviado los clientes */
  const { results } = await env.DB.prepare("SELECT token, event_id, data FROM novios_listas").all();
  const listas = {};
  (results || []).forEach((r) => { let d = null; try { d = JSON.parse(r.data); } catch (_) {} if (!d) return; let n = 0;
    (d.mesas || []).forEach((m) => (m.g || []).forEach((g) => { if (normTxt(g.n || "").indexOf(qn) >= 0) { n++; if (borrar) { g.n = "Persona anonimizada"; g.a = ""; } } }));
    ["parejaA", "parejaB"].forEach((k) => { if (d[k] && normTxt(d[k]).indexOf(qn) >= 0) { n++; if (borrar) d[k] = ""; } });
    if (n) listas[r.token] = { n, ev: r.event_id, data: d }; });
  /* los avisos y notas del modo servicio (su tabla propia): se cuentan por evento y se borran junto con el resto de datos vivos del evento */
  await ensureServicio(env);
  const svHits = {};
  { const r2 = await env.DB.prepare("SELECT ev, v FROM servicio WHERE del=0 AND (k LIKE 'inc:%' OR k='nota')").all();
    (r2.results || []).forEach((r) => { let v = null; try { v = JSON.parse(r.v); } catch (_) {} if (v && v.txt && normTxt(v.txt).indexOf(qn) >= 0) svHits[r.ev] = (svHits[r.ev] || 0) + 1; }); }
  await ensurePortal(env);
  const pmHits = {};
  { const r3 = await env.DB.prepare("SELECT ev, texto, nombre FROM portal_msg").all();
    (r3.results || []).forEach((r) => { if (normTxt((r.texto || "") + " " + (r.nombre || "")).indexOf(qn) >= 0) pmHits[r.ev] = (pmHits[r.ev] || 0) + 1; }); }
  await ensureConsultas(env);
  const coIds = [];
  { const r4 = await env.DB.prepare("SELECT id, nombre, email, tel, mensaje, nota FROM consultas").all();
    (r4.results || []).forEach((r) => { if (normTxt([r.nombre, r.email, r.tel, r.mensaje, r.nota].join(" ")).indexOf(qn) >= 0) coIds.push(r.id); }); }
  /* la bandeja de salida (correos enviados a esa persona o que la nombran) y el registro de actividad */
  await ensureCorreo(env); await ensureUsers(env);
  const obIds = [], acIds = [];
  { const r5 = await env.DB.prepare("SELECT id, to_addr, subject, body FROM outbox ORDER BY id DESC LIMIT 5000").all();
    (r5.results || []).forEach((r) => { if (normTxt([r.to_addr, r.subject, r.body].join(" ")).indexOf(qn) >= 0) obIds.push(r.id); }); }
  { const r6 = await env.DB.prepare("SELECT id, detalle FROM actividad WHERE detalle IS NOT NULL AND detalle<>'' AND tipo NOT IN ('supresion_persona','acceso_persona') ORDER BY id DESC LIMIT 5000").all();
    (r6.results || []).forEach((r) => { if (normTxt(r.detalle).indexOf(qn) >= 0) acIds.push(r.id); }); }
  let tocados = [], prevHits = 0;
  const res = await storeEditar(env, (doc) => {
    cuentas.length = 0; tocados = []; prevHits = 0;
    /* la Previsión de banquetes (nombre de la celebración, teléfono, localidad) */
    ((doc.prevision || {}).filas || []).forEach((f) => { if (f && !f.borrado && normTxt([f.nombre, f.telefono, f.localidad, f.origen].join(" ")).indexOf(qn) >= 0) { prevHits++; if (borrar) { f.nombre = "(borrado)"; f.telefono = ""; f.localidad = ""; f.origen = ""; f.updated = Math.max(ahora, (+f.updated || 0) + 1); } } });
    doc.events = (doc.events || []).map((e) => {
      if (!e || !e.id || e.anonimizado) return e;
      const c = borrar ? JSON.parse(JSON.stringify(e)) : JSON.parse(JSON.stringify(e)), h = buscarEnEvento(c, qn, borrar);
      h.otros += (svHits[e.id] || 0) + (pmHits[e.id] || 0);
      const total = h.plano + h.ficha + h.otros + Object.keys(listas).reduce((s2, t) => s2 + (listas[t].ev === e.id ? listas[t].n : 0), 0);
      if (!total) return e;
      cuentas.push({ id: e.id, name: e.name || "", fecha: (e.ficha && e.ficha.fecha) || "", plano: h.plano, ficha: h.ficha, otros: h.otros, lista: Object.keys(listas).reduce((s2, t) => s2 + (listas[t].ev === e.id ? listas[t].n : 0), 0) });
      if (!borrar) return e;
      c.updated = Math.max(ahora, (+e.updated || 0) + 1); kSellarTodo(c, c.updated, e);
      Object.keys(c._k || {}).forEach((k) => { if (normTxt(k.split(K_SEP).join(" ")).indexOf(qn) >= 0) delete c._k[k]; });   /* los sellos no deben guardar el nombre de quien se quita */
      tocados.push(e.id); return c;
    });
    return { cambios: borrar && (tocados.length || prevHits) ? 1 : 0 };
  });
  if (!res.ok) return json({ error: res.error || "busy", message: "Había muchos guardados a la vez; vuelve a intentarlo." }, 409);
  if (prevHits) cuentas.push({ id: "__prev", name: "Previsión de banquetes", fecha: "", plano: 0, ficha: 0, otros: prevHits, lista: 0 });
  if (coIds.length) cuentas.push({ id: "__cons", name: "Consultas web", fecha: "", plano: 0, ficha: 0, otros: coIds.length, lista: 0 });
  if (obIds.length) cuentas.push({ id: "__cor", name: "Correos enviados (bandeja de salida)", fecha: "", plano: 0, ficha: 0, otros: obIds.length, lista: 0 });
  if (acIds.length) cuentas.push({ id: "__act", name: "Registro de actividad", fecha: "", plano: 0, ficha: 0, otros: acIds.length, lista: 0 });
  if (borrar && coIds.length) { await consBorraRastro(env, coIds); for (const cid of coIds) await env.DB.prepare("DELETE FROM consultas WHERE id=?1").bind(cid).run(); }
  if (borrar && obIds.length) for (let i = 0; i < obIds.length; i += 40) { const ch = obIds.slice(i, i + 40); await env.DB.prepare("DELETE FROM outbox WHERE id IN (" + ch.map((_, k) => "?" + (k + 1)).join(",") + ")").bind(...ch).run(); }
  if (borrar && acIds.length) for (let i = 0; i < acIds.length; i += 40) { const ch = acIds.slice(i, i + 40); await env.DB.prepare("UPDATE actividad SET detalle='(persona suprimida)' WHERE id IN (" + ch.map((_, k) => "?" + (k + 1)).join(",") + ")").bind(...ch).run(); }
  if (borrar) {
    for (const t of Object.keys(listas)) await env.DB.prepare("UPDATE novios_listas SET data=?1, base=NULL WHERE token=?2").bind(JSON.stringify(listas[t].data), t).run();
    await privLimpiarTablas(env, tocados, []);
    await logAct(env, a.s, "supresion_persona", cuentas.length + (cuentas.length === 1 ? " evento" : " eventos") + " (" + cuentas.reduce((s2, c) => s2 + c.plano + c.ficha + c.otros + c.lista, 0) + " datos)");
  } else await logAct(env, a.s, "acceso_persona", "Búsqueda de una persona: " + cuentas.length + (cuentas.length === 1 ? " evento" : " eventos"));
  return json({ ok: true, borrado: borrar, eventos: cuentas, total: cuentas.reduce((s2, c) => s2 + c.plano + c.ficha + c.otros + c.lista, 0), queda: borrar ? await privQueda(env, ahora, await privCfg(env)) : undefined });
}


/* ── CONSULTAS WEB Y DISPONIBILIDAD ───────────────────────────────────────────────
   Un formulario público (?consulta) para que alguien que no es cliente todavía pregunte por su celebración:
   · lo que se guarda va a su propia tabla (consultas): nombre, contacto, qué quiere celebrar, fecha, invitados, salón y mensaje, con el
     consentimiento (fecha y versión del aviso de privacidad). El equipo (administración y eventos) las ve en Previsión → «Consultas web»,
     las contesta, las pasa a la Previsión (seguimiento hasta confirmar) o directamente a un evento;
   · protección contra el spam SIN depender de nadie: campo trampa, tiempo mínimo desde que se abre el formulario (firmado por el servidor),
     tope por persona (4 por hora y 10 al día; la persona se reconoce por una huella que se borra a los 2 días) y por día en total (80);
     y, si hay claves de Cloudflare Turnstile (TURNSTILE_SITEKEY y TURNSTILE_SECRET), también ese control;
   · al llegar una consulta se avisa por correo al equipo (a la lista que diga Parámetros o, si no, a administración y eventos) y, si se quiere,
     se le contesta a quien escribió con un acuse de recibo;
   · disponibilidad por fecha y por local (Les Moles, Les Vinyes, catering/fuera) a partir de la Previsión y de los eventos: libre, provisional
     (hay algo sin confirmar) u ocupada. Si el administrador lo activa, el formulario le dice a quien consulta si la fecha parece libre;
   · RGPD: las consultas se borran solas a los 6–36 meses (12 de fábrica), con el evento al anonimizarlo y a petición de la persona
     (buscador de personas). El formulario SIEMPRE lleva la información de privacidad y una casilla de consentimiento. */
let CO_OK = false;
const CO_ESTADOS = ["nueva", "contactada", "visita", "prevision", "descartada"];
const CO_DEF = {
  on: false, intro: "",
  tipos: ["Boda", "Comunión", "Bautizo", "Celebración familiar", "Evento de empresa", "Otro"],
  salones: ["Les Moles", "Les Vinyes del Convent", "Otro lugar o catering", "Todavía no lo sé"],
  disp: false, avisar: "", respuesta: true, respuestaTxt: "", meses: 12
};
const CO_RESP_DEF = "Hola {nombre},\n\nGracias por escribirnos. Hemos recibido tu consulta sobre {tipo} y te contestaremos lo antes posible.\n\nUn saludo,\nLes Moles";
async function ensureConsultas(env) {
  if (CO_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS consultas (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, nombre TEXT NOT NULL, email TEXT, tel TEXT, tipo TEXT, fecha TEXT, fecha_txt TEXT, pax INTEGER, salon TEXT, mensaje TEXT, estado TEXT NOT NULL DEFAULT 'nueva', nota TEXT, leida INTEGER NOT NULL DEFAULT 0, prev_id TEXT, ev_id TEXT, consent_ts INTEGER, consent_v INTEGER, ip TEXT)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS consultas_ts ON consultas (ts)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS consulta_lim (ip TEXT NOT NULL, kind TEXT NOT NULL, ts INTEGER NOT NULL)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS consulta_lim_ip ON consulta_lim (ip, kind, ts)").run();
  CO_OK = true;
}
function consLista4(a, max, n) { return (Array.isArray(a) ? a : []).map((x) => porTexto(x, n)).filter(Boolean).slice(0, max); }
async function consCfg(env) {
  await ensureUsers(env);
  const r = await env.DB.prepare("SELECT v FROM meta WHERE k='consultas'").first();
  let c = {}; try { c = r ? JSON.parse(r.v) || {} : {}; } catch (_) {}
  const o = Object.assign({}, CO_DEF, c);
  o.on = !!o.on; o.disp = !!o.disp; o.respuesta = o.respuesta !== false;
  o.tipos = consLista4(o.tipos, 12, 40); if (!o.tipos.length) o.tipos = CO_DEF.tipos.slice();
  o.salones = consLista4(o.salones, 8, 60); if (!o.salones.length) o.salones = CO_DEF.salones.slice();
  o.meses = [6, 12, 18, 24, 36].indexOf(+o.meses) >= 0 ? +o.meses : 12;
  o.intro = porTexto(o.intro, 600); o.avisar = porTexto(o.avisar, 400); o.respuestaTxt = String(o.respuestaTxt || "").slice(0, 1500);
  return o;
}
function consEmails(txt) { const out = []; String(txt || "").split(/[\s,;]+/).forEach((x) => { if (corEmailOk(x)) out.push(x.trim().toLowerCase()); }); return out.filter((v, i, a) => a.indexOf(v) === i); }
async function consIp(request, env) {
  const ip = String(request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "local").split(",")[0].trim();
  return (await hmac(await secret(env), "ip|" + ip)).slice(0, 22);
}
async function consLimite(env, ip, kind, max, ventana) {
  const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM consulta_lim WHERE ip=?1 AND kind=?2 AND ts>?3").bind(ip, kind, Date.now() - ventana).first();
  return !!(n && n.n >= max);
}
async function consTok(env) { const ts = Date.now().toString(36), nonce = randomHex(6); return ts + "." + nonce + "." + (await hmac(await secret(env), "consulta|" + ts + "|" + nonce)).slice(0, 24); }
async function consTokOk(env, t) {
  const p = String(t || "").split("."); if (p.length !== 3) return "invalid";
  const esperado = (await hmac(await secret(env), "consulta|" + p[0] + "|" + p[1])).slice(0, 24); if (esperado !== p[2]) return "invalid";
  const edad = Date.now() - parseInt(p[0], 36); if (!(edad >= 0)) return "invalid";
  if (edad < 3000) return "rapido"; if (edad > 3 * 3600e3) return "caducado"; return "ok";
}
/* el local de una celebración, igual que en la Previsión de la app */
function consLocal(esp) { const n = normTxt(esp || ""); if (!n) return "sin"; if (/vinyes|viyes|vinyas/.test(n)) return "vinyes"; if (/catering|cater|foodtruck|fodtruck/.test(n)) return "fuera"; if (/moles/.test(n)) return "moles"; return "fuera"; }
/* un día en cada local: libre · provisional (hay algo sin confirmar) · ocupada */
function consDispDoc(doc, iso) {
  const r = { moles: "libre", vinyes: "libre", fuera: "libre" }, peso = { libre: 0, provisional: 1, ocupada: 2 };
  const sube = (l, est) => { if (peso[est] > peso[r[l]]) r[l] = est; };
  const pon = (l, est) => { if (l === "sin") { sube("moles", "provisional"); sube("vinyes", "provisional"); } else sube(l, est); };
  const filas = ((doc.prevision || {}).filas || []).filter((f) => f && !f.borrado && f.fecha === iso && f.estado !== "descartado");
  const enl = {}; filas.forEach((f) => { if (f.evento) enl[f.evento] = 1; pon(consLocal(f.espacio), f.estado === "confirmado" ? "ocupada" : "provisional"); });
  (doc.events || []).forEach((e) => {
    if (!e || e.anonimizado || !e.ficha || e.ficha.fecha !== iso || enl[e.id] || e.prevId) return;
    pon(consLocal(e.ficha.ubicacion), ["contacto", "propuesta", "visita"].indexOf(e.ficha.estado) >= 0 ? "provisional" : "ocupada");
  });
  return r;
}
async function consForm(request, env) {
  await ensureConsultas(env);
  const c = await consCfg(env), doc = await corDoc(env), pt = (((doc.params || {}).sec || {}).portal || {}).data || {};
  const base = { tel: porTexto(pt.tel, 40), mail: porTexto(pt.mail, 120) };
  if (!c.on) return json(Object.assign({ on: false }, base));
  let priv = null; try { const p = await privCfg(env); priv = { responsable: p.responsable, nif: p.nif, direccion: p.direccion, email: p.email, meses: c.meses, v: PRIV_V }; } catch (_) {}
  return json(Object.assign({ on: true, intro: c.intro, tipos: c.tipos, salones: c.salones, disp: c.disp, token: await consTok(env), turnstile: (env.TURNSTILE_SITEKEY && env.TURNSTILE_SECRET) ? String(env.TURNSTILE_SITEKEY) : "", priv, hoy: hoyISO() }, base));
}
async function consDispRoute(request, env, url) {
  await ensureConsultas(env);
  const c = await consCfg(env); if (!c.on || !c.disp) return json({ error: "off" }, 404);
  const f = String(url.searchParams.get("fecha") || "");
  const tope = new Date(Date.now() + 1100 * 864e5).toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || f < hoyISO() || f > tope) return json({ error: "invalid", message: "Elige una fecha futura." }, 400);
  const ip = await consIp(request, env);
  if (await consLimite(env, ip, "disp", 60, 3600e3)) return json({ error: "limit" }, 429);
  await env.DB.prepare("INSERT INTO consulta_lim (ip, kind, ts) VALUES (?1, 'disp', ?2)").bind(ip, Date.now()).run();
  const D = consDispDoc(await corDoc(env), f);
  return json({ fecha: f, locales: [{ k: "moles", t: "Les Moles", e: D.moles }, { k: "vinyes", t: "Les Vinyes del Convent", e: D.vinyes }] });
}
async function consDestinos(env, c) {
  const l = consEmails(c.avisar); if (l.length) return l;
  await ensureUsers(env);
  const { results } = await env.DB.prepare("SELECT email FROM users WHERE role IN ('admin','eventos') AND COALESCE(active,1)=1").all();
  return (results || []).map((r) => String(r.email || "").toLowerCase()).filter((x, i, a) => corEmailOk(x) && a.indexOf(x) === i);
}
async function consPurga(env) {
  const c = await consCfg(env), ahora = Date.now();
  { const lim = ahora - c.meses * 30.44 * 864e5; const v = await env.DB.prepare("SELECT id FROM consultas WHERE ts<?1").bind(lim).all(); await consBorraRastro(env, (v.results || []).map((r) => r.id)); await env.DB.prepare("DELETE FROM consultas WHERE ts<?1").bind(lim).run(); }
  await env.DB.prepare("UPDATE consultas SET ip=NULL WHERE ts<?1 AND ip IS NOT NULL").bind(ahora - 2 * 864e5).run();
  await env.DB.prepare("DELETE FROM consulta_lim WHERE ts<?1").bind(ahora - 2 * 864e5).run();
}
/* POST /api/consulta — público */
async function consNueva(request, env) {
  await ensureConsultas(env);
  const c = await consCfg(env);
  if (!c.on) return json({ error: "off", message: "Ahora mismo no recibimos consultas por aquí." }, 403);
  if ((+request.headers.get("content-length") || 0) > 40000) return json({ error: "too-big", message: "El formulario es demasiado grande." }, 413);
  const b = await body(request);
  if (b.web) return json({ ok: true });   /* campo trampa: solo lo rellenan los robots; se hace como si hubiera ido bien */
  const t = await consTokOk(env, b.t);
  if (t === "invalid" || t === "caducado") return json({ error: "token", message: "La página ha caducado. Recárgala y vuelve a enviar el formulario." }, 400);
  if (t === "rapido") return json({ error: "rapido", message: "Lo has enviado demasiado rápido. Espera un momento y vuelve a pulsar «Enviar»." }, 429);
  const ip = await consIp(request, env);
  if (await consLimite(env, ip, "envio", 4, 3600e3) || await consLimite(env, ip, "envio", 10, 864e5)) return json({ error: "limit", message: "Has enviado varias consultas seguidas. Si es urgente, llámanos." }, 429);
  const glob = await env.DB.prepare("SELECT COUNT(*) AS n FROM consultas WHERE ts>?1").bind(Date.now() - 864e5).first();
  if (glob && glob.n >= 80) return json({ error: "limit", message: "Hoy hemos recibido muchas consultas. Llámanos o escríbenos por correo." }, 429);
  if (env.TURNSTILE_SECRET) {
    let okc = false;
    try {
      const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "secret=" + encodeURIComponent(String(env.TURNSTILE_SECRET)) + "&response=" + encodeURIComponent(String(b.cf || "")) });
      const j = await r.json(); okc = !!(j && j.success);
    } catch (_) { okc = false; }
    if (!okc) return json({ error: "captcha", message: "No hemos podido comprobar que eres una persona. Recarga la página e inténtalo otra vez." }, 400);
  }
  const nombre = porTexto(b.nombre, 80), email = porTexto(b.email, 120).toLowerCase(), tel = porTexto(b.tel, 30), tipo = porTexto(b.tipo, 40), salon = porTexto(b.salon, 60);
  const mensaje = porTexto(b.mensaje, 1500), fechaTxt = porTexto(b.fechaTxt, 60);
  let fecha = String(b.fecha || ""); if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha < hoyISO()) fecha = "";
  let pax = Math.floor(+b.pax || 0); if (!(pax >= 1 && pax <= 3000)) pax = 0;
  if (nombre.length < 2) return json({ error: "invalid", message: "Escribe tu nombre." }, 400);
  if (email && !corEmailOk(email)) return json({ error: "invalid", message: "El correo no parece válido." }, 400);
  if (!email && tel.replace(/\D/g, "").length < 6) return json({ error: "invalid", message: "Dinos cómo contactarte: un correo o un teléfono." }, 400);
  if (!b.consent) return json({ error: "invalid", message: "Marca la casilla de privacidad para poder enviarlo." }, 400);
  if ((mensaje.match(/https?:\/\/|www\./gi) || []).length > 2) return json({ error: "spam", message: "El mensaje lleva demasiados enlaces." }, 400);
  const ahora = Date.now();
  const r = await env.DB.prepare("INSERT INTO consultas (ts, nombre, email, tel, tipo, fecha, fecha_txt, pax, salon, mensaje, estado, leida, consent_ts, consent_v, ip) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,'nueva',0,?1,?11,?12)")
    .bind(ahora, nombre, email, tel, tipo, fecha, fechaTxt, pax || null, salon, mensaje, PRIV_V, ip).run();
  const id = (r.meta && r.meta.last_row_id) || (await env.DB.prepare("SELECT MAX(id) AS id FROM consultas").first()).id;
  await env.DB.prepare("INSERT INTO consulta_lim (ip, kind, ts) VALUES (?1, 'envio', ?2)").bind(ip, ahora).run();
  try { if (Math.random() < 0.1) await consPurga(env); } catch (_) {}
  /* avisos: al equipo y, si se quiere, acuse de recibo a quien ha escrito (si falla el correo, la consulta ya está guardada) */
  try {
    const L = ["Nueva consulta desde la web", "", "Nombre: " + nombre, "Correo: " + (email || "—"), "Teléfono: " + (tel || "—"), "Celebración: " + (tipo || "—"), "Fecha: " + (fecha || fechaTxt || "—"), "Invitados: " + (pax || "—"), "Salón: " + (salon || "—"), "", mensaje || "(sin mensaje)", "", "Contéstala desde la app: Previsión → Consultas web."];
    for (const d of await consDestinos(env, c)) await correoEnviar(env, { kind: "consulta", to: d, subject: "Nueva consulta: " + nombre + (tipo ? " · " + tipo : ""), text: L.join("\n"), ref: "cons-aviso:" + id + ":" + d, by: "Formulario web" });
    if (c.respuesta && email) {
      const txt = (c.respuestaTxt || CO_RESP_DEF).replace(/\{nombre\}/g, nombre.split(" ")[0]).replace(/\{tipo\}/g, (tipo || "tu celebración").toLowerCase());
      await correoEnviar(env, { kind: "consulta", to: email, subject: "Hemos recibido tu consulta", text: txt, ref: "cons-resp:" + id, by: "Formulario web" });
    }
  } catch (_) {}
  return json({ ok: true });
}
/* ── el lado del equipo ── */
async function consEquipo(request, env) {
  const s = await session(request, env);
  if (!s) return { err: json({ error: "unauth" }, 401) };
  if (s.role !== "admin" && s.role !== "eventos") return { err: json({ error: "forbidden", message: "Tu rol no puede ver las consultas." }, 403) };
  return { s };
}
function consFila(r) { return { id: r.id, ts: +r.ts, nombre: r.nombre, email: r.email || "", tel: r.tel || "", tipo: r.tipo || "", fecha: r.fecha || "", fechaTxt: r.fecha_txt || "", pax: r.pax || 0, salon: r.salon || "", mensaje: r.mensaje || "", estado: r.estado, nota: r.nota || "", leida: !!r.leida, prevId: r.prev_id || "", evId: r.ev_id || "" }; }
async function consLista(request, env, url) {
  const a = await consEquipo(request, env); if (a.err) return a.err;
  await ensureConsultas(env);
  if (Math.random() < 0.05) { try { await consPurga(env); } catch (_) {} }
  const nuevas = await env.DB.prepare("SELECT COUNT(*) AS n, MAX(ts) AS ts FROM consultas WHERE leida=0").first();
  if (url.searchParams.get("resumen")) return json({ nuevas: (nuevas && nuevas.n) || 0, ts: (nuevas && +nuevas.ts) || 0 });
  const { results } = await env.DB.prepare("SELECT * FROM consultas ORDER BY id DESC LIMIT 300").all();
  const c = await consCfg(env);
  return json({ consultas: (results || []).map(consFila), nuevas: (nuevas && nuevas.n) || 0, on: c.on, meses: c.meses });
}
async function consAccion(request, env) {
  const a = await consEquipo(request, env); if (a.err) return a.err;
  await ensureConsultas(env);
  const b = await body(request), id = Math.floor(+b.id || 0), fila = await env.DB.prepare("SELECT * FROM consultas WHERE id=?1").bind(id).first();
  if (!fila) return json({ error: "not-found" }, 404);
  const ac = String(b.accion || "");
  if (ac === "leida") await env.DB.prepare("UPDATE consultas SET leida=1 WHERE id=?1").bind(id).run();
  else if (ac === "estado") { if (CO_ESTADOS.indexOf(b.estado) < 0) return json({ error: "invalid" }, 400); await env.DB.prepare("UPDATE consultas SET estado=?1, leida=1 WHERE id=?2").bind(b.estado, id).run(); }
  else if (ac === "nota") await env.DB.prepare("UPDATE consultas SET nota=?1 WHERE id=?2").bind(porTexto(b.nota, 800), id).run();
  else if (ac === "prev") await env.DB.prepare("UPDATE consultas SET prev_id=?1, estado=CASE WHEN estado IN ('nueva','contactada','visita') THEN 'prevision' ELSE estado END, leida=1 WHERE id=?2").bind(porTexto(b.prevId, 80), id).run();
  else if (ac === "ev") await env.DB.prepare("UPDATE consultas SET ev_id=?1, prev_id=COALESCE(NULLIF(?2,''),prev_id), estado='prevision', leida=1 WHERE id=?3").bind(porTexto(b.evId, 80), porTexto(b.prevId, 80), id).run();
  else if (ac === "borrar") { await consBorraRastro(env, [id]); await env.DB.prepare("DELETE FROM consultas WHERE id=?1").bind(id).run(); await logAct(env, a.s, "consulta_borrada", "Consulta de " + String(fila.nombre).slice(0, 60)); return json({ ok: true, borrada: true }); }
  else return json({ error: "invalid" }, 400);
  const n = await env.DB.prepare("SELECT * FROM consultas WHERE id=?1").bind(id).first();
  const nuevas = await env.DB.prepare("SELECT COUNT(*) AS n FROM consultas WHERE leida=0").first();
  return json({ ok: true, consulta: consFila(n), nuevas: (nuevas && nuevas.n) || 0 });
}
async function consCfgGet(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  await ensureConsultas(env);
  return json({ cfg: await consCfg(env), turnstile: !!(env.TURNSTILE_SITEKEY && env.TURNSTILE_SECRET), defaults: { respuestaTxt: CO_RESP_DEF } });
}
async function consCfgPut(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  await ensureConsultas(env);
  const b = await body(request), ant = await consCfg(env), nv = Object.assign({}, ant);
  if (b.on !== undefined) nv.on = !!b.on; if (b.disp !== undefined) nv.disp = !!b.disp; if (b.respuesta !== undefined) nv.respuesta = !!b.respuesta;
  if (b.intro !== undefined) nv.intro = porTexto(b.intro, 600);
  if (b.tipos !== undefined) { nv.tipos = consLista4(b.tipos, 12, 40); if (!nv.tipos.length) return json({ error: "invalid", message: "Pon al menos un tipo de celebración." }, 400); }
  if (b.salones !== undefined) { nv.salones = consLista4(b.salones, 8, 60); if (!nv.salones.length) return json({ error: "invalid", message: "Pon al menos una opción de salón." }, 400); }
  if (b.avisar !== undefined) { const m = String(b.avisar || "").split(/[\s,;]+/).filter(Boolean); if (m.some((x) => !corEmailOk(x))) return json({ error: "invalid", message: "Algún correo de la lista de avisos no es válido." }, 400); nv.avisar = m.join(", "); }
  if (b.respuestaTxt !== undefined) nv.respuestaTxt = String(b.respuestaTxt || "").slice(0, 1500);
  if (b.meses !== undefined) { if ([6, 12, 18, 24, 36].indexOf(+b.meses) < 0) return json({ error: "invalid", message: "Plazo no válido." }, 400); nv.meses = +b.meses; }
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('consultas', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(nv)).run();
  await logAct(env, a.s, "consultas_ajustes", "Consultas web: " + (nv.on ? "activadas" : "apagadas") + (nv.disp ? " · con disponibilidad" : ""));
  return json({ ok: true, cfg: await consCfg(env) });
}

/* ── DOCUMENTOS DEL EVENTO: justificantes de pago y documentos de identidad ────────────────────────────
   · JUSTIFICANTES de pago (captura o PDF de la transferencia): los suben los clientes desde su portal (diciendo a qué pago
     corresponden) o el equipo desde «Documentos» del evento; quedan como registro del pago. El equipo los marca como
     «confirmados» cuando el dinero ha llegado.
   · DOCUMENTOS DE IDENTIDAD (DNI, NIE, pasaporte) de los clientes: los suben ellos o el equipo. Son datos personales delicados,
     así que: solo administración y eventos los ven; el cliente puede SUBIRLOS pero no volver a verlos (el enlace del portal no
     sirve para bajarlos); cada vez que alguien del equipo abre uno queda anotado en el registro de actividad; se borran solos
     pasado un plazo tras el evento (Parámetros → Privacidad y datos, por defecto 90 días) y siempre al anonimizar el evento.
   Se guardan aparte, en evento_docs (no caben en el documento de eventos): JPG, PNG, WebP o PDF de hasta 600 KB. */
const DOC_MAX = 600000, DOC_DIA = 20, DOC_NI_PERSONA = 4, DOC_JUS_MAX = 40, DOC_COM_MAX = 80, DOC_BODY_MAX = 1100000;
let DOCS_OK = false;
async function ensureDocs(env) {
  if (DOCS_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS evento_docs (id INTEGER PRIMARY KEY AUTOINCREMENT, ev TEXT NOT NULL, kind TEXT NOT NULL, persona TEXT, de TEXT NOT NULL, por TEXT, nombre TEXT, mime TEXT NOT NULL, bytes INTEGER NOT NULL, hash TEXT, src TEXT NOT NULL, ts INTEGER NOT NULL, ref TEXT, concepto TEXT, importe REAL, fecha TEXT, estado TEXT, nota TEXT, leido INTEGER NOT NULL DEFAULT 0)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS evento_docs_ev ON evento_docs (ev, kind)").run();
  DOCS_OK = true;
}
const DOC_COLS = "id, ev, kind, persona, de, por, nombre, mime, bytes, ts, ref, concepto, importe, fecha, estado, nota, leido";
function docMeta(r) {
  return { id: r.id, kind: r.kind, persona: r.persona || "", de: r.de, por: r.por || "", nombre: r.nombre || "", mime: r.mime, bytes: +r.bytes, ts: +r.ts, ref: r.ref || "", concepto: r.concepto || "",
    importe: r.importe == null ? null : +r.importe, fecha: r.fecha || "", estado: r.estado || "", nota: r.nota || "", leido: !!r.leido };
}
/* lo que ve el cliente de lo que ha subido: sin quién lo ha mirado ni notas internas */
function docMetaCliente(r) { const m = docMeta(r); delete m.por; delete m.nota; delete m.leido; return m; }
/* un archivo en data URL: de verdad JPG, PNG, WebP o PDF (se mira la cabecera, no el nombre) y no demasiado grande */
function docArchivo(src, kind) {
  /* en Comunicación valen también los textos (el chat de WhatsApp o un correo exportados): texto plano UTF-8, sin caracteres binarios */
  if (kind === "comunicacion") {
    const t = /^data:text\/plain;base64,([A-Za-z0-9+/=]+)$/.exec(String(src || ""));
    if (t) {
      const bytes = Math.floor(t[1].length * 3 / 4) - (t[1].endsWith("==") ? 2 : t[1].endsWith("=") ? 1 : 0);
      if (bytes < 2) return { error: "invalid" };
      if (bytes > DOC_MAX) return { error: "too-big" };
      try { const bin = atob(t[1]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const txt = new TextDecoder("utf-8", { fatal: true }).decode(u); if (txt.indexOf("\u0000") >= 0) return { error: "invalid" }; } catch (_) { return { error: "invalid" }; }
      return { mime: "text/plain", bytes };
    }
  }
  const m = /^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/.exec(String(src || ""));
  if (!m) return null;
  const bytes = Math.floor(m[2].length * 3 / 4) - (m[2].endsWith("==") ? 2 : m[2].endsWith("=") ? 1 : 0);
  if (bytes < 40) return { error: "invalid" };
  if (bytes > DOC_MAX) return { error: "too-big" };
  let cab = ""; try { cab = atob(m[2].slice(0, 24)); } catch (_) { return null; }
  const ok = (m[1] === "image/jpeg" && cab.charCodeAt(0) === 0xFF && cab.charCodeAt(1) === 0xD8) || (m[1] === "image/png" && cab.slice(1, 4) === "PNG") || (m[1] === "image/webp" && cab.slice(0, 4) === "RIFF" && cab.slice(8, 12) === "WEBP") || (m[1] === "application/pdf" && cab.slice(0, 5) === "%PDF-");
  return ok ? { mime: m[1], bytes } : null;
}
function docErrorArchivo(f) {
  if (!f) return json({ error: "invalid", message: "Solo se pueden enviar fotos (JPG, PNG, WebP), PDF o, en Comunicación, textos (.txt)." }, 400);
  if (f.error === "too-big") return json({ error: "too-big", message: "El archivo es demasiado grande (máx. 600 KB). Mandad una foto o captura más pequeña, o un PDF más ligero." }, 413);
  if (f.error) return json({ error: "invalid", message: "El archivo no es válido." }, 400);
  return null;
}
/* quién puede ver y tocar cada tipo: la identidad, solo administración y eventos; los justificantes también contabilidad */
function docPermiso(s, kind) {
  if (!s) return false;
  if (kind === "dni") return s.role === "admin" || s.role === "eventos";
  if (kind === "justificante") return s.role === "admin" || s.role === "eventos" || s.role === "contabilidad";
  if (kind === "comunicacion") return s.role === "admin" || s.role === "eventos";
  return false;
}
function docNum(v) { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(n) && n >= 0 && n < 1e8 ? Math.round(n * 100) / 100 : null; }
function docFecha(v) { const s = String(v || "").slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ""; }
async function docsEquipo(request, env) {
  const s = await session(request, env);
  if (!s) return { err: json({ error: "unauth" }, 401) };
  if (s.role !== "admin" && s.role !== "eventos" && s.role !== "contabilidad") return { err: json({ error: "forbidden", message: "Tu rol no puede ver los documentos del evento." }, 403) };
  await ensureDocs(env);
  return { s };
}
/* GET /api/docs?ev=  los documentos del evento (sin el contenido), solo los que el rol puede ver */
async function docsGet(request, env, url) {
  const a = await docsEquipo(request, env); if (a.err) return a.err;
  const evId = String(url.searchParams.get("ev") || "").slice(0, 80); if (!evId) return json({ error: "invalid" }, 400);
  const { results } = await env.DB.prepare("SELECT " + DOC_COLS + " FROM evento_docs WHERE ev=?1 ORDER BY id").bind(evId).all();
  if (Math.random() < 0.03) { try { await docsLimpiar(env); } catch (_) {} }
  /* los adjuntos de Comunicación se piden aparte (&kind=comunicacion) y no salen en Documentos del evento */
  const soloCom = String(url.searchParams.get("kind") || "") === "comunicacion";
  return json({ ev: evId, docs: (results || []).filter((r) => docPermiso(a.s, r.kind) && (soloCom ? r.kind === "comunicacion" : r.kind !== "comunicacion")).map(docMeta), puede: { dni: docPermiso(a.s, "dni"), justificante: docPermiso(a.s, "justificante"), comunicacion: docPermiso(a.s, "comunicacion") } });
}
/* GET /api/docs/ver?id=  el archivo (los de identidad: cada apertura queda en el registro de actividad) */
async function docsVer(request, env, url) {
  const a = await docsEquipo(request, env); if (a.err) return a.err;
  const r = await env.DB.prepare("SELECT " + DOC_COLS + ", src FROM evento_docs WHERE id=?1").bind(Math.floor(+url.searchParams.get("id") || 0)).first();
  if (!r) return json({ error: "not-found" }, 404);
  if (!docPermiso(a.s, r.kind)) return json({ error: "forbidden", message: "Tu rol no puede ver este documento." }, 403);
  const m = /^data:([^;]+);base64,(.*)$/.exec(r.src || ""); if (!m) return json({ error: "not-found" }, 404);
  if (r.kind === "dni") { const ev = await porEventoPorId(env, r.ev); await logAct(env, a.s, "dni_visto", "Abrió un documento de identidad · " + String((ev && ev.name) || r.ev).slice(0, 80)); }
  const bin = atob(m[2]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Response(u, { headers: { "Content-Type": r.mime === "text/plain" ? "text/plain; charset=utf-8" : (r.mime || m[1]), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
}
/* POST /api/docs  {ev, kind, persona?, nombre, src, ref?, concepto?, importe?, fecha?, nota?}  el equipo sube uno */
async function docsSubir(request, env) {
  const a = await docsEquipo(request, env); if (a.err) return a.err;
  if ((+request.headers.get("content-length") || 0) > DOC_BODY_MAX) return json({ error: "too-big", message: "El archivo es demasiado grande (máx. 600 KB)." }, 413);
  const b = await body(request), kind = b.kind === "dni" ? "dni" : b.kind === "justificante" ? "justificante" : b.kind === "comunicacion" ? "comunicacion" : "";
  if (!kind || !docPermiso(a.s, kind)) return json({ error: "forbidden", message: "Tu rol no puede subir este tipo de documento." }, 403);
  const ev = await porEventoPorId(env, b.ev); if (!ev) return json({ error: "not-found" }, 404);
  const f = docArchivo(b.src, kind), er = docErrorArchivo(f); if (er) return er;
  const persona = kind === "dni" ? (String(b.persona) === "2" ? "2" : "1") : "";
  if (kind === "dni") { const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM evento_docs WHERE ev=?1 AND kind='dni' AND persona=?2").bind(ev.id, persona).first(); if (n && n.n >= DOC_NI_PERSONA) return json({ error: "limit", message: "Ya hay " + DOC_NI_PERSONA + " archivos de esta persona. Quita alguno para subir otro." }, 429); }
  else if (kind === "justificante") { const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM evento_docs WHERE ev=?1 AND kind='justificante'").bind(ev.id).first(); if (n && n.n >= DOC_JUS_MAX) return json({ error: "limit", message: "Ya hay " + DOC_JUS_MAX + " justificantes en este evento." }, 429); }
  else { const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM evento_docs WHERE ev=?1 AND kind='comunicacion'").bind(ev.id).first(); if (n && n.n >= DOC_COM_MAX) return json({ error: "limit", message: "Ya hay " + DOC_COM_MAX + " adjuntos de comunicación en este evento. Quita alguno para subir otro." }, 429); }
  const ahora = Date.now();
  const r = await env.DB.prepare("INSERT INTO evento_docs (ev, kind, persona, de, por, nombre, mime, bytes, hash, src, ts, ref, concepto, importe, fecha, estado, nota, leido) VALUES (?1,?2,?3,'equipo',?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,1)")
    .bind(ev.id, kind, persona, porTexto(a.s.name || a.s.email, 60), porTexto(b.nombre, 80), f.mime, f.bytes, porHash(b.src), b.src, ahora, porTexto(b.ref, 60), porTexto(b.concepto, 120), docNum(b.importe), docFecha(b.fecha), kind === "justificante" ? "confirmado" : "", porTexto(b.nota, 300)).run();
  await logAct(env, a.s, kind === "dni" ? "dni_subido" : kind === "comunicacion" ? "adjunto_subido" : "justificante_subido", (kind === "dni" ? "Documento de identidad" : kind === "comunicacion" ? "Adjunto en Comunicación" : "Justificante de pago") + " · " + String(ev.name || "").slice(0, 80));
  const nid = (r.meta && r.meta.last_row_id) || (await env.DB.prepare("SELECT MAX(id) AS id FROM evento_docs").first()).id;
  const fila = await env.DB.prepare("SELECT " + DOC_COLS + " FROM evento_docs WHERE id=?1").bind(nid).first();
  return json({ ok: true, doc: fila ? docMeta(fila) : null });
}
/* POST /api/docs/editar  {id, ref?, concepto?, importe?, fecha?, estado?, nota?, persona?} */
async function docsEditar(request, env) {
  const a = await docsEquipo(request, env); if (a.err) return a.err;
  const b = await body(request), r = await env.DB.prepare("SELECT " + DOC_COLS + " FROM evento_docs WHERE id=?1").bind(Math.floor(+b.id || 0)).first();
  if (!r) return json({ error: "not-found" }, 404);
  if (!docPermiso(a.s, r.kind)) return json({ error: "forbidden" }, 403);
  const sets = [], vals = []; let i = 1;
  const poner = (col, v) => { sets.push(col + "=?" + (i++)); vals.push(v); };
  if (b.ref !== undefined) poner("ref", porTexto(b.ref, 60));
  if (b.concepto !== undefined) poner("concepto", porTexto(b.concepto, 120));
  if (b.importe !== undefined) poner("importe", docNum(b.importe));
  if (b.fecha !== undefined) poner("fecha", docFecha(b.fecha));
  if (b.nota !== undefined) poner("nota", porTexto(b.nota, 300));
  if (b.estado !== undefined && r.kind === "justificante") poner("estado", b.estado === "confirmado" ? "confirmado" : "pendiente");
  if (b.persona !== undefined && r.kind === "dni") poner("persona", String(b.persona) === "2" ? "2" : "1");
  if (!sets.length) return json({ ok: true });
  vals.push(r.id);
  await env.DB.prepare("UPDATE evento_docs SET " + sets.join(", ") + " WHERE id=?" + i).bind(...vals).run();
  const fila = await env.DB.prepare("SELECT " + DOC_COLS + " FROM evento_docs WHERE id=?1").bind(r.id).first();
  if (b.estado !== undefined && r.kind === "justificante" && (r.estado || "") !== (fila.estado || "")) { const ev = await porEventoPorId(env, r.ev); await logAct(env, a.s, "justificante_estado", (fila.estado === "confirmado" ? "Confirmó" : "Dejó pendiente") + " un justificante · " + String((ev && ev.name) || "").slice(0, 80)); }
  return json({ ok: true, doc: docMeta(fila) });
}
/* POST /api/docs/borrar  {id} */
async function docsBorrar(request, env) {
  const a = await docsEquipo(request, env); if (a.err) return a.err;
  const b = await body(request), r = await env.DB.prepare("SELECT id, ev, kind FROM evento_docs WHERE id=?1").bind(Math.floor(+b.id || 0)).first();
  if (!r) return json({ error: "not-found" }, 404);
  if (!docPermiso(a.s, r.kind)) return json({ error: "forbidden" }, 403);
  await env.DB.prepare("DELETE FROM evento_docs WHERE id=?1").bind(r.id).run();
  const ev = await porEventoPorId(env, r.ev);
  await logAct(env, a.s, r.kind === "dni" ? "dni_borrado" : r.kind === "comunicacion" ? "adjunto_borrado" : "justificante_borrado", (r.kind === "dni" ? "Documento de identidad" : r.kind === "comunicacion" ? "Adjunto de Comunicación" : "Justificante") + " · " + String((ev && ev.name) || "").slice(0, 80));
  return json({ ok: true });
}
/* POST /api/docs/leido  {ev}  lo que subieron los clientes ya está visto */
async function docsLeido(request, env) {
  const a = await docsEquipo(request, env); if (a.err) return a.err;
  const b = await body(request), id = String(b.ev || "").slice(0, 80);
  if (a.s.role === "contabilidad") await env.DB.prepare("UPDATE evento_docs SET leido=1 WHERE ev=?1 AND de='cliente' AND kind='justificante'").bind(id).run();
  else await env.DB.prepare("UPDATE evento_docs SET leido=1 WHERE ev=?1 AND de='cliente'").bind(id).run();
  return json({ ok: true });
}
/* los documentos de identidad se borran solos pasados N días del evento (Parámetros → Privacidad) */
async function docsLimpiar(env) {
  await ensureDocs(env);
  const cfg = await privCfg(env), dias = +cfg.dniDias || 0; if (dias <= 0) return 0;
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first(); let doc = {}; try { doc = JSON.parse((row && row.data) || "{}") || {}; } catch (_) {}
  const evs = {}; (doc.events || []).forEach((e) => { if (e && e.id) evs[e.id] = e; });
  const { results } = await env.DB.prepare("SELECT id, ev FROM evento_docs WHERE kind='dni'").all();
  const ahora = Date.now(); let n = 0;
  for (const r of results || []) {
    const e = evs[r.ev], f = e && e.ficha && e.ficha.fecha;
    if (f && /^\d{4}-\d{2}-\d{2}$/.test(f) && Date.parse(f + "T00:00:00Z") + dias * 864e5 < ahora) { await env.DB.prepare("DELETE FROM evento_docs WHERE id=?1").bind(r.id).run(); n++; }
  }
  if (n) await logAct(env, null, "dni_caducados", n + (n === 1 ? " documento de identidad borrado" : " documentos de identidad borrados") + " (pasaron " + dias + " días del evento)");
  return n;
}

/* ── PLANOS DE FONDO COMPARTIDOS ───────────────────────────────────────────
   La imagen del salón sobre la que se dibuja el plano de mesas. Antes vivía solo
   en el navegador de quien la subía; ahora se guarda aquí, aparte del documento
   de eventos (la base de datos admite 2 MB por registro y el documento ya lleva
   todo el negocio). Claves: «loc:interior» / «loc:exterior» (comunes a todos los
   eventos) y «ev:<id>:interior|exterior» (propios de un evento, p. ej. un catering).
   Al quitar un plano queda una marca de borrado (del=1) para que los demás
   dispositivos también lo quiten. */
let PL_OK = false;
const PL_MAX = 1600000, PL_KEY = /^(loc:(interior|exterior)|ev:[A-Za-z0-9_.-]{1,80}:(interior|exterior))$/;
async function ensurePlanos(env) {
  if (PL_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS planos (k TEXT PRIMARY KEY, w INTEGER, h INTEGER, v INTEGER NOT NULL, by_name TEXT, del INTEGER NOT NULL DEFAULT 0, src TEXT)").run();
  PL_OK = true;
}
async function planosList(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  await ensurePlanos(env);
  const { results } = await env.DB.prepare("SELECT k, w, h, v, by_name, del, LENGTH(src) AS bytes FROM planos ORDER BY k").all();
  const lista = (results || []).map((r) => ({ k: r.k, w: r.w, h: r.h, v: +r.v, by: r.by_name || "", del: !!r.del, bytes: r.bytes || 0 }));
  /* de vez en cuando: fuera los planos propios de eventos que ya no existen (ni en la papelera) tras 45 días */
  if (Math.random() < 0.02) { try { await planosLimpiar(env); } catch (_) {} }
  return json({ p: lista.reduce((m, r) => Math.max(m, r.v), 0), planos: lista });
}
async function planosLimpiar(env) {
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first(); if (!row) return;
  let doc = {}; try { doc = JSON.parse(row.data) || {}; } catch (_) { return; }
  const vivos = {}; (doc.events || []).forEach((e) => { if (e && e.id) vivos[e.id] = 1; });
  await ensureBackups(env);
  const pap = await env.DB.prepare("SELECT event_id FROM papelera").all();
  (pap.results || []).forEach((r) => { vivos[r.event_id] = 1; });
  const { results } = await env.DB.prepare("SELECT k, v FROM planos WHERE k LIKE 'ev:%'").all();
  const lim = Date.now() - 45 * 864e5;
  for (const r of (results || [])) { const id = String(r.k).split(":")[1]; if (!vivos[id] && +r.v < lim) await env.DB.prepare("DELETE FROM planos WHERE k=?1").bind(r.k).run(); }
}
async function planosVer(request, env, url) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  await ensurePlanos(env);
  const k = String(url.searchParams.get("k") || "");
  if (!PL_KEY.test(k)) return json({ error: "invalid" }, 400);
  const r = await env.DB.prepare("SELECT k, w, h, v, del, src FROM planos WHERE k=?1").bind(k).first();
  if (!r || r.del || !r.src) return json({ error: "not-found" }, 404);
  return json({ k: r.k, w: r.w, h: r.h, v: +r.v, src: r.src });
}
function planosPuede(s) { return s && (s.role === "admin" || s.role === "eventos" || s.role === "servicio"); }
async function planosPut(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (!planosPuede(s)) return json({ error: "forbidden", message: "Tu rol no puede cambiar el plano de fondo." }, 403);
  await ensurePlanos(env);
  const b = await body(request), k = String(b.k || ""), src = String(b.src || ""), w = Math.round(+b.w), h = Math.round(+b.h);
  if (!PL_KEY.test(k) || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(src) || !(w > 0 && w <= 6000) || !(h > 0 && h <= 6000)) return json({ error: "invalid", message: "Imagen o medidas no válidas." }, 400);
  if (src.length > PL_MAX) return json({ error: "too-big", message: "La imagen es demasiado grande (máx. 1,6 MB)." }, 413);
  let v = Date.now(); const prev = await env.DB.prepare("SELECT v FROM planos WHERE k=?1").bind(k).first(); if (prev && v <= +prev.v) v = +prev.v + 1;
  await env.DB.prepare("INSERT INTO planos (k, w, h, v, by_name, del, src) VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6) ON CONFLICT(k) DO UPDATE SET w=?2, h=?3, v=?4, by_name=?5, del=0, src=?6")
    .bind(k, w, h, v, s.name || s.email || "", src).run();
  await logAct(env, s, "plano_subido", k.replace(/^loc:/, "Plano común: ").replace(/^ev:[^:]+:/, "Plano propio de un evento: "));
  return json({ ok: true, v });
}
async function planosDel(request, env, url) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (!planosPuede(s)) return json({ error: "forbidden", message: "Tu rol no puede cambiar el plano de fondo." }, 403);
  await ensurePlanos(env);
  const k = String(url.searchParams.get("k") || ""); if (!PL_KEY.test(k)) return json({ error: "invalid" }, 400);
  let v = Date.now(); const prev = await env.DB.prepare("SELECT v FROM planos WHERE k=?1").bind(k).first(); if (prev && v <= +prev.v) v = +prev.v + 1;
  await env.DB.prepare("INSERT INTO planos (k, w, h, v, by_name, del, src) VALUES (?1, 0, 0, ?2, ?3, 1, NULL) ON CONFLICT(k) DO UPDATE SET v=?2, by_name=?3, del=1, src=NULL, w=0, h=0")
    .bind(k, v, s.name || s.email || "").run();
  await logAct(env, s, "plano_quitado", k.replace(/^loc:/, "Plano común: ").replace(/^ev:[^:]+:/, "Plano propio de un evento: "));
  return json({ ok: true, v });
}

/* ── MODO SERVICIO (el día del evento) ───────────────────────────────────────
   Varios móviles a la vez (sala, cocina, responsable) ven y cambian el mismo
   estado del servicio en directo: qué plato ha salido y a qué hora real, qué
   invitados han llegado y las incidencias («falta pan en la mesa 4»). No va
   dentro del documento del negocio: son muchos cambios pequeños y seguidos, y
   si fueran en el documento se pisarían entre sí. Cada dato es una fila
   (evento + clave) con un número de versión que sube con cada cambio, así cada
   móvil solo pide «lo que ha cambiado desde la versión N» y llega en segundos.
     paso:<id>      un tiempo de la escaleta o una parada: {t: hora real de salida, t2: hora de fin (paradas)}
     pres:<mesa>:<h> un invitado ha llegado: {t}. La clave lleva una huella del nombre, no el nombre
     inc:<id>       una incidencia: {txt, mesa, estado: abierta|hecha, autor, t, rt, rby}
     nota / estado  nota libre del servicio · {ini, fin} cuando el responsable empieza o termina
   Al terminar, la app guarda un resumen (horas reales frente a las previstas)
   dentro del evento y esto se borra solo a los 90 días. «nx» = solo si no
   estaba ya (así dos personas que pulsan «Salido» a la vez no se pisan la hora). */
let SV_OK = false;
const SV_KEY = /^(paso:[A-Za-z0-9_:.-]{1,70}|pres:[A-Za-z0-9_:-]{1,50}|inc:[A-Za-z0-9_-]{1,30}|nota|estado)$/;
const SV_EV = /^[A-Za-z0-9_.-]{1,80}$/;
const SV_MAX_FILAS = 3000, SV_MAX_OPS = 60, SV_PAGINA = 1000;
async function ensureServicio(env) {
  if (SV_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS servicio (ev TEXT NOT NULL, k TEXT NOT NULL, v TEXT, t INTEGER NOT NULL, by_name TEXT, del INTEGER NOT NULL DEFAULT 0, seq INTEGER NOT NULL, PRIMARY KEY (ev, k))").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS servicio_seq ON servicio (ev, seq)").run();
  SV_OK = true;
}
/* el servicio lo ven todos los roles salvo Compras y Contabilidad (que no están en sala) */
function servicioPuede(s) { return !!s && s.role !== "compras" && s.role !== "contabilidad"; }
async function servicioDelta(env, ev, since) {
  const mx = await env.DB.prepare("SELECT COALESCE(MAX(seq), 0) AS m FROM servicio WHERE ev=?1").bind(ev).first();
  const tope = (mx && +mx.m) || 0;
  /* si el móvil dice una versión mayor que la que hay (se restauró una copia o se limpió), que empiece de cero */
  let reset = false; if (since > tope) { since = 0; reset = true; }
  const { results } = await env.DB.prepare("SELECT k, v, t, by_name, del, seq FROM servicio WHERE ev=?1 AND seq>?2 ORDER BY seq LIMIT " + SV_PAGINA).bind(ev, since).all();
  const items = (results || []).map((r) => { let v = null; try { v = r.v == null ? null : JSON.parse(r.v); } catch (_) {} return { k: r.k, v, t: +r.t, by: r.by_name || "", del: !!r.del, seq: +r.seq }; });
  const seq = items.length ? items[items.length - 1].seq : since;
  return { seq, now: Date.now(), items, more: items.length >= SV_PAGINA, reset };
}
async function servicioGet(request, env, url) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (!servicioPuede(s)) return json({ error: "forbidden", message: "Tu rol no tiene el modo servicio." }, 403);
  const ev = String(url.searchParams.get("ev") || ""); if (!SV_EV.test(ev)) return json({ error: "invalid" }, 400);
  await ensureServicio(env);
  if (Math.random() < 0.01) { try { await env.DB.prepare("DELETE FROM servicio WHERE t < ?1").bind(Date.now() - 90 * 864e5).run(); } catch (_) {} }
  return json(await servicioDelta(env, ev, Math.max(0, Math.floor(+url.searchParams.get("since") || 0))));
}
/* lo que se guarda de cada cosa, limpio: el móvil no decide nada más que el contenido */
function svLimpiar(k, v, ahora, previo, nombre) {
  const num = (x, def) => { x = +x; return isFinite(x) && Math.abs(x - ahora) < 36 * 36e5 ? Math.round(x) : def; };
  const txt = (x, n) => String(x == null ? "" : x).replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, n);
  v = v && typeof v === "object" ? v : {};
  if (k.startsWith("paso:")) { const o = { t: num(v.t, ahora) }; if (v.t2 != null) o.t2 = num(v.t2, ahora); return o; }
  if (k.startsWith("pres:")) return { t: num(v.t, ahora) };
  if (k.startsWith("inc:")) {
    const o = { txt: txt(v.txt, 300), mesa: txt(v.mesa, 40), cat: txt(v.cat, 30), estado: v.estado === "hecha" ? "hecha" : "abierta", t: previo && previo.t ? +previo.t : num(v.t, ahora), autor: previo && previo.autor ? previo.autor : nombre };
    if (!o.txt && !o.cat) return null;
    if (o.estado === "hecha") { o.rt = num(v.rt, ahora); o.rby = nombre; }
    return o;
  }
  if (k === "nota") return { txt: txt(v.txt, 2000) };
  if (k === "estado") { const o = {}; if (v.ini != null) o.ini = num(v.ini, ahora); if (v.fin != null) o.fin = num(v.fin, ahora); return o; }
  return null;
}
async function servicioPost(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (!servicioPuede(s)) return json({ error: "forbidden", message: "Tu rol no tiene el modo servicio." }, 403);
  const b = await body(request), ev = String(b.ev || "");
  if (!SV_EV.test(ev) || !Array.isArray(b.ops) || b.ops.length > SV_MAX_OPS) return json({ error: "invalid" }, 400);
  await ensureServicio(env);
  const nombre = s.name || s.email || "", ahora = Date.now();
  const cnt = await env.DB.prepare("SELECT COUNT(*) AS n FROM servicio WHERE ev=?1").bind(ev).first();
  let filas = (cnt && +cnt.n) || 0, hechas = 0, finServicio = false;
  for (const op of b.ops) {
    const k = String(op && op.k || ""); if (!SV_KEY.test(k)) continue;
    const prev = await env.DB.prepare("SELECT v, del FROM servicio WHERE ev=?1 AND k=?2").bind(ev, k).first();
    let pv = null; try { pv = prev && prev.v ? JSON.parse(prev.v) : null; } catch (_) {}
    const vivo = !!(prev && !prev.del);
    if (op.nx && vivo) continue;
    let val = null, del = 0;
    if (op.del) del = 1; else { val = svLimpiar(k, op.v, ahora, pv, nombre); if (!val) continue; }
    if (del && !vivo) continue;
    if (!prev && filas >= SV_MAX_FILAS) return json({ error: "too-many", message: "Demasiados datos en este servicio." }, 429);
    if (!prev) filas++;
    await env.DB.prepare("INSERT INTO servicio (ev, k, v, t, by_name, del, seq) VALUES (?1, ?2, ?3, ?4, ?5, ?6, (SELECT COALESCE(MAX(seq), 0) + 1 FROM servicio WHERE ev=?1)) ON CONFLICT(ev, k) DO UPDATE SET v=?3, t=?4, by_name=?5, del=?6, seq=(SELECT COALESCE(MAX(seq), 0) + 1 FROM servicio WHERE ev=?1)")
      .bind(ev, k, del ? null : JSON.stringify(val), ahora, nombre, del).run();
    hechas++;
    if (k === "estado" && val && val.fin) finServicio = true;
  }
  if (finServicio) { try { await logAct(env, s, "servicio_terminado", "Servicio terminado (evento " + ev + ")"); } catch (_) {} }
  const d = await servicioDelta(env, ev, Math.max(0, Math.floor(+b.since || 0)));
  d.ok = true; d.hechas = hechas;
  return json(d);
}

/* ── PORTAL DEL CLIENTE AMPLIADO ──────────────────────────────────────────────
   Lo que el cliente puede hacer en su página privada (enlace ?cliente=<clave>), además de rellenar su lista:
   · ACEPTAR el contrato o la propuesta que el equipo publica (nombre, NIF, fecha, hora y huella del texto; queda guardado entero en e.contrato.firmado).
   · APROBAR el menú y la minuta, con su nombre y la fecha. Queda en el propio evento (e.aprobaciones), así que sale en
     su historial. Si el equipo cambia el menú o publica otra minuta después, la aprobación deja de valer y se vuelve a pedir
     (cada aprobación apunta a «la huella» de lo que se aprobó).
   · MANDAR su logo y fotos de inspiración (se guardan aparte, en portal_arch: no caben en el documento de eventos).
   · VER el plano de la sala (viene en la «foto» del evento que ya calcula la app) y ESCRIBIR AL EQUIPO (portal_msg); el
     equipo contesta desde la app y el cliente lo ve en su página.
   La minuta que ve el cliente es una imagen que el equipo «publica» desde la app (kind «minuta» en portal_arch).
   Solo con enlace largo («fuerte»): los enlaces antiguos, cortos, siguen siendo de solo lectura. Límites: 8 fotos y 1 logo
   por evento, 500 KB por imagen, 30 mensajes por día. Todo se borra al anonimizar el evento. */
let POR_OK = false;
const POR_IMG_MAX = 500000, POR_FOTOS_MAX = 8, POR_MSG_DIA = 30, POR_ARCH_DIA = 40;
async function ensurePortal(env) {
  if (POR_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS portal_msg (id INTEGER PRIMARY KEY AUTOINCREMENT, ev TEXT NOT NULL, ts INTEGER NOT NULL, de TEXT NOT NULL, nombre TEXT, texto TEXT NOT NULL, leido INTEGER NOT NULL DEFAULT 0)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS portal_msg_ev ON portal_msg (ev, id)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS portal_arch (id INTEGER PRIMARY KEY AUTOINCREMENT, ev TEXT NOT NULL, kind TEXT NOT NULL, de TEXT NOT NULL, nombre TEXT, mime TEXT NOT NULL, w INTEGER, h INTEGER, bytes INTEGER NOT NULL, hash TEXT, src TEXT NOT NULL, ts INTEGER NOT NULL, leido INTEGER NOT NULL DEFAULT 0)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS portal_arch_ev ON portal_arch (ev, kind)").run();
  POR_OK = true;
}
function porHash(s) { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
/* el documento (propuesta o contrato) que el equipo ha publicado: lo que el cliente ve es la «foto» del portal (share.portal.contrato) */
function porContratoDe(ev) { const c = ev.share && ev.share.portal && ev.share.portal.contrato; return c && typeof c.texto === "string" && c.texto ? c : null; }
function porMenuHash(ev) { const p = (ev.share && ev.share.portal) || {}; return porHash(JSON.stringify(p.menu || [])); }
function porTexto(v, n) { return String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f<>]/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, n); }
/* una imagen en data URL: de verdad JPEG, PNG o WebP (se mira la cabecera, no lo que diga el nombre) y no demasiado grande */
function porImagen(src) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(src || ""));
  if (!m) return null;
  const bytes = Math.floor(m[2].length * 3 / 4) - (m[2].endsWith("==") ? 2 : m[2].endsWith("=") ? 1 : 0);
  if (bytes < 40 || bytes > POR_IMG_MAX) return { error: bytes < 40 ? "invalid" : "too-big" };
  let cab = ""; try { cab = atob(m[2].slice(0, 24)); } catch (_) { return null; }
  const ok = (m[1] === "image/jpeg" && cab.charCodeAt(0) === 0xFF && cab.charCodeAt(1) === 0xD8) || (m[1] === "image/png" && cab.slice(1, 4) === "PNG") || (m[1] === "image/webp" && cab.slice(0, 4) === "RIFF" && cab.slice(8, 12) === "WEBP");
  return ok ? { mime: m[1], bytes } : null;
}
/* en qué punto está cada aprobación: vale solo si apunta a lo que hay ahora */
function porEstado(ev, minuta) {
  const ap = ev.aprobaciones || {}, mh = porMenuHash(ev), o = {};
  const fila = (a, vigente) => (a && a.ts ? { ok: !!vigente, ts: a.ts, nombre: a.nombre || "", desactualizada: !vigente } : { ok: false, ts: 0, nombre: "", desactualizada: false });
  o.menu = fila(ap.menu, ap.menu && ap.menu.h === mh);
  o.minuta = minuta ? fila(ap.minuta, ap.minuta && ap.minuta.h === minuta.hash) : { ok: false, ts: 0, nombre: "", desactualizada: false, sin: true };
  o.menuHash = mh;
  const co = porContratoDe(ev), ch = co ? porHash(co.texto) : "";
  o.contrato = co ? fila(ap.contrato, ap.contrato && ap.contrato.h === ch) : { ok: false, ts: 0, nombre: "", desactualizada: false, sin: true };
  o.contrato2 = co ? fila(ap.contrato2, ap.contrato2 && ap.contrato2.h === ch) : { ok: false, ts: 0, nombre: "", desactualizada: false, sin: true };
  o.contratoFirmantes = co ? (Math.floor(+co.firmantes) === 2 ? 2 : 1) : 0;
  o.contratoHash = ch;
  return o;
}
async function porDatos(env, ev, limiteMsgs) {
  await ensurePortal(env);
  const msgs = await env.DB.prepare("SELECT id, ts, de, nombre, texto, leido FROM portal_msg WHERE ev=?1 ORDER BY id DESC LIMIT ?2").bind(ev.id, limiteMsgs || 100).all();
  const arch = await env.DB.prepare("SELECT id, kind, de, nombre, mime, w, h, bytes, hash, ts, leido FROM portal_arch WHERE ev=?1 ORDER BY id").bind(ev.id).all();
  const A = (arch.results || []).map((r) => ({ id: r.id, kind: r.kind, de: r.de, nombre: r.nombre || "", mime: r.mime, w: r.w, h: r.h, bytes: r.bytes, hash: r.hash, ts: +r.ts, leido: !!r.leido }));
  const minuta = A.filter((x) => x.kind === "minuta").pop() || null;
  await ensureDocs(env);
  const dr = await env.DB.prepare("SELECT " + DOC_COLS + " FROM evento_docs WHERE ev=?1 ORDER BY id").bind(ev.id).all();
  const docs = (dr.results || []).map(docMetaCliente);
  return { docs, msgs: (msgs.results || []).reverse().map((r) => ({ id: r.id, ts: +r.ts, de: r.de, nombre: r.nombre || "", texto: r.texto, leido: !!r.leido })), arch: A, minuta, estado: porEstado(ev, minuta) };
}
/* escribe una aprobación en el evento sin pisar nada más: solo se sellan las rutas de «aprobaciones» */
function porAprobar(doc, evId, item, nombre, h, ahora, firmado) {
  const lista = doc.events || [], i = lista.findIndex((e) => e && e.id === evId);
  if (i < 0) return { cambios: 0 };
  const e = lista[i];
  e.aprobaciones = e.aprobaciones || {};
  const dos = item === "contrato" && firmado && firmado.firmante === 2;
  e.aprobaciones[dos ? "contrato2" : item] = { ts: ahora, nombre, h };
  /* el contrato aceptado queda guardado ENTERO (texto, quién, NIF, cuándo y huella) en el propio evento, aparte de lo que se publique después;
     si lo firman dos personas (los dos clientes), cada una deja lo suyo: firmado y firmado2 */
  if (item === "contrato" && firmado) { e.contrato = e.contrato || {}; e.contrato[dos ? "firmado2" : "firmado"] = firmado; }
  e.updated = Math.max(ahora, (+e.updated || 0) + 1);
  e._k = e._k || {};
  const K_CON = "contrato" + K_SEP + "firmado";
  kCaminos(e).filter((p) => p.indexOf("aprobaciones") === 0 || p.indexOf(K_CON) === 0).forEach((p) => { e._k[p] = e.updated; });
  return { cambios: 1 };
}
async function porClienteSesion(request, env, url, soloLectura) {
  const token = (url.searchParams.get("t") || "").trim();
  const ac = await eventoDeCliente(request, env, token, "Este enlace ya no está activo."); if (ac.res) return { err: ac.res };
  const ev = ac.ev;
  if (!soloLectura && !tokenFuerte(token)) return { err: json({ error: "old-link", message: "Este enlace es antiguo. Pedid a Les Moles uno nuevo para poder usar esto." }, 403) };
  return { ev, token };
}
/* GET /api/share/img?t=..&id=.. — la imagen de una de SUS cosas (o la minuta que el equipo le ha publicado) */
async function porImgCliente(request, env, url) {
  const a = await porClienteSesion(request, env, url, true); if (a.err) return a.err;
  await ensurePortal(env);
  const r = await env.DB.prepare("SELECT mime, src FROM portal_arch WHERE id=?1 AND ev=?2").bind(Math.floor(+url.searchParams.get("id") || 0), a.ev.id).first();
  return porSirve(r);
}
function porSirve(r) {
  if (!r) return json({ error: "not-found" }, 404);
  const m = /^data:([^;]+);base64,(.*)$/.exec(r.src || ""); if (!m) return json({ error: "not-found" }, 404);
  const bin = atob(m[2]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Response(u, { headers: { "Content-Type": r.mime || m[1], "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" } });
}
/* POST /api/share/accion?t=..  {tipo: aprobar | comentario | archivo | quitar} */
async function porAccion(request, env, url) {
  const a = await porClienteSesion(request, env, url, false); if (a.err) return a.err;
  const { ev } = a, b = await body(request), ahora = Date.now();
  await ensurePortal(env);
  if (b.tipo === "comentario") {
    const texto = porTexto(b.texto, 1500); if (!texto) return json({ error: "invalid", message: "Escribid el mensaje." }, 400);
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM portal_msg WHERE ev=?1 AND de='cliente' AND ts>?2").bind(ev.id, ahora - 864e5).first();
    if (n && n.n >= POR_MSG_DIA) return json({ error: "limit", message: "Habéis mandado muchos mensajes hoy. Llamad a Les Moles si es urgente." }, 429);
    const nombre = porTexto(b.nombre, 60);
    await env.DB.prepare("INSERT INTO portal_msg (ev, ts, de, nombre, texto, leido) VALUES (?1, ?2, 'cliente', ?3, ?4, 0)").bind(ev.id, ahora, nombre, texto).run();
    return json({ ok: true, ...(await porDatos(env, ev)) });
  }
  if (b.tipo === "aprobar") {
    const item = b.item === "menu" || b.item === "minuta" || b.item === "contrato" ? b.item : "", nombre = porTexto(b.nombre, 80);
    if (!item) return json({ error: "invalid" }, 400);
    if (nombre.length < 2) return json({ error: "invalid", message: "Escribid vuestro nombre para aprobar." }, 400);
    const d = await porDatos(env, ev); let h, firmado = null;
    if (item === "menu") { h = d.estado.menuHash; if (!((ev.share.portal || {}).menu || []).length) return json({ error: "invalid", message: "Todavía no hay menú que aprobar." }, 400); }
    else if (item === "contrato") {
      const co = porContratoDe(ev); if (!co) return json({ error: "invalid", message: "Ahora mismo no hay nada que aceptar." }, 400);
      const firmante = String(b.firmante) === "2" ? 2 : 1;
      if (firmante === 2 && Math.floor(+co.firmantes) !== 2) return json({ error: "invalid", message: "Este documento tiene un solo firmante." }, 400);
      const nif = String(b.nif || "").replace(/[\s.\-]/g, "").toUpperCase();
      if (!/^[A-Z0-9]{6,12}$/.test(nif)) return json({ error: "invalid", message: "Escribid vuestro NIF, DNI o NIE (sin espacios)." }, 400);
      /* lo que el cliente ve y lo que el equipo tiene publicado tienen que ser lo mismo (si no, la «foto» va por detrás) */
      if (!(ev.contrato && ev.contrato.texto === co.texto)) return json({ error: "cambio", message: "El documento acaba de cambiar: leedlo otra vez." }, 409);
      h = porHash(co.texto);
      if (b.h !== h) return json({ error: "cambio", message: "El documento acaba de cambiar: leedlo otra vez." }, 409);
      const em = co.emp && typeof co.emp === "object" ? { marca: porTexto(co.emp.marca, 80), razon: porTexto(co.emp.razon, 120), rep: porTexto(co.emp.rep, 120), pie: Array.isArray(co.emp.pie) ? co.emp.pie.slice(0, 8).map((x) => porTexto(x, 90)) : [] } : null;
      firmado = { tipo: co.tipo === "propuesta" ? "propuesta" : "contrato", ver: Math.max(1, Math.floor(+co.ver) || 1), fecha: porTexto(co.fecha, 10), texto: co.texto, emp: em, h, ts: ahora, nombre, nif, firmante };
    }
    else { if (!d.minuta) return json({ error: "invalid", message: "Todavía no hay minuta que aprobar." }, 400); h = d.minuta.hash; }
    if (item !== "contrato" && b.h && b.h !== h) return json({ error: "cambio", message: item === "menu" ? "El menú acaba de cambiar: revisadlo otra vez." : "La minuta acaba de cambiar: revisadla otra vez." }, 409);
    const r = await storeEditar(env, (doc) => porAprobar(doc, ev.id, item, nombre, h, ahora, firmado));
    if (!r.ok) return json({ error: "busy", message: "Había muchos cambios a la vez. Probad otra vez." }, 409);
    const ev2 = await eventoCompartido(env, a.token) || ev;
    /* queda en el historial del evento, con el nombre de quien aprobó */
    try { await ensureHistorial(env); await hiAnotar(env, ev2, ev, item === "contrato" ? ["aprobaciones", "contrato"] : ["aprobaciones"], "", nombre + " (cliente)", item === "contrato" ? ("Aceptó " + (firmado.tipo === "propuesta" ? "la propuesta" : "el contrato") + " (versión " + firmado.ver + ")") : "Aprobó " + (item === "menu" ? "el menú" : "la minuta"), ahora, false); } catch (_) {}
    return json({ ok: true, ...(await porDatos(env, ev2)) });
  }
  if (b.tipo === "doc") {
    await ensureDocs(env);
    if ((+request.headers.get("content-length") || 0) > DOC_BODY_MAX) return json({ error: "too-big", message: "El archivo es demasiado grande (máx. 600 KB)." }, 413);
    const kind = b.kind === "dni" ? "dni" : b.kind === "justificante" ? "justificante" : ""; if (!kind) return json({ error: "invalid" }, 400);
    const f = docArchivo(b.src), er = docErrorArchivo(f); if (er) return er;
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM evento_docs WHERE ev=?1 AND de='cliente' AND ts>?2").bind(ev.id, ahora - 864e5).first();
    if (n && n.n >= DOC_DIA) return json({ error: "limit", message: "Habéis subido muchos archivos hoy. Llamad a Les Moles si es urgente." }, 429);
    const persona = kind === "dni" ? (String(b.persona) === "2" ? "2" : "1") : "";
    if (kind === "dni") { const c = await env.DB.prepare("SELECT COUNT(*) AS n FROM evento_docs WHERE ev=?1 AND kind='dni' AND persona=?2").bind(ev.id, persona).first(); if (c && c.n >= DOC_NI_PERSONA) return json({ error: "limit", message: "Ya hay " + DOC_NI_PERSONA + " archivos de esta persona. Quitad alguno para subir otro." }, 429); }
    else { const c = await env.DB.prepare("SELECT COUNT(*) AS n FROM evento_docs WHERE ev=?1 AND kind='justificante'").bind(ev.id).first(); if (c && c.n >= DOC_JUS_MAX) return json({ error: "limit", message: "Ya hay muchos justificantes. Escribid a Les Moles." }, 429); }
    await env.DB.prepare("INSERT INTO evento_docs (ev, kind, persona, de, por, nombre, mime, bytes, hash, src, ts, ref, concepto, importe, fecha, estado, nota, leido) VALUES (?1,?2,?3,'cliente',?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,'',0)")
      .bind(ev.id, kind, persona, porTexto(b.por, 60), porTexto(b.nombre, 80), f.mime, f.bytes, porHash(b.src), b.src, ahora, porTexto(b.ref, 60), porTexto(b.concepto, 120), docNum(b.importe), docFecha(b.fecha), kind === "justificante" ? "pendiente" : "").run();
    return json({ ok: true, ...(await porDatos(env, ev)) });
  }
  if (b.tipo === "doc-quitar") {
    await ensureDocs(env);
    const r = await env.DB.prepare("SELECT id, kind, estado FROM evento_docs WHERE id=?1 AND ev=?2 AND de='cliente'").bind(Math.floor(+b.id || 0), ev.id).first();
    if (!r) return json({ error: "not-found" }, 404);
    if (r.kind === "justificante" && r.estado === "confirmado") return json({ error: "invalid", message: "Este justificante ya lo ha confirmado Les Moles. Escribidnos si hay que quitarlo." }, 400);
    await env.DB.prepare("DELETE FROM evento_docs WHERE id=?1").bind(r.id).run();
    return json({ ok: true, ...(await porDatos(env, ev)) });
  }
  if (b.tipo === "archivo") {
    const kind = b.kind === "logo" ? "logo" : b.kind === "foto" ? "foto" : ""; if (!kind) return json({ error: "invalid" }, 400);
    const im = porImagen(b.src); if (!im) return json({ error: "invalid", message: "Solo se pueden enviar imágenes JPG, PNG o WebP." }, 400);
    if (im.error === "too-big") return json({ error: "too-big", message: "La imagen es demasiado grande (máx. 500 KB). Probad con una más pequeña." }, 413);
    if (im.error) return json({ error: "invalid", message: "La imagen no es válida." }, 400);
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM portal_arch WHERE ev=?1 AND de='cliente' AND ts>?2").bind(ev.id, ahora - 864e5).first();
    if (n && n.n >= POR_ARCH_DIA) return json({ error: "limit", message: "Habéis subido muchos archivos hoy." }, 429);
    if (kind === "logo") await env.DB.prepare("DELETE FROM portal_arch WHERE ev=?1 AND kind='logo'").bind(ev.id).run();
    else { const f = await env.DB.prepare("SELECT COUNT(*) AS n FROM portal_arch WHERE ev=?1 AND kind='foto'").bind(ev.id).first(); if (f && f.n >= POR_FOTOS_MAX) return json({ error: "limit", message: "Ya hay " + POR_FOTOS_MAX + " fotos. Quitad alguna para subir otra." }, 429); }
    await env.DB.prepare("INSERT INTO portal_arch (ev, kind, de, nombre, mime, w, h, bytes, hash, src, ts, leido) VALUES (?1,?2,'cliente',?3,?4,?5,?6,?7,?8,?9,?10,0)")
      .bind(ev.id, kind, porTexto(b.nombre, 80), im.mime, Math.min(9999, Math.max(0, Math.round(+b.w) || 0)), Math.min(9999, Math.max(0, Math.round(+b.h) || 0)), im.bytes, porHash(b.src), b.src, ahora).run();
    return json({ ok: true, ...(await porDatos(env, ev)) });
  }
  if (b.tipo === "quitar") {
    const r = await env.DB.prepare("SELECT id FROM portal_arch WHERE id=?1 AND ev=?2 AND de='cliente'").bind(Math.floor(+b.id || 0), ev.id).first();
    if (!r) return json({ error: "not-found" }, 404);
    await env.DB.prepare("DELETE FROM portal_arch WHERE id=?1").bind(r.id).run();
    return json({ ok: true, ...(await porDatos(env, ev)) });
  }
  return json({ error: "invalid" }, 400);
}
/* ── el lado del equipo ── */
async function porEquipo(request, env) {
  const s = await session(request, env);
  if (!s) return { err: json({ error: "unauth" }, 401) };
  if (s.role !== "admin" && s.role !== "eventos") return { err: json({ error: "forbidden", message: "Tu rol no puede ver lo que mandan los clientes." }, 403) };
  return { s };
}
async function porEventoPorId(env, id) {
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first(); let doc = {}; try { doc = JSON.parse((row && row.data) || "{}") || {}; } catch (_) {}
  return (doc.events || []).find((e) => e && e.id === String(id)) || null;
}
async function portalGet(request, env, url) {
  const a = await porEquipo(request, env); if (a.err) return a.err;
  await ensurePortal(env);
  const evId = (url.searchParams.get("ev") || "").slice(0, 80);
  if (!evId) {
    /* resumen para los avisos: lo que cada cliente ha mandado y aún nadie ha leído */
    const m = await env.DB.prepare("SELECT ev, COUNT(*) AS n, MAX(ts) AS ts FROM portal_msg WHERE de='cliente' AND leido=0 GROUP BY ev").all();
    const f = await env.DB.prepare("SELECT ev, COUNT(*) AS n, MAX(ts) AS ts FROM portal_arch WHERE de='cliente' AND leido=0 GROUP BY ev").all();
    await ensureDocs(env);
    const dd = await env.DB.prepare("SELECT ev, COUNT(*) AS n, MAX(ts) AS ts FROM evento_docs WHERE de='cliente' AND leido=0 GROUP BY ev").all();
    const o = {};
    (m.results || []).forEach((r) => { o[r.ev] = { msgs: r.n, arch: 0, docs: 0, ts: +r.ts }; });
    (f.results || []).forEach((r) => { const x = o[r.ev] || (o[r.ev] = { msgs: 0, arch: 0, docs: 0, ts: 0 }); x.arch = r.n; x.ts = Math.max(x.ts, +r.ts); });
    (dd.results || []).forEach((r) => { const x = o[r.ev] || (o[r.ev] = { msgs: 0, arch: 0, docs: 0, ts: 0 }); x.docs = r.n; x.ts = Math.max(x.ts, +r.ts); });
    return json({ eventos: o });
  }
  const ev = await porEventoPorId(env, evId); if (!ev) return json({ error: "not-found" }, 404);
  return json({ ev: ev.id, aprobaciones: ev.aprobaciones || {}, ...(await porDatos(env, ev, 200)) });
}
async function portalImg(request, env, url) {
  const a = await porEquipo(request, env); if (a.err) return a.err;
  await ensurePortal(env);
  return porSirve(await env.DB.prepare("SELECT mime, src FROM portal_arch WHERE id=?1").bind(Math.floor(+url.searchParams.get("id") || 0)).first());
}
async function portalMsg(request, env) {
  const a = await porEquipo(request, env); if (a.err) return a.err;
  await ensurePortal(env);
  const b = await body(request), ev = await porEventoPorId(env, b.ev); if (!ev) return json({ error: "not-found" }, 404);
  const texto = porTexto(b.texto, 1500); if (!texto) return json({ error: "invalid", message: "Escribe el mensaje." }, 400);
  await env.DB.prepare("INSERT INTO portal_msg (ev, ts, de, nombre, texto, leido) VALUES (?1, ?2, 'equipo', ?3, ?4, 1)").bind(ev.id, Date.now(), porTexto(a.s.name || "Les Moles", 60), texto).run();
  return json({ ok: true, ...(await porDatos(env, ev, 200)) });
}
async function portalLeido(request, env) {
  const a = await porEquipo(request, env); if (a.err) return a.err;
  await ensurePortal(env);
  const b = await body(request), id = String(b.ev || "").slice(0, 80);
  await env.DB.prepare("UPDATE portal_msg SET leido=1 WHERE ev=?1 AND de='cliente'").bind(id).run();
  await env.DB.prepare("UPDATE portal_arch SET leido=1 WHERE ev=?1 AND de='cliente'").bind(id).run();
  return json({ ok: true });
}
/* el equipo publica la minuta (una imagen) para que el cliente la vea y la apruebe; publicar otra deja sin valor la aprobación anterior */
async function portalMinuta(request, env) {
  const a = await porEquipo(request, env); if (a.err) return a.err;
  await ensurePortal(env);
  const b = await body(request), ev = await porEventoPorId(env, b.ev); if (!ev) return json({ error: "not-found" }, 404);
  const im = porImagen(b.src); if (!im || im.error) return json({ error: im && im.error === "too-big" ? "too-big" : "invalid", message: im && im.error === "too-big" ? "La imagen de la minuta pesa demasiado (máx. 500 KB)." : "La imagen de la minuta no es válida." }, im && im.error === "too-big" ? 413 : 400);
  const h = porHash(b.src), prev = await env.DB.prepare("SELECT hash FROM portal_arch WHERE ev=?1 AND kind='minuta'").bind(ev.id).first();
  if (prev && prev.hash === h) return json({ ok: true, igual: true, ...(await porDatos(env, ev, 200)) });
  await env.DB.prepare("DELETE FROM portal_arch WHERE ev=?1 AND kind='minuta'").bind(ev.id).run();
  await env.DB.prepare("INSERT INTO portal_arch (ev, kind, de, nombre, mime, w, h, bytes, hash, src, ts, leido) VALUES (?1,'minuta','equipo','Minuta',?2,?3,?4,?5,?6,?7,?8,1)")
    .bind(ev.id, im.mime, Math.min(9999, Math.round(+b.w) || 0), Math.min(9999, Math.round(+b.h) || 0), im.bytes, h, b.src, Date.now()).run();
  await logAct(env, a.s, "minuta_publicada", "Minuta publicada para que el cliente la apruebe: " + String(ev.name || "").slice(0, 60));
  return json({ ok: true, ...(await porDatos(env, ev, 200)) });
}
async function portalQuitar(request, env, url) {
  const a = await porEquipo(request, env); if (a.err) return a.err;
  await ensurePortal(env);
  await env.DB.prepare("DELETE FROM portal_arch WHERE id=?1").bind(Math.floor(+url.searchParams.get("id") || 0)).run();
  return json({ ok: true });
}

/* ── CORREO Y AVISOS ──────────────────────────────────────────────────────────
   Tres usos, el mismo motor:
   · RESUMEN DEL EQUIPO (semanal o diario): lo que hay esta semana, lo que queda por
     cobrar, camareros por avisar, alergias sin plato… Sale solo a la hora que se
     diga (el disparador es una llamada programada a /api/correo/cron, porque Pages no
     ejecuta tareas: ver .github/workflows/avisos.yml) y también se puede enviar a mano.
   · RECORDATORIOS AL CLIENTE (la lista de invitados, los pagos, las reuniones): a mano
     desde la ficha del evento y, si el administrador lo activa, solos el día que toca.
     Vienen apagados de fábrica.
   · AVISO A LOS CAMAREROS con los datos de su turno.
   Todo envío queda apuntado en la bandeja de salida (tabla outbox) con su estado
   (enviado · simulado · error), cuántos intentos y por qué falló. Un mismo aviso no se
   manda dos veces (referencia única). Si no hay servicio de correo configurado (clave
   de Resend + remitente) los correos se guardan como «simulado» y NO salen: así todo
   se puede probar sin enviar nada. Las plantillas (asunto y texto) las edita el
   administrador. Las configuraciones van en la tabla meta (clave «correo»).
   Variables del servidor: RESEND_API_KEY · MAIL_FROM · CRON_TOKEN. */
let COR_OK = false;
const COR_PURGA_DIAS = 180;
const COR_CFG_DEF = {
  resumen: { on: true, freq: "semanal", dia: 1, hora: 8, para: "equipo", lista: "" },
  cliente: { on: false, hora: 9, lista: true, pago: true, reunion: true },
  firma: "Les Moles Events", responder: "",
  respuesta: "quien",                       /* quien = si contestan, le llega a quien lo ha enviado · general = al correo de «responder» */
  copia: { yo: false, lista: "" },          /* copia oculta: a quien lo envía y/o a una lista (esta, solo en lo que sale a clientes) */
  marca: true, pie: "Les Moles Events · Ulldecona"   /* correo con el diseño de la casa · línea del pie */
};
const COR_PLANT = {
  resumen_asunto: "Resumen de {periodo} · Les Moles Events",
  resumen_intro: "Buenos días. Esto es lo que hay en Les Moles Events:",
  cliente_lista_asunto: "La lista de invitados de {evento}",
  cliente_lista: "Hola {nombre},\n\nPara preparar {evento} ({fecha}) necesitamos la lista definitiva de invitados, con sus alergias o dietas.\nPodéis rellenarla en vuestro enlace privado:\n{enlace}\n\nGracias,\n{firma}",
  cliente_pago_asunto: "Recordatorio de pago · {evento}",
  cliente_pago: "Hola {nombre},\n\nOs recordamos el pago de {importe} («{concepto}») de {evento} ({fecha}), con vencimiento el {vence}.\n{datos_pago}\n\nUn saludo,\n{firma}",
  cliente_reunion_asunto: "Reunión para {evento}",
  cliente_reunion: "Hola {nombre},\n\nOs recordamos la reunión «{concepto}» de {evento} ({fecha}). Si necesitáis cambiar la hora, contestad a este correo.\n\n{firma}",
  cliente_libre_asunto: "Sobre {evento}",
  cliente_libre: "Hola {nombre},\n\n\n\nUn saludo,\n{firma}",
  cliente_contrato_asunto: "{doc_titulo} de {evento}",
  cliente_contrato: "Hola {nombre},\n\nYa tenéis {documento} de {evento} ({fecha}) esperando en vuestro enlace privado:\n{enlace}\n\nLeedlo con calma y, si todo está bien, podéis aceptarlo desde ahí mismo. Si tenéis cualquier duda, escribidnos.\n\n{firma}",
  camarero_asunto: "Tu turno en {evento} · {fecha}",
  camarero: "Hola {nombre},\n\nTe confirmamos tu turno en {evento}: {fecha}, entrada a las {hora}.\n{funciones}\nSi no puedes venir, avísanos cuanto antes.\n\n{firma}"
  ,proveedor_asunto: "{evento} · {fecha}",
  proveedor: "Hola {nombre},\n\nTe escribo por {evento} ({fecha}): contamos contigo para {servicio}. Cualquier cambio o duda, avísame.\n\n{firma}"
};
async function ensureCorreo(env) {
  if (COR_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS outbox (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, kind TEXT NOT NULL, ev TEXT, to_addr TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, estado TEXT NOT NULL, intentos INTEGER NOT NULL DEFAULT 0, error TEXT, sent_ts INTEGER, ref TEXT, by_name TEXT, prov_id TEXT, bcc TEXT, reply_to TEXT, entrega TEXT, entrega_ts INTEGER, adj TEXT, prog_ts INTEGER)").run();
  /* tablas de antes de la 01.93: las columnas nuevas se añaden una sola vez */
  let tiene = null;
  try { const r = await env.DB.prepare("PRAGMA table_info(outbox)").all(); tiene = (r.results || []).map((c) => c.name); } catch (_) {}
  for (const c of ["bcc TEXT", "reply_to TEXT", "entrega TEXT", "entrega_ts INTEGER", "adj TEXT", "prog_ts INTEGER"]) {
    if (tiene && tiene.indexOf(c.split(" ")[0]) >= 0) continue;
    try { await env.DB.prepare("ALTER TABLE outbox ADD COLUMN " + c).run(); } catch (_) {}
  }
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS outbox_ts ON outbox (ts)").run();
  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS outbox_ref ON outbox (ref) WHERE ref IS NOT NULL").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS outbox_ev ON outbox (ev)").run();
  COR_OK = true;
}
function corEmailOk(s) { return typeof s === "string" && s.length <= 160 && /^[^\s@<>",;]+@[^\s@<>",;]+\.[A-Za-z]{2,}$/.test(s.trim()); }
function corMezcla(base, o) {
  const out = JSON.parse(JSON.stringify(base));
  Object.keys(o || {}).forEach((k) => { if (o[k] && typeof o[k] === "object" && !Array.isArray(o[k]) && out[k] && typeof out[k] === "object") Object.assign(out[k], o[k]); else if (o[k] != null) out[k] = o[k]; });
  return out;
}
async function correoCfg(env) {
  await ensureUsers(env);
  let c = {}, pl = {};
  try {
    const { results } = await env.DB.prepare("SELECT k, v FROM meta WHERE k IN ('correo','correo_plantillas')").all();
    (results || []).forEach((r) => { try { if (r.k === "correo") c = JSON.parse(r.v) || {}; else pl = JSON.parse(r.v) || {}; } catch (_) {} });
  } catch (_) {}
  const cfg = corMezcla(COR_CFG_DEF, c), plant = Object.assign({}, COR_PLANT);
  Object.keys(pl).forEach((k) => { if (COR_PLANT[k] != null && typeof pl[k] === "string" && pl[k].trim()) plant[k] = pl[k]; });
  return { cfg, plant, custom: pl };
}
function corProveedor(env) {
  const key = String(env.RESEND_API_KEY || "").trim(), from = String(env.MAIL_FROM || "").trim();
  if (!key) return { listo: false, from, motivo: "Falta la clave del servicio de correo (RESEND_API_KEY)." };
  if (!from) return { listo: false, from, motivo: "Falta el remitente (MAIL_FROM), por ejemplo «Les Moles Events <eventos@tudominio.com>»." };
  return { listo: true, from, motivo: "" };
}
function corRellenar(t, v) { return String(t == null ? "" : t).replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(v, k) && v[k] != null ? String(v[k]) : m)); }
/* el correo tal como llega: con el diseño de la casa (o sencillo si se apaga). Siempre se manda también el texto plano. */
const COR_FUENTE = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
function corEsc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function corEnlazar(raw) {
  let out = "", ult = 0, m; const re = /https?:\/\/[^\s<>"]+/g;
  while ((m = re.exec(raw))) {
    const mm = /^(.*?)([.,;:!?)»\]]*)$/.exec(m[0]), u = mm[1], resto = mm[2];
    out += corEsc(raw.slice(ult, m.index)) + '<a href="' + corEsc(u) + '" style="color:#8a6d3b;text-decoration:underline">' + corEsc(u) + "</a>" + corEsc(resto);
    ult = m.index + m[0].length;
  }
  return out + corEsc(raw.slice(ult));
}
function corBoton(u) {
  const etq = /[?&]cliente=/.test(u) ? "Abrir vuestro enlace privado" : "Abrir el enlace";
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px"><tr><td align="center" bgcolor="#1f2a24" style="border-radius:6px"><a href="' + corEsc(u) + '" style="display:inline-block;padding:13px 24px;font:600 14px/1 ' + COR_FUENTE + ';color:#ffffff;text-decoration:none;border-radius:6px">' + etq + '</a></td></tr></table>' +
    '<div style="margin:0 0 16px;font:12px/1.4 ' + COR_FUENTE + ';color:#8b8b8b;word-break:break-all">' + corEsc(u) + "</div>";
}
function corHtml(texto, o) {
  o = o || {};
  const t = String(texto == null ? "" : texto).replace(/\r/g, "").trim();
  if (o.marca === false) return '<div style="font:15px/1.5 ' + COR_FUENTE + ';color:#222;max-width:620px">' + corEnlazar(t).replace(/\n/g, "<br>") + "</div>";
  const partes = []; let par = [];
  const cierra = () => { if (par.length) { const trasLista = partes.length && /^<div style="margin:0 0 7px/.test(partes[partes.length - 1]); partes.push('<p style="margin:' + (trasLista ? "18px" : "0") + ' 0 14px;font:15px/1.65 ' + COR_FUENTE + ';color:#2b2b2b">' + par.map(corEnlazar).join("<br>") + "</p>"); par = []; } };
  t.split("\n").forEach((l) => {
    const s = l.trim();
    if (!s) { cierra(); return; }
    if (/^https?:\/\/\S+$/.test(s)) { cierra(); partes.push(corBoton(s)); return; }
    if (/^[·•]\s+/.test(s)) { cierra(); partes.push('<div style="margin:0 0 7px;padding-left:16px;text-indent:-16px;font:15px/1.55 ' + COR_FUENTE + ';color:#2b2b2b">· ' + corEnlazar(s.replace(/^[·•]\s+/, "")) + "</div>"); return; }
    if (o.kind === "resumen" && /^[A-ZÁÉÍÓÚÜÑ ]{4,}(\(.*\))?$/.test(s)) { cierra(); partes.push('<div style="margin:24px 0 10px;padding-top:14px;border-top:1px solid #e8e2d4;font:700 12px/1.3 ' + COR_FUENTE + ';letter-spacing:.12em;color:#8a6d3b">' + corEsc(s) + "</div>"); return; }
    par.push(s);
  });
  cierra();
  const pre = corEsc(t.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 110));
  const logo = o.origen && /^https:\/\//.test(o.origen) ? '<img src="' + corEsc(o.origen) + '/icons/icon-192.png" width="38" height="38" alt="" style="border-radius:50%;vertical-align:middle;margin-right:12px;border:0">' : "";
  return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>' + corEsc(o.subject || "Les Moles Events") + '</title></head>' +
    '<body style="margin:0;padding:0;background:#f3efe6"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + pre + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3efe6"><tr><td align="center" style="padding:26px 12px">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">' +
    '<tr><td style="padding:0 6px 14px">' + logo + '<span style="vertical-align:middle;font:22px/1 Georgia,\'Times New Roman\',serif;color:#1f2a24">Les Moles</span> <span style="vertical-align:middle;font:600 10px/1 ' + COR_FUENTE + ';letter-spacing:.32em;color:#8a6d3b;margin-left:6px">EVENTS</span></td></tr>' +
    '<tr><td style="background:#ffffff;border-top:3px solid #b8924a;border-radius:8px;padding:30px 30px 18px">' + partes.join("") + '</td></tr>' +
    '<tr><td style="padding:16px 8px 4px;font:12px/1.6 ' + COR_FUENTE + ';color:#8b8b8b">' + corEsc(o.pie || "") + '</td></tr>' +
    '</table></td></tr></table></body></html>';
}
/* direcciones válidas, sin repetir y sin la del destinatario (para la copia oculta) */
function corLista(l, excepto) {
  const out = [], ex = String(excepto || "").trim().toLowerCase();
  (Array.isArray(l) ? l : String(l || "").split(/[\s,;]+/)).forEach((x) => { x = String(x || "").trim(); if (corEmailOk(x) && x.toLowerCase() !== ex && out.map((y) => y.toLowerCase()).indexOf(x.toLowerCase()) < 0) out.push(x); });
  return out.slice(0, 6);
}
/* quién recibe copia oculta: a quien lo envía a mano (si se pide) y la lista fija, solo en lo que sale a clientes */
function corCopias(cfg, kind, emailQuien) {
  const l = [];
  if (emailQuien && cfg.copia && cfg.copia.yo && ["cliente", "camarero", "proveedor", "libre"].indexOf(kind) >= 0) l.push(emailQuien);
  if (kind === "cliente" && cfg.copia && cfg.copia.lista) String(cfg.copia.lista).split(/[\s,;]+/).forEach((x) => l.push(x));
  return l;
}
/* un envío: lo apunta en la bandeja y, si hay servicio de correo, lo manda. ref = clave para no repetir.
   m: kind, ev, to, subject, text, ref, by · replyTo, bcc[] · adjuntos[{filename,content}] · programar (ms) · origen */
async function correoEnviar(env, m) {
  await ensureCorreo(env);
  const prov = corProveedor(env), { cfg } = await correoCfg(env), ahora = Date.now();
  const to = String(m.to || "").trim(), subject = String(m.subject || "").replace(/[\r\n]+/g, " ").trim().slice(0, 200), body = String(m.text || "").slice(0, 8000);
  if (!corEmailOk(to)) return { ok: false, error: "invalid", message: "El correo del destinatario no es válido." };
  if (!subject || !body.trim()) return { ok: false, error: "invalid", message: "Falta el asunto o el texto." };
  const bcc = corLista(m.bcc, to), adj = Array.isArray(m.adjuntos) ? m.adjuntos : [], prog = +m.programar > ahora ? Math.floor(+m.programar) : 0;
  const replyTo = corEmailOk(m.replyTo) ? String(m.replyTo).trim() : (corEmailOk(cfg.responder) ? String(cfg.responder).trim() : "");
  const bccTxt = bcc.join(", ") || null, adjTxt = adj.length ? JSON.stringify(adj.map((x) => String(x.filename).slice(0, 80))) : null;
  let row = null;
  if (m.ref) {
    row = await env.DB.prepare("SELECT * FROM outbox WHERE ref=?1").bind(String(m.ref).slice(0, 200)).first();
    if (row && (row.estado === "enviado" || row.estado === "simulado" || row.estado === "programado")) return { ok: true, repetido: true, id: row.id, estado: row.estado };
    if (row && row.intentos >= 3) return { ok: false, error: "max-intentos", message: "Este aviso ya falló 3 veces.", id: row.id, estado: row.estado };
  }
  let id;
  if (row) { id = row.id; await env.DB.prepare("UPDATE outbox SET to_addr=?1, subject=?2, body=?3, estado='pendiente', error=NULL, bcc=?4, reply_to=?5, adj=?6, prog_ts=?7, entrega=NULL WHERE id=?8").bind(to, subject, body, bccTxt, replyTo || null, adjTxt, prog || null, id).run(); }
  else {
    const r = await env.DB.prepare("INSERT INTO outbox (ts, kind, ev, to_addr, subject, body, estado, intentos, ref, by_name, bcc, reply_to, adj, prog_ts) VALUES (?1,?2,?3,?4,?5,?6,'pendiente',0,?7,?8,?9,?10,?11,?12)")
      .bind(ahora, String(m.kind || "libre").slice(0, 20), m.ev ? String(m.ev).slice(0, 80) : null, to, subject, body, m.ref ? String(m.ref).slice(0, 200) : null, String(m.by || "").slice(0, 80), bccTxt, replyTo || null, adjTxt, prog || null).run();
    id = (r.meta && r.meta.last_row_id) || (await env.DB.prepare("SELECT MAX(id) AS id FROM outbox").first()).id;
  }
  if (!prov.listo) {
    await env.DB.prepare("UPDATE outbox SET estado='simulado', error=?1 WHERE id=?2").bind(prov.motivo, id).run();
    return { ok: true, id, estado: "simulado", message: "El servicio de correo no está configurado: se ha guardado en la bandeja pero NO se ha enviado." };
  }
  try {
    const payload = { from: prov.from, to: [to], subject, text: body, html: corHtml(body, { marca: cfg.marca !== false, pie: cfg.pie, origen: m.origen, subject, kind: m.kind }) };
    if (replyTo) payload.reply_to = replyTo;
    if (bcc.length) payload.bcc = bcc;
    if (adj.length) payload.attachments = adj.map((x) => ({ filename: x.filename, content: x.content }));
    if (prog) payload.scheduled_at = new Date(prog).toISOString();
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + String(env.RESEND_API_KEY).trim(), "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    let j = {}; try { j = await r.json(); } catch (_) {}
    if (r.ok && j && j.id) {
      const est = prog ? "programado" : "enviado";
      await env.DB.prepare("UPDATE outbox SET estado=?1, intentos=intentos+1, sent_ts=?2, prov_id=?3, error=NULL, entrega=?4, entrega_ts=?5 WHERE id=?6").bind(est, prog || Date.now(), String(j.id).slice(0, 80), prog ? "scheduled" : "sent", Date.now(), id).run();
      return { ok: true, id, estado: est, programado: prog || null };
    }
    const msg = ((j && (j.message || j.error)) || ("HTTP " + r.status)).toString().slice(0, 300);
    await env.DB.prepare("UPDATE outbox SET estado='error', intentos=intentos+1, error=?1 WHERE id=?2").bind(msg, id).run();
    return { ok: false, id, estado: "error", error: "proveedor", message: "El servicio de correo lo ha rechazado: " + msg };
  } catch (err) {
    const msg = String(err && err.message || err).slice(0, 300);
    await env.DB.prepare("UPDATE outbox SET estado='error', intentos=intentos+1, error=?1 WHERE id=?2").bind(msg, id).run();
    return { ok: false, id, estado: "error", error: "red", message: "No se ha podido contactar con el servicio de correo: " + msg };
  }
}
/* ¿ha llegado? El servicio de correo sabe qué ha pasado con cada envío (entregado, rebotado, spam…): se le pregunta por los de los
   últimos 7 días que aún no tienen un final. Lo llaman la bandeja (al abrirla) y la tarea programada. */
const COR_ENT_FINAL = ["delivered", "opened", "clicked", "bounced", "complained", "failed", "suppressed", "canceled"];
const COR_ENT_MAL = ["bounced", "complained", "failed", "suppressed"];
let COR_ENT_ULT = 0;
async function corEntregaRefrescar(env, opt) {
  opt = opt || {};
  const prov = corProveedor(env); if (!prov.listo) return { revisados: 0, cambios: 0, sinServicio: true };
  const ahora = Date.now();
  if (!opt.forzar && ahora - COR_ENT_ULT < 20e3) return { revisados: 0, cambios: 0, saltado: true };
  COR_ENT_ULT = ahora;
  const lim = Math.min(40, Math.max(1, Math.floor(+opt.limite) || 20));
  const { results } = await env.DB.prepare("SELECT id, prov_id, estado, entrega FROM outbox WHERE prov_id IS NOT NULL AND estado IN ('enviado','programado') AND COALESCE(entrega,'') NOT IN (" + COR_ENT_FINAL.map((x) => "'" + x + "'").join(",") + ") AND ts>?1 ORDER BY id DESC LIMIT ?2").bind(ahora - 7 * 864e5, lim).all();
  let rev = 0, cambios = 0;
  for (const r of (results || [])) {
    let j = null;
    try {
      const x = await fetch("https://api.resend.com/emails/" + encodeURIComponent(r.prov_id), { headers: { Authorization: "Bearer " + String(env.RESEND_API_KEY).trim() } });
      if (x.status === 429) break;
      if (x.ok) j = await x.json();
    } catch (_) { break; }
    rev++;
    const ev = j ? String(j.last_event || "").toLowerCase().replace(/[^a-z_]/g, "").slice(0, 30) : "";
    if (!ev || ev === r.entrega) continue;
    let est = r.estado;
    if (ev === "canceled") est = "cancelado"; else if (r.estado === "programado" && ev !== "scheduled" && ev !== "queued") est = "enviado";
    await env.DB.prepare("UPDATE outbox SET entrega=?1, entrega_ts=?2, estado=?3 WHERE id=?4").bind(ev, Date.now(), est, r.id).run();
    cambios++;
  }
  return { revisados: rev, cambios };
}
/* archivos adjuntos: hasta 3, de 3 MB, solo de los tipos de oficina; no se guardan, solo van en ese correo */
const COR_ADJ_EXT = { pdf: "%PDF", png: "\x89PNG", jpg: "\xFF\xD8\xFF", jpeg: "\xFF\xD8\xFF", webp: "RIFF", docx: "PK", xlsx: "PK", txt: "", csv: "" };
function corAdjuntos(l) {
  if (l == null || (Array.isArray(l) && !l.length)) return { ok: true, lista: [] };
  if (!Array.isArray(l) || l.length > 3) return { ok: false, message: "Se pueden adjuntar hasta 3 archivos." };
  let total = 0; const lista = [];
  for (const a of l) {
    const nombre = String((a && a.nombre) || "").replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").trim().slice(0, 80), ext = (nombre.split(".").pop() || "").toLowerCase();
    if (!nombre || !Object.prototype.hasOwnProperty.call(COR_ADJ_EXT, ext)) return { ok: false, message: "«" + (nombre || "archivo") + "»: solo se pueden adjuntar PDF, imágenes (JPG, PNG, WebP), Word, Excel, TXT o CSV." };
    const b64 = String((a && a.b64) || "").replace(/^data:[^,]*,/, "").replace(/\s+/g, "");
    if (!b64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return { ok: false, message: "«" + nombre + "»: el archivo no se ha leído bien. Vuelve a adjuntarlo." };
    const bytes = Math.floor(b64.length * 3 / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
    if (bytes > 3 * 1048576) return { ok: false, message: "«" + nombre + "» pesa más de 3 MB." };
    total += bytes; if (total > 6 * 1048576) return { ok: false, message: "Entre todos los adjuntos no pueden pasar de 6 MB." };
    let cab = ""; try { cab = atob(b64.slice(0, 16)); } catch (_) { return { ok: false, message: "«" + nombre + "»: el archivo no se ha leído bien." }; }
    const firma = COR_ADJ_EXT[ext];
    if (firma && cab.slice(0, firma.length) !== firma) return { ok: false, message: "«" + nombre + "» no parece un archivo ." + ext + " de verdad." };
    lista.push({ filename: nombre, content: b64 });
  }
  return { ok: true, lista };
}
/* ── fechas en hora de Madrid ── */
function corMadrid(d) {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" }), p = {};
  f.formatToParts(d).forEach((x) => { p[x.type] = x.value; });
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: +p.minute, wd: { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }[p.weekday], iso: p.year + "-" + p.month + "-" + p.day };
}
function corIsoMas(iso, n) { const t = new Date(iso + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
function corDias(a, b) { return Math.round((new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z")) / 864e5); }
function corSemana(iso) {
  const t = new Date(iso + "T00:00:00Z"), dn = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - dn + 3);
  const y1 = t.getUTCFullYear(), j4 = new Date(Date.UTC(y1, 0, 4)), w = 1 + Math.round(((t - j4) / 864e5 - 3 + ((j4.getUTCDay() + 6) % 7)) / 7);
  return y1 + "-W" + (w < 10 ? "0" : "") + w;
}
const COR_DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
function corFechaCorta(iso) { const t = new Date(iso + "T00:00:00Z"); return COR_DIAS[t.getUTCDay()] + " " + iso.slice(8, 10) + "/" + iso.slice(5, 7); }
function corFechaLarga(iso) { const t = new Date(iso + "T00:00:00Z"), N = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], D = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]; return D[t.getUTCDay()] + " " + (+iso.slice(8, 10)) + " de " + N[+iso.slice(5, 7) - 1] + " de " + iso.slice(0, 4); }
/* con punto de miles también en cifras de 4 dígitos («1.485 €»; es-ES no lo pone) */
function corEur(n) { const v = Math.round((+n || 0) * 100) / 100, d = v % 1 ? 2 : 0, p = Math.abs(v).toFixed(d).split("."); return (v < 0 ? "-" : "") + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d ? "," + p[1] : "") + " €"; }
/* nombre de pila para el saludo: «Marta Vidal» → «Marta» («M. Carmen» se queda con las dos primeras palabras) */
function corPila(n) { const w = String(n || "").trim().split(/\s+/).filter(Boolean); if (!w.length) return ""; return (w.length > 1 && (w[0].length <= 2 || /\.$/.test(w[0]))) ? w[0] + " " + w[1] : w[0]; }
function corNombreEv(e) { return String((e && e.name) || "Evento").replace(/\s*[—\-–]\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4}|\d{4}-\d{1,2}-\d{1,2})\s*$/, "").trim() || "Evento"; }
const COR_SIN_CONFIRMAR = { contacto: 1, propuesta: 1, visita: 1 };
const COR_ESTADO_TX = { contacto: "contacto", propuesta: "propuesta", visita: "visita", reserva: "reserva", planificacion: "en planificación", confirmada: "confirmada", celebrada: "celebrada", cerrada: "cerrada" };
/* el resumen: texto plano, con lo que hay en los próximos días y lo que queda por hacer. Solo lee. */
function corResumen(doc, hoy, cfg, plant) {
  const diario = cfg.resumen.freq === "diario", fin = corIsoMas(hoy, diario ? 1 : 6), evs = (doc.events || []).filter((e) => e && e.id && !e.anonimizado && e.ficha && /^\d{4}-\d{2}-\d{2}$/.test(e.ficha.fecha || ""));
  const dias = (e) => corDias(hoy, e.ficha.fecha);
  const vivos = evs.filter((e) => dias(e) >= 0 && !/^(celebrada|cerrada)$/.test(e.ficha.estado || ""));
  const semana = vivos.filter((e) => e.ficha.fecha <= fin).sort((a, b) => (a.ficha.fecha < b.ficha.fecha ? -1 : 1));
  const prox30 = vivos.filter((e) => dias(e) <= 30), prox14 = vivos.filter((e) => dias(e) <= 14);
  const sn = (e) => e._snap || {};
  const L = [];
  L.push(corRellenar(plant.resumen_intro, {}), "");
  L.push((diario ? "HOY Y MAÑANA" : "ESTA SEMANA") + " (" + semana.length + (semana.length === 1 ? " evento" : " eventos") + ")");
  if (!semana.length) L.push("· No hay eventos.");
  semana.forEach((e) => { const s = sn(e), est = e.ficha.estado || "planificacion", tot = s.tot || ((s.adultos || 0) + (s.ninos || 0) + (s.staff || 0));
    L.push("· " + corFechaCorta(e.ficha.fecha) + " · " + corNombreEv(e) + (tot ? " · " + tot + " comensales" : "") + (COR_SIN_CONFIRMAR[est] ? " · SIN CONFIRMAR (" + COR_ESTADO_TX[est] + ")" : "") + (s.pend > 0.5 ? " · por cobrar " + corEur(s.pend) : "")); });
  const cola = [];
  const pagos = prox30.filter((e) => sn(e).pend > 0.5 && !COR_SIN_CONFIRMAR[e.ficha.estado || ""]);
  if (pagos.length) cola.push("· Por cobrar: " + corEur(pagos.reduce((a, e) => a + sn(e).pend, 0)) + " en " + pagos.length + (pagos.length === 1 ? " evento" : " eventos") + " (" + pagos.slice(0, 4).map((e) => corNombreEv(e) + " " + corEur(sn(e).pend)).join(" · ") + (pagos.length > 4 ? " · …" : "") + ")");
  const avisar = prox30.reduce((a, e) => a + (sn(e).camAvisar || 0), 0);
  if (avisar) cola.push("· Camareros por avisar: " + avisar);
  const faltan = prox14.filter((e) => (sn(e).camNec || 0) > (sn(e).camSi || 0));
  if (faltan.length) cola.push("· Faltan camareros en: " + faltan.map((e) => corNombreEv(e) + " (" + (sn(e).camSi || 0) + " de " + sn(e).camNec + ")").join(" · "));
  const sinS = prox14.filter((e) => (sn(e).sinSust || 0) > 0);
  if (sinS.length) cola.push("· Alergias o dietas sin plato sustituto: " + sinS.map((e) => corNombreEv(e) + " (" + sn(e).sinSust + ")").join(" · "));
  const hitos = [];
  prox30.forEach((e) => (sn(e).hitos || []).forEach((h) => { if (!h.done && h.fecha && corDias(hoy, h.fecha) <= 3) hitos.push({ e, h, d: corDias(hoy, h.fecha) }); }));
  hitos.sort((a, b) => a.d - b.d).slice(0, 8).forEach((x) => cola.push("· " + x.h.t + (x.h.importe != null && x.h.importe > 0 ? " · " + corEur(x.h.importe) : "") + " — " + corNombreEv(x.e) + (x.d < 0 ? " (vencido hace " + (-x.d) + (x.d === -1 ? " día)" : " días)") : x.d === 0 ? " (hoy)" : x.d === 1 ? " (mañana)" : " (en " + x.d + " días)")));
  L.push("", "QUEDA POR HACER");
  if (!cola.length) L.push("· Nada pendiente a la vista."); else cola.forEach((x) => L.push(x));
  const mas = prox30.length - semana.length;
  if (mas > 0 && !diario) L.push("", "Después, en los próximos 30 días: " + mas + (mas === 1 ? " evento más." : " eventos más."));
  L.push("", String(cfg.firma || ""));
  return { asunto: corRellenar(plant.resumen_asunto, { periodo: diario ? "hoy" : "la semana" }) + " · " + corFechaCorta(hoy), texto: L.join("\n").trim(), eventos: semana.length, pendientes: cola.length };
}
/* a quién va el resumen del equipo */
async function corDestinatarios(env, cfg) {
  const out = [];
  if (cfg.resumen.para === "lista") String(cfg.resumen.lista || "").split(/[\s,;]+/).forEach((x) => { if (corEmailOk(x)) out.push(x.trim().toLowerCase()); });
  else { await ensureUsers(env); const { results } = await env.DB.prepare("SELECT email FROM users WHERE role IN ('admin','eventos') AND COALESCE(active,1)=1").all(); (results || []).forEach((r) => { if (corEmailOk(r.email)) out.push(String(r.email).toLowerCase()); }); }
  return out.filter((v, i, a) => a.indexOf(v) === i);
}
async function corDoc(env) { const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first(); try { return JSON.parse((row && row.data) || "{}") || {}; } catch (_) { return {}; } }
/* lo que se manda solo: el resumen a su hora y los recordatorios del día a los clientes. «simular» = decir qué saldría sin enviar nada. */
async function correoAutomatico(env, ahora, origen, opt) {
  opt = opt || {};
  await ensureCorreo(env);
  const { cfg, plant } = await correoCfg(env), doc = await corDoc(env), M = corMadrid(ahora), out = { ahora: ahora.getTime(), hoy: M.iso, resumen: null, clientes: [], errores: 0, enviados: 0, simulados: 0 };
  const cuenta = (r) => { if (r.repetido) return; if (r.estado === "enviado") out.enviados++; else if (r.estado === "simulado") out.simulados++; else if (!r.ok) out.errores++; };
  /* 1 · el resumen del equipo */
  const rs = cfg.resumen;
  if (rs.on && rs.freq !== "off" && M.h >= (+rs.hora || 0) && (rs.freq === "diario" || M.wd === (+rs.dia || 0) )) {
    const periodo = rs.freq === "diario" ? M.iso : corSemana(M.iso), R = corResumen(doc, M.iso, cfg, plant), dest = await corDestinatarios(env, cfg);
    out.resumen = { periodo, destinatarios: dest.length, asunto: R.asunto, eventos: R.eventos, enviados: 0 };
    if (opt.simular) out.resumen.texto = R.texto;
    else for (const to of dest) { const r = await correoEnviar(env, { kind: "resumen", to, subject: R.asunto, text: R.texto, ref: "resumen:" + periodo + ":" + to, by: "automático", origen }); cuenta(r); if (r.ok && !r.repetido) out.resumen.enviados++; }
  }
  /* 2 · recordatorios a los clientes (apagados de fábrica) */
  if (cfg.cliente.on && M.h >= (+cfg.cliente.hora || 0)) {
    const portal = (((doc.params || {}).sec || {}).portal || {}).data || {};
    for (const e of (doc.events || [])) {
      if (!e || !e.id || e.anonimizado || !e.ficha || !/^(reserva|planificacion|confirmada)$/.test(e.ficha.estado || "")) continue;
      if (!corEmailOk(e.ficha.email) || !e._snap || !Array.isArray(e._snap.hitos) || !/^\d{4}-\d{2}-\d{2}$/.test(e.ficha.fecha || "") || e.ficha.fecha < M.iso) continue;
      for (const h of e._snap.hitos) {
        const tipo = h.tipo === "documento" ? "lista" : h.tipo === "pago" ? "pago" : h.tipo === "reunion" ? "reunion" : "";
        if (!tipo || !cfg.cliente[tipo] || h.done || h.fecha !== M.iso) continue;
        const m = corMensajeCliente(e, h, tipo, cfg, plant, portal, origen), ref = "cli:" + e.id + ":" + h.id + ":" + h.fecha;
        out.clientes.push({ ev: e.id, evento: corNombreEv(e), hito: h.id, tipo, a: m.to });
        if (!opt.simular) cuenta(await correoEnviar(env, { kind: "cliente", ev: e.id, to: m.to, subject: m.subject, text: m.text, ref, by: "automático", origen, bcc: corCopias(cfg, "cliente", ""), replyTo: cfg.responder }));
      }
    }
  }
  /* 3 · limpieza de lo antiguo y qué ha pasado con lo enviado (¿ha llegado?) */
  if (!opt.simular) {
    try { await env.DB.prepare("DELETE FROM outbox WHERE ts < ?1").bind(ahora.getTime() - COR_PURGA_DIAS * 864e5).run(); } catch (_) {}
    try { out.entregas = await corEntregaRefrescar(env, { limite: 30, forzar: true }); } catch (_) {}
  }
  return out;
}
function corMensajeCliente(e, h, tipo, cfg, plant, portal, origen) {
  const F = e.ficha || {}, nombre = (F.parejaA && F.parejaB) ? corPila(F.parejaA) + " y " + corPila(F.parejaB) : (F.parejaA ? corPila(F.parejaA) : (F.contacto || "equipo"));
  const enlace = e.share && e.share.on && e.share.id ? String(origen || "") + "/?cliente=" + e.share.id : "";
  const v = { nombre, evento: corNombreEv(e), fecha: corFechaLarga(F.fecha), vence: corFechaLarga(h.fecha || F.fecha), importe: h.importe != null ? corEur(h.importe) : "", concepto: h.t || "", enlace, firma: cfg.firma || "",
    datos_pago: portal.iban ? "Podéis hacer la transferencia a " + portal.iban + " indicando el nombre del evento." : "" };
  return { to: String(F.email).trim(), subject: corRellenar(plant["cliente_" + tipo + "_asunto"], v), text: corRellenar(plant["cliente_" + tipo], v).replace(/\n{3,}/g, "\n\n").trim() };
}
/* ── rutas ── */
async function correoSesion(request, env, soloAdmin) {
  const s = await session(request, env);
  if (!s) return { err: json({ error: "unauth" }, 401) };
  if (soloAdmin ? s.role !== "admin" : (s.role !== "admin" && s.role !== "eventos")) return { err: json({ error: "forbidden", message: "Tu rol no puede usar el correo." }, 403) };
  return { s };
}
async function correoGet(request, env, url) {
  const a = await correoSesion(request, env, false); if (a.err) return a.err;
  await ensureCorreo(env);
  const { cfg, plant, custom } = await correoCfg(env), prov = corProveedor(env);
  const lim = Math.min(200, Math.max(10, +url.searchParams.get("n") || 60)), ev = url.searchParams.get("ev") || "";
  const { results } = ev
    ? await env.DB.prepare("SELECT id, ts, kind, ev, to_addr, subject, estado, intentos, error, sent_ts, by_name, bcc, reply_to, entrega, entrega_ts, adj, prog_ts FROM outbox WHERE ev=?1 ORDER BY id DESC LIMIT ?2").bind(ev.slice(0, 80), lim).all()
    : await env.DB.prepare("SELECT id, ts, kind, ev, to_addr, subject, estado, intentos, error, sent_ts, by_name, bcc, reply_to, entrega, entrega_ts, adj, prog_ts FROM outbox ORDER BY id DESC LIMIT ?1").bind(lim).all();
  const c24 = await env.DB.prepare("SELECT COUNT(*) AS n FROM outbox WHERE (estado='error' AND ts>?1) OR (entrega IN ('bounced','complained','failed','suppressed') AND ts>?2)").bind(Date.now() - 864e5, Date.now() - 7 * 864e5).first();
  return json({ cfg, plantillas: plant, plantillasPorDefecto: COR_PLANT, personalizadas: Object.keys(custom || {}), proveedor: { listo: prov.listo, from: prov.from, motivo: prov.motivo }, cron: { token: !!String(env.CRON_TOKEN || "").trim() },
    errores24h: (c24 && c24.n) || 0, bandeja: (results || []).map((r) => ({ id: r.id, ts: +r.ts, kind: r.kind, ev: r.ev || "", to: r.to_addr, subject: r.subject, estado: r.estado, intentos: r.intentos, error: r.error || "", sentTs: r.sent_ts ? +r.sent_ts : null, by: r.by_name || "", bcc: r.bcc || "", replyTo: r.reply_to || "", entrega: r.entrega || "", entregaTs: r.entrega_ts ? +r.entrega_ts : null, adj: (() => { try { return r.adj ? JSON.parse(r.adj) : []; } catch (_) { return []; } })(), progTs: r.prog_ts ? +r.prog_ts : null })) });
}
/* las plantillas y la firma las puede leer cualquier rol (para los botones de WhatsApp); no llevan nada privado */
async function correoPlantillas(request, env) {
  const s = await session(request, env); if (!s) return json({ error: "unauth" }, 401);
  const { cfg, plant } = await correoCfg(env);
  return json({ plantillas: plant, firma: cfg.firma });
}
async function correoPut(request, env) {
  const a = await correoSesion(request, env, true); if (a.err) return a.err;
  await ensureUsers(env);
  const b = await body(request), cur = (await correoCfg(env));
  const out = JSON.parse(JSON.stringify(cur.cfg)), c = b.cfg || {};
  const num = (x, lo, hi, def) => { x = Math.round(+x); return x >= lo && x <= hi ? x : def; };
  if (c.resumen) {
    const r = c.resumen;
    if (r.on != null) out.resumen.on = !!r.on;
    if (["semanal", "diario", "off"].indexOf(r.freq) >= 0) out.resumen.freq = r.freq;
    if (r.dia != null) out.resumen.dia = num(r.dia, 0, 6, out.resumen.dia);
    if (r.hora != null) out.resumen.hora = num(r.hora, 0, 23, out.resumen.hora);
    if (r.para === "equipo" || r.para === "lista") out.resumen.para = r.para;
    if (r.lista != null) out.resumen.lista = String(r.lista).replace(/[^\w@.,;\s+\-]/g, "").slice(0, 600);
  }
  if (c.cliente) {
    const k = c.cliente;
    ["on", "lista", "pago", "reunion"].forEach((x) => { if (k[x] != null) out.cliente[x] = !!k[x]; });
    if (k.hora != null) out.cliente.hora = num(k.hora, 0, 23, out.cliente.hora);
  }
  if (c.firma != null) out.firma = String(c.firma).slice(0, 200);
  if (c.responder != null) { const r = String(c.responder).trim(); if (r && !corEmailOk(r)) return json({ error: "invalid", message: "El correo para las respuestas no es válido." }, 400); out.responder = r; }
  if (c.respuesta === "quien" || c.respuesta === "general") out.respuesta = c.respuesta;
  if (c.marca != null) out.marca = !!c.marca;
  if (c.pie != null) out.pie = String(c.pie).replace(/[\r\n]+/g, " ").trim().slice(0, 200);
  if (c.copia) {
    if (c.copia.yo != null) out.copia.yo = !!c.copia.yo;
    if (c.copia.lista != null) {
      const l = String(c.copia.lista).split(/[\s,;]+/).filter(Boolean);
      if (l.some((x) => !corEmailOk(x))) return json({ error: "invalid", message: "Algún correo de la lista de copia no es válido." }, 400);
      if (l.length > 4) return json({ error: "invalid", message: "La lista de copia admite hasta 4 correos." }, 400);
      out.copia.lista = l.join(", ");
    }
  }
  const pl = Object.assign({}, cur.custom || {});
  if (b.plantillas && typeof b.plantillas === "object") Object.keys(b.plantillas).forEach((k) => { if (COR_PLANT[k] == null) return; const v = b.plantillas[k]; if (v == null || !String(v).trim() || String(v) === COR_PLANT[k]) delete pl[k]; else pl[k] = String(v).slice(0, 4000); });
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('correo', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(out)).run();
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('correo_plantillas', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(pl)).run();
  await logAct(env, a.s, "correo_config", "Cambió los ajustes de correo y avisos");
  const nuevo = await correoCfg(env);
  return json({ ok: true, cfg: nuevo.cfg, plantillas: nuevo.plant });
}
async function correoEnviarRoute(request, env) {
  const s0 = await session(request, env);
  if (!s0) return json({ error: "unauth" }, 401);
  await ensureCorreo(env);
  const b = await body(request), kind = ["cliente", "camarero", "libre", "prueba", "proveedor"].indexOf(b.kind) >= 0 ? b.kind : "libre";
  /* administración y eventos, cualquier aviso; compras, solo los pedidos a proveedores */
  if (s0.role !== "admin" && s0.role !== "eventos" && !(s0.role === "compras" && kind === "proveedor")) return json({ error: "forbidden", message: "Tu rol no puede usar el correo." }, 403);
  const a = { s: s0 };
  /* tope por persona: 40 envíos a la hora */
  const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM outbox WHERE by_name=?1 AND ts>?2").bind(String(a.s.name || a.s.email || "").slice(0, 80), Date.now() - 3600e3).first();
  if (n && n.n >= 40) return json({ error: "limit", message: "Demasiados correos en la última hora. Espera un poco." }, 429);
  const { cfg } = await correoCfg(env);
  const ad = corAdjuntos(b.adjuntos); if (!ad.ok) return json({ error: "invalid", message: ad.message }, 400);
  let prog = 0;
  if (b.programar) {
    prog = Date.parse(String(b.programar));
    if (!(prog >= Date.now() + 4 * 60e3) || prog > Date.now() + 30 * 864e5) return json({ error: "invalid", message: "Para programar el envío elige una fecha y hora entre dentro de 5 minutos y 30 días." }, 400);
  }
  const quien = corEmailOk(a.s.email) ? String(a.s.email).trim() : "";
  const r = await correoEnviar(env, { kind, ev: b.ev, to: kind === "prueba" ? (b.to || a.s.email) : b.to, subject: b.subject, text: b.text, ref: /^(resumen|cons-aviso|cons-resp|reintento)/i.test(String(b.ref || "")) ? "" : String(b.ref || "").slice(0, 200),   /* los identificadores del resumen semanal y de las consultas son del servidor: así nadie los ocupa de antemano */
     by: a.s.name || a.s.email, origen: new URL(request.url).origin,
    bcc: kind === "prueba" ? [] : corCopias(cfg, kind, quien), replyTo: kind === "prueba" ? "" : (cfg.respuesta === "quien" && quien ? quien : cfg.responder), adjuntos: ad.lista, programar: prog });
  if (r.ok) await logAct(env, a.s, "correo_enviado", (r.estado === "simulado" ? "(simulado) " : r.estado === "programado" ? "(programado) " : "") + kind + " → " + String(b.to || a.s.email).slice(0, 80) + (ad.lista.length ? " · " + ad.lista.length + " adjuntos" : ""));
  return json(r, r.ok ? 200 : (r.error === "invalid" ? 400 : 502));
}
async function correoReintentar(request, env) {
  const a = await correoSesion(request, env, false); if (a.err) return a.err;
  await ensureCorreo(env);
  const b = await body(request), row = await env.DB.prepare("SELECT * FROM outbox WHERE id=?1").bind(Math.floor(+b.id || 0)).first();
  if (!row) return json({ error: "not-found" }, 404);
  if (row.estado === "enviado" || row.estado === "programado") return json({ ok: true, repetido: true, id: row.id, estado: row.estado });
  if (row.adj) return json({ error: "adjuntos", message: "Este correo llevaba archivos adjuntos y no se guardan: vuelve a redactarlo y adjuntarlos." }, 400);
  const r = await correoEnviar(env, { kind: row.kind, ev: row.ev, to: row.to_addr, subject: row.subject, text: row.body, ref: row.ref || ("reintento:" + row.id), by: a.s.name || a.s.email, origen: new URL(request.url).origin, bcc: row.bcc || "", replyTo: row.reply_to || "" });
  return json(r, r.ok ? 200 : 502);
}
/* resumen a mano: vista previa, prueba a uno mismo o envío al equipo ahora */
async function correoResumenRoute(request, env) {
  const a = await correoSesion(request, env, false); if (a.err) return a.err;
  await ensureCorreo(env);
  const b = await body(request), { cfg, plant } = await correoCfg(env), doc = await corDoc(env), M = corMadrid(new Date()), R = corResumen(doc, M.iso, cfg, plant);
  if (b.modo === "vista") return json({ ok: true, asunto: R.asunto, texto: R.texto, eventos: R.eventos });
  if (b.modo === "yo") { const r = await correoEnviar(env, { kind: "resumen", to: a.s.email, subject: R.asunto, text: R.texto, ref: "resumen-prueba:" + a.s.uid + ":" + Date.now(), by: a.s.name || a.s.email }); return json(r, r.ok ? 200 : 502); }
  if (b.modo === "equipo") {
    if (a.s.role !== "admin") return json({ error: "forbidden", message: "Solo el administrador puede enviarlo al equipo." }, 403);
    const dest = await corDestinatarios(env, cfg), res = [];
    for (const to of dest) res.push(await correoEnviar(env, { kind: "resumen", to, subject: R.asunto, text: R.texto, ref: "resumen-manual:" + Date.now() + ":" + to, by: a.s.name || a.s.email }));
    await logAct(env, a.s, "correo_enviado", "Resumen al equipo (" + dest.length + (dest.length === 1 ? " persona)" : " personas)"));
    return json({ ok: res.every((r) => r.ok), enviados: res.filter((r) => r.estado === "enviado").length, simulados: res.filter((r) => r.estado === "simulado").length, errores: res.filter((r) => !r.ok).length, destinatarios: dest.length });
  }
  return json({ error: "invalid" }, 400);
}
/* el correo tal como llegará (vista previa) */
async function correoVista(request, env) {
  const s0 = await session(request, env); if (!s0) return json({ error: "unauth" }, 401);
  if (s0.role !== "admin" && s0.role !== "eventos" && s0.role !== "compras") return json({ error: "forbidden" }, 403);
  const b = await body(request), { cfg: cfg0 } = await correoCfg(env), texto = String(b.text || "").slice(0, 8000);
  /* el administrador puede ver cómo quedaría con ajustes que aún no ha guardado */
  const cfg = Object.assign({}, cfg0);
  if (s0.role === "admin" && b.cfg && typeof b.cfg === "object") { if (b.cfg.marca != null) cfg.marca = !!b.cfg.marca; if (b.cfg.pie != null) cfg.pie = String(b.cfg.pie).replace(/[\r\n]+/g, " ").slice(0, 200); }
  const kind = ["cliente", "camarero", "libre", "prueba", "proveedor", "resumen"].indexOf(b.kind) >= 0 ? b.kind : "libre", subject = String(b.subject || "").replace(/[\r\n]+/g, " ").slice(0, 200);
  return json({ ok: true, html: corHtml(texto, { marca: cfg.marca !== false, pie: cfg.pie, origen: new URL(request.url).origin, subject, kind }), marca: cfg.marca !== false });
}
/* ¿ha llegado lo enviado? */
async function correoEstadoRoute(request, env) {
  const a = await correoSesion(request, env, false); if (a.err) return a.err;
  await ensureCorreo(env);
  const r = await corEntregaRefrescar(env, { limite: 25 });
  return json({ ok: true, ...r });
}
/* cancelar un envío programado que aún no ha salido */
async function correoCancelar(request, env) {
  const a = await correoSesion(request, env, false); if (a.err) return a.err;
  await ensureCorreo(env);
  const b = await body(request), row = await env.DB.prepare("SELECT * FROM outbox WHERE id=?1").bind(Math.floor(+b.id || 0)).first();
  if (!row) return json({ error: "not-found" }, 404);
  const prog = row.estado === "programado" || (row.estado === "simulado" && row.prog_ts && +row.prog_ts > Date.now());
  if (!prog) return json({ error: "invalid", message: "Este correo no está programado." }, 400);
  if (row.estado === "programado") {
    if (row.prog_ts && +row.prog_ts <= Date.now() + 30e3) return json({ error: "invalid", message: "Ya está a punto de salir: no se puede cancelar." }, 400);
    try {
      const x = await fetch("https://api.resend.com/emails/" + encodeURIComponent(row.prov_id) + "/cancel", { method: "POST", headers: { Authorization: "Bearer " + String(env.RESEND_API_KEY).trim() } });
      if (!x.ok) { let j = {}; try { j = await x.json(); } catch (_) {} return json({ error: "proveedor", message: "El servicio de correo no ha podido cancelarlo: " + String((j && j.message) || ("HTTP " + x.status)).slice(0, 200) }, 502); }
    } catch (err) { return json({ error: "red", message: "No se ha podido contactar con el servicio de correo." }, 502); }
  }
  await env.DB.prepare("UPDATE outbox SET estado='cancelado', entrega='canceled', entrega_ts=?1 WHERE id=?2").bind(Date.now(), row.id).run();
  await logAct(env, a.s, "correo_cancelado", "Canceló un correo programado → " + String(row.to_addr).slice(0, 80));
  return json({ ok: true, id: row.id, estado: "cancelado" });
}
/* lo llama una tarea programada (con el token) o el administrador desde la pantalla */
async function correoCron(request, env) {
  const tk = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim(), esperado = String(env.CRON_TOKEN || "").trim();
  let admin = null;
  if (!(esperado && tk.length === esperado.length && tk.split("").reduce((d, ch, i) => d | (ch.charCodeAt(0) ^ esperado.charCodeAt(i)), 0) === 0)) {
    const a = await correoSesion(request, env, true); if (a.err) return json({ error: "forbidden" }, 403);
    admin = a.s;
  }
  const b = admin ? await body(request) : {};
  try { await docsLimpiar(env); } catch (_) {}
  const r = await correoAutomatico(env, new Date(), new URL(request.url).origin, { simular: !!(admin && b.simular) });
  return json(r);
}

/* ── COPIAS DE SEGURIDAD, PAPELERA Y RESTAURAR ────────────────────────────
   Todo el negocio vive en un solo documento (tabla store). Para no depender de
   que nadie se equivoque nunca:
   · COPIA AUTOMÁTICA: al guardar, si la última tiene más de BK_CADA horas, se
     guarda una copia del documento tal como estaba (Pages no admite tareas
     programadas: se hace «al trabajar»). Se conservan las 12 últimas, la última
     de cada día de los últimos 30 días y la última de cada semana de 12 semanas.
     Si un solo guardado borra 3 eventos o más, copia al instante.
   · PAPELERA: cada evento que se borra se guarda entero 30 días.
   · COPIA MANUAL (botón del admin) y COPIA PREVIA: antes de restaurar algo se
     copia lo que hay, así restaurar también se puede deshacer.
   · RESTAURAR: un evento (de una copia o de la papelera) o todo; lo restaurado
     se marca como «tocado ahora» para que gane a las copias viejas de los
     navegadores. Lo creado después de la copia se conserva.
   Las copias van comprimidas (gzip + base64) en D1. Solo el admin las ve. */
const BK_CADA = 4 * 3600e3;
let BK_OK = false;
async function ensureBackups(env) {
  if (BK_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS backups (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, kind TEXT NOT NULL, by_name TEXT, nev INTEGER, bytes INTEGER, nota TEXT, gz TEXT NOT NULL)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS papelera (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id TEXT NOT NULL, name TEXT, fecha TEXT, ts INTEGER NOT NULL, by_name TEXT, gz TEXT NOT NULL)").run();
  BK_OK = true;
}
function bkB64(u8) { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function bkUnB64(t) { const bin = atob(t), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
async function bkZip(txt) {
  const cs = new CompressionStream("gzip"), w = cs.writable.getWriter();
  w.write(enc.encode(txt)); w.close();
  return bkB64(new Uint8Array(await new Response(cs.readable).arrayBuffer()));
}
async function bkUnzip(b64) {
  const ds = new DecompressionStream("gzip"), w = ds.writable.getWriter();
  w.write(bkUnB64(b64)); w.close();
  return await new Response(ds.readable).text();
}
async function bkGuardar(env, txt, kind, by, nota, ts) {
  let n = 0; try { n = ((JSON.parse(txt) || {}).events || []).length; } catch (_) {}
  const r = await env.DB.prepare("INSERT INTO backups (ts, kind, by_name, nev, bytes, nota, gz) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
    .bind(ts || Date.now(), kind, by || "", n, txt.length, nota || "", await bkZip(txt)).run();
  return { ts: ts || Date.now(), kind, by: by || "", nev: n, bytes: txt.length, nota: nota || "", id: r && r.meta && r.meta.last_row_id };
}
/* qué copias se quedan: las 12 últimas automáticas + la última de cada día (30 días) y de cada semana (12 semanas);
   las manuales (30) y las previas a restaurar (10) aparte */
async function bkPodar(env, ahora) {
  const { results } = await env.DB.prepare("SELECT id, ts, kind FROM backups ORDER BY ts DESC, id DESC").all();
  const keep = new Set(), dias = {}, sems = {}; let nA = 0, nM = 0, nP = 0;
  (results || []).forEach((r) => {
    const ts = +r.ts;
    if (r.kind === "auto") {
      nA++; if (nA <= 12) keep.add(r.id);
      const dia = new Date(ts).toISOString().slice(0, 10), sem = Math.floor((ts + 3 * 864e5) / (7 * 864e5));
      if (!dias[dia] && ahora - ts <= 30 * 864e5) { dias[dia] = 1; keep.add(r.id); }
      if (!sems[sem] && ahora - ts <= 84 * 864e5) { sems[sem] = 1; keep.add(r.id); }
    } else if (r.kind === "manual") { nM++; if (nM <= 30) keep.add(r.id); }
    else { nP++; if (nP <= 10) keep.add(r.id); }
  });
  const fuera = (results || []).filter((r) => !keep.has(r.id)).map((r) => r.id);
  for (let i = 0; i < fuera.length; i += 40) {
    const ch = fuera.slice(i, i + 40);
    await env.DB.prepare("DELETE FROM backups WHERE id IN (" + ch.map((_, k) => "?" + (k + 1)).join(",") + ")").bind(...ch).run();
  }
}
/* se llama tras cada guardado correcto; «prev» es el documento de antes y «merged» el de ahora */
async function bkTrasGuardar(env, s, row, prev, merged) {
  if (!row || !row.data) return;
  await ensureBackups(env);
  const ahora = Date.now(), quien = s.name || s.email || "";
  const vivos = {}; (merged.events || []).forEach((e) => { if (e && e.id) vivos[e.id] = 1; });
  const idos = (prev.events || []).filter((e) => e && e.id && !vivos[e.id]);
  let copiado = false;
  if (idos.length) {
    for (const e of idos) {
      await env.DB.prepare("INSERT INTO papelera (event_id, name, fecha, ts, by_name, gz) VALUES (?1, ?2, ?3, ?4, ?5, ?6)")
        .bind(String(e.id), String(e.name || "").slice(0, 200), String((e.ficha && e.ficha.fecha) || ""), ahora, quien, await bkZip(JSON.stringify(e))).run();
    }
    await env.DB.prepare("DELETE FROM papelera WHERE ts < ?1").bind(ahora - 30 * 864e5).run();
    for (const e of idos) await logAct(env, s, "evento_borrado", String(e.name || e.id).slice(0, 120));
    if (idos.length >= 3) { await bkGuardar(env, row.data, "auto", quien, "Antes de borrar " + idos.length + " eventos de golpe", ahora); copiado = true; }
  }
  if (!copiado) {
    const ult = await env.DB.prepare("SELECT MAX(ts) AS m FROM backups WHERE kind='auto'").first();
    if (!ult || !ult.m || ahora - (+ult.m) >= BK_CADA) { await bkGuardar(env, row.data, "auto", quien, "", ahora); copiado = true; }
  }
  if (copiado) await bkPodar(env, ahora);
}

async function bkAdmin(request, env) {
  const s = await session(request, env);
  if (!s) return { err: json({ error: "unauth" }, 401) };
  if (s.role !== "admin") return { err: json({ error: "forbidden" }, 403) };
  await ensureBackups(env);
  return { s };
}
async function bkList(request, env) {
  const a = await bkAdmin(request, env); if (a.err) return a.err;
  const b = await env.DB.prepare("SELECT id, ts, kind, by_name AS by, nev, bytes, nota FROM backups ORDER BY ts DESC, id DESC LIMIT 200").all();
  const p = await env.DB.prepare("SELECT id, event_id, name, fecha, ts, by_name AS by FROM papelera WHERE ts >= ?1 ORDER BY ts DESC LIMIT 100").bind(Date.now() - 30 * 864e5).all();
  /* si el evento ya está otra vez en la lista (p. ej. se pulsó «Deshacer» al borrarlo), no se ofrece recuperar la copia vieja */
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  const vivos = {}; try { (JSON.parse((row && row.data) || "{}").events || []).forEach((e) => { if (e && e.id) vivos[e.id] = 1; }); } catch (_) {}
  return json({ ahora: Date.now(), cadaHoras: BK_CADA / 3600e3, backups: b.results || [], papelera: (p.results || []).filter((x) => !vivos[x.event_id]) });
}
async function bkCrear(request, env) {
  const a = await bkAdmin(request, env); if (a.err) return a.err;
  const b = await body(request);
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  if (!row || !row.data) return json({ error: "empty", message: "Todavía no hay nada que copiar." }, 400);
  const c = await bkGuardar(env, row.data, "manual", a.s.name || a.s.email, String(b.nota || "").slice(0, 120));
  await logAct(env, a.s, "copia_manual", "");
  await bkPodar(env, Date.now());
  return json({ ok: true, copia: c });
}
function bkSinUpdated(e) { const c = Object.assign({}, e); delete c.updated; return JSON.stringify(c); }
async function bkLeer(env, id) {
  const r = await env.DB.prepare("SELECT id, ts, kind, by_name AS by, gz FROM backups WHERE id=?1").bind(id).first();
  if (!r) return null;
  let doc = {}; try { doc = JSON.parse(await bkUnzip(r.gz)) || {}; } catch (_) { return null; }
  return { meta: { id: r.id, ts: r.ts, kind: r.kind, by: r.by }, doc };
}
async function bkVer(request, env, url) {
  const a = await bkAdmin(request, env); if (a.err) return a.err;
  const c = await bkLeer(env, +url.searchParams.get("id") || 0);
  if (!c) return json({ error: "not-found", message: "Esa copia ya no existe." }, 404);
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  let ahora = {}; try { ahora = JSON.parse((row && row.data) || "{}") || {}; } catch (_) {}
  const ya = {}; (ahora.events || []).forEach((e) => { if (e && e.id) ya[e.id] = e; });
  const eventos = (c.doc.events || []).filter((e) => e && e.id).map((e) => ({
    id: e.id, name: e.name || "", fecha: (e.ficha && e.ficha.fecha) || "", updated: e.updated || 0,
    estado: !ya[e.id] ? "falta" : (bkSinUpdated(ya[e.id]) === bkSinUpdated(e) ? "igual" : "cambia"),
  }));
  const dentro = {}; (c.doc.events || []).forEach((e) => { if (e && e.id) dentro[e.id] = 1; });
  const nuevos = (ahora.events || []).filter((e) => e && e.id && !dentro[e.id]).length;
  const dif = (k) => JSON.stringify(c.doc[k] || null) !== JSON.stringify(ahora[k] || null);
  return json({ copia: c.meta, eventos, nuevosDespues: nuevos, otros: { inventario: dif("inventario") || dif("invExtra"), camareros: dif("camareros"), prevision: dif("prevision"), parametros: dif("params") } });
}
async function bkBajar(request, env, url) {
  const a = await bkAdmin(request, env); if (a.err) return a.err;
  let txt, ts = Date.now(), tag = "completa";
  if (url.searchParams.get("actual") === "1") {
    const row = await env.DB.prepare("SELECT data, updated FROM store WHERE id=1").first();
    txt = (row && row.data) || "{}"; if (row && row.updated) ts = +row.updated;
  } else {
    const r = await env.DB.prepare("SELECT ts, gz FROM backups WHERE id=?1").bind(+url.searchParams.get("id") || 0).first();
    if (!r) return json({ error: "not-found" }, 404);
    txt = await bkUnzip(r.gz); ts = +r.ts; tag = "copia";
  }
  await logAct(env, a.s, "descarga_datos", url.searchParams.get("actual") === "1" ? "Todo" : "Una copia");
  const f = new Date(ts).toISOString().slice(0, 16).replace("T", "_").replace(":", "h");
  return new Response(txt, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Content-Disposition": 'attachment; filename="LesMoles_' + tag + "_" + f + '.json"' } });
}

/* aplica una copia a un documento vivo: lo restaurado se marca como tocado ahora (gana a copias viejas de los navegadores) */
function bkPonerEvento(doc, ev, ahora) {
  const e = JSON.parse(JSON.stringify(ev)); doc.events = Array.isArray(doc.events) ? doc.events : [];
  const i = doc.events.findIndex((x) => x && x.id === e.id);
  e.updated = Math.max(ahora, i >= 0 ? ((doc.events[i].updated || 0) + 1) : 0);
  kSellarTodo(e, e.updated, i >= 0 ? doc.events[i] : null);
  if (i >= 0) doc.events[i] = e; else doc.events.push(e);
  if (doc.borrados) delete doc.borrados[e.id];
  return e;
}
function bkListaId(snap, act, ahora) {
  const por = {}; (act || []).forEach((x) => { if (x && x.id) por[x.id] = x; });
  (snap || []).forEach((x) => { if (x && x.id) { const c = JSON.parse(JSON.stringify(x)); c.updated = ahora; por[x.id] = c; } });
  return Object.keys(por).map((k) => por[k]);
}
function bkPonerTodo(doc, snap, ahora) {
  let ne = 0; (snap.events || []).forEach((e) => { if (e && e.id) { bkPonerEvento(doc, e, ahora); ne++; } });
  doc.inventario = Object.assign({}, doc.inventario || {});
  Object.keys(snap.inventario || {}).forEach((k) => { const a = snap.inventario[k]; doc.inventario[k] = (a && typeof a === "object") ? Object.assign({}, JSON.parse(JSON.stringify(a)), { updated: ahora }) : a; });
  const ie = doc.invExtra || {}, se = snap.invExtra || {};
  doc.invExtra = { hojas: bkListaId(se.hojas, ie.hojas, ahora), categorias: bkListaId(se.categorias, ie.categorias, ahora), items: bkListaId(se.items, ie.items, ahora) };
  doc.camareros = { personas: bkListaId((snap.camareros || {}).personas, (doc.camareros || {}).personas, ahora) };
  const pa = doc.prevision || {}, ps = snap.prevision || {}, an = {};
  (pa.anios || []).concat(ps.anios || []).forEach((x) => { an[x] = 1; });
  doc.prevision = Object.assign({}, pa, ps, { filas: bkListaId(ps.filas, pa.filas, ahora), anios: Object.keys(an).map(Number) });
  const sec = Object.assign({}, (doc.params && doc.params.sec) || {});
  Object.keys(((snap.params || {}).sec) || {}).forEach((k) => { sec[k] = Object.assign({}, JSON.parse(JSON.stringify(snap.params.sec[k])), { updated: ahora }); });
  doc.params = { v: 1, sec };
  return ne;
}
async function bkRestaurar(request, env) {
  const a = await bkAdmin(request, env); if (a.err) return a.err;
  const b = await body(request), quien = a.s.name || a.s.email || "", ahora = Date.now();
  let fuente = null, evento = null, que = "";
  if (b.papelera) {
    const r = await env.DB.prepare("SELECT event_id, name, gz FROM papelera WHERE id=?1").bind(+b.papelera || 0).first();
    if (!r) return json({ error: "not-found", message: "Ese evento ya no está en la papelera." }, 404);
    try { evento = JSON.parse(await bkUnzip(r.gz)); } catch (_) { return json({ error: "corrupt" }, 500); }
    const act = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
    try { if (((JSON.parse((act && act.data) || "{}").events) || []).some((e) => e && e.id === r.event_id)) return json({ error: "exists", message: "Ese evento ya está en la lista de eventos." }, 409); } catch (_) {}
    que = "el evento «" + (r.name || r.event_id) + "» de la papelera";
  } else if (b.documento && typeof b.documento === "object" && !Array.isArray(b.documento) && b.todo) {
    if (!Array.isArray(b.documento.events)) return json({ error: "invalid", message: "Ese archivo no parece una copia de Les Moles." }, 400);
    fuente = b.documento; que = "todo desde un archivo";
  } else {
    const c = await bkLeer(env, +b.backup || 0);
    if (!c) return json({ error: "not-found", message: "Esa copia ya no existe." }, 404);
    if (b.todo) { fuente = c.doc; que = "todo desde la copia del " + new Date(c.meta.ts).toISOString().slice(0, 16).replace("T", " "); }
    else {
      evento = (c.doc.events || []).filter((e) => e && e.id === b.evento)[0];
      if (!evento) return json({ error: "not-found", message: "Ese evento no está en esa copia." }, 404);
      que = "el evento «" + (evento.name || evento.id) + "»";
    }
  }
  /* antes de tocar nada, copia de lo que hay: restaurar también se deshace */
  const cur = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  if (cur && cur.data) { await bkGuardar(env, cur.data, "previa", quien, "Antes de restaurar " + que, ahora); await bkPodar(env, ahora); }
  for (let intento = 0; intento < 6; intento++) {
    const row = await env.DB.prepare("SELECT data, updated FROM store WHERE id=1").first();
    let doc = {}; try { doc = JSON.parse((row && row.data) || "{}") || {}; } catch (_) { doc = {}; }
    const antes = row ? (+row.updated || 0) : 0, t = Date.now();
    let n = 0;
    if (evento) { bkPonerEvento(doc, evento, t); n = 1; } else n = bkPonerTodo(doc, fuente, t);
    const out = JSON.stringify(doc); let v = t; if (v <= antes) v = antes + 1;
    let r;
    if (row) r = await env.DB.prepare("UPDATE store SET data=?1, updated=?2 WHERE id=1 AND updated=?3").bind(out, v, antes).run();
    else r = await env.DB.prepare("INSERT OR IGNORE INTO store (id, data, updated) VALUES (1, ?1, ?2)").bind(out, v).run();
    const ch = r && r.meta && r.meta.changes != null ? r.meta.changes : 1;
    if (ch > 0) { await logAct(env, a.s, "restauracion", que); return json({ ok: true, v, eventos: n, que }); }
  }
  return json({ error: "busy", message: "Había muchos guardados a la vez; vuelve a intentarlo." }, 409);
}

/* ── HISTORIAL DE CAMBIOS POR EVENTO ───────────────────────────────────────
   Cada guardado que cambia un evento deja una huella: quién, qué secciones
   (plano, menú, escaleta…) y cuándo. Los cambios seguidos de la misma persona
   en el mismo evento (menos de HI_RAFAGA entre uno y otro) se juntan en una
   sola línea. Cada línea guarda el evento TAL COMO ESTABA ANTES de ese cambio:
   así se puede «volver a esa versión». Hasta HI_MAX líneas por evento y 180 días.
   Volver a una versión también deja su línea (con lo que había antes), de modo
   que se puede deshacer. */
const HI_RAFAGA = 10 * 60e3, HI_MAX = 50;
const HI_ORDEN = ["plano", "ficha", "menú", "bebidas", "escaleta", "minuta", "alergias", "camareros", "montaje", "agenda", "tareas", "proveedores", "presupuesto", "comunicación", "documentos", "avisos", "cierre", "aprobaciones", "contrato", "compras", "portal del cliente", "otros datos"];
let HI_OK = false;
async function ensureHistorial(env) {
  if (HI_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS historial (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id TEXT NOT NULL, ts INTEGER NOT NULL, ts_fin INTEGER NOT NULL, uid TEXT, by_name TEXT, secs TEXT, nota TEXT, gz TEXT)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS historial_ev ON historial (event_id, id)").run();
  HI_OK = true;
}
/* a qué sección del evento pertenece cada dato (lo derivado, como la «foto» del portal, no cuenta) */
function hiSeccion(k) {
  if (/^(text|name|plans|loc|tpl\w*|userSize|rot\w*|pos|plan\w*)$/.test(k)) return "plano";
  if (k === "ficha") return "ficha";
  if (/^camareros|^reparto$|^turnos$/.test(k)) return "camareros";
  if (k === "cierre" || k === "cierreServicio") return "cierre";
  if (k === "aprobaciones") return "aprobaciones";
  if (k === "contrato") return "contrato";
  if (k === "pedidos" || k === "recepcion") return "compras";
  if (k === "hitos" || k === "agendaHecho") return "agenda";
  if (k === "tareas") return "tareas";
  if (k === "proveedores") return "proveedores";
  if (k === "presupuesto") return "presupuesto";
  if (k === "comunicaciones") return "comunicación";
  if (k === "fotos" || k === "docs") return "documentos";
  if (k === "avisos") return "avisos";
  if (k === "montaje") return "montaje";
  return "otros datos";
}
/* para comparar: lo vacío (texto vacío, 0, false, [], {}) es como si no estuviera, así que cuando la app añade valores por defecto a un evento viejo no cuenta como cambio */
function hiLimpia(v) {
  if (Array.isArray(v)) { const a = v.map(hiLimpia).filter((x) => x !== undefined); return a.length ? a : undefined; }
  if (v && typeof v === "object") { const o = {}; Object.keys(v).forEach((k) => { const x = hiLimpia(v[k]); if (x !== undefined) o[k] = x; }); return Object.keys(o).length ? o : undefined; }
  if (v === "" || v === null || v === undefined || v === false || v === 0) return undefined;
  return v;
}
function hiHuella(e) {
  const o = {}, add = (sec, k, v) => { v = hiLimpia(v); if (v !== undefined) o[sec] = (o[sec] || "") + k + "=" + JSON.stringify(v) + "|"; };
  Object.keys(e || {}).forEach((k) => {
    if (k === "id" || k === "updated" || k === "rev" || k.charAt(0) === "_") return;   /* «rev» = las revisiones de cada departamento: no son un cambio del evento */
    if (/^(fitV\d+|numV\d+|marcasLM|prevId|tplFixed\d*)$/.test(k)) return;   /* marcas internas de las migraciones de la app */
    if (k === "reparto" && JSON.stringify(hiLimpia(e.reparto)) === '{"tipo":"comida"}') return;   /* el reparto «de fábrica» */
    if (k === "menu") {
      const m = e.menu || {};
      Object.keys(m).forEach((mk) => add(/^bebida/.test(mk) ? "bebidas" : mk === "escaleta" ? "escaleta" : mk === "minuta" ? "minuta" : /^aler/.test(mk) ? "alergias" : "menú", "menu." + mk, m[mk]));
      return;
    }
    if (k === "share") { const sh = e.share || {}; add("portal del cliente", "share", { on: sh.on, id: sh.id, auto: sh.auto }); return; }
    add(hiSeccion(k), k, e[k]);
  });
  return o;
}
function hiDiff(a, b) {
  const x = hiHuella(a), y = hiHuella(b), ks = {}; Object.keys(x).concat(Object.keys(y)).forEach((k) => { ks[k] = 1; });
  return Object.keys(ks).filter((k) => x[k] !== y[k]).sort((p, q) => HI_ORDEN.indexOf(p) - HI_ORDEN.indexOf(q));
}
async function hiAnotar(env, e, antes, secs, uid, quien, nota, ahora, juntar) {
  const ult = juntar ? await env.DB.prepare("SELECT id, uid, ts_fin, secs, (gz IS NOT NULL) AS tiene FROM historial WHERE event_id=?1 ORDER BY id DESC LIMIT 1").bind(e.id).first() : null;
  if (ult && ult.tiene && antes && ult.uid === uid && ahora - (+ult.ts_fin) < HI_RAFAGA) {   /* la línea «Evento creado» no se junta con nada: no tiene versión anterior */
    const un = {}; String(ult.secs || "").split(",").concat(secs).forEach((x) => { if (x) un[x] = 1; });
    const todas = Object.keys(un).sort((p, q) => HI_ORDEN.indexOf(p) - HI_ORDEN.indexOf(q));
    await env.DB.prepare("UPDATE historial SET ts_fin=?1, secs=?2 WHERE id=?3").bind(ahora, todas.join(","), ult.id).run();
    return;
  }
  await env.DB.prepare("INSERT INTO historial (event_id, ts, ts_fin, uid, by_name, secs, nota, gz) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)")
    .bind(String(e.id), ahora, ahora, uid || "", quien || "", secs.join(","), nota || "", antes ? await bkZip(JSON.stringify(antes)) : null).run();
  await env.DB.prepare("DELETE FROM historial WHERE event_id=?1 AND id NOT IN (SELECT id FROM historial WHERE event_id=?1 ORDER BY id DESC LIMIT " + HI_MAX + ")").bind(String(e.id)).run();
}
/* tras cada guardado correcto: ¿qué eventos han cambiado y en qué? («prev» es el documento de antes y «merged» el de ahora) */
async function hiTrasGuardar(env, s, prev, merged) {
  const antes = {}; (prev.events || []).forEach((e) => { if (e && e.id) antes[e.id] = e; });
  const cambios = [];
  (merged.events || []).forEach((e) => {
    if (!e || !e.id) return;
    const p = antes[e.id];
    if (!p) { cambios.push({ e, p: null, secs: [], nota: "Evento creado" }); return; }
    if ((p.updated || 0) === (e.updated || 0)) return;          /* misma versión: nada que mirar */
    const secs = hiDiff(p, e); if (secs.length) cambios.push({ e, p, secs, nota: "" });
  });
  if (!cambios.length) return;
  await ensureHistorial(env);
  const ahora = Date.now(), quien = s.name || s.email || "";
  for (const c of cambios) { await hiAnotar(env, c.e, c.p, c.secs, s.uid, quien, c.nota, ahora, !c.nota); if (!c.p) await logAct(env, s, "evento_creado", String(c.e.name || c.e.id).slice(0, 120)); }
  if (Math.random() < 0.02) await env.DB.prepare("DELETE FROM historial WHERE ts_fin < ?1").bind(ahora - 180 * 864e5).run();
}
async function hiAcceso(request, env) {
  const s = await session(request, env);
  if (!s) return { err: json({ error: "unauth" }, 401) };
  if (s.role !== "admin" && s.role !== "eventos") return { err: json({ error: "forbidden" }, 403) };
  await ensureHistorial(env);
  return { s };
}
async function hiList(request, env, url) {
  const a = await hiAcceso(request, env); if (a.err) return a.err;
  const ev = String(url.searchParams.get("ev") || "");
  if (!ev) return json({ error: "invalid" }, 400);
  const { results } = await env.DB.prepare("SELECT id, ts, ts_fin, by_name AS by, secs, nota, (gz IS NOT NULL) AS tiene FROM historial WHERE event_id=?1 ORDER BY id DESC LIMIT " + HI_MAX).bind(ev).all();
  return json({ ahora: Date.now(), cambios: (results || []).map((r) => ({ id: r.id, ts: r.ts, fin: r.ts_fin, by: r.by, secs: String(r.secs || "").split(",").filter(Boolean), nota: r.nota || "", tiene: !!r.tiene })) });
}
async function hiLeer(env, id) {
  const r = await env.DB.prepare("SELECT id, event_id, ts, ts_fin, by_name, gz FROM historial WHERE id=?1").bind(id).first();
  if (!r || !r.gz) return null;
  let snap = null; try { snap = JSON.parse(await bkUnzip(r.gz)); } catch (_) { return null; }
  return { r, snap };
}
async function hiVer(request, env, url) {
  const a = await hiAcceso(request, env); if (a.err) return a.err;
  const h = await hiLeer(env, +url.searchParams.get("id") || 0);
  if (!h) return json({ error: "not-found", message: "Esa versión ya no está guardada." }, 404);
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  let doc = {}; try { doc = JSON.parse((row && row.data) || "{}") || {}; } catch (_) {}
  const act = (doc.events || []).filter((e) => e && e.id === h.r.event_id)[0];
  return json({ existe: !!act, cambian: act ? hiDiff(act, h.snap) : ["evento borrado"], nombre: h.snap.name || "" });
}
async function hiRestaurar(request, env) {
  const a = await hiAcceso(request, env); if (a.err) return a.err;
  const b = await body(request), h = await hiLeer(env, +b.id || 0);
  if (!h) return json({ error: "not-found", message: "Esa versión ya no está guardada." }, 404);
  const quien = a.s.name || a.s.email || "";
  for (let intento = 0; intento < 6; intento++) {
    const row = await env.DB.prepare("SELECT data, updated FROM store WHERE id=1").first();
    let doc = {}; try { doc = JSON.parse((row && row.data) || "{}") || {}; } catch (_) { doc = {}; }
    const antes = row ? (+row.updated || 0) : 0, t = Date.now();
    const act = (doc.events || []).filter((e) => e && e.id === h.r.event_id)[0] || null;
    const previo = act ? JSON.parse(JSON.stringify(act)) : null;
    bkPonerEvento(doc, h.snap, t);
    const out = JSON.stringify(doc); let v = t; if (v <= antes) v = antes + 1;
    let r;
    if (row) r = await env.DB.prepare("UPDATE store SET data=?1, updated=?2 WHERE id=1 AND updated=?3").bind(out, v, antes).run();
    else r = await env.DB.prepare("INSERT OR IGNORE INTO store (id, data, updated) VALUES (1, ?1, ?2)").bind(out, v).run();
    const ch = r && r.meta && r.meta.changes != null ? r.meta.changes : 1;
    if (ch > 0) {
      const secs = previo ? hiDiff(previo, h.snap) : ["plano"];
      try { await hiAnotar(env, h.snap, previo, secs.length ? secs : ["otros datos"], a.s.uid, quien, "Volvió a la versión anterior al cambio de " + new Date(+h.r.ts).toISOString().slice(0, 16).replace("T", " "), Date.now(), false); } catch (_) {}
      await logAct(env, a.s, "version_restaurada", String(h.snap.name || h.r.event_id).slice(0, 120));
      return json({ ok: true, v, cambian: secs });
    }
  }
  return json({ error: "busy", message: "Había muchos guardados a la vez; vuelve a intentarlo." }, 409);
}

/* ══ FUSIÓN DE UN EVENTO POR SECCIONES ═══════════════════════════════════
   Antes, al juntar dos copias de un evento ganaba la más reciente ENTERA: si
   Eventos cambiaba el plano y, a la vez, Cocina cambiaba el menú del mismo
   evento, el que guardaba después borraba lo del otro. Ahora cada evento lleva
   e._k = { camino: milisegundos } con el momento en que alguien cambió ESA
   parte (el camino baja hasta 3 niveles: «menu», «menu\u001fdishes»,
   «menu\u001fdishes\u001fAPERITIVOS#3»). Al juntar dos copias, cada parte la
   gana la copia que la cambió más tarde; lo que nadie ha tocado se queda como
   está. Lo único que se escribe entre varias personas a la vez —el texto del
   plano, que también lleva los platos sustitutivos de Cocina— se junta línea a
   línea tomando como base la versión que la persona tenía antes de editar.
   Sin sellos (copias de antes de esta versión), vale la regla de siempre: gana
   el evento entero más reciente. */
var K_SEP = "\u001f", K_NIVELES = 3, K_FUERA = { id: 1, updated: 1, _k: 1, _tb: 1 };
function kObj(v) { return !!v && typeof v === "object" && !Array.isArray(v); }
/* caminos «hoja» de un evento */
function kCaminos(e) {
  var out = [];
  (function rec(o, pre, nivel) {
    Object.keys(o).forEach(function (k) {
      if (nivel === 0 && K_FUERA[k]) return;
      var v = o[k], p = pre ? pre + K_SEP + k : k;
      if (kObj(v) && nivel + 1 < K_NIVELES && Object.keys(v).length) rec(v, p, nivel + 1);
      else out.push(p);
    });
  })(e || {}, "", 0);
  return out;
}
function kGet(e, p) {
  var seg = p.split(K_SEP), v = e;
  for (var i = 0; i < seg.length; i++) { if (!kObj(v) && i > 0) return undefined; if (v == null) return undefined; v = v[seg[i]]; }
  return v;
}
function kPon(out, p, v) {
  var seg = p.split(K_SEP), o = out;
  for (var i = 0; i < seg.length - 1; i++) { if (!kObj(o[seg[i]])) o[seg[i]] = {}; o = o[seg[i]]; }
  o[seg[seg.length - 1]] = v;
}
function kHash(v) {
  var s = JSON.stringify(v); if (s === undefined) return "u";
  var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return h + ":" + s.length;
}
/* el sello de una parte; una copia sin sellos (de antes) cuenta como si TODO se hubiera tocado cuando se guardó */
function kSello(e, p) { return e._k ? (+e._k[p] || 0) : (+e.updated || 0); }
/* ¿lo de «a» gana o iguala a lo de «b» en todo? (entonces no hay nada que juntar) */
function kDomina(a, b) {
  if ((+b.updated || 0) > (+a.updated || 0)) return false;
  if (!b._k) return !!a._k ? false : true;
  var ka = a._k, kb = b._k; if (!ka) return (+a.updated || 0) >= Math.max.apply(null, [0].concat(Object.keys(kb).map(function (k) { return +kb[k] || 0; })));
  for (var k in kb) if ((+kb[k] || 0) > (+ka[k] || 0)) return false;
  return true;
}
/* ── fusión de líneas a tres bandas (base = lo que se tenía antes de editar) ── */
function m3Mapa(B, X) {
  var n = B.length, m = X.length, map = new Array(n), i;
  for (i = 0; i < n; i++) map[i] = -1;
  var s = 0; while (s < n && s < m && B[s] === X[s]) { map[s] = s; s++; }
  var f = 0; while (f < n - s && f < m - s && B[n - 1 - f] === X[m - 1 - f]) { map[n - 1 - f] = m - 1 - f; f++; }
  var N = n - s - f, M = m - s - f;
  if (N > 0 && M > 0) {
    if (N * M > 3e6) return null;
    var w = M + 1, t = new Uint16Array((N + 1) * w), j;
    for (i = N - 1; i >= 0; i--) for (j = M - 1; j >= 0; j--)
      t[i * w + j] = B[s + i] === X[s + j] ? t[(i + 1) * w + j + 1] + 1 : Math.max(t[(i + 1) * w + j], t[i * w + j + 1]);
    i = 0; j = 0;
    while (i < N && j < M) {
      if (B[s + i] === X[s + j]) { map[s + i] = s + j; i++; j++; }
      else if (t[(i + 1) * w + j] >= t[i * w + j + 1]) i++; else j++;
    }
  }
  return map;
}
function m3Igual(x, y) { if (x.length !== y.length) return false; for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false; return true; }
/* a = lo que hay, b = lo que llega; si los dos cambian lo mismo, gana «b» cuando preferB.
   Dos inserciones en el mismo sitio se quedan las dos (no se pierde ningún invitado). */
function m3(base, a, b, preferB) {
  if (a === b) return a; if (a === base) return b; if (b === base) return a;
  var B = base.split("\n"), A = a.split("\n"), C = b.split("\n");
  var ma = m3Mapa(B, A), mc = ma && m3Mapa(B, C); if (!ma || !mc) return null;
  var out = [], ib = 0, ia = 0, ic = 0, k;
  function trozo(fb, fa, fc) {
    var tb = B.slice(ib, fb), ta = A.slice(ia, fa), tc = C.slice(ic, fc);
    var r = m3Igual(ta, tb) ? tc : m3Igual(tc, tb) ? ta : m3Igual(ta, tc) ? ta : !tb.length ? ta.concat(tc) : (preferB ? tc : ta);
    for (var q = 0; q < r.length; q++) out.push(r[q]);
  }
  for (k = 0; k < B.length; k++) {
    if (ma[k] >= 0 && mc[k] >= 0) { trozo(k, ma[k], mc[k]); out.push(B[k]); ib = k + 1; ia = ma[k] + 1; ic = mc[k] + 1; }
  }
  trozo(B.length, A.length, C.length);
  return out.join("\n");
}
/* p = el evento que hay; i = el que llega; tb = el texto del plano que tenía quien lo envía antes de editarlo (si lo sabe).
   Devuelve «p» o «i» tal cual cuando uno de los dos lo trae todo. */
function mergeEv(p, i, tb) {
  if (!p) return i; if (!i) return p;
  if (p.anonimizado && !i.anonimizado) return p;   /* v02.01: un evento ya anonimizado no resucita con una copia vieja */
  var gana = (+p.updated || 0) > (+i.updated || 0) ? p : i;
  if (!p._k && !i._k) return gana;
  /* si uno de los dos ya lo tiene todo, se devuelve ese mismo (a igualdad, el que llega: así no se cambia el objeto que la pantalla tiene en la mano) */
  if (kDomina(i, p) && (typeof tb !== "string" || tb === p.text || tb === i.text)) return i;
  if (kDomina(p, i) && (typeof tb !== "string" || tb === p.text || tb === i.text)) return p;
  var ps = {}, out = {}, sellos = {};
  kCaminos(p).concat(kCaminos(i)).forEach(function (k) { ps[k] = 1; });
  Object.keys(p._k || {}).concat(Object.keys(i._k || {})).forEach(function (k) { ps[k] = 1; });
  Object.keys(ps).forEach(function (k) {
    var a = kSello(p, k), b = kSello(i, k), src = a > b ? p : b > a ? i : gana, v = kGet(src, k);
    if (k === "text" && typeof tb === "string" && typeof p.text === "string" && typeof i.text === "string" && p.text !== i.text && tb !== p.text && tb !== i.text) {
      var f = m3(tb, p.text, i.text, b >= a); if (f != null) v = f;
    } else if (k === "text" && typeof tb === "string" && typeof p.text === "string" && typeof i.text === "string" && p.text !== i.text) {
      v = tb === p.text ? i.text : p.text;   /* uno de los dos no ha tocado el texto: vale el del otro */
    }
    if (v !== undefined) kPon(out, k, v);
    var s = Math.max(a, b); if (s) sellos[k] = s;
  });
  out.id = i.id != null ? i.id : p.id;
  out.updated = Math.max(+p.updated || 0, +i.updated || 0);
  out._k = sellos;
  return out;
}
/* sella TODO un evento con un instante (restaurar una copia: tiene que ganar a lo anterior, también lo que la copia ya no tiene) */
function kSellarTodo(e, t, antes) {
  var s = {}; kCaminos(e).forEach(function (k) { s[k] = t; });
  if (antes) { kCaminos(antes).forEach(function (k) { s[k] = t; }); Object.keys(antes._k || {}).forEach(function (k) { s[k] = t; }); }
  e._k = s; return e;
}

function porId(a, b, preferA) {
  const por = {};
  (b || []).forEach((x) => { if (x && x.id) por[x.id] = x; });
  (a || []).forEach((x) => { if (!x || !x.id) return; const y = por[x.id]; if (!y || (preferA ? (x.updated || 0) >= (y.updated || 0) : (x.updated || 0) > (y.updated || 0))) por[x.id] = x; });
  return Object.keys(por).map((k) => por[k]);
}
/* los sellos de más de 30 días ya no hacen falta (nadie sigue con una copia tan vieja) */
function kPoda(doc, ahora) {
  const lim = ahora - 30 * 864e5;
  (doc.events || []).forEach((e) => { if (e && e._k) Object.keys(e._k).forEach((k) => { if ((+e._k[k] || 0) < lim) delete e._k[k]; }); });
}
function mergeDoc(prev, inc, isAdmin, tbs) {
  prev = prev || {}; inc = inc || {};
  const out = Object.assign({}, prev, inc);
  /* borrados: de los dos lados, el más reciente */
  const bor = Object.assign({}, prev.borrados || {});
  Object.keys(inc.borrados || {}).forEach((k) => { const t = +inc.borrados[k] || 0; if (t > (+bor[k] || 0)) bor[k] = t; });
  /* eventos: uno a uno y, dentro de cada uno, sección a sección (ver mergeEv): lo que cambian dos departamentos a la vez en el mismo evento se junta */
  const pe = {}; (prev.events || []).forEach((e) => { if (e && e.id) pe[e.id] = e; });
  const orden = [], vis = {}, evs = {};
  (inc.events || []).forEach((e) => { if (!e || !e.id || vis[e.id]) return; vis[e.id] = 1; orden.push(e.id); const p = pe[e.id]; evs[e.id] = p ? mergeEv(p, e, tbs && tbs[e.id]) : e; });
  (prev.events || []).forEach((e) => { if (!e || !e.id || vis[e.id]) return; vis[e.id] = 1; orden.push(e.id); evs[e.id] = e; });
  out.events = orden.map((id) => evs[id]).filter((e) => {
    const t = +bor[e.id] || 0; if (!t) return true;
    if ((e.updated || 0) > t) { delete bor[e.id]; return true; }   /* tocado después del borrado: vuelve */
    return false;
  });
  /* los borrados de hace más de un año ya no hacen falta */
  const lim = Date.now() - 400 * 864e5; Object.keys(bor).forEach((k) => { if ((+bor[k] || 0) < lim) delete bor[k]; });
  out.borrados = bor;
  /* inventario (correcciones por artículo) */
  const inv = Object.assign({}, prev.inventario || {});
  Object.keys(inc.inventario || {}).forEach((k) => { const a = inc.inventario[k], b = inv[k]; if (!b || ((a && a.updated) || 0) >= ((b && b.updated) || 0)) inv[k] = a; });
  out.inventario = inv;
  const ie = prev.invExtra || {}, ii = inc.invExtra || {};
  out.invExtra = { hojas: porId(ii.hojas, ie.hojas, true), categorias: porId(ii.categorias, ie.categorias, true), items: porId(ii.items, ie.items, true) };
  out.camareros = { personas: porId((inc.camareros || {}).personas, (prev.camareros || {}).personas, true) };
  /* proveedores de compra y a quién se asigna cada artículo: por id, gana el cambio más reciente (quitar = «borrado», desasignar = «prov» vacío) */
  out.compras = { provs: porId((inc.compras || {}).provs, (prev.compras || {}).provs, true), asig: porId((inc.compras || {}).asig, (prev.compras || {}).asig, true) };
  const pp = prev.prevision || {}, ip = inc.prevision || {}, an = {};
  (pp.anios || []).concat(ip.anios || []).forEach((a) => { an[a] = 1; });
  out.prevision = Object.assign({}, pp, ip, { filas: porId(ip.filas, pp.filas, true), anios: Object.keys(an).map(Number) });
  out.params = mergeParams(prev.params, inc.params, isAdmin);
  return out;
}

/* ── quién está conectado: cada navegador avisa cada ~15 s de en qué evento
   está; se devuelven los demás de los últimos 45 s y la versión del documento
   (si ha cambiado, el navegador se trae lo nuevo) ── */
let PRES_OK = false;
async function ensurePresencia(env) {
  if (PRES_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS presencia (tab TEXT PRIMARY KEY, uid TEXT, name TEXT, ev TEXT, ts INTEGER NOT NULL)").run();
  PRES_OK = true;
}
/* cuándo mandó el cliente lo último (un mensaje o un archivo): si cambia, la app del equipo lo mira al momento */
async function porUltimo(env) {
  try { await ensurePortal(env); const a = await env.DB.prepare("SELECT MAX(ts) AS m FROM portal_msg WHERE de='cliente'").first(), b = await env.DB.prepare("SELECT MAX(ts) AS m FROM portal_arch WHERE de='cliente'").first(); return Math.max((a && +a.m) || 0, (b && +b.m) || 0); } catch (_) { return 0; }
}
async function syncRoute(request, env, url) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  /* ?l=1: latido ligero (cada pocos segundos): solo «hay una lista nueva del cliente»; no apunta presencia */
  if (url.searchParams.get("l") === "1") {
    let l = 0;
    try { await ensureNovios(env); const r = await env.DB.prepare("SELECT MAX(updated) AS m FROM novios_listas WHERE estado IN ('borrador','enviada')").first(); l = (r && +r.m) || 0; } catch (_) {}
    return json({ l, c: await porUltimo(env) });
  }
  await ensurePresencia(env);
  const tab = String(url.searchParams.get("tab") || "").slice(0, 40), ev = String(url.searchParams.get("ev") || "").slice(0, 80), now = Date.now();
  if (tab) await env.DB.prepare("INSERT INTO presencia (tab, uid, name, ev, ts) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT(tab) DO UPDATE SET uid=?2, name=?3, ev=?4, ts=?5")
    .bind(tab, s.uid, s.name || s.email, ev, now).run();
  if (Math.random() < 0.05) await env.DB.prepare("DELETE FROM presencia WHERE ts < ?").bind(now - 3600e3).run();
  const { results } = await env.DB.prepare("SELECT tab, uid, name, ev, ts FROM presencia WHERE ts > ?1 AND tab <> ?2 ORDER BY ts DESC LIMIT 50").bind(now - 45e3, tab).all();
  const row = await env.DB.prepare("SELECT updated FROM store WHERE id=1").first();
  /* «l»: cuándo guardó el cliente por última vez una lista pendiente de pasar al plano. Si cambia, la app del equipo la mira al momento */
  let l = 0;
  try { await ensureNovios(env); const r = await env.DB.prepare("SELECT MAX(updated) AS m FROM novios_listas WHERE estado IN ('borrador','enviada')").first(); l = (r && +r.m) || 0; } catch (_) {}
  try { await privAuto(env); } catch (e0) { await logError(env, "servidor", "anonimización automática", String(e0 && e0.message || e0), null); }
  try { await privPurgas(env); } catch (e0) { await logError(env, "servidor", "limpieza diaria", String(e0 && e0.message || e0), null); }
  let pv = 0;
  try { await ensurePlanos(env); const r = await env.DB.prepare("SELECT MAX(v) AS m FROM planos").first(); pv = (r && +r.m) || 0; } catch (_) {}
  return json({ v: (row && +row.updated) || 0, l, c: await porUltimo(env), p: pv, otros: (results || []).map((r) => ({ tab: r.tab, name: r.name, ev: r.ev, yo: r.uid === s.uid })) });
}

function mergeParams(prev, inc, isAdmin) {
  const out = { v: 1, sec: {} };
  const ps = (prev && prev.sec) || {}, is = (inc && inc.sec) || {};
  Object.keys(ps).forEach((k) => { out.sec[k] = ps[k]; });
  if (isAdmin) Object.keys(is).forEach((k) => {
    const a = is[k], b = out.sec[k];
    if (a && (!b || (a.updated || 0) > (b.updated || 0))) out.sec[k] = a;
  });
  return out;
}

/* ── usuarios (solo admin) ──────────────────────────────────────────── */
/* columnas y tablas nuevas (se crean solas la primera vez) */
let US_OK = false;
async function ensureUsers(env) {
  if (US_OK) return;
  const { results } = await env.DB.prepare("SELECT name FROM pragma_table_info('users')").all();
  const tiene = {}; (results || []).forEach((r) => { tiene[r.name] = 1; });
  const cols = [["phone", "TEXT"], ["puesto", "TEXT"], ["active", "INTEGER DEFAULT 1"], ["last_login", "INTEGER"], ["login_count", "INTEGER DEFAULT 0"], ["last_seen", "INTEGER"], ["must_change", "INTEGER DEFAULT 0"], ["invite_token", "TEXT"], ["invite_exp", "INTEGER"], ["sess_from", "INTEGER DEFAULT 0"], ["last_act", "INTEGER"]];
  for (const c of cols) if (!tiene[c[0]]) { try { await env.DB.prepare("ALTER TABLE users ADD COLUMN " + c[0] + " " + c[1]).run(); } catch (_) {} }
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS actividad (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, uid TEXT, name TEXT, tipo TEXT NOT NULL, detalle TEXT)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS actividad_ts ON actividad (ts)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)").run();
  /* sesiones cerradas a mano (la firma de la cookie, hasta que caduque) e intentos de entrada fallidos (correo + conexión) */
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS sesiones_cerradas (k TEXT PRIMARY KEY, exp INTEGER NOT NULL)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS login_fallos (ts INTEGER NOT NULL, email TEXT NOT NULL, ip TEXT NOT NULL)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS login_fallos_ts ON login_fallos (ts)").run();
  US_OK = true;
}
/* registro de actividad: quién hizo qué (nunca debe hacer fallar lo que se estaba haciendo) */
async function logAct(env, s, tipo, detalle) {
  try {
    await ensureUsers(env);
    const ahora = Date.now();
    await env.DB.prepare("INSERT INTO actividad (ts, uid, name, tipo, detalle) VALUES (?1, ?2, ?3, ?4, ?5)").bind(ahora, (s && s.uid) || "", (s && (s.name || s.email)) || "", tipo, String(detalle || "").slice(0, 300)).run();
    if (Math.random() < 0.01) await env.DB.prepare("DELETE FROM actividad WHERE ts < ?1").bind(ahora - 400 * 864e5).run();
  } catch (_) {}
}
function fichaUsuario(u, ahora) {
  const pend = !!u.invite_token;
  return {
    id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone || "", puesto: u.puesto || "", active: u.active !== 0,
    estado: u.active === 0 ? "desactivado" : pend ? ((u.invite_exp || 0) > ahora ? "invitado" : "invitacion-caducada") : "activo",
    mustChange: !!u.must_change, created: u.created_at, lastLogin: u.last_login || null, logins: u.login_count || 0, lastSeen: u.last_seen || null,
    invite: pend && (u.invite_exp || 0) > ahora ? { token: u.invite_token, exp: u.invite_exp } : null,
  };
}
const COLS_USER = "id, email, name, role, phone, puesto, active, created_at, last_login, login_count, last_seen, must_change, invite_token, invite_exp";
async function otrosAdmins(env, id) {
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin' AND COALESCE(active,1)=1 AND id<>?1").bind(id).first();
  return (r && r.n) || 0;
}
async function usersAdmin(request, env) {
  const s = await session(request, env);
  if (!s) return { err: json({ error: "unauth" }, 401) };
  if (s.role !== "admin") return { err: json({ error: "forbidden" }, 403) };
  return { s };
}
async function usersList(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  const { results } = await env.DB.prepare("SELECT " + COLS_USER + " FROM users ORDER BY created_at").all();
  const ahora = Date.now();
  return json({ ahora, users: (results || []).map((u) => fichaUsuario(u, ahora)) });
}

async function usersCreate(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  const b = await body(request);
  const email = norm(b.email), name = String(b.name == null ? "" : b.name).trim(), pass = typeof b.password === "string" ? b.password : "";
  const phone = String(b.phone || "").trim().slice(0, 40), puesto = String(b.puesto || "").trim().slice(0, 80);
  let role = String(b.role || "eventos").trim();
  if (ROLES.indexOf(role) < 0) role = "eventos";
  if (!validEmail(email) || !name) return json({ error: "invalid", message: "Hace falta un nombre y un email válido." }, 400);
  if (pass && pass.length < 6) return json({ error: "invalid", message: "La contraseña debe tener 6 caracteres o más." }, 400);
  const exists = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
  if (exists) return json({ error: "exists", message: "Ya existe un usuario con ese email." }, 409);
  /* con contraseña inicial: la persona deberá cambiarla al entrar; sin ella: se la invita con un enlace de un solo uso (7 días) */
  const user = await createUser(env, { email, name, role, password: pass || randomHex(16), phone, puesto, mustChange: pass ? 1 : 0, invite: !pass });
  await logAct(env, a.s, pass ? "usuario_creado" : "usuario_invitado", name + " (" + email + ", " + rolTxt(role) + ")");
  const row = await env.DB.prepare("SELECT " + COLS_USER + " FROM users WHERE id=?1").bind(user.id).first();
  return json({ ok: true, user: fichaUsuario(row, Date.now()) });
}
function rolTxt(r) { return { admin: "administrador", eventos: "eventos", cocina: "cocina", compras: "compras", contabilidad: "contabilidad", servicio: "servicio" }[r] || r; }

async function usersPatch(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  const s = a.s, b = await body(request);
  const id = String(b.id == null ? "" : b.id).trim();
  if (!id) return json({ error: "invalid" }, 400);
  const row = await env.DB.prepare("SELECT " + COLS_USER + " FROM users WHERE id=?").bind(id).first();
  if (!row) return json({ error: "not-found", message: "Ese usuario ya no existe." }, 404);
  const quien = row.name || row.email;
  if (b.role != null) {
    const role = String(b.role).trim();
    if (ROLES.indexOf(role) < 0) return json({ error: "invalid", message: "Rol no válido." }, 400);
    if (id === s.uid && role !== "admin") return json({ error: "self", message: "No puedes quitarte el rol de administrador a ti mismo." }, 400);
    if (row.role === "admin" && role !== "admin" && !(await otrosAdmins(env, id))) return json({ error: "last-admin", message: "Tiene que quedar al menos un administrador." }, 400);
    if (role !== row.role) { await env.DB.prepare("UPDATE users SET role=? WHERE id=?").bind(role, id).run(); await logAct(env, s, "rol_cambiado", quien + ": " + rolTxt(row.role) + " → " + rolTxt(role)); }
  }
  if (b.name != null) {
    const name = String(b.name).trim();
    if (!name) return json({ error: "invalid", message: "El nombre no puede quedar vacío." }, 400);
    if (name !== row.name) { await env.DB.prepare("UPDATE users SET name=? WHERE id=?").bind(name, id).run(); await logAct(env, s, "usuario_editado", quien + " ahora se llama " + name); }
  }
  if (b.phone != null || b.puesto != null) {
    await env.DB.prepare("UPDATE users SET phone=?1, puesto=?2 WHERE id=?3").bind(b.phone != null ? String(b.phone).trim().slice(0, 40) : (row.phone || ""), b.puesto != null ? String(b.puesto).trim().slice(0, 80) : (row.puesto || ""), id).run();
  }
  if (b.active != null) {
    const act = b.active ? 1 : 0;
    if (!act && id === s.uid) return json({ error: "self", message: "No puedes desactivar tu propia cuenta." }, 400);
    if (!act && row.role === "admin" && !(await otrosAdmins(env, id))) return json({ error: "last-admin", message: "Tiene que quedar al menos un administrador activo." }, 400);
    if ((row.active !== 0 ? 1 : 0) !== act) { await env.DB.prepare("UPDATE users SET active=?, sess_from=? WHERE id=?").bind(act, Date.now(), id).run(); await logAct(env, s, act ? "usuario_activado" : "usuario_desactivado", quien); }
  }
  if (b.password != null) {
    const pass = String(b.password);
    if (pass.length < 6) return json({ error: "invalid", message: "La contraseña debe tener 6 caracteres o más." }, 400);
    const salt = randomHex(16), hash = await pbkdf2(pass, salt);
    /* contraseña puesta por un administrador: es temporal, la persona elige la suya al entrar */
    await env.DB.prepare("UPDATE users SET pass_hash=?, pass_salt=?, must_change=1, invite_token=NULL, invite_exp=NULL, sess_from=? WHERE id=?").bind(hash, salt, Date.now(), id).run();
    await logAct(env, s, "clave_restablecida", quien);
  }
  if (b.reinvitar) {
    await env.DB.prepare("UPDATE users SET invite_token=?1, invite_exp=?2, pass_hash=?3, pass_salt=?4, must_change=0, sess_from=?6 WHERE id=?5").bind(randomHex(16), Date.now() + INVITE_DIAS * 864e5, randomHex(32), randomHex(16), id, Date.now()).run();
    await logAct(env, s, "usuario_invitado", quien + " (invitación nueva)");
  }
  const fresh = await env.DB.prepare("SELECT " + COLS_USER + " FROM users WHERE id=?1").bind(id).first();
  return json({ ok: true, user: fichaUsuario(fresh, Date.now()) });
}

async function usersDelete(request, env, url) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "invalid" }, 400);
  if (id === a.s.uid) return json({ error: "self", message: "No puedes eliminar tu propia cuenta." }, 400);
  const row = await env.DB.prepare("SELECT name, email, role FROM users WHERE id=?").bind(id).first();
  if (row && row.role === "admin" && !(await otrosAdmins(env, id))) return json({ error: "last-admin", message: "Tiene que quedar al menos un administrador." }, 400);
  await env.DB.prepare("DELETE FROM users WHERE id=?").bind(id).run();
  if (row) await logAct(env, a.s, "usuario_eliminado", (row.name || row.email) + " (" + row.email + ")");
  return json({ ok: true });
}

/* ── invitaciones: la persona crea su propia contraseña con un enlace de un solo uso ── */
const INVITE_DIAS = 7;
async function invGet(request, env, url) {
  await ensureUsers(env);
  const t = String(url.searchParams.get("t") || "");
  const mal = json({ error: "invalid", message: "Esta invitación ha caducado o ya se usó. Pide una nueva a un administrador." }, 404);
  if (!/^[a-f0-9]{32}$/.test(t)) return mal;
  const u = await env.DB.prepare("SELECT name, email, role, invite_exp FROM users WHERE invite_token=?1").bind(t).first();
  if (!u || (u.invite_exp || 0) < Date.now()) return mal;
  return json({ ok: true, name: u.name, email: u.email, role: u.role });
}
async function invPost(request, env) {
  await ensureUsers(env);
  const b = await body(request), t = String(b.t || ""), pass = String(b.password || "");
  if (!/^[a-f0-9]{32}$/.test(t)) return json({ error: "invalid", message: "Esta invitación no es válida." }, 400);
  if (pass.length < 8) return json({ error: "invalid", message: "La contraseña debe tener 8 caracteres o más." }, 400);
  const u = await env.DB.prepare("SELECT * FROM users WHERE invite_token=?1").bind(t).first();
  if (!u || (u.invite_exp || 0) < Date.now()) return json({ error: "invalid", message: "Esta invitación ha caducado o ya se usó. Pide una nueva a un administrador." }, 404);
  const salt = randomHex(16), hash = await pbkdf2(pass, salt), ahora = Date.now();
  await env.DB.prepare("UPDATE users SET pass_hash=?1, pass_salt=?2, invite_token=NULL, invite_exp=NULL, must_change=0, last_login=?3, last_seen=?3, login_count=COALESCE(login_count,0)+1 WHERE id=?4").bind(hash, salt, ahora, u.id).run();
  await logAct(env, { uid: u.id, name: u.name }, "invitacion_aceptada", u.name + " (" + u.email + ")");
  return withSession(json({ ok: true, user: pubUser(u) }), env, u);
}
/* cambiar la contraseña propia */
async function mePassword(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  const b = await body(request), actual = String(b.actual || ""), nueva = String(b.nueva || "");
  if (nueva.length < 8) return json({ error: "invalid", message: "La contraseña nueva debe tener 8 caracteres o más." }, 400);
  if (nueva === actual) return json({ error: "invalid", message: "La contraseña nueva tiene que ser distinta de la actual." }, 400);
  const row = await env.DB.prepare("SELECT pass_hash, pass_salt FROM users WHERE id=?1").bind(s.uid).first();
  if (!row || !timingSafeEqual(await pbkdf2(actual, row.pass_salt), row.pass_hash)) return json({ error: "credentials", message: "La contraseña actual no es correcta." }, 400);
  const salt = randomHex(16), hash = await pbkdf2(nueva, salt), t = Date.now();
  /* cambiar la contraseña cierra las sesiones abiertas en otros sitios (por si alguien la tenía); esta sigue con una cookie nueva */
  await env.DB.prepare("UPDATE users SET pass_hash=?1, pass_salt=?2, must_change=0, sess_from=?4 WHERE id=?3").bind(hash, salt, s.uid, t).run();
  await logAct(env, s, "clave_cambiada", "");
  return withSession(json({ ok: true }), env, { id: s.uid, email: s.email, name: s.name, role: s.role }, t);
}

/* ── registro de actividad (solo admin) ── */
async function actList(request, env, url) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  await ensureUsers(env);
  const uid = String(url.searchParams.get("uid") || ""), lim = Math.max(1, Math.min(300, +url.searchParams.get("limit") || 100)), antes = +url.searchParams.get("antes") || 0;
  const { results } = await env.DB.prepare("SELECT id, ts, uid, name, tipo, detalle FROM actividad WHERE (?1='' OR uid=?1) AND (?2=0 OR id<?2) ORDER BY id DESC LIMIT " + lim).bind(uid, antes).all();
  return json({ ahora: Date.now(), registros: results || [] });
}

/* ── qué ve cada rol y cierre por inactividad: ajustes del admin, para todo el equipo ── */
const IDLE_VALS = [0, 15, 30, 60, 120, 240, 480, 720];
async function ajustes(env) {
  let roles = null, idleMin = 480;
  try {
    await ensureUsers(env);
    const { results } = await env.DB.prepare("SELECT k, v FROM meta WHERE k IN ('roles','idle_min')").all();
    (results || []).forEach((r) => { try { if (r.k === "roles") roles = JSON.parse(r.v); if (r.k === "idle_min") idleMin = +JSON.parse(r.v); } catch (_) {} });
  } catch (_) {}
  return { roles, idleMin };
}
async function rolesPut(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  await ensureUsers(env);
  const b = await body(request);
  if (b.roles == null) { await env.DB.prepare("DELETE FROM meta WHERE k='roles'").run(); await logAct(env, a.s, "roles_cambiados", "Vuelven los permisos de fábrica"); return json({ ok: true }); }
  const out = {};
  Object.keys(b.roles || {}).forEach((r) => {
    if (r === "admin" || ROLES.indexOf(r) < 0 || !Array.isArray(b.roles[r])) return;
    /* lo del administrador (parámetros, rentabilidad, copias, usuarios) no se puede dar a otros roles */
    out[r] = b.roles[r].map(String).filter((k) => /^[a-z0-9-]{1,30}$/.test(k) && !/^(p-|r-)/.test(k) && k !== "users" && k !== "copias").slice(0, 80);
  });
  /* las secciones que existían cuando se guardaron los permisos: las que se añadan después llegan solas a quien las tiene de fábrica */
  if (Array.isArray(b.known)) out._known = b.known.map(String).filter((k) => /^[a-z0-9-]{1,30}$/.test(k)).slice(0, 200);
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('roles', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(out)).run();
  await logAct(env, a.s, "roles_cambiados", Object.keys(out).filter((r) => r !== "_known").map((r) => rolTxt(r) + ": " + out[r].length + " secciones").join(" · "));
  return json({ ok: true, roles: out });
}
async function seguridadPut(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  await ensureUsers(env);
  const b = await body(request), v = +b.idleMin;
  if (IDLE_VALS.indexOf(v) < 0) return json({ error: "invalid", message: "Valor no válido." }, 400);
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('idle_min', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(v)).run();
  IDLE_CACHE = { v, t: Date.now() };
  await logAct(env, a.s, "seguridad", v ? "Cierre de sesión tras " + v + " min sin usar la app" : "Sin cierre de sesión por inactividad");
  return json({ ok: true, idleMin: v });
}

/* ── helpers de usuario ─────────────────────────────────────────────── */
async function countUsers(env) {
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").first();
  return (r && r.n) || 0;
}
async function createUser(env, { email, name, role, password, phone, puesto, mustChange, invite }) {
  await ensureUsers(env);
  const id = "u" + randomHex(8);
  const salt = randomHex(16);
  const hash = await pbkdf2(password, salt);
  const now = Date.now();
  await env.DB.prepare("INSERT INTO users (id, email, name, role, pass_hash, pass_salt, created_at, phone, puesto, active, must_change, invite_token, invite_exp) VALUES (?,?,?,?,?,?,?,?,?,1,?,?,?)")
    .bind(id, email, name, role, hash, salt, now, phone || "", puesto || "", mustChange ? 1 : 0, invite ? randomHex(16) : null, invite ? now + INVITE_DIAS * 864e5 : null).run();
  return { id, email, name, role };
}
function pubUser(u) { return { id: u.uid || u.id, email: u.email, name: u.name, role: u.role }; }

/* ── sesión firmada (HMAC) ──────────────────────────────────────────── */
async function withSession(resp, env, user, iat0) {
  const iat = iat0 || Date.now(), exp = iat + SESSION_DAYS * 864e5;
  const token = await makeToken(await secret(env), { uid: user.id, email: user.email, name: user.name, role: user.role, iat, exp, sid: randomHex(6) });
  resp.headers.append("Set-Cookie", `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}`);
  return resp;
}
/* v02.00 · una cookie vale mientras: tenga firma buena y no haya caducado (14 días), el usuario exista y esté activo, no se haya cerrado esa sesión
   (cerrar sesión), no sea anterior al último cambio de contraseña / desactivación de ese usuario («sess_from») y no lleve más del tiempo de
   inactividad elegido por el administrador sin que la persona haga nada (las consultas automáticas de la app no cuentan: solo lo que escribe o toca). */
const SES_MEMO = new WeakMap();
function session(request, env) {
  let p = SES_MEMO.get(request);
  if (!p) { p = sesionLee(request, env); SES_MEMO.set(request, p); }
  return p;
}
let IDLE_CACHE = { v: 480, t: 0 };
async function idleActual(env) {
  const ahora = Date.now();
  if (ahora - IDLE_CACHE.t < 30e3) return IDLE_CACHE.v;
  let v = 480;
  try { const r = await env.DB.prepare("SELECT v FROM meta WHERE k='idle_min'").first(); if (r) { const n = +JSON.parse(r.v); if (isFinite(n) && n >= 0) v = n; } } catch (_) {}
  IDLE_CACHE = { v, t: ahora };
  return v;
}
function peticionActiva(request) {
  const u = new URL(request.url), m = request.method.toUpperCase();
  if (u.pathname === "/api/sync") return u.searchParams.get("act") === "1";
  return m !== "GET" && m !== "HEAD";
}
async function sesionLee(request, env) {
  const token = cookie(request, COOKIE);
  if (!token) return null;
  const pl = await readToken(await secret(env), token);
  if (!pl) return null;
  /* el usuario tiene que seguir existiendo, y manda su rol ACTUAL: si el admin
     lo borra o le cambia el rol, surte efecto ya, no cuando caduque la cookie */
  await ensureUsers(env);
  const sig = token.slice(token.lastIndexOf(".") + 1);
  const u = await env.DB.prepare("SELECT id, email, name, role, active, last_seen, last_act, sess_from, must_change, (SELECT 1 FROM sesiones_cerradas WHERE k=?2) AS cerrada FROM users WHERE id=?1").bind(pl.uid, sig).first();
  if (!u || u.active === 0) return null;     /* borrado o desactivado: surte efecto ya */
  if (u.cerrada) return null;                /* esa sesión se cerró a mano */
  const iat = +pl.iat || ((+pl.exp || 0) - SESSION_DAYS * 864e5);
  if (iat < (+u.sess_from || 0)) return null;   /* anterior al último cambio de contraseña / desactivación */
  const ahora = Date.now(), activa = peticionActiva(request);
  const idle = await idleActual(env);
  if (idle > 0 && +u.last_act > 0 && ahora - (+u.last_act) > idle * 60e3 + 120e3) return null;   /* demasiado rato sin hacer nada */
  if (activa && (!u.last_act || ahora - (+u.last_act) > 30e3)) { try { await env.DB.prepare("UPDATE users SET last_act=?1, last_seen=?1 WHERE id=?2").bind(ahora, u.id).run(); } catch (_) {} }
  else if (!u.last_seen || ahora - (+u.last_seen) > 5 * 60e3) { try { await env.DB.prepare("UPDATE users SET last_seen=?1 WHERE id=?2").bind(ahora, u.id).run(); } catch (_) {} }
  return { uid: u.id, email: u.email, name: u.name, role: u.role, exp: pl.exp, mustChange: !!u.must_change };
}
/* cerrar sesión: la cookie (aunque alguien la hubiera copiado) deja de valer en el servidor */
async function cierraSesion(env, request, s) {
  const token = cookie(request, COOKIE); if (!token) return;
  const sig = token.slice(token.lastIndexOf(".") + 1), ahora = Date.now();
  await env.DB.prepare("INSERT OR IGNORE INTO sesiones_cerradas (k, exp) VALUES (?1, ?2)").bind(sig, +(s && s.exp) || ahora + SESSION_DAYS * 864e5).run();
  if (Math.random() < 0.05) await env.DB.prepare("DELETE FROM sesiones_cerradas WHERE exp<?1").bind(ahora).run();
}
function cookie(request, name) {
  const c = request.headers.get("Cookie") || "";
  const m = c.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? m[1] : null;
}

/* ── utilidades ─────────────────────────────────────────────────────── */
function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });
}
async function body(request) { try { const j = await request.json(); return j && typeof j === "object" && !Array.isArray(j) ? j : {}; } catch (_) { return {}; } }
function norm(s) { return String(s == null ? "" : s).trim().toLowerCase(); }
function validEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); }
function timingSafeEqual(a, b) { if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
function randomHex(bytes) { const u = new Uint8Array(bytes); crypto.getRandomValues(u); return bufToHex(u.buffer); }
function bufToHex(buf) { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i++) s += u[i].toString(16).padStart(2, "0"); return s; }
function hexToBuf(hex) { const u = new Uint8Array(hex.length / 2); for (let i = 0; i < u.length; i++) u[i] = parseInt(hex.substr(i * 2, 2), 16); return u.buffer; }
function b64u(buf) { let s = ""; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function fromB64u(str) { str = str.replace(/-/g, "+").replace(/_/g, "/"); const bin = atob(str); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
async function pbkdf2(password, saltHex) {
  const km = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: hexToBuf(saltHex), iterations: 100000, hash: "SHA-256" }, km, 256);
  return bufToHex(bits);
}
async function hmac(secretStr, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secretStr), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64u(sig);
}
async function makeToken(secretStr, payload) { const b = b64u(enc.encode(JSON.stringify(payload))); return b + "." + await hmac(secretStr, b); }
async function readToken(secretStr, token) {
  if (!token || token.indexOf(".") < 0) return null;
  const i = token.lastIndexOf(".");
  const b = token.slice(0, i), sig = token.slice(i + 1);
  const expect = await hmac(secretStr, b);
  if (!timingSafeEqual(sig, expect)) return null;
  try { const pl = JSON.parse(dec.decode(fromB64u(b))); if (pl.exp && Date.now() > pl.exp) return null; return pl; } catch (_) { return null; }
}
