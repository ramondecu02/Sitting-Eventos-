/* ══ puerta de acceso ══════════════════════════════════════════════════
   Antes de servir la herramienta ("/") o la API del store compartido
   ("/api/store"), comprueba que hay una sesión válida (cookie firmada,
   creada en /api/login tras acertar la contraseña de equipo). Si no,
   a la página de la herramienta se le redirige a /login, y a la API se
   le responde 401 en vez de redirigir (no tiene dónde "ir"). */

import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "./lib/auth";
import { absoluteUrl } from "./lib/url";

export async function proxy(request) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const ok = await verifySessionCookieValue(cookie);
  if (ok) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  return NextResponse.redirect(absoluteUrl(request, "/login"));
}

export const config = {
  matcher: ["/", "/api/store/:path*"],
};
