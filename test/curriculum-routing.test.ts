import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EnglishQuestionType, MathOperation } from "@prisma/client";

import {
  curriculumEnglishQuestions,
  curriculumMathQuestions,
  filterCurriculumEnglishQuestions,
  filterCurriculumMathQuestions,
} from "@/lib/curriculum-question-bank";
import {
  formatGradeLabel,
  getEffectiveGradeLevel,
  inferGradeLevelFromAge,
} from "@/lib/grade-level";

describe("curriculum routing helpers", () => {
  it("infers grade level from age and prefers explicit grade level", () => {
    assert.equal(inferGradeLevelFromAge(9), 4);
    assert.equal(getEffectiveGradeLevel({ age: 9, gradeLevel: 5 }), 5);
    assert.equal(formatGradeLabel(4), "Grade 4");
  });

  it("filters math questions to the learner grade and operation", () => {
    const gradeFourDivision = filterCurriculumMathQuestions({
      gradeLevel: 4,
      difficulty: 5,
      operation: MathOperation.DIVISION,
    });

    assert.ok(gradeFourDivision.length > 0);
    assert.ok(gradeFourDivision.every((question) => question.gradeMin <= 4 && question.gradeMax >= 4));
    assert.ok(gradeFourDivision.every((question) => question.operation === MathOperation.DIVISION));
    assert.ok(gradeFourDivision.some((question) => question.remainder !== null));
  });

  it("includes decimal operations for grade 7", () => {
    const gradeSevenAddition = filterCurriculumMathQuestions({
      gradeLevel: 7,
      difficulty: 5,
      operation: MathOperation.ADDITION,
    });

    assert.ok(gradeSevenAddition.length > 0);
    assert.ok(gradeSevenAddition.every((question) => question.gradeMin <= 7 && question.gradeMax >= 7));
    assert.ok(gradeSevenAddition.every((question) => question.operation === MathOperation.ADDITION));
    assert.ok(gradeSevenAddition.some((question) => !Number.isInteger(question.answer)));
  });

  it("includes grade 6 decimal multiplication and division", () => {
    const gradeSixDivision = filterCurriculumMathQuestions({
      gradeLevel: 6,
      difficulty: 5,
      operation: MathOperation.DIVISION,
    });

    assert.ok(gradeSixDivision.length > 0);
    assert.ok(gradeSixDivision.every((question) => question.gradeMin <= 6 && question.gradeMax >= 6));
    assert.ok(gradeSixDivision.every((question) => question.operation === MathOperation.DIVISION));
    assert.ok(gradeSixDivision.some((question) => !Number.isInteger(question.answer)));
    assert.ok(gradeSixDivision.every((question) => question.remainder == null));
  });

  it("filters english questions to the learner grade band and type", () => {
    const gradeTwoWriting = filterCurriculumEnglishQuestions({
      gradeLevel: 2,
      difficulty: 5,
      questionType: EnglishQuestionType.GRAMMAR,
    });

    assert.ok(gradeTwoWriting.length > 0);
    assert.ok(gradeTwoWriting.every((question) => question.gradeMin <= 2 && question.gradeMax >= 2));
    assert.ok(gradeTwoWriting.every((question) => question.questionType === EnglishQuestionType.GRAMMAR));
  });

  it("keeps seed keys unique across curriculum banks", () => {
    assert.equal(
      new Set(curriculumMathQuestions.map((question) => question.seedKey)).size,
      curriculumMathQuestions.length,
    );
    assert.equal(
      new Set(curriculumEnglishQuestions.map((question) => question.seedKey)).size,
      curriculumEnglishQuestions.length,
    );
  });
});
