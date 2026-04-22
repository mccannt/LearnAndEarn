import { NextRequest, NextResponse } from "next/server";

import { isParentAuthed, unauthorizedResponse } from "@/lib/auth";
import { parseAvatarCatalogUpdate } from "@/lib/catalog-management";
import { toAvatarCatalogItemDto } from "@/lib/catalog";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!isParentAuthed(req)) {
    return unauthorizedResponse();
  }

  const items = await db.avatarItemCatalog.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    ok: true,
    items: items.map(toAvatarCatalogItemDto),
  });
}

export async function PUT(req: NextRequest) {
  try {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const data = parseAvatarCatalogUpdate(body);

    const item = await db.avatarItemCatalog.update({
      where: { id: data.id },
      data: {
        name: data.name,
        type: data.type,
        color: data.color,
        cost: data.cost,
        rarity: data.rarity,
        isDefault: data.isDefault,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({
      ok: true,
      item: toAvatarCatalogItemDto(item),
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update avatar catalog item." }, { status: 500 });
  }
}
