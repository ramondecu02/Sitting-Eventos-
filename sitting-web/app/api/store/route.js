import { NextResponse } from "next/server";
import { getStore, saveStore } from "../../../lib/storage";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB de margen; un evento normal pesa unos pocos KB

export async function GET() {
  try {
    const store = await getStore();
    return NextResponse.json(store || null);
  } catch (err) {
    console.error("GET /api/store", err);
    return NextResponse.json({ error: "no se pudo leer el almacén compartido" }, { status: 500 });
  }
}

export async function PUT(request) {
  const raw = await request.text();
  if (raw.length > MAX_BYTES) {
    return NextResponse.json({ error: "el evento pesa demasiado" }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !Array.isArray(body.events)) {
    return NextResponse.json({ error: "formato inválido" }, { status: 400 });
  }

  try {
    await saveStore(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/store", err);
    return NextResponse.json({ error: "no se pudo guardar en el almacén compartido" }, { status: 500 });
  }
}
