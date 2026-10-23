/* Les Moles Events — service worker (abrir la app al instante y sin conexión)
   · La app es un solo HTML grande. Se abre SIEMPRE al momento con la copia guardada en el dispositivo; por detrás se pregunta al servidor si hay
     una versión nueva (petición condicional: si no ha cambiado, no se descarga nada) y, si la hay, se guarda y se avisa a la app para que cambie
     cuando convenga. Antes se esperaba a la red hasta 6 s con la pantalla en blanco.
   · La primera vez (sin copia) se descarga de la red.
   · Las fotos del salón (/lz/…) y los iconos se guardan la primera vez que se ven.
   · La API (/api/…) NUNCA pasa por aquí: los datos de trabajo ya se guardan primero en el propio
     dispositivo y se suben cuando vuelve la conexión (lo hace la app).
   La versión (V) la pone el despliegue: al cambiar, se guarda la app nueva, se borra la vieja y se avisa a las pestañas abiertas. */
const V = "02.19";
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
    const ts = Date.now();
    const ks = await caches.keys();
    const habiaVieja = ks.some((k) => k.indexOf("lm-app-") === 0 && k !== SHELL);
    await Promise.all(ks.filter((k) => k !== SHELL && k !== EST).map((k) => caches.delete(k)));
    await self.clients.claim();
    if (habiaVieja) await avisar(ts);
  })());
});
/* a todas las pestañas abiertas: hay una versión nueva ya guardada (con la hora, para que una pestaña que se abrió DESPUÉS ya la lleve y no avise) */
async function avisar(ts) {
  const cl = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  cl.forEach((c) => { try { c.postMessage({ t: "nueva", v: V, ts: ts || Date.now() }); } catch (_) {} });
}

const SIN_COPIA = () => new Response("Sin conexión, y la app todavía no se ha guardado en este dispositivo. Ábrela una vez con conexión.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
/* la «huella» de una respuesta: su ETag, o la fecha y el tamaño si no lo trae */
const firma = (r) => (r && r.headers) ? (r.headers.get("etag") || ((r.headers.get("last-modified") || "") + "|" + (r.headers.get("content-length") || ""))) : "";

async function abrirApp(e) {
  const req = e.request, c = await caches.open(SHELL), copia = await c.match("/", { ignoreSearch: true });
  /* por detrás: ¿hay versión nueva? (si no ha cambiado, el servidor contesta «no modificado» y no se baja nada) */
  const revisa = (async () => {
    const res = await fetch(req, { cache: "no-cache" });
    if (res && res.ok && /text\/html/.test(res.headers.get("Content-Type") || "")) {
      const antes = copia ? firma(copia) : "", ahora = firma(res);
      const igual = copia && antes && ahora && antes === ahora;
      if (!igual) await c.put("/", res.clone());          /* sin cambios: no se vuelve a escribir la copia */
      if (copia && antes && ahora && antes !== ahora) await avisar(Date.now());
    }
    return res;
  })();
  if (copia) { e.waitUntil(revisa.catch(() => {})); return copia; }
  try { return await revisa; } catch (_) { return SIN_COPIA(); }
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
  if (r.mode === "navigate") { e.respondWith(abrirApp(e)); return; }
  if (u.pathname.startsWith("/lz/") || u.pathname.startsWith("/icons/") || u.pathname === "/manifest.webmanifest") e.respondWith(guardadoPrimero(r));
});
