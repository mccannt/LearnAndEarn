import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic") || undefined;
  const maxDifficulty = Number(searchParams.get("difficulty") || 5);
  const where: any = { difficulty: { lte: maxDifficulty } };
  if (topic) where.topic = topic;
  const all = await db.mathQuestion.findMany({ where });
  if (all.length === 0) return NextResponse.json({ questions: [] });
  // Return up to 20 random
  const shuffled = all.sort(() => Math.random() - 0.5).slice(0, Math.min(20, all.length));
  return NextResponse.json({ questions: shuffled });
} 