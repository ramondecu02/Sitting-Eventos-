/* ══ sesión de equipo (una sola contraseña compartida) ═══════════════════
   No hay usuarios ni base de datos de sesiones: la "sesión" es una cookie
   firmada (HMAC-SHA256) que dice "entré antes de tal fecha de caducidad".
   Usa Web Crypto (crypto.subtle) en vez del módulo "crypto" de Node para
   que funcione igual si algún día esto corre en Edge, no solo en Node. */

const COOKIE_NAME = "sitting_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

function toHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(sig);
}

function timingSafeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("Falta la variable de entorno SESSION_SECRET");
  return s;
}

export async function makeSessionCookieValue() {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `ok.${expires}`;
  const sig = await hmac(secret(), payload);
  return `${payload}.${sig}`;
}

export async function verifySessionCookieValue(value) {
  if (!value || typeof value !== "string") return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [tag, expiresStr, sig] = parts;
  if (tag !== "ok") return false;
  let expected;
  try {
    expected = await hmac(secret(), `${tag}.${expiresStr}`);
  } catch {
    return false;
  }
  if (!timingSafeEqualHex(sig, expected)) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return true;
}

export function checkTeamPassword(candidate) {
  const real = process.env.TEAM_PASSWORD;
  if (!real) return false;
  return typeof candidate === "string" && candidate.length > 0 && candidate === real;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
