import { EnglishQuestionType, MathOperation } from "@prisma/client";
import { normalizeGradeLevel } from "@/lib/grade-level";

const MAX_DIFFICULTY = 5;
const MIN_DIFFICULTY = 1;

function asTrimmedString(value: unknown, field: string) {
  if (typeof value !== "string") {
    throw new Error(`${field} is required.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field} is required.`);
  }

  return trimmed;
}

function asDifficulty(value: unknown) {
  const difficulty = Number(value);

  if (!Number.isInteger(difficulty) || difficulty < MIN_DIFFICULTY || difficulty > MAX_DIFFICULTY) {
    throw new Error(`Difficulty must be an integer between ${MIN_DIFFICULTY} and ${MAX_DIFFICULTY}.`);
  }

  return difficulty;
}

function asOptionalNonNegativeInteger(value: unknown, field: string) {
  if (value === null || typeof value === "undefined" || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${field} must be a whole number.`);
  }

  return parsed;
}

function asGradeBoundary(value: unknown, field: string) {
  const grade = normalizeGradeLevel(value);
  if (grade === null) {
    throw new Error(`${field} must be a whole number between 0 and 12.`);
  }

  return grade;
}

function asMathOperation(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("Operation is required.");
  }

  const normalized = value.trim().toUpperCase();
  if (!Object.values(MathOperation).includes(normalized as MathOperation)) {
    throw new Error("Operation must be one of ADDITION, SUBTRACTION, MULTIPLICATION, or DIVISION.");
  }

  return normalized as MathOperation;
}

function asEnglishQuestionType(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("Question type is required.");
  }

  const normalized = value.trim().toUpperCase();
  if (!Object.values(EnglishQuestionType).includes(normalized as EnglishQuestionType)) {
    throw new Error("Question type is invalid.");
  }

  return normalized as EnglishQuestionType;
}

function asOptions(value: unknown) {
  if (Array.isArray(value)) {
    const options = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

    if (options.length < 2) {
      throw new Error("Provide at least two answer options.");
    }

    return options;
  }

  if (typeof value === "string") {
    const options = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (options.length < 2) {
      throw new Error("Provide at least two answer options.");
    }

    return options;
  }

  throw new Error("Options are required.");
}

export function parseListLimit(value: string | null, defaultValue: number, maxValue: number) {
  if (value === null) return defaultValue;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return Math.min(Math.floor(parsed), maxValue);
}

export function parseMaxDifficulty(value: string | null, defaultValue = MAX_DIFFICULTY) {
  if (value === null) return defaultValue;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < MIN_DIFFICULTY || parsed > MAX_DIFFICULTY) {
    throw new Error(`Difficulty must be between ${MIN_DIFFICULTY} and ${MAX_DIFFICULTY}.`);
  }

  return parsed;
}

export function parseMathQuestionPayload(payload: unknown) {
  const data = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const operation = asMathOperation(data.operation);
  const answer = Number(data.answer);
  const remainder = asOptionalNonNegativeInteger(data.remainder, "Remainder");
  const gradeMin = asGradeBoundary(data.gradeMin, "Minimum grade");
  const gradeMax = asGradeBoundary(data.gradeMax, "Maximum grade");

  if (!Number.isFinite(answer)) {
    throw new Error("Answer must be a valid number.");
  }

  if (remainder !== null && operation !== MathOperation.DIVISION) {
    throw new Error("Remainder can only be used with division questions.");
  }

  if (remainder !== null && !Number.isInteger(answer)) {
    throw new Error("Division questions with a remainder must use a whole-number quotient.");
  }

  if (gradeMin > gradeMax) {
    throw new Error("Minimum grade cannot be greater than maximum grade.");
  }

  return {
    question: asTrimmedString(data.question, "Question"),
    answer,
    remainder,
    operation,
    difficulty: asDifficulty(data.difficulty),
    topic: typeof data.topic === "string" && data.topic.trim()
      ? data.topic.trim()
      : operation.toLowerCase(),
    gradeMin,
    gradeMax,
    curriculumCode: asTrimmedString(data.curriculumCode, "Curriculum code"),
    curriculumOutcome: asTrimmedString(data.curriculumOutcome, "Curriculum outcome"),
    curriculumSourceUrl: asTrimmedString(data.curriculumSourceUrl, "Curriculum source URL"),
  };
}

export function parseEnglishQuestionPayload(payload: unknown) {
  const data = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const options = asOptions(data.options);
  const correctAnswer = asTrimmedString(data.correctAnswer, "Correct answer");
  const gradeMin = asGradeBoundary(data.gradeMin, "Minimum grade");
  const gradeMax = asGradeBoundary(data.gradeMax, "Maximum grade");

  if (!options.includes(correctAnswer)) {
    throw new Error("Correct answer must match one of the provided options.");
  }

  if (gradeMin > gradeMax) {
    throw new Error("Minimum grade cannot be greater than maximum grade.");
  }

  const questionType = asEnglishQuestionType(data.questionType);

  return {
    question: asTrimmedString(data.question, "Question"),
    options,
    correctAnswer,
    questionType,
    difficulty: asDifficulty(data.difficulty),
    topic: typeof data.topic === "string" && data.topic.trim()
      ? data.topic.trim()
      : questionType.toLowerCase(),
    gradeMin,
    gradeMax,
    curriculumCode: asTrimmedString(data.curriculumCode, "Curriculum code"),
    curriculumOutcome: asTrimmedString(data.curriculumOutcome, "Curriculum outcome"),
    curriculumSourceUrl: asTrimmedString(data.curriculumSourceUrl, "Curriculum source URL"),
  };
}
