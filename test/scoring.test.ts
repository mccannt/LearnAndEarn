import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateQuestionPoints,
  calculateSessionOutcome,
  normalizeQuestionResults,
} from "@/lib/scoring";

describe("session scoring", () => {
  it("scores math answers from difficulty and response timing", () => {
    assert.equal(
      calculateQuestionPoints("MATH", {
        difficulty: 3,
        isCorrect: true,
        secondsElapsed: 5,
      }),
      55,
    );

    assert.equal(
      calculateQuestionPoints("MATH", {
        difficulty: 5,
        isCorrect: false,
        secondsElapsed: 1,
      }),
      0,
    );
  });

  it("scores english answers with the higher english baseline", () => {
    assert.equal(
      calculateQuestionPoints("ENGLISH", {
        difficulty: 2,
        isCorrect: true,
        secondsElapsed: 10,
      }),
      65,
    );
  });

  it("aggregates a full session from question results", () => {
    const outcome = calculateSessionOutcome("MATH", [
      { difficulty: 1, isCorrect: true, secondsElapsed: 2 },
      { difficulty: 2, isCorrect: false, secondsElapsed: 12 },
      { difficulty: 3, isCorrect: true, secondsElapsed: 25 },
    ]);

    assert.deepEqual(outcome, {
      questionsAsked: 3,
      questionsCorrect: 2,
      pointsEarned: 38 + 35,
    });
  });

  it("normalizes only valid question result payloads", () => {
    const results = normalizeQuestionResults([
      { difficulty: 6, isCorrect: true, secondsElapsed: -5 },
      { difficulty: 2, isCorrect: "yes", secondsElapsed: 4 },
      null,
    ]);

    assert.deepEqual(results, [
      { difficulty: 5, isCorrect: true, secondsElapsed: 0 },
    ]);
  });
});
