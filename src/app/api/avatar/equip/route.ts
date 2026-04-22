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

    // Verify if the item is unlocked for this child
    const isUnlocked = await db.unlockedItem.findUnique({
      where: { 
        childId_itemId: { 
          childId, 
          itemId 
        }
      },
    });

    if (!isUnlocked) {
      return NextResponse.json({ error: "Item not unlocked" }, { status: 403 });
    }

    const updateData: { [key: string]: string } = {};
    switch (item.type) {
      case "HAIR_STYLE": updateData.equippedHairStyle = itemId; break;
      case "SHIRT": updateData.equippedShirt = itemId; break;
      case "PANTS": updateData.equippedPants = itemId; break;
      case "SHOES": updateData.equippedShoes = itemId; break;
      case "ACCESSORY": updateData.equippedAccessory = itemId; break;
      case "BACKGROUND": updateData.equippedBackground = itemId; break;
      default: return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    const updatedChild = await db.child.update({
      where: { id: childId },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      equippedAvatar: {
        hairStyle: updatedChild.equippedHairStyle,
        shirt: updatedChild.equippedShirt,
        pants: updatedChild.equippedPants,
        shoes: updatedChild.equippedShoes,
        accessory: updatedChild.equippedAccessory,
        background: updatedChild.equippedBackground,
      },
    });
  } catch (error) {
    console.error("Error equipping avatar item:", error);
    return NextResponse.json({ error: "Failed to equip item" }, { status: 500 });
  }
} 
