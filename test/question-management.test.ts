import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MathOperation } from "@prisma/client";

import { parseMathQuestionPayload } from "@/lib/question-management";

describe("parseMathQuestionPayload", () => {
  it("keeps decimal answers intact", () => {
    const parsed = parseMathQuestionPayload({
      question: "4.5 + 0.73 = ?",
      answer: 5.23,
      operation: MathOperation.ADDITION,
      difficulty: 2,
      topic: "decimal_operations",
      gradeMin: 7,
      gradeMax: 7,
      curriculumCode: "NB Math Grade 7 N2",
      curriculumOutcome: "Decimal operations",
      curriculumSourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade7.pdf",
    });

    assert.equal(parsed.answer, 5.23);
    assert.equal(parsed.remainder, null);
  });

  it("rejects decimal answers combined with a remainder", () => {
    assert.throws(
      () =>
        parseMathQuestionPayload({
          question: "7.5 ÷ 2 = ?",
          answer: 3.75,
          remainder: 1,
          operation: MathOperation.DIVISION,
          difficulty: 2,
          topic: "decimal_operations",
          gradeMin: 7,
          gradeMax: 7,
          curriculumCode: "NB Math Grade 7 N2",
          curriculumOutcome: "Decimal operations",
          curriculumSourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade7.pdf",
        }),
      /whole-number quotient/i,
    );
  });
});
