export type SessionSubject = "MATH" | "ENGLISH";

export interface SessionQuestionResult {
  difficulty: number;
  isCorrect: boolean;
  secondsElapsed: number;
}

function normalizeDifficulty(difficulty: number) {
  return Math.min(5, Math.max(1, Math.floor(difficulty)));
}

function normalizeSeconds(secondsElapsed: number) {
  return Math.max(0, Math.floor(secondsElapsed));
}

export function calculateQuestionPoints(
  subject: SessionSubject,
  result: SessionQuestionResult,
) {
  if (!result.isCorrect) return 0;

  const difficulty = normalizeDifficulty(result.difficulty);
  const secondsElapsed = normalizeSeconds(result.secondsElapsed);

  if (subject === "MATH") {
    return difficulty * 10 + Math.max(0, 30 - Math.min(secondsElapsed, 30));
  }

  return difficulty * 15 + Math.max(0, 45 - Math.min(secondsElapsed, 45));
}

export function calculateSessionOutcome(
  subject: SessionSubject,
  results: SessionQuestionResult[],
) {
  const questionsAsked = results.length;
  const questionsCorrect = results.filter((result) => result.isCorrect).length;
  const pointsEarned = results.reduce(
    (total, result) => total + calculateQuestionPoints(subject, result),
    0,
  );

  return { questionsAsked, questionsCorrect, pointsEarned };
}

export function normalizeQuestionResults(value: unknown): SessionQuestionResult[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    const candidate = entry as Partial<SessionQuestionResult>;

    if (
      typeof entry !== "object" ||
      entry === null ||
      typeof candidate.difficulty !== "number" ||
      typeof candidate.isCorrect !== "boolean" ||
      typeof candidate.secondsElapsed !== "number"
    ) {
      return [];
    }

    return [
      {
        difficulty: normalizeDifficulty(candidate.difficulty),
        isCorrect: candidate.isCorrect,
        secondsElapsed: normalizeSeconds(candidate.secondsElapsed),
      },
    ];
  });
}
