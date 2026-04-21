import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { getActiveChildIdFromRequest } from "@/lib/active-child";
import { formatGradeLabel, getEffectiveGradeLevel, normalizeGradeLevel } from "@/lib/grade-level";

export async function getQuestionGradeContext(req: NextRequest, explicitChildId?: string | null) {
  const requestedGrade = normalizeGradeLevel(req.nextUrl.searchParams.get("grade"));
  if (requestedGrade !== null) {
    return {
      gradeLevel: requestedGrade,
      gradeLabel: formatGradeLabel(requestedGrade),
      source: "query" as const,
      childId: null,
    };
  }

  const childId = await getActiveChildIdFromRequest(req, explicitChildId);
  if (!childId) {
    return {
      gradeLevel: null,
      gradeLabel: formatGradeLabel(null),
      source: "none" as const,
      childId: null,
    };
  }

  const child = await db.child.findUnique({
    where: { id: childId },
    select: { id: true, age: true, gradeLevel: true },
  });

  if (!child) {
    return {
      gradeLevel: null,
      gradeLabel: formatGradeLabel(null),
      source: "none" as const,
      childId: null,
    };
  }

  const gradeLevel = getEffectiveGradeLevel(child);

  return {
    gradeLevel,
    gradeLabel: formatGradeLabel(gradeLevel),
    source: child.gradeLevel !== null && typeof child.gradeLevel !== "undefined" ? ("child" as const) : ("age_inferred" as const),
    childId: child.id,
  };
}
