import { NextRequest, NextResponse } from "next/server";
import { EnglishQuestionType } from "@prisma/client";
import { db } from "@/lib/db";
import { isParentAuthed, unauthorizedResponse } from "@/lib/auth";
import { filterCurriculumEnglishQuestions } from "@/lib/curriculum-question-bank";
import { getQuestionGradeContext } from "@/lib/question-context";
import { formatGradeLabel, normalizeGradeLevel } from "@/lib/grade-level";
import { parseEnglishQuestionPayload, parseListLimit, parseMaxDifficulty } from "@/lib/question-management";

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
    const type = searchParams.get("type") || undefined;
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

    if (type) {
      const normalizedType = type.trim().toUpperCase();
      if (!Object.values(EnglishQuestionType).includes(normalizedType as EnglishQuestionType)) {
        return NextResponse.json({ error: "Invalid question type" }, { status: 400 });
      }
      where.questionType = normalizedType as EnglishQuestionType;
    }

    if (adminView) {
      if (!isParentAuthed(req)) {
        return unauthorizedResponse();
      }

      const topic = searchParams.get("topic");
      if (topic) {
        where.topic = topic;
      }

      const questions = await db.englishQuestion.findMany({
        where: applyGradeFilter(where, gradeContext.gradeLevel),
        orderBy: [
          { gradeMin: "asc" },
          { questionType: "asc" },
          { topic: "asc" },
          { difficulty: "asc" },
          { question: "asc" },
        ],
        take: parseListLimit(searchParams.get("limit"), 200, 500),
      });

      return NextResponse.json({
        questions: questions.map((question) => ({
          ...question,
          options: JSON.parse(question.options),
        })),
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

    const aligned = await db.englishQuestion.findMany({ where: alignedWhere });
    const all = aligned.length > 0
      ? aligned
      : await db.englishQuestion.findMany({ where: applyGradeFilter(where, gradeContext.gradeLevel) });

    const fallbackQuestions = filterCurriculumEnglishQuestions({
      gradeLevel: gradeContext.gradeLevel,
      difficulty,
      topic: searchParams.get("topic"),
      questionType: typeof where.questionType === "string" ? (where.questionType as EnglishQuestionType) : null,
    }).map((question) => ({
      ...question,
      id: question.seedKey,
    }));

    const sourceQuestions = all.length > 0
      ? all.map((question) => ({ ...question, options: JSON.parse(question.options) }))
      : fallbackQuestions;

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

    return NextResponse.json({ error: "Failed to load English questions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const data = parseEnglishQuestionPayload(body);
    const question = await db.englishQuestion.create({
      data: {
        ...data,
        options: JSON.stringify(data.options),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        question: {
          ...question,
          options: data.options,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create English question." }, { status: 500 });
  }
}
