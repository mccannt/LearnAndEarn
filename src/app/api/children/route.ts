import { NextRequest, NextResponse } from "next/server";
import { isParentAuthed, unauthorizedResponse } from "@/lib/auth";
import { ACTIVE_CHILD_COOKIE } from "@/lib/active-child";
import { db } from "@/lib/db";
import { normalizeGradeLevel } from "@/lib/grade-level";
import { getChildForCurrentParent, getCurrentParentId } from "@/lib/parent-scope";

export async function GET() {
  const parentId = await getCurrentParentId();
  if (!parentId) {
    return NextResponse.json({ children: [] });
  }

  const children = await db.child.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ children });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));

  // Create child when name/age provided
  if (body?.name && typeof body.age !== "undefined") {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const parentId = await getCurrentParentId();
    if (!parentId) return NextResponse.json({ error: "No parent found" }, { status: 400 });
    const gradeLevel = body?.gradeLevel === null || typeof body?.gradeLevel === "undefined"
      ? null
      : normalizeGradeLevel(body.gradeLevel);

    if (typeof body?.gradeLevel !== "undefined" && body?.gradeLevel !== null && gradeLevel === null) {
      return NextResponse.json({ error: "Grade level must be between 0 and 12" }, { status: 400 });
    }

    const child = await db.child.create({
      data: {
        name: String(body.name),
        age: Number(body.age) || 0,
        gradeLevel,
        parentId,
      },
    });
    const res = NextResponse.json({ ok: true, child });
    res.cookies.set(ACTIVE_CHILD_COOKIE, child.id, { path: "/", httpOnly: false });
    return res;
  }

  // Otherwise, set active child by id
  const childId = body?.childId as string | undefined;
  if (!childId) return NextResponse.json({ error: "childId or name/age required" }, { status: 400 });
  const child = await getChildForCurrentParent(childId);
  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const res = NextResponse.json({ ok: true, child });
  res.cookies.set(ACTIVE_CHILD_COOKIE, childId, { path: "/", httpOnly: false });
  return res;
} 
