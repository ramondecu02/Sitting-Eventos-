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
 *   GET  /api/propuestas        listas enviadas por el cliente (equipo con sesión)
 *   PATCH /api/propuestas       {token, estado:"aplicada"|"descartada"} (equipo con sesión)
 *   GET  /api/backups           copias de seguridad y papelera (solo admin)
 *   POST /api/backups           {nota?} hace una copia ahora (solo admin)
 *   GET  /api/backups/ver?id=   qué eventos cambian si se restaura esa copia (solo admin)
 *   GET  /api/backups/bajar     ?id=.. una copia, o ?actual=1 todo lo de ahora, como archivo .json (solo admin)
 *   POST /api/backups/restaurar {backup,evento} | {backup,todo} | {papelera} | {documento,todo} (solo admin)
 *   GET  /api/historial?ev=..   quién cambió qué y cuándo en un evento (admin y eventos)
 *   GET  /api/historial/ver?id= qué secciones cambiarían si se vuelve a esa versión (admin y eventos)
 *   POST /api/historial/restaurar {id}  vuelve el evento a como estaba antes de ese cambio (admin y eventos)
 *
 * Todo lo demás se sirve como asset estático (la app).
 */

const ROLES = ["admin", "eventos", "cocina", "compras", "servicio"];
const COOKIE = "lm_sess";
const SESSION_DAYS = 14;
const enc = new TextEncoder();
const dec = new TextDecoder();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await api(request, env, url);
      } catch (err) {
        return json({ error: "server", detail: String(err && err.message || err) }, 500);
      }
    }
    // Resto: la aplicación (assets estáticos). SPA de un solo HTML.
    // El HTML no se guarda en caché: así ningún navegador (Firefox tiende a
    // quedarse con copias) sigue usando una versión vieja tras publicar.
    const res = await env.ASSETS.fetch(request);
    const ct = res.headers.get("Content-Type") || "";
    if (ct.indexOf("text/html") === -1) return res;
    const out = new Response(res.body, res);
    out.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return out;
  },
};

async function api(request, env, url) {
  const p = url.pathname;
  const m = request.method.toUpperCase();
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
    return json({ authed: true, user: Object.assign(pubUser(s), { phone: (u && u.phone) || "", puesto: (u && u.puesto) || "", mustChange: !!(u && u.must_change) }), roles: aj.roles, idleMin: aj.idleMin });
  }
  const n = await countUsers(env);
  return json({ authed: false, setup: n === 0 });
}

async function setupRoute(request, env) {
  const n = await countUsers(env);
  if (n > 0) return json({ error: "already-setup" }, 403);
  const b = await body(request);
  const email = norm(b.email), name = (b.name || "").trim(), pass = b.password || "";
  if (!validEmail(email) || !name || pass.length < 6) return json({ error: "invalid", message: "Email válido, nombre y contraseña de 6+ caracteres." }, 400);
  const user = await createUser(env, { email, name, role: "admin", password: pass });
  await logAct(env, { uid: user.id, name }, "login", "Primer acceso: se creó la cuenta de administrador");
  return withSession(json({ ok: true, user: pubUser(user) }), env, user);
}

async function loginRoute(request, env) {
  await ensureUsers(env);
  const b = await body(request);
  const email = norm(b.email), pass = b.password || "";
  if (!email || !pass) return json({ error: "invalid" }, 400);
  /* demasiados fallos seguidos con el mismo correo: se espera 10 minutos */
  const f = await env.DB.prepare("SELECT COUNT(*) AS n FROM actividad WHERE tipo='login_fallido' AND detalle=?1 AND ts>?2").bind(email, Date.now() - 10 * 60e3).first();
  if (f && f.n >= 5) return json({ error: "locked", message: "Demasiados intentos fallidos. Espera 10 minutos o pide a un administrador que te ponga una contraseña nueva." }, 429);
  const row = await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first();
  if (!row) { await logAct(env, null, "login_fallido", email); return json({ error: "credentials" }, 401); }
  if (row.invite_token) return json({ error: "pending", message: "Todavía no has creado tu contraseña: usa el enlace de invitación que te enviaron." }, 403);
  const hash = await pbkdf2(pass, row.pass_salt);
  if (!timingSafeEqual(hash, row.pass_hash)) { await logAct(env, { uid: row.id, name: row.name }, "login_fallido", email); return json({ error: "credentials" }, 401); }
  if (row.active === 0) { await logAct(env, { uid: row.id, name: row.name }, "login_fallido", email + " (acceso desactivado)"); return json({ error: "inactive", message: "Tu acceso está desactivado. Habla con un administrador." }, 403); }
  const ahora = Date.now();
  await env.DB.prepare("UPDATE users SET last_login=?1, login_count=COALESCE(login_count,0)+1, last_seen=?1 WHERE id=?2").bind(ahora, row.id).run();
  await logAct(env, { uid: row.id, name: row.name }, "login", "");
  return withSession(json({ ok: true, user: Object.assign(pubUser(row), { mustChange: !!row.must_change }) }), env, row);
}

async function logoutRoute(request, env) {
  try { const s = await session(request, env); if (s) await logAct(env, s, "logout", ""); } catch (_) {}
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
/* los enlaces antiguos (cortos) se pueden ver, pero para editar hace falta uno
   nuevo y largo, imposible de adivinar */
function tokenFuerte(t) { return typeof t === "string" && t.length >= 24; }
function hoyISO() { return new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10); }  /* hora de España (aprox.) */

async function shareRoute(request, env, url) {
  const token = (url.searchParams.get("t") || "").trim();
  if (!token) return json({ error: "not-found" }, 404);
  const ev = await eventoCompartido(env, token);
  if (!ev) return json({ error: "not-found" }, 404);
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
  return json({ event: pub, portal: (ev.share && ev.share.portal) || null, lista, editable: tokenFuerte(token), hoy: hoyISO() });
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
  const ev = await eventoCompartido(env, token);
  if (!ev) return json({ error: "not-found", message: "Este enlace ya no está activo." }, 404);
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
  const prev = await env.DB.prepare("SELECT estado, enviada, base FROM novios_listas WHERE token=?").bind(token).first();
  /* la base es de lo que partieron: mientras editan (borrador/enviada) se
     conserva; si el equipo ya la pasó al plano, es lo aplicado, salvo que
     acaben de abrir el portal (nuevo): entonces es lo que vieron al abrirlo */
  const sigue = prev && prev.base && (prev.estado === "borrador" || prev.estado === "enviada" || (prev.estado === "aplicada" && !(b && b.nuevo)));
  let base = sigue ? prev.base : null;
  if (!base) { const bb = listaLimpia(b && b.base); base = JSON.stringify(bb || data); }
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

async function storePut(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  const txt = await request.text();
  if (!txt) return json({ error: "empty" }, 400);
  let incoming;
  try { incoming = JSON.parse(txt); } catch (_) { return json({ error: "bad-json" }, 400); }
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) return json({ error: "bad-doc" }, 400);
  const base = +(request.headers.get("X-Store-Base") || 0);
  /* borrar eventos: solo administración y eventos (cocina, compras y servicio no pueden borrar nada, ni por error) */
  if (s.role !== "admin" && s.role !== "eventos") incoming.borrados = {};
  /* _tb = el texto del plano que tenía quien envía antes de editarlo (sirve para juntar líneas; no se guarda) y sellos con hora razonable */
  const tbs = {}, ya = Date.now();
  (Array.isArray(incoming.events) ? incoming.events : []).forEach((e) => {
    if (!e || typeof e !== "object") return;
    if (typeof e._tb === "string") tbs[e.id] = e._tb;
    delete e._tb;
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
    let v = Date.now(); if (v <= antes) v = antes + 1;
    let r;
    if (row) r = await env.DB.prepare("UPDATE store SET data=?1, updated=?2 WHERE id=1 AND updated=?3").bind(out, v, antes).run();
    else r = await env.DB.prepare("INSERT OR IGNORE INTO store (id, data, updated) VALUES (1, ?1, ?2)").bind(out, v).run();
    const ch = r && r.meta && r.meta.changes != null ? r.meta.changes : 1;
    /* otros = alguien había guardado algo que este navegador aún no tenía */
    if (ch > 0) {
      try { await hiTrasGuardar(env, s, prev, merged); } catch (_) {}
      try { await bkTrasGuardar(env, s, row, prev, merged); } catch (_) {}
      return json({ ok: true, v, otros: !!(antes && base && antes !== base) || (!base && !!antes) });
    }
  }
  return json({ error: "busy", message: "Muchos guardados a la vez; se reintentará." }, 409);
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
const HI_ORDEN = ["plano", "ficha", "menú", "bebidas", "escaleta", "minuta", "alergias", "camareros", "montaje", "agenda", "tareas", "proveedores", "presupuesto", "comunicación", "documentos", "avisos", "portal del cliente", "otros datos"];
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
  if (/^camareros|^reparto$/.test(k)) return "camareros";
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
async function syncRoute(request, env, url) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  /* ?l=1: latido ligero (cada pocos segundos): solo «hay una lista nueva del cliente»; no apunta presencia */
  if (url.searchParams.get("l") === "1") {
    let l = 0;
    try { await ensureNovios(env); const r = await env.DB.prepare("SELECT MAX(updated) AS m FROM novios_listas WHERE estado IN ('borrador','enviada')").first(); l = (r && +r.m) || 0; } catch (_) {}
    return json({ l });
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
  return json({ v: (row && +row.updated) || 0, l, otros: (results || []).map((r) => ({ tab: r.tab, name: r.name, ev: r.ev, yo: r.uid === s.uid })) });
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
  const cols = [["phone", "TEXT"], ["puesto", "TEXT"], ["active", "INTEGER DEFAULT 1"], ["last_login", "INTEGER"], ["login_count", "INTEGER DEFAULT 0"], ["last_seen", "INTEGER"], ["must_change", "INTEGER DEFAULT 0"], ["invite_token", "TEXT"], ["invite_exp", "INTEGER"]];
  for (const c of cols) if (!tiene[c[0]]) { try { await env.DB.prepare("ALTER TABLE users ADD COLUMN " + c[0] + " " + c[1]).run(); } catch (_) {} }
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS actividad (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, uid TEXT, name TEXT, tipo TEXT NOT NULL, detalle TEXT)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS actividad_ts ON actividad (ts)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)").run();
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
  const email = norm(b.email), name = (b.name || "").trim(), pass = b.password ? String(b.password) : "";
  const phone = String(b.phone || "").trim().slice(0, 40), puesto = String(b.puesto || "").trim().slice(0, 80);
  let role = (b.role || "eventos").trim();
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
function rolTxt(r) { return { admin: "administrador", eventos: "eventos", cocina: "cocina", compras: "compras", servicio: "servicio" }[r] || r; }

async function usersPatch(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  const s = a.s, b = await body(request);
  const id = (b.id || "").trim();
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
    if ((row.active !== 0 ? 1 : 0) !== act) { await env.DB.prepare("UPDATE users SET active=? WHERE id=?").bind(act, id).run(); await logAct(env, s, act ? "usuario_activado" : "usuario_desactivado", quien); }
  }
  if (b.password != null) {
    const pass = String(b.password);
    if (pass.length < 6) return json({ error: "invalid", message: "La contraseña debe tener 6 caracteres o más." }, 400);
    const salt = randomHex(16), hash = await pbkdf2(pass, salt);
    /* contraseña puesta por un administrador: es temporal, la persona elige la suya al entrar */
    await env.DB.prepare("UPDATE users SET pass_hash=?, pass_salt=?, must_change=1, invite_token=NULL, invite_exp=NULL WHERE id=?").bind(hash, salt, id).run();
    await logAct(env, s, "clave_restablecida", quien);
  }
  if (b.reinvitar) {
    await env.DB.prepare("UPDATE users SET invite_token=?1, invite_exp=?2, pass_hash=?3, pass_salt=?4, must_change=0 WHERE id=?5").bind(randomHex(16), Date.now() + INVITE_DIAS * 864e5, randomHex(32), randomHex(16), id).run();
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
  const salt = randomHex(16), hash = await pbkdf2(nueva, salt);
  await env.DB.prepare("UPDATE users SET pass_hash=?1, pass_salt=?2, must_change=0 WHERE id=?3").bind(hash, salt, s.uid).run();
  await logAct(env, s, "clave_cambiada", "");
  return json({ ok: true });
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
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('roles', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(out)).run();
  await logAct(env, a.s, "roles_cambiados", Object.keys(out).map((r) => rolTxt(r) + ": " + out[r].length + " secciones").join(" · "));
  return json({ ok: true, roles: out });
}
async function seguridadPut(request, env) {
  const a = await usersAdmin(request, env); if (a.err) return a.err;
  await ensureUsers(env);
  const b = await body(request), v = +b.idleMin;
  if (IDLE_VALS.indexOf(v) < 0) return json({ error: "invalid", message: "Valor no válido." }, 400);
  await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('idle_min', ?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(v)).run();
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
async function withSession(resp, env, user) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  const token = await makeToken(await secret(env), { uid: user.id, email: user.email, name: user.name, role: user.role, exp });
  resp.headers.append("Set-Cookie", `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}`);
  return resp;
}
async function session(request, env) {
  const token = cookie(request, COOKIE);
  if (!token) return null;
  const pl = await readToken(await secret(env), token);
  if (!pl) return null;
  /* el usuario tiene que seguir existiendo, y manda su rol ACTUAL: si el admin
     lo borra o le cambia el rol, surte efecto ya, no cuando caduque la cookie */
  await ensureUsers(env);
  const u = await env.DB.prepare("SELECT id, email, name, role, active, last_seen FROM users WHERE id=?").bind(pl.uid).first();
  if (!u || u.active === 0) return null;     /* borrado o desactivado: surte efecto ya */
  const ahora = Date.now();
  if (!u.last_seen || ahora - (+u.last_seen) > 5 * 60e3) { try { await env.DB.prepare("UPDATE users SET last_seen=?1 WHERE id=?2").bind(ahora, u.id).run(); } catch (_) {} }
  return { uid: u.id, email: u.email, name: u.name, role: u.role, exp: pl.exp };
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
async function body(request) { try { return await request.json(); } catch (_) { return {}; } }
function norm(s) { return (s || "").trim().toLowerCase(); }
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
