import { NextRequest, NextResponse } from "next/server";
import { unauthorizedResponse, isParentAuthed } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

function hashPassword(pw: string): string {
  const h = crypto.createHash("sha256").update(pw).digest("hex");
  return `sha256:${h}`;
}

async function getDefaultParentId() {
  const parent = await db.parent.findFirst({ orderBy: { createdAt: "asc" } });
  return parent?.id || null;
}

export async function GET() {
  const parentId = await getDefaultParentId();
  if (!parentId) return NextResponse.json({ ok: true, settings: null });
  const settings = await db.settings.findFirst({ where: { parentId } });
  if (!settings) return NextResponse.json({ ok: true, settings: null });
  const { parentPassword, ...rest } = settings as any;
  return NextResponse.json({ ok: true, settings: rest });
}

export async function PUT(req: NextRequest) {
  try {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const parentId = await getDefaultParentId();
    if (!parentId) return NextResponse.json({ error: "No parent found" }, { status: 400 });
    const data = await req.json();

    const updateData: any = { ...data };
    if (typeof updateData.parentPassword === "string" && updateData.parentPassword.length > 0) {
      updateData.parentPassword = hashPassword(updateData.parentPassword);
    } else if (updateData.parentPassword === "") {
      delete updateData.parentPassword;
    }

    const existingSettings = await db.settings.findFirst({ where: { parentId } });
    const settings = existingSettings
      ? await db.settings.update({
          where: { id: existingSettings.id },
          data: updateData,
        })
      : await db.settings.create({
          data: { parentId, ...updateData },
        });
    const { parentPassword, ...rest } = settings as any;
    return NextResponse.json({ ok: true, settings: rest });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
} 
