import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../lib/auth";
import { absoluteUrl } from "../../../lib/url";

export async function POST(request) {
  const res = NextResponse.redirect(absoluteUrl(request, "/login"), 303);
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
