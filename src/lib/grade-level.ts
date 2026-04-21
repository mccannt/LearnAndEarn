export const KINDERGARTEN_LEVEL = 0;
export const MIN_SUPPORTED_GRADE = 1;
export const MAX_SUPPORTED_GRADE = 7;

export function normalizeGradeLevel(value: unknown) {
  const grade = Number(value);

  if (!Number.isInteger(grade) || grade < KINDERGARTEN_LEVEL || grade > 12) {
    return null;
  }

  return grade;
}

export function inferGradeLevelFromAge(age: number) {
  if (!Number.isFinite(age) || age <= 0) {
    return null;
  }

  // Approximate Anglophone NB progression: age 5 ~ K, 6 ~ Grade 1, etc.
  return Math.max(KINDERGARTEN_LEVEL, Math.min(12, Math.round(age) - 5));
}

export function getEffectiveGradeLevel(input: { age: number; gradeLevel?: number | null }) {
  return normalizeGradeLevel(input.gradeLevel) ?? inferGradeLevelFromAge(input.age);
}

export function formatGradeLabel(gradeLevel: number | null | undefined) {
  if (gradeLevel === null || typeof gradeLevel === "undefined") {
    return "Grade unavailable";
  }

  if (gradeLevel === KINDERGARTEN_LEVEL) {
    return "Kindergarten";
  }

  return `Grade ${gradeLevel}`;
}
