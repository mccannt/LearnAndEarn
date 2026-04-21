import { NextRequest, NextResponse } from "next/server";
import { isParentAuthed, unauthorizedResponse } from "@/lib/auth";
import { ACTIVE_CHILD_COOKIE } from "@/lib/active-child";
import { db } from "@/lib/db";
import { normalizeGradeLevel } from "@/lib/grade-level";
import { getChildForCurrentParent, getCurrentParentId } from "@/lib/parent-scope";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const { id: childId } = await params;
    const body = await req.json();
    const { name, age } = body;
    const gradeLevel = body?.gradeLevel === null || typeof body?.gradeLevel === "undefined"
      ? null
      : normalizeGradeLevel(body.gradeLevel);

    // Validate input
    if (!name || typeof age !== "number") {
      return NextResponse.json(
        { error: "Name and age are required" },
        { status: 400 }
      );
    }

    if (typeof body?.gradeLevel !== "undefined" && body?.gradeLevel !== null && gradeLevel === null) {
      return NextResponse.json(
        { error: "Grade level must be between 0 and 12" },
        { status: 400 }
      );
    }

    // Check if child exists
    const existingChild = await getChildForCurrentParent(childId);
    
    if (!existingChild) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    // Update child
    const updatedChild = await db.child.update({
      where: { id: existingChild.id },
      data: { name, age, gradeLevel }
    });

    return NextResponse.json({ ok: true, child: updatedChild });
  } catch (error) {
    console.error("Error updating child:", error);
    return NextResponse.json(
      { error: "Failed to update child" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const { id: childId } = await params;
    
    // Check if child exists
    const child = await getChildForCurrentParent(childId);
    
    if (!child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    const activeChildId = req.cookies.get(ACTIVE_CHILD_COOKIE)?.value ?? null;
    const deletedWasActive = activeChildId === childId;
    const parentId = await getCurrentParentId();
    if (!parentId) {
      return NextResponse.json(
        { error: "No parent found" },
        { status: 400 }
      );
    }

    // Delete all related data in a transaction and determine the next active child if needed.
    const nextActiveChild = await db.$transaction(async (tx) => {
      await tx.learningSession.deleteMany({ where: { childId } });
      await tx.progress.deleteMany({ where: { childId } });
      await tx.reward.deleteMany({ where: { childId } });
      await tx.child.delete({ where: { id: childId } });

      if (!deletedWasActive) {
        return null;
      }

      return tx.child.findFirst({
        where: { parentId },
        orderBy: { createdAt: "asc" }
      });
    });

    const res = NextResponse.json({
      ok: true,
      message: "Child deleted successfully",
      deletedChildId: childId,
      deletedWasActive,
      activeChild: deletedWasActive ? nextActiveChild : null,
    });

    if (deletedWasActive) {
      if (nextActiveChild) {
        res.cookies.set(ACTIVE_CHILD_COOKIE, nextActiveChild.id, { path: "/", httpOnly: false });
      } else {
        res.cookies.set(ACTIVE_CHILD_COOKIE, "", {
          path: "/",
          httpOnly: false,
          expires: new Date(0),
        });
      }
    }

    return res;
  } catch (error) {
    console.error("Error deleting child:", error);
    return NextResponse.json(
      { error: "Failed to delete child" },
      { status: 500 }
    );
  }
} 
