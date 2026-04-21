import { NextRequest, NextResponse } from "next/server";
import { PARENT_AUTH_COOKIE, parentAuthCookieOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentParent } from "@/lib/parent-scope";
import crypto from "crypto";

function sha256Hex(v: string) {
  return crypto.createHash("sha256").update(v).digest("hex");
}

async function getSettings() {
  const parent = await getCurrentParent();
  if (!parent) return null;
  const settings = await db.settings.findFirst({ where: { parentId: parent.id } });
  return settings;
}

export async function GET(req: NextRequest) {
  const authed = req.cookies.get(PARENT_AUTH_COOKIE)?.value === "1";
  return NextResponse.json({ ok: true, authed });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password: string = body?.password || "";
    const settings = await getSettings();
    const stored = settings?.parentPassword || "parent123";

    let valid = false;
    if (stored.startsWith("sha256:")) {
      const hash = stored.slice("sha256:".length);
      valid = sha256Hex(password) === hash;
    } else {
      valid = password === stored;
    }

    if (!valid) return NextResponse.json({ ok: false }, { status: 401 });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(PARENT_AUTH_COOKIE, "1", parentAuthCookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
