import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from 'next/headers';

const COOKIE = "active_child_id";

async function getChildIdFromReq(req: NextRequest) {
  let childId = req.nextUrl.searchParams.get('childId');
  if (childId) return childId;
  
  // Try from cookie
  const cookieStore = await cookies();
  childId = cookieStore.get(COOKIE)?.value ?? null;
  if (childId) return childId;

  // Fallback to first child if no cookie
  const defaultChild = await db.child.findFirst({ orderBy: { createdAt: "asc" } });
  if (defaultChild) return defaultChild.id;

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const childId = await getChildIdFromReq(req);
    if (!childId) {
      return NextResponse.json({ error: "No active child found" }, { status: 400 });
    }

    const child = await db.child.findUnique({
      where: { id: childId },
      include: {
        unlockedItems: true,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const equippedAvatar = {
      hairStyle: child.equippedHairStyle,
      shirt: child.equippedShirt,
      pants: child.equippedPants,
      shoes: child.equippedShoes,
      accessory: child.equippedAccessory,
      background: child.equippedBackground,
    };

    const unlockedItemIds = child.unlockedItems.map(item => item.itemId);

    return NextResponse.json({ 
      ok: true, 
      equippedAvatar,
      unlockedItemIds,
      childTotalPoints: child.totalPoints,
    });
  } catch (error) {
    console.error("Error fetching avatar data:", error);
    return NextResponse.json({ error: "Failed to fetch avatar data" }, { status: 500 });
  }
} 
