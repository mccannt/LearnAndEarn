import { NextRequest, NextResponse } from "next/server";

import { getActiveChildIdFromRequest } from "@/lib/active-child";

import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const childId = await getActiveChildIdFromRequest(req);
  if (!childId) return NextResponse.json({ ok: true, history: [] });
  const history = await db.reward.findMany({
    where: { childId },
    orderBy: { earnedAt: "desc" },
  });
  return NextResponse.json({ ok: true, history });
}
