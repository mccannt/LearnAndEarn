import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getActiveChildIdFromRequest } from "@/lib/active-child";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId } = body;
    const childId = await getActiveChildIdFromRequest(req);

    if (!childId) {
      return NextResponse.json({ error: "No active child found" }, { status: 400 });
    }
    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const item = await db.avatarItemCatalog.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Unknown avatar item" }, { status: 400 });
    }
    if (!item.isActive) {
      return NextResponse.json({ error: "Avatar item is not available" }, { status: 400 });
    }

    const child = await db.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    if (child.totalPoints < item.cost) {
      return NextResponse.json({ error: "Not enough points" }, { status: 402 });
    }

    // Check if already unlocked
    const alreadyUnlocked = await db.unlockedItem.findUnique({
      where: {
        childId_itemId: {
          childId,
          itemId,
        },
      },
    });

    if (alreadyUnlocked) {
      return NextResponse.json({ ok: true, message: "Item already unlocked" });
    }

    // Deduct points and unlock item in a transaction
    await db.$transaction([
      db.child.update({
        where: { id: childId },
        data: { totalPoints: { decrement: item.cost } },
      }),
      db.unlockedItem.create({
        data: {
          childId,
          itemId,
        },
      }),
    ]);

    const updatedChild = await db.child.findUnique({ where: { id: childId } });

    return NextResponse.json({ 
      ok: true,
      newTotalPoints: updatedChild?.totalPoints,
      itemId,
      cost: item.cost,
      message: "Item unlocked successfully",
    });
  } catch (error) {
    console.error("Error unlocking avatar item:", error);
    return NextResponse.json({ error: "Failed to unlock item" }, { status: 500 });
  }
} 
