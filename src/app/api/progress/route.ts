import { NextRequest, NextResponse } from "next/server";
import { Subject } from "@prisma/client";
import { getActiveChildIdFromRequest } from "@/lib/active-child";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const childId = await getActiveChildIdFromRequest(req);
  if (!childId) return NextResponse.json({ ok: true, data: null });

  const [child, sessions] = await Promise.all([
    db.child.findUnique({ where: { id: childId } }),
    db.learningSession.findMany({ where: { childId }, orderBy: { completedAt: "desc" } }),
  ]);

  const bySubject = (s: Subject) => sessions.filter((x) => x.subject === s);
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const subjects: { subject: string; progress: number; accuracy: number; sessions: number; timeSpent: number; lastSession?: string }[] = [
    Subject.MATH,
    Subject.ENGLISH,
  ].map((s) => {
    const list = bySubject(s);
    const questions = sum(list.map((x) => x.questionsAsked));
    const correct = sum(list.map((x) => x.questionsCorrect));
    const accuracy = questions > 0 ? Math.round((correct / questions) * 100) : 0;
    const timeSpent = sum(list.map((x) => x.duration));
    const lastSession = list[0]?.completedAt?.toISOString();
    // Use accuracy as progress proxy
    const progress = accuracy;
    return { subject: s === Subject.MATH ? "Math" : "English", progress, accuracy, sessions: list.length, timeSpent, lastSession };
  });

  // Weekly activity (last 7 days)
  const now = new Date();
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const days: string[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    return dayKey(d);
  });
  const weekly = days.map((day) => {
    const todaySessions = sessions.filter((s) => dayKey(s.completedAt) === day);
    const math = sum(todaySessions.filter((s) => s.subject === Subject.MATH).map((s) => s.duration));
    const english = sum(todaySessions.filter((s) => s.subject === Subject.ENGLISH).map((s) => s.duration));
    return { day, math, english };
  });

  const totalSessions = sessions.length;
  const totalTime = sum(sessions.map((s) => s.duration));
  const totalQuestions = sum(sessions.map((s) => s.questionsAsked));
  const totalCorrect = sum(sessions.map((s) => s.questionsCorrect));
  const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const recent = sessions.slice(0, 10);

  return NextResponse.json({
    ok: true,
    data: {
      child,
      subjects,
      weekly,
      totals: {
        totalSessions,
        totalTime,
        totalPoints: child?.totalPoints || 0,
        averageAccuracy,
      },
      recent,
    },
  });
} 
