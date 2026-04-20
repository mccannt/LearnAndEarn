import { NextRequest, NextResponse } from "next/server";
import { unauthorizedResponse, isParentAuthed } from "@/lib/auth";
import { db } from "@/lib/db";

const COOKIE = "active_child_id";

async function getDefaultParentId(): Promise<string | null> {
  const parent = await db.parent.findFirst({ orderBy: { createdAt: "asc" } });
  return parent?.id ?? null;
}

export async function GET() {
  const children = await db.child.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ children });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));

  // Create child when name/age provided
  if (body?.name && typeof body.age !== "undefined") {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const parentId = await getDefaultParentId();
    if (!parentId) return NextResponse.json({ error: "No parent found" }, { status: 400 });
    const child = await db.child.create({
      data: {
        name: String(body.name),
        age: Number(body.age) || 0,
        parentId,
      },
    });
    const res = NextResponse.json({ ok: true, child });
    res.cookies.set(COOKIE, child.id, { path: "/", httpOnly: false });
    return res;
  }

  // Otherwise, set active child by id
  const childId = body?.childId as string | undefined;
  if (!childId) return NextResponse.json({ error: "childId or name/age required" }, { status: 400 });
  const child = await db.child.findUnique({ where: { id: childId } });
  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, childId, { path: "/", httpOnly: false });
  return res;
} 
