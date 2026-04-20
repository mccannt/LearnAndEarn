import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const maxDifficulty = Number(searchParams.get("difficulty") || 5);
  const where: any = { difficulty: { lte: maxDifficulty } };
  if (type) where.questionType = type as any;
  const all = await db.englishQuestion.findMany({ where });
  if (all.length === 0) return NextResponse.json({ questions: [] });
  const shuffled = all.sort(() => Math.random() - 0.5).slice(0, Math.min(20, all.length));
  // Parse options JSON
  const mapped = shuffled.map(q => ({ ...q, options: JSON.parse(q.options) }));
  return NextResponse.json({ questions: mapped });
} 