import { NextRequest, NextResponse } from "next/server";
import { unauthorizedResponse, isParentAuthed } from "@/lib/auth";
import { db } from "@/lib/db";

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

    // Validate input
    if (!name || typeof age !== "number") {
      return NextResponse.json(
        { error: "Name and age are required" },
        { status: 400 }
      );
    }

    // Check if child exists
    const existingChild = await db.child.findUnique({
      where: { id: childId }
    });
    
    if (!existingChild) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    // Update child
    const updatedChild = await db.child.update({
      where: { id: childId },
      data: { name, age }
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
    const child = await db.child.findUnique({
      where: { id: childId }
    });
    
    if (!child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    // Delete all related data in a transaction
    await db.$transaction([
      db.learningSession.deleteMany({ where: { childId } }),
      db.progress.deleteMany({ where: { childId } }),
      db.reward.deleteMany({ where: { childId } }),
      db.child.delete({ where: { id: childId } })
    ]);

    return NextResponse.json({ ok: true, message: "Child deleted successfully" });
  } catch (error) {
    console.error("Error deleting child:", error);
    return NextResponse.json(
      { error: "Failed to delete child" },
      { status: 500 }
    );
  }
} 
