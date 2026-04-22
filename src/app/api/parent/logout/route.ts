import { NextResponse } from "next/server";
import { PARENT_AUTH_COOKIE, parentAuthCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PARENT_AUTH_COOKIE, "", {
    ...parentAuthCookieOptions(),
    expires: new Date(0),
  });
  return response;
}
