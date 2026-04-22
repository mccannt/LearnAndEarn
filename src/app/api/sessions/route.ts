import { NextRequest, NextResponse } from "next/server";
import { Subject } from "@prisma/client";
import { getActiveChildIdFromRequest } from "@/lib/active-child";
import { db } from "@/lib/db";
import { calculateSessionOutcome, normalizeQuestionResults } from "@/lib/scoring";

function parseFormUrlEncoded(bodyText: string): Record<string, any> {
  const params = new URLSearchParams(bodyText);
  const obj: Record<string, any> = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

async function parseBody(req: NextRequest): Promise<any> {
  try {
    return await req.json();
  } catch {
    try {
      const text = await req.text();
      if (!text) return {};
      // Try to parse JSON from text
      try {
        return JSON.parse(text);
      } catch {
        // Fallback to form-url-encoded
        return parseFormUrlEncoded(text);
      }
    } catch {
      return {};
    }
  }
}

export async function GET(req: NextRequest) {
  const childId = await getActiveChildIdFromRequest(req);
  if (!childId) return NextResponse.json({ sessions: [] });

  const sessions = await db.learningSession.findMany({
    where: { childId },
    orderBy: { completedAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    const {
      childId: bodyChildId,
      subject,
      topic,
      duration,
      questionsAsked,
      questionsCorrect,
      pointsEarned,
      completedAt,
      questionResults,
    } = body || {};

    const childId = await getActiveChildIdFromRequest(req, bodyChildId);
    if (!childId) return NextResponse.json({ error: "No child found" }, { status: 400 });

    const validSubject = String(subject).toUpperCase() === "MATH" ? Subject.MATH : Subject.ENGLISH;
    const normalizedQuestionResults = normalizeQuestionResults(questionResults);
    const derivedSessionOutcome =
      normalizedQuestionResults.length > 0
        ? calculateSessionOutcome(validSubject as "MATH" | "ENGLISH", normalizedQuestionResults)
        : null;
    const effectiveQuestionsAsked =
      derivedSessionOutcome?.questionsAsked ?? (Number(questionsAsked) || 0);
    const effectiveQuestionsCorrect =
      derivedSessionOutcome?.questionsCorrect ?? (Number(questionsCorrect) || 0);
    const effectivePointsEarned =
      derivedSessionOutcome?.pointsEarned ?? (Number(pointsEarned) || 0);

    const session = await db.learningSession.create({
      data: {
        childId,
        subject: validSubject,
        topic: topic || (validSubject === Subject.MATH ? "multiplication" : "grammar"),
        duration: Number(duration) || 0,
        questionsAsked: effectiveQuestionsAsked,
        questionsCorrect: effectiveQuestionsCorrect,
        pointsEarned: effectivePointsEarned,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
      },
    });

    if (session.pointsEarned > 0) {
      await db.child.update({
        where: { id: childId },
        data: { totalPoints: { increment: session.pointsEarned } },
      });
    }

    const accuracy = session.questionsAsked > 0 ? session.questionsCorrect / session.questionsAsked : 0;
    await db.progress.upsert({
      where: {
        childId_subject_topic: { childId, subject: session.subject, topic: session.topic },
      },
      update: {
        totalQuestions: { increment: session.questionsAsked },
        correctAnswers: { increment: session.questionsCorrect },
        accuracy,
        lastPracticed: session.completedAt,
      },
      create: {
        childId,
        subject: session.subject,
        topic: session.topic,
        totalQuestions: session.questionsAsked,
        correctAnswers: session.questionsCorrect,
        accuracy,
        level: 1,
      },
    });

    return NextResponse.json({ session });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create session", message: e?.message }, { status: 500 });
  }
} 
