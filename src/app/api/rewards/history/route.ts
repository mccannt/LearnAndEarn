import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function getDefaultChildId() {
  const child = await db.child.findFirst({ orderBy: { createdAt: "asc" } });
  return child?.id || null;
}

export async function GET() {
  const childId = await getDefaultChildId();
  if (!childId) return NextResponse.json({ ok: true, history: [] });
  const history = await db.reward.findMany({ where: { childId }, orderBy: { earnedAt: "desc" } });
  return NextResponse.json({ ok: true, history });
} 