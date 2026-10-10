/* Les Moles Events — service worker (abrir la app sin conexión)
   · La app es un solo HTML: se guarda al instalar y se renueva cada vez que hay red.
     Si la red tarda más de 6 s o no hay, se abre la copia guardada (con la última versión que se vio).
   · Las fotos del salón (/lz/…) y los iconos se guardan la primera vez que se ven.
   · La API (/api/…) NUNCA pasa por aquí: los datos de trabajo ya se guardan primero en el propio
     dispositivo y se suben cuando vuelve la conexión (lo hace la app).
   La versión (V) la pone el despliegue: al cambiar, se guarda la app nueva y se borra la vieja. */
const V = "01.68";
const SHELL = "lm-app-" + V, EST = "lm-estaticos-1";
const PRE = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await c.add(new Request("/", { cache: "reload" }));
    const est = await caches.open(EST);
    await Promise.all(PRE.map((u) => est.add(new Request(u, { cache: "reload" })).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k !== SHELL && k !== EST).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

const SIN_COPIA = () => new Response("Sin conexión, y la app todavía no se ha guardado en este dispositivo. Ábrela una vez con conexión.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });

async function abrirApp(req) {
  const c = await caches.open(SHELL);
  const red = fetch(req, { cache: "no-store" }).then(async (res) => {
    if (res && res.ok && res.headers.get("Content-Type") && /text\/html/.test(res.headers.get("Content-Type"))) await c.put("/", res.clone());
    return res;
  });
  const copia = () => c.match("/", { ignoreSearch: true });
  try {
    /* red primero; si tarda demasiado, la copia guardada (la red sigue y renueva la copia para la próxima) */
    const lenta = new Promise((ok) => setTimeout(async () => ok(await copia() || null), 6000));
    const r = await Promise.race([red.catch(() => null), lenta]);
    if (r) return r;
    return (await red.catch(() => null)) || (await copia()) || SIN_COPIA();
  } catch (_) { return (await copia()) || SIN_COPIA(); }
}
async function guardadoPrimero(req) {
  const c = await caches.open(EST), hit = await c.match(req);
  if (hit) return hit;
  try { const res = await fetch(req); if (res && res.ok) c.put(req, res.clone()); return res; } catch (_) { return new Response("", { status: 504 }); }
}
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin || u.pathname.startsWith("/api/")) return;
  if (r.mode === "navigate") { e.respondWith(abrirApp(r)); return; }
  if (u.pathname.startsWith("/lz/") || u.pathname.startsWith("/icons/") || u.pathname === "/manifest.webmanifest") e.respondWith(guardadoPrimero(r));
});
