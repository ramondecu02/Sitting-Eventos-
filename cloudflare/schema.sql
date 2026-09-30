-- Les Moles Events — esquema D1
-- (ya aplicado a la base de datos 'lesmoles-events'; se conserva para poder
--  recrearla o inicializar un entorno nuevo con:
--    npx wrangler d1 execute lesmoles-events --remote --file=./schema.sql )

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'eventos',   -- admin | eventos | cocina | compras | servicio
  pass_hash  TEXT NOT NULL,                     -- PBKDF2-SHA256 (100k) en hex
  pass_salt  TEXT NOT NULL,                     -- salt en hex
  created_at INTEGER NOT NULL
);

-- Documento compartido del negocio (eventos, inventario, camareros, prefs...).
-- Una sola fila (id = 1); el frontend fusiona por evento al leer.
CREATE TABLE IF NOT EXISTS store (
  id      INTEGER PRIMARY KEY,
  data    TEXT NOT NULL,
  updated INTEGER NOT NULL
);

-- Quién está conectado y en qué evento (la crea sola el Worker si no existe).
CREATE TABLE IF NOT EXISTS presencia (
  tab  TEXT PRIMARY KEY,   -- pestaña del navegador
  uid  TEXT,
  name TEXT,
  ev   TEXT,               -- evento que tiene abierto
  ts   INTEGER NOT NULL
);
