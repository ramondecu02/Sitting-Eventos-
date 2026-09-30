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
 *   PUT  /api/store             guarda el documento (requiere sesión)
 *   GET  /api/users             lista de usuarios (solo admin)
 *   POST /api/users             crea usuario {email,name,role,password} (solo admin)
 *   PATCH  /api/users           {id, password?, role?, name?} cambia clave/rol (solo admin)
 *   DELETE /api/users?id=..     elimina usuario (solo admin)
 *   GET  /api/share?t=..        portal de los novios: su boda, pagos, presupuesto (lectura) y su lista
 *   POST /api/share?t=..        los novios guardan/envían SOLO sus nombres y su lista de invitados
 *   GET  /api/propuestas        listas enviadas por los novios (equipo con sesión)
 *   PATCH /api/propuestas       {token, estado:"aplicada"|"descartada"} (equipo con sesión)
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
  if (p === "/api/logout" && m === "POST") return logoutRoute();
  if (p === "/api/share" && m === "GET") return shareRoute(request, env, url);
  if (p === "/api/share" && m === "POST") return sharePost(request, env, url);
  if (p === "/api/propuestas" && m === "GET") return propuestasList(request, env);
  if (p === "/api/propuestas" && m === "PATCH") return propuestasPatch(request, env);
  if (p === "/api/store" && m === "GET") return storeGet(request, env);
  if (p === "/api/store" && m === "PUT") return storePut(request, env);
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
  if (s) return json({ authed: true, user: pubUser(s) });
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
  return withSession(json({ ok: true, user: pubUser(user) }), env, user);
}

async function loginRoute(request, env) {
  const b = await body(request);
  const email = norm(b.email), pass = b.password || "";
  if (!email || !pass) return json({ error: "invalid" }, 400);
  const row = await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first();
  if (!row) return json({ error: "credentials" }, 401);
  const hash = await pbkdf2(pass, row.pass_salt);
  if (!timingSafeEqual(hash, row.pass_hash)) return json({ error: "credentials" }, 401);
  return withSession(json({ ok: true, user: pubUser(row) }), env, row);
}

function logoutRoute() {
  const r = json({ ok: true });
  r.headers.append("Set-Cookie", `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
  return r;
}

/* ── PORTAL DE LOS NOVIOS (sin sesión, con el enlace privado de su boda) ──
   LECTURA: lo celebrativo de siempre + la «foto» que la app del equipo deja en
   ev.share.portal (pasos, pagos, presupuesto, horarios, menú y la lista del
   plano). Esa foto la calcula la app con las mismas reglas que usa el equipo.
   ESCRITURA: los novios SOLO pueden guardar sus nombres y su lista de
   invitados, y eso va a una tabla aparte (novios_listas). Este endpoint no
   escribe NUNCA en el documento de la app: el presupuesto, los precios, los
   pagos y el resto del evento no se pueden tocar desde el enlace, ni siquiera
   manipulando la página. Lo que envían lo revisa el equipo y decide si lo
   pasa al plano. */
let NOVIOS_OK = false;
async function ensureNovios(env) {
  if (NOVIOS_OK) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS novios_listas (token TEXT PRIMARY KEY, event_id TEXT NOT NULL, data TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'borrador', enviada INTEGER, updated INTEGER NOT NULL, revisada INTEGER)").run();
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
  /* SOLO se leen estos campos; cualquier otro (presupuesto, pagos, precios…) se ignora */
  const mesasIn = Array.isArray(b && b.mesas) ? b.mesas.slice(0, 80) : [];
  let total = 0;
  const mesas = mesasIn.map((m) => {
    const g = (Array.isArray(m && m.g) ? m.g : []).slice(0, 40).map((x) => ({
      n: limpio(x && x.n, 70),
      t: TIPOS_G.indexOf(x && x.t) > -1 ? x.t : "adulto",
      a: limpio(x && x.a, 90)
    })).filter((x) => x.n || x.a);
    total += g.length;
    return { k: Number.isFinite(+m.k) && +m.k > 0 ? Math.floor(+m.k) : null, nombre: limpio(m && m.nombre, 50), staff: !!(m && m.staff), g };
  });
  if (total > 1200) return json({ error: "too-big", message: "Demasiadas personas en la lista." }, 413);
  const data = { parejaA: limpio(b && b.parejaA, 60), parejaB: limpio(b && b.parejaB, 60), mesas };
  const enviar = !!(b && b.enviar), now = Date.now();
  await ensureNovios(env);
  const prev = await env.DB.prepare("SELECT estado, enviada FROM novios_listas WHERE token=?").bind(token).first();
  const estado = enviar ? "enviada" : (prev && prev.estado === "enviada" ? "enviada" : "borrador");
  const enviada = enviar ? now : (prev ? prev.enviada : null);
  await env.DB.prepare("INSERT INTO novios_listas (token, event_id, data, estado, enviada, updated, revisada) VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL) ON CONFLICT(token) DO UPDATE SET event_id=?2, data=?3, estado=?4, enviada=?5, updated=?6")
    .bind(token, String(ev.id), JSON.stringify(data), estado, enviada, now).run();
  return json({ ok: true, estado, enviada, updated: now });
}

/* ── lo que ve el equipo: listas de los novios pendientes de revisar ── */
async function propuestasList(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  await ensureNovios(env);
  const { results } = await env.DB.prepare("SELECT token, event_id, data, estado, enviada, updated, revisada FROM novios_listas ORDER BY updated DESC LIMIT 300").all();
  return json({ listas: (results || []).map((r) => { let d = null; try { d = JSON.parse(r.data); } catch (_) {} return { token: r.token, event_id: r.event_id, data: d, estado: r.estado, enviada: r.enviada, updated: r.updated, revisada: r.revisada }; }) });
}
async function propuestasPatch(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (s.role !== "admin" && s.role !== "eventos") return json({ error: "forbidden" }, 403);
  const b = await body(request);
  const token = String(b.token || ""), estado = String(b.estado || "");
  if (!token || ["aplicada", "descartada"].indexOf(estado) < 0) return json({ error: "invalid" }, 400);
  await ensureNovios(env);
  await env.DB.prepare("UPDATE novios_listas SET estado=?, revisada=? WHERE token=?").bind(estado, Date.now(), token).run();
  return json({ ok: true });
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

/* ── almacén compartido ─────────────────────────────────────────────── */
async function storeGet(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  const data = row && row.data ? row.data : JSON.stringify({ events: [], active: null, prefs: {} });
  return new Response(data, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

async function storePut(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  let txt = await request.text();
  if (!txt) return json({ error: "empty" }, 400);
  let incoming;
  try { incoming = JSON.parse(txt); } catch (_) { return json({ error: "bad-json" }, 400); }
  /* Parámetros del negocio (platos, escandallo, bebidas, camareros…): solo los
     cambia un administrador. Se combinan sección a sección y gana la más
     reciente, así un compañero con una copia vieja no deshace un cambio. */
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  let prev = {}; try { prev = JSON.parse((row && row.data) || "{}") || {}; } catch (_) { prev = {}; }
  if (incoming && typeof incoming === "object") {
    incoming.params = mergeParams(prev.params, incoming.params, s.role === "admin");
    txt = JSON.stringify(incoming);
  }
  await env.DB.prepare("INSERT INTO store (id, data, updated) VALUES (1, ?1, ?2) ON CONFLICT(id) DO UPDATE SET data=?1, updated=?2")
    .bind(txt, Date.now()).run();
  return json({ ok: true });
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
async function usersList(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (s.role !== "admin") return json({ error: "forbidden" }, 403);
  const { results } = await env.DB.prepare("SELECT id, email, name, role, created_at FROM users ORDER BY created_at").all();
  return json({ users: results || [] });
}

async function usersCreate(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (s.role !== "admin") return json({ error: "forbidden" }, 403);
  const b = await body(request);
  const email = norm(b.email), name = (b.name || "").trim(), pass = b.password || "";
  let role = (b.role || "eventos").trim();
  if (ROLES.indexOf(role) < 0) role = "eventos";
  if (!validEmail(email) || !name || pass.length < 6) return json({ error: "invalid", message: "Email válido, nombre y contraseña de 6+ caracteres." }, 400);
  const exists = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
  if (exists) return json({ error: "exists", message: "Ya existe un usuario con ese email." }, 409);
  const user = await createUser(env, { email, name, role, password: pass });
  return json({ ok: true, user: pubUser(user) });
}

async function usersPatch(request, env) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (s.role !== "admin") return json({ error: "forbidden" }, 403);
  const b = await body(request);
  const id = (b.id || "").trim();
  if (!id) return json({ error: "invalid" }, 400);
  const row = await env.DB.prepare("SELECT id FROM users WHERE id=?").bind(id).first();
  if (!row) return json({ error: "not-found", message: "Ese usuario ya no existe." }, 404);
  if (b.role != null) {
    const role = String(b.role).trim();
    if (ROLES.indexOf(role) < 0) return json({ error: "invalid", message: "Rol no válido." }, 400);
    if (id === s.uid && role !== "admin") return json({ error: "self", message: "No puedes quitarte el rol de administrador a ti mismo." }, 400);
    await env.DB.prepare("UPDATE users SET role=? WHERE id=?").bind(role, id).run();
  }
  if (b.name != null) {
    const name = String(b.name).trim();
    if (!name) return json({ error: "invalid", message: "El nombre no puede quedar vacío." }, 400);
    await env.DB.prepare("UPDATE users SET name=? WHERE id=?").bind(name, id).run();
  }
  if (b.password != null) {
    const pass = String(b.password);
    if (pass.length < 6) return json({ error: "invalid", message: "La contraseña debe tener 6 caracteres o más." }, 400);
    const salt = randomHex(16);
    const hash = await pbkdf2(pass, salt);
    await env.DB.prepare("UPDATE users SET pass_hash=?, pass_salt=? WHERE id=?").bind(hash, salt, id).run();
  }
  return json({ ok: true });
}

async function usersDelete(request, env, url) {
  const s = await session(request, env);
  if (!s) return json({ error: "unauth" }, 401);
  if (s.role !== "admin") return json({ error: "forbidden" }, 403);
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "invalid" }, 400);
  if (id === s.uid) return json({ error: "self", message: "No puedes eliminar tu propia cuenta." }, 400);
  await env.DB.prepare("DELETE FROM users WHERE id=?").bind(id).run();
  return json({ ok: true });
}

/* ── helpers de usuario ─────────────────────────────────────────────── */
async function countUsers(env) {
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").first();
  return (r && r.n) || 0;
}
async function createUser(env, { email, name, role, password }) {
  const id = "u" + randomHex(8);
  const salt = randomHex(16);
  const hash = await pbkdf2(password, salt);
  const now = Date.now();
  await env.DB.prepare("INSERT INTO users (id, email, name, role, pass_hash, pass_salt, created_at) VALUES (?,?,?,?,?,?,?)")
    .bind(id, email, name, role, hash, salt, now).run();
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
  const u = await env.DB.prepare("SELECT id, email, name, role FROM users WHERE id=?").bind(pl.uid).first();
  if (!u) return null;
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
