import { NextRequest, NextResponse } from "next/server";
import { MathOperation } from "@prisma/client";
import { db } from "@/lib/db";
import { isParentAuthed, unauthorizedResponse } from "@/lib/auth";
import { filterCurriculumMathQuestions } from "@/lib/curriculum-question-bank";
import { getQuestionGradeContext } from "@/lib/question-context";
import { formatGradeLabel, normalizeGradeLevel } from "@/lib/grade-level";
import { parseListLimit, parseMathQuestionPayload, parseMaxDifficulty } from "@/lib/question-management";

function applyGradeFilter(where: Record<string, unknown>, gradeLevel: number | null) {
  if (gradeLevel === null) {
    return where;
  }

  return {
    ...where,
    AND: [
      { OR: [{ gradeMin: null }, { gradeMin: { lte: gradeLevel } }] },
      { OR: [{ gradeMax: null }, { gradeMax: { gte: gradeLevel } }] },
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") || undefined;
    const operation = searchParams.get("operation");
    const adminView = searchParams.get("admin") === "1";
    const difficulty = parseMaxDifficulty(searchParams.get("difficulty"));
    const adminGradeLevel = normalizeGradeLevel(searchParams.get("grade"));
    const gradeContext = adminView
      ? {
          gradeLevel: adminGradeLevel,
          gradeLabel: formatGradeLabel(adminGradeLevel),
          source: adminGradeLevel === null ? ("none" as const) : ("query" as const),
          childId: null,
        }
      : await getQuestionGradeContext(req);
    const where: Record<string, unknown> = { difficulty: { lte: difficulty } };
    if (topic) where.topic = topic;
    if (operation) {
      const normalizedOperation = operation.trim().toUpperCase();
      if (!Object.values(MathOperation).includes(normalizedOperation as MathOperation)) {
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
      }
      where.operation = normalizedOperation as MathOperation;
    }

    if (adminView) {
      if (!isParentAuthed(req)) {
        return unauthorizedResponse();
      }

      const questions = await db.mathQuestion.findMany({
        where: applyGradeFilter(where, gradeContext.gradeLevel),
        orderBy: [
          { gradeMin: "asc" },
          { topic: "asc" },
          { difficulty: "asc" },
          { question: "asc" },
        ],
        take: parseListLimit(searchParams.get("limit"), 200, 500),
      });
      return NextResponse.json({
        questions,
        curriculumContext: {
          gradeLevel: gradeContext.gradeLevel,
          gradeLabel: gradeContext.gradeLabel,
          source: gradeContext.source,
        },
      });
    }

    const alignedWhere = applyGradeFilter(
      {
        ...where,
        curriculumCode: { not: null },
      },
      gradeContext.gradeLevel,
    );

    const aligned = await db.mathQuestion.findMany({ where: alignedWhere });
    const all = aligned.length > 0
      ? aligned
      : await db.mathQuestion.findMany({ where: applyGradeFilter(where, gradeContext.gradeLevel) });

    const fallbackQuestions = filterCurriculumMathQuestions({
      gradeLevel: gradeContext.gradeLevel,
      difficulty,
      topic,
      operation: operation ? (operation.trim().toUpperCase() as MathOperation) : null,
    }).map((question) => ({
      ...question,
      id: question.seedKey,
      remainder: question.remainder ?? null,
    }));

    const sourceQuestions = all.length > 0 ? all : fallbackQuestions;
    if (sourceQuestions.length === 0) {
      return NextResponse.json({
        questions: [],
        curriculumContext: {
          gradeLevel: gradeContext.gradeLevel,
          gradeLabel: gradeContext.gradeLabel,
          source: gradeContext.source,
        },
      });
    }

    const shuffled = [...sourceQuestions].sort(() => Math.random() - 0.5).slice(0, Math.min(20, sourceQuestions.length));
    return NextResponse.json({
      questions: shuffled,
      curriculumContext: {
        gradeLevel: gradeContext.gradeLevel,
        gradeLabel: gradeContext.gradeLabel,
        source: gradeContext.source,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to load math questions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const data = parseMathQuestionPayload(body);
    const question = await db.mathQuestion.create({ data });

    return NextResponse.json({ ok: true, question }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create math question." }, { status: 500 });
  }
}
