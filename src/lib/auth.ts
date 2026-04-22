import { NextRequest, NextResponse } from "next/server";

export const PARENT_AUTH_COOKIE = "parent_authed";

export function isParentAuthed(req: NextRequest) {
  return req.cookies.get(PARENT_AUTH_COOKIE)?.value === "1";
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function parentAuthCookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
