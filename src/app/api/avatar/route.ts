import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getActiveChildIdFromRequest } from "@/lib/active-child";
import { toAvatarCatalogItemDto } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  try {
    const childId = await getActiveChildIdFromRequest(req);
    if (!childId) {
      return NextResponse.json({ error: "No active child found" }, { status: 400 });
    }

    const [child, catalog] = await Promise.all([
      db.child.findUnique({
        where: { id: childId },
        include: {
          unlockedItems: true,
        },
      }),
      db.avatarItemCatalog.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    ]);

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
      catalog: catalog.map(toAvatarCatalogItemDto),
      equippedAvatar,
      unlockedItemIds,
      childTotalPoints: child.totalPoints,
    });
  } catch (error) {
    console.error("Error fetching avatar data:", error);
    return NextResponse.json({ error: "Failed to fetch avatar data" }, { status: 500 });
  }
} 
