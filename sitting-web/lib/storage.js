/* ══ almacén compartido (el "store" de sitting.html) ══════════════════════
   En producción se guarda un único documento JSON en Postgres (cualquier
   Postgres vale: Supabase, Neon, Render, Railway, Vercel Postgres...).
   Sin DATABASE_URL (por ejemplo en local, para probar) se usa un archivo
   en disco — mismo formato, cero configuración. */

import fs from "fs";
import path from "path";

const STORE_KEY = "sitting";
const DATA_FILE = path.join(process.cwd(), ".data", "store.json");

let poolPromise = null;
async function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!poolPromise) {
    poolPromise = (async () => {
      const { Pool } = await import("pg");
      const needsSSL =
        process.env.PGSSLMODE === "require" ||
        /sslmode=require/.test(process.env.DATABASE_URL) ||
        process.env.DATABASE_SSL === "1";
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
      });
      await pool.query(
        `create table if not exists kv_store (
           key text primary key,
           value jsonb not null,
           updated_at timestamptz not null default now()
         )`
      );
      return pool;
    })();
  }
  return poolPromise;
}

function readFileStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeFileStore(value) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(value));
  fs.renameSync(tmp, DATA_FILE);
}

export async function getStore() {
  const pool = await getPool();
  if (pool) {
    const { rows } = await pool.query("select value from kv_store where key = $1", [STORE_KEY]);
    return rows.length ? rows[0].value : null;
  }
  return readFileStore();
}

export async function saveStore(value) {
  const pool = await getPool();
  if (pool) {
    await pool.query(
      `insert into kv_store (key, value, updated_at) values ($1, $2::jsonb, now())
       on conflict (key) do update set value = $2::jsonb, updated_at = now()`,
      [STORE_KEY, JSON.stringify(value)]
    );
    return;
  }
  writeFileStore(value);
}

export function usingDatabase() {
  return !!process.env.DATABASE_URL;
}
