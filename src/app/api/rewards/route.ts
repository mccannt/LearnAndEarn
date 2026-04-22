import { NextRequest, NextResponse } from "next/server";

import { getActiveChildIdFromRequest } from "@/lib/active-child";
import { toRewardCatalogItemDto } from "@/lib/catalog";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const childId = await getActiveChildIdFromRequest(req);
    if (!childId) {
      return NextResponse.json({ error: "No active child found" }, { status: 400 });
    }

    const [child, catalog] = await Promise.all([
      db.child.findUnique({
        where: { id: childId },
        select: { totalPoints: true },
      }),
      db.rewardCatalog.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { cost: "asc" }, { title: "asc" }],
      }),
    ]);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      childTotalPoints: child.totalPoints,
      catalog: catalog.map(toRewardCatalogItemDto),
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
  }
}
