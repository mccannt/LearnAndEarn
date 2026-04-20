import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAvatarItemDefinition } from "@/lib/game-config";
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

export async function POST(req: NextRequest) {
  try {
    const childId = await getChildIdFromReq(req);
    if (!childId) {
      return NextResponse.json({ error: "No active child found" }, { status: 400 });
    }

    const body = await req.json();
    const { itemId } = body;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const item = getAvatarItemDefinition(itemId);
    if (!item) {
      return NextResponse.json({ error: "Unknown avatar item" }, { status: 400 });
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
      case "hair_style": updateData.equippedHairStyle = itemId; break;
      case "shirt": updateData.equippedShirt = itemId; break;
      case "pants": updateData.equippedPants = itemId; break;
      case "shoes": updateData.equippedShoes = itemId; break;
      case "accessory": updateData.equippedAccessory = itemId; break;
      case "background": updateData.equippedBackground = itemId; break;
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
