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
 *   DELETE /api/users?id=..     elimina usuario (solo admin)
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
    return env.ASSETS.fetch(request);
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
  if (p === "/api/store" && m === "GET") return storeGet(request, env);
  if (p === "/api/store" && m === "PUT") return storePut(request, env);
  if (p === "/api/users" && m === "GET") return usersList(request, env);
  if (p === "/api/users" && m === "POST") return usersCreate(request, env);
  if (p === "/api/users" && m === "DELETE") return usersDelete(request, env, url);
  return json({ error: "not-found" }, 404);
}

/* ── sesión ─────────────────────────────────────────────────────────── */
function secret(env) { return env.SESSION_SECRET || "insecure-dev-secret-change-me"; }

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

/* ── enlace público para los novios (solo lectura, sin sesión) ──────────
   Devuelve únicamente lo celebrativo del evento marcado como compartido:
   nombres, fecha, lugar, ceremonia, nº de invitados/mesas (calculado aquí
   para no exponer la lista de invitados ni sus alergias), platos elegidos y
   fotos. NUNCA presupuesto, proveedores, comunicaciones ni datos de contacto. */
async function shareRoute(request, env, url) {
  const token = (url.searchParams.get("t") || "").trim();
  if (!token) return json({ error: "not-found" }, 404);
  const row = await env.DB.prepare("SELECT data FROM store WHERE id=1").first();
  let doc; try { doc = JSON.parse((row && row.data) || "{}"); } catch (_) { doc = {}; }
  const events = (doc && doc.events) || [];
  const ev = events.find((e) => e && e.share && e.share.on && e.share.id === token);
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
  return json({ event: pub });
}
/* Cuenta invitados y mesas del texto del plano SIN exponer los nombres:
   una mesa por línea «M<n> | …», un invitado por línea que no sea cabecera
   (#/@), cabecera de mesa ni comentario. */
function countPlano(text) {
  let invitados = 0, mesas = 0;
  (text || "").split(/\r?\n/).forEach((ln) => {
    const t = ln.trim();
    if (!t) return;
    if (/^[#@]/.test(t)) return;                 // título / ubicación
    if (/^M\S*\s*\|/i.test(t)) { mesas++; return; } // cabecera de mesa
    if (/^\/\//.test(t)) return;                 // comentario
    invitados++;
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
  try { JSON.parse(txt); } catch (_) { return json({ error: "bad-json" }, 400); }
  await env.DB.prepare("INSERT INTO store (id, data, updated) VALUES (1, ?1, ?2) ON CONFLICT(id) DO UPDATE SET data=?1, updated=?2")
    .bind(txt, Date.now()).run();
  return json({ ok: true });
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
  const token = await makeToken(secret(env), { uid: user.id, email: user.email, name: user.name, role: user.role, exp });
  resp.headers.append("Set-Cookie", `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}`);
  return resp;
}
async function session(request, env) {
  const token = cookie(request, COOKIE);
  if (!token) return null;
  return readToken(secret(env), token);
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
