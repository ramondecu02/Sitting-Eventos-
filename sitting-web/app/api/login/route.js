import { NextResponse } from "next/server";
import {
  checkTeamPassword,
  makeSessionCookieValue,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "../../../lib/auth";
import { absoluteUrl } from "../../../lib/url";

export async function POST(request) {
  if (!process.env.TEAM_PASSWORD) {
    return NextResponse.json(
      { error: "El servidor no tiene configurada la variable TEAM_PASSWORD" },
      { status: 500 }
    );
  }

  let password = "";
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    password = body.password || "";
  } else {
    const form = await request.formData().catch(() => null);
    password = form ? form.get("password") || "" : "";
  }

  if (!checkTeamPassword(password)) {
    const url = absoluteUrl(request, "/login?error=1");
    return NextResponse.redirect(url, 303);
  }

  const cookieValue = await makeSessionCookieValue();
  const res = NextResponse.redirect(absoluteUrl(request, "/"), 303);
  res.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
