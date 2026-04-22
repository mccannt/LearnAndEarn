import { NextRequest, NextResponse } from "next/server";

import { isParentAuthed, unauthorizedResponse } from "@/lib/auth";
import { parseRewardCatalogUpdate } from "@/lib/catalog-management";
import { toRewardCatalogItemDto } from "@/lib/catalog";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!isParentAuthed(req)) {
    return unauthorizedResponse();
  }

  const items = await db.rewardCatalog.findMany({
    orderBy: [{ sortOrder: "asc" }, { cost: "asc" }, { title: "asc" }],
  });

  return NextResponse.json({
    ok: true,
    items: items.map(toRewardCatalogItemDto),
  });
}

export async function PUT(req: NextRequest) {
  try {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const data = parseRewardCatalogUpdate(body);

    const item = await db.rewardCatalog.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        cost: data.cost,
        rewardValue: data.rewardValue,
        isActive: data.isActive,
        stockTotal: data.stockTotal,
        stockRemaining: data.stockRemaining,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({
      ok: true,
      item: toRewardCatalogItemDto(item),
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update reward catalog item." }, { status: 500 });
  }
}
