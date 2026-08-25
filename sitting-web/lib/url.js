/* Construye URLs absolutas a partir de las cabeceras reales de la petición
   (Host / X-Forwarded-*), en vez de fiarse de request.url o request.nextUrl:
   en algunos despliegues (servidor standalone sin HOSTNAME fijado, detrás
   de un proxy inverso) esos dos pueden traer 0.0.0.0 o el host interno en
   vez del dominio con el que la persona entró, y las redirecciones de
   /api/login y /api/logout acababan yendo a otro origen — sin la cookie
   que se acababa de poner, porque esa cookie es solo de este origen. */
export function absoluteUrl(request, pathname) {
  const h = request.headers;
  const proto = h.get("x-forwarded-proto") || (request.nextUrl && request.nextUrl.protocol.replace(":", "")) || "http";
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost";
  return new URL(pathname, `${proto}://${host}`);
}
